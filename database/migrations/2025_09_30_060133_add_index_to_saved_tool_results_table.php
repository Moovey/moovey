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
        Schema::table('saved_tool_results', function (Blueprint $table) {
            // Add composite index for optimized pagination queries
            // This will speed up queries that filter by user_id and order by created_at
            $table->index(['user_id', 'created_at'], 'idx_user_created_at');
            
            // Add index for tool_type filtering if needed in future
            $table->index(['user_id', 'tool_type'], 'idx_user_tool_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('saved_tool_results', function (Blueprint $table) {
            // Remove the indexes
            $table->dropIndex('idx_user_created_at');
            $table->dropIndex('idx_user_tool_type');
        });
    }
};
