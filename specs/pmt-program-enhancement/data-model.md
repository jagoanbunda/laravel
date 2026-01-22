# Data Model: PMT Program Enhancement

## Overview
This document describes the data model changes for the PMT Program Enhancement feature, including new entities, modified entities, and their relationships.

## Entity Relationship Diagram

```
User (1)───────────────< (N) Child
  │                          │
  │                          ├──< PmtProgram (NEW)
  │                          │         │
  │                          │         └──< PmtSchedule (MODIFIED)
  │                          │                   │
  │                          │                   └──< PmtLog (MODIFIED)
  │                          │                            │
  │                          │                       Food <┘ (MODIFIED)
  │                          │
  │                          └──< [other existing relationships...]
  │
  └── getFullNameAttribute() (NEW accessor)
```

## New Entities

### PmtProgram (NEW)
A PMT Program represents a child's enrollment in a supplementary feeding program for a defined duration.

| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| id | bigint | auto | PK |
| child_id | bigint | FK, required | Child enrolled in program |
| start_date | date | required | Program start date |
| end_date | date | required | Auto-calculated from start + duration |
| duration_days | smallint | required, in:90,120 | Program length |
| status | enum | required | active, completed, discontinued |
| created_by | bigint | FK, nullable | NAKES who created the program |
| notes | text | nullable, max:1000 | Optional notes |
| created_at | timestamp | auto | |
| updated_at | timestamp | auto | |

**Relationships**:
- `belongsTo` Child
- `belongsTo` User (created_by)
- `hasMany` PmtSchedule

**Indexes**:
- `child_id, status` - For querying active programs per child

**Business Rules**:
- Only one active program per child at a time
- End date = start_date + (duration_days - 1)
- Status transitions: active → completed OR active → discontinued

**Factory States**:
- `active()` - Program in progress
- `completed()` - Program finished
- `discontinued()` - Program stopped early
- `ninetyDays()` - 90-day program
- `oneHundredTwentyDays()` - 120-day program

```php
// app/Models/PmtProgram.php
class PmtProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'child_id',
        'start_date',
        'end_date',
        'duration_days',
        'status',
        'created_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'duration_days' => 'integer',
        ];
    }

    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(PmtSchedule::class, 'program_id');
    }

    public function getProgressPercentageAttribute(): float
    {
        $logged = $this->schedules()->has('log')->count();
        $total = $this->duration_days;
        return $total > 0 ? round(($logged / $total) * 100, 1) : 0;
    }

    public function getDaysRemainingAttribute(): int
    {
        return max(0, $this->end_date->diffInDays(now(), false));
    }
}
```

## Modified Entities

### User (MODIFIED)
Add `full_name` accessor for backward compatibility.

| Change | Description |
|--------|-------------|
| ADD | `getFullNameAttribute()` accessor returning `$this->name` |

```php
// app/Models/User.php - ADD
public function getFullNameAttribute(): string
{
    return $this->name;
}
```

### Food (MODIFIED)
Add age targeting fields for PMT program compatibility.

| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| min_age_months | tinyint | nullable, 0-60 | NEW - Minimum age in months |
| max_age_months | tinyint | nullable, 0-60 | NEW - Maximum age in months |

**New Fillable**:
```php
protected $fillable = [
    // ... existing fields ...
    'min_age_months',
    'max_age_months',
];
```

**New Casts**:
```php
protected function casts(): array
{
    return [
        // ... existing casts ...
        'min_age_months' => 'integer',
        'max_age_months' => 'integer',
    ];
}
```

**New Scope**:
```php
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
```

### PmtSchedule (MODIFIED)
Add relationship to PmtProgram.

| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| program_id | bigint | FK, nullable | NEW - Parent program (nullable for backward compat) |

**Changes**:
```php
// Add to fillable
protected $fillable = [
    'child_id',
    'menu_id',
    'program_id',  // NEW
    'scheduled_date',
];

// Add relationship
public function program(): BelongsTo
{
    return $this->belongsTo(PmtProgram::class, 'program_id');
}
```

### PmtLog (MODIFIED)
Add relationship to Food for parent food selection.

| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| food_id | bigint | FK, nullable | NEW - Food received (selected by parent) |

**Changes**:
```php
// Add to fillable
protected $fillable = [
    'schedule_id',
    'food_id',  // NEW
    'portion',
    'logged_at',
    'notes',
    'photo_url',
];

// Add relationship
public function food(): BelongsTo
{
    return $this->belongsTo(Food::class);
}
```

## Migration Files

### Migration 1: add_age_fields_to_foods_table
```php
Schema::table('foods', function (Blueprint $table) {
    $table->tinyInteger('min_age_months')->unsigned()->nullable()->after('sugar');
    $table->tinyInteger('max_age_months')->unsigned()->nullable()->after('min_age_months');
});
```

### Migration 2: create_pmt_programs_table
```php
Schema::create('pmt_programs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('child_id')->constrained('children')->cascadeOnDelete();
    $table->date('start_date');
    $table->date('end_date');
    $table->unsignedSmallInteger('duration_days');
    $table->enum('status', ['active', 'completed', 'discontinued'])->default('active');
    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
    $table->text('notes')->nullable();
    $table->timestamps();

    $table->index(['child_id', 'status']);
});
```

### Migration 3: add_program_id_to_pmt_schedules_table
```php
Schema::table('pmt_schedules', function (Blueprint $table) {
    $table->foreignId('program_id')->nullable()->after('id')
        ->constrained('pmt_programs')->cascadeOnDelete();
    
    $table->index(['program_id', 'scheduled_date']);
});
```

### Migration 4: add_food_id_to_pmt_logs_table
```php
Schema::table('pmt_logs', function (Blueprint $table) {
    $table->foreignId('food_id')->nullable()->after('schedule_id')
        ->constrained('foods')->nullOnDelete();
});
```

## Relationships Summary

| Model | Relationship | Related Model | Notes |
|-------|-------------|---------------|-------|
| PmtProgram | belongsTo | Child | NEW |
| PmtProgram | belongsTo | User (created_by) | NEW |
| PmtProgram | hasMany | PmtSchedule | NEW |
| PmtSchedule | belongsTo | PmtProgram | NEW |
| PmtLog | belongsTo | Food | NEW |
| User | accessor | full_name | NEW (returns name) |
| Food | scope | forAge() | NEW |

## Validation Rules

### StorePmtProgramRequest
```php
public function rules(): array
{
    return [
        'child_id' => 'required|exists:children,id',
        'start_date' => 'required|date|after_or_equal:today',
        'duration_days' => 'required|integer|in:90,120',
        'notes' => 'nullable|string|max:1000',
    ];
}

public function messages(): array
{
    return [
        'child_id.required' => 'Anak wajib dipilih.',
        'child_id.exists' => 'Anak tidak ditemukan.',
        'start_date.required' => 'Tanggal mulai wajib diisi.',
        'start_date.after_or_equal' => 'Tanggal mulai harus hari ini atau setelahnya.',
        'duration_days.required' => 'Durasi program wajib dipilih.',
        'duration_days.in' => 'Durasi program harus 90 atau 120 hari.',
    ];
}
```

## Authorization Rules

| Resource | Rule |
|----------|------|
| PmtProgram | User can only access programs for their own children |
| PmtProgram (NAKES) | NAKES can access all programs |
| PmtSchedule | Via program/child ownership |
| PmtLog | Via schedule ownership |

## Backward Compatibility Notes

1. **pmt_menus table**: Kept but deprecated. Existing schedules with `menu_id` continue to work.
2. **PmtSchedule.child_id**: Remains for direct child access, even though program has child.
3. **PmtSchedule.menu_id**: Remains nullable for backward compatibility.
4. **PmtLog without food_id**: Valid - parents can log portion without selecting food.
