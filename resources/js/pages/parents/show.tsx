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
    MapPin,
    Calendar,
    Baby,
    CheckCircle,
    Clock,
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
        full_name: string;
        email: string;
        phone: string | null;
        address: string | null;
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
        <AppLayout title="Parent Details">
            <Head title={parent.full_name} />

            <div className="space-y-6">
                {/* Breadcrumbs & Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/parents" className="hover:text-primary hover:underline flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Parents
                        </Link>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h1 className="text-2xl font-bold tracking-tight">Parent Details</h1>
                        <div className="flex items-center gap-3">
                            <Link href={`/parents/${parent.id}/edit`}>
                                <Button variant="outline" className="gap-2">
                                    <Edit className="h-4 w-4" />
                                    Edit
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <Card className="lg:col-span-1">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <span className="text-3xl font-bold text-primary">
                                        {(parent.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold mb-1">{parent.full_name}</h2>
                                {parent.email_verified_at ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="gap-1">
                                        <Clock className="h-3 w-3" />
                                        Pending Verification
                                    </Badge>
                                )}
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{parent.email}</span>
                                </div>
                                {parent.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{parent.phone}</span>
                                    </div>
                                )}
                                {parent.address && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span>{parent.address}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        Joined {new Date(parent.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Children List */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Baby className="h-5 w-5 text-primary" />
                                Children
                                <Badge variant="secondary">{parent.children_count}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {parent.children.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Baby className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No children registered</p>
                                    <Link href={`/children/create?parent_id=${parent.id}`}>
                                        <Button variant="outline" className="mt-4">
                                            Add Child
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
                                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                                        child.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                                                    }`}>
                                                        <span className="font-medium">{child.name.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{child.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {age.years} yrs {age.months} mos • {child.gender}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={child.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}>
                                                    {child.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Parent</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{parent.full_name}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
