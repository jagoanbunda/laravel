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
        Schema::create('asq3_screening_interventions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('screening_id')
                ->constrained('asq3_screenings')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $table->foreignId('domain_id')
                ->nullable()
                ->constrained('asq3_domains')
                ->nullOnDelete()
                ->cascadeOnUpdate();
            $table->enum('type', ['stimulation', 'referral', 'follow_up', 'counseling', 'other'])
                ->default('stimulation');
            $table->text('action')->comment('Tindakan yang dilakukan/direncanakan');
            $table->text('notes')->nullable()->comment('Catatan tambahan');
            $table->enum('status', ['planned', 'in_progress', 'completed', 'cancelled'])
                ->default('planned');
            $table->date('follow_up_date')->nullable()->comment('Tanggal tindak lanjut');
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->cascadeOnUpdate();
            $table->timestamps();

            $table->index('screening_id', 'idx_interventions_screening');
            $table->index('status', 'idx_interventions_status');
            $table->index('follow_up_date', 'idx_interventions_follow_up');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asq3_screening_interventions');
    }
};
