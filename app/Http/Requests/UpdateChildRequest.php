<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'name' => 'required|string|max:255',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:male,female',
            'user_id' => 'required|exists:users,id',
            'birth_weight' => 'nullable|numeric|min:0|max:10',
            'birth_height' => 'nullable|numeric|min:0|max:100',
            'birth_head_circumference' => 'nullable|numeric|min:0|max:60',
            'blood_type' => 'nullable|in:A,B,AB,O',
            'allergy_notes' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
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
            'name.required' => 'Nama anak wajib diisi.',
            'date_of_birth.required' => 'Tanggal lahir wajib diisi.',
            'date_of_birth.before' => 'Tanggal lahir harus sebelum hari ini.',
            'gender.required' => 'Jenis kelamin wajib dipilih.',
            'gender.in' => 'Jenis kelamin harus male atau female.',
            'user_id.required' => 'Orang tua wajib dipilih.',
            'user_id.exists' => 'Orang tua tidak ditemukan.',
        ];
    }
}
