<?php

namespace Database\Factories;

use App\Models\PmtLog;
use App\Models\PmtSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PmtLog>
 */
class PmtLogFactory extends Factory
{
   /**
    * Define the model's default state.
    *
    * @return array<string, mixed>
    */
   public function definition(): array
   {
      return [
         'schedule_id' => PmtSchedule::factory(),
         'portion' => fake()->randomElement(['habis', 'half', 'quarter', 'none']),
         'photo_url' => null,
         'notes' => fake()->optional(0.3)->sentence(),
      ];
   }

   /**
    * Create a log with full portion.
    */
   public function full(): static
   {
      return $this->state(fn(array $attributes) => [
         'portion' => 'habis',
      ]);
   }

   /**
    * Create a log with half portion.
    */
   public function half(): static
   {
      return $this->state(fn(array $attributes) => [
         'portion' => 'half',
      ]);
   }

   /**
    * Create a log with no consumption.
    */
   public function none(): static
   {
      return $this->state(fn(array $attributes) => [
         'portion' => 'none',
      ]);
   }

   /**
    * Create a log with photo.
    */
   public function withPhoto(): static
   {
      return $this->state(fn(array $attributes) => [
         'photo_url' => 'https://example.com/photos/' . fake()->uuid() . '.jpg',
      ]);
   }
}
