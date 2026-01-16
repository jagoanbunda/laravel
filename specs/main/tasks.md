# Tasks: API Testing for Mobile Application

**Input**: Design documents from `/specs/main/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Tech stack: PHP 8.5, Laravel 12, PHPUnit 11, Sanctum v4
   → Structure: tests/Feature/Api/V1/
2. Load optional design documents:
   → data-model.md: 15 entities with factories ✓
   → contracts/api-endpoints.md: 8 API domains, ~50 endpoints ✓
   → research.md: Testing patterns and conventions ✓
   → quickstart.md: Test structure and assertions ✓
3. Generate tasks by category ✓
4. Apply task rules ✓
5. Number tasks sequentially ✓
6. Generate dependency graph ✓
7. Create parallel execution examples ✓
8. Validate task completeness ✓
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Test files**: `tests/Feature/Api/V1/`
- **Controllers**: `app/Http/Controllers/Api/V1/`
- **Factories**: `database/factories/`
- **Models**: `app/Models/`

---

## Phase 3.1: Setup
- [ ] T001 Create test directory structure at `tests/Feature/Api/V1/`
- [ ] T002 Verify existing factories work with `php artisan tinker` (User, Child, Food, etc.)
- [ ] T003 Run existing tests to establish baseline with `php artisan test`

## Phase 3.2: Authentication API Tests (Foundation) ⚠️ MUST COMPLETE FIRST
**CRITICAL: Auth tests are foundation for all other tests**

- [ ] T004 Create `tests/Feature/Api/V1/AuthTest.php` with PHPUnit structure and RefreshDatabase trait
- [ ] T005 Test user registration success (POST /api/v1/auth/register) - returns 201 with token
- [ ] T006 Test registration validation errors - missing name, invalid email, weak password (422)
- [ ] T007 Test registration duplicate email rejection (422)
- [ ] T008 Test user login success (POST /api/v1/auth/login) - returns 200 with token
- [ ] T009 Test login with invalid credentials (422)
- [ ] T010 Test logout revokes token (POST /api/v1/auth/logout) - returns 200
- [ ] T011 Test logout requires authentication (401)
- [ ] T012 Test token refresh (POST /api/v1/auth/refresh) - returns new token
- [ ] T013 Test get profile (GET /api/v1/auth/me) - returns user data
- [ ] T014 Test update profile (PUT /api/v1/auth/profile) - returns updated user
- [ ] T015 Run AuthTest to verify: `php artisan test tests/Feature/Api/V1/AuthTest.php`

## Phase 3.3: Children API Tests (Required for Nested Resources)
**Depends on: T004 (Auth patterns established)**

- [ ] T016 Create `tests/Feature/Api/V1/ChildTest.php` with RefreshDatabase trait
- [ ] T017 Test list children requires auth (GET /api/v1/children) - 401 without token
- [ ] T018 Test list children returns user's children only - verify isolation
- [ ] T019 Test create child success (POST /api/v1/children) - returns 201
- [ ] T020 Test create child validation - missing name, invalid gender, future birthday (422)
- [ ] T021 Test get child (GET /api/v1/children/{id}) - returns child data
- [ ] T022 Test get child returns 403 for another user's child (authorization)
- [ ] T023 Test get child returns 404 for non-existent child
- [ ] T024 Test update child (PUT /api/v1/children/{id}) - returns 200
- [ ] T025 Test delete child soft deletes (DELETE /api/v1/children/{id}) - assertSoftDeleted
- [ ] T026 Test child summary (GET /api/v1/children/{id}/summary) - returns aggregated data
- [ ] T027 Run ChildTest: `php artisan test tests/Feature/Api/V1/ChildTest.php`

## Phase 3.4: Parallel Domain Tests [P] (Independent Test Files)
**Depends on: T016 (Child patterns established). These can run in parallel.**

### T028-T039: Anthropometry Tests [P]
- [ ] T028 [P] Create `tests/Feature/Api/V1/AnthropometryTest.php`
- [ ] T029 [P] Test list measurements (GET /api/v1/children/{child}/anthropometry) - 200
- [ ] T030 [P] Test list measurements requires child ownership - 403
- [ ] T031 [P] Test create measurement (POST /api/v1/children/{child}/anthropometry) - 201
- [ ] T032 [P] Test create measurement validation - weight/height range, date not future
- [ ] T033 [P] Test get measurement (GET /api/v1/children/{child}/anthropometry/{id})
- [ ] T034 [P] Test update measurement (PUT) - 200
- [ ] T035 [P] Test delete measurement (DELETE) - 200
- [ ] T036 [P] Test growth chart (GET /api/v1/children/{child}/growth-chart) - returns data
- [ ] T037 [P] Test measurement for non-owned child returns 403
- [ ] T038 [P] Test measurement not found returns 404
- [ ] T039 [P] Run AnthropometryTest: `php artisan test tests/Feature/Api/V1/AnthropometryTest.php`

### T040-T051: Food Tests [P]
- [ ] T040 [P] Create `tests/Feature/Api/V1/FoodTest.php`
- [ ] T041 [P] Test list foods (GET /api/v1/foods) - returns system + user foods
- [ ] T042 [P] Test list foods requires auth - 401
- [ ] T043 [P] Test create custom food (POST /api/v1/foods) - 201, is_system=false
- [ ] T044 [P] Test create food validation - required fields (422)
- [ ] T045 [P] Test get food details (GET /api/v1/foods/{id}) - 200
- [ ] T046 [P] Test update user-created food (PUT) - 200
- [ ] T047 [P] Test cannot update system food - 403
- [ ] T048 [P] Test delete user-created food (DELETE) - 200
- [ ] T049 [P] Test cannot delete system food - 403
- [ ] T050 [P] Test get food categories (GET /api/v1/foods-categories) - returns array
- [ ] T051 [P] Run FoodTest: `php artisan test tests/Feature/Api/V1/FoodTest.php`

### T052-T065: Food Log Tests [P]
- [ ] T052 [P] Create `tests/Feature/Api/V1/FoodLogTest.php`
- [ ] T053 [P] Test list food logs (GET /api/v1/children/{child}/food-logs) - 200
- [ ] T054 [P] Test list food logs for non-owned child - 403
- [ ] T055 [P] Test create food log (POST /api/v1/children/{child}/food-logs) - 201
- [ ] T056 [P] Test create food log with items - calculates totals
- [ ] T057 [P] Test create food log validation - meal_time enum, date required
- [ ] T058 [P] Test get food log (GET /api/v1/children/{child}/food-logs/{id})
- [ ] T059 [P] Test update food log (PUT) - 200
- [ ] T060 [P] Test delete food log (DELETE) - 200
- [ ] T061 [P] Test nutrition summary (GET /api/v1/children/{child}/nutrition-summary)
- [ ] T062 [P] Test nutrition summary with date filter
- [ ] T063 [P] Test nutrition summary returns zeros for no data
- [ ] T064 [P] Test food log authorization - 403 for wrong user
- [ ] T065 [P] Run FoodLogTest: `php artisan test tests/Feature/Api/V1/FoodLogTest.php`

### T066-T083: ASQ-3 Tests [P]
- [ ] T066 [P] Create `tests/Feature/Api/V1/Asq3Test.php`
- [ ] T067 [P] Test get domains (GET /api/v1/asq3/domains) - returns domain list
- [ ] T068 [P] Test get age intervals (GET /api/v1/asq3/age-intervals) - returns intervals
- [ ] T069 [P] Test get questions for interval (GET /api/v1/asq3/age-intervals/{id}/questions)
- [ ] T070 [P] Test get recommendations (GET /api/v1/asq3/recommendations)
- [ ] T071 [P] Test list screenings (GET /api/v1/children/{child}/screenings) - 200
- [ ] T072 [P] Test list screenings requires child ownership - 403
- [ ] T073 [P] Test start screening (POST /api/v1/children/{child}/screenings) - 201
- [ ] T074 [P] Test get screening (GET /api/v1/children/{child}/screenings/{id})
- [ ] T075 [P] Test update screening (PUT) - 200
- [ ] T076 [P] Test submit answers (POST /api/v1/children/{child}/screenings/{id}/answers)
- [ ] T077 [P] Test submit answers validation - question_id, response enum
- [ ] T078 [P] Test get screening results (GET /api/v1/children/{child}/screenings/{id}/results)
- [ ] T079 [P] Test results include domain scores and overall status
- [ ] T080 [P] Test screening authorization - 403 for wrong user
- [ ] T081 [P] Test screening not found - 404
- [ ] T082 [P] Test master data requires auth - 401
- [ ] T083 [P] Run Asq3Test: `php artisan test tests/Feature/Api/V1/Asq3Test.php`

### T084-T097: PMT Tests [P]
- [ ] T084 [P] Create `tests/Feature/Api/V1/PmtTest.php`
- [ ] T085 [P] Test get menus (GET /api/v1/pmt/menus) - returns menu list
- [ ] T086 [P] Test menus requires auth - 401
- [ ] T087 [P] Test list schedules (GET /api/v1/children/{child}/pmt-schedules) - 200
- [ ] T088 [P] Test create schedule (POST /api/v1/children/{child}/pmt-schedules) - 201
- [ ] T089 [P] Test create schedule validation - menu_id required, date required
- [ ] T090 [P] Test get progress (GET /api/v1/children/{child}/pmt-progress)
- [ ] T091 [P] Test progress returns completion stats
- [ ] T092 [P] Test log PMT (POST /api/v1/pmt-schedules/{schedule}/log) - 201
- [ ] T093 [P] Test update PMT log (PUT /api/v1/pmt-schedules/{schedule}/log)
- [ ] T094 [P] Test schedule authorization - 403 for wrong user
- [ ] T095 [P] Test log authorization - 403 for wrong user
- [ ] T096 [P] Test schedule not found - 404
- [ ] T097 [P] Run PmtTest: `php artisan test tests/Feature/Api/V1/PmtTest.php`

### T098-T111: Notification Tests [P]
- [ ] T098 [P] Create `tests/Feature/Api/V1/NotificationTest.php`
- [ ] T099 [P] Test list notifications (GET /api/v1/notifications) - returns user's notifications
- [ ] T100 [P] Test list notifications requires auth - 401
- [ ] T101 [P] Test list notifications with unread_only filter
- [ ] T102 [P] Test get unread count (GET /api/v1/notifications/unread-count)
- [ ] T103 [P] Test mark as read (PUT /api/v1/notifications/{id}/read) - sets read_at
- [ ] T104 [P] Test mark as read requires ownership - 403
- [ ] T105 [P] Test mark all as read (POST /api/v1/notifications/read-all) - returns count
- [ ] T106 [P] Test delete notification (DELETE /api/v1/notifications/{id}) - 200
- [ ] T107 [P] Test delete requires ownership - 403
- [ ] T108 [P] Test notification not found - 404
- [ ] T109 [P] Test notifications ordered by created_at desc
- [ ] T110 [P] Test different notification types (screening_reminder, pmt_reminder)
- [ ] T111 [P] Run NotificationTest: `php artisan test tests/Feature/Api/V1/NotificationTest.php`

## Phase 3.5: Integration & Final Validation

- [ ] T112 Run all API tests: `php artisan test tests/Feature/Api/V1/`
- [ ] T113 Verify test coverage across all endpoints (check any missed)
- [ ] T114 Run full test suite: `php artisan test`
- [ ] T115 Document test results and any issues found

---

## Dependencies

```
T001-T003 (Setup) → T004 (Auth foundation)
T004-T015 (Auth) → T016 (Child patterns)
T016-T027 (Child) → T028-T111 (All parallel domain tests)
T028-T111 (Domain tests) → T112-T115 (Final validation)
```

### Dependency Graph
```
Setup (T001-T003)
    │
    ▼
Auth Tests (T004-T015) ← Foundation for all tests
    │
    ▼
Child Tests (T016-T027) ← Required for nested resources
    │
    ├──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
    ▼              ▼              ▼              ▼              ▼              ▼
Anthropometry  Food Tests    FoodLog Tests   ASQ-3 Tests   PMT Tests    Notification
(T028-T039)    (T040-T051)   (T052-T065)     (T066-T083)   (T084-T097)  (T098-T111)
    │              │              │              │              │              │
    └──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
                                        │
                                        ▼
                              Final Validation (T112-T115)
```

---

## Parallel Execution Examples

### Example 1: Create All Test Files (After T016)
```bash
# Launch T028, T040, T052, T066, T084, T098 together:
# These create independent test files

Task: "Create tests/Feature/Api/V1/AnthropometryTest.php with PHPUnit structure"
Task: "Create tests/Feature/Api/V1/FoodTest.php with PHPUnit structure"
Task: "Create tests/Feature/Api/V1/FoodLogTest.php with PHPUnit structure"
Task: "Create tests/Feature/Api/V1/Asq3Test.php with PHPUnit structure"
Task: "Create tests/Feature/Api/V1/PmtTest.php with PHPUnit structure"
Task: "Create tests/Feature/Api/V1/NotificationTest.php with PHPUnit structure"
```

### Example 2: Anthropometry Tests (All parallel within domain)
```bash
# After T028 creates file, launch T029-T038 together:

Task: "Add test_list_measurements_returns_200 to AnthropometryTest.php"
Task: "Add test_list_measurements_requires_child_ownership to AnthropometryTest.php"
Task: "Add test_create_measurement_returns_201 to AnthropometryTest.php"
# ... etc
```

### Example 3: Run All Domain Tests (After all implemented)
```bash
# Launch all test runs together (T039, T051, T065, T083, T097, T111):

php artisan test tests/Feature/Api/V1/AnthropometryTest.php &
php artisan test tests/Feature/Api/V1/FoodTest.php &
php artisan test tests/Feature/Api/V1/FoodLogTest.php &
php artisan test tests/Feature/Api/V1/Asq3Test.php &
php artisan test tests/Feature/Api/V1/PmtTest.php &
php artisan test tests/Feature/Api/V1/NotificationTest.php &
wait
```

---

## Notes

- **[P] tasks**: Different files, no dependencies - safe to parallelize
- **Sequential tasks**: Within same file or have dependencies
- **Commit after each test file**: Keep changes atomic
- **Run tests frequently**: `php artisan test --filter=TestName` after each change
- **Use factories**: All models have factories with useful states
- **Indonesian messages**: Error messages use Indonesian (as per existing controllers)

---

## Validation Checklist
*GATE: Checked before marking complete*

- [x] All 8 API domains have corresponding test files
- [x] All ~50 endpoints have test coverage
- [x] Auth tests come first (foundation)
- [x] Child tests come second (nested resources depend on it)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Tests follow patterns from research.md
- [x] Tests use factories from data-model.md

---

## Estimated Counts

| Domain | Test File | Test Methods |
|--------|-----------|--------------|
| Auth | AuthTest.php | ~12 |
| Children | ChildTest.php | ~12 |
| Anthropometry | AnthropometryTest.php | ~12 |
| Foods | FoodTest.php | ~12 |
| Food Logs | FoodLogTest.php | ~14 |
| ASQ-3 | Asq3Test.php | ~18 |
| PMT | PmtTest.php | ~14 |
| Notifications | NotificationTest.php | ~14 |
| **Total** | **8 files** | **~108 tests** |

---

*Generated from: plan.md, research.md, data-model.md, contracts/api-endpoints.md, quickstart.md*
