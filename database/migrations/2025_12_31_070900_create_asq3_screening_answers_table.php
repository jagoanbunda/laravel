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
      Schema::create('asq3_screening_answers', function (Blueprint $table) {
         $table->id();
         $table->foreignId('screening_id')
            ->constrained('asq3_screenings')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();
         $table->foreignId('question_id')
            ->constrained('asq3_questions')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();

         $table->enum('answer', ['yes', 'sometimes', 'no']);
         $table->tinyInteger('score')->unsigned();

         $table->timestamp('created_at')->useCurrent();

         $table->unique(['screening_id', 'question_id'], 'uk_answer_unique');
      });
   }

   /**
    * Reverse the migrations.
    */
   public function down(): void
   {
      Schema::dropIfExists('asq3_screening_answers');
   }
};
