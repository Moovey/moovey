<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class LessonController extends Controller
{
    /**
     * Display a listing of the resource.
     * Note: Academy management is now handled through the admin dashboard component.
     */
    public function index()
    {
        // This method is no longer used since academy management 
        // is handled through the admin dashboard with academy tab
        abort(404);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/lessons/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Log::info('Lesson store request received', [
            'request_data' => $request->all(),
            'content_html_length' => strlen($request->input('content_html', '')),
            'content_html_preview' => substr($request->input('content_html', ''), 0, 200)
        ]);
        
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'lesson_stage' => 'required|string',
            'duration' => 'required|string',
            'difficulty' => 'required|in:Beginner,Intermediate,Advanced',
            'content_html' => 'nullable|string',
            'content_file' => 'nullable|file|mimes:pdf,doc,docx,txt,md|max:10240', // 10MB max
            'thumbnail_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // 2MB max
        ]);

        if ($validator->fails()) {
            Log::error('Lesson validation failed', ['errors' => $validator->errors()]);
            return back()->withErrors($validator)->withInput();
        }

        $lesson = new Lesson();
        $lesson->title = $request->title;
        $lesson->description = $request->description;
        $lesson->lesson_stage = $request->lesson_stage;
        $lesson->duration = $request->duration;
        $lesson->difficulty = $request->difficulty;
        $lesson->status = 'Published'; // Auto-publish for demo
        $lesson->content_html = $request->content_html;

        Log::info('Lesson data before save', [
            'lesson_attributes' => $lesson->getAttributes(),
            'content_html_in_lesson' => $lesson->content_html
        ]);

        // Handle content file upload (optional now with HTML content)
        if ($request->hasFile('content_file')) {
            $contentFile = $request->file('content_file');
            $contentPath = $contentFile->store('lessons/content', 'public');
            $lesson->content_file_path = $contentPath;
        }

        // Handle thumbnail file upload
        if ($request->hasFile('thumbnail_file')) {
            $thumbnailFile = $request->file('thumbnail_file');
            $thumbnailPath = $thumbnailFile->store('lessons/thumbnails', 'public');
            $lesson->thumbnail_file_path = $thumbnailPath;
        }

        $lesson->save();

        // Clear admin academy cache when a new lesson is created
        Cache::forget('admin_academy_lessons');
        Cache::forget('admin_academy_lessons_search');

        Log::info('Lesson saved successfully', [
            'lesson_id' => $lesson->id,
            'content_html_saved' => $lesson->content_html
        ]);

        return redirect()->route('admin.academy')->with('success', 'Lesson created successfully and is now available in the academy!');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $lesson = Lesson::findOrFail($id);
        $user = Auth::user();
        
        // Check if this is an admin route request
        if (request()->route()->getPrefix() === 'admin') {
            return Inertia::render('admin/lessons/show', [
                'lesson' => $lesson
            ]);
        }
        
        // For public access, check if user can access this lesson
        if ($user && !$lesson->isAccessibleByUser($user->id)) {
            return redirect()->route('academy')->with('error', 'You must complete the previous lessons to access this one.');
        }
        
        // Mark lesson as started if user is logged in
        if ($user) {
            $lesson->markAsStartedByUser($user->id);
        }
        
        // Get user progress
        $progress = $lesson->getUserProgress($user?->id);
        
        // Get next and previous lessons
        $previousLesson = $lesson->getPreviousLesson();
        $nextLesson = $lesson->getNextLesson();
        
        // Render the public lesson view (for housemovers and other public users)
        return Inertia::render('lessons/show', [
            'lesson' => array_merge($lesson->toArray(), [
                'content_file_url' => $lesson->content_file_url,
                'thumbnail_file_url' => $lesson->thumbnail_file_url,
            ]),
            'userProgress' => $progress ? [
                'is_completed' => $progress->is_completed,
                'progress_percentage' => $progress->progress_percentage,
                'started_at' => $progress->started_at?->format('Y-m-d H:i:s'),
                'completed_at' => $progress->completed_at?->format('Y-m-d H:i:s'),
            ] : null,
            'previousLesson' => $previousLesson ? [
                'id' => $previousLesson->id,
                'title' => $previousLesson->title,
                'is_completed' => $previousLesson->isCompletedByUser($user?->id),
            ] : null,
            'nextLesson' => $nextLesson ? [
                'id' => $nextLesson->id,
                'title' => $nextLesson->title,
                'is_accessible' => $nextLesson->isAccessibleByUser($user?->id),
            ] : null,
            'isAuthenticated' => $user !== null,
            'canMarkComplete' => $user !== null,
        ]);
    }

    /**
     * Mark a lesson as completed by the current user.
     */
    public function markComplete(Request $request, string $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }
        
        $lesson = Lesson::findOrFail($id);
        
        // Check if user can access this lesson
        if (!$lesson->isAccessibleByUser($user->id)) {
            return response()->json(['error' => 'You cannot complete this lesson yet'], 403);
        }
        
        // Mark lesson as completed
        $lesson->markAsCompletedByUser($user->id);
        
        // Get updated progress
        $progress = $lesson->getUserProgress($user->id);
        $nextLesson = $lesson->getNextLesson();
        
        return response()->json([
            'success' => true,
            'message' => 'Lesson completed successfully!',
            'progress' => [
                'is_completed' => $progress->is_completed,
                'completed_at' => $progress->completed_at?->format('Y-m-d H:i:s'),
                'progress_percentage' => $progress->progress_percentage,
            ],
            'nextLesson' => $nextLesson ? [
                'id' => $nextLesson->id,
                'title' => $nextLesson->title,
                'is_accessible' => $nextLesson->isAccessibleByUser($user->id),
            ] : null,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $lesson = Lesson::findOrFail($id);
        
        return Inertia::render('admin/lessons/edit', [
            'lesson' => $lesson
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $lesson = Lesson::findOrFail($id);
        
        // Handle full lesson update (when coming from edit form)
        if ($request->has('title')) {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'lesson_stage' => 'required|string',
                'duration' => 'required|string',
                'difficulty' => 'required|in:Beginner,Intermediate,Advanced',
                'status' => 'required|in:Draft,Published,Archived',
                'content_html' => 'nullable|string',
                'content_file' => 'nullable|file|mimes:pdf,doc,docx,txt,md|max:10240', // 10MB max
                'thumbnail_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // 2MB max
            ]);

            if ($validator->fails()) {
                return back()->withErrors($validator)->withInput();
            }

            $lesson->title = $request->title;
            $lesson->description = $request->description;
            $lesson->lesson_stage = $request->lesson_stage;
            $lesson->duration = $request->duration;
            $lesson->difficulty = $request->difficulty;
            $lesson->status = $request->status;
            $lesson->content_html = $request->content_html;

            // Handle content file upload
            if ($request->hasFile('content_file')) {
                // Delete old content file if it exists
                if ($lesson->content_file_path) {
                    Storage::disk('public')->delete($lesson->content_file_path);
                }
                
                $contentFile = $request->file('content_file');
                $contentPath = $contentFile->store('lessons/content', 'public');
                $lesson->content_file_path = $contentPath;
            }

            // Handle thumbnail file upload
            if ($request->hasFile('thumbnail_file')) {
                // Delete old thumbnail file if it exists
                if ($lesson->thumbnail_file_path) {
                    Storage::disk('public')->delete($lesson->thumbnail_file_path);
                }
                
                $thumbnailFile = $request->file('thumbnail_file');
                $thumbnailPath = $thumbnailFile->store('lessons/thumbnails', 'public');
                $lesson->thumbnail_file_path = $thumbnailPath;
            }

            $lesson->save();

            // Clear admin academy cache when a lesson is updated
            Cache::forget('admin_academy_lessons');
            Cache::forget('admin_academy_lessons_search');

            return redirect()->route('admin.academy')->with('success', 'Lesson updated successfully!');
        }
        
        // Handle simple status update (when coming from academy manager)
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:Draft,Published,Archived',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $lesson->update($request->only(['status']));

        // Clear admin academy cache when lesson status is updated
        Cache::forget('admin_academy_lessons');
        Cache::forget('admin_academy_lessons_search');

        return back()->with('success', 'Lesson updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $lesson = Lesson::findOrFail($id);
        
        // Delete associated files from storage
        if ($lesson->content_file_path) {
            Storage::disk('public')->delete($lesson->content_file_path);
        }
        
        if ($lesson->thumbnail_file_path) {
            Storage::disk('public')->delete($lesson->thumbnail_file_path);
        }
        
        $lesson->delete();

        // Clear admin academy cache when a lesson is deleted
        Cache::forget('admin_academy_lessons');
        Cache::forget('admin_academy_lessons_search');

        return back()->with('success', 'Lesson deleted successfully!');
    }

    /**
     * Get published lessons for the academy
     */
    public function getPublishedLessons()
    {
        $lessons = Lesson::published()->latest()->get();
        
        return response()->json($lessons);
    }

    /**
     * Get lessons by stage for the academy
     */
    public function getLessonsByStage($stage)
    {
        $lessons = Lesson::published()->byStage($stage)->latest()->get();
        
        return response()->json($lessons);
    }
}
