<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PmtMenu extends Model
{
   /** @use HasFactory<\Database\Factories\PmtMenuFactory> */
   use HasFactory;

   /**
    * The attributes that are mass assignable.
    *
    * @var list<string>
    */
   protected $fillable = [
      'name',
      'description',
      'image_url',
      'calories',
      'protein',
      'min_age_months',
      'max_age_months',
      'is_active',
   ];

   /**
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
   protected function casts(): array
   {
      return [
         'calories' => 'decimal:2',
         'protein' => 'decimal:2',
         'min_age_months' => 'integer',
         'max_age_months' => 'integer',
         'is_active' => 'boolean',
      ];
   }

   /**
    * Get schedules for this menu.
    */
   public function schedules(): HasMany
   {
      return $this->hasMany(PmtSchedule::class, 'menu_id');
   }

   /**
    * Scope for active menus.
    */
   public function scopeActive($query)
   {
      return $query->where('is_active', true);
   }

   /**
    * Scope for menus suitable for given age.
    */
   public function scopeForAge($query, int $ageMonths)
   {
      return $query->where(function ($q) use ($ageMonths) {
         $q->where(function ($inner) use ($ageMonths) {
            $inner->whereNull('min_age_months')
               ->orWhere('min_age_months', '<=', $ageMonths);
         })->where(function ($inner) use ($ageMonths) {
            $inner->whereNull('max_age_months')
               ->orWhere('max_age_months', '>=', $ageMonths);
         });
      });
   }
}
