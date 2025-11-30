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
        Schema::table('messages', function (Blueprint $table) {
            // Track who deleted the message from their view
            $table->json('deleted_for')->nullable()->after('read_at');
            // Track if deleted globally (for everyone)
            $table->boolean('deleted_for_everyone')->default(false)->after('deleted_for');
            $table->timestamp('deleted_at')->nullable()->after('deleted_for_everyone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['deleted_for', 'deleted_for_everyone', 'deleted_at']);
        });
    }
};
