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
      Schema::create('asq3_screening_results', function (Blueprint $table) {
         $table->id();
         $table->foreignId('screening_id')
            ->constrained('asq3_screenings')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();
         $table->foreignId('domain_id')
            ->constrained('asq3_domains')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();

         $table->decimal('total_score', 5, 2)
            ->comment('Total skor domain');
         $table->decimal('cutoff_score', 5, 2)
            ->comment('Nilai cutoff saat screening');
         $table->decimal('monitoring_score', 5, 2)
            ->comment('Nilai monitoring saat screening');

         $table->enum('status', ['sesuai', 'pantau', 'perlu_rujukan']);

         $table->timestamp('created_at')->useCurrent();

         $table->unique(['screening_id', 'domain_id'], 'uk_result_unique');
      });
   }

   /**
    * Reverse the migrations.
    */
   public function down(): void
   {
      Schema::dropIfExists('asq3_screening_results');
   }
};
