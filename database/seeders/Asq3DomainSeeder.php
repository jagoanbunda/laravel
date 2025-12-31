<?php

namespace Database\Seeders;

use App\Models\Asq3Domain;
use Illuminate\Database\Seeder;

class Asq3DomainSeeder extends Seeder
{
   /**
    * Run the database seeds.
    */
   public function run(): void
   {
      $domains = [
         [
            'code' => 'communication',
            'name' => 'Komunikasi',
            'icon' => 'chat',
            'color' => '#4CAF50',
            'display_order' => 1,
         ],
         [
            'code' => 'gross_motor',
            'name' => 'Motorik Kasar',
            'icon' => 'directions_run',
            'color' => '#2196F3',
            'display_order' => 2,
         ],
         [
            'code' => 'fine_motor',
            'name' => 'Motorik Halus',
            'icon' => 'pan_tool',
            'color' => '#FF9800',
            'display_order' => 3,
         ],
         [
            'code' => 'problem_solving',
            'name' => 'Pemecahan Masalah',
            'icon' => 'psychology',
            'color' => '#9C27B0',
            'display_order' => 4,
         ],
         [
            'code' => 'personal_social',
            'name' => 'Personal Sosial',
            'icon' => 'people',
            'color' => '#E91E63',
            'display_order' => 5,
         ],
      ];

      foreach ($domains as $domain) {
         Asq3Domain::updateOrCreate(
            ['code' => $domain['code']],
            $domain
         );
      }
   }
}
