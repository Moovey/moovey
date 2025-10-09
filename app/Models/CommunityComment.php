<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommunityComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'community_post_id',
        'parent_id',
        'content',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function communityPost(): BelongsTo
    {
        return $this->belongsTo(CommunityPost::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(CommunityComment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(CommunityComment::class, 'parent_id');
    }

    /**
     * Boot the model and set up event listeners
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($comment) {
            $comment->createCommentNotification();
        });
    }

    /**
     * Create a comment notification
     */
    protected function createCommentNotification(): void
    {
        $post = $this->communityPost;
        
        // Don't notify yourself
        if (!$post || $post->user_id === $this->user_id) return;

        $commenter = $this->user;
        if (!$commenter) return;

        Notification::create([
            'user_id' => $post->user_id,
            'sender_id' => $this->user_id,
            'type' => 'post_comment',
            'message' => "{$commenter->name} commented on your post",
            'data' => [
                'post_id' => $post->id,
                'comment_id' => $this->id,
                'comment_content' => substr($this->content, 0, 50) . '...',
                'post_content' => substr($post->content, 0, 50) . '...',
            ]
        ]);
    }
}
