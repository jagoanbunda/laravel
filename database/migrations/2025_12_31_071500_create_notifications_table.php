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
      Schema::create('notifications', function (Blueprint $table) {
         $table->id();
         $table->foreignId('user_id')
            ->constrained('users')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();

         $table->string('type', 100)
            ->comment('screening_reminder, pmt_reminder, etc');
         $table->string('title');
         $table->text('body');
         $table->json('data')->nullable()
            ->comment('Extra data untuk deep link');

         $table->timestamp('read_at')->nullable();
         $table->timestamp('created_at')->useCurrent();

         $table->index(['user_id', 'read_at'], 'idx_notifications_user_read');
      });
   }

   /**
    * Reverse the migrations.
    */
   public function down(): void
   {
      Schema::dropIfExists('notifications');
   }
};
