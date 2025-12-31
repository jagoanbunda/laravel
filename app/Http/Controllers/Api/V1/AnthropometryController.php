<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Anthropometry\StoreAnthropometryRequest;
use App\Http\Requests\Api\V1\Anthropometry\UpdateAnthropometryRequest;
use App\Http\Resources\Api\V1\AnthropometryResource;
use App\Models\AnthropometryMeasurement;
use App\Models\Child;
use App\Services\WhoZScoreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AnthropometryController extends Controller
{
   public function __construct(
      private readonly WhoZScoreService $whoZScoreService
   ) {}

   /**
    * Display a listing of measurements.
    */
   public function index(Request $request, Child $child): AnonymousResourceCollection
   {
      $this->authorizeChild($request, $child);

      $measurements = $child->anthropometryMeasurements()
         ->orderByDesc('measurement_date')
         ->paginate($request->get('per_page', 20));

      return AnthropometryResource::collection($measurements);
   }

   /**
    * Store a newly created measurement.
    */
   public function store(StoreAnthropometryRequest $request, Child $child): JsonResponse
   {
      $this->authorizeChild($request, $child);

      $data = $request->validated();
      $data['child_id'] = $child->id;

      // Calculate Z-Scores based on WHO standards
      $zScores = $this->whoZScoreService->calculateZScores($child, $data);
      $data = array_merge($data, $zScores);

      $measurement = AnthropometryMeasurement::create($data);

      return response()->json([
         'message' => 'Data pengukuran berhasil ditambahkan',
         'measurement' => new AnthropometryResource($measurement),
      ], 201);
   }

   /**
    * Display the specified measurement.
    */
   public function show(Request $request, Child $child, AnthropometryMeasurement $anthropometry): JsonResponse
   {
      $this->authorizeChild($request, $child);
      $this->authorizeMeasurement($child, $anthropometry);

      return response()->json([
         'measurement' => new AnthropometryResource($anthropometry),
      ]);
   }

   /**
    * Update the specified measurement.
    */
   public function update(UpdateAnthropometryRequest $request, Child $child, AnthropometryMeasurement $anthropometry): JsonResponse
   {
      $this->authorizeChild($request, $child);
      $this->authorizeMeasurement($child, $anthropometry);

      $data = $request->validated();

      // Merge with existing data for Z-Score calculation
      $measurementData = array_merge($anthropometry->toArray(), $data);

      // Recalculate Z-Scores based on WHO standards
      $zScores = $this->whoZScoreService->calculateZScores($child, $measurementData);
      $data = array_merge($data, $zScores);

      $anthropometry->update($data);

      return response()->json([
         'message' => 'Data pengukuran berhasil diperbarui',
         'measurement' => new AnthropometryResource($anthropometry->fresh()),
      ]);
   }

   /**
    * Remove the specified measurement.
    */
   public function destroy(Request $request, Child $child, AnthropometryMeasurement $anthropometry): JsonResponse
   {
      $this->authorizeChild($request, $child);
      $this->authorizeMeasurement($child, $anthropometry);

      $anthropometry->delete();

      return response()->json([
         'message' => 'Data pengukuran berhasil dihapus',
      ]);
   }

   /**
    * Get growth chart data.
    */
   public function growthChart(Request $request, Child $child): JsonResponse
   {
      $this->authorizeChild($request, $child);

      $measurements = $child->anthropometryMeasurements()
         ->orderBy('measurement_date')
         ->get()
         ->map(function ($m) {
            return [
               'date' => $m->measurement_date->format('Y-m-d'),
               'age_months' => $m->measurement_date->diffInMonths($m->child->birthday),
               'weight' => (float) $m->weight,
               'height' => (float) $m->height,
               'head_circumference' => $m->head_circumference ? (float) $m->head_circumference : null,
               'weight_for_age_zscore' => $m->weight_for_age_zscore ? (float) $m->weight_for_age_zscore : null,
               'height_for_age_zscore' => $m->height_for_age_zscore ? (float) $m->height_for_age_zscore : null,
               'weight_for_height_zscore' => $m->weight_for_height_zscore ? (float) $m->weight_for_height_zscore : null,
            ];
         });

      return response()->json([
         'child' => [
            'id' => $child->id,
            'name' => $child->name,
            'gender' => $child->gender,
            'birthday' => $child->birthday->format('Y-m-d'),
         ],
         'measurements' => $measurements,
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

   /**
    * Authorize that measurement belongs to child.
    */
   private function authorizeMeasurement(Child $child, AnthropometryMeasurement $measurement): void
   {
      if ($measurement->child_id !== $child->id) {
         abort(404, 'Data pengukuran tidak ditemukan');
      }
   }
}
