import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginationNav } from '@/components/ui/pagination-nav';
import {
    Search,
    Eye,
    Edit,
    Filter,
    Grid,
    List,
} from 'lucide-react';
import { useState } from 'react';

interface ChildListItem {
    id: number;
    name: string;
    date_of_birth: string;
    gender: string;
    parent_name: string;
    parent_email: string;
    is_active: boolean;
    created_at: string;
}

interface Props {
    children: {
        data: ChildListItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        gender?: string;
        status?: string;
    };
}

function ZScoreIndicator({ value }: { value: number | undefined }) {
    if (value === undefined) return <span className="text-muted-foreground">-</span>;

    const position = Math.max(0, Math.min(100, ((value + 3) / 6) * 100));
    const isNormal = value >= -2 && value <= 2;
    const isSevere = value < -3 || value > 3;

    return (
        <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-200 rounded-full relative">
                <div
                    className={`absolute h-3 w-3 rounded-full -top-0.5 transform -translate-x-1/2 ${isSevere ? 'bg-red-500' : isNormal ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                    style={{ left: `${position}%` }}
                />
            </div>
            <span className={`text-xs font-semibold ${isSevere ? 'text-red-600' : isNormal ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                {value > 0 ? '+' : ''}{value.toFixed(1)}
            </span>
        </div>
    );
}

function getStatusBadge(child: Child) {
    const measurement = child.latest_measurement;
    if (!measurement) return null;

    const statuses = [];
    if (measurement.nutritional_status && measurement.nutritional_status !== 'normal') {
        statuses.push(measurement.nutritional_status);
    }
    if (measurement.stunting_status && measurement.stunting_status !== 'normal') {
        statuses.push(measurement.stunting_status);
    }
    if (measurement.wasting_status && measurement.wasting_status !== 'normal') {
        statuses.push(measurement.wasting_status);
    }

    if (statuses.length === 0) {
        return (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Normal
            </span>
        );
    }

    const status = statuses[0];
    const isSevere = status.includes('severely');
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${isSevere ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
            }`}>
            {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
    );
}

export default function ChildrenIndex({ children, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        router.get('/children', { ...filters, search: value }, { preserveState: true });
    };

    const calculateAge = (dateOfBirth: string) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        return { years, months };
    };

    return (
        <AppLayout title="Children Management">
            <Head title="Children Management" />

            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search children or parents..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-md">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 ${viewMode === 'table' ? 'bg-muted' : ''}`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                            >
                                <Grid className="h-4 w-4" />
                            </button>
                        </div>
                        <Button variant="outline">
                            <Filter className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Removed filters - handled server-side */}

                {/* Children Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Parent</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Gender</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Registered</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {children.data.map((child) => {
                                        const age = calculateAge(child.date_of_birth);
                                        return (
                                            <tr key={child.id} className="border-b hover:bg-muted/30 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${child.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                                                            }`}>
                                                            <span className="text-sm font-medium">
                                                                {child.name.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">{child.name}</span>
                                                            <p className="text-xs text-muted-foreground">{age.years} yrs {age.months} mos</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-sm">
                                                    {child.parent_name}
                                                </td>
                                                <td className="py-3 px-4 text-sm capitalize">
                                                    {child.gender}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {child.is_active ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                                    {new Date(child.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-1">
                                                        <Link href={`/children/${child.id}`}>
                                                            <Button variant="ghost" size="icon">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/children/${child.id}/edit`}>
                                                            <Button variant="ghost" size="icon">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <PaginationNav
                            currentPage={children.current_page}
                            lastPage={children.last_page}
                            total={children.total}
                            perPage={children.per_page}
                            baseUrl="/children"
                            filters={filters}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
