<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\NutritionTrendResource;
use App\Models\Child;
use App\Services\NutritionTrendService;
use Illuminate\Http\Request;

class NutritionTrendController extends Controller
{
    public function __construct(
        private NutritionTrendService $nutritionTrendService
    ) {}

    /**
     * Get nutrition trends for a child.
     */
    public function __invoke(Request $request, Child $child): NutritionTrendResource
    {
        $this->authorizeChild($request, $child);

        $trends = $this->nutritionTrendService->getTrends($child);

        return new NutritionTrendResource($trends);
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
