# API V1 Controllers

Mobile REST API for **Parent** users (mobile app). Sanctum token authentication.

## Structure

```
Api/V1/
├── AuthController.php        # Login/logout (Parents only, Nakes blocked)
├── AnthropometryController.php  # Growth measurements + Z-scores
├── Asq3Controller.php        # Screening workflow (375 lines, complex)
├── ChildController.php       # Child CRUD
├── FoodController.php        # Food catalog search
├── FoodLogController.php     # Daily nutrition logging
├── NotificationController.php  # Push notification management
└── PmtController.php         # PMT program progress
```

## Conventions

### Authentication
- All routes use `auth:sanctum` + `ensure.parent` middleware
- Nakes users **cannot** authenticate via API (explicit check in `AuthController@login`)
- Token abilities: currently unused, all tokens have full access

### Request/Response
- Form Requests in `app/Http/Requests/Api/V1/{Feature}/`
- Resources in `app/Http/Resources/Api/V1/{Feature}Resource.php`
- All responses use Eloquent API Resources (never raw arrays)

### Child Ownership
- Every child-related endpoint validates ownership:
```php
private function authorizeChild(Request $request, Child $child): void
{
    if ($child->user_id !== $request->user()->id) {
        abort(403, 'Unauthorized');
    }
}
```

### Nested Routes
Most endpoints are child-scoped:
- `GET /v1/children/{child}/anthropometry`
- `POST /v1/children/{child}/food-logs`
- `GET /v1/children/{child}/asq3-screenings`

### Z-Score Calculations
`AnthropometryController` injects `WhoZScoreService` for WHO standard calculations. Response includes:
- Raw Z-scores (weight_for_age, height_for_age, etc.)
- Derived statuses (nutritional_status, stunting_status, wasting_status)

## Anti-Patterns

| Forbidden | Do Instead |
|-----------|------------|
| Return raw model | Use `{Model}Resource::make()` |
| Inline validation | Create Form Request class |
| Access other user's children | Always call `authorizeChild()` |
| Allow Nakes login | Return 403 with message |

## Testing

Tests in `tests/Feature/Api/V1/`. Use `Sanctum::actingAs($user)` for auth.
