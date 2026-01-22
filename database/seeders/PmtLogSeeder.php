<?php

namespace Database\Seeders;

use App\Models\Food;
use App\Models\PmtLog;
use App\Models\PmtSchedule;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PmtLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates logs for past PMT schedules with real food data.
     * 70% of past schedules will have logs (simulating realistic parent reporting).
     */
    public function run(): void
    {
        $pastSchedules = PmtSchedule::with('child')
            ->where('scheduled_date', '<=', Carbon::now())
            ->get();

        if ($pastSchedules->isEmpty()) {
            $this->command->warn('No past PMT schedules found. Please seed PMT schedules first.');

            return;
        }

        $foods = Food::system()->active()->get();

        if ($foods->isEmpty()) {
            $this->command->warn('No foods found. Please seed foods first.');

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
            null,
        ];

        $photoOptions = [
            '/storage/pmt-logs/pmt-log-1.png',
            '/storage/pmt-logs/pmt-log-2.jpg',
            '/storage/pmt-logs/pmt-log-3.jpg',
            '/storage/pmt-logs/pmt-log-4.jpg',
            '/storage/pmt-logs/pmt-log-5.jpg',
        ];

        $logsCreated = 0;

        foreach ($pastSchedules as $schedule) {
            // 70% chance of having a log (simulates realistic parent reporting)
            if (rand(1, 100) <= 70) {
                $loggedAt = Carbon::parse($schedule->scheduled_date)
                    ->addHours(rand(8, 16))
                    ->addMinutes(rand(0, 59));

                // Select age-appropriate food for the child
                $selectedFood = $this->selectFoodForChild($foods, $schedule->child);

                // 60% chance of having a photo
                $photoUrl = rand(1, 100) <= 60
                    ? $photoOptions[array_rand($photoOptions)]
                    : null;

                PmtLog::create([
                    'schedule_id' => $schedule->id,
                    'food_id' => $selectedFood->id,
                    'portion' => $portions[array_rand($portions)],
                    'logged_at' => $loggedAt,
                    'notes' => $notesOptions[array_rand($notesOptions)],
                    'photo_url' => $photoUrl,
                ]);

                $logsCreated++;
            }
        }

        $this->command->info("PMT logs seeded successfully! Created {$logsCreated} logs with real food data.");
    }

    /**
     * Select an age-appropriate food for the child.
     */
    private function selectFoodForChild($foods, $child): Food
    {
        $childAgeMonths = $child?->age_in_months;

        if ($childAgeMonths) {
            $appropriateFoods = $foods->filter(function ($food) use ($childAgeMonths) {
                $minAge = $food->min_age_months ?? 0;
                $maxAge = $food->max_age_months ?? 999;

                return $childAgeMonths >= $minAge && $childAgeMonths <= $maxAge;
            });

            if ($appropriateFoods->isNotEmpty()) {
                return $appropriateFoods->random();
            }
        }

        return $foods->random();
    }
}
