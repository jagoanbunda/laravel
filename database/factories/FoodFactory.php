<?php

namespace Database\Factories;

use App\Models\Food;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Food>
 */
class FoodFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['Karbohidrat', 'Protein', 'Sayuran', 'Buah', 'Susu', 'Snack'];

        return [
            'name' => fake()->randomElement([
                'Nasi Putih',
                'Nasi Merah',
                'Bubur Ayam',
                'Telur Rebus',
                'Ayam Goreng',
                'Ikan Salmon',
                'Tempe Goreng',
                'Tahu Kukus',
                'Wortel Rebus',
                'Bayam Kukus',
                'Brokoli',
                'Pisang',
                'Apel',
                'Jeruk',
                'Susu UHT',
                'Yogurt'
            ]),
            'category' => fake()->randomElement($categories),
            'icon' => 'restaurant',
            'serving_size' => 100,
            'calories' => fake()->randomFloat(2, 50, 400),
            'protein' => fake()->randomFloat(2, 1, 30),
            'fat' => fake()->randomFloat(2, 0.5, 20),
            'carbohydrate' => fake()->randomFloat(2, 5, 50),
            'fiber' => fake()->randomFloat(2, 0, 10),
            'sugar' => fake()->randomFloat(2, 0, 15),
            'is_active' => true,
            'is_system' => true,
            'created_by' => null,
        ];
    }

    /**
     * Create a user-created food.
     */
    public function userCreated(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_system' => false,
            'created_by' => User::factory(),
        ]);
    }

    /**
     * Create a protein-rich food.
     */
    public function protein(): static
    {
        return $this->state(fn(array $attributes) => [
            'category' => 'Protein',
            'protein' => fake()->randomFloat(2, 15, 30),
        ]);
    }

    /**
     * Create a carb-rich food.
     */
    public function carbohydrate(): static
    {
        return $this->state(fn(array $attributes) => [
            'category' => 'Karbohidrat',
            'carbohydrate' => fake()->randomFloat(2, 30, 60),
        ]);
    }
}
