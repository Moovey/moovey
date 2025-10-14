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
        Schema::create('chain_checkers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('move_type', ['buying', 'selling', 'both'])->default('buying');
            $table->integer('chain_length')->default(1);
            $table->string('agent_name')->nullable();
            $table->string('agent_email')->nullable();
            $table->string('agent_token')->nullable()->unique(); // For agent form access
            $table->json('chain_status')->nullable(); // Store chain progress data
            $table->integer('progress_score')->default(0); // 0-100% overall progress
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamp('estimated_completion')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'is_active']);
            $table->index('agent_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chain_checkers');
    }
};
