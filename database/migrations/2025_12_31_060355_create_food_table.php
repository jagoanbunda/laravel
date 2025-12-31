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
        Schema::create('foods', function (Blueprint $table) {
            $table->id();
            $table->string("name");
            $table->string("category");
            $table->string("icon")->nullable();

            $table->decimal("serving_size", 8, 2)->default(100.00);
            $table->decimal("calories", 8, 2);
            $table->decimal("protein", 8, 2);
            $table->decimal("fat", 8, 2);
            $table->decimal("carbohydrate", 8, 2);
            $table->decimal("fiber", 8, 2)->nullable();
            $table->decimal("sugar", 8, 2)->nullable();

            $table->boolean("is_active")->default(true);

            $table->index("name", "idx_foods_name");
            $table->index("category", "idx_foods_category");

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('food');
    }
};
