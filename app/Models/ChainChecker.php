<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ChainChecker extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'move_type',
        'chain_role',
        'buying_properties',
        'selling_properties',
        'chain_length',
        'agent_name',
        'agent_email',
        'buying_agent_details',
        'selling_agent_details',
        'buying_solicitor_details',
        'selling_solicitor_details',
        'agent_token',
        'chain_status',
        'progress_score',
        'is_active',
        'notes',
        'estimated_completion',
        'completed_at',
        'chain_participants',
        'analytics_data',
        'last_activity_at',
    ];

    protected $casts = [
        'chain_status' => 'array',
        'buying_properties' => 'array',
        'selling_properties' => 'array',
        'buying_agent_details' => 'array',
        'selling_agent_details' => 'array',
        'buying_solicitor_details' => 'array',
        'selling_solicitor_details' => 'array',
        'chain_participants' => 'array',
        'analytics_data' => 'array',
        'is_active' => 'boolean',
        'estimated_completion' => 'datetime',
        'completed_at' => 'datetime',
        'last_activity_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function updates(): HasMany
    {
        return $this->hasMany(ChainUpdate::class)->orderBy('created_at', 'desc');
    }

    public function recentUpdates(): HasMany
    {
        return $this->hasMany(ChainUpdate::class)
            ->where('is_public', true)
            ->orderBy('created_at', 'desc')
            ->limit(10);
    }

    /**
     * Generate a unique agent token for this chain checker
     */
    public function generateAgentToken(): string
    {
        do {
            $token = Str::random(32);
        } while (self::where('agent_token', $token)->exists());

        $this->update(['agent_token' => $token]);
        return $token;
    }

    /**
     * Calculate chain health score based on status
     */
    public function calculateHealthScore(): int
    {
        $status = $this->chain_status ?? [];
        $stages = ['offer_accepted', 'searches_surveys', 'mortgage_approval', 'contracts_exchanged', 'completion'];
        
        $completedStages = 0;
        $totalStages = count($stages);
        
        foreach ($stages as $stage) {
            if (isset($status[$stage]) && $status[$stage]['completed']) {
                $completedStages++;
            }
        }
        
        return $totalStages > 0 ? round(($completedStages / $totalStages) * 100) : 0;
    }

    /**
     * Check if chain is overdue
     */
    public function isOverdue(): bool
    {
        return $this->estimated_completion && 
               $this->estimated_completion->isPast() && 
               !$this->completed_at;
    }

    /**
     * Mark chain as completed
     */
    public function markCompleted(): void
    {
        $this->update([
            'completed_at' => now(),
            'is_active' => false,
            'progress_score' => 100,
        ]);
    }

    /**
     * Get linked buying properties
     */
    public function buyingProperties()
    {
        if (empty($this->buying_properties)) {
            return collect([]);
        }
        
        return Property::whereIn('id', $this->buying_properties)->get();
    }

    /**
     * Get linked selling properties
     */
    public function sellingProperties()
    {
        if (empty($this->selling_properties)) {
            return collect([]);
        }
        
        return Property::whereIn('id', $this->selling_properties)->get();
    }

    /**
     * Update last activity timestamp
     */
    public function updateActivity(): void
    {
        $this->update(['last_activity_at' => now()]);
    }
}
