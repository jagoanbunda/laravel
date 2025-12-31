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
        Schema::create('food_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId("child_id")->constrained("children")->cascadeOnDelete()->cascadeOnUpdate();
            $table->enum("meal_time", ["breakfast", "lunch", "dinner", "snack"]);
            $table->decimal("total_calories", 10, 2)->nullable();
            $table->decimal("total_protein", 10, 2)->nullable();
            $table->decimal("total_fat", 10, 2)->nullable();
            $table->decimal("total_carbohydrate", 10, 2)->nullable();
            $table->text("notes")->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('food_logs');
    }
};
