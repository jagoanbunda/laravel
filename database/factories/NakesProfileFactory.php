<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NakesProfile>
 */
class NakesProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nik' => fake()->numerify('################'),
            'puskesmas_id' => null,
            'position' => fake()->randomElement(['Bidan', 'Perawat', 'Dokter', 'Ahli Gizi']),
            'verified_at' => now(),
        ];
    }

    /**
     * Indicate that the profile is unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'verified_at' => null,
        ]);
    }
}
