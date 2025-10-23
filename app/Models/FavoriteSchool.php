<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FavoriteSchool extends Model
{
    protected $fillable = [
        'user_id',
        'school_id',
        'name',
        'address',
        'latitude',
        'longitude',
        'catchment_zones',
        'average_catchment',
        'is_active'
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'catchment_zones' => 'array',
        'average_catchment' => 'array',
        'is_active' => 'boolean'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Convert to frontend School format
    public function toSchoolFormat(): array
    {
        return [
            'id' => $this->school_id,
            'name' => $this->name,
            'address' => $this->address,
            'coordinates' => [(float) $this->latitude, (float) $this->longitude],
            'catchmentZones' => $this->catchment_zones ?? [],
            'averageCatchment' => $this->average_catchment,
            'isActive' => $this->is_active,
            'isFavorite' => true
        ];
    }

    // Create from frontend School format
    public static function fromSchoolFormat(array $school, int $userId): array
    {
        return [
            'user_id' => $userId,
            'school_id' => $school['id'],
            'name' => $school['name'],
            'address' => $school['address'],
            'latitude' => $school['coordinates'][0],
            'longitude' => $school['coordinates'][1],
            'catchment_zones' => $school['catchmentZones'] ?? [],
            'average_catchment' => $school['averageCatchment'] ?? null,
            'is_active' => $school['isActive'] ?? true
        ];
    }
}
