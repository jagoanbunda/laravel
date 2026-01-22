<?php

namespace App\Http\Middleware;

use App\Enums\UserType;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class EnsureNakes
{
    /**
     * Handle an incoming request.
     *
     * Ensures the authenticated user is a nakes (healthcare worker).
     * If not, logs them out and redirects to login with error.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->user_type !== UserType::Nakes) {
            Log::warning('EnsureNakes: Blocked non-nakes user access', [
                'user_id' => $user?->id,
                'user_type' => $user?->user_type?->value,
                'path' => $request->path(),
            ]);

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')
                ->withErrors(['email' => 'Akses ditolak. Halaman ini hanya untuk tenaga kesehatan.']);
        }

        return $next($request);
    }
}
