<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FoodLogItem extends Model
{
   /** @use HasFactory<\Database\Factories\FoodLogItemFactory> */
   use HasFactory;

   public $timestamps = false;

   /**
    * The attributes that are mass assignable.
    *
    * @var list<string>
    */
   protected $fillable = [
      'food_log_id',
      'food_id',
      'quantity',
      'serving_size',
      'calories',
      'protein',
      'fat',
      'carbohydrate',
   ];

   /**
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
   protected function casts(): array
   {
      return [
         'quantity' => 'decimal:2',
         'serving_size' => 'decimal:2',
         'calories' => 'decimal:2',
         'protein' => 'decimal:2',
         'fat' => 'decimal:2',
         'carbohydrate' => 'decimal:2',
         'created_at' => 'datetime',
      ];
   }

   /**
    * Get the food log.
    */
   public function foodLog(): BelongsTo
   {
      return $this->belongsTo(FoodLog::class);
   }

   /**
    * Get the food.
    */
   public function food(): BelongsTo
   {
      return $this->belongsTo(Food::class);
   }

   /**
    * Calculate nutrition from food and quantity.
    */
   public function calculateNutrition(): void
   {
      $food = $this->food;
      $multiplier = ($this->serving_size / $food->serving_size) * $this->quantity;

      $this->calories = $food->calories * $multiplier;
      $this->protein = $food->protein * $multiplier;
      $this->fat = $food->fat * $multiplier;
      $this->carbohydrate = $food->carbohydrate * $multiplier;
   }
}
