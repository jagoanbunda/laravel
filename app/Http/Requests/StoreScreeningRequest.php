<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreScreeningRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'child_id' => ['required', 'integer', 'exists:children,id'],
            'age_interval_id' => ['required', 'integer', 'exists:asq3_age_intervals,id'],
            'screening_date' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'child_id.required' => 'Pilih anak terlebih dahulu.',
            'age_interval_id.required' => 'Pilih interval usia.',
            'screening_date.required' => 'Tanggal screening wajib diisi.',
        ];
    }
}
