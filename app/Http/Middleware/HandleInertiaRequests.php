<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'email' => $request->user()->email,
                    'full_name' => $request->user()->name,
                    'phone' => $request->user()->phone,
                    'avatar_url' => $request->user()->avatar_url,
                    'user_type' => $request->user()->user_type?->value,
                    'nakes_profile' => $request->user()->isNakes() && $request->user()->nakesProfile ? [
                        'nik' => $request->user()->nakesProfile->nik,
                        'position' => $request->user()->nakesProfile->position,
                        'verified_at' => $request->user()->nakesProfile->verified_at?->toISOString(),
                    ] : null,
                    'created_at' => $request->user()->created_at->toISOString(),
                    'updated_at' => $request->user()->updated_at->toISOString(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
