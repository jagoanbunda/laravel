<?php

namespace Database\Seeders;

use App\Models\Asq3AgeInterval;
use Illuminate\Database\Seeder;

class Asq3AgeIntervalSeeder extends Seeder
{
   /**
    * Run the database seeds.
    *
    * ASQ-3 Age Intervals (21 intervals from 2 to 60 months)
    */
   public function run(): void
   {
      $intervals = [
         ['age_months' => 2,  'age_label' => '2 Bulan',  'min_age_days' => 46,  'max_age_days' => 76],
         ['age_months' => 4,  'age_label' => '4 Bulan',  'min_age_days' => 107, 'max_age_days' => 137],
         ['age_months' => 6,  'age_label' => '6 Bulan',  'min_age_days' => 168, 'max_age_days' => 198],
         ['age_months' => 8,  'age_label' => '8 Bulan',  'min_age_days' => 229, 'max_age_days' => 259],
         ['age_months' => 9,  'age_label' => '9 Bulan',  'min_age_days' => 260, 'max_age_days' => 289],
         ['age_months' => 10, 'age_label' => '10 Bulan', 'min_age_days' => 290, 'max_age_days' => 319],
         ['age_months' => 12, 'age_label' => '12 Bulan', 'min_age_days' => 350, 'max_age_days' => 380],
         ['age_months' => 14, 'age_label' => '14 Bulan', 'min_age_days' => 411, 'max_age_days' => 441],
         ['age_months' => 16, 'age_label' => '16 Bulan', 'min_age_days' => 472, 'max_age_days' => 502],
         ['age_months' => 18, 'age_label' => '18 Bulan', 'min_age_days' => 533, 'max_age_days' => 563],
         ['age_months' => 20, 'age_label' => '20 Bulan', 'min_age_days' => 594, 'max_age_days' => 624],
         ['age_months' => 22, 'age_label' => '22 Bulan', 'min_age_days' => 655, 'max_age_days' => 685],
         ['age_months' => 24, 'age_label' => '24 Bulan', 'min_age_days' => 716, 'max_age_days' => 746],
         ['age_months' => 27, 'age_label' => '27 Bulan', 'min_age_days' => 807, 'max_age_days' => 837],
         ['age_months' => 30, 'age_label' => '30 Bulan', 'min_age_days' => 898, 'max_age_days' => 928],
         ['age_months' => 33, 'age_label' => '33 Bulan', 'min_age_days' => 989, 'max_age_days' => 1019],
         ['age_months' => 36, 'age_label' => '36 Bulan', 'min_age_days' => 1080, 'max_age_days' => 1110],
         ['age_months' => 42, 'age_label' => '42 Bulan', 'min_age_days' => 1262, 'max_age_days' => 1292],
         ['age_months' => 48, 'age_label' => '48 Bulan', 'min_age_days' => 1444, 'max_age_days' => 1474],
         ['age_months' => 54, 'age_label' => '54 Bulan', 'min_age_days' => 1626, 'max_age_days' => 1656],
         ['age_months' => 60, 'age_label' => '60 Bulan', 'min_age_days' => 1808, 'max_age_days' => 1838],
      ];

      foreach ($intervals as $interval) {
         Asq3AgeInterval::updateOrCreate(
            ['age_months' => $interval['age_months']],
            $interval
         );
      }
   }
}
