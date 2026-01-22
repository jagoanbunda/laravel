<?php

namespace App\Exports;

use App\Models\PmtLog;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PmtReportsExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    public function __construct(
        protected Request $request
    ) {}

    /**
     * @return Collection<int, PmtLog>
     */
    public function collection(): Collection
    {
        $query = PmtLog::query()
            ->with([
                'schedule.child.user',
                'schedule.menu',
                'schedule.program',
            ])
            ->join('pmt_schedules', 'pmt_logs.schedule_id', '=', 'pmt_schedules.id')
            ->select('pmt_logs.*');

        // Apply same filters as index
        if ($this->request->filled('date_from')) {
            $query->whereDate('pmt_logs.logged_at', '>=', $this->request->date_from);
        }
        if ($this->request->filled('date_to')) {
            $query->whereDate('pmt_logs.logged_at', '<=', $this->request->date_to);
        }
        if ($this->request->filled('program_id')) {
            $query->where('pmt_schedules.program_id', $this->request->program_id);
        }
        if ($this->request->filled('portion')) {
            $query->where('pmt_logs.portion', $this->request->portion);
        }
        if ($this->request->filled('search')) {
            $search = $this->request->search;
            $query->whereHas('schedule.child', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        return $query->orderBy('pmt_logs.logged_at', 'desc')->get();
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return [
            'No',
            'Nama Anak',
            'Nama Orang Tua',
            'Menu',
            'Tanggal Jadwal',
            'Porsi Dikonsumsi',
            'Persentase',
            'Catatan',
            'Tanggal Dicatat',
        ];
    }

    /**
     * @param  PmtLog  $log
     * @return array<int, mixed>
     */
    public function map($log): array
    {
        static $rowNumber = 0;
        $rowNumber++;

        return [
            $rowNumber,
            $log->schedule->child->name ?? '-',
            $log->schedule->child->user->name ?? '-',
            $log->schedule->menu->name ?? '-',
            $log->schedule->scheduled_date?->format('d/m/Y'),
            $log->portion_label,
            $log->portion_percentage.'%',
            $log->notes ?? '-',
            $log->logged_at?->format('d/m/Y H:i'),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'DEEBC5'],
                ],
            ],
        ];
    }
}
