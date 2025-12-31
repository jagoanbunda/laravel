<?php

namespace Database\Factories;

use App\Models\Child;
use App\Models\PmtMenu;
use App\Models\PmtSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PmtSchedule>
 */
class PmtScheduleFactory extends Factory
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
         'menu_id' => PmtMenu::factory(),
         'scheduled_date' => fake()->dateTimeBetween('-1 month', '+1 month'),
      ];
   }

   /**
    * Create a schedule for today.
    */
   public function today(): static
   {
      return $this->state(fn(array $attributes) => [
         'scheduled_date' => now()->toDateString(),
      ]);
   }

   /**
    * Create a past schedule.
    */
   public function past(): static
   {
      return $this->state(fn(array $attributes) => [
         'scheduled_date' => fake()->dateTimeBetween('-1 month', '-1 day'),
      ]);
   }

   /**
    * Create a future schedule.
    */
   public function future(): static
   {
      return $this->state(fn(array $attributes) => [
         'scheduled_date' => fake()->dateTimeBetween('+1 day', '+1 month'),
      ]);
   }
}
