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
        Schema::table('users', function (Blueprint $table) {
            $table->string("phone", 20)->nullable();
            $table->string("avatar_url", 500)->nullable();
            $table->boolean("push_notifications")->default(false);
            $table->boolean("weekly_report")->default(false);
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn("phone", "avatar_url", "push_notifications", "weekly_report");
            $table->dropSoftDeletes();
        });
    }
};
