<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInterventionRequest;
use App\Http\Requests\UpdateInterventionRequest;
use App\Models\Asq3Domain;
use App\Models\Asq3Screening;
use App\Models\Asq3ScreeningIntervention;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScreeningInterventionController extends Controller
{
    /**
     * Display a listing of interventions for a screening.
     */
    public function index(Request $request, Asq3Screening $screening): Response
    {
        $interventions = $screening->interventions()
            ->with(['domain', 'creator'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($intervention) => $this->transformIntervention($intervention));

        return Inertia::render('screenings/interventions/index', [
            'screening' => $this->getScreeningData($screening),
            'interventions' => $interventions,
        ]);
    }

    /**
     * Show the form for creating a new intervention.
     */
    public function create(Asq3Screening $screening): Response
    {
        $domains = Asq3Domain::orderBy('display_order')->get();

        return Inertia::render('screenings/interventions/create', [
            'screening' => $this->getScreeningData($screening),
            'domains' => $domains,
            'typeOptions' => $this->getTypeOptions(),
            'statusOptions' => $this->getStatusOptions(),
        ]);
    }

    /**
     * Store a newly created intervention.
     */
    public function store(StoreInterventionRequest $request, Asq3Screening $screening): RedirectResponse
    {
        $data = $request->validated();
        $data['screening_id'] = $screening->id;
        $data['created_by'] = $request->user()?->id;

        if ($data['status'] === 'completed') {
            $data['completed_at'] = now();
        }

        Asq3ScreeningIntervention::create($data);

        return redirect()
            ->route('screenings.results', $screening->id)
            ->with('success', 'Intervensi berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified intervention.
     */
    public function edit(Asq3Screening $screening, Asq3ScreeningIntervention $intervention): Response
    {
        $this->authorizeIntervention($screening, $intervention);

        $domains = Asq3Domain::orderBy('display_order')->get();

        return Inertia::render('screenings/interventions/edit', [
            'screening' => $this->getScreeningData($screening),
            'intervention' => $this->transformIntervention($intervention),
            'domains' => $domains,
            'typeOptions' => $this->getTypeOptions(),
            'statusOptions' => $this->getStatusOptions(),
        ]);
    }

    /**
     * Update the specified intervention.
     */
    public function update(UpdateInterventionRequest $request, Asq3Screening $screening, Asq3ScreeningIntervention $intervention): RedirectResponse
    {
        $this->authorizeIntervention($screening, $intervention);

        $data = $request->validated();

        // Handle completion
        if (isset($data['status']) && $data['status'] === 'completed' && $intervention->status !== 'completed') {
            $data['completed_at'] = now();
        } elseif (isset($data['status']) && $data['status'] !== 'completed') {
            $data['completed_at'] = null;
        }

        $intervention->update($data);

        return redirect()
            ->route('screenings.results', $screening->id)
            ->with('success', 'Intervensi berhasil diperbarui');
    }

    /**
     * Remove the specified intervention.
     */
    public function destroy(Asq3Screening $screening, Asq3ScreeningIntervention $intervention): RedirectResponse
    {
        $this->authorizeIntervention($screening, $intervention);

        $intervention->delete();

        return redirect()
            ->route('screenings.results', $screening->id)
            ->with('success', 'Intervensi berhasil dihapus');
    }

    /**
     * Mark an intervention as completed.
     */
    public function complete(Asq3Screening $screening, Asq3ScreeningIntervention $intervention): RedirectResponse
    {
        $this->authorizeIntervention($screening, $intervention);

        $intervention->markAsCompleted();

        return redirect()
            ->route('screenings.results', $screening->id)
            ->with('success', 'Intervensi telah ditandai selesai');
    }

    /**
     * Transform intervention for frontend.
     *
     * @return array<string, mixed>
     */
    private function transformIntervention(Asq3ScreeningIntervention $intervention): array
    {
        return [
            'id' => $intervention->id,
            'screening_id' => $intervention->screening_id,
            'domain_id' => $intervention->domain_id,
            'domain_name' => $intervention->domain?->name,
            'domain_code' => $intervention->domain?->code,
            'type' => $intervention->type,
            'type_label' => $intervention->type_label,
            'action' => $intervention->action,
            'notes' => $intervention->notes,
            'status' => $intervention->status,
            'status_label' => $intervention->status_label,
            'follow_up_date' => $intervention->follow_up_date?->format('Y-m-d'),
            'completed_at' => $intervention->completed_at?->format('Y-m-d H:i'),
            'created_by' => $intervention->creator?->name,
            'created_at' => $intervention->created_at->format('Y-m-d H:i'),
        ];
    }

    /**
     * Get screening data for frontend.
     *
     * @return array<string, mixed>
     */
    private function getScreeningData(Asq3Screening $screening): array
    {
        $screening->load(['child.user', 'ageInterval']);

        return [
            'id' => $screening->id,
            'child_name' => $screening->child->name,
            'parent_name' => $screening->child->user->name,
            'screening_date' => $screening->screening_date->format('Y-m-d'),
            'age_interval' => $screening->ageInterval->age_label,
            'overall_status' => $screening->overall_status,
        ];
    }

    /**
     * Get intervention type options.
     *
     * @return array<array{value: string, label: string}>
     */
    private function getTypeOptions(): array
    {
        return [
            ['value' => 'stimulation', 'label' => 'Stimulasi'],
            ['value' => 'referral', 'label' => 'Rujukan'],
            ['value' => 'follow_up', 'label' => 'Tindak Lanjut'],
            ['value' => 'counseling', 'label' => 'Konseling'],
            ['value' => 'other', 'label' => 'Lainnya'],
        ];
    }

    /**
     * Get intervention status options.
     *
     * @return array<array{value: string, label: string}>
     */
    private function getStatusOptions(): array
    {
        return [
            ['value' => 'planned', 'label' => 'Direncanakan'],
            ['value' => 'in_progress', 'label' => 'Sedang Berjalan'],
            ['value' => 'completed', 'label' => 'Selesai'],
            ['value' => 'cancelled', 'label' => 'Dibatalkan'],
        ];
    }

    /**
     * Ensure intervention belongs to screening.
     */
    private function authorizeIntervention(Asq3Screening $screening, Asq3ScreeningIntervention $intervention): void
    {
        if ($intervention->screening_id !== $screening->id) {
            abort(404, 'Intervensi tidak ditemukan');
        }
    }
}
