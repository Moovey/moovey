<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChainUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
        'chain_checker_id',
        'user_id',
        'update_type',
        'title',
        'description',
        'data',
        'metadata',
        'agent_name',
        'is_public',
    ];

    protected $casts = [
        'data' => 'array',
        'metadata' => 'array',
        'is_public' => 'boolean',
    ];

    public function chainChecker(): BelongsTo
    {
        return $this->belongsTo(ChainChecker::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create a new chain update
     */
    public static function createUpdate(
        int $chainCheckerId, 
        string $updateType, 
        string $title, 
        string $description, 
        ?int $userId = null,
        ?array $data = null,
        bool $isPublic = true
    ): self {
        return self::create([
            'chain_checker_id' => $chainCheckerId,
            'user_id' => $userId,
            'update_type' => $updateType,
            'title' => $title,
            'description' => $description,
            'data' => $data,
            'is_public' => $isPublic,
        ]);
    }
}
