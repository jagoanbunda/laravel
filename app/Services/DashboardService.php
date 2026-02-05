<?php

namespace App\Services;

use App\Models\Asq3AgeInterval;
use App\Models\Child;
use Carbon\Carbon;

/**
 * Service untuk agregasi data dashboard mobile.
 *
 * Menyediakan data untuk:
 * - Progress rings (5 macronutrient)
 * - Weekly trend (4 minggu kalori)
 * - Task reminders (PMT, ASQ-3, Anthropometry)
 * - Tips berbasis aturan
 */
class DashboardService
{
    /**
     * Get progress rings for today's nutrition intake.
     *
     * @return array<string, array{current: float, target: float, percentage: int, unit: string}>
     */
    public function getProgressRings(Child $child): array
    {
        $today = Carbon::today();
        $ageMonths = $child->age_in_months ?? 0;
        $ageGroupKey = $this->getAgeGroupKey($ageMonths);
        $ageGroup = config("nutrition.age_groups.{$ageGroupKey}");

        $todayLogs = $child->foodLogs()
            ->whereDate('log_date', $today)
            ->get();

        $todayCalories = (float) $todayLogs->sum('total_calories');
        $todayProtein = (float) $todayLogs->sum('total_protein');
        $todayCarbs = (float) $todayLogs->sum('total_carbohydrate');
        $todayFat = (float) $todayLogs->sum('total_fat');

        $targetCalories = $ageGroup['calories']['value'] ?? 0;
        $targetProtein = $ageGroup['protein']['value'] ?? 0;
        $targetCarbs = $ageGroup['carbs']['value'] ?? 0;
        $targetFat = $ageGroup['fat']['value'] ?? 0;
        $targetFiber = $ageGroup['fiber']['value'] ?? 0;

        return [
            'calories' => [
                'current' => round($todayCalories, 1),
                'target' => $targetCalories,
                'percentage' => $this->calculatePercentage($todayCalories, $targetCalories),
                'unit' => 'kcal',
            ],
            'protein' => [
                'current' => round($todayProtein, 1),
                'target' => $targetProtein,
                'percentage' => $this->calculatePercentage($todayProtein, $targetProtein),
                'unit' => 'g',
            ],
            'carbs' => [
                'current' => round($todayCarbs, 1),
                'target' => $targetCarbs,
                'percentage' => $this->calculatePercentage($todayCarbs, $targetCarbs),
                'unit' => 'g',
            ],
            'fat' => [
                'current' => round($todayFat, 1),
                'target' => $targetFat,
                'percentage' => $this->calculatePercentage($todayFat, $targetFat),
                'unit' => 'g',
            ],
            'fiber' => [
                'current' => 0,
                'target' => $targetFiber,
                'percentage' => 0,
                'unit' => 'g',
            ],
        ];
    }

    /**
     * Get weekly trend for last 4 weeks.
     *
     * @return array{weeks: array<array{week_start: string, week_end: string, average_calories: float}>, trend_direction: string}
     */
    public function getWeeklyTrend(Child $child): array
    {
        $weeks = [];
        $weeklyAverages = [];

        for ($i = 3; $i >= 0; $i--) {
            $weekStart = Carbon::now()->subWeeks($i)->startOfWeek();
            $weekEnd = Carbon::now()->subWeeks($i)->endOfWeek();

            $logs = $child->foodLogs()
                ->whereBetween('log_date', [$weekStart, $weekEnd])
                ->get();

            $totalCalories = (float) $logs->sum('total_calories');
            $daysWithLogs = $logs->groupBy(fn ($log) => $log->log_date->format('Y-m-d'))->count();
            $averageCalories = $daysWithLogs > 0 ? round($totalCalories / $daysWithLogs, 1) : 0;

            $weeks[] = [
                'week_start' => $weekStart->format('Y-m-d'),
                'week_end' => $weekEnd->format('Y-m-d'),
                'average_calories' => $averageCalories,
            ];

            $weeklyAverages[] = $averageCalories;
        }

        return [
            'weeks' => $weeks,
            'trend_direction' => $this->determineTrendDirection($weeklyAverages),
        ];
    }

    /**
     * Get task reminders for PMT, ASQ-3, and Anthropometry.
     *
     * @return array<array{type: string, title: string, description: string, priority: string}>
     */
    public function getTaskReminders(Child $child): array
    {
        $reminders = [];

        $pmtReminder = $this->getPmtReminder($child);
        if ($pmtReminder !== null) {
            $reminders[] = $pmtReminder;
        }

        $asq3Reminder = $this->getAsq3Reminder($child);
        if ($asq3Reminder !== null) {
            $reminders[] = $asq3Reminder;
        }

        $anthropometryReminder = $this->getAnthropometryReminder($child);
        if ($anthropometryReminder !== null) {
            $reminders[] = $anthropometryReminder;
        }

        return $reminders;
    }

    /**
     * Get rule-based tips for child nutrition.
     *
     * @return array<array{icon: string, message: string, category: string}>
     */
    public function getTips(Child $child): array
    {
        $tips = [];
        $progressRings = $this->getProgressRings($child);

        $todayLogs = $child->foodLogs()
            ->whereDate('log_date', Carbon::today())
            ->exists();

        if (! $todayLogs) {
            $tips[] = [
                'icon' => '📝',
                'message' => 'Jangan lupa mencatat makanan anak',
                'category' => 'reminder',
            ];
        }

        if ($progressRings['calories']['percentage'] < 50 && $todayLogs) {
            $tips[] = [
                'icon' => '🍽️',
                'message' => 'Anak perlu makan lebih banyak hari ini',
                'category' => 'nutrition',
            ];
        }

        if ($progressRings['protein']['percentage'] < 70 && $todayLogs) {
            $tips[] = [
                'icon' => '🥚',
                'message' => 'Tingkatkan asupan protein untuk pertumbuhan optimal',
                'category' => 'nutrition',
            ];
        }

        $latestMeasurement = $child->anthropometryMeasurements()
            ->orderByDesc('measurement_date')
            ->first();

        if ($latestMeasurement !== null && $latestMeasurement->weight_for_age_zscore < -2) {
            $tips[] = [
                'icon' => '⚠️',
                'message' => 'Perhatikan asupan gizi anak untuk mencegah kekurangan berat badan',
                'category' => 'health',
            ];
        }

        return $tips;
    }

    /**
     * Map child age in months to config age group key.
     */
    private function getAgeGroupKey(int $ageMonths): string
    {
        if ($ageMonths < 6) {
            return '0-6';
        }
        if ($ageMonths < 12) {
            return '6-12';
        }
        if ($ageMonths < 36) {
            return '1-3';
        }

        return '4-6';
    }

    /**
     * Calculate percentage, capped at 100.
     */
    private function calculatePercentage(float $current, float $target): int
    {
        if ($target <= 0) {
            return 0;
        }

        return min(100, (int) round(($current / $target) * 100));
    }

    /**
     * Determine trend direction based on weekly averages.
     */
    private function determineTrendDirection(array $weeklyAverages): string
    {
        if (count($weeklyAverages) < 2) {
            return 'stable';
        }

        $firstHalf = array_slice($weeklyAverages, 0, 2);
        $secondHalf = array_slice($weeklyAverages, 2, 2);

        $firstAvg = array_sum($firstHalf) / max(1, count($firstHalf));
        $secondAvg = array_sum($secondHalf) / max(1, count($secondHalf));

        $difference = $secondAvg - $firstAvg;
        $threshold = $firstAvg * 0.1;

        if ($difference > $threshold) {
            return 'up';
        }
        if ($difference < -$threshold) {
            return 'down';
        }

        return 'stable';
    }

    /**
     * Get PMT reminder if there's an active program with pending schedule today.
     *
     * @return array{type: string, title: string, description: string, priority: string}|null
     */
    private function getPmtReminder(Child $child): ?array
    {
        $activeProgram = $child->pmtPrograms()
            ->active()
            ->first();

        if ($activeProgram === null) {
            return null;
        }

        $todaySchedule = $child->pmtSchedules()
            ->where('program_id', $activeProgram->id)
            ->whereDate('scheduled_date', Carbon::today())
            ->whereDoesntHave('log')
            ->first();

        if ($todaySchedule === null) {
            return null;
        }

        return [
            'type' => 'PMT',
            'title' => 'Jadwal PMT Hari Ini',
            'description' => 'Ada jadwal pemberian makanan tambahan yang belum dicatat',
            'priority' => 'high',
        ];
    }

    /**
     * Get ASQ-3 reminder if child's age requires a new screening.
     *
     * @return array{type: string, title: string, description: string, priority: string}|null
     */
    private function getAsq3Reminder(Child $child): ?array
    {
        $ageInDays = $child->age_in_days ?? 0;

        $currentInterval = Asq3AgeInterval::findByAgeDays($ageInDays);

        if ($currentInterval === null) {
            return null;
        }

        $existingScreening = $child->asq3Screenings()
            ->where('age_interval_id', $currentInterval->id)
            ->exists();

        if ($existingScreening) {
            return null;
        }

        return [
            'type' => 'ASQ3',
            'title' => 'Skrining Perkembangan',
            'description' => "Waktunya melakukan skrining ASQ-3 untuk usia {$currentInterval->age_label}",
            'priority' => 'medium',
        ];
    }

    /**
     * Get anthropometry reminder if last measurement was > 30 days ago.
     *
     * @return array{type: string, title: string, description: string, priority: string}|null
     */
    private function getAnthropometryReminder(Child $child): ?array
    {
        $lastMeasurement = $child->anthropometryMeasurements()
            ->orderByDesc('measurement_date')
            ->first();

        if ($lastMeasurement === null) {
            return [
                'type' => 'ANTHROPOMETRY',
                'title' => 'Pengukuran Antropometri',
                'description' => 'Belum ada data pengukuran. Lakukan pengukuran pertama',
                'priority' => 'high',
            ];
        }

        $daysSinceLast = Carbon::parse($lastMeasurement->measurement_date)->diffInDays(Carbon::today());

        if ($daysSinceLast > 30) {
            return [
                'type' => 'ANTHROPOMETRY',
                'title' => 'Pengukuran Antropometri',
                'description' => 'Sudah lebih dari 30 hari sejak pengukuran terakhir',
                'priority' => 'medium',
            ];
        }

        return null;
    }
}
