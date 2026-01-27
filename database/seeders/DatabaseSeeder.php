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
     * - Production/Staging: Seeds only master/reference data + admin nakes user
     * - Development/Local: Seeds master data + test parents, children, sample data
     */
    public function run(): void
    {
        if (App::environment(['production', 'staging'])) {
            $this->call(ProductionSeeder::class);
        } else {
            $this->call(DevelopmentSeeder::class);
        }
    }
}
