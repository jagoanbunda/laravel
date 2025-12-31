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
      Schema::create('asq3_domains', function (Blueprint $table) {
         $table->id();
         $table->string('code', 50)->unique()
            ->comment('communication, gross_motor, dll');
         $table->string('name', 100)
            ->comment('Nama domain dalam Bahasa Indonesia');
         $table->string('icon', 100)->nullable()
            ->comment('Material Icons name');
         $table->string('color', 20)->nullable()
            ->comment('Hex color code');
         $table->tinyInteger('display_order')->default(0);

         $table->timestamp('created_at')->useCurrent();
      });
   }

   /**
    * Reverse the migrations.
    */
   public function down(): void
   {
      Schema::dropIfExists('asq3_domains');
   }
};
