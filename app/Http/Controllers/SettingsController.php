<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index(Request $request): Response
    {
        // For now, use a mock user or the first user (in production, use Auth::user())
        $user = User::first() ?? new User([
            'id' => 1,
            'email' => 'user@example.com',
            'full_name' => 'Demo User',
        ]);

        return Inertia::render('settings/index', [
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'full_name' => $user->name ?? $user->full_name ?? 'User',
                'phone' => $user->phone,
                'avatar_url' => $user->avatar_url,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
            ],
            'settings' => [
                'push_notifications' => $user->push_notifications ?? true,
                'weekly_report' => $user->weekly_report ?? true,
                'theme' => $request->cookie('theme', 'system'),
                'language' => $request->cookie('language', 'id'),
            ],
        ]);
    }

    /**
     * Update user settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'push_notifications' => 'boolean',
            'weekly_report' => 'boolean',
            'theme' => 'in:light,dark,system',
            'language' => 'string|max:5',
        ]);

        // For now, use the first user (in production, use Auth::user())
        $user = User::first();

        if ($user) {
            $user->update([
                'push_notifications' => $validated['push_notifications'] ?? true,
                'weekly_report' => $validated['weekly_report'] ?? true,
            ]);
        }

        // Store theme and language in cookies
        return redirect()
            ->route('settings.index')
            ->with('success', 'Settings updated successfully')
            ->cookie('theme', $validated['theme'] ?? 'system', 60 * 24 * 365)
            ->cookie('language', $validated['language'] ?? 'id', 60 * 24 * 365);
    }
}
