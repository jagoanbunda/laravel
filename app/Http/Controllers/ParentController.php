<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParentController extends Controller
{
    /**
     * Display a listing of parents (users).
     */
    public function index(Request $request)
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
}
