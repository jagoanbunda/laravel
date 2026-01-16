import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Bell,
    Moon,
    Sun,
    Mail,
    Smartphone,
    Shield,
    Globe,
    Save,
} from 'lucide-react';
import { FormEvent, useState, useEffect } from 'react';
import type { User } from '@/types/models';

interface Props {
    user: User;
    settings: {
        push_notifications: boolean;
        weekly_report: boolean;
        theme: 'light' | 'dark' | 'system';
        language: string;
    };
}

export default function SettingsIndex({ user, settings }: Props) {
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(settings.theme || 'system');
    
    const { data, setData, post, processing } = useForm({
        push_notifications: settings.push_notifications ?? true,
        weekly_report: settings.weekly_report ?? true,
        theme: settings.theme || 'system',
        language: settings.language || 'id',
    });

    // Apply theme on change
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else if (theme === 'light') {
            root.classList.remove('dark');
        } else {
            // System preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
        setData('theme', theme);
    }, [theme]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/settings');
    };

    return (
        <AppLayout title="Settings">
            <Head title="Settings" />

            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your account preferences and application settings.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Appearance Settings */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sun className="h-5 w-5" />
                                Appearance
                            </CardTitle>
                            <CardDescription>
                                Customize how JagoanBunda looks on your device.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base font-medium">Theme</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Select your preferred color scheme.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={theme === 'light' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setTheme('light')}
                                        className="gap-2"
                                    >
                                        <Sun className="h-4 w-4" />
                                        Light
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={theme === 'dark' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setTheme('dark')}
                                        className="gap-2"
                                    >
                                        <Moon className="h-4 w-4" />
                                        Dark
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={theme === 'system' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setTheme('system')}
                                        className="gap-2"
                                    >
                                        <Globe className="h-4 w-4" />
                                        System
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notifications
                            </CardTitle>
                            <CardDescription>
                                Configure how you want to receive updates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-info-muted flex items-center justify-center text-info">
                                        <Smartphone className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-base font-medium">Push Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive alerts for screenings, PMT reminders, and updates.
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={data.push_notifications}
                                    onCheckedChange={(checked) => setData('push_notifications', checked)}
                                />
                            </div>

                            <div className="border-t border-border/50" />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-success-muted flex items-center justify-center text-success">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-base font-medium">Weekly Report</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get a summary email of your children's progress every week.
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={data.weekly_report}
                                    onCheckedChange={(checked) => setData('weekly_report', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Security */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Account & Security
                            </CardTitle>
                            <CardDescription>
                                Manage your account security and data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Email Address</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <a href="/profile">Edit Profile</a>
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Password</p>
                                    <p className="text-sm text-muted-foreground">Last changed: Never</p>
                                </div>
                                <Button variant="outline" size="sm">
                                    Change Password
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-danger-muted/50 border border-danger/20">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-danger">Delete Account</p>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently delete your account and all data.
                                    </p>
                                </div>
                                <Button variant="destructive" size="sm">
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
