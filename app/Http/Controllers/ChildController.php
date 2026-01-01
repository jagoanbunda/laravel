<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChildRequest;
use App\Http\Requests\UpdateChildRequest;
use App\Models\Child;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChildController extends Controller
{
    /**
     * Display a listing of children.
     */
    public function index(Request $request): Response
    {
        $query = Child::with('user');

        // Search by child name or parent name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('full_name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by gender
        if ($request->filled('gender') && $request->gender !== 'all') {
            $query->where('gender', $request->gender);
        }

        // Filter by active status
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Order by created_at descending
        $query->orderBy('created_at', 'desc');

        $children = $query->paginate(15)->through(function ($child) {
            return [
                'id' => $child->id,
                'name' => $child->name,
                'date_of_birth' => $child->date_of_birth,
                'gender' => $child->gender,
                'parent_name' => $child->user->full_name,
                'parent_email' => $child->user->email,
                'is_active' => $child->is_active,
                'created_at' => $child->created_at,
            ];
        });

        return Inertia::render('children/index', [
            'children' => $children,
            'filters' => [
                'search' => $request->search,
                'gender' => $request->gender ?? 'all',
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new child.
     */
    public function create(Request $request): Response
    {
        $parents = User::orderBy('full_name')
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'full_name' => $user->full_name,
            ]);

        return Inertia::render('children/create', [
            'parents' => $parents,
            'selected_parent_id' => $request->parent_id,
        ]);
    }

    /**
     * Store a newly created child in storage.
     */
    public function store(StoreChildRequest $request): RedirectResponse
    {
        Child::create($request->validated());

        return redirect()->route('children.index')->with('success', 'Child created successfully');
    }

    /**
     * Display the specified child with all related data.
     */
    public function show(string $id): Response
    {
        $child = Child::with([
            'user',
            'anthropometryMeasurements' => function ($query) {
                $query->orderBy('measurement_date', 'desc')->limit(10);
            },
            'foodLogs' => function ($query) {
                $query->with('items.food')->orderBy('log_date', 'desc')->limit(10);
            },
            'pmtSchedules' => function ($query) {
                $query->with(['menu', 'log'])->orderBy('scheduled_date', 'desc')->limit(10);
            },
            'asq3Screenings' => function ($query) {
                $query->with(['ageInterval', 'domainResults.domain'])
                    ->orderBy('screening_date', 'desc')
                    ->limit(10);
            },
        ])->findOrFail($id);

        return Inertia::render('children/show', [
            'child' => [
                'id' => $child->id,
                'name' => $child->name,
                'date_of_birth' => $child->date_of_birth,
                'gender' => $child->gender,
                'avatar_url' => $child->avatar_url,
                'birth_weight' => $child->birth_weight,
                'birth_height' => $child->birth_height,
                'birth_head_circumference' => $child->birth_head_circumference,
                'blood_type' => $child->blood_type ?? null,
                'allergy_notes' => $child->allergy_notes ?? null,
                'is_active' => $child->is_active,
                'parent' => [
                    'id' => $child->user->id,
                    'name' => $child->user->full_name,
                    'email' => $child->user->email,
                    'phone' => $child->user->phone,
                ],
                'growth_data' => $child->anthropometryMeasurements->map(fn ($m) => [
                    'id' => $m->id,
                    'measurement_date' => $m->measurement_date,
                    'weight' => $m->weight,
                    'height' => $m->height,
                    'head_circumference' => $m->head_circumference,
                ]),
                'food_logs' => $child->foodLogs->map(fn ($log) => [
                    'id' => $log->id,
                    'log_date' => $log->log_date,
                    'total_calories' => $log->total_calories,
                    'items_count' => $log->items->count(),
                ]),
                'pmt_schedules' => $child->pmtSchedules->map(fn ($schedule) => [
                    'id' => $schedule->id,
                    'menu_name' => $schedule->menu->name,
                    'scheduled_date' => $schedule->scheduled_date,
                    'portion' => $schedule->log?->portion,
                    'logged_at' => $schedule->log?->logged_at,
                ]),
                'screenings' => $child->asq3Screenings->map(fn ($screening) => [
                    'id' => $screening->id,
                    'screening_date' => $screening->screening_date,
                    'age_interval' => $screening->ageInterval->age_label,
                    'status' => $screening->status,
                    'overall_status' => $screening->overall_status,
                ]),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified child.
     */
    public function edit(string $id): Response
    {
        $child = Child::with('user')->findOrFail($id);

        $parents = User::orderBy('full_name')
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'full_name' => $user->full_name,
            ]);

        return Inertia::render('children/edit', [
            'child' => [
                'id' => $child->id,
                'name' => $child->name,
                'date_of_birth' => $child->date_of_birth->format('Y-m-d'),
                'gender' => $child->gender,
                'user_id' => $child->user_id,
                'birth_weight' => $child->birth_weight,
                'birth_height' => $child->birth_height,
                'birth_head_circumference' => $child->birth_head_circumference,
                'blood_type' => $child->blood_type ?? null,
                'allergy_notes' => $child->allergy_notes ?? null,
                'is_active' => $child->is_active,
            ],
            'parents' => $parents,
        ]);
    }

    /**
     * Update the specified child in storage.
     */
    public function update(UpdateChildRequest $request, string $id): RedirectResponse
    {
        $child = Child::findOrFail($id);
        $child->update($request->validated());

        return redirect()->route('children.index')->with('success', 'Child updated successfully');
    }

    /**
     * Remove the specified child from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $child = Child::findOrFail($id);
        $child->delete();

        return redirect()->route('children.index')->with('success', 'Child deleted successfully');
    }
}
