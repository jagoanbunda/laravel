<?php

namespace App\Services;

use App\Models\Child;
use Carbon\Carbon;

/**
 * Service untuk agregasi trend nutrisi makro.
 *
 * Menyediakan data trend untuk:
 * - Daily (7 hari terakhir)
 * - Weekly (4 minggu terakhir)
 * - Monthly (3 bulan terakhir)
 *
 * Untuk setiap periode, menghitung:
 * - Calories, Protein, Carbohydrate, Fat
 * - Average dan trend direction (up/down/stable)
 */
class NutritionTrendService
{
    /**
     * Get nutrition trends for a child.
     *
     * @return array{
     *     daily: array<string, array{data: array, average: float, trend_direction: string}>,
     *     weekly: array<string, array{data: array, average: float, trend_direction: string}>,
     *     monthly: array<string, array{data: array, average: float, trend_direction: string}>
     * }
     */
    public function getTrends(Child $child): array
    {
        return [
            'daily' => $this->getDailyTrends($child),
            'weekly' => $this->getWeeklyTrends($child),
            'monthly' => $this->getMonthlyTrends($child),
        ];
    }

    /**
     * Get daily trends for last 7 days.
     *
     * @return array<string, array{data: array, average: float, trend_direction: string}>
     */
    private function getDailyTrends(Child $child): array
    {
        $dailyData = [
            'calories' => [],
            'protein' => [],
            'carbohydrate' => [],
            'fat' => [],
        ];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);

            $logs = $child->foodLogs()
                ->whereDate('log_date', $date)
                ->get();

            $dailyData['calories'][] = [
                'date' => $date->format('Y-m-d'),
                'total' => round((float) $logs->sum('total_calories'), 1),
            ];

            $dailyData['protein'][] = [
                'date' => $date->format('Y-m-d'),
                'total' => round((float) $logs->sum('total_protein'), 1),
            ];

            $dailyData['carbohydrate'][] = [
                'date' => $date->format('Y-m-d'),
                'total' => round((float) $logs->sum('total_carbohydrate'), 1),
            ];

            $dailyData['fat'][] = [
                'date' => $date->format('Y-m-d'),
                'total' => round((float) $logs->sum('total_fat'), 1),
            ];
        }

        return [
            'calories' => [
                'data' => $dailyData['calories'],
                'average' => $this->calculateAverage(array_column($dailyData['calories'], 'total')),
                'trend_direction' => $this->determineTrendDirection(array_column($dailyData['calories'], 'total')),
            ],
            'protein' => [
                'data' => $dailyData['protein'],
                'average' => $this->calculateAverage(array_column($dailyData['protein'], 'total')),
                'trend_direction' => $this->determineTrendDirection(array_column($dailyData['protein'], 'total')),
            ],
            'carbohydrate' => [
                'data' => $dailyData['carbohydrate'],
                'average' => $this->calculateAverage(array_column($dailyData['carbohydrate'], 'total')),
                'trend_direction' => $this->determineTrendDirection(array_column($dailyData['carbohydrate'], 'total')),
            ],
            'fat' => [
                'data' => $dailyData['fat'],
                'average' => $this->calculateAverage(array_column($dailyData['fat'], 'total')),
                'trend_direction' => $this->determineTrendDirection(array_column($dailyData['fat'], 'total')),
            ],
        ];
    }

    /**
     * Get weekly trends for last 4 weeks.
     *
     * @return array<string, array{data: array, average: float, trend_direction: string}>
     */
    private function getWeeklyTrends(Child $child): array
    {
        $weeklyData = [
            'calories' => [],
            'protein' => [],
            'carbohydrate' => [],
            'fat' => [],
        ];

        for ($i = 3; $i >= 0; $i--) {
            $weekStart = Carbon::now()->subWeeks($i)->startOfWeek();
            $weekEnd = Carbon::now()->subWeeks($i)->endOfWeek();

            $logs = $child->foodLogs()
                ->whereBetween('log_date', [$weekStart, $weekEnd])
                ->get();

            $daysWithLogs = $logs->groupBy(fn ($log) => $log->log_date->format('Y-m-d'))->count();

            $weeklyData['calories'][] = [
                'week_start' => $weekStart->format('Y-m-d'),
                'week_end' => $weekEnd->format('Y-m-d'),
                'average' => $daysWithLogs > 0 ? round((float) $logs->sum('total_calories') / $daysWithLogs, 1) : 0,
            ];

            $weeklyData['protein'][] = [
                'week_start' => $weekStart->format('Y-m-d'),
                'week_end' => $weekEnd->format('Y-m-d'),
                'average' => $daysWithLogs > 0 ? round((float) $logs->sum('total_protein') / $daysWithLogs, 1) : 0,
            ];

            $weeklyData['carbohydrate'][] = [
                'week_start' => $weekStart->format('Y-m-d'),
                'week_end' => $weekEnd->format('Y-m-d'),
                'average' => $daysWithLogs > 0 ? round((float) $logs->sum('total_carbohydrate') / $daysWithLogs, 1) : 0,
            ];

            $weeklyData['fat'][] = [
                'week_start' => $weekStart->format('Y-m-d'),
                'week_end' => $weekEnd->format('Y-m-d'),
                'average' => $daysWithLogs > 0 ? round((float) $logs->sum('total_fat') / $daysWithLogs, 1) : 0,
            ];
        }

        return [
            'calories' => [
                'data' => $weeklyData['calories'],
                'average' => $this->calculateAverage(array_column($weeklyData['calories'], 'average')),
                'trend_direction' => $this->determineTrendDirection(array_column($weeklyData['calories'], 'average')),
            ],
            'protein' => [
                'data' => $weeklyData['protein'],
                'average' => $this->calculateAverage(array_column($weeklyData['protein'], 'average')),
                'trend_direction' => $this->determineTrendDirection(array_column($weeklyData['protein'], 'average')),
            ],
            'carbohydrate' => [
                'data' => $weeklyData['carbohydrate'],
                'average' => $this->calculateAverage(array_column($weeklyData['carbohydrate'], 'average')),
                'trend_direction' => $this->determineTrendDirection(array_column($weeklyData['carbohydrate'], 'average')),
            ],
            'fat' => [
                'data' => $weeklyData['fat'],
                'average' => $this->calculateAverage(array_column($weeklyData['fat'], 'average')),
                'trend_direction' => $this->determineTrendDirection(array_column($weeklyData['fat'], 'average')),
            ],
        ];
    }

    /**
     * Get monthly trends for last 3 months.
     *
     * @return array<string, array{data: array, average: float, trend_direction: string}>
     */
    private function getMonthlyTrends(Child $child): array
    {
        $monthlyData = [
            'calories' => [],
            'protein' => [],
            'carbohydrate' => [],
            'fat' => [],
        ];

        for ($i = 2; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthEnd = Carbon::now()->subMonths($i)->endOfMonth();

            $logs = $child->foodLogs()
                ->whereBetween('log_date', [$monthStart, $monthEnd])
                ->get();

            $daysWithLogs = $logs->groupBy(fn ($log) => $log->log_date->format('Y-m-d'))->count();

            $monthlyData['calories'][] = [
                'month' => $monthStart->format('F'),
                'year' => $monthStart->format('Y'),
                'average' => $daysWithLogs > 0 ? round((float) $logs->sum('total_calories') / $daysWithLogs, 1) : 0,
            ];

            $monthlyData['protein'][] = [
                'month' => $monthStart->format('F'),
                'year' => $monthStart->format('Y'),
                'average' => $daysWithLogs > 0 ? round((float) $logs->sum('total_protein') / $daysWithLogs, 1) : 0,
            ];

            $monthlyData['carbohydrate'][] = [
                'month' => $monthStart->format('F'),
                'year' => $monthStart->format('Y'),
                'average' => $daysWithLogs > 0 ? round((float) $logs->sum('total_carbohydrate') / $daysWithLogs, 1) : 0,
            ];

            $monthlyData['fat'][] = [
                'month' => $monthStart->format('F'),
                'year' => $monthStart->format('Y'),
                'average' => $daysWithLogs > 0 ? round((float) $logs->sum('total_fat') / $daysWithLogs, 1) : 0,
            ];
        }

        return [
            'calories' => [
                'data' => $monthlyData['calories'],
                'average' => $this->calculateAverage(array_column($monthlyData['calories'], 'average')),
                'trend_direction' => $this->determineTrendDirection(array_column($monthlyData['calories'], 'average')),
            ],
            'protein' => [
                'data' => $monthlyData['protein'],
                'average' => $this->calculateAverage(array_column($monthlyData['protein'], 'average')),
                'trend_direction' => $this->determineTrendDirection(array_column($monthlyData['protein'], 'average')),
            ],
            'carbohydrate' => [
                'data' => $monthlyData['carbohydrate'],
                'average' => $this->calculateAverage(array_column($monthlyData['carbohydrate'], 'average')),
                'trend_direction' => $this->determineTrendDirection(array_column($monthlyData['carbohydrate'], 'average')),
            ],
            'fat' => [
                'data' => $monthlyData['fat'],
                'average' => $this->calculateAverage(array_column($monthlyData['fat'], 'average')),
                'trend_direction' => $this->determineTrendDirection(array_column($monthlyData['fat'], 'average')),
            ],
        ];
    }

    /**
     * Calculate average from array of values.
     */
    private function calculateAverage(array $values): float
    {
        if (count($values) === 0) {
            return 0;
        }

        return round(array_sum($values) / count($values), 1);
    }

    /**
     * Determine trend direction based on averages.
     *
     * Copied from DashboardService::determineTrendDirection()
     * Uses 10% threshold to compare first half vs second half.
     */
    private function determineTrendDirection(array $averages): string
    {
        if (count($averages) < 2) {
            return 'stable';
        }

        $firstHalf = array_slice($averages, 0, 2);
        $secondHalf = array_slice($averages, 2, 2);

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
}
