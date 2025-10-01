<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class AssignUserRoles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'assign:user-roles';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign roles to existing users for testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::all();
        
        if ($users->isEmpty()) {
            $this->info('No users found in database.');
            return;
        }

        $roles = ['admin', 'housemover', 'business'];
        
        foreach ($users as $index => $user) {
            $role = $roles[$index % count($roles)]; // Cycle through roles
            $user->update(['role' => $role]);
            $this->info("Assigned role '{$role}' to user: {$user->name}");
        }

        $this->info('User roles assigned successfully!');
    }
}
