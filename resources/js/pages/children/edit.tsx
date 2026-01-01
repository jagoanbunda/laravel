import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';

interface Parent {
    id: number;
    full_name: string;
}

interface Child {
    id: number;
    name: string;
    date_of_birth: string;
    gender: string;
    user_id: number;
    birth_weight: number | null;
    birth_height: number | null;
    birth_head_circumference: number | null;
    blood_type: string | null;
    allergy_notes: string | null;
    is_active: boolean;
}

interface Props {
    child: Child;
    parents: Parent[];
}

export default function ChildEdit({ child, parents }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: child.name || '',
        date_of_birth: child.date_of_birth || '',
        gender: child.gender || '',
        user_id: String(child.user_id) || '',
        birth_weight: child.birth_weight !== null ? String(child.birth_weight) : '',
        birth_height: child.birth_height !== null ? String(child.birth_height) : '',
        birth_head_circumference: child.birth_head_circumference !== null ? String(child.birth_head_circumference) : '',
        blood_type: child.blood_type || '',
        allergy_notes: child.allergy_notes || '',
        is_active: child.is_active,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/children/${child.id}`);
    };

    return (
        <AppLayout title="Edit Child">
            <Head title={`Edit ${child.name}`} />

            <div className="space-y-6">
                {/* Breadcrumbs & Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/children" className="hover:text-primary hover:underline flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Children
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Child</h1>
                    <p className="text-muted-foreground">Update child information</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Child Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter child's name"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="user_id">Parent *</Label>
                                    <Select
                                        value={data.user_id}
                                        onValueChange={(value) => setData('user_id', value)}
                                    >
                                        <SelectTrigger className={errors.user_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select parent" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {parents.map((parent) => (
                                                <SelectItem key={parent.id} value={String(parent.id)}>
                                                    {parent.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.user_id && (
                                        <p className="text-sm text-red-500">{errors.user_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                        className={errors.date_of_birth ? 'border-red-500' : ''}
                                    />
                                    {errors.date_of_birth && (
                                        <p className="text-sm text-red-500">{errors.date_of_birth}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender *</Label>
                                    <Select
                                        value={data.gender}
                                        onValueChange={(value) => setData('gender', value)}
                                    >
                                        <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && (
                                        <p className="text-sm text-red-500">{errors.gender}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Birth Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="birth_weight">Birth Weight (kg)</Label>
                                    <Input
                                        id="birth_weight"
                                        type="number"
                                        step="0.01"
                                        value={data.birth_weight}
                                        onChange={(e) => setData('birth_weight', e.target.value)}
                                        placeholder="e.g., 3.5"
                                        className={errors.birth_weight ? 'border-red-500' : ''}
                                    />
                                    {errors.birth_weight && (
                                        <p className="text-sm text-red-500">{errors.birth_weight}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="birth_height">Birth Height (cm)</Label>
                                    <Input
                                        id="birth_height"
                                        type="number"
                                        step="0.1"
                                        value={data.birth_height}
                                        onChange={(e) => setData('birth_height', e.target.value)}
                                        placeholder="e.g., 50"
                                        className={errors.birth_height ? 'border-red-500' : ''}
                                    />
                                    {errors.birth_height && (
                                        <p className="text-sm text-red-500">{errors.birth_height}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="birth_head_circumference">Head Circumference (cm)</Label>
                                    <Input
                                        id="birth_head_circumference"
                                        type="number"
                                        step="0.1"
                                        value={data.birth_head_circumference}
                                        onChange={(e) => setData('birth_head_circumference', e.target.value)}
                                        placeholder="e.g., 35"
                                        className={errors.birth_head_circumference ? 'border-red-500' : ''}
                                    />
                                    {errors.birth_head_circumference && (
                                        <p className="text-sm text-red-500">{errors.birth_head_circumference}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="blood_type">Blood Type</Label>
                                    <Select
                                        value={data.blood_type}
                                        onValueChange={(value) => setData('blood_type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select blood type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A">A</SelectItem>
                                            <SelectItem value="B">B</SelectItem>
                                            <SelectItem value="AB">AB</SelectItem>
                                            <SelectItem value="O">O</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="allergy_notes">Allergy Notes</Label>
                                    <Input
                                        id="allergy_notes"
                                        value={data.allergy_notes}
                                        onChange={(e) => setData('allergy_notes', e.target.value)}
                                        placeholder="Any known allergies"
                                        className={errors.allergy_notes ? 'border-red-500' : ''}
                                    />
                                    {errors.allergy_notes && (
                                        <p className="text-sm text-red-500">{errors.allergy_notes}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                                <Label htmlFor="is_active">Active Status</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/children">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-emerald-500 hover:bg-emerald-600">
                            {processing ? 'Saving...' : 'Update Child'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
