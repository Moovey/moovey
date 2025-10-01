<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_move_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('current_address')->nullable();
            $table->string('new_address')->nullable();
            $table->date('moving_date')->nullable();
            $table->string('budget')->nullable();
            $table->string('moving_type')->nullable(); // rental | purchase | sale | rental-to-rental
            $table->string('target_area')->nullable();
            $table->text('property_requirements')->nullable();
            $table->string('solicitor_contact')->nullable();
            $table->text('key_dates')->nullable();
            $table->json('recommended_task_states')->nullable();
            $table->json('custom_tasks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_move_details');
    }
};
