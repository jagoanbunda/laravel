<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FoodLog extends Model
{
    /** @use HasFactory<\Database\Factories\FoodLogFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'child_id',
        'log_date',
        'meal_time',
        'total_calories',
        'total_protein',
        'total_fat',
        'total_carbohydrate',
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
            'log_date' => 'date',
            'total_calories' => 'decimal:2',
            'total_protein' => 'decimal:2',
            'total_fat' => 'decimal:2',
            'total_carbohydrate' => 'decimal:2',
        ];
    }

    /**
     * Get the child for this food log.
     */
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    /**
     * Get items for this food log.
     */
    public function items(): HasMany
    {
        return $this->hasMany(FoodLogItem::class);
    }

    /**
     * Calculate totals from items.
     */
    public function calculateTotals(): void
    {
        $this->total_calories = $this->items()->sum('calories');
        $this->total_protein = $this->items()->sum('protein');
        $this->total_fat = $this->items()->sum('fat');
        $this->total_carbohydrate = $this->items()->sum('carbohydrate');
        $this->save();
    }
}
