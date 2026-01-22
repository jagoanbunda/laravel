<?php

namespace Database\Seeders;

use App\Enums\UserType;
use App\Models\NakesProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class NakesUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->createProductionNakes();
        } else {
            $this->createDevelopmentNakes();
        }
    }

    /**
     * Create production nakes with generated credentials.
     * Outputs the credentials so admin can note them.
     */
    protected function createProductionNakes(): void
    {
        $email = 'admin@jagoanbunda.id';

        if (User::where('email', $email)->exists()) {
            $this->command?->info("Production nakes already exists: {$email}");

            return;
        }

        $password = fake()->password(12, 16);

        $user = User::create([
            'name' => 'Admin Nakes',
            'email' => $email,
            'password' => Hash::make($password),
            'email_verified_at' => now(),
            'phone' => fake('id_ID')->phoneNumber(),
            'user_type' => UserType::Nakes->value,
            'push_notifications' => false,
            'weekly_report' => false,
        ]);

        NakesProfile::create([
            'user_id' => $user->id,
            'nik' => fake()->numerify('################'),
            'puskesmas_id' => null,
            'position' => 'Administrator',
            'verified_at' => now(),
        ]);

        $this->command?->warn('===========================================');
        $this->command?->warn('PRODUCTION NAKES ADMIN CREATED');
        $this->command?->warn('Email: '.$email);
        $this->command?->warn('Password: '.$password);
        $this->command?->warn('SAVE THIS PASSWORD - IT WILL NOT BE SHOWN AGAIN');
        $this->command?->warn('===========================================');
    }

    /**
     * Create development nakes users with known credentials.
     */
    protected function createDevelopmentNakes(): void
    {
        // Fixed dev accounts with known password
        $devUsers = [
            [
                'name' => 'Bidan Siti',
                'email' => 'bidan@example.com',
                'nik' => '1234567890123456',
                'position' => 'Bidan',
            ],
            [
                'name' => 'Perawat Andi',
                'email' => 'perawat@example.com',
                'nik' => '2345678901234567',
                'position' => 'Perawat',
            ],
            [
                'name' => 'Dr. Dewi',
                'email' => 'dokter@example.com',
                'nik' => '3456789012345678',
                'position' => 'Dokter',
            ],
        ];

        foreach ($devUsers as $userData) {
            if (User::where('email', $userData['email'])->exists()) {
                $this->command?->info("Dev nakes exists: {$userData['email']}");

                continue;
            }

            $user = User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'phone' => fake('id_ID')->phoneNumber(),
                'user_type' => UserType::Nakes->value,
                'push_notifications' => false,
                'weekly_report' => false,
            ]);

            NakesProfile::create([
                'user_id' => $user->id,
                'nik' => $userData['nik'],
                'puskesmas_id' => null,
                'position' => $userData['position'],
                'verified_at' => now(),
            ]);

            $this->command?->info("Created dev nakes: {$userData['email']} (password: password)");
        }

        // Additional random nakes using factory
        $count = 5;
        User::factory($count)->asNakes()->create();
        $this->command?->info("Created {$count} random nakes users");
    }
}
