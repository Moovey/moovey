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
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('lesson_stage');
            $table->string('duration');
            $table->enum('difficulty', ['Beginner', 'Intermediate', 'Advanced']);
            $table->enum('status', ['Draft', 'Published', 'Archived'])->default('Draft');
            $table->string('content_file_path')->nullable();
            $table->string('thumbnail_file_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
