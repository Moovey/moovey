<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Lesson;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $lessons = [
            [
                'title' => 'Why Move? Your Big Reason',
                'description' => 'Discover the fundamental motivations behind moving and identify your personal reasons for relocating.',
                'lesson_stage' => 'Move Dreamer',
                'duration' => '15 minutes',
                'difficulty' => 'Beginner',
                'status' => 'Published',
                'lesson_order' => 1
            ],
            [
                'title' => 'Relocate or Renovate: What\'s Your Path',
                'description' => 'Learn how to evaluate whether relocating or renovating is the right choice for your situation.',
                'lesson_stage' => 'Move Dreamer',
                'duration' => '20 minutes',
                'difficulty' => 'Beginner',
                'status' => 'Published',
                'lesson_order' => 2
            ],
            [
                'title' => 'Common Reasons People Move',
                'description' => 'Explore the most common motivations for moving and how they might apply to your situation.',
                'lesson_stage' => 'Move Dreamer',
                'duration' => '12 minutes',
                'difficulty' => 'Beginner',
                'status' => 'Published',
                'lesson_order' => 3
            ],
            [
                'title' => 'Lessons from Movers: What They Wish They Knew',
                'description' => 'Learn from the experiences of other movers and avoid common pitfalls.',
                'lesson_stage' => 'Move Dreamer',
                'duration' => '18 minutes',
                'difficulty' => 'Beginner',
                'status' => 'Published',
                'lesson_order' => 4
            ],
            [
                'title' => 'Create Your Moving Timeline',
                'description' => 'Build a comprehensive timeline for your move to ensure nothing is forgotten.',
                'lesson_stage' => 'Plan Starter',
                'duration' => '25 minutes',
                'difficulty' => 'Intermediate',
                'status' => 'Published',
                'lesson_order' => 5
            ],
            [
                'title' => 'Budget Planning & Cost Estimation',
                'description' => 'Learn how to accurately estimate and plan your moving budget.',
                'lesson_stage' => 'Plan Starter',
                'duration' => '30 minutes',
                'difficulty' => 'Intermediate',
                'status' => 'Published',
                'lesson_order' => 6
            ]
        ];

        foreach ($lessons as $lesson) {
            Lesson::create($lesson);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Lesson::whereIn('title', [
            'Why Move? Your Big Reason',
            'Relocate or Renovate: What\'s Your Path',
            'Common Reasons People Move',
            'Lessons from Movers: What They Wish They Knew',
            'Create Your Moving Timeline',
            'Budget Planning & Cost Estimation'
        ])->delete();
    }
};
