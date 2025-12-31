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
      Schema::create('asq3_cutoff_scores', function (Blueprint $table) {
         $table->id();
         $table->foreignId('age_interval_id')
            ->constrained('asq3_age_intervals')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();
         $table->foreignId('domain_id')
            ->constrained('asq3_domains')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();

         $table->decimal('cutoff_score', 5, 2)
            ->comment('Batas zona hitam (perlu rujukan)');
         $table->decimal('monitoring_score', 5, 2)
            ->comment('Batas zona abu (perlu monitoring)');
         $table->decimal('max_score', 5, 2)->default(60)
            ->comment('Skor maksimal domain');

         $table->timestamp('created_at')->useCurrent();

         $table->unique(['age_interval_id', 'domain_id'], 'uk_cutoff_age_domain');
      });
   }

   /**
    * Reverse the migrations.
    */
   public function down(): void
   {
      Schema::dropIfExists('asq3_cutoff_scores');
   }
};
