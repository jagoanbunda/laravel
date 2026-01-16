# Quickstart: API Testing for NAKES Mobile Application

## Overview
This guide helps you quickly start writing and running API tests for the NAKES application.

## Prerequisites
- PHP 8.5
- Composer dependencies installed (`composer install`)
- Database configured in `.env.testing` or using SQLite in-memory

## Running Tests

### Run All Tests
```bash
php artisan test
```

### Run Specific Test File
```bash
php artisan test tests/Feature/Api/V1/AuthTest.php
```

### Run Specific Test Method
```bash
php artisan test --filter=test_user_can_register
```

### Run with Verbose Output
```bash
php artisan test --verbose
```

## Test File Structure

Each test file follows this structure:

```php
<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_example(): void
    {
        // Arrange
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Act
        $response = $this->getJson('/api/v1/endpoint');

        // Assert
        $response->assertStatus(200);
    }
}
```

## Quick Reference

### Creating Test Data

```php
// Create a user
$user = User::factory()->create();

// Create a child for a user
$child = Child::factory()->for($user)->create();

// Create with specific state
$child = Child::factory()->male()->toddler()->create();

// Create multiple
$children = Child::factory()->count(3)->for($user)->create();
```

### Authentication

```php
// Authenticate as user for API calls
use Laravel\Sanctum\Sanctum;

Sanctum::actingAs($user);
// Now all API calls will be authenticated
```

### Making API Requests

```php
// GET request
$response = $this->getJson('/api/v1/children');

// POST request
$response = $this->postJson('/api/v1/children', [
    'name' => 'Budi',
    'birthday' => '2023-01-15',
    'gender' => 'male',
]);

// PUT request
$response = $this->putJson("/api/v1/children/{$child->id}", [
    'name' => 'Updated Name',
]);

// DELETE request
$response = $this->deleteJson("/api/v1/children/{$child->id}");
```

### Common Assertions

```php
// Status codes
$response->assertStatus(200);
$response->assertCreated(); // 201
$response->assertUnauthorized(); // 401
$response->assertForbidden(); // 403
$response->assertNotFound(); // 404
$response->assertUnprocessable(); // 422

// JSON structure
$response->assertJsonStructure([
    'message',
    'child' => ['id', 'name', 'birthday'],
]);

// JSON values
$response->assertJson([
    'message' => 'Data anak berhasil ditambahkan',
]);

// Validation errors
$response->assertJsonValidationErrors(['name']);

// Database assertions
$this->assertDatabaseHas('children', [
    'name' => 'Budi',
    'user_id' => $user->id,
]);

$this->assertDatabaseMissing('children', [
    'id' => $child->id,
]);

$this->assertSoftDeleted('children', [
    'id' => $child->id,
]);
```

## Example Test Scenarios

### Test Authentication Required
```php
public function test_unauthenticated_user_cannot_list_children(): void
{
    $response = $this->getJson('/api/v1/children');

    $response->assertUnauthorized();
}
```

### Test Authorization (403)
```php
public function test_user_cannot_access_another_users_child(): void
{
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $child = Child::factory()->for($otherUser)->create();

    Sanctum::actingAs($user);

    $response = $this->getJson("/api/v1/children/{$child->id}");

    $response->assertForbidden();
}
```

### Test Validation Errors (422)
```php
public function test_create_child_requires_name(): void
{
    Sanctum::actingAs(User::factory()->create());

    $response = $this->postJson('/api/v1/children', [
        'birthday' => '2023-01-15',
        'gender' => 'male',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
}
```

### Test Successful CRUD
```php
public function test_user_can_create_child(): void
{
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/v1/children', [
        'name' => 'Budi',
        'birthday' => '2023-01-15',
        'gender' => 'male',
    ]);

    $response->assertCreated()
        ->assertJson([
            'message' => 'Data anak berhasil ditambahkan',
        ]);

    $this->assertDatabaseHas('children', [
        'name' => 'Budi',
        'user_id' => $user->id,
    ]);
}
```

## Creating New Test Files

Use artisan to create test files:

```bash
# Create feature test
php artisan make:test Api/V1/ChildTest --phpunit

# This creates: tests/Feature/Api/V1/ChildTest.php
```

## Available Factory States

| Factory | States |
|---------|--------|
| User | `unverified()`, `withNotifications()` |
| Child | `male()`, `female()`, `newborn()`, `toddler()` |
| AnthropometryMeasurement | `normal()`, `stunted()`, `atPosyandu()` |
| Food | `userCreated()`, `protein()`, `carbohydrate()` |
| FoodLog | `breakfast()`, `lunch()`, `dinner()`, `snack()` |
| Asq3Screening | `completed()`, `cancelled()`, `normalResults()` |
| PmtSchedule | `today()`, `past()`, `future()` |
| Notification | `unread()`, `read()`, `screeningReminder()`, `pmtReminder()` |

## Test Checklist

For each API endpoint, test:
- [ ] Happy path (success case)
- [ ] Authentication required (401)
- [ ] Authorization (403 for wrong owner)
- [ ] Validation errors (422)
- [ ] Not found (404)
- [ ] Edge cases (empty data, boundary values)

## Troubleshooting

### "Table not found" error
Ensure `RefreshDatabase` trait is used:
```php
use Illuminate\Foundation\Testing\RefreshDatabase;

class MyTest extends TestCase
{
    use RefreshDatabase;
}
```

### Authentication not working
Use Sanctum helper, not manual tokens:
```php
use Laravel\Sanctum\Sanctum;

Sanctum::actingAs($user);
```

### Factory relationships
Use `for()` to associate:
```php
Child::factory()->for($user)->create();
```

## Next Steps

1. Run existing tests: `php artisan test`
2. Create test files for each domain using `php artisan make:test`
3. Write tests following the patterns above
4. Run tests frequently: `php artisan test --filter=YourTest`
