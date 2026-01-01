import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';

interface Child {
    id: number;
    name: string;
    parent_name: string;
    date_of_birth: string;
    age_in_months: number;
}

interface AgeInterval {
    id: number;
    age_months: number;
    age_label: string;
    min_age_days: number;
    max_age_days: number;
}

interface Screening {
    id: number;
    child_id: number;
    age_interval_id: number;
    screening_date: string;
}

interface Props {
    screening: Screening;
    children: Child[];
    ageIntervals: AgeInterval[];
}

export default function ScreeningEdit({ screening, children, ageIntervals }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        child_id: String(screening.child_id),
        age_interval_id: String(screening.age_interval_id),
        screening_date: screening.screening_date,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/screenings/${screening.id}`);
    };

    const selectedChild = children.find(c => String(c.id) === data.child_id);

    return (
        <AppLayout title="Edit Screening">
            <Head title="Edit Screening" />

            <div className="space-y-6">
                {/* Breadcrumbs & Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/screenings" className="hover:text-primary hover:underline flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Screenings
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit ASQ-3 Screening</h1>
                    <p className="text-muted-foreground">Update screening information</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Screening Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="child_id">Child *</Label>
                                    <Select
                                        value={data.child_id}
                                        onValueChange={(value) => setData('child_id', value)}
                                    >
                                        <SelectTrigger className={errors.child_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select child" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {children.map((child) => (
                                                <SelectItem key={child.id} value={String(child.id)}>
                                                    {child.name} ({child.parent_name})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.child_id && (
                                        <p className="text-sm text-red-500">{errors.child_id}</p>
                                    )}

                                    {selectedChild && (
                                        <p className="text-sm text-muted-foreground">
                                            Age: {selectedChild.age_in_months} months
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="screening_date">Screening Date *</Label>
                                    <Input
                                        id="screening_date"
                                        type="date"
                                        value={data.screening_date}
                                        onChange={(e) => setData('screening_date', e.target.value)}
                                        className={errors.screening_date ? 'border-red-500' : ''}
                                    />
                                    {errors.screening_date && (
                                        <p className="text-sm text-red-500">{errors.screening_date}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="age_interval_id">Age Interval *</Label>
                                <Select
                                    value={data.age_interval_id}
                                    onValueChange={(value) => setData('age_interval_id', value)}
                                >
                                    <SelectTrigger className={errors.age_interval_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select age interval" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ageIntervals.map((interval) => (
                                            <SelectItem key={interval.id} value={String(interval.id)}>
                                                {interval.age_label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.age_interval_id && (
                                    <p className="text-sm text-red-500">{errors.age_interval_id}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/screenings">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-emerald-500 hover:bg-emerald-600">
                            {processing ? 'Saving...' : 'Update Screening'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
