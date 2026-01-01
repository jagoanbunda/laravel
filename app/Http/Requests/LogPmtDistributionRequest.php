<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LogPmtDistributionRequest extends FormRequest
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
            'portion' => 'required|in:habis,half,quarter,none',
            'logged_at' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
            'photo_url' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'portion.required' => 'Porsi yang dimakan wajib diisi',
            'portion.in' => 'Porsi harus salah satu dari: Habis, Setengah, Seperempat, Tidak Dimakan',
            'notes.max' => 'Catatan maksimal 500 karakter',
        ];
    }
}
