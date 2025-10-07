<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeclutterItem extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'category',
        'condition',
        'estimated_value',
        'location',
        'action',
        'is_listed_for_sale',
        'image',
        'images',
    ];

    protected $casts = [
        'estimated_value' => 'decimal:2',
        'is_listed_for_sale' => 'boolean',
        'images' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForSale($query)
    {
        return $query->where('is_listed_for_sale', true);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
