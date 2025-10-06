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
        Schema::table('community_posts', function (Blueprint $table) {
            $table->json('images')->nullable()->after('location'); // Store array of image paths
            $table->string('video')->nullable()->after('images'); // Store single video path
            $table->string('media_type')->nullable()->after('video'); // 'images', 'video', or null
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('community_posts', function (Blueprint $table) {
            $table->dropColumn(['images', 'video', 'media_type']);
        });
    }
};