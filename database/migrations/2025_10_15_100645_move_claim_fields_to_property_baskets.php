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
        // Add claim fields to property_baskets (user-specific claims)
        Schema::table('property_baskets', function (Blueprint $table) {
            $table->boolean('is_claimed')->default(false)->after('is_favorite');
            $table->enum('claim_type', ['buyer', 'seller'])->nullable()->after('is_claimed');
            $table->timestamp('claimed_at')->nullable()->after('claim_type');
        });

        // Remove global claim fields from properties (these will be deprecated)
        // Note: We'll keep them for now to avoid breaking existing data, but mark them as deprecated
        Schema::table('properties', function (Blueprint $table) {
            // We'll handle the removal in a separate migration after data migration
            $table->text('migration_note')->nullable()->comment('Global claim fields deprecated - use property_baskets.is_claimed instead');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('property_baskets', function (Blueprint $table) {
            $table->dropColumn(['is_claimed', 'claim_type', 'claimed_at']);
        });

        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn('migration_note');
        });
    }
};
