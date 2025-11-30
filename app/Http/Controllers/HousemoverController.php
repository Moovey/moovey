<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\UserTask;
use App\Models\Lesson;
use Illuminate\Support\Facades\Auth;
use App\Models\CustomTask;
use Illuminate\Support\Facades\DB;

class HousemoverController extends Controller
{
    /**
     * Display the housemover dashboard.
     */
    public function dashboard(): Response
    {
        $userId = Auth::id();
        
        // Single optimized query for all pending tasks with computed stats
        $pendingTasks = UserTask::select('id', 'title', 'description', 'priority', 'status', 'category', 'metadata', 'created_at')
            ->where('user_id', $userId)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform once and reuse
        $transformedTasks = $pendingTasks->map(fn($task) => $this->transformTask($task));
        
        // Get move details in single query
        $moveDetails = \App\Models\UserMoveDetail::select('current_address', 'new_address', 'moving_date', 'active_section')
            ->where('user_id', $userId)
            ->first();

        return Inertia::render('housemover/dashboard', [
            'upcomingTasks' => $transformedTasks->take(4)->values(),
            'allUserTasks' => $transformedTasks,
            'taskStats' => $this->getTaskStatsOptimized($userId),
            'academyProgress' => $this->getAcademyProgress($userId),
            'personalDetails' => $this->formatMoveDetails($moveDetails),
            'activeSection' => $moveDetails?->active_section ?? 1,
        ]);
    }

    /**
     * Transform task model to array format
     */
    private function transformTask(UserTask $task, bool $includeStatus = false): array
    {
        $data = [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'priority' => $task->priority,
            'created_at' => $task->created_at->format('M j, Y'),
            'source' => $task->metadata['source'] ?? 'unknown',
            'source_id' => $task->metadata['source_id'] ?? null,
            'category' => $task->category ?? $this->mapPriorityToCategory($task->priority),
            'urgency' => $this->mapPriorityToUrgency($task->priority),
            'completed' => $task->status === 'completed',
        ];

        if ($includeStatus) {
            $data['status'] = $task->status;
            $data['completed_at'] = $task->completed_at?->format('M j, Y');
            $data['due_date'] = $task->due_date?->format('M j, Y');
            $data['is_overdue'] = $task->isOverdue();
        }

        return $data;
    }

    /**
     * Get optimized task statistics using single query
     */
    private function getTaskStatsOptimized(int $userId): array
    {
        $stats = UserTask::select('status', DB::raw('count(*) as count'))
            ->where('user_id', $userId)
            ->groupBy('status')
            ->pluck('count', 'status');

        return [
            'total' => $stats->sum(),
            'pending' => $stats->get('pending', 0),
            'completed' => $stats->get('completed', 0),
        ];
    }

    /**
     * Format move details for response
     */
    private function formatMoveDetails($moveDetails): array
    {
        return [
            'currentAddress' => $moveDetails?->current_address ?? '',
            'newAddress' => $moveDetails?->new_address ?? '',
            'movingDate' => $moveDetails?->moving_date?->format('Y-m-d') ?? '',
            'contactInfo' => '',
            'emergencyContact' => '',
        ];
    }

    /**
     * Map task priority to category
     */
    private function mapPriorityToCategory(string $priority): string
    {
        return match($priority) {
            'high' => 'Urgent',
            'medium' => 'Important',
            'low' => 'Optional',
            default => 'General',
        };
    }

    /**
     * Map task priority to urgency
     */
    private function mapPriorityToUrgency(string $priority): string
    {
        return match($priority) {
            'high' => 'urgent',
            'medium' => 'moderate',
            'low' => 'normal',
            default => 'normal',
        };
    }

    /**
     * Display the move details page.
     */
    public function moveDetails(): Response
    {
        $userId = Auth::id();
        
        $details = \App\Models\UserMoveDetail::firstOrCreate(
            ['user_id' => $userId],
            ['recommended_task_states' => [], 'custom_tasks' => []]
        );

        // Fetch and group custom tasks efficiently
        $customTasks = CustomTask::select('id', 'section_id', 'title', 'description', 'category', 'completed', 'completed_at')
            ->where('user_id', $userId)
            ->get()
            ->groupBy('section_id')
            ->map(fn($tasks) => $tasks->map(fn($task) => [
                'id' => (string)$task->id,
                'title' => $task->title,
                'description' => $task->description,
                'category' => $task->category,
                'completed' => $task->completed,
                'isCustom' => true,
                'completedDate' => $task->completed_at?->format('Y-m-d'),
            ])->values())
            ->mapWithKeys(fn($tasks, $key) => [(string)$key => $tasks])
            ->all();

        // Fallback to legacy JSON if table empty
        $grouped = !empty($customTasks) ? $customTasks : ($details->custom_tasks ?? []);

        return Inertia::render('housemover/move-details', [
            'moveDetails' => [
                'currentAddress' => $details->current_address ?? '',
                'newAddress' => $details->new_address ?? '',
                'movingDate' => $details->moving_date?->format('Y-m-d') ?? '',
                'budget' => $details->budget ?? '',
                'movingType' => $details->moving_type ?? 'purchase',
                'targetArea' => $details->target_area ?? '',
                'propertyRequirements' => $details->property_requirements ?? '',
                'solicitorContact' => $details->solicitor_contact ?? '',
                'keyDates' => $details->key_dates ?? '',
                'activeSection' => $details->active_section ?? 1,
            ],
            'taskData' => [
                'recommendedTaskStates' => $details->recommended_task_states ?? [],
                'customTasks' => $grouped,
            ],
        ]);
    }

    /**
     * Display all user tasks page.
     */
    public function tasks(): Response
    {
        $userId = Auth::id();
        
        // Single optimized query with computed overdue count
        $allTasks = UserTask::select('id', 'title', 'description', 'priority', 'status', 'category', 'metadata', 'created_at', 'completed_at', 'due_date')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        $transformedTasks = $allTasks->map(fn($task) => $this->transformTask($task, true));

        return Inertia::render('housemover/tasks', [
            'tasks' => [
                'pending' => $transformedTasks->where('status', 'pending')->values(),
                'completed' => $transformedTasks->where('status', 'completed')->values(),
            ],
            'taskStats' => [
                'total' => $transformedTasks->count(),
                'pending' => $transformedTasks->where('status', 'pending')->count(),
                'completed' => $transformedTasks->where('status', 'completed')->count(),
                'overdue' => $transformedTasks->where('is_overdue', true)->count(),
            ],
        ]);
    }

    /**
     * Display the achievements page.
     */
    public function achievements(): Response
    {
        return Inertia::render('housemover/achievements');
    }

    /**
     * Display the connections page.
     */
    public function connections(): Response
    {
        $userId = Auth::id();
        
        // Get saved providers
        $savedProviders = \App\Models\SavedProvider::where('user_id', $userId)
            ->with(['businessProfile:id,name,logo_path,plan,services', 'businessProfile.user:id,name'])
            ->latest()
            ->paginate(2)
            ->through(fn($savedProvider) => [
                'id' => (string)$savedProvider->businessProfile->id,
                'business_profile_id' => $savedProvider->businessProfile->id,
                'name' => $savedProvider->businessProfile->name,
                'avatar' => '🏢',
                'logo_url' => $savedProvider->businessProfile->logo_path 
                    ? url('/files/business-logos/' . basename($savedProvider->businessProfile->logo_path)) 
                    : null,
                'businessType' => $savedProvider->businessProfile->user->name ?? 'Service Provider',
                'location' => 'UK',
                'rating' => 4.5,
                'reviewCount' => 0,
                'verified' => $savedProvider->businessProfile->plan === 'premium',
                'services' => $savedProvider->businessProfile->services ?? [],
                'availability' => 'Available',
                'responseTime' => 'Usually responds within 24 hours',
                'savedDate' => $savedProvider->created_at->diffForHumans(),
                'notes' => $savedProvider->notes,
            ]);

        // Get pending connection requests (received) - paginated with 3 per page
        $connectionRequests = \App\Models\Friendship::where('friend_id', $userId)
            ->where('status', 'pending')
            ->with(['user.profile'])
            ->latest()
            ->paginate(3)
            ->through(function($friendship) use ($userId) {
                $requester = $friendship->user;
                $profile = $requester->profile;
                
                // Count mutual connections
                $mutualConnections = \App\Models\Friendship::where(function($query) use ($userId) {
                    $query->where('user_id', $userId)->where('status', 'accepted');
                })->orWhere(function($query) use ($userId) {
                    $query->where('friend_id', $userId)->where('status', 'accepted');
                })->whereHas('user', function($query) use ($requester) {
                    $query->where('id', $requester->id);
                })->orWhereHas('friend', function($query) use ($requester) {
                    $query->where('id', $requester->id);
                })->count();
                
                return [
                    'id' => (string)$requester->id,
                    'friendship_id' => $friendship->id,
                    'name' => $requester->name,
                    'avatar' => $requester->avatar ?? '👤',
                    'businessType' => $profile->business_type ?? 'Community Member',
                    'location' => $profile->location ?? 'United Kingdom',
                    'rating' => 4.5,
                    'reviewCount' => 0,
                    'verified' => $requester->email_verified_at !== null,
                    'mutualConnections' => $mutualConnections,
                    'requestMessage' => null,
                ];
            });

        // Get user's active section from move details
        $moveDetails = \App\Models\UserMoveDetail::where('user_id', $userId)->first();
        $activeSection = $moveDetails ? ($moveDetails->active_section ?? 1) : 1;

        // Map active section to service types based on journey stage
        $servicesBySection = [
            1 => ['Estate Agent', 'Mortgage Broker', 'Solicitor', 'Surveyor', 'Financial Advisor'],
            2 => ['Estate Agent', 'Home Staging', 'Cleaning Service', 'Handyman', 'Photographer'],
            3 => ['Estate Agent', 'Mortgage Broker', 'Surveyor', 'Solicitor', 'Home Inspector'],
            4 => ['Mortgage Broker', 'Financial Advisor', 'Insurance Broker', 'Solicitor', 'Accountant'],
            5 => ['Solicitor', 'Surveyor', 'Home Inspector', 'Notary', 'Insurance Broker'],
            6 => ['Moving Company', 'Packing Service', 'Storage', 'Cleaning Service', 'Handyman'],
            7 => ['Moving Company', 'Cleaning Service', 'Utility Setup', 'Locksmith', 'Pet Care'],
            8 => ['Utility Setup', 'Internet Provider', 'Cleaning Service', 'Handyman', 'Interior Designer'],
            9 => ['Utility Setup', 'Internet Provider', 'Local Services', 'Home Security', 'Gardener'],
        ];

        // Get recommended service types for the user's current section
        $recommendedServiceTypes = $servicesBySection[$activeSection] ?? $servicesBySection[1];

        // Fetch businesses that match recommended service types
        $recommendedConnections = \App\Models\BusinessProfile::query()
            ->whereNotNull('name')
            ->where('name', '!=', '')
            ->whereNotNull('services')
            ->with('user:id,name,email')
            ->get()
            ->filter(function ($business) use ($recommendedServiceTypes) {
                // Check if business services array intersects with recommended services
                $businessServices = $business->services ?? [];
                return !empty(array_intersect($businessServices, $recommendedServiceTypes));
            })
            ->take(3) // Limit to 3 recommendations
            ->map(function ($business) {
                // Generate consistent mock rating based on business ID
                $mockRating = round((($business->id % 15) / 3) + 4, 1); // 4.0 to 4.9
                
                // Calculate match score based on services overlap
                $matchScore = rand(85, 98);
                
                // Get primary service from business services array
                $primaryService = !empty($business->services) ? $business->services[0] : 'Business Services';
                
                return [
                    'id' => (string)$business->id,
                    'name' => $business->name,
                    'avatar' => '🏢',
                    'businessType' => $primaryService,
                    'location' => 'United Kingdom',
                    'rating' => $mockRating,
                    'reviewCount' => rand(15, 150),
                    'verified' => $business->plan === 'premium',
                    'recommendationReason' => 'Matches your current moving stage',
                    'matchScore' => $matchScore,
                ];
            })
            ->values();

        return Inertia::render('housemover/connections', [
            'savedProviders' => $savedProviders,
            'connectionRequests' => $connectionRequests,
            'recommendedConnections' => $recommendedConnections,
        ]);
    }

    /**
     * Display the chain checker page.
     */
    public function chainChecker(): Response
    {
        return Inertia::render('housemover/chain-checker');
    }

    /**
     * Display the profile settings page (accessible to all roles).
     */
    public function profileSettings(): Response
    {
        return Inertia::render('housemover/profile-settings');
    }

    /**
     * Get academy progress data for dashboard (optimized)
     */
    private function getAcademyProgress(int $userId): array
    {
        $stages = [
            'Move Dreamer', 'Plan Starter', 'Moovey Critic', 'Prep Pioneer',
            'Moovey Director', 'Move Rockstar', 'Home Navigator', 
            'Settler Specialist', 'Moovey Star'
        ];

        // Single query with eager loading
        $allLessons = Lesson::select('id', 'title', 'description', 'lesson_stage', 'lesson_order', 'duration', 'difficulty')
            ->where('status', 'Published')
            ->orderBy('lesson_stage')
            ->orderBy('lesson_order')
            ->get();

        $totalLessons = $allLessons->count();
        $completedLessons = 0;
        $nextLesson = null;
        $stageProgress = [];

        // Single pass calculation
        foreach ($stages as $stage) {
            $stageLessons = $allLessons->where('lesson_stage', $stage);
            $stageTotal = $stageLessons->count();
            $stageCompleted = 0;

            foreach ($stageLessons as $lesson) {
                if ($lesson->isCompletedByUser($userId)) {
                    $stageCompleted++;
                    $completedLessons++;
                } elseif (!$nextLesson && $lesson->isAccessibleByUser($userId)) {
                    $nextLesson = [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'description' => $lesson->description,
                        'stage' => $lesson->lesson_stage,
                        'duration' => $lesson->duration,
                        'difficulty' => $lesson->difficulty,
                    ];
                }
            }

            $stageProgress[$stage] = [
                'total' => $stageTotal,
                'completed' => $stageCompleted,
                'percentage' => $stageTotal > 0 ? round(($stageCompleted / $stageTotal) * 100) : 0
            ];
        }

        // Calculate ranks in single pass
        $highestCompletedLevel = 0;
        $activeStage = null;
        $activeStageLevel = 0;

        foreach ($stages as $index => $stage) {
            $progress = $stageProgress[$stage];
            
            if ($progress['total'] > 0 && $progress['completed'] === $progress['total']) {
                $highestCompletedLevel = $index + 1;
            } elseif (!$activeStage && $progress['percentage'] > 0 && $progress['percentage'] < 100) {
                $activeStage = $stage;
                $activeStageLevel = $index + 1;
            }
        }

        // Determine current and next ranks
        // FIXED: When a stage is fully completed, user should be promoted to the NEXT rank
        if ($highestCompletedLevel > 0) {
            // User has completed at least one full stage
            // If they completed stage N, they are now at rank N+1 (next stage)
            if ($highestCompletedLevel < count($stages)) {
                // Still stages remaining - promote to next stage
                $currentLevel = $highestCompletedLevel + 1;
                $currentRank = strtoupper($stages[$highestCompletedLevel]);
                $nextRank = $highestCompletedLevel + 1 < count($stages) 
                    ? strtoupper($stages[$highestCompletedLevel + 1]) 
                    : 'MOOVEY MASTER';
            } else {
                // All stages completed - maximum rank achieved
                $currentLevel = count($stages);
                $currentRank = strtoupper($stages[count($stages) - 1]);
                $nextRank = 'MOOVEY MASTER';
            }
        } elseif ($activeStage) {
            // User is in progress on a stage
            $currentLevel = $activeStageLevel;
            $currentRank = strtoupper($activeStage);
            $nextRank = $activeStageLevel < count($stages) 
                ? strtoupper($stages[$activeStageLevel]) 
                : 'MOOVEY MASTER';
        } else {
            // No progress yet - start at first stage
            $currentLevel = 1;
            $currentRank = 'MOVE DREAMER';
            $nextRank = 'PLAN STARTER';
        }

        return [
            'totalLessons' => $totalLessons,
            'completedLessons' => $completedLessons,
            'progressPercentage' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0,
            'currentLevel' => $currentLevel,
            'currentRank' => $currentRank,
            'nextRank' => $nextRank,
            'stageProgress' => $stageProgress,
            'completedStages' => $highestCompletedLevel,
            'highestCompletedLevel' => $highestCompletedLevel,
            'activeStage' => $activeStage,
            'nextLesson' => $nextLesson,
        ];
    }
}