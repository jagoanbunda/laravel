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
      Schema::create('asq3_age_intervals', function (Blueprint $table) {
         $table->id();
         $table->tinyInteger('age_months')->unsigned()->unique()
            ->comment('Usia dalam bulan: 2, 4, 6, ..., 60');
         $table->string('age_label', 50)
            ->comment('Label: 2 Bulan, 4 Bulan, dll');
         $table->integer('min_age_days')->unsigned()
            ->comment('Batas bawah usia dalam hari');
         $table->integer('max_age_days')->unsigned()
            ->comment('Batas atas usia dalam hari');

         $table->timestamp('created_at')->useCurrent();
      });
   }

   /**
    * Reverse the migrations.
    */
   public function down(): void
   {
      Schema::dropIfExists('asq3_age_intervals');
   }
};
