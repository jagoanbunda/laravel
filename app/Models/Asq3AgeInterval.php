<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asq3AgeInterval extends Model
{
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'age_months',
        'min_age_months',
        'max_age_months',
        'age_label',
        'min_age_days',
        'max_age_days',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'age_months' => 'integer',
            'min_age_days' => 'integer',
            'max_age_days' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Get cutoff scores for this age interval.
     */
    public function cutoffScores(): HasMany
    {
        return $this->hasMany(Asq3CutoffScore::class, 'age_interval_id');
    }

    /**
     * Get questions for this age interval.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Asq3Question::class, 'age_interval_id');
    }

    /**
     * Get screenings for this age interval.
     */
    public function screenings(): HasMany
    {
        return $this->hasMany(Asq3Screening::class, 'age_interval_id');
    }

    /**
     * Get recommendations for this age interval.
     */
    public function recommendations(): HasMany
    {
        return $this->hasMany(Asq3Recommendation::class, 'age_interval_id');
    }

    /**
     * Find appropriate interval for given age in days.
     */
    public static function findByAgeDays(int $ageDays): ?self
    {
        return static::where('min_age_days', '<=', $ageDays)
            ->where('max_age_days', '>=', $ageDays)
            ->first();
    }
}
