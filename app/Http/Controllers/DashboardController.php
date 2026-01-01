<?php

namespace App\Http\Controllers;

use App\Models\Asq3Screening;
use App\Models\Child;
use App\Models\PmtLog;
use App\Models\PmtSchedule;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard/index', [
            'stats' => [
                'total_parents' => User::count(),
                'total_children' => Child::count(),
                'active_children' => Child::where('is_active', true)->count(),
                'at_risk_children' => $this->getAtRiskCount(),
                'active_pmt_programs' => PmtSchedule::doesntHave('log')->count(),
                'total_screenings' => Asq3Screening::count(),
            ],
            'nutritional_distribution' => $this->getNutritionalDistribution(),
            'screening_results' => $this->getScreeningResults(),
            'pmt_distribution' => $this->getPmtDistribution(),
            'monthly_trends' => $this->getMonthlyTrends(),
            'children_at_risk' => $this->getChildrenAtRisk(),
            'recent_activities' => $this->getRecentActivities(),
        ]);
    }

    private function getAtRiskCount(): int
    {
        // Children with concerning screening results
        return Asq3Screening::where('overall_status', 'perlu_rujukan')->distinct('child_id')->count('child_id');
    }

    private function getNutritionalDistribution(): array
    {
        // Placeholder - would query anthropometry_measurements
        return [
            ['name' => 'Normal', 'value' => 78, 'color' => '#10b981'],
            ['name' => 'Underweight', 'value' => 12, 'color' => '#f59e0b'],
            ['name' => 'Stunted', 'value' => 7, 'color' => '#f97316'],
            ['name' => 'Wasted', 'value' => 3, 'color' => '#ef4444'],
        ];
    }

    private function getScreeningResults(): array
    {
        return [
            ['name' => 'Sesuai', 'value' => Asq3Screening::where('overall_status', 'sesuai')->count(), 'color' => '#10b981'],
            ['name' => 'Pantau', 'value' => Asq3Screening::where('overall_status', 'pantau')->count(), 'color' => '#f59e0b'],
            ['name' => 'Perlu Rujukan', 'value' => Asq3Screening::where('overall_status', 'perlu_rujukan')->count(), 'color' => '#ef4444'],
        ];
    }

    private function getPmtDistribution(): array
    {
        return [
            ['name' => 'Habis', 'value' => PmtLog::where('portion', 'habis')->count(), 'color' => '#10b981'],
            ['name' => 'Setengah', 'value' => PmtLog::where('portion', 'half')->count(), 'color' => '#3b82f6'],
            ['name' => 'Seperempat', 'value' => PmtLog::where('portion', 'quarter')->count(), 'color' => '#f59e0b'],
            ['name' => 'Tidak Dimakan', 'value' => PmtLog::where('portion', 'none')->count(), 'color' => '#ef4444'],
        ];
    }

    private function getMonthlyTrends(): array
    {
        $months = collect(range(5, 0))->map(function ($i) {
            $date = now()->subMonths($i);
            return [
                'month' => $date->format('M'),
                'children' => Child::whereMonth('created_at', $date->month)->whereYear('created_at', $date->year)->count(),
                'screenings' => Asq3Screening::whereMonth('created_at', $date->month)->whereYear('created_at', $date->year)->count(),
            ];
        });
        return $months->values()->toArray();
    }

    private function getChildrenAtRisk(): array
    {
        return Child::whereHas('asq3Screenings', fn ($q) => $q->where('overall_status', 'perlu_rujukan'))
            ->with(['user', 'asq3Screenings' => fn ($q) => $q->latest()->limit(1)])
            ->limit(5)
            ->get()
            ->map(fn ($child) => [
                'id' => $child->id,
                'name' => $child->name,
                'age_months' => $child->age_in_months,
                'parent_name' => $child->user->full_name,
                'status' => $child->asq3Screenings->first()?->overall_status,
                'last_screening' => $child->asq3Screenings->first()?->screening_date,
            ])
            ->toArray();
    }

    private function getRecentActivities(): array
    {
        $activities = collect();

        // Recent screenings
        Asq3Screening::with('child')->latest()->limit(3)->get()->each(function ($s) use ($activities) {
            $activities->push([
                'id' => 's' . $s->id,
                'type' => 'screening',
                'text' => "ASQ-3 screening for {$s->child->name}",
                'time' => $s->created_at->diffForHumans(),
                'timestamp' => $s->created_at->timestamp,
            ]);
        });

        // Recent PMT logs
        PmtLog::with('schedule.child')->orderBy('logged_at', 'desc')->limit(2)->get()->each(function ($log) use ($activities) {
            $activities->push([
                'id' => 'p' . $log->id,
                'type' => 'pmt',
                'text' => "PMT logged for {$log->schedule->child->name}",
                'time' => $log->logged_at->diffForHumans(),
                'timestamp' => $log->logged_at->timestamp,
            ]);
        });

        return $activities->sortByDesc('timestamp')->take(5)->values()->toArray();
    }
}
