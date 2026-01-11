import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PaginationNav } from '@/components/ui/pagination-nav';
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
    CheckCircle2,
    XCircle,
    Clock,
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
        return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                <Clock className="h-3 w-3" />
                Pending
            </div>
        );
    }

    const config = {
        habis: { label: 'Habis (100%)', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        half: { label: 'Setengah (50%)', class: 'bg-blue-50 text-blue-700 border-blue-200' },
        quarter: { label: 'Seperempat (25%)', class: 'bg-amber-50 text-amber-700 border-amber-200' },
        none: { label: 'Tidak Dimakan', class: 'bg-red-50 text-red-700 border-red-200' },
    };

    const { label, class: className } = config[portion];
    return <Badge variant="outline" className={`${className} font-normal border`}>{label}</Badge>;
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

    const handleLogDistribution = (schedule: PmtScheduleListItem) => {
        setSelectedSchedule(schedule);
        setSelectedPortion(schedule.portion || '');
        setLogDialogOpen(true);
    };

    const handleSaveLog = () => {
        // Logic to save log would go here
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

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">PMT Schedule</h1>
                        <p className="text-muted-foreground mt-1">
                            Track Supplementary Feeding Program distribution.
                        </p>
                    </div>
                    <Link href="/pmt/create">
                        <Button className="rounded-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Schedule PMT
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                    <div className="relative flex-1 max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search child, parent, or menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 rounded-full border-border/60 bg-card"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setActiveFilter(filter.value)}
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

                {/* PMT Schedules Table */}
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[250px]">Child & Parent</TableHead>
                                    <TableHead>Menu Item</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Portion</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                            No schedules found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    schedules.data.map((schedule) => (
                                        <TableRow key={schedule.id} className="group">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground">{schedule.child_name}</span>
                                                    <span className="text-xs text-muted-foreground">{schedule.parent_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                        <Utensils className="h-4 w-4" />
                                                    </div>
                                                    <span className="font-medium">{schedule.menu_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(schedule.scheduled_date).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getPortionBadge(schedule.portion)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-secondary"
                                                        onClick={() => handleLogDistribution(schedule)}
                                                        title={schedule.portion ? "Edit Distribution" : "Log Distribution"}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
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
                            currentPage={schedules.current_page}
                            lastPage={schedules.last_page}
                            total={schedules.total}
                            perPage={schedules.per_page}
                            baseUrl="/pmt"
                            filters={filters}
                        />
                    </div>
                </Card>
            </div>

            {/* Log Distribution Dialog */}
            <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Log Distribution</DialogTitle>
                        <DialogDescription>
                            Record portion consumed for {selectedSchedule?.child_name}
                        </DialogDescription>
                    </DialogHeader>
                    {/* ... dialog content ... */}
                    <div className="grid gap-4 py-4">
                        {/* Simplified for brevity - reuse logic */}
                        <div className="grid gap-2">
                            <Label>Portion Consumed</Label>
                            <Select value={selectedPortion} onValueChange={setSelectedPortion}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select portion" />
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
                            Cancel
                        </Button>
                        <Button onClick={handleSaveLog}>
                            Save Log
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
