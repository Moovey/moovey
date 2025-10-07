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
        Schema::create('declutter_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category');
            $table->enum('condition', ['excellent', 'good', 'fair', 'poor']);
            $table->decimal('estimated_value', 10, 2)->default(0);
            $table->string('location')->nullable();
            $table->enum('action', ['throw', 'donate', 'sell', 'keep']);
            $table->boolean('is_listed_for_sale')->default(false);
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('declutter_items');
    }
};
