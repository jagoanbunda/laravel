<?php

namespace App\Http\Controllers;

use App\Http\Requests\LogPmtDistributionRequest;
use App\Http\Requests\StorePmtScheduleRequest;
use App\Http\Requests\UpdatePmtScheduleRequest;
use App\Models\Child;
use App\Models\PmtLog;
use App\Models\PmtMenu;
use App\Models\PmtSchedule;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PmtController extends Controller
{
    /**
     * Display a listing of PMT schedules.
     */
    public function index(Request $request): Response
    {
        $query = PmtSchedule::with(['child.user', 'log.food']);

        // Search by child name or parent name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('child', function ($childQuery) use ($search) {
                    $childQuery->where('name', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%");
                        });
                })
                    ->orWhereHas('log.food', function ($foodQuery) use ($search) {
                        $foodQuery->where('name', 'like', "%{$search}%");
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
                'parent_name' => $schedule->child->user->name,
                'food_name' => $schedule->log?->food?->name,
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
     * Display the specified PMT schedule.
     */
    public function show(string $id): Response
    {
        $schedule = PmtSchedule::with(['child.user', 'log.food'])->findOrFail($id);

        return Inertia::render('pmt/show', [
            'schedule' => [
                'id' => $schedule->id,
                'child' => [
                    'id' => $schedule->child->id,
                    'name' => $schedule->child->name,
                ],
                'parent' => [
                    'id' => $schedule->child->user->id,
                    'name' => $schedule->child->user->name,
                ],
                'scheduled_date' => $schedule->scheduled_date,
                'log' => $schedule->log ? [
                    'food_name' => $schedule->log->food?->name,
                    'food_calories' => $schedule->log->food?->calories,
                    'food_protein' => $schedule->log->food?->protein,
                    'portion' => $schedule->log->portion,
                    'portion_label' => $schedule->log->portion_label,
                    'logged_at' => $schedule->log->logged_at,
                    'notes' => $schedule->log->notes,
                    'photo_url' => $schedule->log->photo_url,
                ] : null,
            ],
        ]);
    }

    /**
     * Show the form for creating a new PMT schedule.
     */
    public function create(): Response
    {
        $children = Child::with('user')
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn ($child) => [
                'id' => $child->id,
                'name' => $child->name,
                'parent_name' => $child->user->name,
            ]);

        $menus = PmtMenu::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn ($menu) => [
                'id' => $menu->id,
                'name' => $menu->name,
                'description' => $menu->description,
                'calories' => $menu->calories,
            ]);

        return Inertia::render('pmt/create', [
            'children' => $children,
            'menus' => $menus,
        ]);
    }

    /**
     * Show the form for editing the specified PMT schedule.
     */
    public function edit(string $id): Response
    {
        $schedule = PmtSchedule::with(['child.user', 'menu'])->findOrFail($id);

        $children = Child::with('user')
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn ($child) => [
                'id' => $child->id,
                'name' => $child->name,
                'parent_name' => $child->user->name,
            ]);

        $menus = PmtMenu::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn ($menu) => [
                'id' => $menu->id,
                'name' => $menu->name,
                'description' => $menu->description,
                'calories' => $menu->calories,
            ]);

        return Inertia::render('pmt/edit', [
            'schedule' => [
                'id' => $schedule->id,
                'child_id' => $schedule->child_id,
                'menu_id' => $schedule->menu_id,
                'scheduled_date' => $schedule->scheduled_date->format('Y-m-d'),
            ],
            'children' => $children,
            'menus' => $menus,
        ]);
    }

    /**
     * Update the specified PMT schedule in storage.
     */
    public function update(UpdatePmtScheduleRequest $request, string $id): RedirectResponse
    {
        $schedule = PmtSchedule::findOrFail($id);
        $schedule->update($request->validated());

        return redirect()->route('pmt.index')->with('success', 'PMT schedule updated successfully');
    }

    /**
     * Log PMT distribution (quick log feature).
     */
    public function logDistribution(LogPmtDistributionRequest $request, string $id): RedirectResponse
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
    public function destroy(string $id): RedirectResponse
    {
        $schedule = PmtSchedule::findOrFail($id);
        $schedule->delete();

        return redirect()->back()->with('success', 'Jadwal PMT berhasil dihapus');
    }
}
