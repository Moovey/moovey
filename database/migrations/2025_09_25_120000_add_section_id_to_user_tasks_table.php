<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_tasks', function (Blueprint $table) {
            // Using tinyInteger since sections are 1..9; nullable for legacy tasks
            $table->unsignedTinyInteger('section_id')->nullable()->after('category');
            $table->index(['user_id', 'section_id']);
        });
    }

    public function down(): void
    {
        Schema::table('user_tasks', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'section_id']);
            $table->dropColumn('section_id');
        });
    }
};
