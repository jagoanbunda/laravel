<?php

namespace App\Providers;

use App\Sentry\SentryBeforeSend;
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
        $this->configureSentryBeforeSend();
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

    /**
     * Configure Sentry before_send callback to sanitize events.
     *
     * This is done here instead of config/sentry.php to allow config:cache to work.
     */
    private function configureSentryBeforeSend(): void
    {
        $client = \Sentry\SentrySdk::getCurrentHub()->getClient();

        if ($client !== null) {
            $options = $client->getOptions();
            $options->setBeforeSendCallback(new SentryBeforeSend());
        }
    }
}
