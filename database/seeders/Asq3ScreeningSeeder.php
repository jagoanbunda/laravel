<?php

namespace Database\Seeders;

use App\Models\Asq3Screening;
use App\Models\Asq3ScreeningResult;
use App\Models\Asq3ScreeningAnswer;
use App\Models\Asq3Question;
use App\Models\Asq3AgeInterval;
use App\Models\Asq3Domain;
use App\Models\Asq3CutoffScore;
use App\Models\Child;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class Asq3ScreeningSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $children = Child::all();
        $ageIntervals = Asq3AgeInterval::all();

        if ($children->isEmpty() || $ageIntervals->isEmpty()) {
            $this->command->warn('No children or age intervals found.');
            return;
        }

        $statuses = ['in_progress', 'completed', 'cancelled'];
        $overallStatuses = ['sesuai', 'pantau', 'perlu_rujukan'];

        foreach ($children as $child) {
            // Calculate child's age in months
            $ageMonths = Carbon::parse($child->date_of_birth)->diffInMonths(Carbon::now());

            // Find appropriate age interval
            $ageInterval = $ageIntervals->first(function ($interval) use ($ageMonths) {
                return $ageMonths >= $interval->min_age_months && $ageMonths <= $interval->max_age_months;
            });

            if (!$ageInterval) {
                // Try to find closest interval
                $ageInterval = $ageIntervals->sortBy(function ($interval) use ($ageMonths) {
                    return abs($interval->min_age_months - $ageMonths);
                })->first();
            }

            if (!$ageInterval) continue;

            // Create 2-3 screenings per child at different ages
            $screeningCount = rand(2, 3);
            
            for ($i = 0; $i < $screeningCount; $i++) {
                $screeningDate = Carbon::now()->subMonths(rand(0, 12));
                $status = $statuses[array_rand($statuses)];
                
                // Adjust age at screening
                $ageAtScreening = max(2, $ageMonths - (($screeningCount - $i - 1) * 6));
                $ageDays = $ageAtScreening * 30;

                $screening = Asq3Screening::create([
                    'child_id' => $child->id,
                    'age_interval_id' => $ageInterval->id,
                    'screening_date' => $screeningDate->format('Y-m-d'),
                    'age_at_screening_months' => $ageAtScreening,
                    'age_at_screening_days' => $ageDays,
                    'status' => $status,
                    'overall_status' => $status === 'completed' ? $overallStatuses[array_rand($overallStatuses)] : null,
                    'completed_at' => $status === 'completed' ? $screeningDate->addDays(1) : null,
                ]);

                // If completed, add answers and results
                if ($status === 'completed') {
                    $this->createScreeningAnswersAndResults($screening, $ageInterval);
                }
            }
        }

        $this->command->info('ASQ-3 screenings seeded successfully!');
    }

    private function createScreeningAnswersAndResults(Asq3Screening $screening, Asq3AgeInterval $ageInterval): void
    {
        $domains = Asq3Domain::all();
        $questions = Asq3Question::where('age_interval_id', $ageInterval->id)->get();

        if ($questions->isEmpty()) {
            return;
        }

        $answerValues = ['yes' => 10, 'sometimes' => 5, 'no' => 0];

        foreach ($domains as $domain) {
            $domainQuestions = $questions->where('domain_id', $domain->id);
            $totalScore = 0;

            // Create answers for each question
            foreach ($domainQuestions as $question) {
                $answer = array_rand($answerValues);
                $points = $answerValues[$answer];

                Asq3ScreeningAnswer::create([
                    'screening_id' => $screening->id,
                    'question_id' => $question->id,
                    'answer' => $answer,
                    'score' => $points,
                ]);

                $totalScore += $points;
            }

            // Determine domain status based on cutoff scores
            $cutoffScore = Asq3CutoffScore::where('age_interval_id', $ageInterval->id)
                ->where('domain_id', $domain->id)
                ->first();

            $domainStatus = 'sesuai';
            $cutoffValue = 0;
            $monitoringValue = 0;
            
            if ($cutoffScore) {
                $cutoffValue = $cutoffScore->cutoff_score;
                $monitoringValue = $cutoffScore->monitoring_score;
                
                if ($totalScore < $cutoffScore->cutoff_score) {
                    $domainStatus = 'perlu_rujukan';
                } elseif ($totalScore < $cutoffScore->monitoring_score) {
                    $domainStatus = 'pantau';
                }
            }

            // Create domain result
            Asq3ScreeningResult::create([
                'screening_id' => $screening->id,
                'domain_id' => $domain->id,
                'total_score' => $totalScore,
                'cutoff_score' => $cutoffValue,
                'monitoring_score' => $monitoringValue,
                'status' => $domainStatus,
            ]);
        }
    }
}
