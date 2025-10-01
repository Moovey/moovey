<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedToolResult extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'tool_type', 
        'form_data',
        'results',
        'calculated_at'
    ];

    protected $casts = [
        'form_data' => 'array',
        'results' => 'array',
        'calculated_at' => 'datetime'
    ];

    protected $appends = [
        'tool_display_name'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getToolDisplayNameAttribute(): string
    {
        return match($this->tool_type) {
            'mortgage' => 'Mortgage Calculator',
            'affordability' => 'Affordability Calculator',
            'volume' => 'Volume Calculator',
            'school-catchment' => 'School Catchment Map',
            default => ucfirst(str_replace('-', ' ', $this->tool_type))
        };
    }
}
