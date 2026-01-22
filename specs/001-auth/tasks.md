# Tasks: Dual Authentication System for NAKES

**Input**: Design documents from `/specs/001-auth/`  
**Prerequisites**: plan.md, research.md, data-model.md, contracts/  
**Date**: 2026-01-17

## Summary
Implement dual authentication with complete separation:
- **Nakes**: WEB ONLY (session-based, routes/web.php)
- **Parents**: API ONLY (Sanctum tokens, routes/api.php)

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- All file paths are relative to repository root

---

## Phase 3.1: Setup & Infrastructure

- [X] T001 Create `app/Enums/UserType.php` with nakes/parent enum, label(), canUseWeb(), canUseApi() methods per data-model.md
- [X] T002 [P] Create migration `database/migrations/2026_01_17_115957_add_user_type_to_users_table.php` adding user_type column with default 'parent' and index
- [X] T003 [P] Create migration `database/migrations/2026_01_17_120018_create_nakes_profiles_table.php` with user_id, nik, puskesmas_id, position, verified_at fields
- [X] T004 [P] Create `app/Models/NakesProfile.php` model with user() relationship, fillable fields, and casts
- [X] T005 [P] Create `database/factories/NakesProfileFactory.php` with nik, position, verified_at fields

---

## Phase 3.2: Tests First (TDD) - MUST COMPLETE BEFORE 3.3

### API Auth Tests (Parent Only)

- [X] T006 [P] Update `tests/Feature/Api/V1/AuthTest.php` to explicitly use `->asParent()` state in all test user creation (update all 15+ existing tests)
- [X] T007 [P] Create `tests/Feature/Api/V1/CrossAuthTest.php` with test: `test_nakes_cannot_login_via_api` - expects 403 with NAKES_WEB_ONLY error_code
- [X] T008 [P] Add to `tests/Feature/Api/V1/CrossAuthTest.php`: `test_nakes_cannot_register_via_api` - registration as parent user only
- [X] T009 [P] Add to `tests/Feature/Api/V1/CrossAuthTest.php`: `test_ensure_parent_middleware_blocks_nakes_token` - if nakes somehow has token, 403

### Web Auth Tests (Nakes Only)

- [X] T010 [P] Create `tests/Feature/Web/NakesAuthTest.php` with test: `test_nakes_can_view_login_page`
- [X] T011 [P] Add to NakesAuthTest: `test_nakes_can_login_via_web` - creates session, redirects to /dashboard
- [X] T012 [P] SKIPPED - Nakes registration is admin-only (via seeder/phpMyAdmin). Parents register via mobile app API only.
- [X] T013 [P] Add to NakesAuthTest: `test_nakes_can_logout_via_web` - destroys session, redirects to /login
- [X] T014 [P] Add to NakesAuthTest: `test_nakes_can_access_dashboard` - with auth+ensure.nakes middleware

### Web Cross-Auth Tests

- [X] T015 [P] Create `tests/Feature/Web/CrossAuthTest.php` with test: `test_parent_cannot_login_via_web` - redirect with error message
- [X] T016 [P] Add to Web/CrossAuthTest: `test_parent_cannot_access_dashboard` - even if session exists, ensure.nakes blocks
- [X] T017 [P] Add to Web/CrossAuthTest: `test_ensure_nakes_middleware_blocks_parent_session`

### Update Existing API Tests

- [X] T018 Update `tests/Feature/Api/V1/ChildTest.php` to use `User::factory()->asParent()` in all tests
- [X] T019 Update `tests/Feature/Api/V1/AnthropometryTest.php` to use parent users
- [X] T020 Update `tests/Feature/Api/V1/FoodTest.php` to use parent users
- [X] T021 Update `tests/Feature/Api/V1/FoodLogTest.php` to use parent users
- [X] T022 Update `tests/Feature/Api/V1/Asq3Test.php` to use parent users
- [X] T023 Update `tests/Feature/Api/V1/PmtTest.php` to use parent users
- [X] T024 Update `tests/Feature/Api/V1/NotificationTest.php` to use parent users

---

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### User Model & Factory Updates

- [X] T025 Update `app/Models/User.php`: add user_type to fillable, add casts for UserType enum, add nakesProfile() relationship, add isNakes(), isParent(), canUseWeb(), canUseApi() helper methods
- [X] T026 Update `database/factories/UserFactory.php`: add user_type to definition with default 'parent', add asNakes() and asParent() state methods

### Middleware Implementation

- [X] T027 [P] Create `app/Http/Middleware/EnsureNakes.php` per data-model.md - check user_type, logout if not nakes, redirect with error
- [X] T028 [P] Create `app/Http/Middleware/EnsureParent.php` per data-model.md - check user_type, return 403 JSON if not parent

### Middleware Registration

- [X] T029 Update `bootstrap/app.php` to register middleware aliases: 'ensure.nakes' => EnsureNakes::class, 'ensure.parent' => EnsureParent::class

### API Auth Controller Updates

- [X] T030 Update `app/Http/Controllers/Api/V1/AuthController.php` login() method: check user_type before auth, return 403 if nakes with error_code NAKES_WEB_ONLY
- [X] T031 Update `app/Http/Controllers/Api/V1/AuthController.php` register() method: explicitly set user_type to 'parent'
- [X] T032 Update `app/Http/Resources/Api/V1/UserResource.php` to include user_type field in toArray()

### Web Auth Controller

- [X] T033 Create `app/Http/Controllers/Web/AuthController.php` with showLogin(), login(), logout() methods (register removed - admin only)
- [X] T034 Add login logic to Web/AuthController: validate email/password, check user_type is nakes (redirect with error if parent), Auth::attempt(), redirect to dashboard
- [X] T035 SKIPPED - Nakes registration is admin-only via seeder/phpMyAdmin
- [X] T036 Add logout logic to Web/AuthController: Auth::logout(), session invalidate, redirect to login

### Web Auth Form Requests

- [X] T037 [P] Create `app/Http/Requests/Web/LoginRequest.php` with email, password validation rules
- [X] T038 [P] Create `app/Http/Requests/Web/RegisterRequest.php` with name, email, password, nik, position validation rules (kept for future admin use)

---

## Phase 3.4: Route Integration

### API Routes Update

- [X] T039 Update `routes/api.php`: add 'ensure.parent' middleware to the protected routes group (after auth:sanctum)

### Web Routes Update

- [X] T040 Update `routes/web.php`: add guest middleware group for /login (GET, POST) routes pointing to Web/AuthController (register routes removed - admin only)
- [X] T041 Update `routes/web.php`: wrap all protected routes (dashboard, parents, children, etc.) with ['auth', 'ensure.nakes'] middleware group
- [X] T042 Update `routes/web.php`: move logout route inside protected group pointing to Web/AuthController@logout

---

## Phase 3.5: Inertia/Frontend Updates

- [X] T043 Update `app/Http/Middleware/HandleInertiaRequests.php` share() method: replace hardcoded 'Admin Nakes' with real authenticated user data including user_type and nakes_profile
- [X] T044 [P] Update `resources/js/pages/auth/login.tsx`: ensure form posts to /login with email, password, handle error display
- [X] T045 [P] SKIPPED - No web registration (nakes admin-only, parents mobile app only)

---

## Phase 3.6: Run Migrations & Verify

- [X] T046 Run `php artisan migrate` to apply user_type and nakes_profiles migrations
- [X] T047 Run `php artisan test --filter=AuthTest` to verify existing API tests pass with parent users
- [X] T048 Run `php artisan test --filter=CrossAuthTest` to verify cross-auth prevention
- [X] T049 Run `php artisan test --filter=NakesAuthTest` to verify web auth
- [X] T050 Run `php artisan test` to verify all tests pass (161 tests, 488 assertions)

---

## Phase 3.7: Polish & Validation

- [X] T051 [P] Add logging in EnsureNakes middleware for blocked access attempts
- [X] T052 [P] Add logging in EnsureParent middleware for blocked access attempts
- [X] T053 [P] Add logging in API AuthController for nakes login rejection
- [X] T054 Run `vendor/bin/pint --dirty` to fix code style
- [X] T055 Execute quickstart.md validation scenarios manually
- [X] T056 Update AGENTS.md with new auth endpoints and middleware documentation

---

## Dependencies

```
T001 (UserType enum) blocks → T025, T027, T028, T030, T031
T002, T003 (migrations) blocks → T046
T004, T005 (NakesProfile) blocks → T026, T035
T025, T026 (User model) blocks → T006-T024 tests can run
T027, T028 (middleware) blocks → T029
T029 (middleware registration) blocks → T039-T042
T039-T042 (routes) blocks → T046-T050
T006-T024 (tests) should FAIL initially → T025-T045 implementation → tests PASS
```

## Parallel Execution Examples

### Setup Phase (T001-T005):
```bash
# Launch in parallel - all independent files:
Task: "Create app/Enums/UserType.php enum"
Task: "Create migration add_user_type_to_users"
Task: "Create migration create_nakes_profiles_table"
Task: "Create app/Models/NakesProfile.php"
Task: "Create database/factories/NakesProfileFactory.php"
```

### Test Phase (T006-T017):
```bash
# Launch API tests in parallel:
Task: "Update tests/Feature/Api/V1/AuthTest.php for parent users"
Task: "Create tests/Feature/Api/V1/CrossAuthTest.php"

# Launch Web tests in parallel:
Task: "Create tests/Feature/Web/NakesAuthTest.php"
Task: "Create tests/Feature/Web/CrossAuthTest.php"
```

### Middleware Phase (T027-T028):
```bash
# Launch in parallel - different files:
Task: "Create app/Http/Middleware/EnsureNakes.php"
Task: "Create app/Http/Middleware/EnsureParent.php"
```

### Frontend Phase (T044-T045):
```bash
# Launch in parallel - different files:
Task: "Update resources/js/pages/auth/login.tsx"
Task: "Create resources/js/pages/auth/register.tsx"
```

---

## Validation Checklist

- [X] All contracts have corresponding tests (auth.yaml → T006-T009, web-auth.md → T010-T017)
- [X] All entities have model tasks (UserType → T001, NakesProfile → T004)
- [X] All tests come before implementation (T006-T024 before T025-T045)
- [X] Parallel tasks truly independent (different files)
- [X] Each task specifies exact file path
- [X] No task modifies same file as another [P] task
- [X] Cross-auth prevention tested (T007, T009, T015, T016, T017)

---

## Notes

- **TDD Enforcement**: Run tests after T006-T024, they MUST fail. Then implement T025-T045, tests should pass.
- **[P] tasks** = different files, no dependencies between them
- **Commit after each phase**, not each task
- **Run `vendor/bin/pint --dirty`** before committing

---
*Generated from specs/001-auth/ design documents*
