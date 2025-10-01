<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CommunityComment;
use App\Models\CommunityPost;
use App\Models\User;
use Carbon\Carbon;

class CommunityCommentSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $users = User::all();
        $posts = CommunityPost::all();

        if ($users->isEmpty() || $posts->isEmpty()) {
            $this->command->info('No users or posts found. Please seed users and posts first.');
            return;
        }

        $sampleComments = [
            'Thanks for sharing this! Very helpful.',
            'I had a similar experience when I moved last year.',
            'Great advice! Will definitely keep this in mind.',
            'Do you have any recommendations for packing services?',
            'This is exactly what I was looking for!',
            'How much did it cost you in total?',
            'I used the same company and they were amazing!',
            'Would you recommend them for long-distance moves?',
            'Thanks for the heads up about this!',
            'Super useful information, much appreciated!',
        ];

        foreach ($posts as $post) {
            // Add 1-3 comments per post
            $commentCount = rand(1, 3);
            
            for ($i = 0; $i < $commentCount; $i++) {
                CommunityComment::create([
                    'user_id' => $users->random()->id,
                    'community_post_id' => $post->id,
                    'content' => $sampleComments[array_rand($sampleComments)],
                    'created_at' => Carbon::now()->subMinutes(rand(5, 120)),
                    'updated_at' => Carbon::now()->subMinutes(rand(5, 120)),
                ]);
            }
            
            // Update the post's comment count
            $post->update(['comments_count' => $post->comments()->count()]);
        }

        $this->command->info('Community comments seeded successfully!');
    }
}