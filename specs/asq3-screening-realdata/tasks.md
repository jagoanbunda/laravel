# Tasks: ASQ-3 Screening Real Data Implementation

**Input**: Design documents from `/specs/asq3-screening-realdata/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/asq3-screening.ts, quickstart.md
**Tests**: PHPUnit tests requested in spec.md NFR-4

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## User Stories (from spec.md FR-1 to FR-5)

| Story | Priority | Description |
|-------|----------|-------------|
| US1 | P1 | Create Asq3RecommendationSeeder with Indonesian recommendations |
| US2 | P2 | Update Asq3ScreeningSeeder to create interventions |
| US3 | P3 | Full-stack integration (Controller + Frontend) |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing infrastructure and prepare for implementation

- [ ] T001 Verify existing ASQ-3 models exist: `app/Models/Asq3Recommendation.php`, `app/Models/Asq3ScreeningIntervention.php`
- [ ] T002 Verify existing seeders exist: `database/seeders/Asq3DomainSeeder.php`, `database/seeders/Asq3AgeIntervalSeeder.php`
- [ ] T003 [P] Verify TypeScript types exist in `resources/js/types/models.ts` (ScreeningResult, ASQ3DomainCode)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: TypeScript interfaces that all stories depend on

**CRITICAL**: Must complete before frontend tasks

- [ ] T004 Add new TypeScript interfaces to `resources/js/types/models.ts`: Asq3DomainResult, Asq3Recommendation, Asq3Intervention, Asq3ScreeningDetail, Asq3ScreeningHistoryItem, ScreeningsTabProps (copy from `specs/asq3-screening-realdata/contracts/asq3-screening.ts`)
- [ ] T005 [P] Add helper functions to `resources/js/types/models.ts`: getScreeningResultColor, calculateScorePercentage, getDomainIconName

**Checkpoint**: TypeScript interfaces ready for frontend implementation

---

## Phase 3: User Story 1 - Asq3RecommendationSeeder (Priority: P1)

**Goal**: Populate `asq3_recommendations` table with 150+ Indonesian developmental stimulation activities

**Independent Test**: `php artisan db:seed --class=Asq3RecommendationSeeder` creates records, `App\Models\Asq3Recommendation::count()` returns 150+

### Tests for User Story 1

- [ ] T006 [P] [US1] Create seeder test in `tests/Feature/Asq3RecommendationSeederTest.php` - verify record count, all domains covered, all age intervals covered

### Implementation for User Story 1

- [ ] T007 [US1] Create `database/seeders/Asq3RecommendationSeeder.php` using `php artisan make:seeder Asq3RecommendationSeeder`
- [ ] T008 [US1] Implement seeder structure: load domains, load age intervals, define recommendations array
- [ ] T009 [US1] Add Communication (Komunikasi) domain recommendations for all 21 age intervals in `Asq3RecommendationSeeder.php`
- [ ] T010 [US1] Add Gross Motor (Motorik Kasar) domain recommendations for all 21 age intervals in `Asq3RecommendationSeeder.php`
- [ ] T011 [P] [US1] Add Fine Motor (Motorik Halus) domain recommendations for all 21 age intervals in `Asq3RecommendationSeeder.php`
- [ ] T012 [P] [US1] Add Problem Solving (Pemecahan Masalah) domain recommendations for all 21 age intervals in `Asq3RecommendationSeeder.php`
- [ ] T013 [P] [US1] Add Personal Social (Personal Sosial) domain recommendations for all 21 age intervals in `Asq3RecommendationSeeder.php`
- [ ] T014 [US1] Register `Asq3RecommendationSeeder` in `database/seeders/ProductionSeeder.php` after Asq3DomainSeeder and Asq3AgeIntervalSeeder
- [ ] T015 [US1] Run seeder and verify: `php artisan db:seed --class=Asq3RecommendationSeeder`
- [ ] T016 [US1] Run PHPUnit test: `php artisan test --filter=Asq3RecommendationSeederTest`

**Checkpoint**: Asq3RecommendationSeeder creates 150+ Indonesian recommendations. Test passes.

---

## Phase 4: User Story 2 - Asq3ScreeningSeeder Enhancement (Priority: P2)

**Goal**: Update Asq3ScreeningSeeder to create intervention records for screenings with pantau/perlu_rujukan status

**Independent Test**: After seeding, screenings with non-sesuai results have linked Asq3ScreeningIntervention records

### Implementation for User Story 2

- [ ] T017 [US2] Add `createIntervention` method to `database/seeders/Asq3ScreeningSeeder.php` that creates Asq3ScreeningIntervention records
- [ ] T018 [US2] Update `createScreeningAnswersAndResults` method in `Asq3ScreeningSeeder.php` to call `createIntervention` for pantau/perlu_rujukan results
- [ ] T019 [US2] Run fresh seed and verify interventions: `php artisan migrate:fresh --seed`
- [ ] T020 [US2] Verify interventions exist in tinker: `App\Models\Asq3ScreeningIntervention::count()`

**Checkpoint**: Asq3ScreeningSeeder creates interventions for non-sesuai domain results.

---

## Phase 5: User Story 3 - Full-Stack Integration (Priority: P3)

**Goal**: Display real screening data in `screenings-tab.tsx` via Inertia props from ChildController

**Independent Test**: Navigate to child detail page, screenings tab shows real data from database (not mock)

### Backend Implementation for User Story 3

- [ ] T021 [US3] Add `formatScreeningsForTab` private method to `app/Http/Controllers/ChildController.php` that returns formatted screening data structure
- [ ] T022 [US3] Add `formatScreeningDetail` private method to `ChildController.php` for detailed screening transformation
- [ ] T023 [US3] Update `show` method in `ChildController.php` to use `formatScreeningsForTab` for screenings prop
- [ ] T024 [US3] Verify eager loading prevents N+1 queries in `formatScreeningsForTab` (use `with(['ageInterval', 'domainResults.domain', 'interventions'])`)

### Frontend Implementation for User Story 3

- [ ] T025 [P] [US3] Remove mock data from `resources/js/components/children/screenings-tab.tsx` (lines 29-134: latestScreening, domainScores, recommendations, screeningHistory)
- [ ] T026 [US3] Add props interface to `screenings-tab.tsx` using ScreeningsTabProps from models.ts
- [ ] T027 [US3] Update `ScreeningsTabContent` function signature in `screenings-tab.tsx` to accept and destructure props
- [ ] T028 [US3] Add empty state handling in `screenings-tab.tsx` when `latestScreening` is null
- [ ] T029 [US3] Update component rendering in `screenings-tab.tsx` to use props data instead of mock constants
- [ ] T030 [US3] Update `resources/js/pages/children/show.tsx` Props interface to include screenings data structure
- [ ] T031 [US3] Update `show.tsx` to pass screening props to ScreeningsTabContent component

### Verification for User Story 3

- [ ] T032 [US3] Run TypeScript build to verify no errors: `npm run build`
- [ ] T033 [US3] Run Laravel tests: `php artisan test`
- [ ] T034 [US3] Manual verification: Navigate to child detail page, verify screenings tab displays real data

**Checkpoint**: screenings-tab.tsx displays real screening data from database via Inertia props.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Code cleanup and final verification

- [ ] T035 Run Pint code formatter: `vendor/bin/pint --dirty`
- [ ] T036 Run full test suite: `php artisan test`
- [ ] T037 Verify no mock data remains in `screenings-tab.tsx`
- [ ] T038 Run quickstart.md verification checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - verification only
- **Foundational (Phase 2)**: No dependencies - TypeScript interfaces
- **User Story 1 (Phase 3)**: Depends on Setup verification
- **User Story 2 (Phase 4)**: Depends on US1 (recommendations exist for linking)
- **User Story 3 (Phase 5)**: Depends on Foundational (TypeScript) + US1 + US2 (data exists)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

```
Phase 1: Setup
    |
    v
Phase 2: Foundational (TypeScript)
    |
    v
Phase 3: US1 (Recommendation Seeder) ----+
    |                                     |
    v                                     |
Phase 4: US2 (Screening Seeder Update) --+
    |                                     |
    v                                     v
Phase 5: US3 Backend -----------------> US3 Frontend
    |
    v
Phase 6: Polish
```

### Within Each User Story

- Tests written first (if included)
- Backend before frontend
- Core implementation before integration
- Verify after each major task

### Parallel Opportunities

- T003 (verify types) can run parallel with T001, T002
- T005 (helper functions) can run parallel with T004
- T006 (test) can run parallel with T007 (seeder creation)
- T011, T012, T013 (domain recommendations) can run parallel after T009, T010
- T025 (remove mock) can run parallel with T021-T024 (backend)

---

## Parallel Example: Phase 3 Domain Recommendations

```bash
# After T009 and T010 complete, launch remaining domains in parallel:
Task: "Add Fine Motor recommendations in Asq3RecommendationSeeder.php"
Task: "Add Problem Solving recommendations in Asq3RecommendationSeeder.php"  
Task: "Add Personal Social recommendations in Asq3RecommendationSeeder.php"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup verification
2. Complete Phase 2: TypeScript interfaces
3. Complete Phase 3: Asq3RecommendationSeeder
4. **STOP and VALIDATE**: Run seeder, verify 150+ records
5. Can deploy with just seeder (no frontend changes yet)

### Incremental Delivery

1. Complete Setup + Foundational + US1 → Recommendations seeded
2. Add US2 → Interventions linked → Backend complete
3. Add US3 → Frontend displays real data → Feature complete
4. Each phase adds value without breaking previous work

---

## Notes

- All recommendations must be in Indonesian (Bahasa Indonesia)
- Use evidence-based ASQ-3 Learning Activities from research.md
- Follow existing patterns in sibling seeders/controllers
- No `any` type in TypeScript - use interfaces from contracts
- PHPUnit only (not Pest) for tests
- Run `vendor/bin/pint --dirty` before commits

---

## Task Summary

| Phase | Task Count | Description |
|-------|------------|-------------|
| Setup | 3 | Verification |
| Foundational | 2 | TypeScript interfaces |
| US1 | 11 | Recommendation seeder |
| US2 | 4 | Screening seeder update |
| US3 | 14 | Full-stack integration |
| Polish | 4 | Cleanup & verification |
| **Total** | **38** | |

| Story | Task Count | Files Changed |
|-------|------------|---------------|
| US1 | 11 | Asq3RecommendationSeeder.php, ProductionSeeder.php, Asq3RecommendationSeederTest.php |
| US2 | 4 | Asq3ScreeningSeeder.php |
| US3 | 14 | ChildController.php, screenings-tab.tsx, show.tsx, models.ts |
