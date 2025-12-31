<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
   /**
    * Define the model's default state.
    *
    * @return array<string, mixed>
    */
   public function definition(): array
   {
      $types = [
         'screening_reminder' => [
            'title' => 'Waktunya Screening ASQ-3!',
            'body' => 'Anak Anda sudah waktunya melakukan screening perkembangan.',
         ],
         'pmt_reminder' => [
            'title' => 'Jangan Lupa PMT Hari Ini',
            'body' => 'Berikan makanan tambahan untuk anak Anda hari ini.',
         ],
         'measurement_reminder' => [
            'title' => 'Waktu Pengukuran Bulanan',
            'body' => 'Catat berat dan tinggi anak Anda bulan ini.',
         ],
         'general' => [
            'title' => 'Info Penting',
            'body' => fake()->sentence(10),
         ],
      ];

      $type = fake()->randomElement(array_keys($types));

      return [
         'user_id' => User::factory(),
         'type' => $type,
         'title' => $types[$type]['title'],
         'body' => $types[$type]['body'],
         'data' => null,
         'read_at' => fake()->optional(0.3)->dateTimeBetween('-1 week', 'now'),
      ];
   }

   /**
    * Create an unread notification.
    */
   public function unread(): static
   {
      return $this->state(fn(array $attributes) => [
         'read_at' => null,
      ]);
   }

   /**
    * Create a read notification.
    */
   public function read(): static
   {
      return $this->state(fn(array $attributes) => [
         'read_at' => fake()->dateTimeBetween('-1 week', 'now'),
      ]);
   }

   /**
    * Create a screening reminder.
    */
   public function screeningReminder(): static
   {
      return $this->state(fn(array $attributes) => [
         'type' => 'screening_reminder',
         'title' => 'Waktunya Screening ASQ-3!',
         'body' => 'Anak Anda sudah waktunya melakukan screening perkembangan.',
      ]);
   }

   /**
    * Create a PMT reminder.
    */
   public function pmtReminder(): static
   {
      return $this->state(fn(array $attributes) => [
         'type' => 'pmt_reminder',
         'title' => 'Jangan Lupa PMT Hari Ini',
         'body' => 'Berikan makanan tambahan untuk anak Anda hari ini.',
      ]);
   }
}
