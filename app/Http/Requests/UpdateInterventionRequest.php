<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInterventionRequest extends FormRequest
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
            'domain_id' => ['nullable', 'exists:asq3_domains,id'],
            'type' => ['sometimes', 'required', 'in:stimulation,referral,follow_up,counseling,other'],
            'action' => ['sometimes', 'required', 'string', 'max:5000'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'status' => ['sometimes', 'required', 'in:planned,in_progress,completed,cancelled'],
            'follow_up_date' => ['nullable', 'date'],
        ];
    }

    /**
     * Get custom error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'domain_id.exists' => 'Domain yang dipilih tidak valid.',
            'type.required' => 'Jenis intervensi harus dipilih.',
            'type.in' => 'Jenis intervensi tidak valid.',
            'action.required' => 'Tindakan harus diisi.',
            'action.max' => 'Tindakan tidak boleh lebih dari 5000 karakter.',
            'notes.max' => 'Catatan tidak boleh lebih dari 5000 karakter.',
            'status.required' => 'Status harus dipilih.',
            'status.in' => 'Status tidak valid.',
            'follow_up_date.date' => 'Format tanggal tindak lanjut tidak valid.',
        ];
    }
}
