<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asq3CutoffScore extends Model
{
   public $timestamps = false;

   /**
    * The attributes that are mass assignable.
    *
    * @var list<string>
    */
   protected $fillable = [
      'age_interval_id',
      'domain_id',
      'cutoff_score',
      'monitoring_score',
      'max_score',
   ];

   /**
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
   protected function casts(): array
   {
      return [
         'cutoff_score' => 'decimal:2',
         'monitoring_score' => 'decimal:2',
         'max_score' => 'decimal:2',
         'created_at' => 'datetime',
      ];
   }

   /**
    * Get the age interval.
    */
   public function ageInterval(): BelongsTo
   {
      return $this->belongsTo(Asq3AgeInterval::class, 'age_interval_id');
   }

   /**
    * Get the domain.
    */
   public function domain(): BelongsTo
   {
      return $this->belongsTo(Asq3Domain::class, 'domain_id');
   }

   /**
    * Evaluate score and return status.
    */
   public function evaluateScore(float $score): string
   {
      if ($score < $this->cutoff_score) {
         return 'perlu_rujukan';
      } elseif ($score < $this->monitoring_score) {
         return 'pantau';
      }
      return 'sesuai';
   }
}
