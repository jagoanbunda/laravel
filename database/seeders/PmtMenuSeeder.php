<?php

namespace Database\Seeders;

use App\Models\PmtMenu;
use Illuminate\Database\Seeder;

class PmtMenuSeeder extends Seeder
{
   /**
    * Run the database seeds.
    */
   public function run(): void
   {
      $menus = [
         [
            'name' => 'Bubur Kacang Hijau',
            'description' => 'Bubur kacang hijau dengan santan, kaya protein dan karbohidrat.',
            'calories' => 150,
            'protein' => 8,
            'min_age_months' => 6,
            'max_age_months' => 60,
         ],
         [
            'name' => 'Biskuit PMT Balita',
            'description' => 'Biskuit fortifikasi dengan vitamin dan mineral untuk balita.',
            'calories' => 200,
            'protein' => 5,
            'min_age_months' => 12,
            'max_age_months' => 60,
         ],
         [
            'name' => 'Susu Pertumbuhan',
            'description' => 'Susu formula pertumbuhan dengan DHA dan AA.',
            'calories' => 150,
            'protein' => 7,
            'min_age_months' => 12,
            'max_age_months' => 36,
         ],
         [
            'name' => 'Bubur Tim Ayam Sayur',
            'description' => 'Bubur tim dengan ayam, wortel, dan bayam.',
            'calories' => 180,
            'protein' => 12,
            'min_age_months' => 6,
            'max_age_months' => 24,
         ],
         [
            'name' => 'Nugget Ikan Tenggiri',
            'description' => 'Nugget dari ikan tenggiri, tinggi protein dan omega-3.',
            'calories' => 160,
            'protein' => 15,
            'min_age_months' => 12,
            'max_age_months' => 60,
         ],
         [
            'name' => 'Puding Susu Buah',
            'description' => 'Puding susu dengan potongan buah segar.',
            'calories' => 120,
            'protein' => 4,
            'min_age_months' => 9,
            'max_age_months' => 60,
         ],
         [
            'name' => 'Sereal Fortifikasi',
            'description' => 'Sereal sarapan dengan fortifikasi zat besi dan vitamin B.',
            'calories' => 180,
            'protein' => 6,
            'min_age_months' => 12,
            'max_age_months' => 60,
         ],
         [
            'name' => 'Roti Gandum Telur',
            'description' => 'Roti gandum dengan telur dan keju.',
            'calories' => 220,
            'protein' => 10,
            'min_age_months' => 12,
            'max_age_months' => 60,
         ],
         [
            'name' => 'Smoothie Pisang',
            'description' => 'Smoothie dari pisang, susu, dan madu.',
            'calories' => 200,
            'protein' => 8,
            'min_age_months' => 12,
            'max_age_months' => 60,
         ],
         [
            'name' => 'Bubur Sum-Sum',
            'description' => 'Bubur tepung beras dengan santan dan gula merah.',
            'calories' => 160,
            'protein' => 3,
            'min_age_months' => 6,
            'max_age_months' => 60,
         ],
      ];

      foreach ($menus as $menu) {
         PmtMenu::updateOrCreate(
            ['name' => $menu['name']],
            array_merge($menu, [
               'is_active' => true,
            ])
         );
      }
   }
}
