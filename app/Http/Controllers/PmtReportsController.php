<?php

namespace App\Http\Controllers;

use App\Exports\PmtReportsExport;
use App\Models\PmtLog;
use App\Models\PmtProgram;
use App\Models\PmtSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PmtReportsController extends Controller
{
    /**
     * Display the PMT reports/monitoring page.
     */
    public function index(Request $request): Response
    {
        // Build query for logs with relationships
        $query = PmtLog::query()
            ->with([
                'schedule.child.user',
                'schedule.menu',
                'schedule.program',
                'food',
            ])
            ->join('pmt_schedules', 'pmt_logs.schedule_id', '=', 'pmt_schedules.id')
            ->select('pmt_logs.*');

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('pmt_logs.logged_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('pmt_logs.logged_at', '<=', $request->date_to);
        }

        // Filter by program
        if ($request->filled('program_id')) {
            $query->where('pmt_schedules.program_id', $request->program_id);
        }

        // Filter by portion
        if ($request->filled('portion')) {
            $query->where('pmt_logs.portion', $request->portion);
        }

        // Search by child name or parent name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('schedule.child', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Order by logged_at descending
        $query->orderBy('pmt_logs.logged_at', 'desc');

        // Get paginated logs
        $logs = $query->paginate(15)->through(function ($log) {
            return [
                'id' => $log->id,
                'child_name' => $log->schedule->child->name ?? '-',
                'parent_name' => $log->schedule->child->user->name ?? '-',
                'menu_name' => $log->schedule->menu->name ?? '-',
                'program_name' => $log->schedule->program->notes ?? null,
                'scheduled_date' => $log->schedule->scheduled_date?->format('Y-m-d'),
                'portion' => $log->portion,
                'portion_label' => $log->portion_label,
                'portion_percentage' => $log->portion_percentage,
                'photo_url' => $log->photo_url,
                'notes' => $log->notes,
                'logged_at' => $log->logged_at?->format('Y-m-d H:i'),
            ];
        });

        // Calculate statistics
        $stats = $this->calculateStats($request);

        // Get active programs for filter dropdown
        $programs = PmtProgram::query()
            ->with('child')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(fn ($program) => [
                'id' => $program->id,
                'label' => $program->child->name.' - '.($program->notes ?? 'Program #'.$program->id),
            ]);

        return Inertia::render('pmt/reports/index', [
            'logs' => $logs,
            'stats' => $stats,
            'programs' => $programs,
            'filters' => [
                'search' => $request->search,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'program_id' => $request->program_id,
                'portion' => $request->portion,
            ],
        ]);
    }

    /**
     * Export PMT reports to Excel.
     */
    public function export(Request $request): BinaryFileResponse
    {
        $filename = 'laporan-pmt-'.now()->format('Y-m-d').'.xlsx';

        return Excel::download(new PmtReportsExport($request), $filename);
    }

    /**
     * Calculate statistics for the reports page.
     *
     * @return array<string, mixed>
     */
    private function calculateStats(Request $request): array
    {
        // Build base query with same filters
        $baseQuery = PmtSchedule::query();

        if ($request->filled('date_from')) {
            $baseQuery->whereDate('scheduled_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $baseQuery->whereDate('scheduled_date', '<=', $request->date_to);
        }
        if ($request->filled('program_id')) {
            $baseQuery->where('program_id', $request->program_id);
        }

        $totalSchedules = (clone $baseQuery)->count();
        $totalLogged = (clone $baseQuery)->has('log')->count();
        $complianceRate = $totalSchedules > 0 ? round(($totalLogged / $totalSchedules) * 100, 1) : 0;

        // Consumption breakdown
        $consumptionBreakdown = PmtLog::query()
            ->whereIn('schedule_id', (clone $baseQuery)->pluck('id'))
            ->selectRaw('portion, COUNT(*) as count')
            ->groupBy('portion')
            ->pluck('count', 'portion')
            ->toArray();

        $breakdown = [
            'habis' => $consumptionBreakdown['habis'] ?? 0,
            'half' => $consumptionBreakdown['half'] ?? 0,
            'quarter' => $consumptionBreakdown['quarter'] ?? 0,
            'none' => $consumptionBreakdown['none'] ?? 0,
        ];

        // Calculate weighted consumption rate
        $consumptionPoints = ($breakdown['habis'] * 100) +
            ($breakdown['half'] * 50) +
            ($breakdown['quarter'] * 25);
        $maxPoints = $totalLogged * 100;
        $consumptionRate = $maxPoints > 0 ? round(($consumptionPoints / $maxPoints) * 100, 1) : 0;

        return [
            'total_schedules' => $totalSchedules,
            'total_logged' => $totalLogged,
            'pending' => $totalSchedules - $totalLogged,
            'compliance_rate' => $complianceRate,
            'consumption_rate' => $consumptionRate,
            'consumption_breakdown' => $breakdown,
        ];
    }
}
