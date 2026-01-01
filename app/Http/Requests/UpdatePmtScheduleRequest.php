<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePmtScheduleRequest extends FormRequest
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
            'menu_id' => 'required|exists:pmt_menus,id',
            'scheduled_date' => 'required|date',
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
            'menu_id.required' => 'Menu PMT wajib dipilih.',
            'menu_id.exists' => 'Menu PMT tidak ditemukan.',
            'scheduled_date.required' => 'Tanggal jadwal wajib diisi.',
            'scheduled_date.date' => 'Tanggal jadwal harus berformat valid.',
        ];
    }
}
