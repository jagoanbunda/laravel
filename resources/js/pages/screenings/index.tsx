import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PaginationNav } from '@/components/ui/pagination-nav';
import {
    Search,
    Eye,
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
    const configs: Record<string, { label: string; className: string }> = {
        sesuai: { label: 'Sesuai', className: 'bg-emerald-100 text-emerald-700' },
        pantau: { label: 'Pantau', className: 'bg-amber-100 text-amber-700' },
        perlu_rujukan: { label: 'Perlu Rujukan', className: 'bg-red-100 text-red-700' },
        pending: { label: 'Pending', className: 'bg-gray-100 text-gray-700' },
    };
    const config = configs[result || 'pending'] || configs.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
}

export default function ScreeningsIndex({ screenings, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        router.get('/screenings', { ...filters, search: value }, { preserveState: true });
    };

    return (
        <AppLayout title="ASQ-3 Screenings">
            <Head title="ASQ-3 Screenings" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">ASQ-3 Screenings</h1>
                        <p className="text-muted-foreground">Manage developmental screenings</p>
                    </div>
                </div>

                {/* Search */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by child or parent  name..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Child</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Parent</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Age Interval</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Screening Date</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Result</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {screenings.data.map((screening) => (
                                        <tr key={screening.id} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4 font-medium">{screening.child_name}</td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">{screening.parent_name}</td>
                                            <td className="py-3 px-4 text-sm">{screening.age_interval}</td>
                                            <td className="py-3 px-4 text-sm">{new Date(screening.screening_date).toLocaleDateString()}</td>
                                            <td className="py-3 px-4">{getResultBadge(screening.overall_status)}</td>
                                            <td className="py-3 px-4 text-right">
                                                <Link href={`/screenings/${screening.id}/results`}>
                                                    <Button variant="ghost" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <PaginationNav
                            currentPage={screenings.current_page}
                            lastPage={screenings.last_page}
                            total={screenings.total}
                            perPage={screenings.per_page}
                            baseUrl="/screenings"
                            filters={filters}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
