<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Asq3\StartScreeningRequest;
use App\Http\Requests\Api\V1\Asq3\SubmitAnswersRequest;
use App\Http\Resources\Api\V1\Asq3ScreeningProgressResource;
use App\Http\Resources\Api\V1\Asq3ScreeningResource;
use App\Models\Asq3AgeInterval;
use App\Models\Asq3CutoffScore;
use App\Models\Asq3Domain;
use App\Models\Asq3Question;
use App\Models\Asq3Recommendation;
use App\Models\Asq3Screening;
use App\Models\Asq3ScreeningAnswer;
use App\Models\Asq3ScreeningResult;
use App\Models\Child;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class Asq3Controller extends Controller
{
   /**
    * Get all ASQ-3 domains.
    */
   public function domains(): JsonResponse
   {
      $domains = Asq3Domain::orderBy('display_order')->get();

      return response()->json([
         'domains' => $domains,
      ]);
   }

   /**
    * Get all age intervals.
    */
   public function ageIntervals(): JsonResponse
   {
      $intervals = Asq3AgeInterval::orderBy('age_months')->get();

      return response()->json([
         'age_intervals' => $intervals,
      ]);
   }

   /**
    * Get questions for a specific age interval.
    */
   public function questions(Asq3AgeInterval $interval): JsonResponse
   {
      $questions = Asq3Question::with('domain')
         ->where('age_interval_id', $interval->id)
         ->orderBy('domain_id')
         ->orderBy('display_order')
         ->get()
         ->groupBy('domain.code');

      $cutoffs = Asq3CutoffScore::with('domain')
         ->where('age_interval_id', $interval->id)
         ->get()
         ->keyBy('domain.code');

      return response()->json([
         'age_interval' => $interval,
         'questions_by_domain' => $questions,
         'cutoffs' => $cutoffs,
         'total_questions' => Asq3Question::where('age_interval_id', $interval->id)->count(),
      ]);
   }

   /**
    * Get recommendations.
    */
   public function recommendations(Request $request): JsonResponse
   {
      $query = Asq3Recommendation::with(['domain', 'ageInterval']);

      if ($request->has('domain_id')) {
         $query->where('domain_id', $request->domain_id);
      }

      if ($request->has('age_interval_id')) {
         $query->where(function ($q) use ($request) {
            $q->where('age_interval_id', $request->age_interval_id)
               ->orWhereNull('age_interval_id');
         });
      }

      $recommendations = $query->orderBy('priority')->get();

      return response()->json([
         'recommendations' => $recommendations,
      ]);
   }

   /**
    * List screenings for a child.
    */
   public function index(Request $request, Child $child): JsonResponse
   {
      $this->authorizeChild($request, $child);

      $screenings = $child->asq3Screenings()
         ->with(['ageInterval', 'results.domain'])
         ->orderByDesc('screening_date')
         ->paginate($request->get('per_page', 20));

      return response()->json([
         'screenings' => Asq3ScreeningResource::collection($screenings),
         'pagination' => [
            'current_page' => $screenings->currentPage(),
            'last_page' => $screenings->lastPage(),
            'per_page' => $screenings->perPage(),
            'total' => $screenings->total(),
         ],
      ]);
   }

   /**
    * Start a new screening.
    */
   public function store(StartScreeningRequest $request, Child $child): JsonResponse
   {
      $this->authorizeChild($request, $child);

      // Calculate age
      $ageInDays = $child->age_in_days;
      $ageInMonths = $child->age_in_months;

      // Find appropriate age interval
      $ageInterval = Asq3AgeInterval::findByAgeDays($ageInDays);

      if (!$ageInterval) {
         return response()->json([
            'message' => 'Tidak ada kuesioner yang sesuai untuk usia anak',
         ], 422);
      }

      $screening = $child->asq3Screenings()->create([
         'age_interval_id' => $ageInterval->id,
         'screening_date' => $request->screening_date ?? today(),
         'age_at_screening_months' => $ageInMonths,
         'age_at_screening_days' => $ageInDays,
         'status' => 'in_progress',
         'notes' => $request->notes,
      ]);

      return response()->json([
         'message' => 'Screening baru berhasil dibuat',
         'screening' => new Asq3ScreeningResource($screening->load('ageInterval')),
      ], 201);
   }

   /**
    * Get screening detail.
    */
   public function show(Request $request, Child $child, Asq3Screening $screening): JsonResponse
   {
      $this->authorizeChild($request, $child);
      $this->authorizeScreening($child, $screening);

      $screening->load(['ageInterval', 'answers.question', 'results.domain']);

      return response()->json([
         'screening' => new Asq3ScreeningResource($screening),
      ]);
   }

   /**
    * Update screening.
    */
   public function update(Request $request, Child $child, Asq3Screening $screening): JsonResponse
   {
      $this->authorizeChild($request, $child);
      $this->authorizeScreening($child, $screening);

      if ($screening->status === 'completed') {
         return response()->json([
            'message' => 'Screening sudah selesai dan tidak dapat diubah',
         ], 422);
      }

      $request->validate([
         'notes' => 'sometimes|nullable|string',
         'status' => 'sometimes|in:in_progress,cancelled',
      ]);

      $screening->update($request->only(['notes', 'status']));

      return response()->json([
         'message' => 'Screening berhasil diperbarui',
         'screening' => new Asq3ScreeningResource($screening->fresh()->load('ageInterval')),
      ]);
   }

   /**
    * Submit answers for a screening.
    */
   public function submitAnswers(SubmitAnswersRequest $request, Child $child, Asq3Screening $screening): JsonResponse
   {
      $this->authorizeChild($request, $child);
      $this->authorizeScreening($child, $screening);

      if ($screening->status === 'completed') {
         return response()->json([
            'message' => 'Screening sudah selesai dan tidak dapat diubah',
         ], 422);
      }

      DB::transaction(function () use ($request, $screening) {
         foreach ($request->answers as $answerData) {
            $question = Asq3Question::findOrFail($answerData['question_id']);

            // Calculate score based on answer
            $score = $question->getScoreForAnswer($answerData['answer']);

            Asq3ScreeningAnswer::updateOrCreate(
               [
                  'screening_id' => $screening->id,
                  'question_id' => $question->id,
               ],
               [
                  'answer' => $answerData['answer'],
                  'score' => $score,
               ]
            );
         }

         // Check if all questions are answered
         $totalQuestions = Asq3Question::where('age_interval_id', $screening->age_interval_id)->count();
         $answeredQuestions = $screening->answers()->count();

         if ($answeredQuestions >= $totalQuestions) {
            $this->completeScreening($screening);
         }
      });

      return response()->json([
         'message' => 'Jawaban berhasil disimpan',
         'screening' => new Asq3ScreeningResource($screening->fresh()->load(['ageInterval', 'answers', 'results.domain'])),
      ]);
   }

   /**
    * Get screening results.
    */
   public function results(Request $request, Child $child, Asq3Screening $screening): JsonResponse
   {
      $this->authorizeChild($request, $child);
      $this->authorizeScreening($child, $screening);

      $screening->load(['ageInterval', 'results.domain']);

      $results = $screening->results->map(function ($result) {
         return [
            'domain' => [
               'code' => $result->domain->code,
               'name' => $result->domain->name,
               'color' => $result->domain->color,
            ],
            'total_score' => (float) $result->total_score,
            'cutoff_score' => (float) $result->cutoff_score,
            'monitoring_score' => (float) $result->monitoring_score,
            'status' => $result->status,
            'status_label' => $result->status_label,
         ];
      });

      // Get recommendations for domains that need attention
      $domainIdsNeedingAttention = $screening->results
         ->where('status', '!=', 'sesuai')
         ->pluck('domain_id');

      $recommendations = Asq3Recommendation::whereIn('domain_id', $domainIdsNeedingAttention)
         ->where(function ($q) use ($screening) {
            $q->where('age_interval_id', $screening->age_interval_id)
               ->orWhereNull('age_interval_id');
         })
         ->with('domain')
         ->orderBy('priority')
         ->get();

      return response()->json([
         'screening' => [
            'id' => $screening->id,
            'date' => $screening->screening_date,
            'age_at_screening' => $screening->age_at_screening_months,
            'status' => $screening->status,
            'overall_status' => $screening->overall_status,
         ],
         'results' => $results,
         'recommendations' => $recommendations,
      ]);
   }

   /**
    * Get screening progress for checkpoint/resume.
    */
   public function progress(Request $request, Child $child, Asq3Screening $screening): JsonResponse
   {
      $this->authorizeChild($request, $child);
      $this->authorizeScreening($child, $screening);

      $screening->load(['answers.question', 'ageInterval']);

      return response()->json([
         'data' => new Asq3ScreeningProgressResource($screening),
      ]);
   }

   /**
    * Complete screening and calculate results.
    */
   private function completeScreening(Asq3Screening $screening): void
   {
      $domains = Asq3Domain::all();
      $cutoffs = Asq3CutoffScore::where('age_interval_id', $screening->age_interval_id)
         ->get()
         ->keyBy('domain_id');

      $overallWorst = 'sesuai';

      foreach ($domains as $domain) {
         $domainScore = $screening->answers()
            ->whereHas('question', function ($q) use ($domain) {
               $q->where('domain_id', $domain->id);
            })
            ->sum('score');

         $cutoff = $cutoffs->get($domain->id);
         $cutoffScore = $cutoff?->cutoff_score ?? 0;
         $monitoringScore = $cutoff?->monitoring_score ?? 0;

         // Determine status
         if ($domainScore >= $monitoringScore) {
            $status = 'sesuai';
         } elseif ($domainScore >= $cutoffScore) {
            $status = 'pantau';
            if ($overallWorst === 'sesuai') {
               $overallWorst = 'pantau';
            }
         } else {
            $status = 'perlu_rujukan';
            $overallWorst = 'perlu_rujukan';
         }

         Asq3ScreeningResult::updateOrCreate(
            [
               'screening_id' => $screening->id,
               'domain_id' => $domain->id,
            ],
            [
               'total_score' => $domainScore,
               'cutoff_score' => $cutoffScore,
               'monitoring_score' => $monitoringScore,
               'status' => $status,
            ]
         );
      }

      $screening->update([
         'status' => 'completed',
         'completed_at' => now(),
         'overall_status' => $overallWorst,
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
    * Authorize that screening belongs to child.
    */
   private function authorizeScreening(Child $child, Asq3Screening $screening): void
   {
      if ($screening->child_id !== $child->id) {
         abort(404, 'Data screening tidak ditemukan');
      }
   }
}
