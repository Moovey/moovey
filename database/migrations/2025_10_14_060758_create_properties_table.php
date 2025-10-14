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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('rightmove_url')->unique();
            $table->string('property_title');
            $table->string('property_image')->nullable();
            $table->text('property_description')->nullable();
            $table->string('address')->nullable();
            $table->decimal('price', 15, 2)->nullable();
            $table->string('property_type')->nullable(); // house, flat, etc.
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->boolean('is_claimed')->default(false);
            $table->enum('claim_type', ['buyer', 'seller'])->nullable();
            $table->foreignId('claimed_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('basket_count')->default(0);
            $table->json('metadata')->nullable(); // Additional scraped data
            $table->timestamps();
            
            $table->index('rightmove_url');
            $table->index(['is_claimed', 'claim_type']);
            $table->index('basket_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
