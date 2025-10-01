<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the lesson progress records for this user.
     */
    public function lessonProgress(): HasMany
    {
        return $this->hasMany(UserLessonProgress::class, 'user_id');
    }

    /**
     * Get completed lessons for this user.
     */
    public function completedLessons()
    {
        return $this->lessonProgress()->where('is_completed', true)->with('lesson');
    }

    /**
     * Check if user has completed a specific lesson.
     */
    public function hasCompletedLesson(int $lessonId): bool
    {
        return $this->lessonProgress()
            ->where('lesson_id', $lessonId)
            ->where('is_completed', true)
            ->exists();
    }

    /**
     * Get the user's progress percentage for a lesson stage.
     */
    public function getStageProgress(string $stage): array
    {
        $totalLessons = Lesson::where('lesson_stage', $stage)
            ->where('status', 'Published')
            ->count();

        $completedLessons = $this->lessonProgress()
            ->whereHas('lesson', function ($query) use ($stage) {
                $query->where('lesson_stage', $stage)
                      ->where('status', 'Published');
            })
            ->where('is_completed', true)
            ->count();

        return [
            'total' => $totalLessons,
            'completed' => $completedLessons,
            'percentage' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0,
        ];
    }

    /**
     * Get the user's profile.
     */
    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    /**
     * Get or create the user's profile.
     */
    public function getOrCreateProfile(): UserProfile
    {
        return $this->profile ?? $this->profile()->create([
            'post_count' => 0,
            'friend_count' => 0,
        ]);
    }

    /**
     * Get sent friend requests.
     */
    public function sentFriendRequests(): HasMany
    {
        return $this->hasMany(Friendship::class, 'user_id');
    }

    /**
     * Get received friend requests.
     */
    public function receivedFriendRequests(): HasMany
    {
        return $this->hasMany(Friendship::class, 'friend_id');
    }

    /**
     * Get accepted friends (sent requests).
     */
    public function friends(): HasMany
    {
        return $this->hasMany(Friendship::class, 'user_id')->where('status', 'accepted');
    }

    /**
     * Get accepted friends (received requests).
     */
    public function friendsOf(): HasMany
    {
        return $this->hasMany(Friendship::class, 'friend_id')->where('status', 'accepted');
    }

    /**
     * Check if this user is friends with another user.
     */
    public function isFriendsWith(User $user): bool
    {
        return $this->sentFriendRequests()
            ->where('friend_id', $user->id)
            ->where('status', 'accepted')
            ->exists() ||
            $this->receivedFriendRequests()
            ->where('user_id', $user->id)
            ->where('status', 'accepted')
            ->exists();
    }

    /**
     * Get the friendship status with another user.
     */
    public function getFriendshipStatus(User $user): ?string
    {
        $sentRequest = $this->sentFriendRequests()
            ->where('friend_id', $user->id)
            ->first();

        if ($sentRequest) {
            return $sentRequest->status;
        }

        $receivedRequest = $this->receivedFriendRequests()
            ->where('user_id', $user->id)
            ->first();

        return $receivedRequest ? 'received_' . $receivedRequest->status : null;
    }
}
