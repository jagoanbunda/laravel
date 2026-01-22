# Feature Specification: Dual Authentication System for NAKES

## Overview
Implement a **dual authentication system** with complete separation between:
- **Nakes (Tenaga Kesehatan)**: Healthcare workers who access the system via **WEB ONLY** (session-based, Inertia/React frontend)
- **Parents (Orang Tua)**: Parents who access the system via **API ONLY** (token-based, mobile app)

**CRITICAL CONSTRAINT**: These are mutually exclusive authentication paths:
- Nakes CANNOT login via API
- Parents CANNOT login via web

## User Request
> "I need to clarify here, there are 2 auth methods: nakes via web and parents via api. Nakes cannot login via api or parent cannot login via web."

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAKES SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│  WEB ROUTES (routes/web.php)                                     │
│  ├── Login: /login (session-based)                              │
│  ├── Dashboard: /dashboard                                       │
│  ├── Children Management: /children/*                           │
│  ├── Screenings: /screenings/*                                  │
│  ├── PMT Programs: /pmt/*                                       │
│  └── Reports: /reports/*                                        │
│                                                                  │
│  Auth: Laravel Session + CSRF (web guard)                       │
│  Frontend: Inertia.js + React                                   │
│  User Type: user_type = 'nakes'                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       PARENT SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│  API ROUTES (routes/api.php)                                     │
│  ├── Auth: /api/v1/auth/* (Sanctum tokens)                      │
│  ├── Children: /api/v1/children/*                               │
│  ├── Anthropometry: /api/v1/children/{child}/anthropometry/*   │
│  ├── Food Logs: /api/v1/children/{child}/food-logs/*           │
│  ├── Screenings: /api/v1/children/{child}/screenings/*         │
│  └── Notifications: /api/v1/notifications/*                     │
│                                                                  │
│  Auth: Laravel Sanctum (API tokens)                             │
│  Client: Mobile App (iOS/Android)                               │
│  User Type: user_type = 'parent'                                │
└─────────────────────────────────────────────────────────────────┘
```

## Feature Requirements

### FR-1: User Type Differentiation
Add `user_type` field to distinguish authentication paths:

| User Type | Auth Method | Routes | Guard |
|-----------|-------------|--------|-------|
| `nakes` | Session (web) | `routes/web.php` | `web` |
| `parent` | Sanctum Token (API) | `routes/api.php` | `sanctum` |

**Acceptance Criteria:**
- Users must have a `user_type` field (enum: `nakes`, `parent`)
- User type determines which authentication method is allowed
- Cross-authentication attempts are rejected with clear error messages

### FR-2: Nakes Web Authentication
Session-based authentication for healthcare workers:

**Login (`GET/POST /login`):**
- Standard Laravel session authentication
- Uses `web` guard
- Rejects users with `user_type != 'nakes'`
- Redirects to `/dashboard` on success

**Registration (`GET/POST /register`):**
- Additional fields: `nik`, `puskesmas_id`, `position`
- Sets `user_type` to `nakes`
- May require admin approval

**Middleware Protection:**
- All web routes (except public landing pages) require:
  - `auth` middleware (session auth)
  - `ensure.nakes` middleware (verify user_type)

### FR-3: Parent API Authentication  
Token-based authentication for mobile app users:

**Registration (`POST /api/v1/auth/register`):**
- Standard registration with name, email, password, phone
- Sets `user_type` to `parent`
- Returns Sanctum token
- Rejects if email belongs to existing nakes user

**Login (`POST /api/v1/auth/login`):**
- Accepts email + password
- Returns Sanctum token
- Rejects users with `user_type != 'parent'`
- Error: "Akun ini hanya dapat diakses melalui web"

**Token Management:**
- `POST /api/v1/auth/logout` - Revoke token
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get profile

### FR-4: Cross-Authentication Prevention

**API Login Attempt by Nakes:**
```json
POST /api/v1/auth/login
{ "email": "nakes@puskesmas.go.id", "password": "xxx" }

Response: 403 Forbidden
{
  "message": "Akun tenaga kesehatan hanya dapat login melalui web.",
  "error_code": "NAKES_WEB_ONLY"
}
```

**Web Login Attempt by Parent:**
```
POST /login
email=parent@email.com&password=xxx

Response: Redirect back with error
"Akun orang tua hanya dapat diakses melalui aplikasi mobile."
```

### FR-5: Nakes-Specific Profile Fields
Nakes users have additional profile data:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nik` | string(16) | Yes | National ID number |
| `puskesmas_id` | FK | No | Assigned health center |
| `position` | string(100) | No | Job title (Bidan, Perawat, etc.) |
| `verified_at` | timestamp | No | Admin verification date |

### FR-6: Update Existing Tests
All existing API tests must be updated to:
- Create users with `user_type: 'parent'` explicitly
- Verify nakes users cannot access API endpoints
- Verify parents cannot access web endpoints
- Update factory to include `user_type` field

### FR-7: Update Existing API Auth Tests
The existing `AuthTest.php` must verify:
- Registration creates parent users only
- Login rejects nakes users with proper error
- All protected endpoints require parent user type

## Non-Functional Requirements

### NFR-1: Backward Compatibility
- Existing API users default to `parent` type
- Existing API behavior unchanged for parents
- Migration must not disrupt current mobile app users

### NFR-2: Security
- Clear separation prevents privilege escalation
- Nakes web sessions use CSRF protection
- Parent API tokens have limited abilities
- Audit log for authentication attempts

### NFR-3: Error Messages
All authentication errors must be clear and actionable:
- Indonesian language for user-facing errors
- Include `error_code` for programmatic handling
- Guide users to correct authentication method

### NFR-4: Test Coverage
- Web auth tests for nakes login/logout
- API auth tests for parent login/logout
- Cross-auth rejection tests
- Existing tests updated for user_type

## Success Criteria
1. Nakes can login via web and access dashboard
2. Nakes CANNOT login via API (403 with clear message)
3. Parents can login via API and get token
4. Parents CANNOT login via web (redirect with error)
5. All existing API tests pass with parent user type
6. New web auth tests pass for nakes
7. Cross-authentication tests verify rejection

## Technical Constraints
- Laravel 12 with PHP 8.5
- PHPUnit 11 for testing
- Sanctum for API authentication (parents only)
- Laravel session auth for web (nakes only)
- Inertia.js + React for web frontend
- Existing User model extended (not replaced)

## Out of Scope
- Admin panel for user management
- Password reset flows (future feature)
- OAuth/social login
- Two-factor authentication
