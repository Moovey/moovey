<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PublicController extends Controller
{
    /**
     * Display the welcome page.
     */
    public function welcome(): Response
    {
        return Inertia::render('welcome');
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
}