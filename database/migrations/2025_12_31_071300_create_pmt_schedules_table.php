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
      Schema::create('pmt_schedules', function (Blueprint $table) {
         $table->id();
         $table->foreignId('child_id')
            ->constrained('children')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();
         $table->foreignId('menu_id')
            ->constrained('pmt_menus')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();

         $table->date('scheduled_date');

         $table->timestamp('created_at')->useCurrent();

         $table->unique(['child_id', 'scheduled_date'], 'uk_pmt_schedule');
         $table->index('scheduled_date', 'idx_pmt_schedule_date');
      });
   }

   /**
    * Reverse the migrations.
    */
   public function down(): void
   {
      Schema::dropIfExists('pmt_schedules');
   }
};
