# Fix Sentry Config Cache Error

## TL;DR

> **Quick Summary**: Extract the `before_send` closure from `config/sentry.php` into an invokable class to allow config caching.
> 
> **Deliverables**:
> - New class `App\Sentry\SentryBeforeSend`
> - Updated `config/sentry.php` referencing the class
> 
> **Estimated Effort**: Quick (5 minutes)
> **Parallel Execution**: NO - sequential (2 tasks)
> **Critical Path**: Task 1 → Task 2

---

## Context

### Original Request
Laravel throws `LogicException: Your configuration files could not be serialized because the value at "sentry.before_send" is non-serializable` when running `php artisan optimize` or `php artisan config:cache`.

### Root Cause
`config/sentry.php` lines 39-57 contain a Closure:

```php
'before_send' => function (\Sentry\Event $event): ?\Sentry\Event {
    // ... sanitization logic
},
```

PHP's `var_export()` (used by Laravel's config caching) cannot serialize closures.

### Solution
Extract the closure into an invokable class. Laravel/Sentry will instantiate and call it.

---

## Work Objectives

### Core Objective
Make `php artisan config:cache` work by replacing the closure with a serializable class reference.

### Concrete Deliverables
- `app/Sentry/SentryBeforeSend.php` - invokable class
- Updated `config/sentry.php` - references class instead of closure

### Definition of Done
- [x] `php artisan config:cache` succeeds without errors
- [x] `php artisan optimize` succeeds without errors

### Must Have
- Exact same sanitization logic preserved (request body filtered, sensitive headers removed)
- PHPDoc block on class

### Must NOT Have (Guardrails)
- DO NOT change the sanitization logic
- DO NOT add dependencies or constructor injection
- DO NOT create tests (trivial refactor, behavior unchanged)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (PHPUnit)
- **User wants tests**: NO - trivial refactor, no behavior change
- **Framework**: N/A

### Automated Verification
```bash
# Verify config caching works
php artisan config:cache

# Verify optimize works  
php artisan optimize

# Clean up cached config
php artisan config:clear
```

---

## TODOs

- [x] 1. Create SentryBeforeSend invokable class

  **What to do**:
  - Create `app/Sentry/SentryBeforeSend.php`
  - Move the closure logic from `config/sentry.php` lines 39-57 into `__invoke()` method
  - Add proper namespace, type hints, and PHPDoc

  **Implementation**:
  ```php
  <?php

  namespace App\Sentry;

  use Sentry\Event;

  /**
   * Sanitize Sentry events before sending to remove sensitive health data.
   */
  final class SentryBeforeSend
  {
      public function __invoke(Event $event): ?Event
      {
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
      }
  }
  ```

  **Must NOT do**:
  - Do not change the filtering logic
  - Do not add constructor parameters

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
    - No special skills needed - simple file creation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 2
  - **Blocked By**: None

  **References**:
  - `config/sentry.php:39-57` - Source closure logic to extract

  **Acceptance Criteria**:
  - [ ] File exists at `app/Sentry/SentryBeforeSend.php`
  - [ ] Class is in `App\Sentry` namespace
  - [ ] Has `__invoke(Event $event): ?Event` method
  - [ ] Logic matches original closure exactly

  **Commit**: YES
  - Message: `refactor(sentry): extract before_send closure to invokable class`
  - Files: `app/Sentry/SentryBeforeSend.php`

---

- [x] 2. Update config/sentry.php to reference class

  **What to do**:
  - Replace the closure at `before_send` with the class reference
  - Change from anonymous function to `\App\Sentry\SentryBeforeSend::class`

  **Implementation**:
  Replace lines 38-57:
  ```php
  // Before send callback to sanitize events
  'before_send' => \App\Sentry\SentryBeforeSend::class,
  ```

  **Must NOT do**:
  - Do not change any other config values
  - Do not instantiate the class (Sentry does this)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after Task 1)
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:
  - `config/sentry.php:38-57` - Lines to replace
  - `app/Sentry/SentryBeforeSend.php` - Class to reference (from Task 1)

  **Acceptance Criteria**:
  - [ ] `config/sentry.php` contains `'before_send' => \App\Sentry\SentryBeforeSend::class,`
  - [ ] No closure remains in the file
  - [ ] `php artisan config:cache` succeeds
  - [ ] `php artisan optimize` succeeds

  **Commit**: YES
  - Message: `fix(sentry): use class reference for config cache compatibility`
  - Files: `config/sentry.php`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `refactor(sentry): extract before_send closure to invokable class` | `app/Sentry/SentryBeforeSend.php` | File exists |
| 2 | `fix(sentry): use class reference for config cache compatibility` | `config/sentry.php` | `php artisan config:cache` |

---

## Success Criteria

### Verification Commands
```bash
php artisan config:cache  # Expected: "Configuration cached successfully."
php artisan optimize      # Expected: No errors
php artisan config:clear  # Cleanup
```

### Final Checklist
- [x] `SentryBeforeSend` class created with exact same logic
- [x] `config/sentry.php` references class, no closure
- [x] `php artisan config:cache` works
- [x] `php artisan optimize` works
