<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asq3Screening extends Model
{
    /** @use HasFactory<\Database\Factories\Asq3ScreeningFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'child_id',
        'age_interval_id',
        'screening_date',
        'age_at_screening_months',
        'age_at_screening_days',
        'status',
        'completed_at',
        'overall_status',
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
            'screening_date' => 'date',
            'age_at_screening_months' => 'integer',
            'age_at_screening_days' => 'integer',
            'completed_at' => 'datetime',
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
     * Get the age interval.
     */
    public function ageInterval(): BelongsTo
    {
        return $this->belongsTo(Asq3AgeInterval::class, 'age_interval_id');
    }

    /**
     * Get the domain results for this screening.
     */
    public function domainResults(): HasMany
    {
        return $this->hasMany(Asq3ScreeningResult::class, 'screening_id');
    }

    /**
     * Get the answers for this screening.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(Asq3ScreeningAnswer::class, 'screening_id');
    }

    /**
     * Get results for this screening.
     */
    public function results(): HasMany
    {
        return $this->hasMany(Asq3ScreeningResult::class, 'screening_id');
    }

    /**
     * Get interventions for this screening.
     */
    public function interventions(): HasMany
    {
        return $this->hasMany(Asq3ScreeningIntervention::class, 'screening_id');
    }

    /**
     * Scope for completed screenings.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for in-progress screenings.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Complete the screening.
     */
    public function complete(): void
    {
        $this->status = 'completed';
        $this->completed_at = now();

        // Determine overall status based on results
        $worstStatus = $this->results()
            ->orderByRaw("FIELD(status, 'perlu_rujukan', 'pantau', 'sesuai')")
            ->first();

        $this->overall_status = $worstStatus?->status ?? 'sesuai';
        $this->save();
    }
}
