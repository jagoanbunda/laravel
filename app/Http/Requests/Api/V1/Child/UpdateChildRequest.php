<?php

namespace App\Http\Requests\Api\V1\Child;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateChildRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'max:255'],
            'birthday' => ['sometimes', 'date', 'before_or_equal:today'],
            'gender' => ['sometimes', Rule::in(['male', 'female', 'other'])],
            'avatar_url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'avatar' => ['sometimes', 'nullable', 'image', 'mimes:jpeg,jpg,png', 'max:2048'],
            'birth_weight' => ['sometimes', 'nullable', 'numeric', 'min:0.5', 'max:10'],
            'birth_height' => ['sometimes', 'nullable', 'numeric', 'min:20', 'max:70'],
            'head_circumference' => ['sometimes', 'nullable', 'numeric', 'min:20', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
