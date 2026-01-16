import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
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
    Search,
    Eye,
    ClipboardList,
} from 'lucide-react';
import { useState } from 'react';

interface ScreeningListItem {
    id: number;
    child_id: number;
    child_name: string;
    parent_name: string;
    screening_date: string;
    age_at_screening_months: number;
    age_interval: string;
    status: string;
    overall_status: 'sesuai' | 'pantau' | 'perlu_rujukan' | null;
    completed_at: string | null;
}

interface Props {
    screenings: {
        data: ScreeningListItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        result?: string;
    };
}

function getResultBadge(result: string | null) {
    if (!result) {
        return <StatusBadge variant="pending" showIcon />;
    }

    const variant = result === 'sesuai' ? 'sesuai' 
        : result === 'pantau' ? 'pantau' 
        : result === 'perlu_rujukan' ? 'perlu_rujukan' 
        : 'pending';
    
    return <StatusBadge variant={variant} showIcon />;
}

export default function ScreeningsIndex({ screenings, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        router.get('/screenings', { ...filters, search: value }, { preserveState: true });
    };

    return (
        <AppLayout title="Screenings">
            <Head title="ASQ-3 Screenings" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Developmental Screenings</h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor ASQ-3 screening results and follow-ups.
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search child or parent..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 rounded-full border-border/60 bg-card"
                        />
                    </div>
                </div>

                {/* Table */}
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[300px]">Child</TableHead>
                                    <TableHead>Screening Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Result</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {screenings.data.map((screening) => (
                                    <TableRow key={screening.id} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary/70">
                                                    <ClipboardList className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{screening.child_name}</p>
                                                    <p className="text-xs text-muted-foreground">Parent: {screening.parent_name}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{screening.age_interval}</span>
                                                <span className="text-xs text-muted-foreground">Months</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(screening.screening_date).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell>{getResultBadge(screening.overall_status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/screenings/${screening.id}/results`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>

                    {/* Pagination */}
                    <div className="border-t border-border/50 p-4 bg-muted/20">
                        <PaginationNav
                            currentPage={screenings.current_page}
                            lastPage={screenings.last_page}
                            total={screenings.total}
                            perPage={screenings.per_page}
                            baseUrl="/screenings"
                            filters={filters}
                        />
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
