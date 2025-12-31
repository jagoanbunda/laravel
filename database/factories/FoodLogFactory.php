<?php

namespace Database\Factories;

use App\Models\Child;
use App\Models\FoodLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FoodLog>
 */
class FoodLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'child_id' => Child::factory(),
            'log_date' => fake()->dateTimeBetween('-1 month', 'now'),
            'meal_time' => fake()->randomElement(['breakfast', 'lunch', 'dinner', 'snack']),
            'total_calories' => fake()->randomFloat(2, 100, 500),
            'total_protein' => fake()->randomFloat(2, 5, 30),
            'total_fat' => fake()->randomFloat(2, 3, 20),
            'total_carbohydrate' => fake()->randomFloat(2, 10, 60),
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }

    /**
     * Create a breakfast log.
     */
    public function breakfast(): static
    {
        return $this->state(fn(array $attributes) => [
            'meal_time' => 'breakfast',
        ]);
    }

    /**
     * Create a lunch log.
     */
    public function lunch(): static
    {
        return $this->state(fn(array $attributes) => [
            'meal_time' => 'lunch',
        ]);
    }

    /**
     * Create a dinner log.
     */
    public function dinner(): static
    {
        return $this->state(fn(array $attributes) => [
            'meal_time' => 'dinner',
        ]);
    }

    /**
     * Create a snack log.
     */
    public function snack(): static
    {
        return $this->state(fn(array $attributes) => [
            'meal_time' => 'snack',
        ]);
    }
}
