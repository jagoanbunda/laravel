# Implementation Plan: ASQ-3 Screening Real Data Implementation

**Branch**: `main` | **Date**: 2026-01-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/asq3-screening-realdata/spec.md`

## Summary

Replace mock data in `screenings-tab.tsx` with real screening data from the database. Create `Asq3RecommendationSeeder` with age-interval specific Indonesian recommendations (~100+ records), update `ChildController::show()` to provide screening data as props, and refactor the frontend component to consume real data passed via Inertia.js.

## Technical Context

**Language/Version**: PHP 8.4 (Laravel 12), TypeScript (React 19)  
**Primary Dependencies**: Laravel 12, Inertia.js v2, React 19, Tailwind v4  
**Storage**: MySQL/SQLite via Eloquent ORM  
**Testing**: PHPUnit 11 (not Pest)  
**Target Platform**: Web (Desktop/Tablet for Nakes healthcare workers)  
**Project Type**: Web application (Laravel + Inertia.js + React monolith)  
**Performance Goals**: Eager loading to prevent N+1 queries, <200ms page load  
**Constraints**: Indonesian language for all recommendations, follow existing code conventions  
**Scale/Scope**: 21 age intervals × 5 domains × 2-4 recommendations = ~100-150 records

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is using default template - no project-specific constraints defined. Proceeding with Laravel/React best practices:

| Gate | Status | Notes |
|------|--------|-------|
| Code Conventions | ✅ PASS | Follow existing patterns in codebase |
| Testing | ✅ PASS | PHPUnit for seeders, factories exist |
| Documentation | ✅ PASS | Inline PHPDoc, no separate docs required |
| Type Safety | ✅ PASS | Strict TypeScript, no `any` |

## Project Structure

### Documentation (this feature)

```text
specs/asq3-screening-realdata/
├── plan.md              # This file
├── research.md          # Phase 0 output - ASQ-3 recommendations research
├── data-model.md        # Phase 1 output - Entity definitions
├── quickstart.md        # Phase 1 output - Implementation steps
├── contracts/           # Phase 1 output - TypeScript interfaces
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
# Laravel + Inertia.js + React monolith structure

app/
├── Http/
│   └── Controllers/
│       └── ChildController.php        # Update show() method
├── Models/
│   ├── Asq3Recommendation.php         # Existing model
│   └── Asq3ScreeningIntervention.php  # Existing model
└── Services/                          # No new services needed

database/
├── seeders/
│   ├── Asq3RecommendationSeeder.php   # NEW: Create this
│   ├── Asq3ScreeningSeeder.php        # Update: Add interventions
│   ├── ProductionSeeder.php           # Update: Register recommendation seeder
│   └── DevelopmentSeeder.php          # Existing, calls ProductionSeeder
└── factories/                         # No new factories needed

resources/js/
├── components/
│   └── children/
│       └── screenings-tab.tsx         # REFACTOR: Remove mock, accept props
├── pages/
│   └── children/
│       └── show.tsx                   # UPDATE: Pass screening data to tab
└── types/
    └── models.ts                      # UPDATE: Add screening interfaces

tests/
└── Feature/
    └── Asq3RecommendationSeederTest.php  # NEW: Seeder verification
```

**Structure Decision**: Using existing Laravel + Inertia.js monolith structure. No new directories needed, only modifications to existing files and one new seeder + test.

## Complexity Tracking

> No violations. Feature fits within existing patterns.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Seeder location | `database/seeders/` | Standard Laravel convention |
| Data passing | Inertia props | Existing pattern in show.tsx |
| Recommendation structure | By age interval | User selected Option B for comprehensive coverage |
