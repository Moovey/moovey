<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@moovey.com',
            'role' => 'admin',
            'password' => bcrypt('admin123'), // Change this password in production
        ]);

        // Create test business user
        User::factory()->create([
            'name' => 'MoveMaster Ltd',
            'email' => 'business@moovey.com',
            'role' => 'business',
            'password' => bcrypt('business123'),
        ]);

        // Create test housemover user
        User::factory()->create([
            'name' => 'John Housemover',
            'email' => 'housemover@moovey.com',
            'role' => 'housemover',
            'password' => bcrypt('housemover123'),
        ]);

        // Seed sample business profiles
        $this->call(BusinessProfileSeeder::class);

        // User::factory(10)->create();
    }
}
