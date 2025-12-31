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
      Schema::create('asq3_recommendations', function (Blueprint $table) {
         $table->id();
         $table->foreignId('domain_id')
            ->constrained('asq3_domains')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();
         $table->foreignId('age_interval_id')
            ->nullable()
            ->constrained('asq3_age_intervals')
            ->nullOnDelete()
            ->comment('NULL = berlaku untuk semua usia');

         $table->text('recommendation_text');
         $table->tinyInteger('priority')->unsigned()->default(0)
            ->comment('Urutan prioritas');

         $table->timestamp('created_at')->useCurrent();

         $table->index('domain_id', 'idx_recommendations_domain');
      });
   }

   /**
    * Reverse the migrations.
    */
   public function down(): void
   {
      Schema::dropIfExists('asq3_recommendations');
   }
};
