<?php

namespace Database\Factories;

use App\Models\Food;
use App\Models\FoodLog;
use App\Models\FoodLogItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FoodLogItem>
 */
class FoodLogItemFactory extends Factory
{
   /**
    * Define the model's default state.
    *
    * @return array<string, mixed>
    */
   public function definition(): array
   {
      $quantity = fake()->randomFloat(2, 0.5, 2);
      $servingSize = 100;

      return [
         'food_log_id' => FoodLog::factory(),
         'food_id' => Food::factory(),
         'quantity' => $quantity,
         'serving_size' => $servingSize,
         'calories' => fake()->randomFloat(2, 50, 300),
         'protein' => fake()->randomFloat(2, 2, 20),
         'fat' => fake()->randomFloat(2, 1, 15),
         'carbohydrate' => fake()->randomFloat(2, 5, 40),
      ];
   }

   /**
    * Configure the model factory.
    */
   public function configure(): static
   {
      return $this->afterMaking(function (FoodLogItem $item) {
         // Calculate nutrition based on food if available
         if ($item->food_id && !$item->calories) {
            $item->calculateNutrition();
         }
      });
   }
}
