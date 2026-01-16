<?php

namespace App\Http\Requests\Api\V1\Food;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFoodLogRequest extends FormRequest
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
            'log_date' => ['required', 'date'],
            'meal_time' => ['required', Rule::in(['breakfast', 'lunch', 'dinner', 'snack'])],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.food_id' => ['required', 'exists:foods,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.1', 'max:100'],
            'items.*.serving_size' => ['nullable', 'numeric', 'min:1'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'log_date.required' => 'Tanggal log wajib diisi',
            'meal_time.required' => 'Waktu makan wajib dipilih',
            'meal_time.in' => 'Waktu makan tidak valid',
            'items.required' => 'Minimal satu item makanan harus ditambahkan',
            'items.min' => 'Minimal satu item makanan harus ditambahkan',
            'items.*.food_id.required' => 'ID makanan wajib diisi',
            'items.*.food_id.exists' => 'Makanan tidak ditemukan',
            'items.*.quantity.required' => 'Jumlah porsi wajib diisi',
            'items.*.quantity.min' => 'Jumlah porsi minimal 0.1',
        ];
    }
}
