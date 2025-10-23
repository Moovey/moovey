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
        Schema::create('favorite_schools', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('school_id'); // External school ID
            $table->string('name');
            $table->text('address');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->json('catchment_zones')->nullable(); // Store catchment zone data
            $table->json('average_catchment')->nullable(); // Store average catchment data
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Prevent duplicate favorite schools per user
            $table->unique(['user_id', 'school_id']);
            
            // Index for faster queries
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favorite_schools');
    }
};
