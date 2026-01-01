import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';

interface Props {
    parent: {
        id: number;
        full_name: string;
        email: string;
        phone: string | null;
        address: string | null;
    };
}

export default function ParentEdit({ parent }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        full_name: parent.full_name || '',
        email: parent.email || '',
        phone: parent.phone || '',
        address: parent.address || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/parents/${parent.id}`);
    };

    return (
        <AppLayout title="Edit Parent">
            <Head title={`Edit ${parent.full_name}`} />

            <div className="space-y-6">
                {/* Breadcrumbs & Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/parents" className="hover:text-primary hover:underline flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Parents
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Parent</h1>
                    <p className="text-muted-foreground">Update parent information</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Parent Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name *</Label>
                                    <Input
                                        id="full_name"
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        placeholder="Enter full name"
                                        className={errors.full_name ? 'border-red-500' : ''}
                                    />
                                    {errors.full_name && (
                                        <p className="text-sm text-red-500">{errors.full_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter email address"
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Enter phone number"
                                        className={errors.phone ? 'border-red-500' : ''}
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-500">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Enter address"
                                        className={errors.address ? 'border-red-500' : ''}
                                    />
                                    {errors.address && (
                                        <p className="text-sm text-red-500">{errors.address}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/parents">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-emerald-500 hover:bg-emerald-600">
                            {processing ? 'Saving...' : 'Update Parent'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
