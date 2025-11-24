<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Display the admin dashboard - redirect to overview.
     */
    public function dashboard()
    {
        return redirect()->route('admin.overview');
    }

    /**
     * Display the admin overview page.
     */
    public function overview(): Response
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Admin access required');
        }
        
        return Inertia::render('admin/overview');
    }

    /**
     * Display the admin academy dashboard.
     */
    public function academy(): Response
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Admin access required');
        }
        
        // Get fresh lessons data with optimized query
        $lessons = $this->getOptimizedLessons();
        
        return Inertia::render('admin/academy', [
            'lessons' => $lessons,
            'initialFilters' => [
                'search' => request('search', ''),
                'status' => request('status', 'All Lessons'),
                'page' => request('page', 1),
            ]
        ]);
    }

    /**
     * Get optimized lessons data with caching
     */
    private function getOptimizedLessons()
    {
        // Create cache key based on lessons count and latest update
        $cacheKey = 'admin_lessons_' . md5(
            Lesson::count() . '_' . (Lesson::latest('updated_at')->value('updated_at') ?? '')
        );
        
        return Cache::remember($cacheKey, 600, function () {
            return Lesson::select([
                    'id', 'title', 'description', 'lesson_stage', 'duration',
                    'difficulty', 'status', 'lesson_order', 'content_file_path',
                    'thumbnail_file_path', 'created_at', 'updated_at'
                ])
                ->orderBy('lesson_order')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($lesson) {
                    // Add computed URLs
                    $lesson->content_file_url = $lesson->content_file_path 
                        ? asset('storage/' . $lesson->content_file_path) 
                        : null;
                    $lesson->thumbnail_file_url = $lesson->thumbnail_file_path 
                        ? asset('storage/' . $lesson->thumbnail_file_path) 
                        : null;
                    return $lesson;
                });
        });
    }

    /**
     * Get lessons data via AJAX for partial reloads
     */
    public function getLessonsData(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Admin access required');
        }

        // If no filters, return cached optimized data
        if (!$request->filled('search') && (!$request->filled('status') || $request->status === 'All Lessons')) {
            return response()->json([
                'lessons' => $this->getOptimizedLessons(),
                'timestamp' => now()->toISOString(),
                'cached' => true
            ]);
        }

        // For filtered requests, use targeted queries
        $cacheKey = 'admin_lessons_filtered_' . md5(
            $request->get('search', '') . '_' . $request->get('status', 'All Lessons') . '_' . 
            Lesson::count() . '_' . (Lesson::latest('updated_at')->value('updated_at') ?? '')
        );

        $lessons = Cache::remember($cacheKey, 300, function () use ($request) {
            $query = Lesson::select([
                    'id', 'title', 'description', 'lesson_stage', 'duration',
                    'difficulty', 'status', 'lesson_order', 'content_file_path',
                    'thumbnail_file_path', 'created_at', 'updated_at'
                ]);

            // Apply filters
            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('title', 'like', "%{$searchTerm}%")
                      ->orWhere('description', 'like', "%{$searchTerm}%")
                      ->orWhere('lesson_stage', 'like', "%{$searchTerm}%")
                      ->orWhere('difficulty', 'like', "%{$searchTerm}%");
                });
            }

            if ($request->filled('status') && $request->status !== 'All Lessons') {
                $query->where('status', $request->status);
            }

            // Apply sorting
            $query->orderBy('lesson_order')->orderBy('created_at', 'desc');

            return $query->get()->map(function ($lesson) {
                // Add computed URLs
                $lesson->content_file_url = $lesson->content_file_path 
                    ? asset('storage/' . $lesson->content_file_path) 
                    : null;
                $lesson->thumbnail_file_url = $lesson->thumbnail_file_path 
                    ? asset('storage/' . $lesson->thumbnail_file_path) 
                    : null;
                return $lesson;
            });
        });

        return response()->json([
            'lessons' => $lessons,
            'timestamp' => now()->toISOString(),
            'cached' => false
        ]);
    }

    /**
     * Display the users management page.
     */
    public function users(Request $request): Response
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Admin access required');
        }
        
        // Get statistics first (cached for 5 minutes)
        $stats = Cache::remember('admin_user_stats', 300, function () {
            return [
                'total_users' => User::count(),
                'admins' => User::where('role', 'admin')->count(),
                'housemovers' => User::where('role', 'housemover')->count(),
                'businesses' => User::where('role', 'business')->count(),
                'verified_users' => User::whereNotNull('email_verified_at')->count(),
                'recent_registrations' => User::where('created_at', '>=', now()->subDays(7))->count(),
            ];
        });

        // Build query with filters
        $query = User::with([
                'profile:id,user_id,post_count,friend_count',
            ])
            ->withCount([
                'sentMessages',
                'friends' => function ($query) {
                    $query->where('status', 'accepted');
                },
                'lessonProgress as completed_lessons_count' => function ($query) {
                    $query->where('is_completed', true);
                }
            ])
            ->select([
                'id', 'name', 'email', 'role', 'avatar', 
                'email_verified_at', 'created_at', 'updated_at'
            ]);

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('role', 'like', "%{$search}%");
            });
        }

        // Apply role filter
        if ($request->filled('role') && $request->role !== 'All Users') {
            $query->where('role', strtolower($request->role));
        }

        // Apply sorting
        $sortField = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        
        if (in_array($sortField, ['name', 'email', 'role', 'created_at'])) {
            $query->orderBy($sortField, $sortOrder);
        } elseif ($sortField === 'messages') {
            $query->orderBy('sent_messages_count', $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Paginate with 5 users per page
        $users = $query->paginate(5)->withQueryString();
        
        // Transform the paginated data
        $users->getCollection()->transform(function ($user) {
            // Add computed avatar URL
            $user->avatar_url = $user->avatar ? url('/files/avatars/' . basename($user->avatar)) : null;
            return $user;
        });
        
        return Inertia::render('admin/users', [
            'users' => $users,
            'stats' => $stats,
            'initialFilters' => [
                'search' => $request->get('search', ''),
                'role' => $request->get('role', 'All Users'),
                'sort' => $request->get('sort', 'created_at'),
                'order' => $request->get('order', 'desc'),
                'page' => $request->get('page', 1),
            ]
        ]);
    }

    /**
     * Get users data via AJAX for partial reloads
     */
    public function getUsersData(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Admin access required');
        }

        $query = User::with([
                'profile:id,user_id,post_count,friend_count',
            ])
            ->withCount([
                'sentMessages',
                'friends' => function ($query) {
                    $query->where('status', 'accepted');
                },
                'lessonProgress as completed_lessons_count' => function ($query) {
                    $query->where('is_completed', true);
                }
            ])
            ->select([
                'id', 'name', 'email', 'role', 'avatar', 
                'email_verified_at', 'created_at', 'updated_at'
            ]);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('role', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role') && $request->role !== 'All Users') {
            $query->where('role', strtolower($request->role));
        }

        // Apply sorting
        $sortField = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        
        if (in_array($sortField, ['name', 'email', 'role', 'created_at'])) {
            $query->orderBy($sortField, $sortOrder);
        } elseif ($sortField === 'messages') {
            $query->orderBy('sent_messages_count', $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Paginate with 5 users per page
        $users = $query->paginate(5)->withQueryString();
        
        // Transform the paginated data
        $users->getCollection()->transform(function ($user) {
            $user->avatar_url = $user->avatar ? url('/files/avatars/' . basename($user->avatar)) : null;
            return $user;
        });

        return response()->json([
            'users' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem(),
                'has_more_pages' => $users->hasMorePages(),
                'prev_page_url' => $users->previousPageUrl(),
                'next_page_url' => $users->nextPageUrl(),
            ]
        ]);
    }

    /**
     * Display the businesses management page.
     */
    public function businesses(): Response
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Admin access required');
        }
        
        return Inertia::render('admin/businesses');
    }

    /**
     * Display the system settings page.
     */
    public function system(): Response
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Admin access required');
        }
        
        return Inertia::render('admin/system');
    }

    /**
     * Display the account settings page.
     */
    public function settings(): Response
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Admin access required');
        }
        
        return Inertia::render('admin/settings');
    }

    /**
     * Test image access for debugging.
     */
    public function testImages()
    {
        $images = Storage::files('public/lesson_images');
        $imageUrls = array_map(function($image) {
            return [
                'path' => $image,
                'storage_url' => Storage::url($image),
                'asset_url' => asset('storage/lesson_images/' . basename($image))
            ];
        }, $images);
        
        return response()->json([
            'images' => $imageUrls,
            'storage_path' => storage_path('app/public/lesson_images'),
            'public_path' => public_path('storage/lesson_images')
        ]);
    }
}