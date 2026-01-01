<?php

namespace Database\Seeders;

use App\Models\PmtSchedule;
use App\Models\PmtMenu;
use App\Models\Child;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PmtScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $children = Child::all();
        $menus = PmtMenu::all();

        if ($children->isEmpty() || $menus->isEmpty()) {
            $this->command->warn('No children or PMT menus found. Please seed children and PMT menus first.');
            return;
        }

        $statuses = ['scheduled', 'completed', 'cancelled'];
        
        foreach ($children as $child) {
            // Create 10 PMT schedules per child with UNIQUE dates
            $usedDates = [];
            $attempts = 0;
            $maxAttempts = 100;
            
            for ($i = 0; $i < 10; $i++) {
                $scheduledDate = null;
                
                // Keep trying until we get a unique date
                do {
                    $daysOffset = rand(-30, 30);
                    $scheduledDate = Carbon::now()->addDays($daysOffset)->format('Y-m-d');
                    $attempts++;
                    
                    if ($attempts > $maxAttempts) {
                        $this->command->warn("Could not generate unique dates for child {$child->id}");
                        break 2; // Exit both loops
                    }
                } while (in_array($scheduledDate, $usedDates));
                
                $usedDates[] = $scheduledDate;

                PmtSchedule::create([
                    'child_id' => $child->id,
                    'menu_id' => $menus->random()->id,
                    'scheduled_date' => $scheduledDate,
                ]);
            }
        }

        $this->command->info('PMT schedules seeded successfully!');
    }
}
