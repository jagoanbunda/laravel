# Quickstart: Dual Authentication System Validation

**Feature**: 001-auth  
**Date**: 2026-01-17

This guide validates the dual authentication implementation:
- **Nakes**: Web-only authentication (session-based)
- **Parents**: API-only authentication (token-based)

## Prerequisites

1. Fresh database migration: `php artisan migrate:fresh --seed`
2. Application running: `php artisan serve`
3. For web testing: browser at http://localhost:8000

## Validation Scenarios

### 1. Parent API Authentication (Mobile App)

#### 1.1 Parent Registration via API
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone": "081234567890"
  }'

# Expected: 201 Created
# {
#   "message": "Registrasi berhasil",
#   "user": { 
#     "id": 1, 
#     "name": "Budi Santoso", 
#     "user_type": "parent",  <-- MUST be parent
#     ...
#   },
#   "token": "1|abc..."
# }
```

#### 1.2 Parent Login via API
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "budi@example.com",
    "password": "password123"
  }'

# Expected: 200 OK
# {
#   "message": "Login berhasil",
#   "user": { ..., "user_type": "parent" },
#   "token": "2|xyz..."
# }
```

#### 1.3 Parent Access Protected API Endpoints
```bash
# Use token from login
curl -X GET http://localhost:8000/api/v1/children \
  -H "Authorization: Bearer {PARENT_TOKEN}"

# Expected: 200 OK with children list
```

---

### 2. Nakes Web Authentication (Healthcare Workers)

#### 2.1 Nakes Registration via Web
Open browser and navigate to: `http://localhost:8000/register`

Fill the form:
- Name: Dr. Siti Rahayu
- Email: siti@puskesmas.go.id
- Password: password123
- NIK: 3201234567890123
- Position: Bidan

**Expected**: 
- Redirect to `/dashboard`
- Session cookie set
- User has `user_type: 'nakes'`

#### 2.2 Nakes Login via Web
Open browser and navigate to: `http://localhost:8000/login`

Enter credentials:
- Email: siti@puskesmas.go.id
- Password: password123

**Expected**:
- Redirect to `/dashboard`
- Can access all protected pages

#### 2.3 Nakes Access Dashboard
Navigate to: `http://localhost:8000/dashboard`

**Expected**:
- Dashboard loads with nakes-specific features
- Can see all families and children

---

### 3. Cross-Authentication Prevention (CRITICAL)

#### 3.1 Nakes CANNOT Login via API
```bash
# First, create a nakes user via web registration
# Then try to login via API:

curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "siti@puskesmas.go.id",
    "password": "password123"
  }'

# Expected: 403 Forbidden
# {
#   "message": "Akun tenaga kesehatan hanya dapat login melalui web.",
#   "error_code": "NAKES_WEB_ONLY"
# }
```

#### 3.2 Parent CANNOT Login via Web
1. First, create parent via API registration
2. Open browser: `http://localhost:8000/login`
3. Enter parent credentials:
   - Email: budi@example.com
   - Password: password123

**Expected**:
- Redirect back to `/login`
- Error message: "Akun orang tua hanya dapat diakses melalui aplikasi mobile."

#### 3.3 Parent Cannot Access Web Dashboard
Even if somehow a parent gets a session, they should be blocked:

```bash
# This should fail even with valid session
# Navigate to http://localhost:8000/dashboard while logged in as parent

# Expected: Redirect to /login with error
```

#### 3.4 Nakes Token Cannot Access API (if somehow obtained)
```bash
# Even if nakes creates a token manually, middleware blocks API access

curl -X GET http://localhost:8000/api/v1/children \
  -H "Authorization: Bearer {NAKES_TOKEN_IF_EXISTS}"

# Expected: 403 Forbidden
# {
#   "message": "Akses ditolak. API hanya untuk orang tua.",
#   "error_code": "PARENT_API_ONLY"
# }
```

---

### 4. Existing API Tests Verification

Run existing tests to ensure they still pass with parent users:

```bash
# Run all API auth tests
php artisan test --filter=AuthTest

# Expected output:
# - All existing tests pass
# - Tests now explicitly use parent users
# - New cross-auth tests pass
```

### 5. New Test Verification

```bash
# Run new cross-auth tests
php artisan test --filter=CrossAuthTest

# Run web auth tests for nakes
php artisan test --filter=NakesAuthTest

# Run all tests
php artisan test
```

---

## Database Verification

```sql
-- Check user types are correctly assigned
SELECT id, name, email, user_type FROM users;

-- Expected:
-- Parents have user_type = 'parent'
-- Nakes have user_type = 'nakes'

-- Check nakes profiles exist only for nakes users
SELECT u.email, u.user_type, np.nik, np.position
FROM users u
LEFT JOIN nakes_profiles np ON np.user_id = u.id;

-- Expected:
-- Only nakes users have nakes_profile records
-- Parent users have NULL for nakes_profile columns
```

---

## Success Criteria Checklist

### Parent (API) Authentication
- [ ] Parent can register via API → user_type is 'parent'
- [ ] Parent can login via API → receives token
- [ ] Parent can access protected API endpoints with token
- [ ] Parent CANNOT login via web → error message shown

### Nakes (Web) Authentication  
- [ ] Nakes can register via web → user_type is 'nakes', profile created
- [ ] Nakes can login via web → session created, redirects to dashboard
- [ ] Nakes can access all protected web pages
- [ ] Nakes CANNOT login via API → 403 with NAKES_WEB_ONLY error

### Cross-Auth Prevention
- [ ] API login rejects nakes users with clear error
- [ ] Web login rejects parent users with clear error
- [ ] API middleware blocks non-parent users
- [ ] Web middleware blocks non-nakes users

### Tests
- [ ] All existing API tests pass (updated for parent users)
- [ ] New NakesAuthTest passes
- [ ] New CrossAuthTest passes
- [ ] No regressions in existing functionality

---

## Troubleshooting

### "Session not persisting"
- Check `SESSION_DRIVER` in `.env` (should be `file` or `database`)
- Verify `storage/framework/sessions` is writable

### "CSRF token mismatch"
- Ensure `@csrf` is included in Inertia forms
- Check `APP_KEY` is set in `.env`

### "Token not working"
- Verify `SANCTUM_STATEFUL_DOMAINS` doesn't include mobile app domain
- Check token is sent in `Authorization: Bearer {token}` header

### "Cross-auth not blocking"
- Verify `ensure.nakes` middleware is applied to web routes
- Verify `ensure.parent` middleware is applied to API routes
- Check middleware is registered in `bootstrap/app.php`

---
*Quickstart complete. Updated for dual authentication model.*
