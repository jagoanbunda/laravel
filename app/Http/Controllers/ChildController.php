<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChildRequest;
use App\Http\Requests\UpdateChildRequest;
use App\Models\AnthropometryMeasurement;
use App\Models\Asq3Recommendation;
use App\Models\Asq3Screening;
use App\Models\Child;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChildController extends Controller
{
    /**
     * Display a listing of children.
     */
    public function index(Request $request): Response
    {
        $query = Child::with('user');

        // Search by child name or parent name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by gender
        if ($request->filled('gender') && $request->gender !== 'all') {
            $query->where('gender', $request->gender);
        }

        // Filter by active status
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Order by created_at descending
        $query->orderBy('created_at', 'desc');

        $children = $query->paginate(15)->through(function ($child) {
            return [
                'id' => $child->id,
                'name' => $child->name,
                'date_of_birth' => $child->birthday,
                'gender' => $child->gender,
                'parent_name' => $child->user->name,
                'parent_email' => $child->user->email,
                'is_active' => $child->is_active,
                'created_at' => $child->created_at,
            ];
        });

        return Inertia::render('children/index', [
            'children' => $children,
            'filters' => [
                'search' => $request->search,
                'gender' => $request->gender ?? 'all',
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new child.
     */
    public function create(Request $request): Response
    {
        $parents = User::orderBy('name')
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
            ]);

        return Inertia::render('children/create', [
            'parents' => $parents,
            'selected_parent_id' => $request->parent_id,
        ]);
    }

    /**
     * Store a newly created child in storage.
     */
    public function store(StoreChildRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['birthday'] = $data['date_of_birth'];
        $data['head_circumference'] = $data['birth_head_circumference'] ?? 0;
        unset($data['date_of_birth'], $data['birth_head_circumference']);

        Child::create($data);

        return redirect()->route('children.index')->with('success', 'Child created successfully');
    }

    /**
     * Display the specified child with all related data.
     */
    public function show(Request $request, string $id): Response
    {
        $child = Child::with([
            'user',
            'foodLogs' => function ($query) {
                $query->with('items.food')->orderBy('log_date', 'desc')->limit(10);
            },
            'pmtSchedules' => function ($query) {
                $query->with(['log.food'])->orderBy('scheduled_date', 'desc')->limit(10);
            },
            'pmtPrograms' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
            'asq3Screenings' => function ($query) {
                $query->with(['ageInterval', 'domainResults.domain', 'interventions.domain'])
                    ->where('status', 'completed')
                    ->orderBy('screening_date', 'desc')
                    ->limit(10);
            },
        ])->findOrFail($id);

        $growthData = $this->getGrowthData($child, $request);
        $pmtStatus = $this->calculatePmtStatus($child);
        $screeningsData = $this->formatScreeningsForTab($child);

        return Inertia::render('children/show', [
            'child' => [
                'id' => $child->id,
                'name' => $child->name,
                'date_of_birth' => $child->birthday,
                'gender' => $child->gender,
                'avatar_url' => $child->avatar_url,
                'birth_weight' => $child->birth_weight,
                'birth_height' => $child->birth_height,
                'birth_head_circumference' => $child->head_circumference,
                'blood_type' => $child->blood_type ?? null,
                'allergy_notes' => $child->allergy_notes ?? null,
                'is_active' => $child->is_active,
                'parent' => [
                    'id' => $child->user->id,
                    'name' => $child->user->name,
                    'email' => $child->user->email,
                    'phone' => $child->user->phone,
                ],
                'growth_data' => $growthData,
                'food_logs' => $child->foodLogs->map(fn ($log) => [
                    'id' => $log->id,
                    'log_date' => $log->log_date,
                    'meal_time' => $log->meal_time,
                    'total_calories' => $log->total_calories,
                    'total_protein' => $log->total_protein,
                    'total_fat' => $log->total_fat,
                    'total_carbohydrate' => $log->total_carbohydrate,
                    'notes' => $log->notes,
                    'items' => $log->items->map(fn ($item) => [
                        'id' => $item->id,
                        'food_name' => $item->food?->name,
                        'quantity' => $item->quantity,
                        'serving_size' => $item->serving_size,
                        'calories' => $item->calories,
                        'protein' => $item->protein,
                    ]),
                ]),
                'pmt_schedules' => $child->pmtSchedules->map(fn ($schedule) => [
                    'id' => $schedule->id,
                    'food_name' => $schedule->log?->food?->name,
                    'scheduled_date' => $schedule->scheduled_date,
                    'portion' => $schedule->log?->portion,
                    'portion_label' => $schedule->log?->portion_label,
                    'logged_at' => $schedule->log?->logged_at,
                    'photo_url' => $schedule->log?->photo_url,
                    'notes' => $schedule->log?->notes,
                ]),
                'screenings' => $screeningsData,
                'pmt_status' => $pmtStatus,
            ],
            'growth_filters' => [
                'date_range' => $request->input('growth_range', '6M'),
                'chart_type' => $request->input('chart_type', 'waz'),
            ],
        ]);
    }

    /**
     * Get growth data for a child: chart data (all) and table data (paginated).
     *
     * @return array{chart_data: array<int, array<string, mixed>>, table_data: array<int, array<string, mixed>>, pagination: array<string, mixed>}
     */
    private function getGrowthData(Child $child, Request $request): array
    {
        $dateRange = $request->input('growth_range', '6M');
        $page = (int) $request->input('growth_page', 1);
        $perPage = 5;
        $birthday = $child->birthday;

        $fromDate = match ($dateRange) {
            '3M' => now()->subMonths(3),
            '6M' => now()->subMonths(6),
            '1Y' => now()->subYear(),
            default => null,
        };

        $baseQuery = $child->anthropometryMeasurements();
        if ($fromDate !== null) {
            $baseQuery->where('measurement_date', '>=', $fromDate);
        }

        $allMeasurements = (clone $baseQuery)
            ->orderBy('measurement_date', 'asc')
            ->get();

        $chartData = $allMeasurements->map(fn ($m) => $this->formatMeasurement($m, $birthday))->values()->all();

        $paginated = (clone $baseQuery)
            ->orderBy('measurement_date', 'desc')
            ->paginate($perPage, ['*'], 'growth_page', $page);

        $tableData = $paginated->getCollection()
            ->map(fn ($m) => $this->formatMeasurement($m, $birthday))
            ->values()
            ->all();

        return [
            'chart_data' => $chartData,
            'table_data' => $tableData,
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'from' => $paginated->firstItem(),
                'to' => $paginated->lastItem(),
            ],
        ];
    }

    /**
     * Format a measurement record for API response.
     *
     * @return array<string, mixed>
     */
    private function formatMeasurement(AnthropometryMeasurement $m, ?\Carbon\Carbon $birthday): array
    {
        $ageInMonths = $birthday ? $birthday->diffInMonths($m->measurement_date) : null;

        return [
            'id' => $m->id,
            'measurement_date' => $m->measurement_date?->format('Y-m-d'),
            'age_in_months' => $ageInMonths,
            'age_label' => $this->formatAgeLabel($ageInMonths),
            'weight' => (float) $m->weight,
            'height' => (float) $m->height,
            'head_circumference' => (float) $m->head_circumference,
            'is_lying' => $m->is_lying,
            'measurement_location' => $m->measurement_location,
            'weight_for_age_zscore' => (float) $m->weight_for_age_zscore,
            'height_for_age_zscore' => (float) $m->height_for_age_zscore,
            'weight_for_height_zscore' => (float) $m->weight_for_height_zscore,
            'bmi_for_age_zscore' => (float) $m->bmi_for_age_zscore,
            'nutritional_status' => $m->nutritional_status,
            'stunting_status' => $m->stunting_status,
            'wasting_status' => $m->wasting_status,
        ];
    }

    /**
     * Format age in months to a human-readable label.
     */
    private function formatAgeLabel(?int $ageInMonths): string
    {
        if ($ageInMonths === null) {
            return '-';
        }

        if ($ageInMonths < 1) {
            return 'Baru Lahir';
        }

        if ($ageInMonths < 12) {
            return $ageInMonths.' Bulan';
        }

        $years = intdiv($ageInMonths, 12);
        $months = $ageInMonths % 12;

        if ($months === 0) {
            return $years.' Tahun';
        }

        return $years.' Tahun '.$months.' Bulan';
    }

    /**
     * Calculate PMT status for a child based on WHO guidelines.
     *
     * @return array{status: string, latest_nutritional_status: ?string, latest_stunting_status: ?string, latest_wasting_status: ?string, has_active_program: bool, has_historical_programs: bool, message: string}
     */
    private function calculatePmtStatus(Child $child): array
    {
        $latestMeasurement = $child->anthropometryMeasurements()
            ->orderBy('measurement_date', 'desc')
            ->first();

        $activeProgram = $child->pmtPrograms()->where('status', 'active')->first();
        $hasHistoricalPrograms = $child->pmtPrograms()
            ->whereIn('status', ['completed', 'discontinued'])
            ->exists();

        $nutritionalStatus = $latestMeasurement?->nutritional_status;
        $stuntingStatus = $latestMeasurement?->stunting_status;
        $wastingStatus = $latestMeasurement?->wasting_status;

        if ($latestMeasurement === null) {
            return [
                'status' => 'no_data',
                'latest_nutritional_status' => null,
                'latest_stunting_status' => null,
                'latest_wasting_status' => null,
                'has_active_program' => false,
                'has_historical_programs' => $hasHistoricalPrograms,
                'message' => 'Belum ada data pengukuran. Silakan lakukan pengukuran antropometri terlebih dahulu.',
            ];
        }

        if ($activeProgram !== null) {
            return [
                'status' => 'active',
                'latest_nutritional_status' => $nutritionalStatus,
                'latest_stunting_status' => $stuntingStatus,
                'latest_wasting_status' => $wastingStatus,
                'has_active_program' => true,
                'has_historical_programs' => $hasHistoricalPrograms,
                'message' => 'Anak sedang mengikuti program PMT.',
            ];
        }

        $needsPmt = $this->childNeedsPmt($nutritionalStatus, $stuntingStatus, $wastingStatus);

        if ($needsPmt) {
            return [
                'status' => 'needs_enrollment',
                'latest_nutritional_status' => $nutritionalStatus,
                'latest_stunting_status' => $stuntingStatus,
                'latest_wasting_status' => $wastingStatus,
                'has_active_program' => false,
                'has_historical_programs' => $hasHistoricalPrograms,
                'message' => 'Berdasarkan hasil pengukuran terakhir, anak ini memerlukan Program Makanan Tambahan (PMT).',
            ];
        }

        return [
            'status' => 'healthy',
            'latest_nutritional_status' => $nutritionalStatus,
            'latest_stunting_status' => $stuntingStatus,
            'latest_wasting_status' => $wastingStatus,
            'has_active_program' => false,
            'has_historical_programs' => $hasHistoricalPrograms,
            'message' => 'Anak ini memiliki status gizi yang baik dan tidak memerlukan Program Makanan Tambahan (PMT) saat ini.',
        ];
    }

    /**
     * Determine if a child needs PMT based on WHO guidelines.
     *
     * PMT is needed when child has:
     * - Stunting: stunted or severely_stunted
     * - Wasting: wasted or severely_wasted
     * - Underweight: underweight or severely_underweight
     */
    private function childNeedsPmt(?string $nutritionalStatus, ?string $stuntingStatus, ?string $wastingStatus): bool
    {
        $concerningNutritionalStatuses = ['underweight', 'severely_underweight'];
        $concerningStuntingStatuses = ['stunted', 'severely_stunted'];
        $concerningWastingStatuses = ['wasted', 'severely_wasted'];

        if (in_array($nutritionalStatus, $concerningNutritionalStatuses, true)) {
            return true;
        }

        if (in_array($stuntingStatus, $concerningStuntingStatuses, true)) {
            return true;
        }

        if (in_array($wastingStatus, $concerningWastingStatuses, true)) {
            return true;
        }

        return false;
    }

    /**
     * Format screening data for the Screenings tab.
     *
     * @return array{latestScreening: array<string, mixed>|null, screeningHistory: array<int, array<string, mixed>>}
     */
    private function formatScreeningsForTab(Child $child): array
    {
        $screenings = $child->asq3Screenings;

        if ($screenings->isEmpty()) {
            return [
                'latestScreening' => null,
                'screeningHistory' => [],
            ];
        }

        $latest = $screenings->first();

        return [
            'latestScreening' => $this->formatScreeningDetail($latest),
            'screeningHistory' => $screenings->skip(1)->map(fn ($s) => [
                'id' => $s->id,
                'screening_date' => $s->screening_date?->format('Y-m-d'),
                'age_at_screening_months' => $s->age_at_screening_months,
                'total_score' => $s->domainResults->sum('total_score'),
                'overall_status' => $s->overall_status,
            ])->values()->all(),
        ];
    }

    /**
     * Format a single screening with full detail.
     *
     * @return array<string, mixed>
     */
    private function formatScreeningDetail(Asq3Screening $screening): array
    {
        $domainResults = $screening->domainResults->map(fn ($result) => [
            'id' => $result->id,
            'domain_code' => $result->domain->code,
            'domain_name' => $result->domain->name,
            'total_score' => (float) $result->total_score,
            'cutoff_score' => (float) $result->cutoff_score,
            'monitoring_score' => (float) $result->monitoring_score,
            'max_score' => 60,
            'status' => $result->status,
        ])->values()->all();

        $recommendations = $this->getRecommendationsForScreening($screening);

        $interventions = $screening->interventions->map(fn ($intervention) => [
            'id' => $intervention->id,
            'type' => $intervention->type,
            'type_label' => $intervention->type_label,
            'action' => $intervention->action,
            'notes' => $intervention->notes,
            'status' => $intervention->status,
            'status_label' => $intervention->status_label,
            'follow_up_date' => $intervention->follow_up_date?->format('Y-m-d'),
            'completed_at' => $intervention->completed_at?->format('Y-m-d H:i:s'),
            'domain_code' => $intervention->domain?->code,
        ])->values()->all();

        $totalScore = $screening->domainResults->sum('total_score');
        $maxScore = 60 * 5;

        $nextScreeningDate = $screening->screening_date?->addMonths(3);
        $daysUntilNext = $nextScreeningDate ? now()->diffInDays($nextScreeningDate, false) : null;

        return [
            'id' => $screening->id,
            'child_id' => $screening->child_id,
            'age_interval_id' => $screening->age_interval_id,
            'screening_date' => $screening->screening_date?->format('Y-m-d'),
            'age_at_screening_months' => $screening->age_at_screening_months,
            'age_at_screening_days' => $screening->age_at_screening_days,
            'age_interval_label' => $screening->ageInterval->age_label,
            'status' => $screening->status,
            'overall_status' => $screening->overall_status,
            'total_score' => $totalScore,
            'max_score' => $maxScore,
            'domain_results' => $domainResults,
            'recommendations' => $recommendations,
            'interventions' => $interventions,
            'next_screening_date' => $nextScreeningDate?->format('Y-m-d'),
            'days_until_next' => $daysUntilNext > 0 ? (int) $daysUntilNext : null,
        ];
    }

    /**
     * Get recommendations for a screening based on age interval and domain results.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getRecommendationsForScreening(Asq3Screening $screening): array
    {
        $recommendations = [];

        foreach ($screening->domainResults as $result) {
            if ($result->status === 'sesuai') {
                continue;
            }

            $domainRecs = Asq3Recommendation::query()
                ->where('domain_id', $result->domain_id)
                ->where(function ($q) use ($screening) {
                    $q->where('age_interval_id', $screening->age_interval_id)
                        ->orWhereNull('age_interval_id');
                })
                ->orderBy('priority')
                ->limit(2)
                ->get();

            foreach ($domainRecs as $rec) {
                $recommendations[] = [
                    'id' => $rec->id,
                    'domain_id' => $rec->domain_id,
                    'domain_code' => $result->domain->code,
                    'title' => $result->domain->name,
                    'recommendation_text' => $rec->recommendation_text,
                    'priority' => $rec->priority,
                ];
            }
        }

        return $recommendations;
    }

    /**
     * Show the form for editing the specified child.
     */
    public function edit(string $id): Response
    {
        $child = Child::with('user')->findOrFail($id);

        $parents = User::orderBy('name')
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
            ]);

        return Inertia::render('children/edit', [
            'child' => [
                'id' => $child->id,
                'name' => $child->name,
                'date_of_birth' => $child->birthday?->format('Y-m-d'),
                'gender' => $child->gender,
                'user_id' => $child->user_id,
                'birth_weight' => $child->birth_weight,
                'birth_height' => $child->birth_height,
                'birth_head_circumference' => $child->head_circumference,
                'blood_type' => $child->blood_type ?? null,
                'allergy_notes' => $child->allergy_notes ?? null,
                'is_active' => $child->is_active,
            ],
            'parents' => $parents,
        ]);
    }

    /**
     * Update the specified child in storage.
     */
    public function update(UpdateChildRequest $request, string $id): RedirectResponse
    {
        $child = Child::findOrFail($id);

        $data = $request->validated();
        if (isset($data['date_of_birth'])) {
            $data['birthday'] = $data['date_of_birth'];
            unset($data['date_of_birth']);
        }
        if (isset($data['birth_head_circumference'])) {
            $data['head_circumference'] = $data['birth_head_circumference'];
            unset($data['birth_head_circumference']);
        }

        $child->update($data);

        return redirect()->route('children.index')->with('success', 'Child updated successfully');
    }

    /**
     * Remove the specified child from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $child = Child::findOrFail($id);
        $child->delete();

        return redirect()->route('children.index')->with('success', 'Child deleted successfully');
    }
}
