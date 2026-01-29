<?php

namespace App\Sentry;

use Sentry\Event;

/**
 * Sanitize Sentry events before sending to remove sensitive health data.
 */
final class SentryBeforeSend
{
    public function __invoke(Event $event): ?Event
    {
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
    }
}
