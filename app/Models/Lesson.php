<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class Lesson extends Model
{
    protected $fillable = [
        'title',
        'description',
        'lesson_stage',
        'duration',
        'difficulty',
        'status',
        'lesson_order',
        'is_prerequisite_required',
        'content_file_path',
        'thumbnail_file_path',
        'content_html',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'is_prerequisite_required' => 'boolean',
    ];

    /**
     * Get the user progress records for this lesson.
     */
    public function userProgress(): HasMany
    {
        return $this->hasMany(UserLessonProgress::class, 'lesson_id');
    }

    /**
     * Get the current user's progress for this lesson.
     */
    public function getUserProgress($userId = null)
    {
        $userId = $userId ?? Auth::id();
        
        if (!$userId) {
            return null;
        }

        return $this->userProgress()->where('user_id', $userId)->first();
    }

    /**
     * Check if the current user has completed this lesson.
     */
    public function isCompletedByUser($userId = null): bool
    {
        $progress = $this->getUserProgress($userId);
        return $progress ? $progress->is_completed : false;
    }

    /**
     * Check if the current user can access this lesson (prerequisites met).
     */
    public function isAccessibleByUser($userId = null): bool
    {
        $userId = $userId ?? Auth::id();
        
        // If not logged in, only allow access to first lesson
        if (!$userId) {
            return $this->lesson_order === 1 || !$this->is_prerequisite_required;
        }

        // If prerequisites are not required, allow access
        if (!$this->is_prerequisite_required) {
            return true;
        }

        // First lesson is always accessible
        if ($this->lesson_order <= 1) {
            return true;
        }

        // Check if previous lesson in the same stage is completed
        $previousLesson = static::where('lesson_stage', $this->lesson_stage)
            ->where('lesson_order', $this->lesson_order - 1)
            ->where('status', 'Published')
            ->first();

        if (!$previousLesson) {
            return true; // No previous lesson, allow access
        }

        return $previousLesson->isCompletedByUser($userId);
    }

    /**
     * Get the previous lesson in the sequence.
     */
    public function getPreviousLesson()
    {
        return static::where('lesson_stage', $this->lesson_stage)
            ->where('lesson_order', $this->lesson_order - 1)
            ->where('status', 'Published')
            ->first();
    }

    /**
     * Get the next lesson in the sequence.
     */
    public function getNextLesson()
    {
        return static::where('lesson_stage', $this->lesson_stage)
            ->where('lesson_order', $this->lesson_order + 1)
            ->where('status', 'Published')
            ->first();
    }

    /**
     * Mark this lesson as started by the user.
     */
    public function markAsStartedByUser($userId = null): void
    {
        $userId = $userId ?? Auth::id();
        
        if (!$userId) {
            return;
        }

        $progress = UserLessonProgress::firstOrCreate([
            'user_id' => $userId,
            'lesson_id' => $this->id,
        ]);

        $progress->markAsStarted();
    }

    /**
     * Mark this lesson as completed by the user.
     */
    public function markAsCompletedByUser($userId = null): void
    {
        $userId = $userId ?? Auth::id();
        
        if (!$userId) {
            return;
        }

        $progress = UserLessonProgress::firstOrCreate([
            'user_id' => $userId,
            'lesson_id' => $this->id,
        ]);

        $progress->markAsCompleted();
    }

    // Accessor for content file URL
    protected function contentFileUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->content_file_path ? asset('storage/' . $this->content_file_path) : null,
        );
    }

    // Accessor for thumbnail file URL
    protected function thumbnailFileUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->thumbnail_file_path ? asset('storage/' . $this->thumbnail_file_path) : null,
        );
    }

    // Scope for published lessons
    public function scopePublished($query)
    {
        return $query->where('status', 'Published');
    }

    // Scope for lessons ordered by sequence
    public function scopeOrdered($query)
    {
        return $query->orderBy('lesson_order');
    }

    // Scope for lessons by stage ordered by sequence
    public function scopeByStageOrdered($query, $stage)
    {
        return $query->where('lesson_stage', $stage)->orderBy('lesson_order');
    }

    // Clean up uploaded images when lesson is deleted
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($lesson) {
            // Delete content file
            if ($lesson->content_file_path) {
                Storage::delete($lesson->content_file_path);
            }
            
            // Delete thumbnail
            if ($lesson->thumbnail_file_path) {
                Storage::delete($lesson->thumbnail_file_path);
            }
            
            // Clean up lesson images from content
            if ($lesson->content_html) {
                preg_match_all('/\/storage\/lesson_images\/([^"]+)/', $lesson->content_html, $matches);
                foreach ($matches[1] as $imageName) {
                    Storage::delete('public/lesson_images/' . $imageName);
                }
            }
        });
    }
}
