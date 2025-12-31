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
      Schema::create('pmt_menus', function (Blueprint $table) {
         $table->id();
         $table->string('name');
         $table->text('description')->nullable();
         $table->string('image_url', 500)->nullable();

         // Nutrisi
         $table->decimal('calories', 8, 2)->nullable();
         $table->decimal('protein', 8, 2)->nullable();

         // Target usia (bulan)
         $table->tinyInteger('min_age_months')->unsigned()->nullable()
            ->comment('Usia minimum dalam bulan');
         $table->tinyInteger('max_age_months')->unsigned()->nullable()
            ->comment('Usia maksimum dalam bulan');

         $table->boolean('is_active')->default(true);

         $table->timestamps();
      });
   }

   /**
    * Reverse the migrations.
    */
   public function down(): void
   {
      Schema::dropIfExists('pmt_menus');
   }
};
