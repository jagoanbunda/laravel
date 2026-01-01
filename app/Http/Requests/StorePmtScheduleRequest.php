<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePmtScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'child_id' => ['required', 'integer', 'exists:children,id'],
            'menu_id' => ['required', 'integer', 'exists:pmt_menus,id'],
            'scheduled_date' => ['required', 'date', 'after_or_equal:today'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'child_id.required' => 'Pilih anak terlebih dahulu.',
            'menu_id.required' => 'Pilih menu PMT terlebih dahulu.',
            'scheduled_date.required' => 'Tanggal jadwal wajib diisi.',
            'scheduled_date.after_or_equal' => 'Tanggal tidak boleh di masa lalu.',
        ];
    }
}
