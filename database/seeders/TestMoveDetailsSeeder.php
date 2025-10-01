<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserMoveDetail;
use Carbon\Carbon;

class TestMoveDetailsSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        
        if ($user) {
            UserMoveDetail::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'current_address' => '123 Old Street, London SW1A 1AA',
                    'new_address' => '456 New Avenue, Brighton BN1 2AB',
                    'moving_date' => Carbon::now()->addDays(45)->format('Y-m-d'), // 45 days from now
                    'budget' => '£200,000-£250,000',
                    'moving_type' => 'purchase',
                    'target_area' => 'Brighton & Hove',
                    'property_requirements' => '3 bedroom house with garden, close to good schools',
                    'solicitor_contact' => 'Smith & Partners Legal - 01273 123456',
                    'key_dates' => 'Exchange: 2 weeks before move date, Completion: move date',
                    'recommended_task_states' => [],
                    'custom_tasks' => [],
                ]
            );
            
            echo "Test move details created for user: {$user->email}\n";
            echo "Moving date set to: " . Carbon::now()->addDays(45)->format('Y-m-d') . "\n";
        } else {
            echo "No users found. Please create a user first.\n";
        }
    }
}