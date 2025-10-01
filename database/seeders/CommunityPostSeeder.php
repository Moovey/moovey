<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\CommunityPost;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class CommunityPostSeeder extends Seeder
{
    public function run(): void
    {
        // Get existing users
        $users = User::all();
        
        if ($users->count() < 3) {
            // Create test users if needed
            $user1 = User::firstOrCreate([
                'email' => 'sarah@example.com'
            ], [
                'name' => 'Sarah Mitchell',
                'role' => 'housemover',
                'password' => bcrypt('password123'),
            ]);
            
            $user2 = User::firstOrCreate([
                'email' => 'james@example.com'
            ], [
                'name' => 'James Wilson',
                'role' => 'housemover',
                'password' => bcrypt('password123'),
            ]);
            
            $user3 = User::firstOrCreate([
                'email' => 'emma@example.com'
            ], [
                'name' => 'Emma Roberts',
                'role' => 'housemover',
                'password' => bcrypt('password123'),
            ]);
            
            $users = collect([$user1, $user2, $user3]);
        }

        $samplePosts = [
            [
                'user_id' => $users->random()->id,
                'content' => 'Just completed my move to Manchester! Amazing experience with the local moving team. Happy to share recommendations with anyone moving to the area.',
                'location' => 'Manchester',
                'likes_count' => rand(1, 15),
                'comments_count' => rand(0, 8),
                'shares_count' => rand(0, 3),
                'created_at' => Carbon::now()->subHours(5),
                'updated_at' => Carbon::now()->subHours(5),
            ],
            [
                'user_id' => $users->random()->id,
                'content' => 'Real-time road temperature services in the Liverpool area? Looking for recommendations for a 3-bedroom house move.',
                'location' => 'Liverpool',
                'likes_count' => rand(0, 5),
                'comments_count' => rand(0, 3),
                'shares_count' => 0,
                'created_at' => Carbon::now()->subHours(3),
                'updated_at' => Carbon::now()->subHours(3),
            ],
            [
                'user_id' => $users->random()->id,
                'content' => 'Does anyone have experience with storage solutions in Birmingham? Need to store furniture for 2 months during renovation.',
                'location' => 'Birmingham',
                'likes_count' => rand(2, 8),
                'comments_count' => rand(1, 6),
                'shares_count' => rand(0, 2),
                'created_at' => Carbon::now()->subDay(),
                'updated_at' => Carbon::now()->subDay(),
            ],
            [
                'user_id' => $users->random()->id,
                'content' => 'First-time mover here! Any tips for packing fragile items? Moving from London to Bristol next month.',
                'location' => 'London → Bristol',
                'likes_count' => rand(5, 15),
                'comments_count' => rand(8, 20),
                'shares_count' => rand(1, 5),
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'user_id' => $users->random()->id,
                'content' => 'Successfully moved to Edinburgh last week! The weather is amazing here. Thanks to everyone who helped with moving company recommendations.',
                'location' => 'Edinburgh',
                'likes_count' => rand(10, 25),
                'comments_count' => rand(5, 15),
                'shares_count' => rand(2, 8),
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ],
            [
                'user_id' => $users->random()->id,
                'content' => 'Pro tip: Label your boxes with what room they belong to AND what\'s inside. Saved me hours during unpacking!',
                'likes_count' => rand(15, 30),
                'comments_count' => rand(3, 12),
                'shares_count' => rand(5, 15),
                'created_at' => Carbon::now()->subDays(4),
                'updated_at' => Carbon::now()->subDays(4),
            ],
        ];

        foreach ($samplePosts as $postData) {
            CommunityPost::create($postData);
        }
    }
}