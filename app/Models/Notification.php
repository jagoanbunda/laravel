<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
   /** @use HasFactory<\Database\Factories\NotificationFactory> */
   use HasFactory;

   public $timestamps = false;

   /**
    * The attributes that are mass assignable.
    *
    * @var list<string>
    */
   protected $fillable = [
      'user_id',
      'type',
      'title',
      'body',
      'data',
      'read_at',
   ];

   /**
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
   protected function casts(): array
   {
      return [
         'data' => 'array',
         'read_at' => 'datetime',
         'created_at' => 'datetime',
      ];
   }

   /**
    * Get the user.
    */
   public function user(): BelongsTo
   {
      return $this->belongsTo(User::class);
   }

   /**
    * Scope for unread notifications.
    */
   public function scopeUnread($query)
   {
      return $query->whereNull('read_at');
   }

   /**
    * Scope for read notifications.
    */
   public function scopeRead($query)
   {
      return $query->whereNotNull('read_at');
   }

   /**
    * Mark as read.
    */
   public function markAsRead(): void
   {
      if (is_null($this->read_at)) {
         $this->read_at = now();
         $this->save();
      }
   }

   /**
    * Check if read.
    */
   public function getIsReadAttribute(): bool
   {
      return !is_null($this->read_at);
   }
}
