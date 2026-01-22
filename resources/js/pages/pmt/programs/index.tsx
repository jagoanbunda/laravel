import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginationNav } from '@/components/ui/pagination-nav';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Search, Plus, Eye, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';

interface PmtProgramListItem {
    id: number;
    child_id: number;
    child_name: string;
    parent_name: string;
    start_date: string;
    end_date: string;
    duration_days: 90 | 120;
    status: 'active' | 'completed' | 'discontinued';
    progress_percentage: number;
    days_remaining: number;
    created_at: string;
}

interface Props {
    programs: {
        data: PmtProgramListItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

const statusFilters = [
    { label: 'Semua', value: 'all' },
    { label: 'Aktif', value: 'active' },
    { label: 'Selesai', value: 'completed' },
    { label: 'Dihentikan', value: 'discontinued' },
];

function getStatusVariant(status: string) {
    switch (status) {
        case 'active': return 'active';
        case 'completed': return 'success';
        case 'discontinued': return 'danger';
        default: return 'neutral';
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'active': return 'Aktif';
        case 'completed': return 'Selesai';
        case 'discontinued': return 'Dihentikan';
        default: return status;
    }
}

export default function PmtProgramsIndex({ programs, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeFilter, setActiveFilter] = useState(filters.status || 'all');

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        router.get('/pmt/programs', { ...filters, search: value, status: activeFilter }, { preserveState: true, replace: true });
    };

    const handleFilterChange = (value: string) => {
        setActiveFilter(value);
        router.get('/pmt/programs', { ...filters, search: searchQuery, status: value }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout>
            <Head title="Program PMT" />

            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Program PMT</h1>
                        <p className="text-muted-foreground mt-1">
                            Kelola program Pemberian Makanan Tambahan untuk anak.
                        </p>
                    </div>
                    <Link href="/pmt/programs/create">
                        <Button className="rounded-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Daftarkan Program
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                    <div className="relative flex-1 max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama anak atau orang tua..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 rounded-full border-border/60 bg-card"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => handleFilterChange(filter.value)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeFilter === filter.value
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[250px]">Anak & Orang Tua</TableHead>
                                    <TableHead>Durasi Program</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[200px]">Progres</TableHead>
                                    <TableHead>Sisa Hari</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {programs.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            Tidak ada program ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    programs.data.map((program) => (
                                        <TableRow key={program.id} className="group">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground">{program.child_name}</span>
                                                    <span className="text-xs text-muted-foreground">{program.parent_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span>{program.duration_days} Hari</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground block mt-0.5">
                                                    Mulai: {new Date(program.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    variant={getStatusVariant(program.status)}
                                                    label={getStatusLabel(program.status)}
                                                    showIcon
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="font-medium">{program.progress_percentage}%</span>
                                                    </div>
                                                    <Progress value={program.progress_percentage} className="h-2" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm font-medium">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    {program.days_remaining} Hari
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link href={`/pmt/programs/${program.id}`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-secondary"
                                                            title="Lihat Detail"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>

                    <div className="border-t border-border/50 p-4 bg-muted/20">
                        <PaginationNav
                            currentPage={programs.current_page}
                            lastPage={programs.last_page}
                            total={programs.total}
                            perPage={programs.per_page}
                            baseUrl="/pmt/programs"
                            filters={filters}
                        />
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
