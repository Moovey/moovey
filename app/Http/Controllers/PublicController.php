<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\SavedToolResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PublicController extends Controller
{
    /**
     * Display the welcome page with WelcomeLayoutTest component.
     */
    public function welcomeTest(): Response
    {
        // Cache basic stats for 1 hour since they don't change frequently
        $stats = Cache::remember('welcome_page_stats', 3600, function () {
            return [
                'total_lessons' => Lesson::published()->count(),
                'featured_count' => 6, // Static for now
                'community_members' => 2500, // Can be made dynamic later
                'verified_businesses' => 250,
            ];
        });

        return Inertia::render('WelcomeLayoutTest', [
            'stats' => $stats,
        ]);
    }

    /**
     * Display the academy page with published lessons.
     */
    public function academy(): Response
    {
        $user = Auth::user();
        
        // Get lessons ordered by lesson_order for sequential learning
        $lessons = Lesson::published()->ordered()->get()->map(function ($lesson) use ($user) {
            // Only get progress if user is logged in
            $progress = null;
            $isAccessible = true;
            $isCompleted = false;
            
            if ($user) {
                try {
                    $progress = $lesson->getUserProgress($user->id);
                    $isAccessible = $lesson->isAccessibleByUser($user->id);
                    $isCompleted = $lesson->isCompletedByUser($user->id);
                } catch (\Exception $e) {
                    Log::error('Error getting lesson progress', [
                        'lesson_id' => $lesson->id,
                        'user_id' => $user->id,
                        'error' => $e->getMessage()
                    ]);
                    // Default values if there's an error
                    $progress = null;
                    $isAccessible = $lesson->lesson_order <= 1; // Only first lesson accessible on error
                    $isCompleted = false;
                }
            }
            
            return [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'description' => $lesson->description,
                'lesson_stage' => $lesson->lesson_stage,
                'duration' => $lesson->duration,
                'difficulty' => $lesson->difficulty,
                'lesson_order' => $lesson->lesson_order,
                'created_at' => $lesson->created_at->format('Y-m-d'),
                'status' => $lesson->status,
                'content_html' => $lesson->content_html,
                'content_file_url' => $lesson->content_file_url,
                'thumbnail_file_url' => $lesson->thumbnail_file_url,
                
                // Progress and accessibility information
                'is_accessible' => $isAccessible,
                'is_completed' => $isCompleted,
                'progress_percentage' => $progress?->progress_percentage ?? 0,
                'started_at' => $progress?->started_at?->format('Y-m-d H:i:s'),
                'completed_at' => $progress?->completed_at?->format('Y-m-d H:i:s'),
                
                // Next/Previous lesson info
                'has_previous' => $lesson->getPreviousLesson() !== null,
                'has_next' => $lesson->getNextLesson() !== null,
            ];
        });
        
        // Group lessons by stage and calculate stage progress
        $lessonsByStage = $lessons->groupBy('lesson_stage');
        $stageProgress = [];
        
        if ($user) {
            foreach ($lessonsByStage as $stage => $stageLessons) {
                $totalLessons = $stageLessons->count();
                $completedLessons = $stageLessons->where('is_completed', true)->count();
                $stageProgress[$stage] = [
                    'percentage' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100, 2) : 0,
                    'completed' => $completedLessons,
                    'total' => $totalLessons
                ];
            }
        } else {
            // For non-authenticated users, show 0% progress
            foreach ($lessonsByStage as $stage => $stageLessons) {
                $stageProgress[$stage] = [
                    'percentage' => 0,
                    'completed' => 0,
                    'total' => $stageLessons->count()
                ];
            }
        }
        
        return Inertia::render('moovey-academy', [
            'lessons' => $lessons->values(), // Reset array keys
            'lessonsByStage' => $lessonsByStage,
            'stageProgress' => $stageProgress,
            'isAuthenticated' => $user !== null,
            'totalLessons' => $lessons->count(),
            'completedLessons' => $user ? $lessons->where('is_completed', true)->count() : 0,
        ]);
    }

    /**
     * Display the tools page.
     */
    public function tools(): Response
    {
        return Inertia::render('tools');
    }

    /**
     * Display the mortgage calculator tool page.
     */
    public function mortgageCalculator(): Response
    {
        $savedResults = [];
        
        // Get saved results for authenticated users
        if (Auth::check()) {
            $savedResults = SavedToolResult::where('user_id', Auth::id())
                ->where('tool_type', 'mortgage')
                ->orderBy('created_at', 'desc')
                ->get();
        }
        
        return Inertia::render('tools/mortgage-calculator', [
            'savedResults' => $savedResults
        ]);
    }

    /**
     * Display the affordability calculator tool page.
     */
    public function affordabilityCalculator(): Response
    {
        $savedResults = [];
        
        // Get saved results for authenticated users
        if (Auth::check()) {
            $savedResults = SavedToolResult::where('user_id', Auth::id())
                ->where('tool_type', 'affordability')
                ->orderBy('created_at', 'desc')
                ->get();
        }
        
        return Inertia::render('tools/affordability-calculator', [
            'savedResults' => $savedResults
        ]);
    }

    /**
     * Display the school catchment map tool page.
     */
    public function schoolCatchmentMap(): Response
    {
        return Inertia::render('tools/school-catchment-map');
    }

    /**
     * Display the volume calculator tool page.
     */
    public function volumeCalculator(): Response
    {
        $savedResults = [];
        
        // Get saved results for authenticated users
        if (Auth::check()) {
            $savedResults = SavedToolResult::where('user_id', Auth::id())
                ->where('tool_type', 'volume')
                ->orderBy('created_at', 'desc')
                ->get();
        }
        
        return Inertia::render('tools/volume-calculator', [
            'savedResults' => $savedResults
        ]);
    }

    /**
     * Display the declutter list tool page.
     */
    public function declutterList(): Response
    {
        return Inertia::render('tools/declutter-list');
    }

    /**
     * Display the marketplace page.
     */
    public function marketplace(): Response
    {
        return Inertia::render('marketplace');
    }

    /**
     * Display the trade directory page.
     */
    public function tradeDirectory(): Response
    {
        return Inertia::render('trade-directory');
    }

    /**
     * Display the community page.
     */
    public function community(): Response
    {
        return Inertia::render('community');
    }

    /**
     * Serve lesson images directly.
     */
    public function lessonImage(string $filename): BinaryFileResponse
    {
        $imagePath = public_path("storage/lesson_images/{$filename}");
        
        if (!file_exists($imagePath)) {
            abort(404, 'Image not found');
        }
        
        $mimeType = mime_content_type($imagePath);
        return response()->file($imagePath, ['Content-Type' => $mimeType]);
    }

    /**
     * Get featured lessons for the welcome page
     */
    public function getFeaturedLessons()
    {
        $featuredLessons = Cache::remember('welcome_featured_lessons', 1800, function () {
            return Lesson::published()
                ->select('id', 'title', 'description', 'lesson_stage', 'duration', 'difficulty')
                ->orderBy('lesson_order')
                ->limit(6)
                ->get()
                ->map(function ($lesson) {
                    return [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'description' => $lesson->description,
                        'lesson_stage' => $lesson->lesson_stage,
                        'duration' => $lesson->duration,
                        'difficulty' => $lesson->difficulty,
                    ];
                });
        });

        return response()->json([
            'lessons' => $featuredLessons,
        ]);
    }

    /**
     * Get business network data with pagination
     */
    public function getBusinessNetwork(Request $request)
    {
        $page = $request->get('page', 1);
        $perPage = 8;

        // This would typically come from a businesses table
        // For now, returning static data with pagination simulation
        $allBusinesses = Cache::remember('business_network_data', 3600, function () {
            return [
                // Pre-Move Services
                ['category' => 'pre-move', 'name' => 'Swift Relocations', 'type' => 'Moving Company', 'rating' => 4.9, 'reviews' => 156, 'discount' => '15% Member Discount'],
                ['category' => 'pre-move', 'name' => 'Premier Properties', 'type' => 'Estate Agent', 'rating' => 4.8, 'reviews' => 142, 'discount' => 'No Admin Fees'],
                ['category' => 'pre-move', 'name' => 'Thompson Legal', 'type' => 'Solicitor', 'rating' => 4.7, 'reviews' => 89, 'discount' => 'Fixed Fee Quote'],
                ['category' => 'pre-move', 'name' => 'ClearView Cleaning', 'type' => 'Cleaning Service', 'rating' => 4.9, 'reviews' => 203, 'discount' => '20% First Clean'],
                // Add more businesses...
            ];
        });

        $total = count($allBusinesses);
        $offset = ($page - 1) * $perPage;
        $businesses = array_slice($allBusinesses, $offset, $perPage);

        return response()->json([
            'businesses' => $businesses,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => ceil($total / $perPage),
                'has_more' => $offset + $perPage < $total,
            ],
        ]);
    }

    /**
     * Get platform statistics for performance optimization
     */
    public function getStats()
    {
        // Cache stats for 5 minutes to reduce database load
        $stats = Cache::remember('platform_stats', 300, function () {
            try {
                // These would typically come from database queries
                // For now, using calculated/estimated values
                
                return [
                    'activeMembers' => '10,000+',
                    'dailyPosts' => '2,500+',
                    'helpRate' => '98%',
                    'successfulMoves' => '10,000+',
                    'moneySaved' => '£2M+',
                    'satisfactionRate' => '98%',
                    'averageRating' => '4.9★',
                    'timestamp' => now()->timestamp,
                ];
            } catch (\Exception $e) {
                Log::error('Error fetching platform stats', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                // Return default values if database is unavailable
                return [
                    'activeMembers' => '10,000+',
                    'dailyPosts' => '2,500+',
                    'helpRate' => '98%',
                    'successfulMoves' => '10,000+',
                    'moneySaved' => '£2M+',
                    'satisfactionRate' => '98%',
                    'averageRating' => '4.9★',
                    'timestamp' => now()->timestamp,
                ];
            }
        });

        return response()->json($stats);
    }
}