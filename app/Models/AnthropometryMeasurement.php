<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnthropometryMeasurement extends Model
{
   /** @use HasFactory<\Database\Factories\AnthropometryMeasurementFactory> */
   use HasFactory;

   /**
    * The attributes that are mass assignable.
    *
    * @var list<string>
    */
   protected $fillable = [
      'child_id',
      'measurement_date',
      'weight',
      'height',
      'head_circumference',
      'is_lying',
      'measurement_location',
      'weight_for_age_zscore',
      'height_for_age_zscore',
      'weight_for_height_zscore',
      'bmi_for_age_zscore',
      'head_circumference_zscore',
      'nutritional_status',
      'stunting_status',
      'wasting_status',
      'notes',
   ];

   /**
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
   protected function casts(): array
   {
      return [
         'measurement_date' => 'date',
         'weight' => 'decimal:2',
         'height' => 'decimal:2',
         'head_circumference' => 'decimal:2',
         'is_lying' => 'boolean',
         'weight_for_age_zscore' => 'decimal:2',
         'height_for_age_zscore' => 'decimal:2',
         'weight_for_height_zscore' => 'decimal:2',
         'bmi_for_age_zscore' => 'decimal:2',
         'head_circumference_zscore' => 'decimal:2',
      ];
   }

   /**
    * Get the child.
    */
   public function child(): BelongsTo
   {
      return $this->belongsTo(Child::class);
   }

   /**
    * Calculate BMI.
    */
   public function getBmiAttribute(): ?float
   {
      if ($this->weight && $this->height) {
         $heightInMeters = $this->height / 100;
         return round($this->weight / ($heightInMeters * $heightInMeters), 2);
      }
      return null;
   }
}
