# Quickstart: PMT Program Enhancement

## Overview
This document provides test scenarios and verification steps for the PMT Program Enhancement feature.

## Prerequisites

1. **Database seeded** with test data:
   - Users (parents and NAKES)
   - Children with various ages
   - Foods with nutritional data
   - Existing PMT menus (for backward compatibility testing)

2. **Migrations run**:
   ```bash
   php artisan migrate
   ```

3. **Development server running**:
   ```bash
   npm run dev
   composer run dev
   ```

## Test Scenarios

### Scenario 1: Fix full_name Bug Verification

**Objective**: Verify `full_name` accessor works across all controllers.

**Steps**:
1. Navigate to `/pmt` (PMT schedules list)
2. Verify parent names display correctly (no errors)
3. Navigate to `/screenings` (ASQ-3 screenings list)
4. Verify parent names display correctly (no errors)
5. Navigate to `/pmt/create`
6. Verify child dropdown shows "Child Name (Parent Name)" format

**Expected Results**:
- ✅ No "Property [full_name] does not exist" errors
- ✅ Parent names display correctly throughout the application

---

### Scenario 2: Program Enrollment (90 Days)

**Objective**: Enroll a child in a 90-day PMT program.

**Steps**:
1. Navigate to `/pmt/programs/create`
2. Select a child without an active program
3. Set start date to today
4. Select "90 Days" duration
5. Add optional notes: "Test program enrollment"
6. Click "Enroll Child"

**Expected Results**:
- ✅ Redirected to program detail page (`/pmt/programs/{id}`)
- ✅ Success message: "Program PMT berhasil dibuat dengan 90 jadwal."
- ✅ Program shows status: "Active"
- ✅ End date is 89 days after start date
- ✅ 90 schedule entries created (visible in schedules list)
- ✅ Progress shows 0% (no logs yet)

**Database Verification**:
```sql
SELECT COUNT(*) FROM pmt_schedules WHERE program_id = {id};
-- Expected: 90
```

---

### Scenario 3: Program Enrollment (120 Days)

**Objective**: Enroll a child in a 120-day PMT program.

**Steps**:
1. Navigate to `/pmt/programs/create`
2. Select a different child without an active program
3. Set start date to tomorrow
4. Select "120 Days" duration
5. Click "Enroll Child"

**Expected Results**:
- ✅ Redirected to program detail page
- ✅ End date is 119 days after start date
- ✅ 120 schedule entries created

---

### Scenario 4: Prevent Duplicate Active Programs

**Objective**: Verify a child cannot have multiple active programs.

**Steps**:
1. Navigate to `/pmt/programs/create`
2. Select a child who already has an active program
3. Fill in start date and duration
4. Click "Enroll Child"

**Expected Results**:
- ✅ Validation error: "Anak ini sudah memiliki program PMT aktif."
- ✅ Form not submitted
- ✅ User remains on create page

---

### Scenario 5: View Program Progress

**Objective**: View program details and schedule progress.

**Steps**:
1. Navigate to `/pmt/programs`
2. Click on an active program
3. Review program information
4. Scroll through schedule list

**Expected Results**:
- ✅ Program header shows child name, parent name
- ✅ Duration and date range displayed correctly
- ✅ Progress bar shows percentage of logged days
- ✅ Statistics section shows: total days, logged days, pending days
- ✅ Schedule list is paginated (10 per page for 90/120 days)
- ✅ Each schedule shows date, logged status, portion if logged

---

### Scenario 6: Log PMT Distribution with Food Selection

**Objective**: Parent logs food received with food selection from database.

**Steps**:
1. Navigate to `/pmt/programs/{id}` (active program)
2. Find a schedule without a log
3. Click "Log" button
4. Select food from Food database dropdown
5. Select portion consumed: "Habis (100%)"
6. Add optional notes
7. Click "Save"

**Expected Results**:
- ✅ Log saved successfully
- ✅ Schedule now shows as "logged"
- ✅ Food name displayed in log details
- ✅ Program progress percentage increases

---

### Scenario 7: Discontinue Program

**Objective**: Stop an active program early.

**Steps**:
1. Navigate to `/pmt/programs/{id}` (active program)
2. Click "Discontinue Program" button
3. Confirm action

**Expected Results**:
- ✅ Program status changes to "Discontinued"
- ✅ Success message displayed
- ✅ "Discontinue" button no longer visible
- ✅ Remaining schedules preserved but program marked as stopped

---

### Scenario 8: Programs List Filtering

**Objective**: Filter programs by status.

**Steps**:
1. Navigate to `/pmt/programs`
2. Click "Active" filter
3. Verify only active programs shown
4. Click "Completed" filter
5. Verify only completed programs shown
6. Click "All" filter
7. Verify all programs shown

**Expected Results**:
- ✅ Filtering works correctly
- ✅ URL updates with filter parameter
- ✅ Count/pagination updates accordingly

---

### Scenario 9: Food Age Targeting (Informational)

**Objective**: Verify age fields display on foods.

**Steps**:
1. Navigate to `/foods`
2. Edit a food item
3. Add min_age_months: 6, max_age_months: 24
4. Save

**Expected Results**:
- ✅ Age targeting fields saved
- ✅ Food displays age range in list/detail views
- ✅ Age filtering is informational (not enforced in PMT)

---

### Scenario 10: UI Refinement Verification

**Objective**: Verify PMT create page matches refined UI style.

**Steps**:
1. Navigate to `/pmt/create` (existing individual schedule)
2. Compare with `/foods/create`
3. Navigate to `/pmt/programs/create`
4. Review UI elements

**Expected Results**:
- ✅ Card headers have icons
- ✅ CardDescription provides context
- ✅ Duration selector has visual buttons (not dropdown)
- ✅ Child preview shows when child selected
- ✅ End date auto-calculated and displayed
- ✅ Program summary section before submit button
- ✅ Consistent styling with foods/create page

---

### Scenario 11: Backward Compatibility

**Objective**: Verify existing PMT functionality still works.

**Steps**:
1. Navigate to `/pmt` (existing schedules list)
2. Verify existing schedules display correctly
3. Create a new individual schedule via `/pmt/create`
4. Log distribution on existing schedule

**Expected Results**:
- ✅ Existing schedules (without program_id) display correctly
- ✅ Individual schedule creation still works
- ✅ PMT log still works for old-style schedules
- ✅ No errors related to nullable program_id

---

## Automated Test Coverage

### Feature Tests to Implement

```
tests/Feature/
├── PmtProgramTest.php
│   ├── test_can_list_programs()
│   ├── test_can_create_program_with_90_days()
│   ├── test_can_create_program_with_120_days()
│   ├── test_creates_correct_number_of_schedules()
│   ├── test_cannot_create_duplicate_active_program()
│   ├── test_can_view_program_details()
│   ├── test_can_discontinue_active_program()
│   ├── test_cannot_discontinue_non_active_program()
│   ├── test_program_progress_calculation()
│   └── test_program_filters()
│
├── PmtControllerTest.php (additions)
│   ├── test_full_name_displays_correctly()
│   └── test_backward_compatibility_with_old_schedules()
│
└── FoodModelTest.php (additions)
    ├── test_age_scope_filters_correctly()
    └── test_age_fields_nullable()
```

### Test Data Setup

```php
// tests/Feature/PmtProgramTest.php
protected function setUp(): void
{
    parent::setUp();
    
    $this->user = User::factory()->create();
    $this->child = Child::factory()->for($this->user)->create([
        'birthday' => now()->subMonths(18),
    ]);
    $this->foods = Food::factory()->count(5)->create();
}

public function test_can_create_program_with_90_days(): void
{
    $response = $this->actingAs($this->user)
        ->post('/pmt/programs', [
            'child_id' => $this->child->id,
            'start_date' => now()->format('Y-m-d'),
            'duration_days' => 90,
        ]);

    $response->assertRedirect();
    
    $program = PmtProgram::first();
    $this->assertEquals(90, $program->duration_days);
    $this->assertEquals('active', $program->status);
    $this->assertEquals(90, $program->schedules()->count());
}
```

## Performance Verification

### Bulk Insert Performance
```bash
# Time the program creation with 120 schedules
php artisan tinker
>>> $start = microtime(true);
>>> // Create program via controller logic
>>> $elapsed = microtime(true) - $start;
>>> echo "Elapsed: {$elapsed}s";
# Expected: < 1 second
```

### Query Performance
```bash
# Check N+1 queries on program list
# Enable query logging and verify eager loading works
```

## Rollback Procedure

If issues occur, migrations can be rolled back:

```bash
php artisan migrate:rollback --step=4
```

This will reverse:
1. add_food_id_to_pmt_logs_table
2. add_program_id_to_pmt_schedules_table
3. create_pmt_programs_table
4. add_age_fields_to_foods_table
