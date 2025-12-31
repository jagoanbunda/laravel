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
      Schema::create('asq3_questions', function (Blueprint $table) {
         $table->id();
         $table->foreignId('age_interval_id')
            ->constrained('asq3_age_intervals')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();
         $table->foreignId('domain_id')
            ->constrained('asq3_domains')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();

         $table->tinyInteger('question_number')->unsigned()
            ->comment('Nomor pertanyaan 1-6 per domain');
         $table->text('question_text');
         $table->text('hint_text')->nullable()
            ->comment('Petunjuk/contoh untuk orang tua');
         $table->string('image_url', 500)->nullable()
            ->comment('URL gambar ilustrasi');

         // Skor per jawaban
         $table->tinyInteger('score_yes')->unsigned()->default(10)
            ->comment('Skor jawaban YA');
         $table->tinyInteger('score_sometimes')->unsigned()->default(5)
            ->comment('Skor jawaban KADANG-KADANG');
         $table->tinyInteger('score_no')->unsigned()->default(0)
            ->comment('Skor jawaban TIDAK');

         $table->integer('display_order')->default(0);

         $table->timestamp('created_at')->useCurrent();

         $table->index(['age_interval_id', 'domain_id'], 'idx_questions_age_domain');
      });
   }

   /**
    * Reverse the migrations.
    */
   public function down(): void
   {
      Schema::dropIfExists('asq3_questions');
   }
};
