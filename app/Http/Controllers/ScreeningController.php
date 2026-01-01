<?php

namespace App\Http\Controllers;

use App\Models\Asq3Screening;
use App\Models\Child;
use App\Http\Requests\StoreScreeningRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScreeningController extends Controller
{
    /**
     * Display a listing of screenings.
     */
    public function index(Request $request)
    {
        $query = Asq3Screening::with(['child.user', 'ageInterval']);

        // Search by child name or parent name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('child', function ($childQuery) use ($search) {
                $childQuery->where('name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('full_name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by overall result
        if ($request->filled('result') && $request->result !== 'all') {
            $query->where('overall_status', $request->result);
        }

        // Order by screening_date descending
        $query->orderBy('screening_date', 'desc');

        $screenings = $query->paginate(15)->through(function ($screening) {
            return [
                'id' => $screening->id,
                'child_id' => $screening->child_id,
                'child_name' => $screening->child->name,
                'parent_name' => $screening->child->user->full_name,
                'screening_date' => $screening->screening_date,
                'age_at_screening_months' => $screening->age_at_screening_months,
                'age_interval' => $screening->ageInterval->age_label,
                'status' => $screening->status,
                'overall_status' => $screening->overall_status,
                'completed_at' => $screening->completed_at,
            ];
        });

        return Inertia::render('screenings/index', [
            'screenings' => $screenings,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status ?? 'all',
                'result' => $request->result ?? 'all',
            ],
        ]);
    }

    /**
     * Display detailed screening results.
     */
    public function show($id)
    {
        $screening = Asq3Screening::with([
            'child.user',
            'ageInterval',
            'domainResults.domain',
            'answers.question',
        ])->findOrFail($id);

        // Transform domain results
        $domainResults = $screening->domainResults->map(function ($result) {
            return [
                'domain_id' => $result->domain_id,
                'domain_name' => $result->domain->name,
                'domain_code' => $result->domain->code,
                'domain_color' => $result->domain->color,
                'total_score' => $result->total_score,
                'cutoff_score' => $result->cutoff_score,
                'monitoring_score' => $result->monitoring_score,
                'status' => $result->status,
            ];
        });

        $screeningData = [
            'id' => $screening->id,
            'child' => [
                'id' => $screening->child->id,
                'name' => $screening->child->name,
                'date_of_birth' => $screening->child->date_of_birth,
                'gender' => $screening->child->gender,
            ],
            'parent' => [
                'name' => $screening->child->user->full_name,
                'email' => $screening->child->user->email,
            ],
            'screening_date' => $screening->screening_date,
            'age_at_screening_months' => $screening->age_at_screening_months,
            'age_interval' => $screening->ageInterval->age_label,
            'status' => $screening->status,
            'overall_status' => $screening->overall_status,
            'completed_at' => $screening->completed_at,
            'domain_results' => $domainResults,
        ];

        return Inertia::render('screenings/results', [
            'screening' => $screeningData,
        ]);
    }

    /**
     * Store a new screening.
     */
    public function store(StoreScreeningRequest $request)
    {
        $child = Child::findOrFail($request->child_id);

        Asq3Screening::create([
            'child_id' => $request->child_id,
            'age_interval_id' => $request->age_interval_id,
            'screening_date' => $request->screening_date,
            'age_at_screening_months' => $child->age_in_months,
            'status' => 'in_progress',
        ]);

        return redirect()->route('screenings.index')->with('success', 'Screening berhasil dijadwalkan.');
    }

    /**
     * Remove the specified screening.
     */
    public function destroy($id)
    {
        $screening = Asq3Screening::findOrFail($id);
        $screening->delete();

        return redirect()->route('screenings.index')->with('success', 'Screening berhasil dihapus');
    }
}
