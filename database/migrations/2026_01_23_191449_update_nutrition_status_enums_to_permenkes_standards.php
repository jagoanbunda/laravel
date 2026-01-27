<?php

use App\Models\AnthropometryMeasurement;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Update nutrition status enums to align with Permenkes RI standards.
 *
 * Changes:
 * - nutritional_status: Replace 'overweight', 'obese' with 'risk_overweight'
 * - wasting_status: Add 'risk_overweight' between 'normal' and 'overweight'
 *
 * Note: This migration is database-agnostic (works with SQLite and MySQL).
 * For SQLite, enum columns are stored as TEXT so we only update the data values.
 * For MySQL, Laravel's change() rebuilds the column with new enum values.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if ($this->isMysql()) {
            Schema::table('anthropometry_measurements', function (Blueprint $table) {
                $table->enum('nutritional_status', [
                    'severely_underweight',
                    'underweight',
                    'normal',
                    'risk_overweight',
                    'overweight',
                    'obese',
                ])->nullable()->change();

                $table->enum('wasting_status', [
                    'severely_wasted',
                    'wasted',
                    'normal',
                    'risk_overweight',
                    'overweight',
                    'obese',
                ])->nullable()->change();
            });
        }

        AnthropometryMeasurement::query()
            ->whereIn('nutritional_status', ['overweight', 'obese'])
            ->update(['nutritional_status' => 'risk_overweight']);

        if ($this->isMysql()) {
            Schema::table('anthropometry_measurements', function (Blueprint $table) {
                $table->enum('nutritional_status', [
                    'severely_underweight',
                    'underweight',
                    'normal',
                    'risk_overweight',
                ])->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if ($this->isMysql()) {
            Schema::table('anthropometry_measurements', function (Blueprint $table) {
                $table->enum('nutritional_status', [
                    'severely_underweight',
                    'underweight',
                    'normal',
                    'risk_overweight',
                    'overweight',
                    'obese',
                ])->nullable()->change();
            });
        }

        AnthropometryMeasurement::query()
            ->where('nutritional_status', 'risk_overweight')
            ->update(['nutritional_status' => 'overweight']);

        AnthropometryMeasurement::query()
            ->where('wasting_status', 'risk_overweight')
            ->update(['wasting_status' => 'overweight']);

        if ($this->isMysql()) {
            Schema::table('anthropometry_measurements', function (Blueprint $table) {
                $table->enum('nutritional_status', [
                    'severely_underweight',
                    'underweight',
                    'normal',
                    'overweight',
                    'obese',
                ])->nullable()->change();

                $table->enum('wasting_status', [
                    'severely_wasted',
                    'wasted',
                    'normal',
                    'overweight',
                    'obese',
                ])->nullable()->change();
            });
        }
    }

    private function isMysql(): bool
    {
        return in_array(
            Schema::getConnection()->getDriverName(),
            ['mysql', 'mariadb']
        );
    }
};
