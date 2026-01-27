<?php

namespace Database\Seeders;

use App\Models\Asq3AgeInterval;
use App\Models\Asq3CutoffScore;
use App\Models\Asq3Domain;
use Illuminate\Database\Seeder;

class Asq3CutoffScoreSeeder extends Seeder
{
    /**
     * ASQ-3 Cutoff Scores (2 SD below mean) from ASQ-3 User's Guide (Squires et al., 2009).
     *
     * Format: age_months => [communication, gross_motor, fine_motor, problem_solving, personal_social]
     *
     * These values represent the 2 SD cutoff threshold below which a child should be referred
     * for comprehensive developmental evaluation.
     *
     * @var array<int, array<int, float>>
     */
    private const CUTOFF_SCORES = [
        2 => [22.77, 41.84, 30.16, 20.50, 24.62],
        4 => [34.60, 38.41, 29.62, 34.98, 33.16],
        6 => [29.65, 22.25, 25.14, 27.72, 25.34],
        8 => [33.06, 30.61, 40.15, 36.17, 35.84],
        9 => [13.97, 17.82, 31.32, 32.51, 18.91],
        10 => [22.87, 30.07, 37.97, 32.01, 27.32],
        12 => [15.64, 21.49, 34.50, 36.30, 28.12],
        14 => [17.40, 25.80, 23.06, 21.73, 27.19],
        16 => [16.81, 37.91, 31.98, 22.56, 23.18],
        18 => [13.06, 37.38, 34.32, 30.51, 26.43],
        20 => [20.50, 39.89, 36.05, 33.36, 29.30],
        22 => [13.04, 27.75, 29.61, 28.84, 30.07],
        24 => [25.17, 38.07, 35.16, 31.54, 29.78],
        27 => [24.02, 28.01, 18.42, 25.31, 27.62],
        30 => [33.30, 36.14, 19.25, 26.92, 28.96],
        33 => [25.36, 34.80, 12.28, 25.74, 18.11],
        36 => [30.99, 36.99, 18.07, 35.33, 29.99],
        42 => [27.06, 36.27, 19.82, 28.11, 32.01],
        48 => [30.72, 32.78, 15.81, 17.32, 26.60],
        54 => [31.85, 35.18, 17.32, 31.12, 26.54],
        60 => [33.19, 31.28, 26.54, 28.92, 23.73],
    ];

    /**
     * Domain codes in order matching the cutoff score arrays.
     *
     * @var array<int, string>
     */
    private const DOMAIN_CODES = [
        'communication',
        'gross_motor',
        'fine_motor',
        'problem_solving',
        'personal_social',
    ];

    /**
     * Maximum score per domain (6 questions × 10 points).
     */
    private const MAX_SCORE = 60.00;

    /**
     * Run the database seeds.
     *
     * Creates 105 cutoff score records (21 age intervals × 5 domains).
     * Monitoring score is calculated as the midpoint between cutoff and max score,
     * approximating the 1 SD threshold for the "pantau" (monitoring) zone.
     */
    public function run(): void
    {
        $ageIntervals = Asq3AgeInterval::all()->keyBy('age_months');
        $domains = Asq3Domain::all()->keyBy('code');

        if ($ageIntervals->isEmpty() || $domains->isEmpty()) {
            $this->command->warn('Age intervals or domains not found. Run Asq3AgeIntervalSeeder and Asq3DomainSeeder first.');

            return;
        }

        $recordCount = 0;

        foreach (self::CUTOFF_SCORES as $ageMonths => $domainCutoffs) {
            $ageInterval = $ageIntervals->get($ageMonths);

            if (! $ageInterval) {
                $this->command->warn("Age interval for {$ageMonths} months not found, skipping.");

                continue;
            }

            foreach (self::DOMAIN_CODES as $index => $domainCode) {
                $domain = $domains->get($domainCode);

                if (! $domain) {
                    $this->command->warn("Domain '{$domainCode}' not found, skipping.");

                    continue;
                }

                $cutoffScore = $domainCutoffs[$index];
                $monitoringScore = ($cutoffScore + self::MAX_SCORE) / 2;

                Asq3CutoffScore::updateOrCreate(
                    [
                        'age_interval_id' => $ageInterval->id,
                        'domain_id' => $domain->id,
                    ],
                    [
                        'cutoff_score' => $cutoffScore,
                        'monitoring_score' => round($monitoringScore, 2),
                        'max_score' => self::MAX_SCORE,
                    ]
                );

                $recordCount++;
            }
        }

        $this->command->info("ASQ-3 cutoff scores seeded successfully! ({$recordCount} records)");
    }
}
