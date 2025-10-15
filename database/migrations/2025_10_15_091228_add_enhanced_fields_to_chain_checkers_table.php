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
        Schema::table('chain_checkers', function (Blueprint $table) {
            // Enhanced role and property linking
            $table->enum('chain_role', ['first_time_buyer', 'seller_only', 'buyer_seller'])->nullable()->after('move_type');
            $table->json('buying_properties')->nullable()->after('chain_role');
            $table->json('selling_properties')->nullable()->after('buying_properties');
            
            // Enhanced agent and solicitor information
            $table->json('buying_agent_details')->nullable()->after('agent_email');
            $table->json('selling_agent_details')->nullable()->after('buying_agent_details');
            $table->json('buying_solicitor_details')->nullable()->after('selling_agent_details');
            $table->json('selling_solicitor_details')->nullable()->after('buying_solicitor_details');
            
            // Chain collaboration and analytics
            $table->json('chain_participants')->nullable()->after('selling_solicitor_details');
            $table->json('analytics_data')->nullable()->after('chain_participants');
            $table->timestamp('last_activity_at')->nullable()->after('analytics_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chain_checkers', function (Blueprint $table) {
            $table->dropColumn([
                'chain_role',
                'buying_properties',
                'selling_properties',
                'buying_agent_details',
                'selling_agent_details',
                'buying_solicitor_details',
                'selling_solicitor_details',
                'chain_participants',
                'analytics_data',
                'last_activity_at'
            ]);
        });
    }
};
