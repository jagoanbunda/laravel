import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Mail,
    Phone,
    Calendar,
    Baby,
    CheckCircle,
    Clock,
    User,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    Shield
} from 'lucide-react';
import { useState } from 'react';

interface Child {
    id: number;
    name: string;
    date_of_birth: string;
    gender: string;
    is_active: boolean;
}

interface Props {
    parent: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        avatar_url: string | null;
        children_count: number;
        push_notifications: boolean;
        weekly_report: boolean;
        email_verified_at: string | null;
        created_at: string;
        children: Child[];
    };
}

export default function ParentShow({ parent }: Props) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleDelete = () => {
        router.delete(`/parents/${parent.id}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
            },
        });
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
        <AppLayout title="Parent Profile">
            <Head title={`${parent.name} - Parent Profile`} />

            <div className="space-y-6">
                {/* Breadcrumbs & Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/parents" className="hover:text-primary hover:underline flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Parents
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">{parent.name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h1 className="text-2xl font-bold tracking-tight">Parent Profile</h1>
                        <div className="flex items-center gap-3">
                            <Link href={`/parents/${parent.id}/edit`}>
                                <Button variant="outline" className="gap-2">
                                    <Edit className="h-4 w-4" />
                                    Edit Profile
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                className="gap-2"
                                onClick={() => setIsDeleteDialogOpen(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Left Column: Profile Card */}
                    <aside className={`w-full flex flex-col gap-6 lg:sticky lg:top-24 transition-all duration-300 ${sidebarCollapsed ? 'lg:w-auto' : 'lg:w-1/3'}`}>
                        <Card className="overflow-hidden" style={{ background: 'linear-gradient(180deg, #E0F2FE 0%, #E0F2FE 120px, white 120px, white 100%)' }}>
                            {/* Collapse Toggle Button */}
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="hidden lg:flex absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            >
                                {sidebarCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                            </button>

                            {/* Profile Header */}
                            <div className={`p-6 flex flex-col items-center border-b ${sidebarCollapsed ? 'py-4' : ''}`}>
                                <div className="relative mb-4">
                                    <div className={`rounded-full flex items-center justify-center font-bold border-4 border-white shadow-md transition-all bg-sky-100 text-sky-600 ${sidebarCollapsed ? 'w-16 h-16 text-xl' : 'w-28 h-28 text-3xl'}`}>
                                        {(parent.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div className={`absolute rounded-full border-2 border-white ${sidebarCollapsed ? 'bottom-0 right-0 w-4 h-4' : 'bottom-1 right-1 w-5 h-5'}`} style={{ backgroundColor: '#0ea5e9' }} title="Active Status" />
                                </div>
                                {!sidebarCollapsed && (
                                    <>
                                        <h2 className="text-xl font-bold text-center mb-1">{parent.name}</h2>
                                        <Badge variant="secondary" className="mb-4">ID: #{parent.id}</Badge>
                                        
                                        <div className="flex justify-center gap-4">
                                            {parent.email_verified_at ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 gap-1 hover:bg-emerald-200">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Pending
                                                </Badge>
                                            )}
                                        </div>
                                    </>
                                )}
                                {sidebarCollapsed && (
                                    <p className="text-sm font-semibold text-center mt-1">{parent.name.split(' ')[0]}</p>
                                )}
                            </div>

                            {/* Profile Details - Hidden when collapsed */}
                            {!sidebarCollapsed && (
                                <CardContent className="p-0">
                                    <div className="px-6 py-4 border-b flex items-center gap-3 hover:bg-muted/50 transition-colors">
                                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs text-muted-foreground">Email Address</p>
                                            <p className="text-sm font-medium truncate" title={parent.email}>{parent.email}</p>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 border-b flex items-center gap-3 hover:bg-muted/50 transition-colors">
                                        <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Phone Number</p>
                                            <p className="text-sm font-medium">{parent.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                                        <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Joined Date</p>
                                            <p className="text-sm font-medium">
                                                {new Date(parent.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </aside>

                    {/* Right Column: Content */}
                    <main className={`w-full flex flex-col gap-6 transition-all duration-300 ${sidebarCollapsed ? 'lg:flex-1' : 'lg:w-2/3'}`}>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Children
                                    </CardTitle>
                                    <Baby className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{parent.children_count}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Registered in system
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Account Status
                                    </CardTitle>
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold flex items-center gap-2">
                                        Active
                                        <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Full access enabled
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Children List */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Baby className="h-5 w-5 text-primary" />
                                        Registered Children
                                    </CardTitle>
                                    <Link href={`/children/create?parent_id=${parent.id}`}>
                                        <Button size="sm" variant="outline" className="gap-1">
                                            <User className="h-3.5 w-3.5" />
                                            Add Child
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {parent.children.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                        <Baby className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-medium">No children registered</p>
                                        <p className="text-sm mb-4">Add a child to start tracking growth</p>
                                        <Link href={`/children/create?parent_id=${parent.id}`}>
                                            <Button variant="outline">
                                                Register First Child
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {parent.children.map((child) => {
                                            const age = calculateAge(child.date_of_birth);
                                            return (
                                                <Link
                                                    key={child.id}
                                                    href={`/children/${child.id}`}
                                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                                            child.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                                                        }`}>
                                                            {child.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-semibold text-lg">{child.name}</p>
                                                                <Badge variant="outline" className="text-xs font-normal capitalize">
                                                                    {child.gender}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {age.years} yrs {age.months} mos • Born {new Date(child.date_of_birth).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <Badge className={child.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-100'}>
                                                            {child.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                        <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Parent</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{parent.name}</strong>? This action cannot be undone and may affect linked children records.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Parent
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}