<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Child extends Model
{
    /** @use HasFactory<\Database\Factories\ChildFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'children';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'birthday',
        'gender',
        'avatar_url',
        'birth_weight',
        'birth_height',
        'head_circumference',
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
            'birthday' => 'date',
            'birth_weight' => 'decimal:2',
            'birth_height' => 'decimal:2',
            'head_circumference' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the parent user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get food logs for this child.
     */
    public function foodLogs(): HasMany
    {
        return $this->hasMany(FoodLog::class);
    }

    /**
     * Get anthropometry measurements for this child.
     */
    public function anthropometryMeasurements(): HasMany
    {
        return $this->hasMany(AnthropometryMeasurement::class);
    }

    /**
     * Get ASQ-3 screenings for this child.
     */
    public function asq3Screenings(): HasMany
    {
        return $this->hasMany(Asq3Screening::class);
    }

    /**
     * Get PMT schedules for this child.
     */
    public function pmtSchedules(): HasMany
    {
        return $this->hasMany(PmtSchedule::class);
    }

    /**
     * Get the age in months.
     */
    public function getAgeInMonthsAttribute(): int
    {
        return $this->birthday->diffInMonths(now());
    }

    /**
     * Get the age in days.
     */
    public function getAgeInDaysAttribute(): int
    {
        return $this->birthday->diffInDays(now());
    }
}
