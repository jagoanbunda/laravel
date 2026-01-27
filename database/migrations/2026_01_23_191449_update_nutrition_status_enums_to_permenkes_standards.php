<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Update nutrition status enums to align with Permenkes RI standards.
 *
 * Changes:
 * - nutritional_status: Replace 'overweight', 'obese' with 'risk_overweight'
 * - wasting_status: Add 'risk_overweight' between 'normal' and 'overweight'
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Convert existing 'overweight' and 'obese' to 'risk_overweight' for nutritional_status
        DB::table('anthropometry_measurements')
            ->whereIn('nutritional_status', ['overweight', 'obese'])
            ->update(['nutritional_status' => null]);

        // Update nutritional_status enum
        DB::statement("ALTER TABLE anthropometry_measurements MODIFY COLUMN nutritional_status ENUM('severely_underweight', 'underweight', 'normal', 'risk_overweight') NULL");

        // Update wasting_status enum to include risk_overweight
        DB::statement("ALTER TABLE anthropometry_measurements MODIFY COLUMN wasting_status ENUM('severely_wasted', 'wasted', 'normal', 'risk_overweight', 'overweight', 'obese') NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert nutritional_status enum
        DB::statement("ALTER TABLE anthropometry_measurements MODIFY COLUMN nutritional_status ENUM('severely_underweight', 'underweight', 'normal', 'overweight', 'obese') NULL");

        // Revert wasting_status enum
        DB::statement("ALTER TABLE anthropometry_measurements MODIFY COLUMN wasting_status ENUM('severely_wasted', 'wasted', 'normal', 'overweight', 'obese') NULL");
    }
};
