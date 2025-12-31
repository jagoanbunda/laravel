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
        Schema::create('children', function (Blueprint $table) {
            $table->id();
            $table->foreignId("user_id")
                ->nullable()
                ->comment("foreign to users table with the role 'parent'")
                ->constrained("users")
                ->nullOnDelete()->cascadeOnUpdate();
            $table->string("name");
            $table->date("birthday");
            $table->enum("gender", ["male", "female", "other"]);
            $table->string("avatar_url")->nullable();
            $table->decimal("birth_weight", 5, 2);
            $table->decimal("birth_height", 5, 2);
            $table->decimal("head_circumference", 5, 2);
            $table->boolean("is_active")->default(true);
            $table->text("note")->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('children');
    }
};
