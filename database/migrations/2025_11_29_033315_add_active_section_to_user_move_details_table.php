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
        Schema::table('user_move_details', function (Blueprint $table) {
            $table->integer('active_section')->default(1)->after('custom_tasks');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_move_details', function (Blueprint $table) {
            $table->dropColumn('active_section');
        });
    }
};
