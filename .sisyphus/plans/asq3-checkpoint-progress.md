# ASQ-3 Checkpoint/Progress Endpoint

## TL;DR

> **Quick Summary**: Add a progress endpoint for ASQ-3 screenings that returns checkpoint data so parents can resume screening after leaving the app.
> 
> **Deliverables**:
> - New API endpoint: `GET /api/v1/children/{child}/screenings/{screening}/progress`
> - Response includes: progress %, per-domain breakdown, answered question IDs, all answers
> - PHPUnit tests covering happy path and edge cases
> 
> **Estimated Effort**: Short (single endpoint + tests)
> **Parallel Execution**: NO - sequential tasks
> **Critical Path**: Route → Controller method → Resource class → Tests

---

## Context

### Original Request
Parents need to resume ASQ-3 screening after leaving the mobile app. Current implementation saves answers incrementally but doesn't expose progress/checkpoint data for the mobile app to restore state.

### Interview Summary
**Key Discussions**:
- Current answers are saved on each `submitAnswers` call (implicit checkpoint exists)
- Mobile app needs: progress %, domain breakdown, which questions are answered
- Use existing `updated_at` timestamp as "last saved" indicator (no new column)

**Research Findings**:
- 30 questions per screening (5 domains × 6 questions each)
- Asq3ScreeningAnswer has `created_at` but no `updated_at` (timestamps disabled)
- Screening's `updated_at` is already updated when answers submitted
- Authorization helpers exist: `authorizeChild()`, `authorizeScreening()`

### Metis Review
**Identified Gaps** (addressed):
- Completed screening behavior: Return 100% progress with all data (not error)
- Cancelled screening behavior: Return data with status "cancelled"
- Use screening's `updated_at` as `last_saved_at` (no migration needed)
- Round progress percent to integer

---

## Work Objectives

### Core Objective
Enable mobile app to display screening progress and restore checkpoint state when parents return to an in-progress screening.

### Concrete Deliverables
- `GET /api/v1/children/{child}/screenings/{screening}/progress` endpoint
- `Asq3ScreeningProgressResource` API resource class
- PHPUnit tests in `tests/Feature/Api/V1/Asq3Test.php`

### Definition of Done
- [x] Endpoint returns correct progress data for in-progress screenings
- [x] Endpoint works for completed and cancelled screenings
- [x] Domain-level progress is accurate (answered/total per domain)
- [x] All answers included in response
- [x] Authorization enforced (parent can only access own child's screenings)
- [x] Tests pass: `php artisan test --filter=Asq3`

### Must Have
- Progress percentage (integer, 0-100)
- Per-domain breakdown (5 domains with answered/total counts)
- List of answered question IDs
- All answers with question_id, answer, score
- `last_saved_at` timestamp (from screening's `updated_at`)
- Works for all screening statuses (in_progress, completed, cancelled)

### Must NOT Have (Guardrails)
- New database migrations or columns
- `updated_at` on Asq3ScreeningAnswer table
- Resume/pause endpoints or auto-navigation logic
- Caching layer (mobile app responsibility)
- Push notification or reminder features
- Analytics or engagement tracking
- Changes to existing answer submission workflow
- Rate limiting (beyond existing API limits)

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
> ALL verification is executed by the agent using tools.

### Test Decision
- **Infrastructure exists**: YES (PHPUnit)
- **Automated tests**: YES (Tests-after)
- **Framework**: PHPUnit with Laravel Sanctum

### Agent-Executed QA Scenarios (MANDATORY)

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **API Endpoint** | Bash (curl) | Send request, parse JSON response, assert fields |
| **Tests** | Bash (php artisan test) | Run tests, check exit code |
| **PHP Syntax** | Bash (php -l) | Lint PHP files |

---

## Execution Strategy

### Sequential Execution

```
Task 1: Add route definition
    ↓
Task 2: Create Asq3ScreeningProgressResource
    ↓
Task 3: Add progress() method to Asq3Controller
    ↓
Task 4: Write PHPUnit tests
    ↓
Task 5: Run tests and verify
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | None | 3 |
| 2 | None | 3 |
| 3 | 1, 2 | 4, 5 |
| 4 | 3 | 5 |
| 5 | 4 | None |

---

## TODOs

- [x] 1. Add route for progress endpoint

  **What to do**:
  - Add `GET {screening}/progress` route in `routes/api.php`
  - Place inside existing `children/{child}/screenings` prefix group
  - Route to `Asq3Controller::progress`

  **Must NOT do**:
  - Rename or restructure existing routes
  - Add middleware beyond existing group

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 2)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `routes/api.php:129-136` - Existing screening routes group

  **Acceptance Criteria**:

  ```
  Scenario: Route registered correctly
    Tool: Bash (php artisan)
    Steps:
      1. php artisan route:list --path=screenings --columns=method,uri,action
      2. Assert: Output contains "GET|HEAD" and "screenings/{screening}/progress"
      3. Assert: Output contains "Asq3Controller@progress"
    Expected Result: Route listed with correct method and controller
    Evidence: route:list output
  ```

  **Commit**: NO (bundle with Task 3)

---

- [x] 2. Create Asq3ScreeningProgressResource

  **What to do**:
  - Create `app/Http/Resources/Api/V1/Asq3ScreeningProgressResource.php`
  - Transform screening into progress response structure
  - Include: screening_id, status, total_questions, answered_questions, progress_percent, last_saved_at, domains array, answers array

  **Must NOT do**:
  - Modify existing Asq3ScreeningResource
  - Add computed properties to model
  - Create separate domain progress resource (inline in array)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `app/Http/Resources/Api/V1/Asq3ScreeningResource.php` - Existing resource pattern
  - `app/Models/Asq3Screening.php:74-77` - answers() relationship
  - `app/Models/Asq3Domain.php` - Domain model for iteration

  **Response Structure**:
  ```json
  {
    "data": {
      "screening_id": 1,
      "status": "in_progress",
      "total_questions": 30,
      "answered_questions": 15,
      "progress_percent": 50,
      "last_saved_at": "2026-02-04T06:30:00Z",
      "domains": [
        {
          "domain_code": "communication",
          "domain_name": "Komunikasi",
          "answered_questions": 4,
          "total_questions": 6,
          "progress_percent": 67
        }
      ],
      "answered_question_ids": [1, 2, 3, 5, 7],
      "answers": [
        {
          "question_id": 1,
          "answer": "yes",
          "score": 10,
          "created_at": "2026-02-04T06:00:00Z"
        }
      ]
    }
  }
  ```

  **Acceptance Criteria**:

  ```
  Scenario: Resource file created with valid PHP syntax
    Tool: Bash (php -l)
    Steps:
      1. php -l app/Http/Resources/Api/V1/Asq3ScreeningProgressResource.php
      2. Assert: "No syntax errors detected"
    Expected Result: Valid PHP syntax
    Evidence: php -l output
  ```

  **Commit**: NO (bundle with Task 3)

---

- [x] 3. Add progress() method to Asq3Controller

  **What to do**:
  - Add `progress(Request $request, Child $child, Asq3Screening $screening)` method
  - Use existing `authorizeChild()` and `authorizeScreening()` helpers
  - Load screening with answers and questions
  - Calculate progress using domain relationships
  - Return `Asq3ScreeningProgressResource`

  **Must NOT do**:
  - Change authorization logic
  - Add new dependencies or services
  - Reject completed/cancelled screenings (return data for all statuses)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 4, 5
  - **Blocked By**: Task 1, 2

  **References**:
  - `app/Http/Controllers/Api/V1/Asq3Controller.php:160-170` - show() method pattern
  - `app/Http/Controllers/Api/V1/Asq3Controller.php:359-374` - Authorization helpers
  - `app/Models/Asq3Domain.php` - Get all domains for iteration

  **Implementation Notes**:
  ```php
  public function progress(Request $request, Child $child, Asq3Screening $screening): JsonResponse
  {
      $this->authorizeChild($request, $child);
      $this->authorizeScreening($child, $screening);

      $screening->load(['answers.question', 'ageInterval']);

      return response()->json([
          'data' => new Asq3ScreeningProgressResource($screening),
      ]);
  }
  ```

  **Acceptance Criteria**:

  ```
  Scenario: Controller method has valid PHP syntax
    Tool: Bash (php -l)
    Steps:
      1. php -l app/Http/Controllers/Api/V1/Asq3Controller.php
      2. Assert: "No syntax errors detected"
    Expected Result: Valid PHP syntax
    Evidence: php -l output

  Scenario: Endpoint returns 200 for valid request
    Tool: Bash (curl via php artisan tinker test)
    Preconditions: Dev server running, test data seeded
    Steps:
      1. Create test user, child, screening with answers via tinker
      2. Get Sanctum token
      3. curl -X GET /api/v1/children/{child}/screenings/{screening}/progress
      4. Assert: HTTP 200
      5. Assert: Response contains "progress_percent"
    Expected Result: Valid progress response
    Evidence: curl output
  ```

  **Commit**: YES
  - Message: `feat(api): add ASQ-3 screening progress endpoint for checkpoint/resume`
  - Files: `routes/api.php`, `app/Http/Controllers/Api/V1/Asq3Controller.php`, `app/Http/Resources/Api/V1/Asq3ScreeningProgressResource.php`
  - Pre-commit: `php -l` on all files

---

- [x] 4. Write PHPUnit tests

  **What to do**:
  - Add tests to `tests/Feature/Api/V1/Asq3Test.php`
  - Test cases:
    1. Happy path: in-progress screening with partial answers
    2. Empty screening (0 answers)
    3. Completed screening (100% progress)
    4. Cancelled screening
    5. Authorization: wrong user gets 403
    6. Authorization: unauthenticated gets 401
    7. Screening not found gets 404
    8. Progress percent calculation accuracy

  **Must NOT do**:
  - Create separate test file
  - Mock database (use RefreshDatabase)
  - Skip authorization tests

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 5
  - **Blocked By**: Task 3

  **References**:
  - `tests/Feature/Api/V1/Asq3Test.php:14-53` - Existing test setup and master data seeding
  - `tests/Feature/Api/V1/Asq3Test.php:55-69` - Test method patterns

  **Test Methods to Add**:
  ```php
  public function test_get_progress_returns_correct_data(): void
  public function test_get_progress_for_empty_screening(): void
  public function test_get_progress_for_completed_screening(): void
  public function test_get_progress_for_cancelled_screening(): void
  public function test_get_progress_requires_child_ownership(): void
  public function test_get_progress_requires_authentication(): void
  public function test_get_progress_returns_404_for_invalid_screening(): void
  public function test_get_progress_calculates_domain_progress_correctly(): void
  ```

  **Acceptance Criteria**:

  ```
  Scenario: All new tests pass
    Tool: Bash (php artisan test)
    Steps:
      1. php artisan test --filter=test_get_progress
      2. Assert: Exit code 0
      3. Assert: All tests pass (no failures)
    Expected Result: 8 tests pass
    Evidence: Test output

  Scenario: Test file has valid PHP syntax
    Tool: Bash (php -l)
    Steps:
      1. php -l tests/Feature/Api/V1/Asq3Test.php
      2. Assert: "No syntax errors detected"
    Expected Result: Valid PHP syntax
    Evidence: php -l output
  ```

  **Commit**: YES
  - Message: `test(api): add tests for ASQ-3 screening progress endpoint`
  - Files: `tests/Feature/Api/V1/Asq3Test.php`
  - Pre-commit: `php artisan test --filter=test_get_progress`

---

- [x] 5. Run full test suite and verify

  **What to do**:
  - Run all ASQ-3 related tests
  - Verify no regressions in existing tests
  - Run Laravel Pint for code formatting

  **Must NOT do**:
  - Skip existing tests
  - Ignore Pint formatting

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: None (final task)
  - **Blocked By**: Task 4

  **Acceptance Criteria**:

  ```
  Scenario: All ASQ-3 tests pass
    Tool: Bash (php artisan test)
    Steps:
      1. php artisan test --filter=Asq3
      2. Assert: Exit code 0
      3. Assert: All tests pass
    Expected Result: All tests green
    Evidence: Test output with pass count

  Scenario: Code formatting passes
    Tool: Bash (vendor/bin/pint)
    Steps:
      1. vendor/bin/pint --dirty
      2. Assert: Exit code 0 or files fixed
    Expected Result: Code properly formatted
    Evidence: Pint output
  ```

  **Commit**: NO (verification only, or YES if Pint makes changes)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 3 | `feat(api): add ASQ-3 screening progress endpoint for checkpoint/resume` | routes/api.php, Asq3Controller.php, Asq3ScreeningProgressResource.php | `php -l` on all files |
| 4 | `test(api): add tests for ASQ-3 screening progress endpoint` | Asq3Test.php | `php artisan test --filter=test_get_progress` |

---

## Success Criteria

### Verification Commands
```bash
# Verify route exists
php artisan route:list --path=progress

# Verify PHP syntax
php -l app/Http/Controllers/Api/V1/Asq3Controller.php
php -l app/Http/Resources/Api/V1/Asq3ScreeningProgressResource.php

# Run tests
php artisan test --filter=Asq3

# Code formatting
vendor/bin/pint --dirty
```

### Final Checklist
- [x] All "Must Have" present:
  - [x] Progress percentage (integer 0-100)
  - [x] Per-domain breakdown (5 domains)
  - [x] Answered question IDs list
  - [x] All answers with question_id, answer, score
  - [x] last_saved_at timestamp
  - [x] Works for all statuses
- [x] All "Must NOT Have" absent:
  - [x] No new migrations
  - [x] No changes to existing answer workflow
  - [x] No caching implementation
- [x] All tests pass

---

## API Reference (Final Specification)

### Endpoint
```
GET /api/v1/children/{child}/screenings/{screening}/progress
```

### Headers
```
Authorization: Bearer {token}
Accept: application/json
```

### Response (200 OK)
```json
{
  "data": {
    "screening_id": 1,
    "status": "in_progress",
    "total_questions": 30,
    "answered_questions": 15,
    "progress_percent": 50,
    "last_saved_at": "2026-02-04T06:30:00+00:00",
    "domains": [
      {
        "domain_code": "communication",
        "domain_name": "Komunikasi",
        "answered_questions": 4,
        "total_questions": 6,
        "progress_percent": 67
      },
      {
        "domain_code": "gross_motor",
        "domain_name": "Motorik Kasar",
        "answered_questions": 3,
        "total_questions": 6,
        "progress_percent": 50
      },
      {
        "domain_code": "fine_motor",
        "domain_name": "Motorik Halus",
        "answered_questions": 2,
        "total_questions": 6,
        "progress_percent": 33
      },
      {
        "domain_code": "problem_solving",
        "domain_name": "Pemecahan Masalah",
        "answered_questions": 3,
        "total_questions": 6,
        "progress_percent": 50
      },
      {
        "domain_code": "personal_social",
        "domain_name": "Personal Sosial",
        "answered_questions": 3,
        "total_questions": 6,
        "progress_percent": 50
      }
    ],
    "answered_question_ids": [1, 2, 3, 5, 7, 8, 10, 12, 14, 15, 18, 20, 22, 25, 28],
    "answers": [
      {
        "question_id": 1,
        "answer": "yes",
        "score": 10,
        "created_at": "2026-02-04T06:00:00+00:00"
      }
    ]
  }
}
```

### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 401 | Unauthenticated | `{"message": "Unauthenticated."}` |
| 403 | Not owner of child | `{"message": "Anda tidak memiliki akses ke data anak ini"}` |
| 404 | Screening not found or doesn't belong to child | `{"message": "Data screening tidak ditemukan"}` |
