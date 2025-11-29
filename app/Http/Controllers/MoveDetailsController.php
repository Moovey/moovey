<?php

namespace App\Http\Controllers;

use App\Models\UserMoveDetail;
use App\Models\CustomTask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class MoveDetailsController extends Controller
{
    private function getOrCreateDetails(): UserMoveDetail
    {
        return UserMoveDetail::firstOrCreate(
            ['user_id' => Auth::id()],
            [
                'recommended_task_states' => [],
                'custom_tasks' => [],
            ]
        );
    }

    public function getData(): JsonResponse
    {
        $details = $this->getOrCreateDetails();

        // Fetch custom tasks from new table; fall back to JSON column if empty (for backward compatibility)
        $dbCustomTasks = CustomTask::where('user_id', Auth::id())->get();
        $grouped = [];
        foreach ($dbCustomTasks as $task) {
            $section = (string)$task->section_id;
            if (!isset($grouped[$section])) $grouped[$section] = [];
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
        if (empty($grouped) && !empty($details->custom_tasks)) {
            // Legacy data still in JSON
            $grouped = $details->custom_tasks;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'personalDetails' => [
                    'currentAddress' => $details->current_address,
                    'newAddress' => $details->new_address,
                    'movingDate' => optional($details->moving_date)->format('Y-m-d'),
                    'budget' => $details->budget,
                    'movingType' => $details->moving_type,
                    'targetArea' => $details->target_area,
                    'propertyRequirements' => $details->property_requirements,
                    'solicitorContact' => $details->solicitor_contact,
                    'keyDates' => $details->key_dates,
                ],
                'recommendedTaskStates' => $details->recommended_task_states ?? [],
                'customTasks' => $grouped,
                'activeSection' => $details->active_section ?? 1,
            ],
        ]);
    }

    public function updateDetails(Request $request): JsonResponse
    {
        $details = $this->getOrCreateDetails();

        $validated = $request->validate([
            'currentAddress' => 'nullable|string|max:255',
            'newAddress' => 'nullable|string|max:255',
            'movingDate' => 'nullable|date',
            'budget' => 'nullable|string|max:255',
            'movingType' => 'nullable|in:rental,purchase,sale,rental-to-rental',
            'targetArea' => 'nullable|string|max:255',
            'propertyRequirements' => 'nullable|string',
            'solicitorContact' => 'nullable|string|max:255',
            'keyDates' => 'nullable|string',
            'activeSection' => 'nullable|integer|min:1|max:9',
        ]);

        $details->fill([
            'current_address' => $validated['currentAddress'] ?? $details->current_address,
            'new_address' => $validated['newAddress'] ?? $details->new_address,
            'moving_date' => $validated['movingDate'] ?? $details->moving_date,
            'budget' => $validated['budget'] ?? $details->budget,
            'moving_type' => $validated['movingType'] ?? $details->moving_type,
            'target_area' => $validated['targetArea'] ?? $details->target_area,
            'property_requirements' => $validated['propertyRequirements'] ?? $details->property_requirements,
            'solicitor_contact' => $validated['solicitorContact'] ?? $details->solicitor_contact,
            'key_dates' => $validated['keyDates'] ?? $details->key_dates,
            'active_section' => $validated['activeSection'] ?? $details->active_section,
        ])->save();

        return response()->json([
            'success' => true,
            'message' => 'Move details updated',
        ]);
    }

    public function toggleRecommendedTask(Request $request): JsonResponse
    {
        $data = $request->validate([
            'section_id' => 'required|integer|min:1|max:9',
            'task_id' => 'required|string',
            'completed' => 'required|boolean',
        ]);

        $details = $this->getOrCreateDetails();
        $states = $details->recommended_task_states ?? [];
        $section = (string) $data['section_id'];

        if (!isset($states[$section])) {
            $states[$section] = [];
        }

        $states[$section][$data['task_id']] = [
            'completed' => $data['completed'],
            'completedDate' => $data['completed'] ? now()->format('Y-m-d') : null,
        ];

        $details->recommended_task_states = $states;
        $details->save();

        return response()->json([
            'success' => true,
            'state' => $states[$section][$data['task_id']],
        ]);
    }

    public function addCustomTask(Request $request): JsonResponse
    {
        $data = $request->validate([
            'section_id' => 'required|integer|min:1|max:9',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $sectionId = (int)$data['section_id'];
        $category = 'pre-move';
        if (in_array($sectionId, [6,7], true)) {
            $category = 'in-move';
        } elseif (in_array($sectionId, [8,9], true)) {
            $category = 'post-move';
        }

        try {
            // Use pure UUID to satisfy uuid column type (previous prefixed id caused DB insert failures)
            $id = Str::uuid()->toString();
            $taskModel = CustomTask::create([
                'id' => $id,
                'user_id' => Auth::id(),
                'section_id' => $sectionId,
                'title' => $data['title'],
                'description' => $data['description'] ?? 'Custom task',
                'category' => $category,
                'completed' => false,
                'completed_at' => null,
            ]);
            $task = [
                'id' => (string)$taskModel->id,
                'title' => $taskModel->title,
                'description' => $taskModel->description,
                'category' => $taskModel->category,
                'completed' => $taskModel->completed,
                'isCustom' => true,
                'completedDate' => null,
            ];
            return response()->json(['success' => true, 'task' => $task]);
        } catch (\Throwable $e) {
            // Likely table missing / migration not run / other DB error; log and fallback to legacy JSON storage
            Log::warning('CustomTask DB insert failed, falling back to JSON storage', [
                'error' => $e->getMessage(),
            ]);
            $details = $this->getOrCreateDetails();
            $custom = $details->custom_tasks ?? [];
            $section = (string)$sectionId;
            if (!isset($custom[$section])) { $custom[$section] = []; }
            $fallbackTask = [
                'id' => $section.'-custom-'.Str::uuid()->toString(), // legacy style id retained only for fallback
                'title' => $data['title'],
                'description' => $data['description'] ?? 'Custom task',
                'category' => $category,
                'completed' => false,
                'isCustom' => true,
                'completedDate' => null,
            ];
            $custom[$section][] = $fallbackTask;
            $details->custom_tasks = $custom;
            $details->save();
            // Include a flag so front-end / logs can detect fallback
            return response()->json(['success' => true, 'task' => $fallbackTask, 'legacy' => true]);
        }
    }

    public function toggleCustomTask(Request $request, string $taskId): JsonResponse
    {
        $data = $request->validate([
            'section_id' => 'required|integer|min:1|max:9',
            'completed' => 'required|boolean',
        ]);

        $task = CustomTask::where('id', $taskId)->where('user_id', Auth::id())
            ->where('section_id', (int)$data['section_id'])->first();
        if (!$task) {
            return response()->json(['success' => false, 'message' => 'Task not found'], 404);
        }
        $task->completed = $data['completed'];
        $task->completed_at = $data['completed'] ? now() : null;
        $task->save();
        return response()->json(['success' => true]);
    }

    public function deleteCustomTask(Request $request, string $taskId): JsonResponse
    {
        $data = $request->validate([
            'section_id' => 'required|integer|min:1|max:9',
        ]);

        $deleted = CustomTask::where('id', $taskId)
            ->where('user_id', Auth::id())
            ->where('section_id', (int)$data['section_id'])
            ->delete();
        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Task not found'], 404);
        }
        return response()->json(['success' => true]);
    }
}
