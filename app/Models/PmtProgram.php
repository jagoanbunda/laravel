<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PmtProgram extends Model
{
    /** @use HasFactory<\Database\Factories\PmtProgramFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'child_id',
        'start_date',
        'end_date',
        'duration_days',
        'status',
        'created_by',
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
            'start_date' => 'date',
            'end_date' => 'date',
            'duration_days' => 'integer',
        ];
    }

    /**
     * Get the child for this program.
     */
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    /**
     * Get the user who created this program.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the schedules for this program.
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(PmtSchedule::class, 'program_id');
    }

    /**
     * Get the progress percentage of the program.
     */
    public function getProgressPercentageAttribute(): float
    {
        $logged = $this->schedules()->has('log')->count();
        $total = $this->duration_days;

        return $total > 0 ? round(($logged / $total) * 100, 1) : 0;
    }

    /**
     * Get the number of days remaining in the program.
     */
    public function getDaysRemainingAttribute(): int
    {
        if ($this->status !== 'active') {
            return 0;
        }

        return max(0, now()->startOfDay()->diffInDays($this->end_date, false));
    }

    /**
     * Get the number of logged days.
     */
    public function getLoggedDaysAttribute(): int
    {
        return $this->schedules()->has('log')->count();
    }

    /**
     * Get the number of pending days.
     */
    public function getPendingDaysAttribute(): int
    {
        return $this->duration_days - $this->logged_days;
    }

    /**
     * Scope for active programs.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for completed programs.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for discontinued programs.
     */
    public function scopeDiscontinued($query)
    {
        return $query->where('status', 'discontinued');
    }
}
