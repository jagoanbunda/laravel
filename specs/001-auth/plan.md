# Implementation Plan: Dual Authentication System for NAKES


**Branch**: `001-auth` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-auth/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   -> DONE: Feature spec loaded
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   -> DONE: All context filled (UPDATED for dual auth)
3. Evaluate Constitution Check section below
   -> DONE: Constitution check passed
4. Execute Phase 0 -> research.md
   -> DONE: research.md created (UPDATED for dual auth)
5. Execute Phase 1 -> contracts, data-model.md, quickstart.md
   -> DONE: All artifacts created (UPDATED for dual auth)
6. Re-evaluate Constitution Check section
   -> DONE: Post-design check passed
7. Plan Phase 2 -> Describe task generation approach (DO NOT create tasks.md)
   -> DONE: Task approach described below
8. STOP - Ready for /tasks command
   -> COMPLETE
```

## Summary
Implement **DUAL authentication system** with complete separation:
- **Nakes (Healthcare Workers)**: WEB ONLY authentication (session-based, Inertia/React)
- **Parents (Mobile App Users)**: API ONLY authentication (Sanctum token-based)

**CRITICAL**: These are mutually exclusive:
- Nakes CANNOT login via API
- Parents CANNOT login via web

## Technical Context
**Language/Version**: PHP 8.5  
**Primary Dependencies**: Laravel 12, Sanctum v4, PHPUnit 11, Inertia.js v2  
**Storage**: MySQL/SQLite (existing), migrations for user_type column  
**Testing**: PHPUnit 11 (existing tests must be updated)  
**Target Platforms**:
- **Web**: Nakes dashboard (Inertia/React, session auth)
- **Mobile API**: Parent app (Sanctum tokens)
**Project Type**: Dual frontend (web + API)  
**Performance Goals**: <100ms auth response time, efficient role checks  
**Constraints**: Backward compatible, existing API users default to `parent`  
**Scale/Scope**: ~1000 families (API), ~50 nakes workers (web) initially

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (single Laravel app serving both web and API)
- Using framework directly? YES - Laravel session + Sanctum, no custom auth wrapper
- Single data model? YES - extending existing User model with enum field
- Avoiding patterns? YES - no Repository/UoW, using Eloquent directly

**Architecture**:
- EVERY feature as library? N/A - this is auth modification, not a library
- Libraries listed: N/A
- CLI per library: N/A
- Library docs: N/A

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? YES - write failing tests first
- Git commits show tests before implementation? YES - will enforce
- Order: Contract->Integration->E2E->Unit strictly followed? YES
- Real dependencies used? YES - actual database with RefreshDatabase trait
- Integration tests for: web auth, API auth, cross-auth rejection
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? YES - log auth attempts with user_type
- Frontend logs -> backend? YES - Inertia error handling
- Error context sufficient? YES - include user_type and auth method in errors

**Versioning**:
- Version number assigned? 1.1.0 (minor feature addition)
- BUILD increments on every change? YES
- Breaking changes handled? NO breaking changes - backward compatible

## Project Structure

### Documentation (this feature)
```
specs/001-auth/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output - UPDATED for dual auth
├── data-model.md        # Phase 1 output - UPDATED for dual auth
├── quickstart.md        # Phase 1 output - UPDATED for dual auth
├── contracts/           # Phase 1 output
│   ├── auth.yaml        # OpenAPI spec for PARENT API auth
│   ├── nakes.yaml       # OpenAPI spec for NAKES web endpoints
│   └── web-auth.md      # Web auth routes for NAKES
└── tasks.md             # Phase 2 output (/tasks command)
```

### Source Code (repository root)
```
app/
├── Models/User.php           # Extend with user_type enum
├── Enums/UserType.php        # NEW: UserType enum (nakes, parent)
├── Http/
│   ├── Controllers/
│   │   ├── Api/V1/
│   │   │   └── AuthController.php    # UPDATE: Reject nakes users
│   │   └── Web/
│   │       └── AuthController.php    # NEW: Web auth for nakes
│   ├── Middleware/
│   │   ├── EnsureNakes.php           # NEW: Web route protection
│   │   └── EnsureParent.php          # NEW: API route protection
│   └── Requests/...
├── Models/NakesProfile.php   # NEW: Nakes profile model

database/migrations/
├── xxxx_add_user_type_to_users.php        # NEW
└── xxxx_create_nakes_profiles_table.php   # NEW

routes/
├── web.php                   # UPDATE: Add auth middleware
└── api.php                   # UPDATE: Add ensure.parent middleware

tests/
├── Feature/Api/V1/
│   ├── AuthTest.php          # UPDATE: Explicit parent users
│   └── CrossAuthTest.php     # NEW: API rejects nakes
└── Feature/Web/
    ├── NakesAuthTest.php     # NEW: Web auth tests
    └── CrossAuthTest.php     # NEW: Web rejects parents
```

## Phase 0: Outline & Research
**Completed**: See `research.md`

Key decisions:
1. Use `user_type` enum (nakes, parent) instead of Spatie Permission
2. Dual guards: `web` for nakes, `sanctum` for parents
3. Custom middleware: `EnsureNakes` and `EnsureParent`
4. Separate `nakes_profiles` table for nakes-specific fields
5. Cross-auth rejection at login AND middleware level

## Phase 1: Design & Contracts
**Completed**: See `data-model.md`, `contracts/`

Key artifacts:
1. `UserType` enum with `canUseWeb()` and `canUseApi()` helpers
2. `EnsureNakes` middleware for web routes
3. `EnsureParent` middleware for API routes
4. Updated API auth contract (parents only)
5. Web auth contract (nakes only)
6. Cross-auth prevention logic

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs
- CRITICAL: Include cross-auth rejection tests

**Task Categories**:
1. **Infrastructure** (parallel):
   - UserType enum creation [P]
   - User model migration [P]
   - NakesProfile model + migration [P]
   
2. **Middleware** (parallel):
   - EnsureNakes middleware [P]
   - EnsureParent middleware [P]
   - Register middleware in bootstrap/app.php
   
3. **API Auth Updates**:
   - Update AuthController to reject nakes
   - Add ensure.parent to API routes
   - Update existing API tests for parent users
   
4. **Web Auth Implementation**:
   - Create Web/AuthController
   - Implement login/register forms
   - Add ensure.nakes to web routes
   - Update HandleInertiaRequests for real user
   
5. **Cross-Auth Tests** (CRITICAL):
   - Test: Nakes cannot login via API
   - Test: Parents cannot login via web
   - Test: API middleware blocks nakes
   - Test: Web middleware blocks parents

**Ordering Strategy**:
- TDD order: Tests before implementation
- Dependency order:
  1. UserType enum + migration
  2. Middleware classes
  3. API auth updates + tests
  4. Web auth implementation + tests
  5. Cross-auth tests
- Mark [P] for parallel execution

**Estimated Output**: 40-45 numbered, ordered tasks in tasks.md

## Phase 3+: Future Implementation
*Beyond scope of /plan command*

**Phase 3**: Task execution (/tasks command)
**Phase 4**: Implementation (TDD cycle)
**Phase 5**: Validation (quickstart.md scenarios)

## Complexity Tracking
*No violations - design follows constitutional principles*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) - UPDATED for dual auth
- [x] Phase 1: Design complete (/plan command) - UPDATED for dual auth
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command) - 56 tasks in tasks.md
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none needed)
- [x] Dual auth model clarification incorporated

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
*Updated: 2026-01-17 for dual authentication (web vs API) model*
