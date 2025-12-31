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
      Schema::create('anthropometry_measurements', function (Blueprint $table) {
         $table->id();
         $table->foreignId('child_id')
            ->constrained('children')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();

         $table->date('measurement_date');

         // Pengukuran
         $table->decimal('weight', 5, 2)->nullable()
            ->comment('Berat badan dalam kg');
         $table->decimal('height', 5, 2)->nullable()
            ->comment('Tinggi/panjang badan dalam cm');
         $table->decimal('head_circumference', 5, 2)->nullable()
            ->comment('Lingkar kepala dalam cm');

         // Metode Pengukuran
         $table->boolean('is_lying')->default(false)
            ->comment('TRUE jika diukur berbaring (anak < 2 tahun)');
         $table->enum('measurement_location', ['posyandu', 'home', 'clinic', 'hospital', 'other'])
            ->default('posyandu');

         // Z-Score (dihitung otomatis berdasarkan standar WHO)
         $table->decimal('weight_for_age_zscore', 4, 2)->nullable()
            ->comment('BB/U Z-Score');
         $table->decimal('height_for_age_zscore', 4, 2)->nullable()
            ->comment('TB/U Z-Score');
         $table->decimal('weight_for_height_zscore', 4, 2)->nullable()
            ->comment('BB/TB Z-Score');
         $table->decimal('bmi_for_age_zscore', 4, 2)->nullable()
            ->comment('IMT/U Z-Score');
         $table->decimal('head_circumference_zscore', 4, 2)->nullable()
            ->comment('LK/U Z-Score');

         // Status Gizi (berdasarkan Z-Score)
         $table->enum('nutritional_status', [
            'severely_underweight',
            'underweight',
            'normal',
            'overweight',
            'obese'
         ])->nullable();

         $table->enum('stunting_status', [
            'severely_stunted',
            'stunted',
            'normal',
            'tall'
         ])->nullable();

         $table->enum('wasting_status', [
            'severely_wasted',
            'wasted',
            'normal',
            'overweight',
            'obese'
         ])->nullable();

         $table->text('notes')->nullable();

         $table->timestamps();

         // Indexes
         $table->index(['child_id', 'measurement_date'], 'idx_anthropometry_child_date');
         $table->unique(['child_id', 'measurement_date'], 'uk_anthropometry_unique');
      });
   }

   /**
    * Reverse the migrations.
    */
   public function down(): void
   {
      Schema::dropIfExists('anthropometry_measurements');
   }
};
