<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\UserTask;
use App\Models\Lesson;
use Illuminate\Support\Facades\Auth;
use App\Models\CustomTask;
use Illuminate\Support\Facades\Log;

class HousemoverController extends Controller
{
    /**
     * Display the housemover dashboard.
     */
    public function dashboard(): Response
    {
        // Get user's pending tasks from CTA buttons (limit to 4 for upcoming tasks section)
        $upcomingTasks = UserTask::where('user_id', Auth::id())
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->limit(4)
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'priority' => $task->priority,
                    'created_at' => $task->created_at->format('M j, Y'),
                    'source' => $task->metadata['source'] ?? 'unknown',
                    'source_id' => $task->metadata['source_id'] ?? null,
                    'category' => $task->category ?? $this->mapPriorityToCategory($task->priority),
                    'completed' => false,
                    'urgency' => $this->mapPriorityToUrgency($task->priority),
                ];
            });

        // Get ALL user tasks for CTA task management section
        $allUserTasks = UserTask::where('user_id', Auth::id())
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'priority' => $task->priority,
                    'created_at' => $task->created_at->format('M j, Y'),
                    'source' => $task->metadata['source'] ?? 'unknown',
                    'source_id' => $task->metadata['source_id'] ?? null,
                    'category' => $task->category ?? 'General',
                    'completed' => false,
                    'urgency' => $this->mapPriorityToUrgency($task->priority),
                ];
            });

        // Get task statistics
        $taskStats = [
            'total' => UserTask::where('user_id', Auth::id())->count(),
            'pending' => UserTask::where('user_id', Auth::id())->where('status', 'pending')->count(),
            'completed' => UserTask::where('user_id', Auth::id())->where('status', 'completed')->count(),
        ];

        // Get lesson progress data for academy rank
        $academyProgress = $this->getAcademyProgress(Auth::id());

        // Get user's move details for personal details and countdown
        $moveDetails = \App\Models\UserMoveDetail::where('user_id', Auth::id())->first();
        $personalDetails = [
            'currentAddress' => $moveDetails->current_address ?? '',
            'newAddress' => $moveDetails->new_address ?? '',
            'movingDate' => $moveDetails && $moveDetails->moving_date ? $moveDetails->moving_date->format('Y-m-d') : '',
            'contactInfo' => '', // This could be from user profile if needed
            'emergencyContact' => '', // This could be from user profile if needed
        ];

        // Debug: Get all tasks to see what's happening
        $allTasks = UserTask::where('user_id', Auth::id())->get();

        return Inertia::render('housemover/dashboard', [
            'upcomingTasks' => $upcomingTasks,
            'allUserTasks' => $allUserTasks,
            'taskStats' => $taskStats,
            'academyProgress' => $academyProgress,
            'personalDetails' => $personalDetails,
            'activeSection' => $moveDetails->active_section ?? 1,
        ]);
    }

    /**
     * Map task priority to category for dashboard display
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
     * Map task priority to urgency for dashboard display
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
            [
                'recommended_task_states' => [],
                'custom_tasks' => [],
            ]
        );

        $personal = [
            'currentAddress' => $details->current_address ?? '',
            'newAddress' => $details->new_address ?? '',
            'movingDate' => $details->moving_date?->format('Y-m-d') ?? '',
            'budget' => $details->budget ?? '',
            'movingType' => $details->moving_type ?? 'purchase',
            'targetArea' => $details->target_area ?? '',
            'propertyRequirements' => $details->property_requirements ?? '',
            'solicitorContact' => $details->solicitor_contact ?? '',
            'keyDates' => $details->key_dates ?? '',
        ];

        // New: fetch custom tasks from dedicated table, grouped by section.
        $grouped = [];
        $dbTasks = CustomTask::where('user_id', $userId)->get();
        foreach ($dbTasks as $task) {
            $section = (string)$task->section_id;
            if (!isset($grouped[$section])) { $grouped[$section] = []; }
            $grouped[$section][] = [
                'id' => (string)$task->id,
                'title' => $task->title,
                'description' => $task->description,
                'category' => $task->category,
                'completed' => $task->completed,
                'isCustom' => true,
                'completedDate' => $task->completed_at?->format('Y-m-d'),
            ];
        }
        // Fallback to legacy JSON if table empty / not migrated yet.
        if (empty($grouped) && !empty($details->custom_tasks)) {
            $grouped = $details->custom_tasks;
        }

        return Inertia::render('housemover/move-details', [
            'moveDetails' => array_merge($personal, [
                'activeSection' => $details->active_section ?? 1,
            ]),
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
        // Get all user tasks grouped by status
        $allTasks = UserTask::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'priority' => $task->priority,
                    'status' => $task->status,
                    'created_at' => $task->created_at->format('M j, Y'),
                    'completed_at' => $task->completed_at?->format('M j, Y'),
                    'due_date' => $task->due_date?->format('M j, Y'),
                    'source' => $task->metadata['source'] ?? 'unknown',
                    'source_id' => $task->metadata['source_id'] ?? null,
                    'category' => $task->category ?? $this->mapPriorityToCategory($task->priority),
                    'urgency' => $this->mapPriorityToUrgency($task->priority),
                    'is_overdue' => $task->isOverdue(),
                ];
            });

        // Group tasks by status
        $groupedTasks = [
            'pending' => $allTasks->where('status', 'pending')->values(),
            'completed' => $allTasks->where('status', 'completed')->values(),
        ];

        // Get task statistics
        $taskStats = [
            'total' => $allTasks->count(),
            'pending' => $allTasks->where('status', 'pending')->count(),
            'completed' => $allTasks->where('status', 'completed')->count(),
            'overdue' => $allTasks->where('is_overdue', true)->count(),
        ];

        return Inertia::render('housemover/tasks', [
            'tasks' => $groupedTasks,
            'taskStats' => $taskStats,
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
        // Get user's saved providers with business profile data - paginated
        $savedProvidersQuery = \App\Models\SavedProvider::where('user_id', Auth::id())
            ->with(['businessProfile.user'])
            ->latest();

        // Paginate with 2 items per page
        $savedProvidersPaginator = $savedProvidersQuery->paginate(2);

        $savedProviders = $savedProvidersPaginator->through(function ($savedProvider) {
            $business = $savedProvider->businessProfile;
            
            return [
                'id' => (string) $business->id,
                'name' => $business->name,
                'avatar' => '🏢',
                'logo_url' => $business->logo_path ? url('/files/business-logos/' . basename($business->logo_path)) : null,
                'businessType' => $business->user->name ?? 'Service Provider',
                'location' => 'UK',
                'rating' => 4.5,
                'reviewCount' => 0,
                'verified' => $business->plan === 'premium',
                'services' => $business->services ?? [],
                'availability' => 'Available',
                'responseTime' => 'Usually responds within 24 hours',
                'savedDate' => $savedProvider->created_at->diffForHumans(),
                'notes' => $savedProvider->notes,
            ];
        });

        return Inertia::render('housemover/connections', [
            'savedProviders' => $savedProviders,
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
     * Get academy progress data for dashboard
     */
    private function getAcademyProgress($userId)
    {
        // Define the 9 stages in order (same as Moovey Academy)
        $stages = [
            'Move Dreamer',
            'Plan Starter',
            'Moovey Critic',
            'Prep Pioneer',
            'Moovey Director',
            'Move Rockstar',
            'Home Navigator',
            'Settler Specialist',
            'Moovey Star'
        ];

        // Get all published lessons with progress data
        $allLessons = Lesson::where('status', 'Published')
            ->orderBy('lesson_stage')
            ->orderBy('lesson_order')
            ->get();

        $totalLessons = $allLessons->count();
        $completedLessons = 0;
        $nextLesson = null;

        // Calculate stage progress and find next lesson
        $stageProgress = [];
        foreach ($stages as $stage) {
            $stageLessons = $allLessons->where('lesson_stage', $stage);
            $stageTotal = $stageLessons->count();
            $stageCompleted = 0;

            foreach ($stageLessons as $lesson) {
                if ($lesson->isCompletedByUser($userId)) {
                    $stageCompleted++;
                    $completedLessons++;
                } elseif (!$nextLesson && $lesson->isAccessibleByUser($userId)) {
                    // This is the next available lesson
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

        // Determine current rank based on stage completion
        $currentRank = 'MOVE DREAMER'; // Default to first stage
        $currentLevel = 1;
        $nextRank = 'PLAN STARTER';

        // Find the highest completed stage
        $completedStages = 0;
        $highestCompletedLevel = 0;
        $activeStage = null;
        $activeStageLevel = 0;

        // First pass: Find all completed stages and the highest one
        foreach ($stages as $index => $stage) {
            $progress = $stageProgress[$stage];
            
            // Check if stage is completed (all lessons done) and has lessons
            if ($progress['total'] > 0 && $progress['completed'] === $progress['total']) {
                $completedStages++;
                $highestCompletedLevel = $index + 1; // 1-based indexing
            }
        }

        // Second pass: Find active stage (first incomplete stage with progress)
        foreach ($stages as $index => $stage) {
            $progress = $stageProgress[$stage];
            
            if ($progress['percentage'] > 0 && $progress['percentage'] < 100) {
                if (!$activeStage) { // Take the first active stage
                    $activeStage = $stage;
                    $activeStageLevel = $index + 1;
                }
            }
        }

        // Determine current rank and level
        if ($highestCompletedLevel > 0) {
            // User has completed at least one full stage
            $currentLevel = $highestCompletedLevel;
            $currentRank = strtoupper($stages[$highestCompletedLevel - 1]); // Convert to 0-based for array
            
            // Set next rank
            if ($highestCompletedLevel < count($stages)) {
                $nextRank = strtoupper($stages[$highestCompletedLevel]); // Next stage after completed
            } else {
                $nextRank = 'MOOVEY MASTER'; // Already at max
            }
        } elseif ($activeStage) {
            // User is working on a stage but hasn't completed any full stages yet
            $currentLevel = $activeStageLevel;
            $currentRank = strtoupper($activeStage);
            
            // Next rank is the next stage after current active stage
            if ($activeStageLevel < count($stages)) {
                $nextRank = strtoupper($stages[$activeStageLevel]); // Next stage after active
            } else {
                $nextRank = 'MOOVEY MASTER';
            }
        }
        // If neither completed nor active stages, keep defaults (Move Dreamer, Level 1)

        // Calculate overall progress percentage
        $progressPercentage = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0;

        return [
            'totalLessons' => $totalLessons,
            'completedLessons' => $completedLessons,
            'progressPercentage' => $progressPercentage,
            'currentLevel' => $currentLevel,
            'currentRank' => $currentRank,
            'nextRank' => $nextRank,
            'stageProgress' => $stageProgress,
            'completedStages' => $completedStages,
            'highestCompletedLevel' => $highestCompletedLevel,
            'activeStage' => $activeStage,
            'nextLesson' => $nextLesson,
        ];
    }
}