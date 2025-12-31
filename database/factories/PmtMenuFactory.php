<?php

namespace Database\Factories;

use App\Models\PmtMenu;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PmtMenu>
 */
class PmtMenuFactory extends Factory
{
   /**
    * Define the model's default state.
    *
    * @return array<string, mixed>
    */
   public function definition(): array
   {
      $menus = [
         'Bubur Kacang Hijau',
         'Biskuit PMT',
         'Susu Fortifikasi',
         'Bubur Tim Ayam',
         'Nugget Ikan',
         'Puding Susu',
         'Sereal Fortifikasi',
         'Roti Gandum Telur',
      ];

      return [
         'name' => fake()->randomElement($menus),
         'description' => fake()->sentence(10),
         'image_url' => null,
         'calories' => fake()->randomFloat(2, 100, 400),
         'protein' => fake()->randomFloat(2, 5, 20),
         'min_age_months' => 6,
         'max_age_months' => 60,
         'is_active' => true,
      ];
   }

   /**
    * Create a menu for infants (6-12 months).
    */
   public function forInfants(): static
   {
      return $this->state(fn(array $attributes) => [
         'min_age_months' => 6,
         'max_age_months' => 12,
      ]);
   }

   /**
    * Create a menu for toddlers (12-36 months).
    */
   public function forToddlers(): static
   {
      return $this->state(fn(array $attributes) => [
         'min_age_months' => 12,
         'max_age_months' => 36,
      ]);
   }

   /**
    * Create an inactive menu.
    */
   public function inactive(): static
   {
      return $this->state(fn(array $attributes) => [
         'is_active' => false,
      ]);
   }
}
