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
            $table->enum('post_type', ['original', 'shared'])->default('original');
            $table->foreignId('original_post_id')->nullable()->constrained('community_posts')->onDelete('cascade');
            $table->index('post_type');
            $table->index('original_post_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('community_posts', function (Blueprint $table) {
            $table->dropForeign(['original_post_id']);
            $table->dropIndex(['original_post_id']);
            $table->dropIndex(['post_type']);
            $table->dropColumn(['post_type', 'original_post_id']);
        });
    }
};
