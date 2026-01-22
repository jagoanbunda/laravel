# Research: PMT Program Enhancement

## Overview
Technical research and decisions for enhancing the PMT (Supplementary Feeding Program) module with full program enrollment, Food database integration, and UI refinements.

## Decision 1: Fix `full_name` Property Access

**Decision**: Use `name` attribute AND add `getFullNameAttribute()` accessor to User model

**Rationale**: 
- The User model has `name` column, not `full_name`
- Some controllers use `full_name` (ScreeningController, PmtController) while others use `name`
- Adding an accessor provides consistency without breaking existing code

**Implementation**:
```php
// app/Models/User.php
public function getFullNameAttribute(): string
{
    return $this->name;
}
```

**Files to fix** (change `full_name` to `name`):
- `app/Http/Controllers/PmtController.php` - lines 34, 60, 94, 126, 159
- `app/Http/Controllers/ScreeningController.php` - lines 30, 53, 85, 183, 233

**Alternatives Considered**:
- Only fix to use `name`: Would work but accessor provides future flexibility
- Rename `name` to `full_name` in database: Too risky, breaks other code

## Decision 2: Link PMT to Food Database

**Decision**: Add age targeting fields to Food model, deprecate PmtMenu

**Rationale**:
- Food model already has comprehensive nutritional data (calories, protein, fat, carbs, fiber, sugar)
- PmtMenu only has calories and protein - less complete
- Merging avoids data duplication
- Age targeting fields make Food suitable for PMT programs

**Implementation**:
```php
// Migration: add_age_fields_to_foods_table
$table->tinyInteger('min_age_months')->unsigned()->nullable();
$table->tinyInteger('max_age_months')->unsigned()->nullable();

// app/Models/Food.php - add scope
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

**Alternatives Considered**:
- Add food_id to PmtMenu as FK: Extra indirection, still duplicates some data
- Create new PmtFood table: Unnecessary complexity

## Decision 3: PMT Program Model Design

**Decision**: Create `pmt_programs` table with child enrollment and auto-generated schedules

**Rationale**:
- Programs have a defined duration (90 or 120 days)
- Programs track status (active, completed, discontinued)
- Schedules are generated automatically on enrollment
- One active program per child constraint prevents overlaps

**Implementation**:
```php
// Migration: create_pmt_programs_table
Schema::create('pmt_programs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('child_id')->constrained('children')->cascadeOnDelete();
    $table->date('start_date');
    $table->date('end_date');
    $table->unsignedSmallInteger('duration_days'); // 90 or 120
    $table->enum('status', ['active', 'completed', 'discontinued'])->default('active');
    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
    $table->text('notes')->nullable();
    $table->timestamps();
    
    // Prevent overlapping programs for same child
    $table->index(['child_id', 'status']);
});
```

**Alternatives Considered**:
- Duration as enum: Less flexible if other durations needed later
- No status field: Would require complex date-based calculations

## Decision 4: Bulk Schedule Generation

**Decision**: Use `insert()` for bulk creation of 90/120 schedule records

**Rationale**:
- `insert()` is much faster than 90-120 individual `create()` calls
- Single database transaction
- Memory efficient

**Implementation**:
```php
// app/Http/Controllers/PmtProgramController.php
public function store(StorePmtProgramRequest $request)
{
    $program = DB::transaction(function () use ($request) {
        $startDate = Carbon::parse($request->start_date);
        $durationDays = $request->duration_days; // 90 or 120
        $endDate = $startDate->copy()->addDays($durationDays - 1);
        
        $program = PmtProgram::create([
            'child_id' => $request->child_id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'duration_days' => $durationDays,
            'status' => 'active',
            'created_by' => auth()->id(),
            'notes' => $request->notes,
        ]);
        
        // Bulk insert schedules
        $schedules = [];
        for ($i = 0; $i < $durationDays; $i++) {
            $schedules[] = [
                'program_id' => $program->id,
                'child_id' => $request->child_id,
                'scheduled_date' => $startDate->copy()->addDays($i),
                'created_at' => now(),
            ];
        }
        PmtSchedule::insert($schedules);
        
        return $program;
    });
    
    return redirect()->route('pmt.programs.show', $program)
        ->with('success', 'Program PMT berhasil dibuat dengan ' . $program->duration_days . ' jadwal.');
}
```

**Alternatives Considered**:
- Individual create calls: Too slow for 90-120 records
- Queue job: Unnecessary complexity for this volume

## Decision 5: Parent Food Reporting

**Decision**: Add `food_id` to `pmt_logs` table for parent to select food

**Rationale**:
- Current flow: NAKES schedules PMT, parents report what was received
- Parents select from Food database when logging
- Enables accurate nutritional tracking
- Optional: parents can log without specifying food

**Implementation**:
```php
// Migration: add_food_id_to_pmt_logs_table
$table->foreignId('food_id')->nullable()->after('schedule_id')
    ->constrained('foods')->nullOnDelete();

// PmtLog model
public function food(): BelongsTo
{
    return $this->belongsTo(Food::class);
}
```

**Alternatives Considered**:
- Separate food_logs for PMT: Too complex, duplicates existing structure
- Free text food entry: No nutritional data, inconsistent

## Decision 6: UI Component Pattern

**Decision**: Match `foods/create.tsx` style with icons, descriptions, and visual sections

**Rationale**:
- Consistency with existing polished UI
- Better user experience with visual hierarchy
- Clear call-to-action with program summary

**Key UI Elements**:
1. Card headers with icons (👶 Child Info, 📅 Program Details, 📋 Summary)
2. CardDescription for context
3. Duration selector with visual buttons (90 days vs 120 days)
4. Child preview when selected
5. Auto-calculated end date display
6. Program summary section before submit

**Alternatives Considered**:
- Keep current minimal style: Inconsistent with foods page
- Modal-based form: Less space for program details

## Decision 7: Program Status Transitions

**Decision**: Implement status enum with manual and automatic transitions

**Rationale**:
- `active`: Initial state, program in progress
- `completed`: All days have passed OR manually marked
- `discontinued`: Manually stopped early

**Implementation**:
```php
// PmtProgram model
public function markCompleted(): void
{
    $this->update(['status' => 'completed']);
}

public function markDiscontinued(): void
{
    $this->update(['status' => 'discontinued']);
}

// Auto-complete via scheduled command (optional)
public function scopeReadyToComplete($query)
{
    return $query->where('status', 'active')
        ->where('end_date', '<', now());
}
```

**Alternatives Considered**:
- No manual control: Users need ability to stop programs early
- Complex state machine: Overkill for 3 simple states

## Decision 8: Database Indexes

**Decision**: Add strategic indexes for common queries

**Rationale**:
- Programs are queried by child and status
- Schedules are queried by program and date
- Logs are queried by schedule

**Implementation**:
```php
// pmt_programs
$table->index(['child_id', 'status']);

// pmt_schedules (existing)
$table->index(['program_id', 'scheduled_date']);
```

## Existing Resources to Leverage

### Available Factories
| Factory | Relevant States |
|---------|-----------------|
| ChildFactory | `male()`, `female()`, `newborn()`, `toddler()` |
| FoodFactory | `active()`, `protein()`, `carbohydrate()` |
| PmtScheduleFactory | `today()`, `past()`, `future()` |
| PmtMenuFactory | (deprecated but available) |

### Factories to Create
| Factory | States Needed |
|---------|---------------|
| PmtProgramFactory | `active()`, `completed()`, `discontinued()`, `ninetyDays()`, `oneHundredTwentyDays()` |

## Implementation Notes

1. **Migration Order**: Age fields → Programs → Schedule FK → Log FK
2. **Model Updates**: Run after all migrations
3. **Controller Fixes**: Can be done in parallel with migrations
4. **Frontend**: After backend is complete
5. **Testing**: Feature tests using factories

## Estimated Effort

| Component | Files | Complexity |
|-----------|-------|------------|
| Migrations | 4 | Low |
| Models | 5 | Low-Medium |
| Controllers | 3 | Medium |
| Form Requests | 1 | Low |
| Frontend Pages | 4 | Medium-High |
| Tests | 2 | Medium |

**Total Estimated Tasks**: 21 tasks
