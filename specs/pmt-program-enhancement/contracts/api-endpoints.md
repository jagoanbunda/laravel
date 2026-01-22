# API Contracts: PMT Program Enhancement

## Overview
This document defines the web routes and controller actions for the PMT Program Enhancement feature. Since this is an Inertia.js application, these are web routes that return Inertia responses, not traditional API endpoints.

## Route Definitions

### PMT Programs (NEW)

| Method | URI | Action | Name | Description |
|--------|-----|--------|------|-------------|
| GET | `/pmt/programs` | index | pmt.programs.index | List all PMT programs |
| GET | `/pmt/programs/create` | create | pmt.programs.create | Show enrollment form |
| POST | `/pmt/programs` | store | pmt.programs.store | Create program + schedules |
| GET | `/pmt/programs/{program}` | show | pmt.programs.show | Program details & progress |
| GET | `/pmt/programs/{program}/edit` | edit | pmt.programs.edit | Edit program form |
| PUT | `/pmt/programs/{program}` | update | pmt.programs.update | Update program |
| DELETE | `/pmt/programs/{program}` | destroy | pmt.programs.destroy | Delete program |
| POST | `/pmt/programs/{program}/discontinue` | discontinue | pmt.programs.discontinue | Mark program discontinued |

### Existing PMT Routes (UNCHANGED)

| Method | URI | Action | Name |
|--------|-----|--------|------|
| GET | `/pmt` | index | pmt.index |
| GET | `/pmt/create` | create | pmt.create |
| POST | `/pmt` | store | pmt.store |
| GET | `/pmt/{id}` | show | pmt.show |
| GET | `/pmt/{id}/edit` | edit | pmt.edit |
| PUT | `/pmt/{id}` | update | pmt.update |
| DELETE | `/pmt/{id}` | destroy | pmt.destroy |
| POST | `/pmt/{id}/log` | logDistribution | pmt.log |

## Controller Specifications

### PmtProgramController (NEW)

#### index()
**Purpose**: List all PMT programs with filtering and pagination.

**Request**:
- Query params: `search`, `status`, `page`

**Response** (Inertia):
```php
return Inertia::render('pmt/programs/index', [
    'programs' => [
        'data' => [
            [
                'id' => 1,
                'child_id' => 1,
                'child_name' => 'Ahmad',
                'parent_name' => 'Ibu Siti',
                'start_date' => '2026-01-17',
                'end_date' => '2026-04-16',
                'duration_days' => 90,
                'status' => 'active',
                'progress_percentage' => 45.5,
                'days_remaining' => 49,
                'created_at' => '2026-01-17T10:00:00Z',
            ],
            // ...
        ],
        'current_page' => 1,
        'last_page' => 3,
        'per_page' => 15,
        'total' => 42,
    ],
    'filters' => [
        'search' => null,
        'status' => null,
    ],
]);
```

#### create()
**Purpose**: Show form to enroll a child in a PMT program.

**Response** (Inertia):
```php
return Inertia::render('pmt/programs/create', [
    'children' => [
        [
            'id' => 1,
            'name' => 'Ahmad',
            'parent_name' => 'Ibu Siti',
            'age_months' => 18,
            'has_active_program' => false,
        ],
        // ...
    ],
]);
```

#### store(StorePmtProgramRequest $request)
**Purpose**: Create a PMT program and auto-generate daily schedules.

**Request**:
```php
[
    'child_id' => 1,           // required, exists:children,id
    'start_date' => '2026-01-20', // required, date, after_or_equal:today
    'duration_days' => 90,     // required, in:90,120
    'notes' => 'Special diet', // nullable, max:1000
]
```

**Response**:
- Success: Redirect to `pmt.programs.show` with flash message
- Validation Error: 422 with errors

**Side Effects**:
- Creates `pmt_programs` record
- Creates 90 or 120 `pmt_schedules` records (bulk insert)

#### show(PmtProgram $program)
**Purpose**: Display program details with schedule progress.

**Response** (Inertia):
```php
return Inertia::render('pmt/programs/show', [
    'program' => [
        'id' => 1,
        'child' => [
            'id' => 1,
            'name' => 'Ahmad',
            'age_months' => 18,
        ],
        'parent' => [
            'id' => 1,
            'name' => 'Ibu Siti',
        ],
        'start_date' => '2026-01-17',
        'end_date' => '2026-04-16',
        'duration_days' => 90,
        'status' => 'active',
        'progress_percentage' => 45.5,
        'days_remaining' => 49,
        'notes' => 'Special diet',
        'created_by' => 'Admin NAKES',
        'created_at' => '2026-01-17T10:00:00Z',
    ],
    'schedules' => [
        'data' => [
            [
                'id' => 1,
                'scheduled_date' => '2026-01-17',
                'is_logged' => true,
                'log' => [
                    'food_name' => 'Bubur Kacang Hijau',
                    'portion' => 'habis',
                    'logged_at' => '2026-01-17T12:00:00Z',
                ],
            ],
            // ...
        ],
        'current_page' => 1,
        'last_page' => 9,
        'per_page' => 10,
        'total' => 90,
    ],
    'statistics' => [
        'total_days' => 90,
        'logged_days' => 41,
        'pending_days' => 49,
        'completion_rate' => 45.5,
    ],
]);
```

#### update(UpdatePmtProgramRequest $request, PmtProgram $program)
**Purpose**: Update program notes (status changes via separate endpoints).

**Request**:
```php
[
    'notes' => 'Updated notes', // nullable, max:1000
]
```

**Response**:
- Success: Redirect back with flash message

#### destroy(PmtProgram $program)
**Purpose**: Delete a program and all its schedules.

**Response**:
- Success: Redirect to `pmt.programs.index` with flash message

**Side Effects**:
- Cascading delete of all related schedules and logs

#### discontinue(PmtProgram $program)
**Purpose**: Mark an active program as discontinued.

**Request**: None (POST)

**Response**:
- Success: Redirect back with flash message
- Error: 400 if program is not active

**Side Effects**:
- Updates `status` to 'discontinued'

## Form Request Specifications

### StorePmtProgramRequest

```php
<?php

namespace App\Http\Requests;

use App\Models\PmtProgram;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePmtProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'child_id' => 'required|exists:children,id',
            'start_date' => 'required|date|after_or_equal:today',
            'duration_days' => 'required|integer|in:90,120',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'child_id.required' => 'Anak wajib dipilih.',
            'child_id.exists' => 'Anak tidak ditemukan.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.after_or_equal' => 'Tanggal mulai harus hari ini atau setelahnya.',
            'duration_days.required' => 'Durasi program wajib dipilih.',
            'duration_days.in' => 'Durasi program harus 90 atau 120 hari.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            // Check if child already has an active program
            $hasActiveProgram = PmtProgram::where('child_id', $this->child_id)
                ->where('status', 'active')
                ->exists();

            if ($hasActiveProgram) {
                $validator->errors()->add(
                    'child_id',
                    'Anak ini sudah memiliki program PMT aktif.'
                );
            }
        });
    }
}
```

## Inertia Page Props

### programs/index.tsx

```typescript
interface PmtProgramListItem {
    id: number;
    child_id: number;
    child_name: string;
    parent_name: string;
    start_date: string;
    end_date: string;
    duration_days: 90 | 120;
    status: 'active' | 'completed' | 'discontinued';
    progress_percentage: number;
    days_remaining: number;
    created_at: string;
}

interface Props {
    programs: {
        data: PmtProgramListItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}
```

### programs/create.tsx

```typescript
interface ChildOption {
    id: number;
    name: string;
    parent_name: string;
    age_months: number;
    has_active_program: boolean;
}

interface Props {
    children: ChildOption[];
}

// Form data
interface FormData {
    child_id: string;
    start_date: string;
    duration_days: 90 | 120;
    notes: string;
}
```

### programs/show.tsx

```typescript
interface PmtProgramDetail {
    id: number;
    child: {
        id: number;
        name: string;
        age_months: number;
    };
    parent: {
        id: number;
        name: string;
    };
    start_date: string;
    end_date: string;
    duration_days: 90 | 120;
    status: 'active' | 'completed' | 'discontinued';
    progress_percentage: number;
    days_remaining: number;
    notes: string | null;
    created_by: string;
    created_at: string;
}

interface ScheduleItem {
    id: number;
    scheduled_date: string;
    is_logged: boolean;
    log: {
        food_name: string | null;
        portion: 'habis' | 'half' | 'quarter' | 'none';
        logged_at: string;
    } | null;
}

interface Props {
    program: PmtProgramDetail;
    schedules: {
        data: ScheduleItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    statistics: {
        total_days: number;
        logged_days: number;
        pending_days: number;
        completion_rate: number;
    };
}
```

## Route Registration

```php
// routes/web.php

// PMT Programs (NEW)
Route::resource('pmt/programs', PmtProgramController::class)->names([
    'index' => 'pmt.programs.index',
    'create' => 'pmt.programs.create',
    'store' => 'pmt.programs.store',
    'show' => 'pmt.programs.show',
    'edit' => 'pmt.programs.edit',
    'update' => 'pmt.programs.update',
    'destroy' => 'pmt.programs.destroy',
]);
Route::post('/pmt/programs/{program}/discontinue', [PmtProgramController::class, 'discontinue'])
    ->name('pmt.programs.discontinue');

// Existing PMT routes remain unchanged
Route::resource('pmt', PmtController::class);
Route::post('/pmt/{id}/log', [PmtController::class, 'logDistribution'])->name('pmt.log');
```

## Error Responses

### Validation Error (422)
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "child_id": ["Anak wajib dipilih."],
        "start_date": ["Tanggal mulai harus hari ini atau setelahnya."]
    }
}
```

### Not Found (404)
Inertia handles this with the default 404 page.

### Business Logic Error (400)
```json
{
    "message": "Program ini tidak dalam status aktif."
}
```
