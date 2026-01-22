<?php

namespace App\Enums;

enum UserType: string
{
    case Nakes = 'nakes';
    case Parent = 'parent';

    public function label(): string
    {
        return match ($this) {
            self::Nakes => 'Tenaga Kesehatan',
            self::Parent => 'Orang Tua',
        };
    }

    /**
     * Get the authentication method for this user type.
     */
    public function authMethod(): string
    {
        return match ($this) {
            self::Nakes => 'web',    // Session-based
            self::Parent => 'api',   // Token-based
        };
    }

    /**
     * Check if this user type can use web authentication.
     */
    public function canUseWeb(): bool
    {
        return $this === self::Nakes;
    }

    /**
     * Check if this user type can use API authentication.
     */
    public function canUseApi(): bool
    {
        return $this === self::Parent;
    }
}
