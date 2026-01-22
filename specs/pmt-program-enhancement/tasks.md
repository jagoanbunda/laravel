# Tasks: PMT Program Enhancement

## Overview
Implementation tasks for the PMT Program Enhancement feature. Tasks are ordered by dependencies and marked with [P] for parallel execution capability.

**Total Tasks**: 21
**Estimated Effort**: Medium (2-3 days)

## Task Legend
- `[P]` - Can run in parallel with other [P] tasks at same level
- Dependencies noted in each task
- File paths are relative to repository root

---

## Phase 1: Database Migrations

### T001: Create migration - Add age fields to foods table [P]
**File**: `database/migrations/2026_01_17_100001_add_age_fields_to_foods_table.php`
**Dependencies**: None
**Description**: Add `min_age_months` and `max_age_months` nullable tinyInteger columns to the foods table for age targeting.

```bash
php artisan make:migration add_age_fields_to_foods_table --table=foods --no-interaction
```

**Implementation**:
```php
$table->tinyInteger('min_age_months')->unsigned()->nullable()->after('sugar');
$table->tinyInteger('max_age_months')->unsigned()->nullable()->after('min_age_months');
```

---

### T002: Create migration - Create pmt_programs table [P]
**File**: `database/migrations/2026_01_17_100002_create_pmt_programs_table.php`
**Dependencies**: None
**Description**: Create the `pmt_programs` table with child_id, start_date, end_date, duration_days, status, created_by, and notes columns.

```bash
php artisan make:migration create_pmt_programs_table --create=pmt_programs --no-interaction
```

**Implementation**: See data-model.md for full schema.

---

### T003: Create migration - Add program_id to pmt_schedules table
**File**: `database/migrations/2026_01_17_100003_add_program_id_to_pmt_schedules_table.php`
**Dependencies**: T002 (pmt_programs table must exist)
**Description**: Add nullable `program_id` foreign key to pmt_schedules table for program association.

```bash
php artisan make:migration add_program_id_to_pmt_schedules_table --table=pmt_schedules --no-interaction
```

---

### T004: Create migration - Add food_id to pmt_logs table
**File**: `database/migrations/2026_01_17_100004_add_food_id_to_pmt_logs_table.php`
**Dependencies**: T001 (foods table age fields)
**Description**: Add nullable `food_id` foreign key to pmt_logs table for parent food selection.

```bash
php artisan make:migration add_food_id_to_pmt_logs_table --table=pmt_logs --no-interaction
```

---

### T005: Run all migrations
**Dependencies**: T001, T002, T003, T004
**Description**: Execute all new migrations.

```bash
php artisan migrate
```

---

## Phase 2: Model Updates

### T006: Update User model - Add fullName accessor [P]
**File**: `app/Models/User.php`
**Dependencies**: None
**Description**: Add `getFullNameAttribute()` accessor that returns `$this->name` for backward compatibility.

**Implementation**:
```php
public function getFullNameAttribute(): string
{
    return $this->name;
}
```

---

### T007: Update Food model - Add age fields and scope [P]
**File**: `app/Models/Food.php`
**Dependencies**: T001
**Description**: Add `min_age_months`, `max_age_months` to fillable and casts. Add `scopeForAge()` method.

**Implementation**: See research.md for scope implementation.

---

### T008: Create PmtProgram model
**File**: `app/Models/PmtProgram.php`
**Dependencies**: T002
**Description**: Create new PmtProgram model with relationships to Child, User, and PmtSchedule.

```bash
php artisan make:model PmtProgram --no-interaction
```

**Implementation**: See data-model.md for full model.

---

### T009: Update PmtSchedule model - Add program relationship
**File**: `app/Models/PmtSchedule.php`
**Dependencies**: T003, T008
**Description**: Add `program_id` to fillable and add `program()` BelongsTo relationship.

---

### T010: Update PmtLog model - Add food relationship
**File**: `app/Models/PmtLog.php`
**Dependencies**: T004
**Description**: Add `food_id` to fillable and add `food()` BelongsTo relationship.

---

## Phase 3: Controller Bug Fixes

### T011: Fix PmtController - Replace full_name with name [P]
**File**: `app/Http/Controllers/PmtController.php`
**Dependencies**: T006
**Description**: Replace all occurrences of `->full_name` with `->name` on lines 34, 60, 94, 126, 159.

**Note**: After T006, both will work, but using `name` directly is cleaner.

---

### T012: Fix ScreeningController - Replace full_name with name [P]
**File**: `app/Http/Controllers/ScreeningController.php`
**Dependencies**: T006
**Description**: Replace all occurrences of `->full_name` with `->name` on lines 30, 53, 85, 183, 233.

---

## Phase 4: New Controller & Request

### T013: Create StorePmtProgramRequest
**File**: `app/Http/Requests/StorePmtProgramRequest.php`
**Dependencies**: T008
**Description**: Create form request with validation for child_id, start_date, duration_days, notes. Include custom validator to check for existing active program.

```bash
php artisan make:request StorePmtProgramRequest --no-interaction
```

**Implementation**: See contracts/api-endpoints.md for full implementation.

---

### T014: Create PmtProgramController
**File**: `app/Http/Controllers/PmtProgramController.php`
**Dependencies**: T008, T009, T013
**Description**: Create controller with index, create, store, show, edit, update, destroy, and discontinue methods.

```bash
php artisan make:controller PmtProgramController --resource --no-interaction
```

**Key Implementation** (store method):
- Create PmtProgram record
- Calculate end_date from start_date + duration_days
- Bulk insert 90 or 120 PmtSchedule records
- Use database transaction for atomicity

---

### T015: Add routes for PMT Programs
**File**: `routes/web.php`
**Dependencies**: T014
**Description**: Add resource routes for pmt/programs and discontinue action route.

**Implementation**:
```php
Route::resource('pmt/programs', PmtProgramController::class)->names([
    'index' => 'pmt.programs.index',
    'create' => 'pmt.programs.create',
    'store' => 'pmt.programs.store',
    'show' => 'pmt.programs.show',
    'edit' => 'pmt.programs.edit',
    'update' => 'pmt.programs.update',
    'destroy' => 'pmt.programs.destroy',
]);
Route::post('/pmt/programs/{program}/discontinue', [PmtProgramController::class, 'discontinue'])
    ->name('pmt.programs.discontinue');
```

---

## Phase 5: Frontend Pages

### T016: Create programs/index.tsx page [P]
**File**: `resources/js/pages/pmt/programs/index.tsx`
**Dependencies**: T014, T015
**Description**: Create list page for PMT programs with search, status filters, and pagination. Display child name, parent name, duration, status, progress percentage, and days remaining.

**UI Reference**: Follow existing `pmt/index.tsx` patterns.

---

### T017: Create programs/create.tsx page [P]
**File**: `resources/js/pages/pmt/programs/create.tsx`
**Dependencies**: T014, T015
**Description**: Create enrollment form with:
- Child selector (show age, parent, exclude those with active programs)
- Duration selector (visual buttons for 90/120 days)
- Start date picker
- Auto-calculated end date display
- Notes field
- Program summary section

**UI Reference**: Match `foods/create.tsx` refined style with icons, CardDescription, colored sections.

---

### T018: Create programs/show.tsx page [P]
**File**: `resources/js/pages/pmt/programs/show.tsx`
**Dependencies**: T014, T015
**Description**: Create program detail page with:
- Program header (child, parent, dates, status)
- Progress bar and statistics
- Paginated schedule list
- Log action for each schedule
- Discontinue program button (if active)

---

### T019: Refine pmt/create.tsx UI
**File**: `resources/js/pages/pmt/create.tsx`
**Dependencies**: None (can be done in parallel)
**Description**: Update existing PMT create page to match `foods/create.tsx` style:
- Add icons to card headers
- Add CardDescription for context
- Improve visual hierarchy
- Keep existing functionality

---

## Phase 6: Factory & Tests

### T020: Create PmtProgramFactory
**File**: `database/factories/PmtProgramFactory.php`
**Dependencies**: T008
**Description**: Create factory with states: active(), completed(), discontinued(), ninetyDays(), oneHundredTwentyDays().

```bash
php artisan make:factory PmtProgramFactory --model=PmtProgram --no-interaction
```

---

### T021: Create PmtProgramTest
**File**: `tests/Feature/PmtProgramTest.php`
**Dependencies**: T014, T020
**Description**: Create feature tests for:
- List programs
- Create program with 90/120 days
- Verify schedule count
- Prevent duplicate active programs
- View program details
- Discontinue program
- Progress calculation

```bash
php artisan make:test PmtProgramTest --phpunit --no-interaction
```

---

## Phase 7: Finalization

### T022: Run Pint formatter
**Dependencies**: All code tasks complete
**Description**: Format all modified PHP files.

```bash
vendor/bin/pint --dirty
```

---

### T023: Run all tests
**Dependencies**: T021, T022
**Description**: Verify all tests pass.

```bash
php artisan test
```

---

## Parallel Execution Guide

### Batch 1 (Migrations - partially parallel)
```
T001 [P] ──┐
T002 [P] ──┼── T003 ── T005
           │
T001 ──────┴── T004 ──┘
```

### Batch 2 (Models - after migrations)
```
T006 [P] ─────────────────┐
T007 [P] ─────────────────┤
T008 ── T009 ─────────────┼── T013 ── T014 ── T015
T010 ─────────────────────┘
```

### Batch 3 (Bug fixes - parallel with models)
```
T011 [P]
T012 [P]
```

### Batch 4 (Frontend - after controller)
```
T016 [P]
T017 [P]
T018 [P]
T019 [P]
```

### Batch 5 (Tests & Finalization)
```
T020 ── T021 ── T022 ── T023
```

---

## Verification Checklist

After completing all tasks:

- [ ] `php artisan migrate` runs without errors
- [ ] `/pmt` page loads without `full_name` errors
- [ ] `/screenings` page loads without `full_name` errors
- [ ] `/pmt/programs` page shows empty list (or seeded data)
- [ ] `/pmt/programs/create` shows enrollment form
- [ ] Creating a 90-day program generates 90 schedules
- [ ] Creating a 120-day program generates 120 schedules
- [ ] Cannot create duplicate active program for same child
- [ ] Program detail page shows progress correctly
- [ ] Discontinue program changes status
- [ ] `php artisan test` passes all tests
- [ ] `vendor/bin/pint --test` shows no formatting issues
