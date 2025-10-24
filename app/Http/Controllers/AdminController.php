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
        
        $lessons = Lesson::latest()->get();
        
        return Inertia::render('admin/academy', [
            'lessons' => $lessons
        ]);
    }

    /**
     * Display the users management page.
     */
    public function users(): Response
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

        // Eager load relationships and optimize queries
        $users = User::with([
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
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                // Add computed avatar URL
                $user->avatar_url = $user->avatar ? url('/files/avatars/' . basename($user->avatar)) : null;
                return $user;
            });
        
        return Inertia::render('admin/users', [
            'users' => $users,
            'stats' => $stats,
            'initialFilters' => [
                'search' => request('search', ''),
                'role' => request('role', 'All Users'),
                'sort' => request('sort', 'created_at'),
                'order' => request('order', 'desc'),
                'page' => request('page', 1),
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
        }

        $users = $query->get()->map(function ($user) {
            $user->avatar_url = $user->avatar ? url('/files/avatars/' . basename($user->avatar)) : null;
            return $user;
        });

        return response()->json([
            'users' => $users,
            'total' => $users->count()
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