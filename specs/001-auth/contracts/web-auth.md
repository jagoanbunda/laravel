# Web Authentication Routes (Nakes Only)

This document describes the web authentication routes for Nakes (healthcare workers).
These are NOT API endpoints - they are standard Laravel web routes using session authentication.

## Overview

| Route | Method | Description |
|-------|--------|-------------|
| `/login` | GET | Show login form |
| `/login` | POST | Process login |
| `/register` | GET | Show registration form |
| `/register` | POST | Process registration |
| `/logout` | POST | Logout (destroy session) |

## Authentication Flow

### Login

**GET /login**
- Shows Inertia login page
- Redirects to `/dashboard` if already authenticated as nakes

**POST /login**
```
Content-Type: application/x-www-form-urlencoded

email=siti@puskesmas.go.id
password=password123
_token={csrf_token}
```

**Success Response:**
- Redirect to `/dashboard`
- Session cookie set

**Error Responses:**

| Scenario | Response |
|----------|----------|
| Invalid credentials | Redirect back with `email` error |
| Parent user attempt | Redirect back with error: "Akun orang tua hanya dapat diakses melalui aplikasi mobile." |
| Validation error | Redirect back with validation errors |

### Registration

**GET /register**
- Shows Inertia registration page for nakes
- Redirects to `/dashboard` if already authenticated

**POST /register**
```
Content-Type: application/x-www-form-urlencoded

name=Dr. Siti Rahayu
email=siti@puskesmas.go.id
password=password123
password_confirmation=password123
nik=3201234567890123
position=Bidan
_token={csrf_token}
```

**Success Response:**
- Creates user with `user_type: 'nakes'`
- Creates `nakes_profile` record
- Redirect to `/dashboard`
- Session cookie set

**Error Responses:**

| Scenario | Response |
|----------|----------|
| Duplicate email | Redirect back with `email` error |
| Invalid NIK format | Redirect back with `nik` error |
| Validation error | Redirect back with validation errors |

### Logout

**POST /logout**
```
Content-Type: application/x-www-form-urlencoded

_token={csrf_token}
```

**Response:**
- Invalidate session
- Regenerate CSRF token
- Redirect to `/login`

## Middleware Stack

All protected web routes use:
1. `web` - Session handling, CSRF
2. `auth` - Verify session authentication
3. `ensure.nakes` - Verify user_type is 'nakes'

## Cross-Authentication Prevention

If a parent user somehow gets a session (e.g., direct database manipulation), 
the `ensure.nakes` middleware will:
1. Log them out
2. Invalidate their session
3. Redirect to `/login` with error message

## Inertia Page Props

### Login Page (`auth/login`)
```typescript
interface LoginPageProps {
  errors: {
    email?: string;
    password?: string;
  };
  status?: string;
}
```

### Register Page (`auth/register`)
```typescript
interface RegisterPageProps {
  errors: {
    name?: string;
    email?: string;
    password?: string;
    nik?: string;
    position?: string;
  };
}
```

### Shared Auth Data
```typescript
// Available on all authenticated pages via Inertia shared data
interface AuthData {
  user: {
    id: number;
    name: string;
    email: string;
    user_type: 'nakes';
    nakes_profile?: {
      id: number;
      nik: string;
      position: string | null;
      verified_at: string | null;
    };
  } | null;
}
```
