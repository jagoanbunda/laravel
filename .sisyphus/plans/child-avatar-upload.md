# Child Avatar Upload Feature

## TL;DR

> **Quick Summary**: Add file upload capability for child avatars to the API, following the existing AuthController pattern.
> 
> **Deliverables**:
> - Modified `StoreChildRequest` with avatar validation
> - Modified `UpdateChildRequest` with avatar validation
> - Modified `ChildController::store()` with file handling
> - Modified `ChildController::update()` with file handling
> - PHPUnit tests for avatar upload scenarios
> 
> **Estimated Effort**: Quick (< 2 hours)
> **Parallel Execution**: NO - sequential (dependencies between tasks)
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4

---

## Context

### Original Request
Add avatar file upload capability to `PUT /children/{child}` endpoint. User also confirmed including it in `POST /children`.

### Interview Summary
**Key Discussions**:
- Storage path: `children/avatars/` (separate from user avatars)
- Scope: Both POST and PUT endpoints
- Validation: 2MB max, jpeg/jpg/png (same as user avatars)

**Research Findings**:
- Child model already has `avatar_url` field (fillable)
- Database `children` table already has `avatar_url` column
- AuthController has working file upload pattern to follow
- Existing `avatar_url` validation accepts external URLs (keep this)

### Metis Review
**Identified Gaps** (addressed):
- External URL support: Keep existing `avatar_url` field (supports both file AND URL)
- avatar vs avatar_url conflict: File upload takes precedence (AuthController pattern)
- Avatar clearing: Not supported (out of scope, matches AuthController)
- Child deletion cleanup: Out of scope (orphaned files acceptable per Metis)

---

## Work Objectives

### Core Objective
Enable parents to upload avatar image files for their children via the API.

### Concrete Deliverables
- `PUT /api/v1/children/{child}` accepts `avatar` file field
- `POST /api/v1/children` accepts `avatar` file field
- Avatar files stored in `storage/app/public/children/avatars/`
- Old avatar deleted when new one uploaded

### Definition of Done
- [x] `php artisan test --filter=ChildTest` passes
- [ ] Avatar upload works via curl/Postman
- [ ] `storage/app/public/children/avatars/` contains uploaded files
- [ ] Database `avatar_url` shows correct path

### Must Have
- File upload validation: image, mimes:jpeg,jpg,png, max:2048
- Storage path: `children/avatars/`
- Delete old avatar before storing new one
- Support BOTH file upload AND external URL

### Must NOT Have (Guardrails)
- DO NOT add image processing (resize, crop, optimize)
- DO NOT modify Child model (fillable is already correct)
- DO NOT touch frontend components
- DO NOT add avatar history/gallery
- DO NOT implement child deletion avatar cleanup
- DO NOT modify storage configuration (use existing `public` disk)
- DO NOT remove existing `avatar_url` validation (external URLs must work)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (PHPUnit)
- **User wants tests**: YES (project convention)
- **Framework**: PHPUnit (project standard)

### Test Approach
Each TODO will include specific PHPUnit test cases following AuthTest patterns.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start):
└── Task 1: Add avatar validation to Form Requests

Wave 2 (After Wave 1):
└── Task 2: Implement file handling in ChildController::store()

Wave 3 (After Wave 2):
└── Task 3: Implement file handling in ChildController::update()

Wave 4 (After Wave 3):
└── Task 4: Add PHPUnit tests

Critical Path: Task 1 → Task 2 → Task 3 → Task 4
Parallel Speedup: None (sequential dependencies)
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3 | None |
| 2 | 1 | 4 | None |
| 3 | 1 | 4 | None (shares code pattern with 2) |
| 4 | 2, 3 | None | None |

---

## TODOs

- [x] 1. Add Avatar Validation to Form Requests

  **What to do**:
  - Add `'avatar' => ['sometimes', 'nullable', 'image', 'mimes:jpeg,jpg,png', 'max:2048']` to `StoreChildRequest::rules()`
  - Add `'avatar' => ['sometimes', 'nullable', 'image', 'mimes:jpeg,jpg,png', 'max:2048']` to `UpdateChildRequest::rules()`
  - Add Indonesian error messages for avatar validation

  **Must NOT do**:
  - DO NOT modify `avatar_url` validation (keep external URL support)
  - DO NOT change other validation rules

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple validation rule additions to existing files
  - **Skills**: [`git-master`]
    - `git-master`: Atomic commit after changes

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (start immediately)
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `app/Http/Controllers/Api/V1/AuthController.php:149` - Avatar validation rule pattern: `'avatar' => 'sometimes|nullable|image|mimes:jpeg,jpg,png|max:2048'`

  **Target Files**:
  - `app/Http/Requests/Api/V1/Child/StoreChildRequest.php:23-35` - Add avatar rule after line 29 (after avatar_url)
  - `app/Http/Requests/Api/V1/Child/UpdateChildRequest.php:23-35` - Add avatar rule after line 29 (after avatar_url)

  **Acceptance Criteria**:

  ```bash
  # Verify rules() method contains avatar validation
  grep -n "avatar.*image.*mimes" app/Http/Requests/Api/V1/Child/StoreChildRequest.php
  # Assert: Returns line with avatar validation rule

  grep -n "avatar.*image.*mimes" app/Http/Requests/Api/V1/Child/UpdateChildRequest.php
  # Assert: Returns line with avatar validation rule

  # Verify avatar_url rule still exists (external URL support)
  grep -n "avatar_url.*url" app/Http/Requests/Api/V1/Child/StoreChildRequest.php
  # Assert: Returns line with avatar_url validation
  ```

  **Commit**: YES
  - Message: `feat(api): add avatar file validation to child form requests`
  - Files: `app/Http/Requests/Api/V1/Child/StoreChildRequest.php`, `app/Http/Requests/Api/V1/Child/UpdateChildRequest.php`
  - Pre-commit: `vendor/bin/pint --dirty`

---

- [x] 2. Implement Avatar Upload in ChildController::store()

  **What to do**:
  - Import `Illuminate\Support\Facades\Storage` at top of file
  - Before `$request->user()->children()->create()`, handle avatar file upload
  - Store file to `children/avatars` path on `public` disk
  - Merge avatar_url into validated data before create

  **Must NOT do**:
  - DO NOT add image processing
  - DO NOT change authorization logic
  - DO NOT modify response format

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Adding file handling code following established pattern
  - **Skills**: [`git-master`]
    - `git-master`: Atomic commit after changes

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `app/Http/Controllers/Api/V1/AuthController.php:150-161` - File upload pattern:
    ```php
    if ($request->hasFile('avatar')) {
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->avatar_url = $path;
    } elseif ($request->has('avatar_url')) {
        $user->avatar_url = $request->avatar_url;
    }
    ```

  **Target Files**:
  - `app/Http/Controllers/Api/V1/ChildController.php:36-44` - Modify store() method

  **Implementation Pattern**:
  ```php
  public function store(StoreChildRequest $request): JsonResponse
  {
      $validated = $request->validated();

      // Handle avatar file upload
      if ($request->hasFile('avatar')) {
          $validated['avatar_url'] = $request->file('avatar')->store('children/avatars', 'public');
      }

      $child = $request->user()->children()->create($validated);

      return response()->json([
          'message' => 'Data anak berhasil ditambahkan',
          'child' => new ChildResource($child),
      ], 201);
  }
  ```

  **Acceptance Criteria**:

  ```bash
  # Verify Storage import exists
  grep -n "use Illuminate\\\\Support\\\\Facades\\\\Storage" app/Http/Controllers/Api/V1/ChildController.php
  # Assert: Returns line number (import exists)

  # Verify hasFile check exists in store method
  grep -n "hasFile.*avatar" app/Http/Controllers/Api/V1/ChildController.php
  # Assert: Returns line number

  # Verify storage path is children/avatars
  grep -n "children/avatars" app/Http/Controllers/Api/V1/ChildController.php
  # Assert: Returns line number
  ```

  **Commit**: YES
  - Message: `feat(api): add avatar file upload to child store endpoint`
  - Files: `app/Http/Controllers/Api/V1/ChildController.php`
  - Pre-commit: `vendor/bin/pint --dirty`

---

- [x] 3. Implement Avatar Upload in ChildController::update()

  **What to do**:
  - Handle avatar file upload in update() method
  - Delete old avatar if exists and starts with `children/avatars/`
  - Store new avatar to `children/avatars` path
  - Merge avatar_url into validated data before update

  **Must NOT do**:
  - DO NOT add image processing
  - DO NOT change authorization logic
  - DO NOT modify response format
  - DO NOT delete avatars that are external URLs (check path prefix)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Adding file handling code following established pattern
  - **Skills**: [`git-master`]
    - `git-master`: Atomic commit after changes

  **Parallelization**:
  - **Can Run In Parallel**: NO (shares file with Task 2)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 4
  - **Blocked By**: Task 1 (validation must exist), Task 2 (Storage import)

  **References**:

  **Pattern References**:
  - `app/Http/Controllers/Api/V1/AuthController.php:150-161` - Delete old + store new pattern:
    ```php
    if ($request->hasFile('avatar')) {
        if ($user->avatar_url && str_starts_with($user->avatar_url, 'avatars/')) {
            Storage::disk('public')->delete($user->avatar_url);
        }
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->avatar_url = $path;
    }
    ```

  **Target Files**:
  - `app/Http/Controllers/Api/V1/ChildController.php:61-71` - Modify update() method

  **Implementation Pattern**:
  ```php
  public function update(UpdateChildRequest $request, Child $child): JsonResponse
  {
      $this->authorizeChild($request, $child);

      $validated = $request->validated();

      // Handle avatar file upload
      if ($request->hasFile('avatar')) {
          // Delete old avatar if it's a local file
          if ($child->avatar_url && str_starts_with($child->avatar_url, 'children/avatars/')) {
              Storage::disk('public')->delete($child->avatar_url);
          }
          $validated['avatar_url'] = $request->file('avatar')->store('children/avatars', 'public');
      }

      $child->update($validated);

      return response()->json([
          'message' => 'Data anak berhasil diperbarui',
          'child' => new ChildResource($child->fresh()),
      ]);
  }
  ```

  **Acceptance Criteria**:

  ```bash
  # Verify delete old avatar logic exists
  grep -n "Storage::disk.*delete" app/Http/Controllers/Api/V1/ChildController.php
  # Assert: Returns line number

  # Verify str_starts_with check for local files
  grep -n "str_starts_with.*children/avatars" app/Http/Controllers/Api/V1/ChildController.php
  # Assert: Returns line number

  # Verify store to children/avatars in update method
  grep -A5 "function update" app/Http/Controllers/Api/V1/ChildController.php | grep "children/avatars"
  # Assert: Returns line with path
  ```

  **Commit**: YES
  - Message: `feat(api): add avatar file upload to child update endpoint`
  - Files: `app/Http/Controllers/Api/V1/ChildController.php`
  - Pre-commit: `vendor/bin/pint --dirty`

---

- [x] 4. Add PHPUnit Tests for Avatar Upload

  **What to do**:
  - Create test methods in `tests/Feature/Api/V1/ChildTest.php`
  - Use `Storage::fake('public')` to mock storage
  - Use `UploadedFile::fake()->image()` for test files
  - Test cases:
    1. `test_user_can_create_child_with_avatar` - POST with file
    2. `test_user_can_update_child_avatar` - PUT with file
    3. `test_avatar_upload_deletes_old_avatar` - Verify old file deleted
    4. `test_avatar_upload_validates_file_type` - Reject non-images
    5. `test_avatar_upload_validates_file_size` - Reject > 2MB

  **Must NOT do**:
  - DO NOT modify existing tests
  - DO NOT remove existing test methods
  - DO NOT use Pest syntax (PHPUnit only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Adding test methods following existing patterns
  - **Skills**: [`git-master`]
    - `git-master`: Atomic commit after changes

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final)
  - **Blocks**: None
  - **Blocked By**: Tasks 2, 3

  **References**:

  **Pattern References**:
  - `tests/Feature/Api/V1/AuthTest.php:320-434` - Avatar test patterns:
    ```php
    public function test_update_profile_with_avatar_upload(): void
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->image('avatar.jpg', 200, 200);

        $response = $this->putJson('/api/v1/auth/profile', [
            'avatar' => $file,
        ]);

        $response->assertOk();
        Storage::disk('public')->assertExists('avatars/' . $file->hashName());
    }
    ```

  **Target Files**:
  - `tests/Feature/Api/V1/ChildTest.php` - Add new test methods

  **Test Implementation Pattern**:
  ```php
  public function test_user_can_create_child_with_avatar(): void
  {
      Storage::fake('public');
      $user = User::factory()->asParent()->create();
      $file = UploadedFile::fake()->image('avatar.jpg', 200, 200);

      $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/children', [
          'name' => 'Test Child',
          'birthday' => '2023-01-15',
          'gender' => 'male',
          'avatar' => $file,
      ]);

      $response->assertCreated();
      Storage::disk('public')->assertExists('children/avatars/' . $file->hashName());
      $this->assertDatabaseHas('children', [
          'name' => 'Test Child',
          'avatar_url' => 'children/avatars/' . $file->hashName(),
      ]);
  }

  public function test_avatar_upload_deletes_old_avatar(): void
  {
      Storage::fake('public');
      $user = User::factory()->asParent()->create();
      $child = Child::factory()->for($user)->create([
          'avatar_url' => 'children/avatars/old-avatar.jpg',
      ]);

      // Create the old file
      Storage::disk('public')->put('children/avatars/old-avatar.jpg', 'old content');

      $newFile = UploadedFile::fake()->image('new-avatar.jpg', 200, 200);

      $response = $this->actingAs($user, 'sanctum')->putJson("/api/v1/children/{$child->id}", [
          'avatar' => $newFile,
      ]);

      $response->assertOk();
      Storage::disk('public')->assertMissing('children/avatars/old-avatar.jpg');
      Storage::disk('public')->assertExists('children/avatars/' . $newFile->hashName());
  }

  public function test_avatar_upload_validates_file_type(): void
  {
      Storage::fake('public');
      $user = User::factory()->asParent()->create();
      $file = UploadedFile::fake()->create('document.pdf', 100);

      $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/children', [
          'name' => 'Test Child',
          'birthday' => '2023-01-15',
          'gender' => 'male',
          'avatar' => $file,
      ]);

      $response->assertUnprocessable();
      $response->assertJsonValidationErrors(['avatar']);
  }

  public function test_avatar_upload_validates_file_size(): void
  {
      Storage::fake('public');
      $user = User::factory()->asParent()->create();
      $file = UploadedFile::fake()->image('large.jpg')->size(3000); // 3MB

      $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/children', [
          'name' => 'Test Child',
          'birthday' => '2023-01-15',
          'gender' => 'male',
          'avatar' => $file,
      ]);

      $response->assertUnprocessable();
      $response->assertJsonValidationErrors(['avatar']);
  }
  ```

  **Acceptance Criteria**:

  ```bash
  # Run avatar-related tests
  php artisan test --filter=test_user_can_create_child_with_avatar
  # Assert: Test passes

  php artisan test --filter=test_user_can_update_child_avatar
  # Assert: Test passes

  php artisan test --filter=test_avatar_upload_deletes_old_avatar
  # Assert: Test passes

  php artisan test --filter=test_avatar_upload_validates_file_type
  # Assert: Test passes

  php artisan test --filter=test_avatar_upload_validates_file_size
  # Assert: Test passes

  # Run all child tests to ensure no regressions
  php artisan test tests/Feature/Api/V1/ChildTest.php
  # Assert: All tests pass
  ```

  **Commit**: YES
  - Message: `test(api): add avatar upload tests for child endpoints`
  - Files: `tests/Feature/Api/V1/ChildTest.php`
  - Pre-commit: `php artisan test --filter=ChildTest`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(api): add avatar file validation to child form requests` | StoreChildRequest.php, UpdateChildRequest.php | `vendor/bin/pint --dirty` |
| 2 | `feat(api): add avatar file upload to child store endpoint` | ChildController.php | `vendor/bin/pint --dirty` |
| 3 | `feat(api): add avatar file upload to child update endpoint` | ChildController.php | `vendor/bin/pint --dirty` |
| 4 | `test(api): add avatar upload tests for child endpoints` | ChildTest.php | `php artisan test --filter=ChildTest` |

---

## Success Criteria

### Verification Commands
```bash
# All child tests pass
php artisan test tests/Feature/Api/V1/ChildTest.php
# Expected: All tests pass (including new avatar tests)

# Code style check
vendor/bin/pint --test
# Expected: No style issues
```

### Final Checklist
- [x] Avatar upload works on POST /children
- [x] Avatar upload works on PUT /children/{child}
- [x] Old avatar deleted when new one uploaded
- [x] External URL support still works (avatar_url field)
- [x] All validation rules enforced (type, size)
- [x] All tests pass
- [x] Code formatted with Pint
