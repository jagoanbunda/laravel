<?php

namespace Database\Factories;

use App\Models\AnthropometryMeasurement;
use App\Models\Child;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AnthropometryMeasurement>
 */
class AnthropometryMeasurementFactory extends Factory
{
   /**
    * Define the model's default state.
    *
    * @return array<string, mixed>
    */
   public function definition(): array
   {
      $locations = ['posyandu', 'home', 'clinic', 'hospital', 'other'];

      return [
         'child_id' => Child::factory(),
         'measurement_date' => fake()->dateTimeBetween('-1 year', 'now'),
         'weight' => fake()->randomFloat(2, 3, 25),
         'height' => fake()->randomFloat(2, 45, 120),
         'head_circumference' => fake()->randomFloat(2, 32, 52),
         'is_lying' => fake()->boolean(30),
         'measurement_location' => fake()->randomElement($locations),
         'weight_for_age_zscore' => fake()->randomFloat(2, -3, 3),
         'height_for_age_zscore' => fake()->randomFloat(2, -3, 3),
         'weight_for_height_zscore' => fake()->randomFloat(2, -3, 3),
         'bmi_for_age_zscore' => fake()->randomFloat(2, -3, 3),
         'head_circumference_zscore' => fake()->randomFloat(2, -3, 3),
         'nutritional_status' => fake()->randomElement(['normal', 'underweight', 'overweight']),
         'stunting_status' => fake()->randomElement(['normal', 'stunted']),
         'wasting_status' => fake()->randomElement(['normal', 'wasted']),
         'notes' => fake()->optional(0.2)->sentence(),
      ];
   }

   /**
    * Create a normal measurement.
    */
   public function normal(): static
   {
      return $this->state(fn(array $attributes) => [
         'weight_for_age_zscore' => fake()->randomFloat(2, -1, 1),
         'height_for_age_zscore' => fake()->randomFloat(2, -1, 1),
         'weight_for_height_zscore' => fake()->randomFloat(2, -1, 1),
         'nutritional_status' => 'normal',
         'stunting_status' => 'normal',
         'wasting_status' => 'normal',
      ]);
   }

   /**
    * Create a stunted measurement.
    */
   public function stunted(): static
   {
      return $this->state(fn(array $attributes) => [
         'height_for_age_zscore' => fake()->randomFloat(2, -3, -2),
         'stunting_status' => 'stunted',
      ]);
   }

   /**
    * Create a measurement at posyandu.
    */
   public function atPosyandu(): static
   {
      return $this->state(fn(array $attributes) => [
         'measurement_location' => 'posyandu',
      ]);
   }
}
