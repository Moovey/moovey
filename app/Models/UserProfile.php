<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'location',
        'website',
        'post_count',
        'friend_count',
        'last_active'
    ];

    protected $casts = [
        'last_active' => 'datetime',
    ];

    /**
     * Get the user that owns the profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Increment the post count.
     */
    public function incrementPostCount(): void
    {
        $this->increment('post_count');
    }

    /**
     * Decrement the post count.
     */
    public function decrementPostCount(): void
    {
        $this->decrement('post_count');
    }

    /**
     * Update the last active timestamp.
     */
    public function updateLastActive(): void
    {
        $this->update(['last_active' => now()]);
    }
}
