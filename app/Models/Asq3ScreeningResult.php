<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asq3ScreeningResult extends Model
{
   public $timestamps = false;

   /**
    * The attributes that are mass assignable.
    *
    * @var list<string>
    */
   protected $fillable = [
      'screening_id',
      'domain_id',
      'total_score',
      'cutoff_score',
      'monitoring_score',
      'status',
   ];

   /**
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
   protected function casts(): array
   {
      return [
         'total_score' => 'decimal:2',
         'cutoff_score' => 'decimal:2',
         'monitoring_score' => 'decimal:2',
         'created_at' => 'datetime',
      ];
   }

   /**
    * Get the screening.
    */
   public function screening(): BelongsTo
   {
      return $this->belongsTo(Asq3Screening::class, 'screening_id');
   }

   /**
    * Get the domain.
    */
   public function domain(): BelongsTo
   {
      return $this->belongsTo(Asq3Domain::class, 'domain_id');
   }

   /**
    * Get status label in Indonesian.
    */
   public function getStatusLabelAttribute(): string
   {
      return match ($this->status) {
         'sesuai' => 'Perkembangan Sesuai',
         'pantau' => 'Perlu Pemantauan',
         'perlu_rujukan' => 'Perlu Rujukan',
         default => $this->status,
      };
   }
}
