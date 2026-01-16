# Research: API Testing for Mobile Application

## Overview
Research findings for implementing comprehensive API tests for the NAKES (Child Health Tracking) Laravel application.

## Decision 1: Testing Framework
**Decision**: PHPUnit 11 with Laravel's testing helpers  
**Rationale**: Project already uses PHPUnit (per conventions). Laravel 12 provides excellent testing support with JSON assertions, authentication helpers, and database refresh.  
**Alternatives Considered**:
- Pest: Rejected - project guidelines explicitly require PHPUnit, convert any Pest tests to PHPUnit

## Decision 2: Test Organization
**Decision**: Feature tests organized by API domain under `tests/Feature/Api/V1/`  
**Rationale**: Mirrors the controller structure (`app/Http/Controllers/Api/V1/`), makes it easy to find related tests  
**Alternatives Considered**:
- Flat structure in `tests/Feature/`: Rejected - would become hard to navigate with 50+ endpoints
- Separate test files per endpoint: Rejected - too granular, creates file sprawl

## Decision 3: Authentication Testing
**Decision**: Use Sanctum's `actingAs()` helper with `Sanctum::actingAs()`  
**Rationale**: Sanctum v4 is already configured. This helper properly sets up the authentication context for API testing without needing to manage tokens manually.  
**Alternatives Considered**:
- Manual token generation in tests: Rejected - more verbose, less maintainable
- Mocking auth: Rejected - reduces test confidence

## Decision 4: Database Strategy
**Decision**: `RefreshDatabase` trait with SQLite in-memory for speed  
**Rationale**: Each test gets clean state, fast execution, matches Laravel conventions  
**Alternatives Considered**:
- `DatabaseTransactions`: Rejected - doesn't work well with multi-connection scenarios
- Real MySQL: Considered for CI, but in-memory is fine for local dev

## Decision 5: Factory Usage
**Decision**: Use existing model factories with states  
**Rationale**: Factories already exist for all models (User, Child, Food, etc.) with useful states like `male()`, `toddler()`, `stunted()`, `breakfast()`, etc.  
**Alternatives Considered**:
- Create test data manually: Rejected - factories are already well-designed

## Decision 6: Test Structure Per File
**Decision**: Each test file covers one API domain with methods for:
- Happy path CRUD operations
- Authentication required (401)
- Authorization (403)
- Validation errors (422)
- Not found (404)

**Rationale**: Comprehensive coverage following Laravel testing best practices

## Decision 7: Assertion Patterns
**Decision**: Use Laravel's fluent JSON assertions
```php
$response->assertStatus(200)
    ->assertJson([
        'message' => 'Success',
    ])
    ->assertJsonStructure([
        'data' => ['id', 'name', 'created_at'],
    ]);
```
**Rationale**: Clear, readable, Laravel-native approach

## API Domains to Test

### 1. Authentication (`AuthTest.php`)
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout (protected)
- POST /api/v1/auth/refresh (protected)
- GET /api/v1/auth/me (protected)
- PUT /api/v1/auth/profile (protected)

### 2. Children (`ChildTest.php`)
- GET /api/v1/children (protected)
- POST /api/v1/children (protected)
- GET /api/v1/children/{id} (protected)
- PUT /api/v1/children/{id} (protected)
- DELETE /api/v1/children/{id} (protected)
- GET /api/v1/children/{id}/summary (protected)

### 3. Anthropometry (`AnthropometryTest.php`)
- GET /api/v1/children/{child}/anthropometry (protected)
- POST /api/v1/children/{child}/anthropometry (protected)
- GET /api/v1/children/{child}/anthropometry/{id} (protected)
- PUT /api/v1/children/{child}/anthropometry/{id} (protected)
- DELETE /api/v1/children/{child}/anthropometry/{id} (protected)
- GET /api/v1/children/{child}/growth-chart (protected)

### 4. Foods (`FoodTest.php`)
- GET /api/v1/foods (protected)
- POST /api/v1/foods (protected)
- GET /api/v1/foods/{id} (protected)
- PUT /api/v1/foods/{id} (protected)
- DELETE /api/v1/foods/{id} (protected)
- GET /api/v1/foods-categories (protected)

### 5. Food Logs (`FoodLogTest.php`)
- GET /api/v1/children/{child}/food-logs (protected)
- POST /api/v1/children/{child}/food-logs (protected)
- GET /api/v1/children/{child}/food-logs/{id} (protected)
- PUT /api/v1/children/{child}/food-logs/{id} (protected)
- DELETE /api/v1/children/{child}/food-logs/{id} (protected)
- GET /api/v1/children/{child}/nutrition-summary (protected)

### 6. ASQ-3 Screening (`Asq3Test.php`)
Master Data:
- GET /api/v1/asq3/domains (protected)
- GET /api/v1/asq3/age-intervals (protected)
- GET /api/v1/asq3/age-intervals/{id}/questions (protected)
- GET /api/v1/asq3/recommendations (protected)

Screenings:
- GET /api/v1/children/{child}/screenings (protected)
- POST /api/v1/children/{child}/screenings (protected)
- GET /api/v1/children/{child}/screenings/{id} (protected)
- PUT /api/v1/children/{child}/screenings/{id} (protected)
- POST /api/v1/children/{child}/screenings/{id}/answers (protected)
- GET /api/v1/children/{child}/screenings/{id}/results (protected)

### 7. PMT (`PmtTest.php`)
- GET /api/v1/pmt/menus (protected)
- GET /api/v1/children/{child}/pmt-schedules (protected)
- POST /api/v1/children/{child}/pmt-schedules (protected)
- GET /api/v1/children/{child}/pmt-progress (protected)
- POST /api/v1/pmt-schedules/{schedule}/log (protected)
- PUT /api/v1/pmt-schedules/{schedule}/log (protected)

### 8. Notifications (`NotificationTest.php`)
- GET /api/v1/notifications (protected)
- GET /api/v1/notifications/unread-count (protected)
- PUT /api/v1/notifications/{id}/read (protected)
- POST /api/v1/notifications/read-all (protected)
- DELETE /api/v1/notifications/{id} (protected)

## Test Patterns

### Authentication Test Pattern
```php
public function test_unauthenticated_user_cannot_access_protected_endpoint(): void
{
    $response = $this->getJson('/api/v1/endpoint');
    $response->assertStatus(401);
}
```

### Authorization Test Pattern
```php
public function test_user_cannot_access_another_users_child(): void
{
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $child = Child::factory()->for($otherUser)->create();

    Sanctum::actingAs($user);

    $response = $this->getJson("/api/v1/children/{$child->id}");
    $response->assertStatus(403);
}
```

### Validation Test Pattern
```php
public function test_create_child_requires_name(): void
{
    Sanctum::actingAs(User::factory()->create());

    $response = $this->postJson('/api/v1/children', [
        'birthday' => '2023-01-01',
        'gender' => 'male',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
}
```

## Existing Resources

### Available Factories
| Factory | States |
|---------|--------|
| UserFactory | `unverified()`, `withNotifications()` |
| ChildFactory | `male()`, `female()`, `newborn()`, `toddler()` |
| AnthropometryMeasurementFactory | `normal()`, `stunted()`, `atPosyandu()` |
| FoodFactory | `userCreated()`, `protein()`, `carbohydrate()` |
| FoodLogFactory | `breakfast()`, `lunch()`, `dinner()`, `snack()` |
| Asq3ScreeningFactory | `completed()`, `cancelled()`, `normalResults()` |
| PmtScheduleFactory | `today()`, `past()`, `future()` |
| NotificationFactory | `unread()`, `read()`, `screeningReminder()`, `pmtReminder()` |

### Validation Rules Summary
| Request | Key Rules |
|---------|-----------|
| RegisterRequest | name required, email unique, password min:8 confirmed |
| LoginRequest | email required, password required |
| StoreChildRequest | name required, birthday before_or_equal:today, gender in:male,female,other |
| StoreAnthropometryRequest | measurement_date required, weight 1-100, height 30-200 |

## Implementation Notes

1. **Test File Creation**: Use `php artisan make:test Api/V1/DomainTest --phpunit`
2. **Base Test Class**: Use existing `Tests\TestCase`
3. **API Prefix**: All routes prefixed with `/api/v1/`
4. **Response Format**: JSON with message, data structure
5. **Indonesian Messages**: Error messages in Indonesian (as per existing controllers)

## Estimated Test Count
- Auth: 10 tests
- Children: 12 tests
- Anthropometry: 14 tests
- Foods: 10 tests
- Food Logs: 12 tests
- ASQ-3: 16 tests
- PMT: 10 tests
- Notifications: 10 tests

**Total: ~94 test methods across 8 test files**
