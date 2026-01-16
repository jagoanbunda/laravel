<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asq3ScreeningIntervention extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'screening_id',
        'domain_id',
        'type',
        'action',
        'notes',
        'status',
        'follow_up_date',
        'completed_at',
        'created_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'follow_up_date' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * Get the screening this intervention belongs to.
     */
    public function screening(): BelongsTo
    {
        return $this->belongsTo(Asq3Screening::class, 'screening_id');
    }

    /**
     * Get the domain this intervention is for (optional).
     */
    public function domain(): BelongsTo
    {
        return $this->belongsTo(Asq3Domain::class, 'domain_id');
    }

    /**
     * Get the user who created this intervention.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get type label in Indonesian.
     */
    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'stimulation' => 'Stimulasi',
            'referral' => 'Rujukan',
            'follow_up' => 'Tindak Lanjut',
            'counseling' => 'Konseling',
            'other' => 'Lainnya',
            default => $this->type,
        };
    }

    /**
     * Get status label in Indonesian.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'planned' => 'Direncanakan',
            'in_progress' => 'Sedang Berjalan',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            default => $this->status,
        };
    }

    /**
     * Scope for pending interventions (planned or in_progress).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', ['planned', 'in_progress']);
    }

    /**
     * Scope for completed interventions.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for interventions needing follow-up.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeNeedsFollowUp($query)
    {
        return $query->whereNotNull('follow_up_date')
            ->where('follow_up_date', '<=', today())
            ->whereIn('status', ['planned', 'in_progress']);
    }

    /**
     * Mark this intervention as completed.
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }
}
