<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'rightmove_url',
        'property_title',
        'property_photos',
        'property_description',
        'address',
        'price',
        'property_type',
        'bedrooms',
        'bathrooms',
        'is_claimed',
        'claim_type',
        'claimed_by_user_id',
        'basket_count',
        'metadata',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_claimed' => 'boolean',
        'metadata' => 'array',
        'property_photos' => 'array',
    ];

    public function claimedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimed_by_user_id');
    }

    public function baskets(): HasMany
    {
        return $this->hasMany(PropertyBasket::class);
    }

    public function usersInBasket(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'property_baskets')
            ->withPivot('notes', 'is_favorite')
            ->withTimestamps();
    }

    /**
     * Check if a user has this property in their basket
     */
    public function isInUserBasket(int $userId): bool
    {
        return $this->baskets()->where('user_id', $userId)->exists();
    }

    /**
     * Add property to user's basket
     */
    public function addToBasket(int $userId, ?string $notes = null): PropertyBasket
    {
        // Check if already in basket
        $existing = $this->baskets()->where('user_id', $userId)->first();
        if ($existing) {
            return $existing;
        }

        // Add to basket and increment count
        $basket = $this->baskets()->create([
            'user_id' => $userId,
            'notes' => $notes,
            'is_favorite' => true,
        ]);

        $this->increment('basket_count');
        
        return $basket;
    }

    /**
     * Remove property from user's basket
     */
    public function removeFromBasket(int $userId): bool
    {
        $basket = $this->baskets()->where('user_id', $userId)->first();
        if (!$basket) {
            return false;
        }

        $basket->delete();
        $this->decrement('basket_count');
        
        return true;
    }

    /**
     * Claim property by user
     */
    public function claimProperty(int $userId, string $claimType): bool
    {
        if ($this->is_claimed) {
            return false; // Already claimed
        }

        return $this->update([
            'is_claimed' => true,
            'claim_type' => $claimType,
            'claimed_by_user_id' => $userId,
        ]);
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute(): string
    {
        if (!$this->price) {
            return 'Price on request';
        }
        
        return '£' . number_format($this->price);
    }

    /**
     * Get property summary for display
     */
    public function getSummaryAttribute(): string
    {
        $parts = [];
        
        if ($this->bedrooms) {
            $parts[] = $this->bedrooms . ' bed';
        }
        
        if ($this->property_type) {
            $parts[] = strtolower($this->property_type);
        }
        
        return implode(' ', $parts) ?: 'Property';
    }

    /**
     * Get all photos for this property
     */
    public function getAllPhotosAttribute(): array
    {
        if ($this->property_photos && is_array($this->property_photos)) {
            return $this->property_photos;
        }
        
        return [];
    }

    /**
     * Get the main display image (first available photo)
     */
    public function getMainImageAttribute(): ?string
    {
        if ($this->property_photos && is_array($this->property_photos) && count($this->property_photos) > 0) {
            return $this->property_photos[0];
        }
        
        return null;
    }
}
