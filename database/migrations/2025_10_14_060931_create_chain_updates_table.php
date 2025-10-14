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
        Schema::create('chain_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chain_checker_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // Who made the update
            $table->string('update_type'); // 'status_change', 'stage_complete', 'agent_update', 'property_added', etc.
            $table->string('title');
            $table->text('description');
            $table->json('data')->nullable(); // Additional context data
            $table->boolean('is_public')->default(true); // Whether visible to user
            $table->timestamps();
            
            $table->index(['chain_checker_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chain_updates');
    }
};
