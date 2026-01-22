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
        Schema::table('foods', function (Blueprint $table) {
            $table->tinyInteger('min_age_months')->unsigned()->nullable()->after('sugar');
            $table->tinyInteger('max_age_months')->unsigned()->nullable()->after('min_age_months');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('foods', function (Blueprint $table) {
            $table->dropColumn(['min_age_months', 'max_age_months']);
        });
    }
};
