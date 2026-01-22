<?php

namespace App\Http\Controllers\Web;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\LoginRequest;
use App\Http\Requests\Web\RegisterRequest;
use App\Models\NakesProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Show the login form.
     */
    public function showLogin(): Response
    {
        return Inertia::render('auth/login');
    }

    /**
     * Handle login request.
     */
    public function login(LoginRequest $request): RedirectResponse
    {
        $user = User::where('email', $request->email)->first();

        // Check if parent user trying to use web
        if ($user && $user->user_type === UserType::Parent) {
            Log::warning('Web Login rejected: Parent user attempted web login', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return back()
                ->with('error', 'Akun orang tua hanya dapat login melalui aplikasi mobile.')
                ->withInput(['email' => $request->email]);
        }

        if (! Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'Email atau password salah.',
            ])->withInput(['email' => $request->email]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Show the registration form.
     */
    public function showRegister(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle registration request.
     */
    public function register(RegisterRequest $request): RedirectResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'user_type' => UserType::Nakes->value,
        ]);

        NakesProfile::create([
            'user_id' => $user->id,
            'nik' => $request->nik,
            'position' => $request->position,
        ]);

        Auth::login($user);

        return redirect()->route('dashboard');
    }

    /**
     * Handle logout request.
     */
    public function logout(): RedirectResponse
    {
        Auth::logout();

        request()->session()->invalidate();
        request()->session()->regenerateToken();

        return redirect()->route('login');
    }
}
