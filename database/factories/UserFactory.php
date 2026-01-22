<?php

namespace Database\Factories;

use App\Enums\UserType;
use App\Models\NakesProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake('id_ID')->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'phone' => fake('id_ID')->phoneNumber(),
            'avatar_url' => null,
            'push_notifications' => fake()->boolean(80),
            'weekly_report' => fake()->boolean(30),
            'remember_token' => Str::random(10),
            'user_type' => UserType::Parent->value,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create a user with notifications enabled.
     */
    public function withNotifications(): static
    {
        return $this->state(fn (array $attributes) => [
            'push_notifications' => true,
            'weekly_report' => true,
        ]);
    }

    /**
     * Create a nakes (healthcare worker) user with profile.
     */
    public function asNakes(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_type' => UserType::Nakes->value,
        ])->has(NakesProfile::factory());
    }

    /**
     * Create a parent user (default, but explicit).
     */
    public function asParent(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_type' => UserType::Parent->value,
        ]);
    }
}
