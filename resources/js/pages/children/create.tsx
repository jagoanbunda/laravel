import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { FloatingLabelSelect } from '@/components/ui/floating-label-select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SelectItem } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';

interface Parent {
    id: number;
    name: string;
}

interface Props {
    parents: Parent[];
    selected_parent_id?: string;
}

export default function ChildCreate({ parents, selected_parent_id }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        date_of_birth: '',
        gender: '',
        user_id: selected_parent_id || '',
        birth_weight: '',
        birth_height: '',
        birth_head_circumference: '',
        blood_type: '',
        allergy_notes: '',
        is_active: true,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/children');
    };

    return (
        <AppLayout title="Add Child">
            <Head title="Add Child" />

            <div className="space-y-6 max-w-2xl mx-auto">
                {/* Breadcrumbs & Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/children" className="hover:text-primary hover:underline flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Children
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Add New Child</h1>
                    <p className="text-muted-foreground">Register a new child</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <FloatingLabelInput
                                    id="name"
                                    label="Child Name *"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter child's name"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}

                                <FloatingLabelSelect
                                    label="Parent *"
                                    value={data.user_id}
                                    onValueChange={(value) => setData('user_id', value)}
                                    placeholder="Select parent"
                                    error={errors.user_id}
                                >
                                    {parents.map((parent) => (
                                        <SelectItem key={parent.id} value={String(parent.id)}>
                                            {parent.name}
                                        </SelectItem>
                                    ))}
                                </FloatingLabelSelect>
                                {errors.user_id && (
                                    <p className="text-sm text-red-500">{errors.user_id}</p>
                                )}

                                <FloatingLabelInput
                                    id="date_of_birth"
                                    type="date"
                                    label="Date of Birth *"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                    className={errors.date_of_birth ? 'border-red-500' : ''}
                                />
                                {errors.date_of_birth && (
                                    <p className="text-sm text-red-500">{errors.date_of_birth}</p>
                                )}

                                <FloatingLabelSelect
                                    label="Gender *"
                                    value={data.gender}
                                    onValueChange={(value) => setData('gender', value)}
                                    placeholder="Select gender"
                                    error={errors.gender}
                                >
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </FloatingLabelSelect>
                                {errors.gender && (
                                    <p className="text-sm text-red-500">{errors.gender}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Birth Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-4">
                                    <FloatingLabelInput
                                        id="birth_weight"
                                        label="Birth Weight (kg)"
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

                                    <FloatingLabelInput
                                        id="birth_height"
                                        label="Birth Height (cm)"
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

                                    <FloatingLabelInput
                                        id="birth_head_circumference"
                                        label="Head Circumference (cm)"
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

                                <div className="space-y-4">
                                    <FloatingLabelSelect
                                        label="Blood Type"
                                        value={data.blood_type}
                                        onValueChange={(value) => setData('blood_type', value)}
                                        placeholder="Select blood type"
                                    >
                                        <SelectItem value="A">A</SelectItem>
                                        <SelectItem value="B">B</SelectItem>
                                        <SelectItem value="AB">AB</SelectItem>
                                        <SelectItem value="O">O</SelectItem>
                                    </FloatingLabelSelect>

                                    <FloatingLabelInput
                                        id="allergy_notes"
                                        label="Allergy Notes"
                                        value={data.allergy_notes}
                                        onChange={(e) => setData('allergy_notes', e.target.value)}
                                        placeholder="Any known allergies"
                                        className={errors.allergy_notes ? 'border-red-500' : ''}
                                    />
                                    {errors.allergy_notes && (
                                        <p className="text-sm text-red-500">{errors.allergy_notes}</p>
                                    )}

                                    <div className="flex items-center gap-2 pt-2">
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                        <Label htmlFor="is_active">Active Status</Label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/children">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-emerald-500 hover:bg-emerald-600">
                            {processing ? 'Saving...' : 'Create Child'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
