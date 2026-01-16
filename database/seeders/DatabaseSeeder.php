<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\App;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Routes to the appropriate seeder based on environment:
     * - Production: Seeds only master/reference data
     * - Development/Local: Seeds master data + test users + sample data
     */
    public function run(): void
    {
        if (App::environment('production')) {
            $this->call(ProductionSeeder::class);
        } else {
            $this->call(DevelopmentSeeder::class);
        }
    }
}
