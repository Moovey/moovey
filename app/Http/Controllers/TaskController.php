<?php

namespace App\Http\Controllers;

use App\Models\UserTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    /**
     * Add a new task to the user's to-do list
     */
    public function addTask(Request $request): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required'
            ], 401);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'priority' => 'nullable|in:low,medium,high',
            'category' => 'nullable|in:Pre-Move,In-Move,Post-Move',
            'due_date' => 'nullable|date|after_or_equal:today',
            'source' => 'nullable|string', // e.g., 'lesson', 'manual'
            'source_id' => 'nullable|integer', // lesson ID if from lesson
            'section_id' => 'nullable|integer|min:1|max:9',
        ]);

        try {
            // Check for duplicate tasks to prevent multiple identical tasks
            $existingTask = UserTask::where('user_id', Auth::id())
                ->where('title', $request->title)
                ->where('status', 'pending')
                ->first();

            if ($existingTask) {
                return response()->json([
                    'success' => true,
                    'message' => 'Task already exists in your to-do list!',
                    'task' => [
                        'id' => $existingTask->id,
                        'title' => $existingTask->title,
                        'description' => $existingTask->description,
                        'priority' => $existingTask->priority,
                        'status' => $existingTask->status,
                        'due_date' => $existingTask->due_date?->format('Y-m-d'),
                        'created_at' => $existingTask->created_at->format('Y-m-d H:i:s'),
                    ]
                ]);
            }

            $task = UserTask::create([
                'user_id' => Auth::id(),
                'title' => $request->title,
                'description' => $request->description,
                'priority' => $request->priority ?? 'medium',
                'category' => $request->category ?? 'Pre-Move',
                'section_id' => $request->section_id,
                'due_date' => $request->due_date,
                'status' => 'pending',
                'metadata' => [
                    'source' => $request->source,
                    'source_id' => $request->source_id,
                    'created_from' => 'lesson_cta',
                    'ip_address' => $request->ip(),
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Task added to your to-do list successfully!',
                'task' => [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'priority' => $task->priority,
                    'status' => $task->status,
                    'section_id' => $task->section_id,
                    'due_date' => $task->due_date?->format('Y-m-d'),
                    'created_at' => $task->created_at->format('Y-m-d H:i:s'),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add task. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get user's tasks
     */
    public function getTasks(Request $request): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required'
            ], 401);
        }

        $status = $request->get('status', 'all');
        $priority = $request->get('priority');

        $query = UserTask::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($priority) {
            $query->where('priority', $priority);
        }

        $tasks = $query->get()->map(function ($task) {
            return [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'priority' => $task->priority,
                'category' => $task->category,
                'status' => $task->status,
                'section_id' => $task->section_id,
                'due_date' => $task->due_date?->format('Y-m-d'),
                'completed_at' => $task->completed_at?->format('Y-m-d H:i:s'),
                'created_at' => $task->created_at->format('Y-m-d H:i:s'),
                'is_overdue' => $task->isOverdue(),
                'metadata' => $task->metadata,
            ];
        });

        return response()->json([
            'success' => true,
            'tasks' => $tasks,
            'total' => $tasks->count(),
            'pending' => $tasks->where('status', 'pending')->count(),
            'completed' => $tasks->where('status', 'completed')->count(),
        ]);
    }

    /**
     * Mark a task as completed
     */
    public function completeTask(UserTask $task): JsonResponse
    {
        if (!Auth::check() || $task->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $task->markAsCompleted();

            return response()->json([
                'success' => true,
                'message' => 'Task marked as completed!',
                'task' => [
                    'id' => $task->id,
                    'status' => $task->status,
                    'completed_at' => $task->completed_at->format('Y-m-d H:i:s'),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete task. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Delete a task
     */
    public function deleteTask(UserTask $task): JsonResponse
    {
        if (!Auth::check() || $task->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $task->delete();

            return response()->json([
                'success' => true,
                'message' => 'Task deleted successfully!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete task. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Add a task to priority list
     */
    public function addToPriority(Request $request): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required'
            ], 401);
        }

        $request->validate([
            'task_id' => 'required|integer|exists:user_tasks,id',
        ]);

        try {
            $task = UserTask::where('id', $request->task_id)
                ->where('user_id', Auth::id())
                ->first();

            if (!$task) {
                return response()->json([
                    'success' => false,
                    'message' => 'Task not found'
                ], 404);
            }

            // Update metadata to mark as priority
            $metadata = $task->metadata ?? [];
            $metadata['is_priority'] = true;
            $metadata['priority_added_at'] = now()->toISOString();
            
            $task->update(['metadata' => $metadata]);

            return response()->json([
                'success' => true,
                'message' => 'Task added to priority list!',
                'task' => [
                    'id' => $task->id,
                    'title' => $task->title,
                    'is_priority' => true,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add task to priority list. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Remove a task from priority list
     */
    public function removeFromPriority(UserTask $task): JsonResponse
    {
        if (!Auth::check() || $task->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            // Update metadata to remove priority status
            $metadata = $task->metadata ?? [];
            $metadata['is_priority'] = false;
            $metadata['priority_removed_at'] = now()->toISOString();
            
            $task->update(['metadata' => $metadata]);

            return response()->json([
                'success' => true,
                'message' => 'Task removed from priority list!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove task from priority list. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get user's priority tasks
     */
    public function getPriorityTasks(): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required'
            ], 401);
        }

        try {
            $priorityTasks = UserTask::where('user_id', Auth::id())
                ->where('status', 'pending')
                ->get()
                ->filter(function ($task) {
                    return isset($task->metadata['is_priority']) && $task->metadata['is_priority'] === true;
                })
                ->map(function ($task) {
                    return [
                        'id' => $task->id,
                        'title' => $task->title,
                        'description' => $task->description,
                        'priority' => $task->priority,
                        'category' => $task->category,
                        'created_at' => $task->created_at->format('Y-m-d H:i:s'),
                        'priority_added_at' => $task->metadata['priority_added_at'] ?? null,
                    ];
                })
                ->values();

            return response()->json([
                'success' => true,
                'priority_tasks' => $priorityTasks,
                'total' => $priorityTasks->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch priority tasks. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
