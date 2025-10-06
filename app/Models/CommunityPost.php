<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommunityPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content',
        'location',
        'images',
        'video',
        'media_type',
        'likes_count',
        'comments_count',
        'shares_count',
        'is_pinned',
        'post_type',
        'original_post_id',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'images' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function likedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'community_post_likes')
                    ->withTimestamps();
    }

    public function comments(): HasMany
    {
        return $this->hasMany(CommunityComment::class);
    }

    /**
     * Get the original post if this is a shared post
     */
    public function originalPost(): BelongsTo
    {
        return $this->belongsTo(CommunityPost::class, 'original_post_id');
    }

    /**
     * Get all shared instances of this post
     */
    public function sharedPosts(): HasMany
    {
        return $this->hasMany(CommunityPost::class, 'original_post_id');
    }

    public function isLikedByUser($userId): bool
    {
        return $this->likedByUsers()->where('user_id', $userId)->exists();
    }

    public function toggleLike($userId): bool
    {
        $isLiked = $this->isLikedByUser($userId);
        
        if ($isLiked) {
            $this->likedByUsers()->detach($userId);
            $this->decrement('likes_count');
            return false;
        } else {
            $this->likedByUsers()->attach($userId);
            $this->increment('likes_count');
            return true;
        }
    }

    public function scopeLatestWithPinned($query)
    {
        return $query->orderByDesc('is_pinned')
                    ->orderByDesc('created_at');
    }

    public function getTimeAgoAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }
}
