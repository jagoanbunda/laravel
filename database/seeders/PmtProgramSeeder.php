<?php

namespace Database\Seeders;

use App\Models\Child;
use App\Models\PmtProgram;
use App\Models\PmtSchedule;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PmtProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates PMT programs for children following the app workflow:
     * 1. Create program for a child
     * 2. Generate schedules for each day of the program
     */
    public function run(): void
    {
        $children = Child::all();

        if ($children->isEmpty()) {
            $this->command->warn('No children found. Please seed children first.');

            return;
        }

        // Get a nakes user to be the creator (or first admin/user)
        $creator = User::whereHas('nakesProfile')->first()
            ?? User::first();

        if (! $creator) {
            $this->command->warn('No users found. Please seed users first.');

            return;
        }

        // Select ~60% of children to have PMT programs
        $selectedChildren = $children->random(max(1, (int) ($children->count() * 0.6)));

        $statuses = ['active', 'completed', 'discontinued'];
        $statusWeights = [
            'active' => 50,        // 50% active
            'completed' => 35,    // 35% completed
            'discontinued' => 15, // 15% discontinued
        ];

        foreach ($selectedChildren as $child) {
            $status = $this->weightedRandom($statusWeights);
            $durationDays = fake()->randomElement([90, 120]);

            // Calculate dates based on status
            $dates = $this->calculateDates($status, $durationDays);

            // Create the program
            $program = PmtProgram::create([
                'child_id' => $child->id,
                'start_date' => $dates['start'],
                'end_date' => $dates['end'],
                'duration_days' => $durationDays,
                'status' => $status,
                'created_by' => $creator->id,
                'notes' => fake()->optional(0.3)->sentence(),
            ]);

            // Generate schedules for each day of the program
            $this->createSchedulesForProgram($program);
        }

        $this->command->info('PMT programs seeded successfully! Created '.$selectedChildren->count().' programs.');
    }

    /**
     * Calculate start and end dates based on program status.
     *
     * @return array{start: string, end: string}
     */
    private function calculateDates(string $status, int $durationDays): array
    {
        $now = Carbon::now();

        return match ($status) {
            'active' => [
                // Started 30-60 days ago, still running
                'start' => ($start = $now->copy()->subDays(rand(30, 60)))->format('Y-m-d'),
                'end' => $start->copy()->addDays($durationDays - 1)->format('Y-m-d'),
            ],
            'completed' => [
                // Ended 5-30 days ago
                'start' => ($start = $now->copy()->subDays($durationDays + rand(5, 30)))->format('Y-m-d'),
                'end' => $start->copy()->addDays($durationDays - 1)->format('Y-m-d'),
            ],
            'discontinued' => [
                // Started 60-90 days ago, discontinued midway
                'start' => ($start = $now->copy()->subDays(rand(60, 90)))->format('Y-m-d'),
                'end' => $start->copy()->addDays($durationDays - 1)->format('Y-m-d'),
            ],
            default => [
                'start' => $now->format('Y-m-d'),
                'end' => $now->copy()->addDays($durationDays - 1)->format('Y-m-d'),
            ],
        };
    }

    /**
     * Create schedules for each day of the program.
     */
    private function createSchedulesForProgram(PmtProgram $program): void
    {
        $startDate = Carbon::parse($program->start_date);
        $schedules = [];

        for ($i = 0; $i < $program->duration_days; $i++) {
            $schedules[] = [
                'program_id' => $program->id,
                'child_id' => $program->child_id,
                'scheduled_date' => $startDate->copy()->addDays($i)->format('Y-m-d'),
            ];
        }

        // Bulk insert for performance
        PmtSchedule::insert($schedules);
    }

    /**
     * Select a random value based on weights.
     */
    private function weightedRandom(array $weights): string
    {
        $total = array_sum($weights);
        $random = rand(1, $total);

        $cumulative = 0;
        foreach ($weights as $key => $weight) {
            $cumulative += $weight;
            if ($random <= $cumulative) {
                return $key;
            }
        }

        return array_key_first($weights);
    }
}
