<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asq3Recommendation extends Model
{
   public $timestamps = false;

   /**
    * The attributes that are mass assignable.
    *
    * @var list<string>
    */
   protected $fillable = [
      'domain_id',
      'age_interval_id',
      'recommendation_text',
      'priority',
   ];

   /**
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
   protected function casts(): array
   {
      return [
         'priority' => 'integer',
         'created_at' => 'datetime',
      ];
   }

   /**
    * Get the domain.
    */
   public function domain(): BelongsTo
   {
      return $this->belongsTo(Asq3Domain::class, 'domain_id');
   }

   /**
    * Get the age interval.
    */
   public function ageInterval(): BelongsTo
   {
      return $this->belongsTo(Asq3AgeInterval::class, 'age_interval_id');
   }

   /**
    * Scope for recommendations by domain.
    */
   public function scopeForDomain($query, int $domainId)
   {
      return $query->where('domain_id', $domainId);
   }

   /**
    * Scope for recommendations by age interval.
    */
   public function scopeForAgeInterval($query, ?int $ageIntervalId)
   {
      return $query->where(function ($q) use ($ageIntervalId) {
         $q->whereNull('age_interval_id')
            ->orWhere('age_interval_id', $ageIntervalId);
      });
   }
}
