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
        Schema::table('children', function (Blueprint $table) {
            $table->decimal('birth_weight', 5, 2)->nullable()->change();
            $table->decimal('birth_height', 5, 2)->nullable()->change();
            $table->decimal('head_circumference', 5, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->decimal('birth_weight', 5, 2)->nullable(false)->change();
            $table->decimal('birth_height', 5, 2)->nullable(false)->change();
            $table->decimal('head_circumference', 5, 2)->nullable(false)->change();
        });
    }
};
