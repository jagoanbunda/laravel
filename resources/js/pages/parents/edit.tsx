import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';

interface Props {
    parent: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        push_notifications: boolean;
        weekly_report: boolean;
    };
}

export default function ParentEdit({ parent }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: parent.name || '',
        email: parent.email || '',
        phone: parent.phone || '',
        address: parent.address || '',
        push_notifications: parent.push_notifications ?? true,
        weekly_report: parent.weekly_report ?? true,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/parents/${parent.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit ${parent.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/parents" className="hover:text-primary hover:underline flex items-center gap-1 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Parents
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Parent</h1>
                    <p className="text-muted-foreground mt-1">
                        Update parent account information.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* All Information in One Card */}
                    <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-8">
                        {/* Personal Information */}
                        <div>
                            <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-4">
                                Personal Information
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <FloatingLabelInput
                                    id="name"
                                    label="Full legal name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={!!errors.name}
                                />

                                <FloatingLabelInput
                                    id="email"
                                    label="Email address"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    error={!!errors.email}
                                />
                            </div>
                            {(errors.name || errors.email) && (
                                <p className="text-sm text-red-500 mt-2">{errors.name || errors.email}</p>
                            )}
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-4">
                                Contact Information
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <FloatingLabelInput
                                    id="phone"
                                    label="Phone number"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    error={!!errors.phone}
                                />

                                <FloatingLabelInput
                                    id="address"
                                    label="Address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    error={!!errors.address}
                                />
                            </div>
                        </div>

                        {/* Notification Preferences */}
                        <div>
                            <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-4">
                                Notification Preferences
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="push_notifications" className="font-medium">Push notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive push notifications for important updates.
                                        </p>
                                    </div>
                                    <Switch
                                        id="push_notifications"
                                        checked={data.push_notifications}
                                        onCheckedChange={(checked) => setData('push_notifications', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="weekly_report" className="font-medium">Weekly report</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive weekly summary reports via email.
                                        </p>
                                    </div>
                                    <Switch
                                        id="weekly_report"
                                        checked={data.weekly_report}
                                        onCheckedChange={(checked) => setData('weekly_report', checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center pt-4">
                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="bg-gray-900 hover:bg-gray-800 text-white px-12 py-3 rounded-full text-sm font-medium tracking-wide uppercase"
                        >
                            {processing ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
