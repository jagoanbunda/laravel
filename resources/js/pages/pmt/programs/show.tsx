import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { 
    ArrowLeft, 
    Calendar, 
    Clock, 
    User, 
    Utensils, 
    CheckCircle2, 
    XCircle,
    FileText,
    Image as ImageIcon,
    Eye
} from 'lucide-react';
import { useState } from 'react';

interface PmtProgramDetail {
    id: number;
    child: { id: number; name: string; age_months: number; };
    parent: { id: number; name: string; };
    start_date: string;
    end_date: string;
    duration_days: 90 | 120;
    status: 'active' | 'completed' | 'discontinued';
    progress_percentage: number;
    days_remaining: number;
    notes: string | null;
    created_by: string;
    created_at: string;
}

interface ScheduleItem {
    id: number;
    scheduled_date: string;
    menu_name: string | null;
    is_logged: boolean;
    log: { 
        food_name: string | null; 
        portion: string; 
        portion_label: string; 
        portion_percentage: number;
        logged_at: string; 
        notes: string | null;
        photo_url: string | null;
    } | null;
}

interface Props {
    program: PmtProgramDetail;
    schedules: { 
        data: ScheduleItem[]; 
        current_page: number; 
        last_page: number; 
        per_page: number; 
        total: number; 
    };
    statistics: { 
        total_days: number; 
        logged_days: number; 
        pending_days: number; 
        completion_rate: number; 
    };
}

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

// Detail modal component for viewing schedule log information
function ScheduleDetailModal({ 
    schedule, 
    onClose 
}: { 
    schedule: ScheduleItem | null; 
    onClose: () => void;
}) {
    if (!schedule || !schedule.log) return null;

    return (
        <Dialog open={!!schedule} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Detail Konsumsi
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                    {/* Photo Section */}
                    {schedule.log.photo_url ? (
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
                            <img
                                src={schedule.log.photo_url}
                                alt="Bukti konsumsi"
                                className="h-full w-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
                            <div className="text-center text-muted-foreground">
                                <ImageIcon className="mx-auto h-12 w-12 opacity-50" />
                                <p className="mt-2 text-sm">Tidak ada foto</p>
                            </div>
                        </div>
                    )}

                    {/* Info Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Scheduled Date */}
                        <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Tanggal Jadwal
                            </div>
                            <p className="mt-1 font-semibold">
                                {new Date(schedule.scheduled_date).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>

                        {/* Menu/Food */}
                        <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Utensils className="h-4 w-4" />
                                Menu / Makanan
                            </div>
                            <p className="mt-1 font-semibold">
                                {schedule.log.food_name || schedule.menu_name || '-'}
                            </p>
                        </div>

                        {/* Portion */}
                        <div className="rounded-lg border border-border/50 bg-muted/20 p-4 sm:col-span-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4" />
                                Porsi Konsumsi
                            </div>
                            <div className="mt-2">
                                <StatusBadge 
                                    variant={schedule.log.portion as any} 
                                    label={schedule.log.portion_label}
                                    showIcon 
                                    size="lg" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {schedule.log.notes && (
                        <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                Catatan dari Orang Tua
                            </div>
                            <p className="mt-2 text-sm whitespace-pre-wrap">{schedule.log.notes}</p>
                        </div>
                    )}

                    {/* Logged At */}
                    <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                        <span>Dicatat pada:</span>
                        <span className="font-medium">
                            {new Date(schedule.log.logged_at).toLocaleString('id-ID', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function PmtProgramShow({ program, schedules, statistics }: Props) {
    const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);

    const handleDiscontinue = () => {
        if (confirm('Apakah Anda yakin ingin menghentikan program ini? Tindakan ini tidak dapat dibatalkan.')) {
            router.post(`/pmt/programs/${program.id}/discontinue`);
        }
    };

    return (
        <AppLayout>
            <Head title={`Program: ${program.child.name}`} />

            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/pmt/programs" className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Detail Program PMT</h1>
                            <p className="text-muted-foreground text-sm">
                                Memantau perkembangan program untuk {program.child.name}
                            </p>
                        </div>
                    </div>
                    {program.status === 'active' && (
                        <Button variant="destructive" onClick={handleDiscontinue} className="gap-2">
                            <XCircle className="h-4 w-4" />
                            Hentikan Program
                        </Button>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Info Card */}
                    <Card className="md:col-span-2 border-border/50 shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">Informasi Peserta</CardTitle>
                                    <CardDescription>Detail anak dan orang tua peserta program.</CardDescription>
                                </div>
                                <StatusBadge
                                    variant={getStatusVariant(program.status)}
                                    label={getStatusLabel(program.status)}
                                    size="lg"
                                    showIcon
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Nama Anak</p>
                                            <p className="font-semibold">{program.child.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Nama Orang Tua</p>
                                            <p className="font-semibold">{program.parent.name}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Calendar className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Periode Program</p>
                                            <p className="font-semibold">
                                                {new Date(program.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(program.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Durasi</p>
                                            <p className="font-semibold">{program.duration_days} Hari</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {program.notes && (
                                <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Catatan</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{program.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Progress Card */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Progres Program</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2 text-center py-2">
                                <div className="text-4xl font-bold text-primary">
                                    {Math.round(statistics.completion_rate)}%
                                </div>
                                <Progress value={statistics.completion_rate} className="h-3" />
                                <p className="text-sm text-muted-foreground">Kelengkapan Konsumsi</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Total Hari</span>
                                    <span className="font-semibold">{statistics.total_days}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Sudah Dicatat</span>
                                    <span className="font-semibold text-success">{statistics.logged_days}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Menunggu</span>
                                    <span className="font-semibold text-warning">{statistics.pending_days}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Schedule Table */}
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle>Riwayat Distribusi</CardTitle>
                        <CardDescription>Jadwal dan catatan konsumsi harian.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Menu & Porsi</TableHead>
                                    <TableHead className="w-[80px] text-center">Foto</TableHead>
                                    <TableHead>Dicatat Pada</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.data.map((schedule) => (
                                    <TableRow 
                                        key={schedule.id}
                                        className={schedule.is_logged ? "cursor-pointer hover:bg-muted/50" : ""}
                                        onClick={() => schedule.is_logged && setSelectedSchedule(schedule)}
                                    >
                                        <TableCell className="font-medium">
                                            {new Date(schedule.scheduled_date).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            {schedule.is_logged ? (
                                                <div className="flex items-center gap-1.5 text-success text-sm font-medium">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Dicatat
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                                    <Clock className="h-4 w-4" />
                                                    Pending
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {schedule.log ? (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Utensils className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="font-medium">{schedule.log.food_name || schedule.menu_name || '-'}</span>
                                                    </div>
                                                    <StatusBadge 
                                                        variant={schedule.log.portion as any} 
                                                        label={schedule.log.portion_label} 
                                                        size="sm"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {schedule.log?.photo_url ? (
                                                <div className="relative inline-block group/img overflow-hidden rounded-md border border-border shadow-sm">
                                                    <img
                                                        src={schedule.log.photo_url}
                                                        alt="Bukti konsumsi"
                                                        className="h-10 w-10 object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                        <Eye className="h-4 w-4 text-white" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-10 w-10 mx-auto rounded-md bg-muted flex items-center justify-center text-muted-foreground/50 border border-border/50">
                                                    <ImageIcon className="h-4 w-4" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {schedule.log ? (
                                                new Date(schedule.log.logged_at).toLocaleString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                            ) : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    
                    <div className="border-t border-border/50 p-4 bg-muted/20">
                        <PaginationNav
                            currentPage={schedules.current_page}
                            lastPage={schedules.last_page}
                            total={schedules.total}
                            perPage={schedules.per_page}
                            baseUrl={`/pmt/programs/${program.id}`}
                            filters={{}}
                        />
                    </div>
                </Card>
            </div>

            {/* Schedule Detail Modal */}
            <ScheduleDetailModal 
                schedule={selectedSchedule} 
                onClose={() => setSelectedSchedule(null)} 
            />
        </AppLayout>
    );
}
