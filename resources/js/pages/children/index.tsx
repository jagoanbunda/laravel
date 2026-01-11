import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Search,
    Eye,
    Edit,
    Filter,
    MoreHorizontal,
    Plus,
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

export default function ChildrenIndex({ children, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

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
        <AppLayout title="Children">
            <Head title="Children Management" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Children</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage registered children and their growth records.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button className="rounded-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Child
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 rounded-full border-border/60 bg-card"
                        />
                    </div>
                    <Button variant="outline" className="rounded-full border-border/60">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                </div>

                {/* Children Table */}
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[300px]">Child Name</TableHead>
                                    <TableHead>Parent</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {children.data.map((child) => {
                                    const age = calculateAge(child.date_of_birth);
                                    return (
                                        <TableRow key={child.id} className="group">
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-transform group-hover:scale-105 ${child.gender === 'male'
                                                            ? 'bg-blue-50 text-blue-600'
                                                            : 'bg-pink-50 text-pink-600'
                                                        }`}>
                                                        {child.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{child.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {age.years} yrs {age.months} mos
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{child.parent_name}</span>
                                                    <span className="text-xs text-muted-foreground">{child.parent_email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {child.is_active ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        Active
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                                        Inactive
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link href={`/children/${child.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/children/${child.id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>

                    {/* Footer / Pagination */}
                    <div className="border-t border-border/50 p-4 bg-muted/20">
                        <PaginationNav
                            currentPage={children.current_page}
                            lastPage={children.last_page}
                            total={children.total}
                            perPage={children.per_page}
                            baseUrl="/children"
                            filters={filters}
                        />
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
