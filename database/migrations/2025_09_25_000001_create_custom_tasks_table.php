<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('custom_tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('section_id'); // 1..9
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category'); // pre-move | in-move | post-move
            $table->boolean('completed')->default(false);
            $table->date('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'section_id']);
            $table->index(['user_id', 'completed']);
        });

        // Data migration: move existing JSON custom_tasks into table (best-effort)
        if (Schema::hasTable('user_move_details')) {
            $rows = DB::table('user_move_details')->select('id', 'user_id', 'custom_tasks')->whereNotNull('custom_tasks')->get();
            foreach ($rows as $row) {
                try {
                    $decoded = json_decode($row->custom_tasks, true) ?: [];
                    foreach ($decoded as $sectionId => $tasks) {
                        if (!is_array($tasks)) continue;
                        foreach ($tasks as $task) {
                            // Ensure minimum fields
                            if (!(isset($task['id']) && isset($task['title']))) continue;
                            $completed = (bool)($task['completed'] ?? false);
                            $completedDate = $task['completedDate'] ?? null;
                            DB::table('custom_tasks')->insert([
                                'id' => $task['id'], // preserve existing id pattern
                                'user_id' => $row->user_id,
                                'section_id' => (int)$sectionId,
                                'title' => $task['title'],
                                'description' => $task['description'] ?? null,
                                'category' => $task['category'] ?? 'pre-move',
                                'completed' => $completed,
                                'completed_at' => $completed && $completedDate ? $completedDate : null,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }
                    }
                } catch (Throwable $e) {
                    // Skip problematic row silently to avoid migration failure
                }
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_tasks');
    }
};
