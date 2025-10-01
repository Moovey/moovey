<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserMoveDetail extends Model
{
    use HasFactory;

    protected $table = 'user_move_details';

    protected $fillable = [
        'user_id',
        'current_address',
        'new_address',
        'moving_date',
        'budget',
        'moving_type',
        'target_area',
        'property_requirements',
        'solicitor_contact',
        'key_dates',
        'recommended_task_states',
        'custom_tasks',
    ];

    protected $casts = [
        'moving_date' => 'date',
        'recommended_task_states' => 'array',
        'custom_tasks' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
