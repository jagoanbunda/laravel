# Implementation Plan: PMT Program Enhancement

**Branch**: `pmt-program-enhancement` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/pmt-program-enhancement/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path ✓
   → Found: PMT Program Enhancement
2. Fill Technical Context ✓
   → Project Type: web (Laravel + Inertia/React)
   → Structure Decision: Existing Laravel structure
3. Evaluate Constitution Check ✓
   → Simplicity: Using Laravel's built-in features
   → Testing: PHPUnit with factories
4. Execute Phase 0 → research.md ✓
5. Execute Phase 1 → contracts, data-model.md, quickstart.md ✓
6. Re-evaluate Constitution Check ✓
7. Plan Phase 2 → Describe task generation approach ✓
8. STOP - Ready for /tasks command
```

## Summary
Enhance the PMT (Supplementary Feeding Program) module with full program enrollment supporting 90/120 day durations. This involves: (1) fixing the `full_name` bug in controllers, (2) adding age targeting fields to the Food model to link PMT with the food database, (3) creating a new PmtProgram model for enrollment with auto-generated daily schedules, (4) enabling parents to report food received from the Food database, and (5) refining the PMT create page UI to match the polished `foods/create.tsx` style.

## Technical Context
**Language/Version**: PHP 8.5, TypeScript/React 19  
**Primary Dependencies**: Laravel 12, Inertia.js v2, Tailwind CSS v4, PHPUnit 11  
**Storage**: MySQL (existing)  
**Testing**: PHPUnit with RefreshDatabase trait  
**Target Platform**: Web application (Laravel + Inertia/React)  
**Project Type**: web (backend + frontend)  
**Performance Goals**: Bulk insert 90-120 schedule records efficiently  
**Constraints**: Backward compatibility with existing pmt_menus table  
**Scale/Scope**: 4 migrations, 5 model changes, 2 controller fixes, 1 new controller, 3 new pages, 1 refined page

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (existing Laravel app)
- Using framework directly? YES - Laravel Eloquent, Inertia, Tailwind
- Single data model? YES - extending existing models
- Avoiding patterns? YES - no unnecessary abstractions

**Architecture**:
- EVERY feature as library? N/A - enhancing existing Laravel app
- Libraries listed: N/A
- CLI per library: N/A
- Library docs: N/A

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? YES
- Git commits show tests before implementation? YES
- Order: Contract→Integration→E2E→Unit strictly followed? YES
- Real dependencies used? YES - SQLite in-memory for tests
- Integration tests for: YES - API endpoints, program creation
- FORBIDDEN: Implementation before test

**Observability**:
- Structured logging included? YES - Laravel logging
- Error context sufficient? YES

**Versioning**:
- Version number assigned? N/A for feature enhancement
- Breaking changes handled? YES - backward compatibility maintained

## Project Structure

### Documentation (this feature)
```
specs/pmt-program-enhancement/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Technical decisions
├── data-model.md        # Entity definitions
├── quickstart.md        # Test scenarios
├── contracts/           
│   └── api-endpoints.md # API contract documentation
└── tasks.md             # Implementation tasks
```

### Source Code Changes
```
# Migrations (new)
database/migrations/
├── xxxx_add_age_fields_to_foods_table.php
├── xxxx_create_pmt_programs_table.php
├── xxxx_add_program_id_to_pmt_schedules_table.php
└── xxxx_add_food_id_to_pmt_logs_table.php

# Models (modified/new)
app/Models/
├── User.php              # Add getFullNameAttribute()
├── Food.php              # Add age fields, scopes
├── PmtProgram.php        # NEW
├── PmtSchedule.php       # Add program relationship
└── PmtLog.php            # Add food relationship

# Controllers (modified/new)
app/Http/Controllers/
├── PmtController.php            # Fix full_name bug
├── ScreeningController.php      # Fix full_name bug
└── PmtProgramController.php     # NEW

# Form Requests (new)
app/Http/Requests/
└── StorePmtProgramRequest.php   # NEW

# Frontend (new/modified)
resources/js/pages/pmt/
├── create.tsx                    # Refine UI
└── programs/
    ├── index.tsx                 # NEW - List programs
    ├── create.tsx                # NEW - Enroll child
    └── show.tsx                  # NEW - Program details
```

**Structure Decision**: Use existing Laravel structure, add new files following conventions

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context**:
   - ✓ Bulk insert strategy for 90-120 records
   - ✓ Age calculation for food filtering
   - ✓ Program status transitions

2. **Generate and dispatch research agents**:
   - ✓ Laravel bulk insert best practices
   - ✓ Eloquent accessor patterns
   - ✓ Inertia form patterns

3. **Consolidate findings** in `research.md`:
   - See research.md for detailed findings

**Output**: research.md with all technical decisions resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - PmtProgram (new): child_id, start_date, end_date, duration_days, status
   - Food (modified): add min_age_months, max_age_months
   - PmtSchedule (modified): add program_id
   - PmtLog (modified): add food_id

2. **Generate API contracts** from functional requirements:
   - Web routes for PMT programs (resource routes)
   - Documented in contracts/api-endpoints.md

3. **Generate contract tests** from contracts:
   - Test file for PmtProgramController
   - Tests must fail first (TDD)

4. **Extract test scenarios** from user stories:
   - Program enrollment happy path
   - Schedule auto-generation
   - Parent food logging
   - Program status transitions

5. **Update agent file**: N/A for this feature

**Output**: data-model.md, /contracts/*, quickstart.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do*

**Task Generation Strategy**:
- Generate tasks from Phase 1 design docs
- Migrations first (database foundation)
- Model changes second (relationships)
- Controller fixes third (bug fixes)
- New controller fourth (feature)
- Frontend last (UI)

**Ordering Strategy**:
- TDD order: Tests before implementation
- Dependency order: Migrations → Models → Controllers → Frontend
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 21 numbered, ordered tasks in tasks.md

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md)  
**Phase 5**: Validation (run tests, verify UI)

## Complexity Tracking
*No violations - using Laravel's built-in features*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None      | N/A        | N/A                                 |

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none needed)

---
*Based on SpecKit workflow - See `.specify/templates/plan-template.md`*
