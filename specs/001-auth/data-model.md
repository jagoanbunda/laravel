# Data Model: Dual Authentication System

**Feature**: 001-auth  
**Date**: 2026-01-17  
**Status**: Complete (Updated for dual auth model)

## Entity Relationship Diagram

```
┌─────────────────┐       ┌──────────────────┐
│     users       │       │  nakes_profiles  │
├─────────────────┤       ├──────────────────┤
│ id              │◄──────│ user_id (FK)     │
│ name            │       │ nik              │
│ email           │       │ puskesmas_id     │
│ password        │       │ position         │
│ user_type ◄─────┼───────│ verified_at      │
│ phone           │       └──────────────────┘
│ ...             │
└────────┬────────┘
         │
         │ user_type determines auth path:
         │ 'nakes' → WEB ONLY (session)
         │ 'parent' → API ONLY (token)
         ▼
┌─────────────────┐
│    children     │
│ (owned by       │
│  parent users)  │
└─────────────────┘
```

## Entities

### 1. UserType Enum

**File**: `app/Enums/UserType.php`

```php
<?php

namespace App\Enums;

enum UserType: string
{
    case Nakes = 'nakes';
    case Parent = 'parent';
    
    public function label(): string
    {
        return match($this) {
            self::Nakes => 'Tenaga Kesehatan',
            self::Parent => 'Orang Tua',
        };
    }
    
    /**
     * Get the authentication method for this user type.
     */
    public function authMethod(): string
    {
        return match($this) {
            self::Nakes => 'web',    // Session-based
            self::Parent => 'api',   // Token-based
        };
    }
    
    /**
     * Check if this user type can use web authentication.
     */
    public function canUseWeb(): bool
    {
        return $this === self::Nakes;
    }
    
    /**
     * Check if this user type can use API authentication.
     */
    public function canUseApi(): bool
    {
        return $this === self::Parent;
    }
}
```

| Value | Auth Method | Routes | Description |
|-------|-------------|--------|-------------|
| `nakes` | Web (session) | `routes/web.php` | Healthcare workers |
| `parent` | API (token) | `routes/api.php` | Mobile app users |

### 2. User Model Extension

**File**: `app/Models/User.php` (modification)

**New Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `user_type` | string(20) | NOT NULL, DEFAULT 'parent' | Determines auth path |

**New Methods**:
```php
use App\Enums\UserType;

// Add to casts
protected function casts(): array
{
    return [
        // ... existing casts
        'user_type' => UserType::class,
    ];
}

// Add relationship
public function nakesProfile(): HasOne
{
    return $this->hasOne(NakesProfile::class);
}

// Add helper methods
public function isNakes(): bool
{
    return $this->user_type === UserType::Nakes;
}

public function isParent(): bool
{
    return $this->user_type === UserType::Parent;
}

public function canUseWeb(): bool
{
    return $this->user_type->canUseWeb();
}

public function canUseApi(): bool
{
    return $this->user_type->canUseApi();
}
```

**Migration**: `xxxx_add_user_type_to_users_table.php`
```php
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('user_type', 20)->default('parent')->after('email');
        $table->index('user_type');
    });
}
```

### 3. NakesProfile Model

**File**: `app/Models/NakesProfile.php` (new)

**Table**: `nakes_profiles`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK, AUTO | Primary key |
| `user_id` | bigint | FK(users), UNIQUE | Link to nakes user |
| `nik` | string(16) | UNIQUE | National ID number |
| `puskesmas_id` | bigint | FK(puskesmas), NULL | Health center |
| `position` | string(100) | NULL | Job title |
| `verified_at` | timestamp | NULL | Admin verification date |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

## Middleware Definitions

### 4. EnsureNakes Middleware

**File**: `app/Http/Middleware/EnsureNakes.php`

```php
<?php

namespace App\Http\Middleware;

use App\Enums\UserType;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureNakes
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user || $user->user_type !== UserType::Nakes) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            return redirect()->route('login')
                ->withErrors(['email' => 'Akses ditolak. Halaman ini hanya untuk tenaga kesehatan.']);
        }
        
        return $next($request);
    }
}
```

### 5. EnsureParent Middleware

**File**: `app/Http/Middleware/EnsureParent.php`

```php
<?php

namespace App\Http\Middleware;

use App\Enums\UserType;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureParent
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user || $user->user_type !== UserType::Parent) {
            return response()->json([
                'message' => 'Akses ditolak. API hanya untuk orang tua.',
                'error_code' => 'PARENT_API_ONLY'
            ], 403);
        }
        
        return $next($request);
    }
}
```

### 6. Middleware Registration

**File**: `bootstrap/app.php`

```php
->withMiddleware(function (Middleware $middleware) {
    // ... existing middleware
    
    $middleware->alias([
        'ensure.nakes' => \App\Http\Middleware\EnsureNakes::class,
        'ensure.parent' => \App\Http\Middleware\EnsureParent::class,
    ]);
})
```

## Route Structure

### 7. Web Routes (Nakes Only)

**File**: `routes/web.php`

```php
// Public pages (no auth)
Route::get('/', fn () => Inertia::render('landing/index'))->name('home');
// ... other public routes

// Guest routes (not logged in)
Route::middleware('guest')->group(function () {
    Route::get('/login', [WebAuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [WebAuthController::class, 'login']);
    Route::get('/register', [WebAuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [WebAuthController::class, 'register']);
});

// Protected routes (nakes only)
Route::middleware(['auth', 'ensure.nakes'])->group(function () {
    Route::post('/logout', [WebAuthController::class, 'logout'])->name('logout');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    // ... all other protected routes
});
```

### 8. API Routes (Parents Only)

**File**: `routes/api.php`

```php
Route::prefix('v1')->group(function () {
    // Public auth routes
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
    });

    // Protected routes (parents only)
    Route::middleware(['auth:sanctum', 'ensure.parent'])->group(function () {
        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('refresh', [AuthController::class, 'refresh']);
            Route::get('me', [AuthController::class, 'me']);
            Route::put('profile', [AuthController::class, 'updateProfile']);
        });
        
        // ... all other API routes
    });
});
```

## Factory Definitions

### UserFactory Extension

```php
// Add user_type to default definition
public function definition(): array
{
    return [
        // ... existing fields
        'user_type' => UserType::Parent->value, // Default to parent
    ];
}

// Add state methods
public function asNakes(): static
{
    return $this->state(fn(array $attributes) => [
        'user_type' => UserType::Nakes->value,
    ])->has(NakesProfile::factory());
}

public function asParent(): static
{
    return $this->state(fn(array $attributes) => [
        'user_type' => UserType::Parent->value,
    ]);
}
```

### NakesProfileFactory

```php
public function definition(): array
{
    return [
        'user_id' => User::factory()->asNakes(),
        'nik' => fake()->numerify('################'),
        'puskesmas_id' => null,
        'position' => fake()->randomElement(['Bidan', 'Perawat', 'Dokter']),
        'verified_at' => now(),
    ];
}
```

## Authentication Flow Diagrams

### Parent (API) Login Flow
```
Mobile App                    API Server
    │                             │
    │ POST /api/v1/auth/login    │
    │ {email, password}          │
    │────────────────────────────►│
    │                             │ 1. Find user by email
    │                             │ 2. Check user_type == 'parent'
    │                             │    If nakes: 403 NAKES_WEB_ONLY
    │                             │ 3. Verify password
    │                             │ 4. Create Sanctum token
    │                             │
    │◄────────────────────────────│
    │ {user, token}              │
    │                             │
    │ GET /api/v1/children       │
    │ Authorization: Bearer token│
    │────────────────────────────►│
    │                             │ 1. Validate token (sanctum)
    │                             │ 2. Check user_type == 'parent'
    │                             │    (ensure.parent middleware)
    │                             │ 3. Return children
    │◄────────────────────────────│
```

### Nakes (Web) Login Flow
```
Browser                       Web Server
    │                             │
    │ POST /login                │
    │ {email, password, _token}  │
    │────────────────────────────►│
    │                             │ 1. CSRF validation
    │                             │ 2. Find user by email
    │                             │ 3. Check user_type == 'nakes'
    │                             │    If parent: redirect with error
    │                             │ 4. Verify password
    │                             │ 5. Create session
    │                             │
    │◄────────────────────────────│
    │ Redirect to /dashboard     │
    │ Set-Cookie: session        │
    │                             │
    │ GET /dashboard             │
    │ Cookie: session            │
    │────────────────────────────►│
    │                             │ 1. Validate session (auth)
    │                             │ 2. Check user_type == 'nakes'
    │                             │    (ensure.nakes middleware)
    │                             │ 3. Render dashboard
    │◄────────────────────────────│
```

---
*Data model complete. Updated for dual authentication model.*
