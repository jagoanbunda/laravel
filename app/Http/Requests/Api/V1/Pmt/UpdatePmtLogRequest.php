<?php

namespace App\Http\Requests\Api\V1\Pmt;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePmtLogRequest extends FormRequest
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
            'portion' => ['sometimes', Rule::in(['habis', 'half', 'quarter', 'none'])],
            'food_id' => ['nullable', 'integer', 'exists:foods,id'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png', 'max:2048'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'portion.in' => 'Porsi tidak valid (pilih: habis, half, quarter, none)',
            'photo.image' => 'File harus berupa gambar',
            'photo.mimes' => 'Format gambar harus jpeg, jpg, atau png',
            'photo.max' => 'Ukuran gambar maksimal 2MB',
            'food_id.exists' => 'Makanan tidak ditemukan',
        ];
    }
}
