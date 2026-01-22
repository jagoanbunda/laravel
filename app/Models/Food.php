<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Food extends Model
{
    /** @use HasFactory<\Database\Factories\FoodFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'foods';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'category',
        'icon',
        'serving_size',
        'calories',
        'protein',
        'fat',
        'carbohydrate',
        'fiber',
        'sugar',
        'min_age_months',
        'max_age_months',
        'is_active',
        'is_system',
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
            'serving_size' => 'decimal:2',
            'calories' => 'decimal:2',
            'protein' => 'decimal:2',
            'fat' => 'decimal:2',
            'carbohydrate' => 'decimal:2',
            'fiber' => 'decimal:2',
            'sugar' => 'decimal:2',
            'min_age_months' => 'integer',
            'max_age_months' => 'integer',
            'is_active' => 'boolean',
            'is_system' => 'boolean',
        ];
    }

    /**
     * Get the user who created this food.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get food log items for this food.
     */
    public function foodLogItems(): HasMany
    {
        return $this->hasMany(FoodLogItem::class);
    }

    /**
     * Scope for system foods.
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Scope for active foods.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter foods suitable for a specific age in months.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForAge($query, int $ageMonths)
    {
        return $query->where(function ($q) use ($ageMonths) {
            $q->where(function ($inner) use ($ageMonths) {
                $inner->whereNull('min_age_months')
                    ->orWhere('min_age_months', '<=', $ageMonths);
            })->where(function ($inner) use ($ageMonths) {
                $inner->whereNull('max_age_months')
                    ->orWhere('max_age_months', '>=', $ageMonths);
            });
        });
    }
}
