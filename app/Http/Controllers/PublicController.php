<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\SavedToolResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
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
     * Display the academy stage page with lessons for a specific stage.
     */
    public function academyStage(string $stage): Response
    {
        $user = Auth::user();
        
        // Stage metadata mapping
        $stageMetadata = [
            'Move Dreamer' => ['badge' => 'Move Dreamer.png'],
            'Plan Starter' => ['badge' => 'Plan Starter.png'],
            'Moovey Critic' => ['badge' => 'Moovey Critic.png'],
            'Prep Pioneer' => ['badge' => 'Prep Pioneer.png'],
            'Moovey Director' => ['badge' => 'Moovey Director.png'],
            'Move Rockstar' => ['badge' => 'Move Rockstar.png'],
            'Home Navigator' => ['badge' => 'Home Navigator.png'],
            'Settler Specialist' => ['badge' => 'Settler Specialist.png'],
            'Moovey Star' => ['badge' => 'Moovey Star.png']
        ];
        
        $stageBadge = $stageMetadata[$stage]['badge'] ?? $stage . '.png';
        
        // Get lessons for the specific stage
        $lessons = Lesson::published()
            ->where('lesson_stage', $stage)
            ->ordered()
            ->get()
            ->map(function ($lesson) use ($user) {
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

        // Calculate stage progress
        $stageProgress = null;
        if ($user) {
            $totalLessons = $lessons->count();
            $completedLessons = $lessons->where('is_completed', true)->count();
            $stageProgress = [
                'percentage' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100, 2) : 0,
                'completed' => $completedLessons,
                'total' => $totalLessons
            ];
        } else {
            $stageProgress = [
                'percentage' => 0,
                'completed' => 0,
                'total' => $lessons->count()
            ];
        }

        return Inertia::render('academy/stage', [
            'stage' => $stage,
            'stageBadge' => $stageBadge,
            'stageLessons' => $lessons->values(),
            'stageProgress' => $stageProgress,
            'isAuthenticated' => $user !== null,
        ]);
    }

    /**
     * Display a specific lesson page.
     */
    public function academyLesson(string $lesson): Response
    {
        $user = Auth::user();
        
        // Find the lesson by id
        $lessonModel = Lesson::published()->findOrFail($lesson);
        
        // Stage metadata mapping
        $stageMetadata = [
            'Move Dreamer' => ['badge' => 'Move Dreamer.png'],
            'Plan Starter' => ['badge' => 'Plan Starter.png'],
            'Moovey Critic' => ['badge' => 'Moovey Critic.png'],
            'Prep Pioneer' => ['badge' => 'Prep Pioneer.png'],
            'Moovey Director' => ['badge' => 'Moovey Director.png'],
            'Move Rockstar' => ['badge' => 'Move Rockstar.png'],
            'Home Navigator' => ['badge' => 'Home Navigator.png'],
            'Settler Specialist' => ['badge' => 'Settler Specialist.png'],
            'Moovey Star' => ['badge' => 'Moovey Star.png']
        ];
        
        $stageBadge = $stageMetadata[$lessonModel->lesson_stage]['badge'] ?? $lessonModel->lesson_stage . '.png';
        
        // Get lesson data with progress information
        $progress = null;
        $isAccessible = true;
        $isCompleted = false;
        
        if ($user) {
            try {
                $progress = $lessonModel->getUserProgress($user->id);
                $isAccessible = $lessonModel->isAccessibleByUser($user->id);
                $isCompleted = $lessonModel->isCompletedByUser($user->id);
            } catch (\Exception $e) {
                Log::error('Error getting lesson progress', [
                    'lesson_id' => $lessonModel->id,
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
                // Default values if there's an error
                $progress = null;
                $isAccessible = $lessonModel->lesson_order <= 1; // Only first lesson accessible on error
                $isCompleted = false;
            }
        }

        // Get all lessons in the same stage for navigation
        $stageLessons = Lesson::published()
            ->where('lesson_stage', $lessonModel->lesson_stage)
            ->ordered()
            ->get()
            ->map(function ($stageLesson) use ($user) {
                // Only get progress if user is logged in
                $progress = null;
                $isAccessible = true;
                $isCompleted = false;
                
                if ($user) {
                    try {
                        $progress = $stageLesson->getUserProgress($user->id);
                        $isAccessible = $stageLesson->isAccessibleByUser($user->id);
                        $isCompleted = $stageLesson->isCompletedByUser($user->id);
                    } catch (\Exception $e) {
                        Log::error('Error getting lesson progress', [
                            'lesson_id' => $stageLesson->id,
                            'user_id' => $user->id,
                            'error' => $e->getMessage()
                        ]);
                        // Default values if there's an error
                        $progress = null;
                        $isAccessible = $stageLesson->lesson_order <= 1;
                        $isCompleted = false;
                    }
                }
                
                return [
                    'id' => $stageLesson->id,
                    'title' => $stageLesson->title,
                    'description' => $stageLesson->description,
                    'lesson_stage' => $stageLesson->lesson_stage,
                    'duration' => $stageLesson->duration,
                    'difficulty' => $stageLesson->difficulty,
                    'lesson_order' => $stageLesson->lesson_order,
                    'created_at' => $stageLesson->created_at->format('Y-m-d'),
                    'status' => $stageLesson->status,
                    'content_html' => $stageLesson->content_html,
                    'content_file_url' => $stageLesson->content_file_url,
                    'thumbnail_file_url' => $stageLesson->thumbnail_file_url,
                    
                    // Progress and accessibility information
                    'is_accessible' => $isAccessible,
                    'is_completed' => $isCompleted,
                    'progress_percentage' => $progress?->progress_percentage ?? 0,
                    'started_at' => $progress?->started_at?->format('Y-m-d H:i:s'),
                    'completed_at' => $progress?->completed_at?->format('Y-m-d H:i:s'),
                    
                    // Next/Previous lesson info
                    'has_previous' => $stageLesson->getPreviousLesson() !== null,
                    'has_next' => $stageLesson->getNextLesson() !== null,
                ];
            });

        // Calculate stage progress
        $stageProgress = null;
        if ($user) {
            $totalLessons = $stageLessons->count();
            $completedLessons = $stageLessons->where('is_completed', true)->count();
            $stageProgress = [
                'percentage' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100, 2) : 0,
                'completed' => $completedLessons,
                'total' => $totalLessons
            ];
        } else {
            $stageProgress = [
                'percentage' => 0,
                'completed' => 0,
                'total' => $stageLessons->count()
            ];
        }

        $lessonData = [
            'id' => $lessonModel->id,
            'title' => $lessonModel->title,
            'description' => $lessonModel->description,
            'lesson_stage' => $lessonModel->lesson_stage,
            'duration' => $lessonModel->duration,
            'difficulty' => $lessonModel->difficulty,
            'lesson_order' => $lessonModel->lesson_order,
            'created_at' => $lessonModel->created_at->format('Y-m-d'),
            'status' => $lessonModel->status,
            'content_html' => $lessonModel->content_html,
            'content_file_url' => $lessonModel->content_file_url,
            'thumbnail_file_url' => $lessonModel->thumbnail_file_url,
            
            // Progress and accessibility information
            'is_accessible' => $isAccessible,
            'is_completed' => $isCompleted,
            'progress_percentage' => $progress?->progress_percentage ?? 0,
            'started_at' => $progress?->started_at?->format('Y-m-d H:i:s'),
            'completed_at' => $progress?->completed_at?->format('Y-m-d H:i:s'),
            
            // Next/Previous lesson info
            'has_previous' => $lessonModel->getPreviousLesson() !== null,
            'has_next' => $lessonModel->getNextLesson() !== null,
            'previous_lesson' => $lessonModel->getPreviousLesson()?->id,
            'next_lesson' => $lessonModel->getNextLesson()?->id,
        ];

        return Inertia::render('academy/lesson', [
            'lesson' => $lessonData,
            'stageLessons' => $stageLessons->values(),
            'stage' => $lessonModel->lesson_stage,
            'stageBadge' => $stageBadge,
            'stageProgress' => $stageProgress,
            'isAuthenticated' => $user !== null,
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
    public function tradeDirectory(Request $request): Response
    {
        $user = Auth::user();
        $recommendedServices = [];
        
        // Get user's active section from move details if authenticated
        $activeSection = 1; // Default to first section
        if ($user) {
            $moveDetails = \App\Models\UserMoveDetail::where('user_id', $user->id)->first();
            $activeSection = $moveDetails->active_section ?? 1;
        }
        
        // Map active section to recommended services based on journey stage
        $servicesBySection = [
            1 => [ // Planning & Budgeting
                ['name' => 'Estate Agent', 'status' => 'recommended', 'icon' => '🏠', 'priority' => 'High Priority'],
                ['name' => 'Mortgage Broker', 'status' => 'recommended', 'icon' => '💰', 'priority' => 'High Priority'],
                ['name' => 'Solicitor', 'status' => 'recommended', 'icon' => '⚖️', 'priority' => 'Recommended'],
                ['name' => 'Surveyor', 'status' => 'optional', 'icon' => '📋', 'priority' => 'May be needed'],
                ['name' => 'Financial Advisor', 'status' => 'optional', 'icon' => '💼', 'priority' => 'Optional'],
            ],
            2 => [ // Sell/Prep Current Home
                ['name' => 'Estate Agent', 'status' => 'recommended', 'icon' => '🏠', 'priority' => 'High Priority'],
                ['name' => 'Home Staging', 'status' => 'optional', 'icon' => '✨', 'priority' => 'Recommended'],
                ['name' => 'Cleaning Service', 'status' => 'recommended', 'icon' => '🧹', 'priority' => 'High Priority'],
                ['name' => 'Handyman', 'status' => 'optional', 'icon' => '🔧', 'priority' => 'May be needed'],
                ['name' => 'Photographer', 'status' => 'optional', 'icon' => '📷', 'priority' => 'Optional'],
            ],
            3 => [ // Find New Property
                ['name' => 'Estate Agent', 'status' => 'recommended', 'icon' => '🏠', 'priority' => 'High Priority'],
                ['name' => 'Mortgage Broker', 'status' => 'recommended', 'icon' => '💰', 'priority' => 'High Priority'],
                ['name' => 'Surveyor', 'status' => 'recommended', 'icon' => '📋', 'priority' => 'Recommended'],
                ['name' => 'Solicitor', 'status' => 'recommended', 'icon' => '⚖️', 'priority' => 'High Priority'],
                ['name' => 'Home Inspector', 'status' => 'optional', 'icon' => '🔍', 'priority' => 'May be needed'],
            ],
            4 => [ // Secure Finances
                ['name' => 'Mortgage Broker', 'status' => 'recommended', 'icon' => '💰', 'priority' => 'High Priority'],
                ['name' => 'Financial Advisor', 'status' => 'recommended', 'icon' => '💼', 'priority' => 'Recommended'],
                ['name' => 'Insurance Broker', 'status' => 'recommended', 'icon' => '🛡️', 'priority' => 'High Priority'],
                ['name' => 'Solicitor', 'status' => 'optional', 'icon' => '⚖️', 'priority' => 'May be needed'],
                ['name' => 'Accountant', 'status' => 'optional', 'icon' => '📊', 'priority' => 'Optional'],
            ],
            5 => [ // Legal & Admin
                ['name' => 'Solicitor', 'status' => 'recommended', 'icon' => '⚖️', 'priority' => 'High Priority'],
                ['name' => 'Surveyor', 'status' => 'recommended', 'icon' => '📋', 'priority' => 'High Priority'],
                ['name' => 'Home Inspector', 'status' => 'recommended', 'icon' => '🔍', 'priority' => 'Recommended'],
                ['name' => 'Notary', 'status' => 'optional', 'icon' => '📝', 'priority' => 'May be needed'],
                ['name' => 'Insurance Broker', 'status' => 'optional', 'icon' => '🛡️', 'priority' => 'Optional'],
            ],
            6 => [ // Packing & Removal
                ['name' => 'Moving Company', 'status' => 'recommended', 'icon' => '🚚', 'priority' => 'High Priority'],
                ['name' => 'Packing Service', 'status' => 'recommended', 'icon' => '📦', 'priority' => 'High Priority'],
                ['name' => 'Storage', 'status' => 'optional', 'icon' => '🏢', 'priority' => 'May be needed'],
                ['name' => 'Cleaning Service', 'status' => 'recommended', 'icon' => '🧹', 'priority' => 'Recommended'],
                ['name' => 'Handyman', 'status' => 'optional', 'icon' => '🔧', 'priority' => 'Optional'],
            ],
            7 => [ // Move Day Execution
                ['name' => 'Moving Company', 'status' => 'recommended', 'icon' => '🚚', 'priority' => 'High Priority'],
                ['name' => 'Cleaning Service', 'status' => 'recommended', 'icon' => '🧹', 'priority' => 'High Priority'],
                ['name' => 'Utility Setup', 'status' => 'recommended', 'icon' => '⚡', 'priority' => 'High Priority'],
                ['name' => 'Locksmith', 'status' => 'optional', 'icon' => '🔑', 'priority' => 'Recommended'],
                ['name' => 'Pet Care', 'status' => 'optional', 'icon' => '🐕', 'priority' => 'Optional'],
            ],
            8 => [ // Settling In
                ['name' => 'Utility Setup', 'status' => 'recommended', 'icon' => '⚡', 'priority' => 'High Priority'],
                ['name' => 'Internet Provider', 'status' => 'recommended', 'icon' => '📡', 'priority' => 'High Priority'],
                ['name' => 'Cleaning Service', 'status' => 'optional', 'icon' => '🧹', 'priority' => 'Recommended'],
                ['name' => 'Handyman', 'status' => 'recommended', 'icon' => '🔧', 'priority' => 'May be needed'],
                ['name' => 'Interior Designer', 'status' => 'optional', 'icon' => '🎨', 'priority' => 'Optional'],
            ],
            9 => [ // Post Move Integration
                ['name' => 'Utility Setup', 'status' => 'optional', 'icon' => '⚡', 'priority' => 'Final Check'],
                ['name' => 'Internet Provider', 'status' => 'optional', 'icon' => '📡', 'priority' => 'Final Check'],
                ['name' => 'Local Services', 'status' => 'recommended', 'icon' => '🏪', 'priority' => 'Recommended'],
                ['name' => 'Home Security', 'status' => 'optional', 'icon' => '🔒', 'priority' => 'Optional'],
                ['name' => 'Gardener', 'status' => 'optional', 'icon' => '🌱', 'priority' => 'Optional'],
            ],
        ];
        
        // Get recommended services for the user's current section
        $recommendedServices = $servicesBySection[$activeSection] ?? $servicesBySection[1];
        
        // Fetch latest business profiles with pagination
        $perPage = 5; // Number of businesses per page
        $businesses = \App\Models\BusinessProfile::query()
            ->whereNotNull('name')
            ->where('name', '!=', '')
            ->with('user:id,name,email')
            ->latest() // Order by newest first
            ->paginate($perPage)
            ->through(function ($business) use ($user) {
                // Generate a consistent mock rating based on business ID for demo purposes
                $mockRating = (($business->id % 3) + 3); // Will generate 3, 4, or 5 based on ID
                
                // Check if this business is saved by the current user
                $isSaved = false;
                if ($user) {
                    $isSaved = \App\Models\SavedProvider::where('user_id', $user->id)
                        ->where('business_profile_id', $business->id)
                        ->exists();
                }
                
                return [
                    'id' => $business->id,
                    'name' => $business->name,
                    'description' => $business->description,
                    'services' => $business->services ?? [],
                    'logo_url' => $business->logo_path ? Storage::url($business->logo_path) : null,
                    'plan' => $business->plan ?? 'basic',
                    'user_name' => $business->user->name ?? 'Business Owner',
                    'rating' => $mockRating,
                    'verified' => rand(0, 1) === 1, // Mock verification status
                    'response_time' => 'Usually responds within ' . rand(1, 4) . ' hours',
                    'availability' => 'Available: ' . (rand(0, 1) ? 'Weekdays and Weekends' : 'Weekdays only'),
                    'is_saved' => $isSaved,
                ];
            });
        
        return Inertia::render('trade-directory', [
            'recommendedServices' => $recommendedServices,
            'activeSection' => $activeSection,
            'isAuthenticated' => $user !== null,
            'serviceProviders' => $businesses, // Paginated business profiles
        ]);
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
    public function lessonImage(string $filename)
    {
        // Security check: only allow safe filenames
        if (!preg_match('/^[a-zA-Z0-9_\-\.]+$/', $filename)) {
            abort(404, 'Invalid filename');
        }
        
        // Try public symlink path first
        $publicPath = public_path("storage/lesson_images/{$filename}");
        
        if (file_exists($publicPath)) {
            $mimeType = mime_content_type($publicPath);
            return response()->file($publicPath, ['Content-Type' => $mimeType]);
        }
        
        // Fallback to direct storage path (if symlink doesn't exist)
        $storagePath = storage_path("app/public/lesson_images/{$filename}");
        
        if (file_exists($storagePath)) {
            $mimeType = mime_content_type($storagePath);
            return response()->file($storagePath, ['Content-Type' => $mimeType]);
        }
        
        // Final fallback: try using Storage facade
        if (Storage::disk('public')->exists("lesson_images/{$filename}")) {
            $content = Storage::disk('public')->get("lesson_images/{$filename}");
            
            // Determine MIME type based on file extension
            $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
            $mimeTypes = [
                'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg',
                'png' => 'image/png', 'gif' => 'image/gif',
                'webp' => 'image/webp', 'svg' => 'image/svg+xml',
                'bmp' => 'image/bmp', 'tiff' => 'image/tiff',
                'ico' => 'image/x-icon'
            ];
            $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';
            
            return response($content, 200)->header('Content-Type', $mimeType);
        }
        
        abort(404, 'Image not found');
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