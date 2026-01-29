<?php

namespace App\Providers;

use Illuminate\Auth\Events\Authenticated;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Sentry\State\Scope;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureSentryUserContext();
    }

    /**
     * Configure Sentry user context on authentication.
     */
    private function configureSentryUserContext(): void
    {
        Event::listen(function (Authenticated $event): void {
            \Sentry\configureScope(function (Scope $scope) use ($event): void {
                $user = $event->user;

                $scope->setUser([
                    'id' => $user->id,
                    'username' => $user->name,
                    'user_type' => $user->user_type?->value,
                ]);
            });
        });
    }
}
