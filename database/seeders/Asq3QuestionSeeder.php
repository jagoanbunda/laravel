<?php

namespace Database\Seeders;

use App\Models\Asq3Question;
use App\Models\Asq3AgeInterval;
use App\Models\Asq3Domain;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class Asq3QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $csvFile = base_path('asq3.csv');
        
        if (!File::exists($csvFile)) {
            $this->command->error('ASQ-3 CSV file not found at: ' . $csvFile);
            return;
        }

        $csv = array_map('str_getcsv', file($csvFile));
        $header = array_shift($csv); // Remove header row

        $domainMapping = [
            'Komunikasi' => 'communication',
            'Motorik Kasar' => 'gross_motor',
            'Motorik Halus' => 'fine_motor',
            'Pemecahan Masalah' => 'problem_solving',
            'Personal-Sosial' => 'personal_social',
        ];

        $ageMapping = [
            '2 Bulan' => 2,
            '12 Bulan' => 12,
            '24 Bulan' => 24,
            '36 Bulan' => 36,
            '48 Bulan' => 48,
            '60 Bulan' => 60,
        ];

        foreach ($csv as $row) {
            if (count($row) < 5) continue; // Skip incomplete rows

            [$ageLabel, $domainLabel, $questionNumber, $questionText, $answerOptions] = $row;

            // Find age interval
            $ageMonths = $ageMapping[$ageLabel] ?? null;
            if (!$ageMonths) continue;

            $ageInterval = Asq3AgeInterval::where('min_age_months', '<=', $ageMonths)
                ->where('max_age_months', '>=', $ageMonths)
                ->first();

            if (!$ageInterval) {
                $this->command->warn("Age interval not found for: {$ageLabel}");
                continue;
            }

            // Find domain
            $domainCode = $domainMapping[$domainLabel] ?? null;
            if (!$domainCode) continue;

            $domain = Asq3Domain::where('code', $domainCode)->first();

            if (!$domain) {
                $this->command->warn("Domain not found for: {$domainLabel}");
                continue;
            }

            // Clean question text (remove citation references)
            $questionText = preg_replace('/\s*\[cite:.*?\]\s*/', '', $questionText);

            // Create question
            Asq3Question::create([
                'age_interval_id' => $ageInterval->id,
                'domain_id' => $domain->id,
                'question_number' => (int) $questionNumber,
                'question_text' => trim($questionText),
                'hint_text' => null, // Can be added later
            ]);
        }

        $this->command->info('ASQ-3 questions seeded successfully!');
    }
}
