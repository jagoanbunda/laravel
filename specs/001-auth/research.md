# Research: Dual Authentication System for NAKES

**Date**: 2026-01-17  
**Feature**: 001-auth  
**Status**: Complete (Updated for dual auth model)

## Research Questions

### RQ-1: Dual Authentication Architecture

**Finding**: Laravel natively supports multiple authentication guards and can enforce user type restrictions at the guard level.

**Architecture Decision**:
```
┌────────────────────┐      ┌────────────────────┐
│   WEB (Nakes)      │      │   API (Parents)    │
├────────────────────┤      ├────────────────────┤
│ Guard: web         │      │ Guard: sanctum     │
│ Driver: session    │      │ Driver: token      │
│ Middleware: auth   │      │ Middleware: auth:  │
│ + ensure.nakes     │      │   sanctum          │
│                    │      │ + ensure.parent    │
│ Login: /login      │      │ Login: /api/v1/    │
│ (POST form)        │      │   auth/login       │
└────────────────────┘      └────────────────────┘
```

**Decision**: Use Laravel's built-in multi-guard architecture
- Rationale: No custom auth package needed, leverages Laravel's auth system
- Web guard for nakes (session-based)
- Sanctum guard for parents (token-based)

### RQ-2: Cross-Authentication Prevention

**Finding**: Prevention must happen at multiple layers:
1. **Login validation** - Check user_type before authenticating
2. **Middleware** - Verify user_type after authentication
3. **Route protection** - Ensure correct guard is used

**Implementation Strategy**:

```php
// In AuthController (API)
public function login(LoginRequest $request): JsonResponse
{
    $user = User::where('email', $request->email)->first();
    
    // Check if nakes trying to use API
    if ($user && $user->user_type === UserType::Nakes) {
        return response()->json([
            'message' => 'Akun tenaga kesehatan hanya dapat login melalui web.',
            'error_code' => 'NAKES_WEB_ONLY'
        ], 403);
    }
    
    // ... existing login logic
}

// In LoginController (Web)
protected function authenticated(Request $request, $user)
{
    if ($user->user_type === UserType::Parent) {
        Auth::logout();
        return redirect()->route('login')
            ->withErrors(['email' => 'Akun orang tua hanya dapat diakses melalui aplikasi mobile.']);
    }
}
```

**Decision**: Implement cross-auth checks at login AND middleware
- Rationale: Defense in depth, clear error messages
- Login check: Immediate feedback with actionable error
- Middleware check: Catches edge cases, prevents token/session reuse

### RQ-3: Nakes Web Authentication Implementation

**Finding**: Laravel Breeze/Fortify provides scaffolding, but we're using Inertia.js already.

**Current State**: 
- Web routes exist but no authentication middleware
- Login page exists at `/login` (Inertia render)
- No actual authentication logic implemented

**Decision**: Implement web auth using Laravel's built-in Auth facade
```php
// routes/web.php
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware(['auth', 'ensure.nakes'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    // ... all protected routes
});
```

### RQ-4: Middleware Implementation

**Finding**: Need custom middleware to enforce user type restrictions.

**EnsureNakes Middleware**:
```php
// app/Http/Middleware/EnsureNakes.php
class EnsureNakes
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->user_type !== UserType::Nakes) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
            Auth::logout();
            return redirect()->route('login')
                ->withErrors(['email' => 'Akses ditolak. Halaman ini hanya untuk tenaga kesehatan.']);
        }
        return $next($request);
    }
}

// app/Http/Middleware/EnsureParent.php
class EnsureParent
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->user_type !== UserType::Parent) {
            return response()->json([
                'message' => 'Akses ditolak. API hanya untuk orang tua.',
                'error_code' => 'PARENT_API_ONLY'
            ], 403);
        }
        return $next($request);
    }
}
```

**Decision**: Create two custom middleware classes
- `EnsureNakes` for web routes
- `EnsureParent` for API routes
- Register in `bootstrap/app.php` (Laravel 12 pattern)

### RQ-5: NakesProfile Separate Table vs User Columns

**Finding**: Nakes have additional fields not applicable to parents.

**Decision**: Keep separate `nakes_profiles` table
- Rationale: Clean separation, no null columns on User model
- Only created for nakes users
- One-to-one relationship

### RQ-6: Migration Strategy for Existing Users

**Finding**: Existing users are all mobile app users (parents).

**Decision**: 
1. Add `user_type` column with default `parent`
2. All existing users become parents (correct behavior)
3. Nakes users created via web registration only

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('user_type', 20)->default('parent')->after('email');
    $table->index('user_type');
});
```

### RQ-7: Test Structure for Dual Auth

**Finding**: Need separate test classes for web and API auth.

**Test Organization**:
```
tests/Feature/
├── Api/V1/
│   ├── AuthTest.php           # UPDATE: Verify parent-only API access
│   ├── ChildTest.php          # UPDATE: Use parent users explicitly
│   └── ...
└── Web/
    ├── NakesAuthTest.php      # NEW: Web login/logout for nakes
    ├── NakesDashboardTest.php # NEW: Dashboard access tests
    └── CrossAuthTest.php      # NEW: Cross-auth rejection tests
```

**Decision**: Create web test directory for nakes-specific tests
- Keep existing API tests, update to use parent users
- Add cross-authentication rejection tests

### RQ-8: Inertia.js Shared Data Update

**Finding**: Current `HandleInertiaRequests.php` hardcodes user as "Admin Nakes".

**Decision**: Update to share real authenticated user
```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user() ? [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'user_type' => $request->user()->user_type->value,
                'nakes_profile' => $request->user()->nakesProfile,
            ] : null,
        ],
    ];
}
```

## Summary of Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Auth Architecture | Dual guards (web + sanctum) | Laravel native, clean separation |
| Cross-Auth Prevention | Login check + middleware | Defense in depth |
| Web Auth | Built-in Auth facade + Inertia | Existing stack |
| API Auth | Existing Sanctum | Already implemented |
| Middleware | Custom EnsureNakes/EnsureParent | Clear user type enforcement |
| Nakes Profile | Separate table | Clean data model |
| Migration | Default to parent | Backward compatible |
| Tests | Separate web/api directories | Clear organization |

## Key Implementation Files

| File | Change |
|------|--------|
| `app/Enums/UserType.php` | NEW: UserType enum |
| `app/Http/Middleware/EnsureNakes.php` | NEW: Web route protection |
| `app/Http/Middleware/EnsureParent.php` | NEW: API route protection |
| `app/Http/Controllers/Web/AuthController.php` | NEW: Web auth controller |
| `app/Http/Controllers/Api/V1/AuthController.php` | UPDATE: Add nakes rejection |
| `bootstrap/app.php` | UPDATE: Register middleware aliases |
| `routes/web.php` | UPDATE: Add auth middleware |
| `routes/api.php` | UPDATE: Add ensure.parent middleware |

---
*Research complete. Updated for dual authentication model.*
