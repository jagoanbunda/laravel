<?php

namespace App\Http\Controllers;

use App\Models\Asq3Screening;
use App\Models\Child;
use App\Models\PmtLog;
use App\Models\PmtSchedule;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display the reports dashboard.
     */
    public function index(): Response
    {
        $stats = [
            'total_children' => Child::count(),
            'active_children' => Child::where('is_active', true)->count(),
            'total_screenings' => Asq3Screening::count(),
            'completed_screenings' => Asq3Screening::where('status', 'completed')->count(),
            'pmt_completion_rate' => $this->calculatePmtRate(),
            'screening_results' => $this->getScreeningResults(),
            'pmt_distribution' => $this->getPmtDistributionStats(),
        ];

        return Inertia::render('reports/index', [
            'stats' => $stats,
        ]);
    }

    /**
     * Calculate PMT completion rate.
     */
    private function calculatePmtRate(): float
    {
        $totalSchedules = PmtSchedule::count();
        if ($totalSchedules === 0) {
            return 0;
        }

        $completedSchedules = PmtSchedule::has('log')->count();

        return round(($completedSchedules / $totalSchedules) * 100, 1);
    }

    /**
     * Get screening results breakdown.
     */
    private function getScreeningResults(): array
    {
        return [
            'sesuai' => Asq3Screening::where('overall_status', 'sesuai')->count(),
            'pantau' => Asq3Screening::where('overall_status', 'pantau')->count(),
            'perlu_rujukan' => Asq3Screening::where('overall_status', 'perlu_rujukan')->count(),
        ];
    }

    /**
     * Get PMT distribution statistics.
     */
    private function getPmtDistributionStats(): array
    {
        $logs = PmtLog::selectRaw('portion, COUNT(*) as count')
            ->groupBy('portion')
            ->pluck('count', 'portion')
            ->toArray();

        return [
            'habis' => $logs['habis'] ?? 0,
            'half' => $logs['half'] ?? 0,
            'quarter' => $logs['quarter'] ?? 0,
            'none' => $logs['none'] ?? 0,
        ];
    }
}
