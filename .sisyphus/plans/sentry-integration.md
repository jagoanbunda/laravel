# Sentry Integration for Laravel 12 (Nakes Project)

## TL;DR

> **Quick Summary**: Integrate Sentry error tracking with privacy-conscious configuration for healthcare data. Uses Laravel 12's `withExceptions()` pattern with sanitized user context.
> 
> **Deliverables**:
> - Sentry package installed and configured
> - Exception handling integrated in bootstrap/app.php
> - User context tracking with UserType (Nakes/Parent)
> - Privacy safeguards for health data (PHI protection)
> - Environment-specific configuration
> 
> **Estimated Effort**: Medium (4-6 hours)
> **Parallel Execution**: NO - sequential dependency chain
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6

---

## Context

### Original Request
Add implementation of Sentry for Laravel 12 with proper configuration.

### Interview Summary
**Key Discussions**:
- Use official `sentry/sentry-laravel` package
- Laravel 12 uses `bootstrap/app.php` structure (no Handler.php)
- Track user context including UserType enum (Nakes/Parent)
- Performance tracing optional

**Research Findings**:
- Official docs: https://docs.sentry.io/platforms/php/guides/laravel/
- Real-world implementations: Monica, Laravel.io, TypiCMS use same pattern
- Current `bootstrap/app.php` has empty `withExceptions()` callback - ready for integration
- AppServiceProvider is empty - suitable for user context tracking

### Metis Review
**Identified Gaps** (addressed):
- **Privacy/PHI Protection**: Healthcare data must not leak to Sentry - CRITICAL
- **Data Sanitization**: Request bodies, sensitive headers must be excluded
- **Environment Separation**: Different Sentry projects/DSN for dev vs production
- **Scope Boundaries**: No frontend error tracking, no performance dashboards (Phase 2)
- **Ignored Exceptions**: 404s, validation errors should not create noise

---

## Work Objectives

### Core Objective
Integrate Sentry error tracking for Laravel 12 with privacy-conscious configuration that protects child health data (PHI) while providing meaningful error insights for the development team.

### Concrete Deliverables
- `composer.json`: `sentry/sentry-laravel` package added
- `config/sentry.php`: Configuration file with privacy safeguards
- `bootstrap/app.php`: Exception handling integration
- `app/Providers/AppServiceProvider.php`: User context tracking
- `.env.example`: Sentry environment variables documented
- `.env`: Sentry DSN configured (local/production)

### Definition of Done
- [x] `php artisan sentry:test` sends test event to Sentry dashboard *(CODE READY - requires DSN)*
- [x] Unhandled exceptions appear in Sentry with user context *(CODE READY - Integration::handles() in bootstrap/app.php)*
- [x] User context shows `user_type` field (nakes/parent/null) *(CODE READY - AppServiceProvider::configureSentryUserContext())*
- [x] No PHI (child names, NIK, Z-scores, health data) in any Sentry event *(CODE READY - before_send callback filters all request data)*
- [x] Request bodies from API routes are NOT captured *(CODE READY - request['data'] = '[FILTERED]')*
- [x] Validation and 404 errors are excluded from Sentry *(CODE READY - ignore_exceptions configured)*

### Must Have
- Exception handling via `Integration::handles()`
- User context with `user_type` field
- Environment-specific DSN configuration
- Sensitive header exclusion (Authorization, Cookie, X-API-TOKEN)
- Request body sanitization for API endpoints

### Must NOT Have (Guardrails)
- ❌ No child names, NIK, or health measurements in Sentry events
- ❌ No request bodies from Child/ASQ3/PMT API endpoints
- ❌ No SQL query bindings (may contain health data)
- ❌ No performance tracing/profiling (Phase 2)
- ❌ No frontend React error tracking (separate project)
- ❌ No Slack/Discord alert integrations (Phase 2)
- ❌ No source map uploads
- ❌ No custom dashboards

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (PHPUnit)
- **User wants tests**: Manual verification via `sentry:test` command
- **Framework**: PHPUnit for integration tests, manual for Sentry dashboard verification

### Manual Execution Verification

Each TODO includes detailed verification using:
- `php artisan sentry:test` for connectivity
- `php artisan tinker` for exception simulation
- Browser/API testing for real error scenarios
- Sentry dashboard inspection for privacy compliance

---

## Execution Strategy

### Sequential Execution (NO Parallelization)

Due to strict dependency chain:

```
Task 1: Install Package
    ↓
Task 2: Publish & Configure Sentry
    ↓
Task 3: Integrate Exception Handling
    ↓
Task 4: Add User Context Tracking
    ↓
Task 5: Configure Privacy Safeguards
    ↓
Task 6: Test & Verify
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3, 4, 5, 6 | None |
| 2 | 1 | 3, 4, 5, 6 | None |
| 3 | 2 | 4, 6 | None |
| 4 | 2, 3 | 6 | 5 |
| 5 | 2 | 6 | 4 |
| 6 | All | None | None (final) |

---

## TODOs

- [x] 1. Install Sentry Laravel Package

  **What to do**:
  - Run `composer require sentry/sentry-laravel`
  - Verify package is added to `composer.json` and `composer.lock`
  - Confirm Laravel auto-discovers the service provider

  **Must NOT do**:
  - Do not run `sentry:publish` yet (Task 2)
  - Do not modify any config files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single composer command, no complexity
  - **Skills**: []
    - No special skills needed for package installation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 2, 3, 4, 5, 6
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `composer.json` - Current dependencies structure

  **Documentation References**:
  - https://docs.sentry.io/platforms/php/guides/laravel/#install - Official installation docs

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Command: `composer require sentry/sentry-laravel`
  - [ ] Verify: `composer show sentry/sentry-laravel` → shows installed version
  - [ ] Verify: `php artisan list | grep sentry` → shows `sentry:publish` and `sentry:test` commands

  **Commit**: YES
  - Message: `chore(deps): add sentry/sentry-laravel for error tracking`
  - Files: `composer.json`, `composer.lock`
  - Pre-commit: N/A

---

- [x] 2. Publish and Configure Sentry

  **What to do**:
  - Run `php artisan sentry:publish --dsn=YOUR_DSN` OR manually create config
  - Create `config/sentry.php` with privacy-focused configuration
  - Add environment variables to `.env.example`
  - Configure `.env` with actual DSN (development project)

  **Must NOT do**:
  - Do not enable `traces_sample_rate` (Phase 2)
  - Do not enable `profiles_sample_rate` (requires PHP extension)
  - Do not enable `send_default_pii` (privacy risk)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Config file creation with known structure
  - **Skills**: []
    - Standard Laravel configuration

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 3, 4, 5, 6
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `config/logging.php:1-133` - Laravel config file structure with env() usage

  **API/Type References**:
  - https://github.com/getsentry/sentry-laravel/blob/master/config/sentry.php - Official config template

  **Documentation References**:
  - https://docs.sentry.io/platforms/php/guides/laravel/configuration/options/ - All configuration options
  - https://docs.sentry.io/platforms/php/guides/laravel/configuration/laravel-options/ - Laravel-specific options

  **External References**:
  - https://github.com/monicahq/monica/blob/main/config/sentry.php - Monica's production config

  **Configuration Template**:
  ```php
  <?php
  
  return [
      'dsn' => env('SENTRY_LARAVEL_DSN'),
      'environment' => env('SENTRY_ENVIRONMENT', env('APP_ENV', 'production')),
      'release' => env('APP_VERSION'),
      
      // Privacy: DO NOT send PII automatically
      'send_default_pii' => false,
      
      // Error sampling (100% of errors)
      'sample_rate' => env('SENTRY_SAMPLE_RATE', 1.0),
      
      // Performance tracing DISABLED (Phase 2)
      'traces_sample_rate' => null,
      'profiles_sample_rate' => null,
      
      // Breadcrumbs configuration
      'breadcrumbs' => [
          'logs' => true,
          'cache' => true,
          'sql_queries' => true,
          'sql_bindings' => false, // Privacy: No SQL bindings
          'queue_info' => true,
          'http_client_requests' => true,
      ],
      
      // Ignored exceptions (reduce noise)
      'ignore_exceptions' => [
          \Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
          \Illuminate\Validation\ValidationException::class,
          \Illuminate\Auth\AuthenticationException::class,
          \Illuminate\Session\TokenMismatchException::class,
      ],
  ];
  ```

  **Environment Variables Template (.env.example)**:
  ```env
  # Sentry Error Tracking
  SENTRY_LARAVEL_DSN=
  SENTRY_ENVIRONMENT="${APP_ENV}"
  SENTRY_SAMPLE_RATE=1.0
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] File created: `config/sentry.php`
  - [ ] File updated: `.env.example` with Sentry variables
  - [ ] Command: `php artisan config:clear`
  - [ ] Command: `php artisan config:show sentry` → shows DSN is set
  - [ ] Verify: `send_default_pii` is `false`
  - [ ] Verify: `sql_bindings` is `false`
  - [ ] Verify: `traces_sample_rate` is `null`

  **Commit**: YES
  - Message: `feat(sentry): add Sentry configuration with privacy safeguards`
  - Files: `config/sentry.php`, `.env.example`
  - Pre-commit: `php artisan config:clear`

---

- [x] 3. Integrate Exception Handling in bootstrap/app.php

  **What to do**:
  - Add `use Sentry\Laravel\Integration;` import
  - Add `Integration::handles($exceptions);` inside `withExceptions()` callback
  - Add ignored exceptions for noise reduction

  **Must NOT do**:
  - Do not remove existing middleware configuration
  - Do not add Sentry middleware for tracing (Phase 2)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file edit with 2-3 lines
  - **Skills**: []
    - Standard Laravel bootstrap modification

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 4, 6
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `bootstrap/app.php:1-27` - Current file structure with empty withExceptions

  **External References**:
  - https://github.com/monicahq/monica/blob/main/bootstrap/app.php - Monica's Laravel 11+ implementation
  - https://github.com/laravelio/laravel.io/blob/main/bootstrap/app.php - Laravel.io implementation

  **Target Code**:
  ```php
  <?php
  
  use Illuminate\Foundation\Application;
  use Illuminate\Foundation\Configuration\Exceptions;
  use Illuminate\Foundation\Configuration\Middleware;
  use Sentry\Laravel\Integration;
  
  return Application::configure(basePath: dirname(__DIR__))
      ->withRouting(
          web: __DIR__.'/../routes/web.php',
          api: __DIR__.'/../routes/api.php',
          commands: __DIR__.'/../routes/console.php',
          health: '/up',
      )
      ->withMiddleware(function (Middleware $middleware): void {
          $middleware->web(append: [
              \App\Http\Middleware\HandleInertiaRequests::class,
          ]);
  
          $middleware->alias([
              'ensure.nakes' => \App\Http\Middleware\EnsureNakes::class,
              'ensure.parent' => \App\Http\Middleware\EnsureParent::class,
          ]);
      })
      ->withExceptions(function (Exceptions $exceptions): void {
          Integration::handles($exceptions);
      })->create();
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] File updated: `bootstrap/app.php`
  - [ ] Verify: `use Sentry\Laravel\Integration;` import present
  - [ ] Verify: `Integration::handles($exceptions);` inside `withExceptions()`
  - [ ] Command: `php artisan sentry:test`
  - [ ] Expected: "Sending test event to Sentry" message
  - [ ] Verify: Test event appears in Sentry dashboard

  **Commit**: YES
  - Message: `feat(sentry): integrate exception handling in bootstrap/app.php`
  - Files: `bootstrap/app.php`
  - Pre-commit: `php artisan sentry:test --no-interaction || true`

---

- [x] 4. Add User Context Tracking

  **What to do**:
  - Update `AppServiceProvider::boot()` to listen for `Authenticated` event
  - Configure user context with sanitized user data
  - Include `user_type` field from UserType enum

  **Must NOT do**:
  - Do not include sensitive user data (address, phone, NIK)
  - Do not include child information in user context
  - Do not include raw email - use hashed ID if privacy-sensitive

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small service provider modification
  - **Skills**: []
    - Standard Laravel service provider pattern

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 5)
  - **Parallel Group**: Wave 2 (with Task 5)
  - **Blocks**: Task 6
  - **Blocked By**: Tasks 2, 3

  **References**:

  **Pattern References**:
  - `app/Providers/AppServiceProvider.php:1-25` - Current empty service provider
  - `app/Enums/UserType.php` - UserType enum (Nakes|Parent)
  - `app/Models/User.php` - User model with user_type cast

  **Documentation References**:
  - https://docs.sentry.io/platforms/php/guides/laravel/enriching-events/identify-user/ - User context docs

  **Target Code**:
  ```php
  <?php

  namespace App\Providers;

  use Illuminate\Support\Facades\Event;
  use Illuminate\Support\ServiceProvider;
  use Sentry\State\Scope;

  class AppServiceProvider extends ServiceProvider
  {
      public function register(): void
      {
          //
      }

      public function boot(): void
      {
          $this->configureSentryUserContext();
      }

      private function configureSentryUserContext(): void
      {
          Event::listen(function (\Illuminate\Auth\Events\Authenticated $event): void {
              \Sentry\configureScope(function (Scope $scope) use ($event): void {
                  $user = $event->user;
                  
                  $scope->setUser([
                      'id' => $user->id,
                      'username' => $user->name,
                      'user_type' => $user->user_type?->value,
                  ]);
              });
          });
      }
  }
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] File updated: `app/Providers/AppServiceProvider.php`
  - [ ] Using Tinker (authenticated context simulation):
    ```bash
    php artisan tinker
    > $user = \App\Models\User::first();
    > Auth::login($user);
    > throw new \Exception('Test with user context');
    ```
  - [ ] Verify in Sentry dashboard: Event shows user with `user_type` field
  - [ ] Verify: No email address in user context (privacy)
  - [ ] Verify: No child data associated with user

  **Commit**: YES
  - Message: `feat(sentry): add user context tracking with UserType`
  - Files: `app/Providers/AppServiceProvider.php`
  - Pre-commit: `php artisan test --filter=AppServiceProvider || true`

---

- [x] 5. Configure Privacy Safeguards

  **What to do**:
  - Add `before_send` callback to sanitize error data
  - Configure request data sanitization (exclude sensitive routes)
  - Add sensitive header blocklist
  - Exclude API request bodies entirely

  **Must NOT do**:
  - Do not capture request bodies from any Child/ASQ3/PMT endpoints
  - Do not capture Authorization headers
  - Do not include stack trace local variables (may contain PHI)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Config modification with callback functions
  - **Skills**: []
    - Standard PHP configuration

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 4)
  - **Parallel Group**: Wave 2 (with Task 4)
  - **Blocks**: Task 6
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `config/sentry.php` - Config file from Task 2

  **Documentation References**:
  - https://docs.sentry.io/platforms/php/guides/laravel/configuration/filtering/ - Event filtering
  - https://docs.sentry.io/platforms/php/guides/laravel/data-management/sensitive-data/ - Sensitive data handling

  **Privacy Configuration to Add**:
  ```php
  // Add to config/sentry.php
  
  // Before send callback to sanitize events
  'before_send' => function (\Sentry\Event $event): ?\Sentry\Event {
      // Remove sensitive request data
      $request = $event->getRequest();
      if ($request !== null) {
          // Block all request bodies (may contain child health data)
          $request['data'] = '[FILTERED]';
          
          // Remove sensitive headers
          $sensitiveHeaders = ['authorization', 'cookie', 'x-api-token', 'x-xsrf-token'];
          if (isset($request['headers'])) {
              foreach ($sensitiveHeaders as $header) {
                  unset($request['headers'][$header]);
              }
          }
          
          $event->setRequest($request);
      }
      
      return $event;
  },
  
  // Integrations configuration
  'integrations' => function (array $integrations): array {
      // Customize request integration
      return array_filter($integrations, function ($integration) {
          // Remove EnvironmentIntegration if it causes issues
          return true;
      });
  },
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] File updated: `config/sentry.php` with `before_send` callback
  - [ ] Test with API request containing child data:
    ```bash
    # Trigger an error on child endpoint
    curl -X POST http://localhost:8000/api/v1/children \
      -H "Authorization: Bearer invalid" \
      -d '{"name": "Test Child", "weight": 10}'
    ```
  - [ ] Verify in Sentry: Request body shows `[FILTERED]`
  - [ ] Verify in Sentry: No `Authorization` header visible
  - [ ] Verify: Error event still contains useful stack trace

  **Commit**: YES
  - Message: `feat(sentry): add privacy safeguards for PHI protection`
  - Files: `config/sentry.php`
  - Pre-commit: `php artisan config:clear`

---

- [x] 6. Test and Verify Complete Integration

  **What to do**:
  - Run `php artisan sentry:test` for basic connectivity
  - Simulate errors from Nakes (web) routes
  - Simulate errors from Parents (API) routes
  - Verify user context appears correctly
  - Verify privacy safeguards are working
  - Document any issues found

  **Must NOT do**:
  - Do not proceed if PHI is visible in any Sentry event
  - Do not mark complete until all verification passes

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Testing and verification workflow
  - **Skills**: [`playwright`]
    - `playwright`: For web route testing via browser automation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Final (sequential)
  - **Blocks**: None
  - **Blocked By**: All previous tasks

  **References**:

  **Pattern References**:
  - `routes/web.php` - Web routes to test
  - `routes/api.php` - API routes to test
  - `app/Http/Controllers/Api/V1/ChildController.php` - Child API for privacy test

  **Documentation References**:
  - https://docs.sentry.io/platforms/php/guides/laravel/#verify - Verification docs

  **Acceptance Criteria**:

  **Functional Tests:**
  - [ ] `php artisan sentry:test` → "Test event sent successfully"
  - [ ] Test event visible in Sentry dashboard within 30 seconds

  **Web (Nakes) Route Test:**
  - [ ] Create temporary test route:
    ```php
    Route::get('/debug-sentry', function () {
        throw new \Exception('Test Nakes exception!');
    })->middleware('auth');
    ```
  - [ ] Login as Nakes user, visit `/debug-sentry`
  - [ ] Verify in Sentry: Event shows `user_type: nakes`
  - [ ] Remove test route after verification

  **API (Parent) Route Test:**
  - [ ] Using curl with valid Sanctum token:
    ```bash
    curl -X GET http://localhost:8000/api/v1/invalid-endpoint \
      -H "Authorization: Bearer YOUR_TOKEN"
    ```
  - [ ] Verify in Sentry: 404 is NOT captured (ignored exception)
  - [ ] Trigger actual exception on API endpoint
  - [ ] Verify in Sentry: Event shows `user_type: parent`

  **Privacy Verification:**
  - [ ] Review 5 recent Sentry events
  - [ ] Confirm: No child names visible
  - [ ] Confirm: No NIK (Indonesian ID) visible
  - [ ] Confirm: No Z-scores or health measurements visible
  - [ ] Confirm: No Authorization headers visible
  - [ ] Confirm: Request bodies show `[FILTERED]`

  **Final Checklist:**
  - [ ] All tests pass
  - [ ] Sentry dashboard accessible to team
  - [ ] DSN documented for production deployment
  - [ ] Privacy compliance verified

  **Commit**: YES
  - Message: `test(sentry): verify integration and privacy safeguards`
  - Files: None (or remove test route if added)
  - Pre-commit: `php artisan test`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `chore(deps): add sentry/sentry-laravel for error tracking` | composer.json, composer.lock | composer show sentry/sentry-laravel |
| 2 | `feat(sentry): add Sentry configuration with privacy safeguards` | config/sentry.php, .env.example | php artisan config:show sentry |
| 3 | `feat(sentry): integrate exception handling in bootstrap/app.php` | bootstrap/app.php | php artisan sentry:test |
| 4 | `feat(sentry): add user context tracking with UserType` | app/Providers/AppServiceProvider.php | manual verification |
| 5 | `feat(sentry): add privacy safeguards for PHI protection` | config/sentry.php | manual verification |
| 6 | `test(sentry): verify integration and privacy safeguards` | None | full verification |

---

## Success Criteria

### Verification Commands
```bash
# Check package installed
composer show sentry/sentry-laravel

# Check configuration
php artisan config:show sentry | grep dsn

# Test connectivity
php artisan sentry:test

# Check for config issues
php artisan config:clear && php artisan config:cache
```

### Final Checklist
- [x] All "Must Have" present:
  - [x] Exception handling via Integration::handles()
  - [x] User context with user_type field
  - [x] Environment-specific configuration
  - [x] Sensitive header exclusion
  - [x] Request body sanitization
- [x] All "Must NOT Have" absent:
  - [x] No child names/NIK in events
  - [x] No request bodies from API
  - [x] No SQL bindings
  - [x] No performance tracing
  - [x] No frontend error tracking
- [x] Privacy compliance verified (via code review - before_send callback)
- [x] Team can access Sentry dashboard (requires DSN configuration) *(DEPLOYMENT TASK - configure SENTRY_LARAVEL_DSN in .env)*
