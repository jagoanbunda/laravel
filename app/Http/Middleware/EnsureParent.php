<?php

namespace App\Http\Middleware;

use App\Enums\UserType;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class EnsureParent
{
    /**
     * Handle an incoming request.
     *
     * Ensures the authenticated user is a parent (mobile app user).
     * If not, returns 403 JSON response.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->user_type !== UserType::Parent) {
            Log::warning('EnsureParent: Blocked non-parent user API access', [
                'user_id' => $user?->id,
                'user_type' => $user?->user_type?->value,
                'path' => $request->path(),
            ]);

            return response()->json([
                'message' => 'Akses ditolak. API hanya untuk orang tua.',
                'error_code' => 'PARENT_API_ONLY',
            ], 403);
        }

        return $next($request);
    }
}
