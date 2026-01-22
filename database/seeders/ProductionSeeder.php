<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProductionSeeder extends Seeder
{
    /**
     * Seed master/reference data required for production.
     *
     * This seeder contains only essential data that must exist
     * for the application to function correctly.
     */
    public function run(): void
    {
        $this->call([
            Asq3DomainSeeder::class,
            Asq3AgeIntervalSeeder::class,
            Asq3QuestionSeeder::class,
            FoodSeeder::class,
            PmtMenuSeeder::class,
            NakesUserSeeder::class,
        ]);
    }
}
