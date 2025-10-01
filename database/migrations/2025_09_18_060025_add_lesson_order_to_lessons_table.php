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
        Schema::table('lessons', function (Blueprint $table) {
            $table->integer('lesson_order')->default(0)->after('status');
            $table->boolean('is_prerequisite_required')->default(true)->after('lesson_order');
            
            // Index for ordering lessons
            $table->index(['lesson_stage', 'lesson_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            // Try to drop index safely
            try {
                $table->dropIndex(['lesson_stage', 'lesson_order']);
            } catch (\Exception $e) {
                // Index doesn't exist, continue
            }
            
            // Check if columns exist before dropping them
            $columnsToRemove = [];
            if (Schema::hasColumn('lessons', 'lesson_order')) {
                $columnsToRemove[] = 'lesson_order';
            }
            if (Schema::hasColumn('lessons', 'is_prerequisite_required')) {
                $columnsToRemove[] = 'is_prerequisite_required';
            }
            
            if (!empty($columnsToRemove)) {
                $table->dropColumn($columnsToRemove);
            }
        });
    }
};
