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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // who receives the notification
            $table->foreignId('sender_id')->nullable()->constrained('users')->onDelete('cascade'); // who triggered the notification
            $table->string('type'); // like, comment, share, friend_request
            $table->text('message'); // notification message
            $table->json('data')->nullable(); // additional data like post_id, comment_id, etc.
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'is_read', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
