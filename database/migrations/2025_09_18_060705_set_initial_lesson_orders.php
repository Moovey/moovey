<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if the required columns exist before attempting to update
        if (!Schema::hasColumn('lessons', 'lesson_order') || !Schema::hasColumn('lessons', 'is_prerequisite_required')) {
            return; // Skip if columns don't exist yet
        }

        // Set lesson orders for existing lessons by creation date
        $lessons = \App\Models\Lesson::orderBy('created_at')->get();
        
        foreach ($lessons as $index => $lesson) {
            $lesson->update([
                'lesson_order' => $index + 1,
                'is_prerequisite_required' => true,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Check if columns exist before attempting to reset
        if (Schema::hasColumn('lessons', 'lesson_order') && Schema::hasColumn('lessons', 'is_prerequisite_required')) {
            // Reset lesson orders
            \App\Models\Lesson::query()->update([
                'lesson_order' => 0,
                'is_prerequisite_required' => false,
            ]);
        }
    }
};
