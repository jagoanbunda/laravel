<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Child;
use App\Models\Food;
use App\Models\FoodLog;
use App\Models\FoodLogItem;
use App\Models\AnthropometryMeasurement;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed master data first
        $this->call([
            Asq3DomainSeeder::class,
            Asq3AgeIntervalSeeder::class,
            FoodSeeder::class,
            PmtMenuSeeder::class,
        ]);

        // 2. Create test user
        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // 3. Create children for test user
        $children = Child::factory(2)->create([
            'user_id' => $testUser->id,
        ]);

        // 4. Create some sample data for each child
        foreach ($children as $child) {
            // Food logs
            $foods = Food::system()->inRandomOrder()->take(5)->get();

            for ($i = 0; $i < 5; $i++) {
                $foodLog = FoodLog::factory()->create([
                    'child_id' => $child->id,
                    'log_date' => now()->subDays($i),
                ]);

                // Add items to food log
                foreach ($foods->random(rand(1, 3)) as $food) {
                    FoodLogItem::factory()->create([
                        'food_log_id' => $foodLog->id,
                        'food_id' => $food->id,
                    ]);
                }

                // Calculate totals
                $foodLog->calculateTotals();
            }

            // Anthropometry measurements
            AnthropometryMeasurement::factory(3)->create([
                'child_id' => $child->id,
            ]);
        }

        // 5. Create additional users with children for testing
        User::factory(5)
            ->has(Child::factory()->count(rand(1, 3)))
            ->create();
    }
}
