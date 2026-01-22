import { Head, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginationNav } from '@/components/ui/pagination-nav';
import { StatusBadge } from '@/components/ui/status-badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    Calendar,
    Image as ImageIcon,
    FileText,
    Users,
    TrendingUp,
    CheckCircle2,
    X,
    Download,
    Utensils,
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Interfaces
interface PmtLogItem {
    id: number;
    child_name: string;
    parent_name: string;
    menu_name: string;
    program_name: string | null;
    scheduled_date: string;
    portion: 'habis' | 'half' | 'quarter' | 'none';
    portion_label: string;
    portion_percentage: number;
    photo_url: string | null;
    notes: string | null;
    logged_at: string;
}

// Detail modal component for viewing full log information
function LogDetailModal({ 
    log, 
    onClose 
}: { 
    log: PmtLogItem | null; 
    onClose: () => void;
}) {
    const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);

    // Reset photo expansion when log changes
    useEffect(() => {
        if (log) setIsPhotoExpanded(false);
    }, [log]);

    if (!log) return null;

    return (
        <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b border-border/50">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5 text-primary" />
                        Detail Laporan
                    </DialogTitle>
                </DialogHeader>
                
                <div className="p-6 space-y-6">
                    {/* Header: Photo + Names */}
                    <div className={`flex ${isPhotoExpanded ? 'flex-col' : 'flex-row'} gap-5 transition-all duration-300`}>
                        {/* Photo Thumbnail */}
                        <div 
                            className={`
                                relative shrink-0 overflow-hidden rounded-xl border border-border bg-muted transition-all duration-300 group
                                ${isPhotoExpanded ? 'w-full aspect-video order-first' : 'w-20 h-20'}
                                ${log.photo_url ? 'cursor-pointer hover:ring-2 hover:ring-primary/20' : ''}
                            `}
                            onClick={() => log.photo_url && setIsPhotoExpanded(!isPhotoExpanded)}
                        >
                            {log.photo_url ? (
                                <>
                                    <img
                                        src={log.photo_url}
                                        alt="Bukti konsumsi"
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        {isPhotoExpanded ? (
                                            <div className="bg-black/50 rounded-full p-1.5 backdrop-blur-sm">
                                                <X className="text-white h-4 w-4"/>
                                            </div>
                                        ) : (
                                            <div className="bg-black/50 rounded-full p-1.5 backdrop-blur-sm">
                                                <ImageIcon className="text-white h-4 w-4"/>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground/40 bg-muted/50">
                                    <ImageIcon className="h-6 w-6 mb-1" />
                                    {isPhotoExpanded && <span className="text-xs">Tidak ada foto</span>}
                                </div>
                            )}
                        </div>

                        {/* Names */}
                        <div className="flex flex-col justify-center min-w-0 py-1">
                            <h3 className="font-bold text-lg leading-tight truncate pr-2" title={log.child_name}>
                                {log.child_name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                                <Users className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate" title={log.parent_name}>{log.parent_name}</span>
                            </div>
                            {log.program_name && (
                                <span className="mt-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary w-fit uppercase tracking-wide">
                                    {log.program_name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-4">
                        {/* Date */}
                        <div className="flex items-start gap-4 text-sm group">
                            <div className="mt-0.5 rounded-lg bg-primary/5 p-2 text-primary group-hover:bg-primary/10 transition-colors">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div className="flex-1 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                                <p className="text-xs font-medium text-muted-foreground mb-0.5">Tanggal Jadwal</p>
                                <p className="font-medium text-foreground">
                                    {new Date(log.scheduled_date).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Menu */}
                        {log.menu_name && log.menu_name !== '-' && (
                            <div className="flex items-start gap-4 text-sm group">
                                <div className="mt-0.5 rounded-lg bg-orange-500/5 p-2 text-orange-600 group-hover:bg-orange-500/10 transition-colors">
                                    <Utensils className="h-4 w-4" />
                                </div>
                                <div className="flex-1 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Menu Makanan</p>
                                    <p className="font-medium text-foreground leading-relaxed">{log.menu_name}</p>
                                </div>
                            </div>
                        )}

                        {/* Portion */}
                        <div className="flex items-start gap-4 text-sm group">
                            <div className="mt-0.5 rounded-lg bg-blue-500/5 p-2 text-blue-600 group-hover:bg-blue-500/10 transition-colors">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground mb-1.5">Porsi Konsumsi</p>
                                <StatusBadge variant={log.portion} showIcon className="shadow-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    {log.notes && (
                        <div className="rounded-xl bg-muted/40 border border-border/50 p-4">
                            <div className="flex items-center gap-2 mb-2 text-foreground/80">
                                <FileText className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider opacity-70">Catatan Orang Tua</span>
                            </div>
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed pl-1">
                                {log.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-muted/30 px-6 py-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                    <span>Dicatat pada</span>
                    <span className="font-mono text-foreground/70">
                        {new Date(log.logged_at).toLocaleString('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </span>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface Stats {
    total_schedules: number;
    total_logged: number;
    pending: number;
    compliance_rate: number;
    consumption_rate: number;
    consumption_breakdown: {
        habis: number;
        half: number;
        quarter: number;
        none: number;
    };
}

interface Program {
    id: number;
    label: string;
}

interface Props {
    logs: {
        data: PmtLogItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
    programs: Program[];
    filters: {
        search?: string;
        date_from?: string;
        date_to?: string;
        program_id?: string;
        portion?: string;
    };
}

const portionOptions = [
    { value: 'all', label: 'Semua Porsi' },
    { value: 'habis', label: 'Habis (100%)' },
    { value: 'half', label: 'Setengah (50%)' },
    { value: 'quarter', label: 'Seperempat (25%)' },
    { value: 'none', label: 'Tidak Dimakan (0%)' },
];

export default function PmtReportsIndex({ logs, stats, programs, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedLog, setSelectedLog] = useState<PmtLogItem | null>(null);

    // Build export URL with current filters
    const buildExportUrl = () => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.date_from) params.set('date_from', filters.date_from);
        if (filters.date_to) params.set('date_to', filters.date_to);
        if (filters.program_id) params.set('program_id', filters.program_id);
        if (filters.portion) params.set('portion', filters.portion);
        const queryString = params.toString();
        return `/pmt/reports/export${queryString ? `?${queryString}` : ''}`;
    };

    // Debounce search update
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery !== (filters.search || '')) {
                updateFilters('search', searchQuery);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const updateFilters = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        // Clean up empty filters
        if (!value || value === 'all') delete newFilters[key as keyof typeof filters];
        
        router.get('/pmt/reports', newFilters as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatPercentage = (val: number) => `${Math.round(val)}%`;

    const getConsumptionColor = (key: string) => {
        switch (key) {
            case 'habis': return 'bg-success';
            case 'half': return 'bg-info';
            case 'quarter': return 'bg-warning';
            case 'none': return 'bg-destructive';
            default: return 'bg-muted';
        }
    };

    const totalBreakdown = Object.values(stats.consumption_breakdown).reduce((a, b) => a + b, 0) || 1;

    return (
        <AppLayout>
            <Head title="Laporan PMT" />

            <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Laporan PMT</h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor laporan konsumsi PMT dari orang tua
                        </p>
                    </div>
                    <a
                        href={buildExportUrl()}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Export Excel
                    </a>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Jadwal</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_schedules}</div>
                            <p className="text-xs text-muted-foreground">Jadwal pemberian makanan</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sudah Dicatat</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_logged}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.pending} belum dicatat
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tingkat Kepatuhan</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPercentage(stats.compliance_rate)}</div>
                            <p className="text-xs text-muted-foreground">Orang tua melapor</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tingkat Konsumsi</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPercentage(stats.consumption_rate)}</div>
                            <p className="text-xs text-muted-foreground">Rata-rata makanan habis</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Consumption Breakdown */}
                <Card className="shadow-sm border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Distribusi Konsumsi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-8 w-full flex rounded-full overflow-hidden bg-muted/20">
                            {(['habis', 'half', 'quarter', 'none'] as const).map((key) => {
                                const count = stats.consumption_breakdown[key];
                                const percentage = (count / totalBreakdown) * 100;
                                if (percentage === 0) return null;
                                return (
                                    <div
                                        key={key}
                                        style={{ width: `${percentage}%` }}
                                        className={`${getConsumptionColor(key)} transition-all duration-500 hover:opacity-90 cursor-help relative group`}
                                        title={`${key}: ${count} (${Math.round(percentage)}%)`}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                            {Math.round(percentage)}%
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4 text-sm justify-center">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-success" />
                                <span className="text-muted-foreground">Habis ({stats.consumption_breakdown.habis})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-info" />
                                <span className="text-muted-foreground">Setengah ({stats.consumption_breakdown.half})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-warning" />
                                <span className="text-muted-foreground">Seperempat ({stats.consumption_breakdown.quarter})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-destructive" />
                                <span className="text-muted-foreground">Tidak Dimakan ({stats.consumption_breakdown.none})</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                    <div className="relative w-full lg:max-w-xs">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari anak atau orang tua..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 rounded-lg"
                        />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                        <Input
                            type="date"
                            value={filters.date_from || ''}
                            onChange={(e) => updateFilters('date_from', e.target.value)}
                            className="w-full sm:w-auto"
                        />
                        <span className="self-center hidden sm:inline text-muted-foreground">-</span>
                        <Input
                            type="date"
                            value={filters.date_to || ''}
                            onChange={(e) => updateFilters('date_to', e.target.value)}
                            className="w-full sm:w-auto"
                        />
                        
                        <Select
                            value={filters.program_id || 'all'}
                            onValueChange={(val) => updateFilters('program_id', val)}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Program" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Program</SelectItem>
                                {programs.map((program) => (
                                    <SelectItem key={program.id} value={String(program.id)}>
                                        {program.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.portion || 'all'}
                            onValueChange={(val) => updateFilters('portion', val)}
                        >
                            <SelectTrigger className="w-full sm:w-[160px]">
                                <SelectValue placeholder="Porsi" />
                            </SelectTrigger>
                            <SelectContent>
                                {portionOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {(filters.search || filters.date_from || filters.date_to || filters.program_id || filters.portion) && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.get('/pmt/reports', {}, { preserveState: true })}
                                title="Reset Filter"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Data Table */}
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="w-[200px]">Anak & Orang Tua</TableHead>
                                    <TableHead>Menu</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Porsi</TableHead>
                                    <TableHead className="w-[100px] text-center">Foto</TableHead>
                                    <TableHead className="max-w-[200px]">Catatan</TableHead>
                                    <TableHead className="text-right">Dicatat</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="h-8 w-8 opacity-50" />
                                                <p>Belum ada laporan data yang sesuai filter</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.data.map((log) => (
                                        <TableRow 
                                            key={log.id} 
                                            className="group hover:bg-muted/10 transition-colors cursor-pointer"
                                            onClick={() => setSelectedLog(log)}
                                        >
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground">{log.child_name}</span>
                                                    <span className="text-xs text-muted-foreground">{log.parent_name}</span>
                                                    {log.program_name && (
                                                        <span className="text-[10px] inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary/10 text-primary w-fit mt-1">
                                                            {log.program_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm">{log.menu_name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(log.scheduled_date).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge variant={log.portion} showIcon className="capitalize" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {log.photo_url ? (
                                                    <div
                                                        className="relative inline-block group/img overflow-hidden rounded-md border border-border shadow-sm"
                                                    >
                                                        <img
                                                            src={log.photo_url}
                                                            alt="Bukti konsumsi"
                                                            className="h-10 w-10 object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                            <ImageIcon className="h-4 w-4 text-white" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-10 w-10 mx-auto rounded-md bg-muted flex items-center justify-center text-muted-foreground/50 border border-border/50">
                                                        <ImageIcon className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {log.notes ? (
                                                    <p className="text-sm text-muted-foreground truncate max-w-[200px]" title={log.notes}>
                                                        {log.notes}
                                                    </p>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/50 italic">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground">
                                                <div className="flex flex-col items-end">
                                                    <span>{new Date(log.logged_at).toLocaleDateString('id-ID')}</span>
                                                    <span className="opacity-70">{new Date(log.logged_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    
                    {/* Pagination */}
                    <div className="border-t border-border/50 p-4 bg-muted/20">
                        <PaginationNav
                            currentPage={logs.current_page}
                            lastPage={logs.last_page}
                            total={logs.total}
                            perPage={logs.per_page}
                            baseUrl="/pmt/reports"
                            filters={filters}
                        />
                    </div>
                </Card>
            </div>

            {/* Log Detail Modal */}
            <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
        </AppLayout>
    );
}
