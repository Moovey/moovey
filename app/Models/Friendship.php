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

        // Update friend counts
        $this->user->profile()->increment('friend_count');
        $this->friend->profile()->increment('friend_count');
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
            $this->user->profile()->decrement('friend_count');
            $this->friend->profile()->decrement('friend_count');
        }
    }
}
