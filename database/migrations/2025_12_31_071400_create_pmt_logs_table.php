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
      Schema::create('pmt_logs', function (Blueprint $table) {
         $table->id();
         $table->foreignId('schedule_id')
            ->unique('uk_pmt_log')
            ->constrained('pmt_schedules')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();

         // Porsi yang dimakan
         $table->enum('portion', ['habis', 'half', 'quarter', 'none']);

         // Dokumentasi
         $table->string('photo_url', 500)->nullable()
            ->comment('URL foto anak makan');

         $table->text('notes')->nullable();

         $table->timestamp('logged_at')->useCurrent();
      });
   }

   /**
    * Reverse the migrations.
    */
   public function down(): void
   {
      Schema::dropIfExists('pmt_logs');
   }
};
