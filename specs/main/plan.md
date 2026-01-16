# Implementation Plan: API Testing for Mobile Application

**Branch**: `main` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/main/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path ✓
   → Found: API testing for NAKES mobile app
2. Fill Technical Context ✓
   → Project Type: mobile (app + api)
   → Structure Decision: Existing Laravel structure
3. Evaluate Constitution Check ✓
   → Simplicity: Using Laravel's built-in testing
   → Testing: TDD approach with PHPUnit
4. Execute Phase 0 → research.md ✓
5. Execute Phase 1 → contracts, data-model.md, quickstart.md ✓
6. Re-evaluate Constitution Check ✓
7. Plan Phase 2 → Describe task generation approach ✓
8. STOP - Ready for /tasks command
```

## Summary
Create comprehensive PHPUnit API tests for the existing NAKES (Child Health Tracking) Laravel application. The API serves a mobile application with endpoints for authentication, child management, anthropometry (growth tracking), food/nutrition logging, ASQ-3 developmental screenings, PMT (supplementary feeding) schedules, and notifications. Tests will cover all 7 API domains with happy paths, error scenarios, authorization, and validation testing using existing model factories.

## Technical Context
**Language/Version**: PHP 8.5  
**Primary Dependencies**: Laravel 12, PHPUnit 11, Sanctum v4  
**Storage**: MySQL/SQLite (for testing)  
**Testing**: PHPUnit with RefreshDatabase trait  
**Target Platform**: Laravel API (mobile app backend)  
**Project Type**: mobile (api + app)  
**Performance Goals**: N/A for tests, focus on coverage  
**Constraints**: Use existing factories, follow existing test conventions  
**Scale/Scope**: ~50 API endpoints across 7 domains

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (existing Laravel app with tests)
- Using framework directly? YES - Laravel's built-in testing features
- Single data model? YES - using existing Eloquent models
- Avoiding patterns? YES - direct testing, no abstractions

**Architecture**:
- EVERY feature as library? N/A - testing existing API, not creating new libs
- Libraries listed: N/A
- CLI per library: N/A
- Library docs: N/A

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? YES - tests first, then verify they fail
- Git commits show tests before implementation? YES (tests ARE the implementation)
- Order: Contract→Integration→E2E→Unit strictly followed? YES
- Real dependencies used? YES - SQLite in-memory for speed
- Integration tests for: YES - API endpoints are integration tests by nature
- FORBIDDEN: N/A (not implementing new features)

**Observability**:
- Structured logging included? N/A for tests
- Frontend logs → backend? N/A
- Error context sufficient? YES - assertions provide clear failure messages

**Versioning**:
- Version number assigned? N/A for tests
- BUILD increments on every change? N/A
- Breaking changes handled? N/A

## Project Structure

### Documentation (this feature)
```
specs/main/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   └── api-endpoints.md # API contract documentation
└── tasks.md             # Phase 2 output (/tasks command)
```

### Source Code (existing repository structure)
```
tests/
├── Feature/
│   ├── Api/
│   │   ├── V1/
│   │   │   ├── AuthTest.php         # Authentication tests
│   │   │   ├── ChildTest.php        # Child management tests
│   │   │   ├── AnthropometryTest.php # Growth measurements tests
│   │   │   ├── FoodTest.php         # Food catalog tests
│   │   │   ├── FoodLogTest.php      # Food logging tests
│   │   │   ├── Asq3Test.php         # ASQ-3 screening tests
│   │   │   ├── PmtTest.php          # PMT schedule tests
│   │   │   └── NotificationTest.php # Notification tests
│   │   └── ExampleTest.php
│   └── ExampleTest.php
├── Unit/
│   └── ExampleTest.php
└── TestCase.php
```

**Structure Decision**: Use existing Laravel test structure, add `Api/V1/` namespace

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context**:
   - ✓ Testing conventions - Use PHPUnit, factories, RefreshDatabase
   - ✓ Authentication testing - Sanctum's `actingAs()` helper
   - ✓ API response assertions - Laravel's built-in JSON assertions

2. **Generate and dispatch research agents**:
   - ✓ Laravel API testing best practices
   - ✓ Sanctum authentication testing patterns
   - ✓ PHPUnit assertions for JSON responses

3. **Consolidate findings** in `research.md`:
   - See research.md for detailed findings

**Output**: research.md with all technical decisions resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Existing models: User, Child, AnthropometryMeasurement, Food, FoodLog, FoodLogItem, Asq3Screening, Asq3Domain, Asq3AgeInterval, Asq3Question, Asq3Recommendation, PmtMenu, PmtSchedule, PmtLog, Notification
   - Existing factories: All models have factories

2. **Generate API contracts** from functional requirements:
   - 7 API domains documented in contracts/api-endpoints.md
   - ~50 endpoints total

3. **Generate contract tests** from contracts:
   - One test file per domain
   - Tests will assert request/response schemas

4. **Extract test scenarios** from user stories:
   - Happy path: successful CRUD operations
   - Error paths: 401 unauthorized, 403 forbidden, 404 not found, 422 validation
   - Edge cases: empty data, boundary values

5. **Update agent file**: N/A for testing feature

**Output**: data-model.md, /contracts/*, quickstart.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Generate tasks from Phase 1 design docs
- Each API domain → test file task
- Each endpoint → test method(s)
- Group by domain for organization

**Ordering Strategy**:
- Auth tests first (foundation for all other tests)
- Child tests second (required for nested resources)
- Other domain tests can be parallel
- Mark [P] for parallel execution

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md - write test files)  
**Phase 5**: Validation (run `php artisan test`, ensure all pass)

## Complexity Tracking
*No violations - using Laravel's built-in testing features*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None      | N/A        | N/A                                 |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command) - 115 tasks across 8 test files
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none needed)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
