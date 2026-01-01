<?php

namespace App\Http\Controllers;

use App\Models\PmtSchedule;
use App\Models\PmtLog;
use App\Http\Requests\LogPmtDistributionRequest;
use App\Http\Requests\StorePmtScheduleRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PmtController extends Controller
{
    /**
     * Display a listing of PMT schedules.
     */
    public function index(Request $request)
    {
        $query = PmtSchedule::with(['child.user', 'menu', 'log']);

        // Search by child name, parent name, or menu name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('child', function ($childQuery) use ($search) {
                    $childQuery->where('name', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('full_name', 'like', "%{$search}%");
                        });
                })
                ->orWhereHas('menu', function ($menuQuery) use ($search) {
                    $menuQuery->where('name', 'like', "%{$search}%");
                });
            });
        }

        // Filter by status (logged or not)
        if ($request->filled('status')) {
            if ($request->status === 'logged') {
                $query->has('log');
            } elseif ($request->status === 'not_logged') {
                $query->doesntHave('log');
            }
        }

        // Order by scheduled_date descending
        $query->orderBy('scheduled_date', 'desc');

        $schedules = $query->paginate(15)->through(function ($schedule) {
            return [
                'id' => $schedule->id,
                'child_id' => $schedule->child_id,
                'child_name' => $schedule->child->name,
                'parent_name' => $schedule->child->user->full_name,
                'menu_name' => $schedule->menu->name,
                'scheduled_date' => $schedule->scheduled_date,
                'portion' => $schedule->log?->portion,
                'logged_at' => $schedule->log?->logged_at,
                'notes' => $schedule->log?->notes,
            ];
        });

        return Inertia::render('pmt/index', [
            'schedules' => $schedules,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Log PMT distribution (quick log feature).
     */
    public function logDistribution(LogPmtDistributionRequest $request, $id)
    {
        $schedule = PmtSchedule::findOrFail($id);

        // Create or update the log
        PmtLog::updateOrCreate(
            ['schedule_id' => $schedule->id],
            [
                'portion' => $request->portion,
                'logged_at' => $request->logged_at ?? Carbon::now(),
                'notes' => $request->notes,
                'photo_url' => $request->photo_url,
            ]
        );

        return redirect()->back()->with('success', 'Distribusi PMT berhasil dicatat');
    }

    /**
     * Store a new PMT schedule.
     */
    public function store(StorePmtScheduleRequest $request)
    {
        PmtSchedule::create([
            'child_id' => $request->child_id,
            'menu_id' => $request->menu_id,
            'scheduled_date' => $request->scheduled_date,
        ]);

        return redirect()->route('pmt.index')->with('success', 'Jadwal PMT berhasil dibuat.');
    }

    /**
     * Remove the specified PMT schedule.
     */
    public function destroy($id)
    {
        $schedule = PmtSchedule::findOrFail($id);
        $schedule->delete();

        return redirect()->back()->with('success', 'Jadwal PMT berhasil dihapus');
    }
}
