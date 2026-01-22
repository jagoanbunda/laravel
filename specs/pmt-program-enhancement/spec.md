# Feature Specification: PMT Program Enhancement

## Overview
Enhance the PMT (Pemberian Makanan Tambahan / Supplementary Feeding Program) module to support full program enrollment with 90 or 120 day durations, link PMT menus to the Food database, fix children relationship issues, and refine the UI for the PMT create page.

## User Request
> "On http://127.0.0.1:8000/pmt/create page, I want you to refine the UI and fix the form using correct data resources, also link the PMT menu to the food database, and fix the children relationship. And then check if we have option to choose how long the PMT program is gonna be? 90 days or 120 days"

## Feature Requirements

### FR-1: Fix `full_name` Bug
Fix the `full_name` property access error across controllers:
- `PmtController.php` uses `$child->user->full_name` but User model only has `name`
- `ScreeningController.php` has the same issue
- Solution: Fix to use `name` AND add `getFullNameAttribute()` accessor for consistency

### FR-2: Link PMT to Food Database
Merge PMT menu functionality with the existing Food database:
- Add `min_age_months` and `max_age_months` fields to the `foods` table
- Foods can now be age-targeted for PMT programs
- PMT menus become deprecated (keep for backward compatibility)
- Use Food model directly for PMT scheduling

### FR-3: PMT Program Enrollment (90/120 Days)
Create a full program enrollment system:
- NAKES enrolls a child in a PMT Program
- Select duration: 90 days or 120 days
- Set start date, end date auto-calculated
- System auto-generates daily PMT schedules for the entire program
- Track program status: active, completed, discontinued

### FR-4: Parent Food Reporting
Enable parents to report daily food received:
- Parents select food from Food database when logging
- Record portion consumed
- Optional photo evidence
- Optional notes

### FR-5: Refine PMT Create Page UI
Improve the UI to match the `foods/create.tsx` style:
- Add icons in card headers
- Add CardDescription for context
- Visual grouping with colored sections
- Child info preview when selected
- Program duration selector (90/120 days)
- Program summary before submission

## Non-Functional Requirements

### NFR-1: Backward Compatibility
- Keep `pmt_menus` table (deprecated but functional)
- Existing PMT schedules continue to work
- Gradual migration path

### NFR-2: Data Integrity
- Program schedules are atomic (all or nothing)
- Unique constraint: one active program per child at a time
- Cascading deletes for program → schedules

### NFR-3: Performance
- Bulk insert for 90/120 schedule records
- Eager loading for program queries

## Success Criteria
1. `full_name` errors resolved across all controllers
2. Foods table supports age targeting
3. PMT Programs can be created with 90 or 120 day durations
4. Daily schedules auto-generated on program creation
5. Parents can log food received from Food database
6. Program status tracking works (active/completed/discontinued)
7. UI matches the refined `foods/create.tsx` style
8. All existing functionality continues to work

## Technical Constraints
- Laravel 12 with PHP 8.5
- Inertia.js v2 with React 19
- Tailwind CSS v4
- PHPUnit for testing
- Existing model factories should be extended
