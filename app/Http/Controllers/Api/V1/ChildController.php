<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Child\StoreChildRequest;
use App\Http\Requests\Api\V1\Child\UpdateChildRequest;
use App\Http\Resources\Api\V1\ChildResource;
use App\Models\Child;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class ChildController extends Controller
{
    /**
     * Display a listing of children.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $children = $request->user()
            ->children()
            ->when($request->has('active_only'), function ($query) {
                $query->where('is_active', true);
            })
            ->orderBy('name')
            ->get();

        return ChildResource::collection($children);
    }

    /**
     * Store a newly created child.
     */
    public function store(StoreChildRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Handle avatar file upload
        if ($request->hasFile('avatar')) {
            $validated['avatar_url'] = $request->file('avatar')->store('children/avatars', 'public');
        }

        $child = $request->user()->children()->create($validated);

        return response()->json([
            'message' => 'Data anak berhasil ditambahkan',
            'child' => new ChildResource($child),
        ], 201);
    }

    /**
     * Display the specified child.
     */
    public function show(Request $request, Child $child): JsonResponse
    {
        $this->authorizeChild($request, $child);

        return response()->json([
            'child' => new ChildResource($child),
        ]);
    }

    /**
     * Update the specified child.
     */
    public function update(UpdateChildRequest $request, Child $child): JsonResponse
    {
        $this->authorizeChild($request, $child);

        $validated = $request->validated();

        // Handle avatar file upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if it's a local file
            if ($child->avatar_url && str_starts_with($child->avatar_url, 'children/avatars/')) {
                Storage::disk('public')->delete($child->avatar_url);
            }
            $validated['avatar_url'] = $request->file('avatar')->store('children/avatars', 'public');
        }

        $child->update($validated);

        return response()->json([
            'message' => 'Data anak berhasil diperbarui',
            'child' => new ChildResource($child->fresh()),
        ]);
    }

    /**
     * Remove the specified child (soft delete).
     */
    public function destroy(Request $request, Child $child): JsonResponse
    {
        $this->authorizeChild($request, $child);

        $child->delete();

        return response()->json([
            'message' => 'Data anak berhasil dihapus',
        ]);
    }

    /**
     * Get child summary with latest measurements and screening.
     */
    public function summary(Request $request, Child $child): JsonResponse
    {
        $this->authorizeChild($request, $child);

        // Get latest anthropometry
        $latestMeasurement = $child->anthropometryMeasurements()
            ->latest('measurement_date')
            ->first();

        // Get latest screening
        $latestScreening = $child->asq3Screenings()
            ->where('status', 'completed')
            ->latest('screening_date')
            ->first();

        // Get today's food logs
        $todayNutrition = $child->foodLogs()
            ->whereDate('log_date', today())
            ->selectRaw('SUM(total_calories) as calories, SUM(total_protein) as protein, SUM(total_carbohydrate) as carbs, SUM(total_fat) as fat')
            ->first();

        return response()->json([
            'child' => new ChildResource($child),
            'age' => [
                'months' => $child->age_in_months,
                'days' => $child->age_in_days,
            ],
            'latest_measurement' => $latestMeasurement ? [
                'date' => $latestMeasurement->measurement_date,
                'weight' => $latestMeasurement->weight,
                'height' => $latestMeasurement->height,
                'nutritional_status' => $latestMeasurement->nutritional_status,
                'stunting_status' => $latestMeasurement->stunting_status,
                'wasting_status' => $latestMeasurement->wasting_status,
            ] : null,
            'latest_screening' => $latestScreening ? [
                'date' => $latestScreening->screening_date,
                'overall_status' => $latestScreening->overall_status,
            ] : null,
            'today_nutrition' => [
                'calories' => (float) ($todayNutrition->calories ?? 0),
                'protein' => (float) ($todayNutrition->protein ?? 0),
                'carbohydrate' => (float) ($todayNutrition->carbs ?? 0),
                'fat' => (float) ($todayNutrition->fat ?? 0),
            ],
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
