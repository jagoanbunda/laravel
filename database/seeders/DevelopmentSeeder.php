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
use Illuminate\Support\Collection;

class DevelopmentSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Food items grouped by category for realistic meal planning.
     *
     * @var array<string, Collection<int, Food>>
     */
    private array $foodsByCategory = [];

    /**
     * Indonesian notes for food logs.
     *
     * @var list<string>
     */
    private const MEAL_NOTES = [
        'Anak makan lahap',
        'Makan disuapi',
        'Kurang nafsu makan',
        'Habis semua',
        'Sisa sedikit',
        'Makan sendiri',
        'Minta tambah',
        'Agak rewel',
        'Makan sambil bermain',
        'Porsi dikurangi',
    ];

    /**
     * Breakfast patterns for different age groups.
     *
     * @var array<string, list<list<string>>>
     */
    private const BREAKFAST_PATTERNS = [
        'infant' => [
            ['Breastmilk'],
            ['susu bebelac'],
            ['susu dancow balita'],
            ['bubur nasi', 'susu sapi'],
        ],
        'toddler' => [
            ['bubur ayam'],
            ['nasi tim', 'telur dadar'],
            ['nasi tim ayam', 'susu dancow'],
            ['roti tawar', 'telur ceplok', 'susu sapi'],
            ['bubur nasi', 'telur ayam'],
            ['nasi tim bayam', 'susu dancow balita'],
            ['roti susu', 'buah pisang susu'],
        ],
        'child' => [
            ['nasi putih', 'telur dadar', 'susu sapi'],
            ['nasi goreng', 'telur ceplok'],
            ['bubur ayam', 'susu dancow'],
            ['roti tawar', 'telur goreng', 'susu segar'],
            ['nasi uduk', 'telur ayam', 'tempe goreng'],
            ['mie ayam'],
            ['nasi tim daging', 'susu dancow'],
        ],
    ];

    /**
     * Lunch/Dinner protein options.
     *
     * @var list<string>
     */
    private const PROTEINS = [
        'telur dadar',
        'telur ceplok',
        'telur goreng',
        'daging ayam',
        'daging ayam goreng',
        'ikan goreng',
        'ikan mas goreng',
        'ikan kembung goreng',
        'tempe goreng',
        'tahu goreng',
        'tempe bacem',
        'bakso daging sapi',
        'sate ayam',
        'ati ayam',
        'udang segar',
    ];

    /**
     * Vegetable options.
     *
     * @var list<string>
     */
    private const VEGETABLES = [
        'sayur bayam',
        'sayur sop',
        'sayur lodeh',
        'sayur asem',
        'sayur bayam wortel',
        'tumis kangkung belu',
        'tumis bayam belu',
        'tumis sawi',
        'bening bayam belu',
        'sayur bening campur',
    ];

    /**
     * Carbohydrate options.
     *
     * @var list<string>
     */
    private const CARBS = [
        'nasi putih',
        'nasi putih kukus',
        'nasi tim',
        'bubur nasi',
        'nasi uduk',
        'lontong',
    ];

    /**
     * Snack options by age group.
     *
     * @var array<string, list<list<string>>>
     */
    private const SNACK_PATTERNS = [
        'infant' => [
            ['Breastmilk'],
            ['susu bebelac'],
            ['buah pisang susu'],
        ],
        'toddler' => [
            ['buah pisang susu'],
            ['pepaya'],
            ['biskuit-yani', 'susu dancow balita'],
            ['roti manis'],
            ['apel'],
            ['susu dancow', 'nastar'],
        ],
        'child' => [
            ['buah pisang susu'],
            ['pepaya'],
            ['apel'],
            ['biskuit-yani', 'susu sapi'],
            ['roti coklat'],
            ['es krim walls'],
            ['cilok'],
            ['donat'],
            ['mangga golek'],
            ['semangka'],
        ],
    ];

    /**
     * Seed sample data for development and testing.
     *
     * Creates realistic food logs with 3 meals per day for 30 days,
     * age-appropriate foods, and weekly anthropometry measurements.
     */
    public function run(): void
    {
        $this->call(ProductionSeeder::class);

        $this->loadFoodsByCategory();

        $testUser = User::factory()->asParent()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $primaryChild = Child::factory()->toddler()->create([
            'user_id' => $testUser->id,
            'name' => 'Budi',
            'gender' => 'male',
        ]);

        $this->createRealisticDataForChild($primaryChild, 30);

        $secondUser = User::factory()->asParent()->create([
            'name' => 'Siti Rahayu',
            'email' => 'siti@example.com',
        ]);

        $secondChild = Child::factory()->create([
            'user_id' => $secondUser->id,
            'name' => 'Putri',
            'gender' => 'female',
            'birthday' => now()->subMonths(8),
        ]);

        $this->createRealisticDataForChild($secondChild, 30);

        $thirdUser = User::factory()->asParent()->create([
            'name' => 'Ahmad Hidayat',
            'email' => 'ahmad@example.com',
        ]);

        $thirdChild = Child::factory()->create([
            'user_id' => $thirdUser->id,
            'name' => 'Rizky',
            'gender' => 'male',
            'birthday' => now()->subYears(4),
        ]);

        $this->createRealisticDataForChild($thirdChild, 30);

        $this->call([
            PmtProgramSeeder::class,
            PmtLogSeeder::class,
            Asq3ScreeningSeeder::class,
        ]);
    }

    /**
     * Load foods from database grouped by category.
     */
    private function loadFoodsByCategory(): void
    {
        $foods = Food::query()->where('is_system', true)->where('is_active', true)->get();

        $this->foodsByCategory = $foods->groupBy('category')->toArray();
    }

    /**
     * Create realistic food logs and measurements for a child.
     */
    private function createRealisticDataForChild(Child $child, int $days): void
    {
        $ageGroup = $this->determineAgeGroup($child);

        for ($dayOffset = 0; $dayOffset < $days; $dayOffset++) {
            $logDate = now()->subDays($dayOffset)->startOfDay();

            if (fake()->boolean(90)) {
                $this->createMealLog($child, $logDate, 'breakfast', $ageGroup);
            }

            if (fake()->boolean(95)) {
                $this->createMealLog($child, $logDate, 'lunch', $ageGroup);
            }

            if (fake()->boolean(92)) {
                $this->createMealLog($child, $logDate, 'dinner', $ageGroup);
            }

            $snackChance = match ($ageGroup) {
                'infant' => 70,
                'toddler' => 50,
                'child' => 35,
            };

            if (fake()->boolean($snackChance)) {
                $this->createMealLog($child, $logDate, 'snack', $ageGroup);
            }
        }

        $weeklyMeasurements = (int) ceil($days / 7);
        for ($week = 0; $week < $weeklyMeasurements; $week++) {
            $measurementDate = now()->subWeeks($week);

            AnthropometryMeasurement::factory()->create([
                'child_id' => $child->id,
                'measurement_date' => $measurementDate,
            ]);
        }
    }

    /**
     * Determine age group based on child's age.
     */
    private function determineAgeGroup(Child $child): string
    {
        $ageInMonths = $child->age_in_months ?? 24;

        if ($ageInMonths < 12) {
            return 'infant';
        }

        if ($ageInMonths < 36) {
            return 'toddler';
        }

        return 'child';
    }

    /**
     * Create a meal log with appropriate food items.
     */
    private function createMealLog(Child $child, \DateTimeInterface $logDate, string $mealTime, string $ageGroup): void
    {
        $foodLog = FoodLog::factory()->create([
            'child_id' => $child->id,
            'log_date' => $logDate,
            'meal_time' => $mealTime,
            'notes' => fake()->boolean(25) ? fake()->randomElement(self::MEAL_NOTES) : null,
            'total_calories' => 0,
            'total_protein' => 0,
            'total_fat' => 0,
            'total_carbohydrate' => 0,
        ]);

        $foodNames = $this->selectFoodsForMeal($mealTime, $ageGroup);

        foreach ($foodNames as $foodName) {
            $food = $this->findFoodByName($foodName);

            if (! $food) {
                continue;
            }

            $quantity = $this->determineQuantity($mealTime, $ageGroup);
            $servingSize = $food->serving_size;
            $multiplier = $quantity;

            FoodLogItem::factory()->create([
                'food_log_id' => $foodLog->id,
                'food_id' => $food->id,
                'quantity' => $quantity,
                'serving_size' => $servingSize,
                'calories' => $food->calories * $multiplier,
                'protein' => $food->protein * $multiplier,
                'fat' => $food->fat * $multiplier,
                'carbohydrate' => $food->carbohydrate * $multiplier,
            ]);
        }

        $foodLog->calculateTotals();
    }

    /**
     * Select appropriate foods for a meal based on meal time and age group.
     *
     * @return list<string>
     */
    private function selectFoodsForMeal(string $mealTime, string $ageGroup): array
    {
        if ($mealTime === 'breakfast') {
            $patterns = self::BREAKFAST_PATTERNS[$ageGroup] ?? self::BREAKFAST_PATTERNS['toddler'];

            return fake()->randomElement($patterns);
        }

        if ($mealTime === 'snack') {
            $patterns = self::SNACK_PATTERNS[$ageGroup] ?? self::SNACK_PATTERNS['toddler'];

            return fake()->randomElement($patterns);
        }

        $foods = [];

        $foods[] = fake()->randomElement(self::CARBS);

        $proteinCount = $ageGroup === 'infant' ? 1 : fake()->numberBetween(1, 2);
        $selectedProteins = fake()->randomElements(self::PROTEINS, $proteinCount);
        $foods = array_merge($foods, $selectedProteins);

        if ($ageGroup !== 'infant' && fake()->boolean(75)) {
            $foods[] = fake()->randomElement(self::VEGETABLES);
        }

        if ($ageGroup !== 'infant' && fake()->boolean(30)) {
            $foods[] = fake()->randomElement(['susu sapi', 'susu dancow', 'susu dancow balita']);
        }

        return $foods;
    }

    /**
     * Find a food by name (case-insensitive partial match).
     */
    private function findFoodByName(string $name): ?Food
    {
        return Food::query()
            ->where('is_system', true)
            ->where('is_active', true)
            ->whereRaw('LOWER(name) LIKE ?', ['%'.strtolower($name).'%'])
            ->first();
    }

    /**
     * Determine portion quantity based on meal time and age group.
     */
    private function determineQuantity(string $mealTime, string $ageGroup): float
    {
        $baseQuantity = match ($ageGroup) {
            'infant' => fake()->randomFloat(2, 0.3, 0.6),
            'toddler' => fake()->randomFloat(2, 0.5, 0.8),
            'child' => fake()->randomFloat(2, 0.7, 1.2),
        };

        $mealMultiplier = match ($mealTime) {
            'breakfast' => 0.9,
            'lunch' => 1.0,
            'dinner' => 0.85,
            'snack' => 0.5,
            default => 1.0,
        };

        return round($baseQuantity * $mealMultiplier, 2);
    }
}
