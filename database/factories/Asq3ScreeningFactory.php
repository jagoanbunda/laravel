<?php

namespace Database\Factories;

use App\Models\Asq3AgeInterval;
use App\Models\Asq3Screening;
use App\Models\Child;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Asq3Screening>
 */
class Asq3ScreeningFactory extends Factory
{
   /**
    * Define the model's default state.
    *
    * @return array<string, mixed>
    */
   public function definition(): array
   {
      $ageMonths = fake()->numberBetween(2, 60);
      $ageDays = $ageMonths * 30;

      return [
         'child_id' => Child::factory(),
         'age_interval_id' => Asq3AgeInterval::inRandomOrder()->first()?->id ?? 1,
         'screening_date' => fake()->dateTimeBetween('-6 months', 'now'),
         'age_at_screening_months' => $ageMonths,
         'age_at_screening_days' => $ageDays,
         'status' => 'in_progress',
         'completed_at' => null,
         'overall_status' => null,
         'notes' => fake()->optional(0.2)->sentence(),
      ];
   }

   /**
    * Create a completed screening.
    */
   public function completed(): static
   {
      return $this->state(fn(array $attributes) => [
         'status' => 'completed',
         'completed_at' => fake()->dateTimeBetween('-1 month', 'now'),
         'overall_status' => fake()->randomElement(['sesuai', 'pantau', 'perlu_rujukan']),
      ]);
   }

   /**
    * Create a cancelled screening.
    */
   public function cancelled(): static
   {
      return $this->state(fn(array $attributes) => [
         'status' => 'cancelled',
      ]);
   }

   /**
    * Create a screening with normal results.
    */
   public function normalResults(): static
   {
      return $this->state(fn(array $attributes) => [
         'status' => 'completed',
         'completed_at' => now(),
         'overall_status' => 'sesuai',
      ]);
   }
}
