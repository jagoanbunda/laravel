<?php

namespace Database\Seeders;

use App\Models\AnthropometryMeasurement;
use App\Models\Child;
use App\Models\Food;
use App\Models\FoodLog;
use App\Models\FoodLogItem;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DevelopmentSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed sample data for development and testing.
     *
     * This seeder creates test users, children, and sample
     * transactional data for local development.
     */
    public function run(): void
    {
        // 1. Seed master data first
        $this->call(ProductionSeeder::class);

        // 2. Create test user (parent for API testing)
        $testUser = User::factory()->asParent()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // 3. Create children for test user
        $children = Child::factory(2)->create([
            'user_id' => $testUser->id,
        ]);

        // 4. Create some sample data for each child
        foreach ($children as $child) {
            $this->createSampleDataForChild($child);
        }

        // 5. Create additional users with children for testing
        User::factory(5)
            ->has(Child::factory()->count(rand(1, 3)))
            ->create();

        // 6. Seed PMT programs with schedules and logs (after children exist)
        $this->call([
            PmtProgramSeeder::class,
            PmtLogSeeder::class,
            Asq3ScreeningSeeder::class,
        ]);
    }

    /**
     * Create sample food logs and measurements for a child.
     */
    private function createSampleDataForChild(Child $child): void
    {
        $foods = Food::system()->inRandomOrder()->take(5)->get();

        for ($i = 0; $i < 5; $i++) {
            $foodLog = FoodLog::factory()->create([
                'child_id' => $child->id,
                'log_date' => now()->subDays($i),
            ]);

            foreach ($foods->random(rand(1, 3)) as $food) {
                FoodLogItem::factory()->create([
                    'food_log_id' => $foodLog->id,
                    'food_id' => $food->id,
                ]);
            }

            $foodLog->calculateTotals();
        }

        AnthropometryMeasurement::factory(3)->create([
            'child_id' => $child->id,
        ]);
    }
}
