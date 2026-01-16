<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the profile edit page.
     */
    public function index(Request $request): Response
    {
        // For now, use a mock user or the first user (in production, use Auth::user())
        $user = User::first() ?? new User([
            'id' => 1,
            'email' => 'user@example.com',
            'full_name' => 'Demo User',
        ]);

        return Inertia::render('profile/index', [
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'full_name' => $user->name ?? $user->full_name ?? 'User',
                'phone' => $user->phone,
                'avatar_url' => $user->avatar_url,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
        ]);
    }

    /**
     * Update the user's profile.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|max:2048',
        ]);

        // For now, use the first user (in production, use Auth::user())
        $user = User::first();

        if (! $user) {
            return redirect()->route('profile.index')->with('error', 'User not found');
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar_url) {
                Storage::disk('public')->delete($user->avatar_url);
            }

            // Store new avatar
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar_url'] = $path;
        }

        // Update user (map full_name to name if that's the column)
        $user->update([
            'name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'avatar_url' => $validated['avatar_url'] ?? $user->avatar_url,
        ]);

        return redirect()->route('profile.index')->with('success', 'Profile updated successfully');
    }
}
