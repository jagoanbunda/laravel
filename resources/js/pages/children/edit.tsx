import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SelectItem } from '@/components/ui/select';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { FloatingLabelSelect } from '@/components/ui/floating-label-select';
import { ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';

interface Parent {
    id: number;
    name: string;
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
        <AppLayout>
            <Head title={`Edit ${child.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/children" className="hover:text-primary hover:underline flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Children
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Child</h1>
                    <p className="text-muted-foreground mt-1">
                        Update child profile and birth information.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                        <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-6">
                            Basic Information
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <FloatingLabelInput
                                    id="name"
                                    label="Child Name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter child's name"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                
                                <FloatingLabelSelect
                                    label="Parent"
                                    value={data.user_id}
                                    onValueChange={(value) => setData('user_id', value)}
                                    placeholder="Select parent"
                                    error={!!errors.user_id}
                                >
                                    {parents.map((parent) => (
                                        <SelectItem key={parent.id} value={String(parent.id)}>
                                            {parent.name}
                                        </SelectItem>
                                    ))}
                                </FloatingLabelSelect>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <FloatingLabelInput
                                    id="date_of_birth"
                                    label="Date of Birth"
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                    className={errors.date_of_birth ? 'border-red-500' : ''}
                                />

                                <FloatingLabelSelect
                                    label="Gender"
                                    value={data.gender}
                                    onValueChange={(value) => setData('gender', value)}
                                    placeholder="Select gender"
                                    error={!!errors.gender}
                                >
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </FloatingLabelSelect>
                            </div>
                        </div>
                    </div>

                    {/* Birth Measurements */}
                    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                        <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-6">
                            Birth Measurements
                        </h2>
                        
                        <div className="grid gap-4 md:grid-cols-3">
                            <FloatingLabelInput
                                id="birth_weight"
                                label="Weight (kg)"
                                type="number"
                                step="0.01"
                                value={data.birth_weight}
                                onChange={(e) => setData('birth_weight', e.target.value)}
                                placeholder="e.g., 3.5"
                                className={errors.birth_weight ? 'border-red-500' : ''}
                            />

                            <FloatingLabelInput
                                id="birth_height"
                                label="Height (cm)"
                                type="number"
                                step="0.1"
                                value={data.birth_height}
                                onChange={(e) => setData('birth_height', e.target.value)}
                                placeholder="e.g., 50"
                                className={errors.birth_height ? 'border-red-500' : ''}
                            />

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
                        </div>
                    </div>

                    {/* Medical Information */}
                    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                        <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-6">
                            Medical Information
                        </h2>
                        
                        <div className="grid gap-4 md:grid-cols-2">
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
                        </div>
                    </div>

                    {/* Status */}
                    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                        <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-6">
                            Status
                        </h2>
                        
                        <div className="flex items-center gap-3">
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', checked)}
                            />
                            <Label htmlFor="is_active" className="font-medium">Active Status</Label>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Active children appear in PMT programs and screenings. Inactive children are hidden from selection lists.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center pt-4">
                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="bg-gray-900 hover:bg-gray-800 text-white px-12 py-3 rounded-full text-sm font-medium tracking-wide uppercase"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
