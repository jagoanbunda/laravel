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
      Schema::create('food_log_items', function (Blueprint $table) {
         $table->id();
         $table->foreignId('food_log_id')
            ->constrained('food_logs')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();
         $table->foreignId('food_id')
            ->constrained('foods')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();

         $table->decimal('quantity', 8, 2)->default(1)
            ->comment('Jumlah porsi');
         $table->decimal('serving_size', 8, 2)
            ->comment('Ukuran porsi dalam gram');

         // Nutrisi aktual (quantity x nutrisi per serving)
         $table->decimal('calories', 10, 2);
         $table->decimal('protein', 10, 2);
         $table->decimal('fat', 10, 2);
         $table->decimal('carbohydrate', 10, 2);

         $table->timestamp('created_at')->useCurrent();

         $table->index('food_log_id', 'idx_food_log_items_log');
      });
   }

   /**
    * Reverse the migrations.
    */
   public function down(): void
   {
      Schema::dropIfExists('food_log_items');
   }
};
