<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreScreeningRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'child_id' => 'required|exists:children,id',
            'age_interval_id' => 'required|exists:asq3_age_intervals,id',
            'screening_date' => 'required|date',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'child_id.required' => 'Anak wajib dipilih.',
            'child_id.exists' => 'Anak tidak ditemukan.',
            'age_interval_id.required' => 'Interval usia wajib dipilih.',
            'age_interval_id.exists' => 'Interval usia tidak ditemukan.',
            'screening_date.required' => 'Tanggal screening wajib diisi.',
            'screening_date.date' => 'Tanggal screening harus berformat valid.',
        ];
    }
}
