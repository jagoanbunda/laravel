<?php

namespace App\Http\Requests\Api\V1\Food;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFoodLogRequest extends FormRequest
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
            'log_date' => ['sometimes', 'date'],
            'meal_time' => ['sometimes', Rule::in(['breakfast', 'lunch', 'dinner', 'snack'])],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.food_id' => ['required_with:items', 'exists:foods,id'],
            'items.*.quantity' => ['required_with:items', 'numeric', 'min:0.1', 'max:100'],
            'items.*.serving_size' => ['nullable', 'numeric', 'min:1'],
        ];
    }
}
