<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asq3ScreeningAnswer extends Model
{
   public $timestamps = false;

   /**
    * The attributes that are mass assignable.
    *
    * @var list<string>
    */
   protected $fillable = [
      'screening_id',
      'question_id',
      'answer',
      'score',
   ];

   /**
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
   protected function casts(): array
   {
      return [
         'score' => 'integer',
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
    * Get the question.
    */
   public function question(): BelongsTo
   {
      return $this->belongsTo(Asq3Question::class, 'question_id');
   }

   /**
    * Boot method to calculate score automatically.
    */
   protected static function boot()
   {
      parent::boot();

      static::creating(function ($answer) {
         if (empty($answer->score) && $answer->question_id && $answer->answer) {
            $question = Asq3Question::find($answer->question_id);
            if ($question) {
               $answer->score = $question->getScoreForAnswer($answer->answer);
            }
         }
      });
   }
}
