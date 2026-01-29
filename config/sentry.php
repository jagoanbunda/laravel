<?php

return [
    'dsn' => env('SENTRY_LARAVEL_DSN'),

    'environment' => env('SENTRY_ENVIRONMENT', env('APP_ENV', 'production')),

    'release' => env('APP_VERSION'),

    // Privacy: DO NOT send PII automatically
    'send_default_pii' => false,

    // Error sampling (100% of errors)
    'sample_rate' => env('SENTRY_SAMPLE_RATE', 1.0),

    // Performance tracing DISABLED (Phase 2)
    'traces_sample_rate' => null,
    'profiles_sample_rate' => null,

    // Breadcrumbs configuration
    'breadcrumbs' => [
        'logs' => true,
        'cache' => true,
        'sql_queries' => true,
        'sql_bindings' => false, // Privacy: No SQL bindings (may contain health data)
        'queue_info' => true,
        'http_client_requests' => true,
    ],

    // Ignored exceptions (reduce noise)
    'ignore_exceptions' => [
        \Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
        \Illuminate\Validation\ValidationException::class,
        \Illuminate\Auth\AuthenticationException::class,
        \Illuminate\Session\TokenMismatchException::class,
    ],

    // Before send callback to sanitize events
    'before_send' => function (\Sentry\Event $event): ?\Sentry\Event {
        $request = $event->getRequest();
        if ($request !== null) {
            // Block all request bodies (may contain child health data)
            $request['data'] = '[FILTERED]';

            // Remove sensitive headers
            $sensitiveHeaders = ['authorization', 'cookie', 'x-api-token', 'x-xsrf-token'];
            if (isset($request['headers'])) {
                foreach ($sensitiveHeaders as $header) {
                    unset($request['headers'][$header]);
                }
            }

            $event->setRequest($request);
        }

        return $event;
    },
];
