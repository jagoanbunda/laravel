<?php

namespace Database\Seeders;

use App\Models\PmtLog;
use App\Models\PmtSchedule;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PmtLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get schedules from the past (70% will have logs)
        $pastSchedules = PmtSchedule::where('scheduled_date', '<=', Carbon::now())
            ->get();

        if ($pastSchedules->isEmpty()) {
            $this->command->warn('No past PMT schedules found. Please seed PMT schedules first.');
            return;
        }

        $portions = ['habis', 'half', 'quarter', 'none'];
        $notesOptions = [
            'Anak makan dengan lahap',
            'Anak tidak terlalu suka',
            'Anak makan sedikit-sedikit',
            'Anak menolak makan',
            'Anak sangat suka',
            null,
            null, // More nulls for variety
        ];

        foreach ($pastSchedules as $schedule) {
            // 70% chance of having a log
            if (rand(1, 100) <= 70) {
                $loggedAt = Carbon::parse($schedule->scheduled_date)
                    ->addHours(rand(8, 16))
                    ->addMinutes(rand(0, 59));

                PmtLog::create([
                    'schedule_id' => $schedule->id,
                    'portion' => $portions[array_rand($portions)],
                    'logged_at' => $loggedAt,
                    'notes' => $notesOptions[array_rand($notesOptions)],
                    'photo_url' => null, // Can be added later
                ]);
            }
        }

        $this->command->info('PMT logs seeded successfully!');
    }
}
