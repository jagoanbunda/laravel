<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePmtProgramRequest;
use App\Models\Child;
use App\Models\PmtProgram;
use App\Models\PmtSchedule;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PmtProgramController extends Controller
{
    /**
     * Display a listing of PMT programs.
     */
    public function index(Request $request): Response
    {
        $query = PmtProgram::with(['child.user', 'creator']);

        // Search by child name or parent name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('child', function ($childQuery) use ($search) {
                $childQuery->where('name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Order by created_at descending
        $query->orderBy('created_at', 'desc');

        $programs = $query->paginate(15)->through(function ($program) {
            return [
                'id' => $program->id,
                'child_id' => $program->child_id,
                'child_name' => $program->child->name,
                'parent_name' => $program->child->user->name,
                'start_date' => $program->start_date->format('Y-m-d'),
                'end_date' => $program->end_date->format('Y-m-d'),
                'duration_days' => $program->duration_days,
                'status' => $program->status,
                'progress_percentage' => $program->progress_percentage,
                'days_remaining' => $program->days_remaining,
                'created_at' => $program->created_at->format('Y-m-d H:i'),
            ];
        });

        return Inertia::render('pmt/programs/index', [
            'programs' => $programs,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status ?? 'all',
            ],
        ]);
    }

    /**
     * Show the form for creating a new PMT program.
     */
    public function create(): Response
    {
        $children = Child::with('user')
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($child) {
                $hasActiveProgram = PmtProgram::where('child_id', $child->id)
                    ->where('status', 'active')
                    ->exists();

                return [
                    'id' => $child->id,
                    'name' => $child->name,
                    'parent_name' => $child->user->name,
                    'age_months' => $child->age_in_months,
                    'has_active_program' => $hasActiveProgram,
                ];
            });

        return Inertia::render('pmt/programs/create', [
            'children' => $children,
        ]);
    }

    /**
     * Store a newly created PMT program.
     */
    public function store(StorePmtProgramRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            $startDate = Carbon::parse($validated['start_date']);
            $endDate = $startDate->copy()->addDays($validated['duration_days'] - 1);

            // Create the program
            $program = PmtProgram::create([
                'child_id' => $validated['child_id'],
                'start_date' => $startDate,
                'end_date' => $endDate,
                'duration_days' => $validated['duration_days'],
                'status' => 'active',
                'created_by' => Auth::id(),
                'notes' => $validated['notes'] ?? null,
            ]);

            // Delete existing schedules for this child in the date range (cleanup from old programs)
            PmtSchedule::where('child_id', $validated['child_id'])
                ->whereBetween('scheduled_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                ->delete();

            // Bulk create schedules
            $schedules = [];
            for ($i = 0; $i < $validated['duration_days']; $i++) {
                $schedules[] = [
                    'program_id' => $program->id,
                    'child_id' => $validated['child_id'],
                    'scheduled_date' => $startDate->copy()->addDays($i)->format('Y-m-d'),
                ];
            }

            PmtSchedule::insert($schedules);
        });

        return redirect()->route('pmt.programs.index')
            ->with('success', 'Program PMT berhasil dibuat dengan '.$validated['duration_days'].' jadwal.');
    }

    /**
     * Display the specified PMT program.
     */
    public function show(PmtProgram $program, Request $request): Response
    {
        $program->load(['child.user', 'creator']);

        // Get paginated schedules
        $schedulesQuery = $program->schedules()
            ->with(['log.food', 'menu'])
            ->orderBy('scheduled_date', 'asc');

        $schedules = $schedulesQuery->paginate(10)->through(function ($schedule) {
            return [
                'id' => $schedule->id,
                'scheduled_date' => $schedule->scheduled_date->format('Y-m-d'),
                'menu_name' => $schedule->menu?->name,
                'is_logged' => $schedule->is_logged,
                'log' => $schedule->log ? [
                    'food_name' => $schedule->log->food?->name,
                    'portion' => $schedule->log->portion,
                    'portion_label' => $schedule->log->portion_label,
                    'portion_percentage' => $schedule->log->portion_percentage,
                    'logged_at' => $schedule->log->logged_at->format('Y-m-d H:i'),
                    'notes' => $schedule->log->notes,
                    'photo_url' => $schedule->log->photo_url,
                ] : null,
            ];
        });

        // Calculate statistics
        $statistics = [
            'total_days' => $program->duration_days,
            'logged_days' => $program->logged_days,
            'pending_days' => $program->pending_days,
            'completion_rate' => $program->progress_percentage,
        ];

        return Inertia::render('pmt/programs/show', [
            'program' => [
                'id' => $program->id,
                'child' => [
                    'id' => $program->child->id,
                    'name' => $program->child->name,
                    'age_months' => $program->child->age_in_months,
                ],
                'parent' => [
                    'id' => $program->child->user->id,
                    'name' => $program->child->user->name,
                ],
                'start_date' => $program->start_date->format('Y-m-d'),
                'end_date' => $program->end_date->format('Y-m-d'),
                'duration_days' => $program->duration_days,
                'status' => $program->status,
                'progress_percentage' => $program->progress_percentage,
                'days_remaining' => $program->days_remaining,
                'notes' => $program->notes,
                'created_by' => $program->creator?->name,
                'created_at' => $program->created_at->format('Y-m-d H:i'),
            ],
            'schedules' => $schedules,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Show the form for editing the specified PMT program.
     */
    public function edit(PmtProgram $program): Response
    {
        return Inertia::render('pmt/programs/edit', [
            'program' => [
                'id' => $program->id,
                'notes' => $program->notes,
            ],
        ]);
    }

    /**
     * Update the specified PMT program.
     */
    public function update(Request $request, PmtProgram $program): RedirectResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $program->update([
            'notes' => $validated['notes'],
        ]);

        return redirect()->route('pmt.programs.show', $program)
            ->with('success', 'Catatan program PMT berhasil diperbarui.');
    }

    /**
     * Remove the specified PMT program.
     */
    public function destroy(PmtProgram $program): RedirectResponse
    {
        $program->delete();

        return redirect()->route('pmt.programs.index')
            ->with('success', 'Program PMT berhasil dihapus.');
    }

    /**
     * Mark the program as discontinued.
     */
    public function discontinue(PmtProgram $program): RedirectResponse
    {
        if ($program->status !== 'active') {
            return redirect()->back()
                ->with('error', 'Program ini tidak dalam status aktif.');
        }

        $program->update(['status' => 'discontinued']);

        return redirect()->back()
            ->with('success', 'Program PMT berhasil dihentikan.');
    }
}
