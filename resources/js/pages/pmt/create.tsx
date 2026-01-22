import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { ArrowLeft, CalendarPlus, Utensils, Save } from 'lucide-react';
import { FormEvent } from 'react';

interface Child {
    id: number;
    name: string;
    parent_name: string;
}

interface Menu {
    id: number;
    name: string;
    description: string | null;
    calories: number | null;
}

interface Props {
    children: Child[];
    menus: Menu[];
}

export default function PmtCreate({ children, menus }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        child_id: '',
        menu_id: '',
        scheduled_date: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/pmt');
    };

    const selectedMenu = menus.find(m => String(m.id) === data.menu_id);

    return (
        <AppLayout>
            <Head title="Schedule PMT" />

            <div className="space-y-6 max-w-3xl">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/pmt" className="hover:text-primary hover:underline flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            PMT Programs
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Schedule New PMT</h1>
                    <p className="text-muted-foreground mt-1">
                        Create a new PMT distribution schedule for a child.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Schedule Information */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarPlus className="h-5 w-5" />
                                Schedule Information
                            </CardTitle>
                            <CardDescription>
                                Select the beneficiary child and the distribution date.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="child_id">Child *</Label>
                                    <Select
                                        value={data.child_id}
                                        onValueChange={(value) => setData('child_id', value)}
                                    >
                                        <SelectTrigger className={errors.child_id ? 'border-danger' : ''}>
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
                                        <p className="text-sm text-danger">{errors.child_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_date">Scheduled Date *</Label>
                                    <Input
                                        id="scheduled_date"
                                        type="date"
                                        value={data.scheduled_date}
                                        onChange={(e) => setData('scheduled_date', e.target.value)}
                                        className={errors.scheduled_date ? 'border-danger' : ''}
                                    />
                                    {errors.scheduled_date && (
                                        <p className="text-sm text-danger">{errors.scheduled_date}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Meal Selection */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Utensils className="h-5 w-5" />
                                Meal Selection
                            </CardTitle>
                            <CardDescription>
                                Choose the PMT menu to be distributed.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="menu_id">PMT Menu *</Label>
                                <Select
                                    value={data.menu_id}
                                    onValueChange={(value) => setData('menu_id', value)}
                                >
                                    <SelectTrigger className={errors.menu_id ? 'border-danger' : ''}>
                                        <SelectValue placeholder="Select menu" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {menus.map((menu) => (
                                            <SelectItem key={menu.id} value={String(menu.id)}>
                                                {menu.name} {menu.calories ? `(${menu.calories} kkal)` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.menu_id && (
                                    <p className="text-sm text-danger">{errors.menu_id}</p>
                                )}

                                {selectedMenu && (
                                    <div className="mt-3 p-4 rounded-lg bg-muted/50 text-sm space-y-2 border border-border/50">
                                        <div className="font-medium">Menu Details</div>
                                        {selectedMenu.description && (
                                            <p className="text-muted-foreground">{selectedMenu.description}</p>
                                        )}
                                        {selectedMenu.calories && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <span className="font-medium text-foreground">Calories:</span> {selectedMenu.calories} kkal
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                        <Button variant="outline" asChild>
                            <Link href="/pmt">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : 'Create Schedule'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
