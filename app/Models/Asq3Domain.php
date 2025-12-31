<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asq3Domain extends Model
{
   public $timestamps = false;

   /**
    * The attributes that are mass assignable.
    *
    * @var list<string>
    */
   protected $fillable = [
      'code',
      'name',
      'icon',
      'color',
      'display_order',
   ];

   /**
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
   protected function casts(): array
   {
      return [
         'display_order' => 'integer',
         'created_at' => 'datetime',
      ];
   }

   /**
    * Get cutoff scores for this domain.
    */
   public function cutoffScores(): HasMany
   {
      return $this->hasMany(Asq3CutoffScore::class, 'domain_id');
   }

   /**
    * Get questions for this domain.
    */
   public function questions(): HasMany
   {
      return $this->hasMany(Asq3Question::class, 'domain_id');
   }

   /**
    * Get screening results for this domain.
    */
   public function screeningResults(): HasMany
   {
      return $this->hasMany(Asq3ScreeningResult::class, 'domain_id');
   }

   /**
    * Get recommendations for this domain.
    */
   public function recommendations(): HasMany
   {
      return $this->hasMany(Asq3Recommendation::class, 'domain_id');
   }
}
