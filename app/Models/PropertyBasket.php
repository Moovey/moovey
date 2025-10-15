<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyBasket extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'property_id',
        'notes',
        'is_favorite',
        'is_claimed',
        'claim_type',
        'claimed_at',
    ];

    protected $casts = [
        'is_favorite' => 'boolean',
        'is_claimed' => 'boolean',
        'claimed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Check if this property is claimed by the user
     */
    public function isClaimed(): bool
    {
        return $this->is_claimed;
    }

    /**
     * Get the claim type for this user
     */
    public function getClaimType(): ?string
    {
        return $this->claim_type;
    }

    /**
     * Claim this property for the user
     */
    public function claimProperty(string $claimType): bool
    {
        if ($this->is_claimed) {
            return false; // Already claimed
        }

        $this->update([
            'is_claimed' => true,
            'claim_type' => $claimType,
            'claimed_at' => now(),
        ]);

        return true;
    }

    /**
     * Unclaim this property for the user
     */
    public function unclaimProperty(): void
    {
        $this->update([
            'is_claimed' => false,
            'claim_type' => null,
            'claimed_at' => null,
        ]);
    }
}
