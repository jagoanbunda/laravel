<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asq3Question extends Model
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
      'question_number',
      'question_text',
      'hint_text',
      'image_url',
      'score_yes',
      'score_sometimes',
      'score_no',
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
         'question_number' => 'integer',
         'score_yes' => 'integer',
         'score_sometimes' => 'integer',
         'score_no' => 'integer',
         'display_order' => 'integer',
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
    * Get answers for this question.
    */
   public function answers(): HasMany
   {
      return $this->hasMany(Asq3ScreeningAnswer::class, 'question_id');
   }

   /**
    * Get score for given answer.
    */
   public function getScoreForAnswer(string $answer): int
   {
      return match ($answer) {
         'yes' => $this->score_yes,
         'sometimes' => $this->score_sometimes,
         'no' => $this->score_no,
         default => 0,
      };
   }
}
