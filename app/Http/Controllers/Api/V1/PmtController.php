<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Pmt\LogPmtRequest;
use App\Http\Requests\Api\V1\Pmt\StorePmtScheduleRequest;
use App\Http\Requests\Api\V1\Pmt\UpdatePmtLogRequest;
use App\Http\Resources\Api\V1\PmtMenuResource;
use App\Http\Resources\Api\V1\PmtScheduleResource;
use App\Models\Child;
use App\Models\PmtMenu;
use App\Models\PmtSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PmtController extends Controller
{
    /**
     * Get all PMT menus.
     */
    public function menus(Request $request): JsonResponse
    {
        $query = PmtMenu::where('is_active', true);

        // Filter by age if provided
        if ($request->has('age_months')) {
            $age = $request->age_months;
            $query->where(function ($q) use ($age) {
                $q->where(function ($q2) use ($age) {
                    $q2->where('min_age_months', '<=', $age)
                        ->where('max_age_months', '>=', $age);
                })->orWhere(function ($q2) {
                    $q2->whereNull('min_age_months')
                        ->whereNull('max_age_months');
                });
            });
        }

        $menus = $query->orderBy('name')->get();

        return response()->json([
            'menus' => PmtMenuResource::collection($menus),
        ]);
    }

    /**
     * Get PMT schedules for a child.
     */
    public function schedules(Request $request, Child $child): JsonResponse
    {
        $this->authorizeChild($request, $child);

        $query = $child->pmtSchedules()->with(['menu', 'log']);

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('scheduled_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('scheduled_date', '<=', $request->end_date);
        }

        // Default to current month if no dates specified
        if (! $request->has('start_date') && ! $request->has('end_date')) {
            $query->whereMonth('scheduled_date', now()->month)
                ->whereYear('scheduled_date', now()->year);
        }

        $schedules = $query->orderBy('scheduled_date')->get();

        return response()->json([
            'schedules' => PmtScheduleResource::collection($schedules),
        ]);
    }

    /**
     * Create a new PMT schedule.
     */
    public function createSchedule(StorePmtScheduleRequest $request, Child $child): JsonResponse
    {
        $this->authorizeChild($request, $child);

        $schedule = $child->pmtSchedules()->create([
            'menu_id' => $request->menu_id,
            'scheduled_date' => $request->scheduled_date,
        ]);

        return response()->json([
            'message' => 'Jadwal PMT berhasil dibuat',
            'schedule' => new PmtScheduleResource($schedule->load('menu')),
        ], 201);
    }

    /**
     * Log PMT consumption.
     */
    public function log(LogPmtRequest $request, PmtSchedule $schedule): JsonResponse
    {
        // Authorize - check if schedule belongs to user's child
        $child = $schedule->child;
        if ($child->user_id !== $request->user()->id) {
            abort(403, 'Anda tidak memiliki akses ke jadwal PMT ini');
        }

        // Check if already logged
        if ($schedule->log) {
            return response()->json([
                'message' => 'PMT sudah tercatat untuk jadwal ini',
            ], 422);
        }

        $data = [
            'portion' => $request->portion,
            'notes' => $request->notes,
        ];

        if ($request->hasFile('photo')) {
            $data['photo_url'] = $request->file('photo')->store('pmt-logs/photos', 'public');
        }

        $log = $schedule->log()->create($data);

        return response()->json([
            'message' => 'Konsumsi PMT berhasil dicatat',
            'schedule' => new PmtScheduleResource($schedule->fresh()->load(['menu', 'log'])),
        ], 201);
    }

    /**
     * Update PMT log.
     */
    public function updateLog(UpdatePmtLogRequest $request, PmtSchedule $schedule): JsonResponse
    {
        // Authorize
        $child = $schedule->child;
        if ($child->user_id !== $request->user()->id) {
            abort(403, 'Anda tidak memiliki akses ke jadwal PMT ini');
        }

        if (! $schedule->log) {
            return response()->json([
                'message' => 'Log PMT tidak ditemukan',
            ], 404);
        }

        $data = $request->only(['portion', 'notes']);

        if ($request->hasFile('photo')) {
            if ($schedule->log->photo_url && str_starts_with($schedule->log->photo_url, 'pmt-logs/photos/')) {
                Storage::disk('public')->delete($schedule->log->photo_url);
            }
            $data['photo_url'] = $request->file('photo')->store('pmt-logs/photos', 'public');
        }

        $schedule->log->update($data);

        return response()->json([
            'message' => 'Log PMT berhasil diperbarui',
            'schedule' => new PmtScheduleResource($schedule->fresh()->load(['menu', 'log'])),
        ]);
    }

    /**
     * Get PMT progress for a child.
     */
    public function progress(Request $request, Child $child): JsonResponse
    {
        $this->authorizeChild($request, $child);

        $request->validate([
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
        ]);

        $startDate = $request->get('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', now()->endOfMonth()->format('Y-m-d'));

        $schedules = $child->pmtSchedules()
            ->with('log')
            ->whereBetween('scheduled_date', [$startDate, $endDate])
            ->get();

        $totalScheduled = $schedules->count();
        $logged = $schedules->filter(fn ($s) => $s->log !== null);
        $totalLogged = $logged->count();

        // Calculate consumption stats
        $consumptionStats = [
            'habis' => $logged->filter(fn ($s) => $s->log?->portion === 'habis')->count(),
            'half' => $logged->filter(fn ($s) => $s->log?->portion === 'half')->count(),
            'quarter' => $logged->filter(fn ($s) => $s->log?->portion === 'quarter')->count(),
            'none' => $logged->filter(fn ($s) => $s->log?->portion === 'none')->count(),
        ];

        // Calculate compliance percentage
        $complianceRate = $totalScheduled > 0 ? round(($totalLogged / $totalScheduled) * 100, 1) : 0;

        // Calculate consumption rate (weighted)
        $consumptionPoints = ($consumptionStats['habis'] * 100) +
           ($consumptionStats['half'] * 50) +
           ($consumptionStats['quarter'] * 25);
        $maxPoints = $totalLogged * 100;
        $consumptionRate = $maxPoints > 0 ? round(($consumptionPoints / $maxPoints) * 100, 1) : 0;

        return response()->json([
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'summary' => [
                'total_scheduled' => $totalScheduled,
                'total_logged' => $totalLogged,
                'pending' => $totalScheduled - $totalLogged,
                'compliance_rate' => $complianceRate,
                'consumption_rate' => $consumptionRate,
            ],
            'consumption_breakdown' => $consumptionStats,
        ]);
    }

    /**
     * Authorize that child belongs to user.
     */
    private function authorizeChild(Request $request, Child $child): void
    {
        if ($child->user_id !== $request->user()->id) {
            abort(403, 'Anda tidak memiliki akses ke data anak ini');
        }
    }
}
