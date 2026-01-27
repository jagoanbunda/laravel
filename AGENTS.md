# NAKES (JagoanBunda) - Project Knowledge Base

**Generated:** 2026-01-22
**Commit:** 9a770c8
**Branch:** main

## Overview

Child health monitoring system (stunting, ASQ-3 development screening, PMT nutrition). Laravel 12 + Inertia.js v2 + React 19 + Tailwind v4. Two user types: **Nakes** (healthcare workers - web) and **Parents** (mobile API).

## Structure

```
nakes/
├── app/
│   ├── Enums/           # UserType enum (Nakes|Parent)
│   ├── Exports/         # Excel exports (maatwebsite/excel)
│   ├── Http/
│   │   ├── Controllers/ # Web controllers (Inertia)
│   │   │   └── Api/V1/  # REST API for mobile (see subdirectory AGENTS.md)
│   │   ├── Middleware/  # EnsureNakes, EnsureParent guards
│   │   ├── Requests/    # Form validation (array-based rules)
│   │   └── Resources/   # API JSON transformers
│   ├── Models/          # 21 Eloquent models
│   ├── Policies/        # Authorization (Child, Food, FoodLog)
│   └── Services/        # WhoZScoreService (WHO LMS calculations)
├── resources/js/        # React/Inertia frontend (see subdirectory AGENTS.md)
├── routes/
│   ├── api.php          # Mobile API (v1 prefix, Sanctum)
│   └── web.php          # Inertia routes (session auth)
├── specs/               # Feature specifications
├── docs/                # Architecture docs, ERD
└── testsprite_tests/    # Python E2E tests (separate from PHPUnit)
```

## Where to Look

| Task | Location | Notes |
|------|----------|-------|
| Z-score calculations | `app/Services/WhoZScoreService.php` | WHO LMS method, 518 lines |
| ASQ-3 screening logic | `app/Http/Controllers/Api/V1/Asq3Controller.php` | Complex scoring workflow |
| PMT program management | `app/Http/Controllers/PmtProgramController.php` | Bulk schedule creation |
| User role middleware | `bootstrap/app.php` | `ensure.nakes`, `ensure.parent` aliases |
| Domain models | `app/Models/*.php` | Child is central entity |
| API transformers | `app/Http/Resources/Api/V1/` | JSON response shaping |
| Frontend components | `resources/js/components/` | See `resources/js/AGENTS.md` |

## Domain Model Map

| Entity | Relationships | Role |
|--------|---------------|------|
| **User** | hasMany Children, hasOne NakesProfile | Auth, role-based (UserType enum) |
| **Child** | belongsTo User, hasMany measurements/screenings/logs | Central domain entity |
| **Asq3Screening** | hasMany Answers/Results, belongsTo AgeInterval | Development assessment |
| **PmtProgram** | hasMany Schedules, belongsTo Child | Nutrition intervention |
| **AnthropometryMeasurement** | belongsTo Child | Growth tracking with Z-scores |

## Conventions

### Architecture
- **Web (Nakes)**: Session auth, Inertia.js pages, `ensure.nakes` middleware
- **API (Parents)**: Sanctum tokens, REST JSON, `ensure.parent` middleware
- **Cross-access blocked**: Parents cannot use web routes; Nakes cannot use API login

### PHP/Laravel
- Casts via `casts(): array` method (not `$casts` property)
- Validation in Form Request classes (array-based rules)
- Eloquent only - **never** use `DB::` facade
- Constructor property promotion required
- Explicit return types mandatory

### Testing
- PHPUnit only (**not** Pest)
- `id_ID` locale in factories
- UserFactory states: `asNakes()`, `asParent()`
- API tests: `Sanctum::actingAs()`
- Web tests: `assertInertia()`

### Database
- Indonesian field names in some tables
- Seeders: `ProductionSeeder` (master data) vs `DevelopmentSeeder` (sample data)

## Anti-Patterns (THIS PROJECT)

| Forbidden | Reason |
|-----------|--------|
| `DB::` raw queries | Use `Model::query()` and Eloquent |
| `env()` outside config | Use `config()` helper |
| Inline controller validation | Use Form Request classes |
| `as any`, `@ts-ignore` | TypeScript must be strict |
| Empty `__construct()` | Remove or use property promotion |
| Comments in code | Use PHPDoc blocks only |

## Known Technical Debt

| File | Issue | Priority |
|------|-------|----------|
| `SettingsController.php` | Mock user logic - use `Auth::user()` | HIGH |
| `ProfileController.php` | Mock user logic - use `Auth::user()` | HIGH |

## Commands

```bash
# Development
composer dev              # Starts serve + queue + pail + vite concurrently

# Setup
composer setup            # Full environment setup

# Testing
php artisan test          # All tests
php artisan test --filter=testName  # Single test

# Code style
vendor/bin/pint --dirty   # Format changed files

# Database
php artisan migrate:fresh --seed  # Reset with sample data
```

## Notes

- **CSV data files** in root (`asq3.csv`, `DATA MAKANAN.csv`) - non-standard location
- **SpecKit workflow** in `.specify/` - specification-driven development
- **No GitHub Actions CI** - relies on `composer setup` script
- **Sail installed but not configured** - no docker-compose.yml
- **Z-scores capped** at [-6, +6] in WhoZScoreService
