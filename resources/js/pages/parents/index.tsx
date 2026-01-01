import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginationNav } from '@/components/ui/pagination-nav';
import {
    Search,
    Plus,
    Eye,
    Edit,
    MoreHorizontal,
    Mail,
    Phone,
    CheckCircle,
    Clock,
} from 'lucide-react';
import { useState } from 'react';

interface ParentListItem {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    children_count: number;
    push_notifications: boolean;
    weekly_report: boolean;
    email_verified_at?: string;
    created_at: string;
}

interface Props {
    parents: {
        data: ParentListItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function ParentsIndex({ parents, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        router.get('/parents', { search: value }, { preserveState: true });
    };

    return (
        <AppLayout title="Parents Management">
            <Head title="Parents Management" />

            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 pr-4"
                        />
                    </div>
                    <Link href="/parents/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Parent
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                {/* Removed filter buttons - search only for now */}

                {/* Parents Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Phone</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Children</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Registered</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parents.data.map((parent) => (
                                        <tr key={parent.id} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-primary">
                                                            {(parent.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium">{parent.full_name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Mail className="h-4 w-4" />
                                                    {parent.email}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Phone className="h-4 w-4" />
                                                    {parent.phone}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                                                    {parent.children_count}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {parent.email_verified_at ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-1 text-xs font-medium text-secondary">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                                                        <Clock className="h-3 w-3" />
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">
                                                {new Date(parent.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/parents/${parent.id}`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/parents/${parent.id}/edit`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <PaginationNav
                            currentPage={parents.current_page}
                            lastPage={parents.last_page}
                            total={parents.total}
                            perPage={parents.per_page}
                            baseUrl="/parents"
                            filters={filters}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
