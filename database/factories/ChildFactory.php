<?php

namespace Database\Factories;

use App\Models\Child;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Child>
 */
class ChildFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $gender = fake()->randomElement(['male', 'female']);

        return [
            'user_id' => User::factory(),
            'name' => $gender === 'male'
                ? fake('id_ID')->firstNameMale()
                : fake('id_ID')->firstNameFemale(),
            'birthday' => fake()->dateTimeBetween('-5 years', '-1 month'),
            'gender' => $gender,
            'avatar_url' => null,
            'birth_weight' => fake()->randomFloat(2, 2.5, 4.5),
            'birth_height' => fake()->randomFloat(2, 45, 55),
            'head_circumference' => fake()->randomFloat(2, 32, 38),
            'is_active' => true,
        ];
    }

    /**
     * Create a male child.
     */
    public function male(): static
    {
        return $this->state(fn(array $attributes) => [
            'gender' => 'male',
            'name' => fake('id_ID')->firstNameMale(),
        ]);
    }

    /**
     * Create a female child.
     */
    public function female(): static
    {
        return $this->state(fn(array $attributes) => [
            'gender' => 'female',
            'name' => fake('id_ID')->firstNameFemale(),
        ]);
    }

    /**
     * Create a newborn (0-1 month).
     */
    public function newborn(): static
    {
        return $this->state(fn(array $attributes) => [
            'birthday' => fake()->dateTimeBetween('-1 month', 'now'),
        ]);
    }

    /**
     * Create a toddler (1-3 years).
     */
    public function toddler(): static
    {
        return $this->state(fn(array $attributes) => [
            'birthday' => fake()->dateTimeBetween('-3 years', '-1 year'),
        ]);
    }
}
