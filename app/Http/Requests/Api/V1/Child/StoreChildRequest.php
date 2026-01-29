<?php

namespace App\Http\Requests\Api\V1\Child;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreChildRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'birthday' => ['required', 'date', 'before_or_equal:today'],
            'gender' => ['required', Rule::in(['male', 'female', 'other'])],
            'avatar_url' => ['nullable', 'url', 'max:500'],
            'avatar' => ['sometimes', 'nullable', 'image', 'mimes:jpeg,jpg,png', 'max:2048'],
            'birth_weight' => ['nullable', 'numeric', 'min:0.5', 'max:10'],
            'birth_height' => ['nullable', 'numeric', 'min:20', 'max:70'],
            'head_circumference' => ['nullable', 'numeric', 'min:20', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama anak wajib diisi',
            'birthday.required' => 'Tanggal lahir wajib diisi',
            'birthday.before_or_equal' => 'Tanggal lahir tidak boleh di masa depan',
            'gender.required' => 'Jenis kelamin wajib dipilih',
            'gender.in' => 'Jenis kelamin tidak valid',
            'birth_weight.min' => 'Berat lahir minimal 0.5 kg',
            'birth_weight.max' => 'Berat lahir maksimal 10 kg',
            'birth_height.min' => 'Panjang lahir minimal 20 cm',
            'birth_height.max' => 'Panjang lahir maksimal 70 cm',
            'avatar.image' => 'File harus berupa gambar',
            'avatar.mimes' => 'Format gambar harus jpeg, jpg, atau png',
            'avatar.max' => 'Ukuran gambar maksimal 2MB',
        ];
    }
}
