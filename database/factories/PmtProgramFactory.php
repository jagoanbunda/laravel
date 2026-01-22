<?php

namespace Database\Factories;

use App\Models\Child;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PmtProgram>
 */
class PmtProgramFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $durationDays = fake()->randomElement([90, 120]);
        $startDate = fake()->dateTimeBetween('-30 days', '+7 days');
        $startCarbon = Carbon::instance($startDate);
        $endDate = $startCarbon->copy()->addDays($durationDays - 1);

        return [
            'child_id' => Child::factory(),
            'start_date' => $startCarbon->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'duration_days' => $durationDays,
            'status' => 'active',
            'created_by' => User::factory(),
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }

    /**
     * Create an active program.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'start_date' => Carbon::now()->subDays(30)->format('Y-m-d'),
            'end_date' => Carbon::now()->addDays(
                ($attributes['duration_days'] ?? 90) - 30 - 1
            )->format('Y-m-d'),
        ]);
    }

    /**
     * Create a completed program.
     */
    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            $durationDays = $attributes['duration_days'] ?? 90;
            $startDate = Carbon::now()->subDays($durationDays + 10);

            return [
                'status' => 'completed',
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $startDate->copy()->addDays($durationDays - 1)->format('Y-m-d'),
            ];
        });
    }

    /**
     * Create a discontinued program.
     */
    public function discontinued(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'discontinued',
        ]);
    }

    /**
     * Create a 90-day program.
     */
    public function ninetyDays(): static
    {
        return $this->state(function (array $attributes) {
            $startDate = Carbon::parse($attributes['start_date'] ?? Carbon::now());

            return [
                'duration_days' => 90,
                'end_date' => $startDate->copy()->addDays(89)->format('Y-m-d'),
            ];
        });
    }

    /**
     * Create a 120-day program.
     */
    public function oneHundredTwentyDays(): static
    {
        return $this->state(function (array $attributes) {
            $startDate = Carbon::parse($attributes['start_date'] ?? Carbon::now());

            return [
                'duration_days' => 120,
                'end_date' => $startDate->copy()->addDays(119)->format('Y-m-d'),
            ];
        });
    }
}
