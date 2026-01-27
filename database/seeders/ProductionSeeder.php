<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProductionSeeder extends Seeder
{
    /**
     * Seed master/reference data required for production and staging.
     *
     * This seeder contains only essential data that must exist
     * for the application to function correctly:
     * - ASQ-3 domains, age intervals, cutoff scores, questions, recommendations
     * - Food database and PMT menu items
     * - Admin nakes user (with generated password)
     *
     * Note: No parent users, children, or sample data are created.
     */
    public function run(): void
    {
        $this->call([
            Asq3DomainSeeder::class,
            Asq3AgeIntervalSeeder::class,
            Asq3CutoffScoreSeeder::class,
            Asq3QuestionSeeder::class,
            Asq3RecommendationSeeder::class,
            FoodSeeder::class,
            PmtMenuSeeder::class,
            NakesUserSeeder::class,
        ]);
    }
}
