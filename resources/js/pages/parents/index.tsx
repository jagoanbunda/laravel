import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
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
    Plus,
    Eye,
    Edit,
    Mail,
    Phone,
    CheckCircle,
    Clock,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface ParentListItem {
    id: number;
    name: string;
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
        <AppLayout title="Parents">
            <Head title="Parents Management" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Parents</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage registered parents and their contact info.
                        </p>
                    </div>
                    <Link href="/parents/create">
                        <Button className="rounded-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Parent
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search name or email..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 rounded-full border-border/60 bg-card"
                        />
                    </div>
                </div>

                {/* Parents Table */}
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[300px]">Parent Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Children</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parents.data.map((parent) => (
                                    <TableRow key={parent.id} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                {parent.avatar_url ? (
                                                    <img
                                                        src={parent.avatar_url.startsWith('http') ? parent.avatar_url : `/storage/${parent.avatar_url}`}
                                                        alt={parent.name}
                                                        className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                                                        {(parent.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-foreground">{parent.name}</p>
                                                    <p className="text-xs text-muted-foreground">Joined {new Date(parent.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Mail className="h-3 w-3" />
                                                    {parent.email}
                                                </div>
                                                {parent.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Phone className="h-3 w-3" />
                                                        {parent.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/30 text-secondary-foreground text-xs font-medium border border-border/50">
                                                <Users className="h-3 w-3" />
                                                {parent.children_count} Children
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {parent.email_verified_at ? (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Verified
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                                    <Clock className="h-3 w-3" />
                                                    Pending
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/parents/${parent.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/parents/${parent.id}/edit`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary">
                                                        <Edit className="h-4 w-4" />
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
                            currentPage={parents.current_page}
                            lastPage={parents.last_page}
                            total={parents.total}
                            perPage={parents.per_page}
                            baseUrl="/parents"
                            filters={filters}
                        />
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
