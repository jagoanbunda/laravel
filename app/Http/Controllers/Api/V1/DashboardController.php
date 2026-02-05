<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\DashboardResource;
use App\Models\Child;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService
    ) {}

    /**
     * Get dashboard data for a child.
     */
    public function show(Request $request, Child $child): DashboardResource
    {
        $this->authorizeChild($request, $child);

        $data = [
            'child' => $child,
            'progressRings' => $this->dashboardService->getProgressRings($child),
            'weeklyTrend' => $this->dashboardService->getWeeklyTrend($child),
            'tasks' => $this->dashboardService->getTaskReminders($child),
            'tips' => $this->dashboardService->getTips($child),
        ];

        return new DashboardResource($data);
    }

    /**
     * Authorize that child belongs to user.
     */
    private function authorizeChild(Request $request, Child $child): void
    {
        if ($child->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }
    }
}
