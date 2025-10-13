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
        // Create admin user (only if it doesn't exist)
        User::firstOrCreate(
            ['email' => 'admin@moovey.com'],
            [
                'name' => 'Admin User',
                'role' => 'admin',
                'password' => bcrypt('admin123'), // Change this password in production
                'email_verified_at' => now(),
            ]
        );

        // Create test business user (only if it doesn't exist)
        User::firstOrCreate(
            ['email' => 'business@moovey.com'],
            [
                'name' => 'MoveMaster Ltd',
                'role' => 'business',
                'password' => bcrypt('business123'),
                'email_verified_at' => now(),
            ]
        );

        // Create test housemover user (only if it doesn't exist)
        User::firstOrCreate(
            ['email' => 'housemover@moovey.com'],
            [
                'name' => 'John Housemover',
                'role' => 'housemover',
                'password' => bcrypt('housemover123'),
                'email_verified_at' => now(),
            ]
        );

        // Seed sample business profiles
        $this->call(BusinessProfileSeeder::class);

        // Seed sample declutter items for marketplace
        $this->call(DeclutterItemSeeder::class);

        // User::factory(10)->create();
    }
}
