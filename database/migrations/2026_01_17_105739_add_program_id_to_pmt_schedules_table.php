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
        Schema::table('pmt_schedules', function (Blueprint $table) {
            $table->foreignId('program_id')->nullable()->after('id')
                ->constrained('pmt_programs')->cascadeOnDelete();

            $table->index(['program_id', 'scheduled_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pmt_schedules', function (Blueprint $table) {
            $table->dropForeign(['program_id']);
            $table->dropIndex(['program_id', 'scheduled_date']);
            $table->dropColumn('program_id');
        });
    }
};
