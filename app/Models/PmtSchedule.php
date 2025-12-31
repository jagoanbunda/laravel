<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PmtSchedule extends Model
{
   /** @use HasFactory<\Database\Factories\PmtScheduleFactory> */
   use HasFactory;

   public $timestamps = false;

   /**
    * The attributes that are mass assignable.
    *
    * @var list<string>
    */
   protected $fillable = [
      'child_id',
      'menu_id',
      'scheduled_date',
   ];

   /**
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
   protected function casts(): array
   {
      return [
         'scheduled_date' => 'date',
         'created_at' => 'datetime',
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
    * Get the menu.
    */
   public function menu(): BelongsTo
   {
      return $this->belongsTo(PmtMenu::class, 'menu_id');
   }

   /**
    * Get the log for this schedule.
    */
   public function log(): HasOne
   {
      return $this->hasOne(PmtLog::class, 'schedule_id');
   }

   /**
    * Check if logged.
    */
   public function getIsLoggedAttribute(): bool
   {
      return $this->log()->exists();
   }
}
