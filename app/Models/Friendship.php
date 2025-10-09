<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Friendship extends Model
{
    protected $fillable = [
        'user_id',
        'friend_id',
        'status',
        'accepted_at'
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
    ];

    /**
     * Get the user who sent the friend request.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user who received the friend request.
     */
    public function friend(): BelongsTo
    {
        return $this->belongsTo(User::class, 'friend_id');
    }

    /**
     * Accept the friendship.
     */
    public function accept(): void
    {
        $this->update([
            'status' => 'accepted',
            'accepted_at' => now()
        ]);

        // Update friend counts - ensure profiles exist
        if ($this->user->profile) {
            $this->user->profile()->increment('friend_count');
        }
        if ($this->friend->profile) {
            $this->friend->profile()->increment('friend_count');
        }
    }

    /**
     * Decline the friendship.
     */
    public function decline(): void
    {
        $this->update(['status' => 'declined']);
    }

    /**
     * Block the user.
     */
    public function block(): void
    {
        $this->update(['status' => 'blocked']);
        
        // Remove from friend counts if they were friends
        if ($this->status === 'accepted') {
            if ($this->user->profile) {
                $this->user->profile()->decrement('friend_count');
            }
            if ($this->friend->profile) {
                $this->friend->profile()->decrement('friend_count');
            }
        }
    }

    /**
     * Boot the model and set up event listeners
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($friendship) {
            $friendship->createFriendRequestNotification();
        });

        static::updated(function ($friendship) {
            if ($friendship->wasChanged('status') && $friendship->status === 'accepted') {
                $friendship->createFriendAcceptedNotification();
            }
        });
    }

    /**
     * Create a friend request notification
     */
    protected function createFriendRequestNotification(): void
    {
        $requester = $this->user;
        if (!$requester) return;

        Notification::create([
            'user_id' => $this->friend_id,
            'sender_id' => $this->user_id,
            'type' => 'friend_request',
            'message' => "{$requester->name} sent you a friend request",
            'data' => [
                'friendship_id' => $this->id,
                'requester_name' => $requester->name,
                'requester_avatar' => $requester->avatar,
            ]
        ]);
    }

    /**
     * Create a friend request accepted notification
     */
    protected function createFriendAcceptedNotification(): void
    {
        $accepter = $this->friend;
        if (!$accepter) return;

        Notification::create([
            'user_id' => $this->user_id,
            'sender_id' => $this->friend_id,
            'type' => 'friend_accepted',
            'message' => "{$accepter->name} accepted your friend request",
            'data' => [
                'friendship_id' => $this->id,
                'accepter_name' => $accepter->name,
                'accepter_avatar' => $accepter->avatar,
            ]
        ]);
    }
}
