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
      Schema::create('asq3_screenings', function (Blueprint $table) {
         $table->id();
         $table->foreignId('child_id')
            ->constrained('children')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();
         $table->foreignId('age_interval_id')
            ->constrained('asq3_age_intervals')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();

         $table->date('screening_date');
         $table->tinyInteger('age_at_screening_months')->unsigned()
            ->comment('Usia saat screening (bulan)');
         $table->integer('age_at_screening_days')->unsigned()
            ->comment('Usia saat screening (hari)');

         // Status
         $table->enum('status', ['in_progress', 'completed', 'cancelled'])
            ->default('in_progress');
         $table->timestamp('completed_at')->nullable();

         // Overall Result (setelah completed)
         $table->enum('overall_status', ['sesuai', 'pantau', 'perlu_rujukan'])
            ->nullable()
            ->comment('Hasil keseluruhan');

         $table->text('notes')->nullable();

         $table->timestamps();

         $table->index('child_id', 'idx_screenings_child');
         $table->index('screening_date', 'idx_screenings_date');
      });
   }

   /**
    * Reverse the migrations.
    */
   public function down(): void
   {
      Schema::dropIfExists('asq3_screenings');
   }
};
