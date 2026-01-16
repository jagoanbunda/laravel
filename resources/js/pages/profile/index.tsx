import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Camera,
    Save,
} from 'lucide-react';
import { FormEvent, useRef } from 'react';
import type { User as UserType } from '@/types/models';

interface Props {
    user: UserType;
}

export default function ProfileEdit({ user }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const { data, setData, post, processing, errors } = useForm({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: null as File | null,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/profile', {
            forceFormData: true,
        });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
        }
    };

    return (
        <AppLayout title="Edit Profile">
            <Head title="Edit Profile" />

            <div className="space-y-6 max-w-3xl mx-auto">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/settings" className="hover:text-primary hover:underline flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Settings
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
                    <p className="text-muted-foreground mt-1">
                        Update your personal information and profile picture.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Section */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle>Profile Picture</CardTitle>
                            <CardDescription>
                                Click to upload a new profile photo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <div 
                                    className="relative cursor-pointer group"
                                    onClick={handleAvatarClick}
                                >
                                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden">
                                        {data.avatar ? (
                                            <img 
                                                src={URL.createObjectURL(data.avatar)} 
                                                alt="Preview" 
                                                className="h-full w-full object-cover"
                                            />
                                        ) : user.avatar_url ? (
                                            <img 
                                                src={user.avatar_url} 
                                                alt={user.full_name} 
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            user.full_name?.charAt(0) || 'U'
                                        )}
                                    </div>
                                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="h-6 w-6 text-white" />
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{user.full_name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        JPG, PNG or GIF. Max size 2MB.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>
                                Update your personal details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name" className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        Full Name
                                    </Label>
                                    <Input
                                        id="full_name"
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        placeholder="Enter your full name"
                                        className={errors.full_name ? 'border-danger' : ''}
                                    />
                                    {errors.full_name && (
                                        <p className="text-sm text-danger">{errors.full_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter your email"
                                        className={errors.email ? 'border-danger' : ''}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-danger">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="Enter your phone number"
                                    className={errors.phone ? 'border-danger' : ''}
                                />
                                {errors.phone && (
                                    <p className="text-sm text-danger">{errors.phone}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Info (Read-only) */}
                    <Card className="border-border/50 shadow-sm bg-muted/20">
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>
                                These details are managed by the system.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-3 rounded-lg bg-background">
                                    <p className="text-xs text-muted-foreground">Account Created</p>
                                    <p className="text-sm font-medium">
                                        {new Date(user.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-background">
                                    <p className="text-xs text-muted-foreground">Email Verified</p>
                                    <p className="text-sm font-medium">
                                        {user.email_verified_at ? (
                                            <span className="text-success">Verified</span>
                                        ) : (
                                            <span className="text-warning">Not Verified</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                        <Button variant="outline" asChild>
                            <Link href="/settings">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
