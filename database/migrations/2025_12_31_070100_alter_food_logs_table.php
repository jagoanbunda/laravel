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
      Schema::table('food_logs', function (Blueprint $table) {
         $table->date('log_date')->after('child_id');

         // Unique constraint: satu anak, satu tanggal, satu waktu makan
         $table->unique(['child_id', 'log_date', 'meal_time'], 'uk_food_logs_unique');

         // Index untuk query
         $table->index(['child_id', 'log_date'], 'idx_food_logs_child_date');
      });
   }

   /**
    * Reverse the migrations.
    */
   public function down(): void
   {
      Schema::table('food_logs', function (Blueprint $table) {
         $table->dropUnique('uk_food_logs_unique');
         $table->dropIndex('idx_food_logs_child_date');
         $table->dropColumn('log_date');
      });
   }
};
