<?php

namespace App\Http\Requests;

use App\Models\PmtProgram;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePmtProgramRequest extends FormRequest
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
            'start_date' => 'required|date|after_or_equal:today',
            'duration_days' => 'required|integer|in:90,120',
            'notes' => 'nullable|string|max:1000',
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
            'child_id.required' => 'Anak wajib dipilih.',
            'child_id.exists' => 'Anak tidak ditemukan.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.after_or_equal' => 'Tanggal mulai harus hari ini atau setelahnya.',
            'duration_days.required' => 'Durasi program wajib dipilih.',
            'duration_days.in' => 'Durasi program harus 90 atau 120 hari.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            // Check if child already has an active program
            $hasActiveProgram = PmtProgram::where('child_id', $this->child_id)
                ->where('status', 'active')
                ->exists();

            if ($hasActiveProgram) {
                $validator->errors()->add(
                    'child_id',
                    'Anak ini sudah memiliki program PMT aktif.'
                );
            }
        });
    }
}
