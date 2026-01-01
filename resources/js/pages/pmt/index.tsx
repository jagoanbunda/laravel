import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PaginationNav } from '@/components/ui/pagination-nav';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
    Utensils,
    Plus,
    Eye,
    Edit,
} from 'lucide-react';
import { useState } from 'react';

// ERD-aligned mock data
interface PmtScheduleListItem {
    id: number;
    child_id: number;
    child_name: string;
    parent_name: string;
    menu_name: string;
    scheduled_date: string;
    portion: 'habis' | 'half' | 'quarter' | 'none' | null;
    photo_url: string | null;
    logged_at: string | null;
    notes: string | null;
}

interface Props {
    schedules: {
        data: PmtScheduleListItem[];
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
    { label: 'Sudah Dicatat', value: 'logged' },
    { label: 'Belum Dicatat', value: 'not_logged' },
];

function getPortionBadge(portion: PmtScheduleListItem['portion']) {
    if (!portion) {
        return <Badge variant="outline" className="bg-gray-100 text-gray-700">Belum Dicatat</Badge>;
    }

    const config = {
        habis: { label: 'Habis (100%)', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        half: { label: 'Setengah (50%)', class: 'bg-blue-100 text-blue-700 border-blue-200' },
        quarter: { label: 'Seperempat (25%)', class: 'bg-amber-100 text-amber-700 border-amber-200' },
        none: { label: 'Tidak Dimakan (0%)', class: 'bg-red-100 text-red-700 border-red-200' },
    };

    const { label, class: className } = config[portion];
    return <Badge className={className}>{label}</Badge>;
}

export default function PmtIndex({ schedules, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeFilter, setActiveFilter] = useState('all');
    const [logDialogOpen, setLogDialogOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<PmtScheduleListItem | null>(null);
    const [selectedPortion, setSelectedPortion] = useState<string>('');

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        router.get('/pmt', { ...filters, search: value }, { preserveState: true });
    };

    const countByStatus = {
        total: schedules.total,
        logged: schedules.data.filter((s) => s.logged_at !== null).length,
        notLogged: schedules.data.filter((s) => s.logged_at === null).length,
    };

    const handleLogDistribution = (schedule: PmtScheduleListItem) => {
        setSelectedSchedule(schedule);
        setSelectedPortion(schedule.portion || '');
        setLogDialogOpen(true);
    };

    const handleSaveLog = () => {
        if (!selectedSchedule || !selectedPortion) return;

        const updatedSchedules = schedules.data.map(s =>
            s.id === selectedSchedule.id
                ? { ...s, portion: selectedPortion as any, logged_at: new Date().toISOString() }
                : s
        );
        // In a real Inertia app, this would trigger a backend update and then a data refresh.
        // For this mock, we'll simulate the update.
        // Note: schedules is a prop, so directly modifying it like this won't re-render
        // unless it's part of a state managed by the parent or a local state.
        // For the purpose of this exercise, we'll assume a mechanism to update the prop or trigger a refresh.
        // setSchedules(updatedSchedules); // This line is commented out as schedules is a prop.
        setLogDialogOpen(false);
        setSelectedSchedule(null);
        setSelectedPortion('');
    };

    const filteredSchedules = schedules.data.filter((schedule) => {
        const matchesSearch = schedule.child_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            schedule.parent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            schedule.menu_name.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeFilter === 'all') return matchesSearch;
        if (activeFilter === 'logged') return matchesSearch && schedule.portion !== null;
        if (activeFilter === 'not_logged') return matchesSearch && schedule.portion === null;
        return matchesSearch;
    });

    return (
        <AppLayout title="PMT Programs">
            <Head title="PMT Programs" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Program PMT</h1>
                        <p className="text-muted-foreground">Kelola jadwal dan distribusi PMT</p>
                    </div>
                    <Link href="/pmt/create">
                        <Button className="bg-emerald-500 hover:bg-emerald-600 gap-2">
                            <Plus className="h-4 w-4" />
                            Jadwalkan PMT
                        </Button>
                    </Link>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari anak, orang tua, atau menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2">
                    {statusFilters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setActiveFilter(filter.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === filter.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* PMT Schedules Table */}
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Utensils className="h-5 w-5 text-emerald-500" />
                            Jadwal PMT
                            <Badge variant="secondary">{filteredSchedules.length} jadwal</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Anak</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Orang Tua</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Menu PMT</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tanggal</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Porsi</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedules.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-muted-foreground">
                                                Tidak ada jadwal PMT ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        schedules.data.map((schedule) => (
                                            <tr key={schedule.id} className="border-b hover:bg-muted/30 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium">{schedule.child_name}</div>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                                    {schedule.parent_name}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Utensils className="h-4 w-4 text-emerald-500" />
                                                        <span className="font-medium">{schedule.menu_name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        {new Date(schedule.scheduled_date).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {getPortionBadge(schedule.portion)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {schedule.logged_at ? (
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(schedule.logged_at).toLocaleTimeString('id-ID', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => handleLogDistribution(schedule)}
                                                            title={schedule.portion ? "Edit Distribusi" : "Catat Distribusi"}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <PaginationNav
                            currentPage={schedules.current_page}
                            lastPage={schedules.last_page}
                            total={schedules.total}
                            perPage={schedules.per_page}
                            baseUrl="/pmt"
                            filters={filters}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Log Distribution Dialog */}
            <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Catat Distribusi PMT</DialogTitle>
                        <DialogDescription>
                            Pilih porsi yang dimakan untuk {selectedSchedule?.child_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Anak</Label>
                            <Input value={selectedSchedule?.child_name || ''} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label>Menu</Label>
                            <Input value={selectedSchedule?.menu_name || ''} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label>Tanggal</Label>
                            <Input
                                value={selectedSchedule ? new Date(selectedSchedule.scheduled_date).toLocaleDateString('id-ID') : ''}
                                disabled
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="portion">Porsi yang Dimakan *</Label>
                            <Select value={selectedPortion} onValueChange={setSelectedPortion}>
                                <SelectTrigger id="portion">
                                    <SelectValue placeholder="Pilih porsi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="habis">Habis (100%)</SelectItem>
                                    <SelectItem value="half">Setengah (50%)</SelectItem>
                                    <SelectItem value="quarter">Seperempat (25%)</SelectItem>
                                    <SelectItem value="none">Tidak Dimakan (0%)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setLogDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSaveLog}
                            disabled={!selectedPortion}
                        >
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
