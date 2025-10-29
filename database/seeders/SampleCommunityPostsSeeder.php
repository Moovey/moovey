<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\CommunityPost;

class SampleCommunityPostsSeeder extends Seeder
{
    public function run()
    {
        // Get the first user, or create one if none exists
        $user = User::first();
        
        if (!$user) {
            $user = User::create([
                'name' => 'Community Admin',
                'email' => 'admin@moovey.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]);
        }

        // Create sample community posts
        $posts = [
            [
                'content' => 'Just completed my move to Manchester! The experience was much smoother thanks to all the tips I got from this community. Happy to share what I learned!',
                'location' => 'Manchester, UK',
                'likes_count' => 15,
                'comments_count' => 8,
                'shares_count' => 3,
                'created_at' => now()->subHours(2),
            ],
            [
                'content' => 'Looking for reliable removal companies in London area. Anyone have recent experience with good companies they can recommend?',
                'location' => 'London, UK',
                'likes_count' => 7,
                'comments_count' => 12,
                'shares_count' => 1,
                'created_at' => now()->subHours(4),
            ],
            [
                'content' => 'Pro tip: Start collecting boxes 2-3 weeks before your move date. I got free boxes from local supermarkets and online retailers. Saved me over £50!',
                'location' => 'Birmingham, UK',
                'likes_count' => 23,
                'comments_count' => 6,
                'shares_count' => 9,
                'created_at' => now()->subHours(6),
            ],
            [
                'content' => 'Has anyone used the Moovey moving checklist? Just discovered it and it looks super comprehensive. Wondering if others found it helpful?',
                'location' => 'Edinburgh, UK',
                'likes_count' => 11,
                'comments_count' => 15,
                'shares_count' => 4,
                'created_at' => now()->subHours(8),
            ],
            [
                'content' => 'Successfully moved my entire home office setup without any damage! The key was proper cable management and labeling everything. Happy to share my system if anyone is interested.',
                'location' => 'Bristol, UK',
                'likes_count' => 19,
                'comments_count' => 9,
                'shares_count' => 7,
                'created_at' => now()->subHours(10),
            ]
        ];

        foreach ($posts as $postData) {
            CommunityPost::create(array_merge($postData, ['user_id' => $user->id]));
        }

        $this->command->info('Created ' . count($posts) . ' sample community posts!');
    }
}