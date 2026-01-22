<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PmtLog extends Model
{
    /** @use HasFactory<\Database\Factories\PmtLogFactory> */
    use HasFactory;

    public $timestamps = false;

    const CREATED_AT = 'logged_at';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'schedule_id',
        'food_id',
        'portion',
        'photo_url',
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
            'logged_at' => 'datetime',
        ];
    }

    /**
     * Get the schedule.
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(PmtSchedule::class, 'schedule_id');
    }

    /**
     * Get the food.
     */
    public function food(): BelongsTo
    {
        return $this->belongsTo(Food::class);
    }

    /**
     * Get portion percentage.
     */
    public function getPortionPercentageAttribute(): int
    {
        return match ($this->portion) {
            'habis' => 100,
            'half' => 50,
            'quarter' => 25,
            'none' => 0,
            default => 0,
        };
    }

    /**
     * Get portion label in Indonesian.
     */
    public function getPortionLabelAttribute(): string
    {
        return match ($this->portion) {
            'habis' => 'Habis (100%)',
            'half' => 'Setengah (50%)',
            'quarter' => 'Seperempat (25%)',
            'none' => 'Tidak dimakan (0%)',
            default => $this->portion,
        };
    }
}
