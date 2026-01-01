<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreParentRequest;
use App\Http\Requests\UpdateParentRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ParentController extends Controller
{
    /**
     * Display a listing of parents (users).
     */
    public function index(Request $request): Response
    {
        $query = User::withCount('children');

        // Search by name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Order by created_at descending
        $query->orderBy('created_at', 'desc');

        $parents = $query->paginate(15)->through(function ($user) {
            return [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar_url' => $user->avatar_url,
                'children_count' => $user->children_count,
                'push_notifications' => $user->push_notifications,
                'weekly_report' => $user->weekly_report,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
            ];
        });

        return Inertia::render('parents/index', [
            'parents' => $parents,
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Display the specified parent.
     */
    public function show(string $id): Response
    {
        $parent = User::withCount('children')->with('children')->findOrFail($id);

        return Inertia::render('parents/show', [
            'parent' => [
                'id' => $parent->id,
                'full_name' => $parent->full_name,
                'email' => $parent->email,
                'phone' => $parent->phone,
                'address' => $parent->address,
                'avatar_url' => $parent->avatar_url,
                'children_count' => $parent->children_count,
                'push_notifications' => $parent->push_notifications,
                'weekly_report' => $parent->weekly_report,
                'email_verified_at' => $parent->email_verified_at,
                'created_at' => $parent->created_at,
                'children' => $parent->children->map(fn ($child) => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'date_of_birth' => $child->date_of_birth,
                    'gender' => $child->gender,
                    'is_active' => $child->is_active,
                ]),
            ],
        ]);
    }

    /**
     * Show the form for creating a new parent.
     */
    public function create(): Response
    {
        return Inertia::render('parents/create');
    }

    /**
     * Store a newly created parent in storage.
     */
    public function store(StoreParentRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']);

        User::create($data);

        return redirect()->route('parents.index')->with('success', 'Parent created successfully');
    }

    /**
     * Show the form for editing the specified parent.
     */
    public function edit(string $id): Response
    {
        $parent = User::findOrFail($id);

        return Inertia::render('parents/edit', [
            'parent' => [
                'id' => $parent->id,
                'full_name' => $parent->full_name,
                'email' => $parent->email,
                'phone' => $parent->phone,
                'address' => $parent->address,
            ],
        ]);
    }

    /**
     * Update the specified parent in storage.
     */
    public function update(UpdateParentRequest $request, string $id): RedirectResponse
    {
        $parent = User::findOrFail($id);
        $parent->update($request->validated());

        return redirect()->route('parents.index')->with('success', 'Parent updated successfully');
    }

    /**
     * Remove the specified parent from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $parent = User::findOrFail($id);
        $parent->delete();

        return redirect()->route('parents.index')->with('success', 'Parent deleted successfully');
    }
}
