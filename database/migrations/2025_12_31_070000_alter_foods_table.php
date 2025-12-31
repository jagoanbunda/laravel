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
      Schema::table('foods', function (Blueprint $table) {
         $table->boolean('is_system')->default(true)->after('is_active')
            ->comment('TRUE = makanan bawaan sistem');
         $table->foreignId('created_by')->nullable()->after('is_system')
            ->constrained('users')->nullOnDelete()
            ->comment('NULL jika makanan sistem');
      });
   }

   /**
    * Reverse the migrations.
    */
   public function down(): void
   {
      Schema::table('foods', function (Blueprint $table) {
         $table->dropForeign(['created_by']);
         $table->dropColumn(['is_system', 'created_by']);
      });
   }
};
