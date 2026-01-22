import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Mail, Phone, Lock, Save, X } from 'lucide-react';
import { FormEvent } from 'react';

export default function ParentCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',

    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/parents');
    };

    return (
        <AppLayout title="Add Parent">
            <Head title="Add Parent" />

            <div className="-m-4 lg:-m-6 bg-[#F8F9F5] min-h-[calc(100vh-4rem)] p-4 lg:p-6">
                <div className="max-w-3xl space-y-6">
                {/* Breadcrumbs & Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/parents" className="hover:text-primary hover:underline flex items-center gap-1 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Parents
                        </Link>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add New Parent</h1>
                        <p className="text-muted-foreground mt-1">Create a new parent account to manage children and schedules.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card className="bg-white shadow-sm border-gray-200">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-xl">Parent Information</CardTitle>
                            <CardDescription>
                                Enter the personal details for the new parent account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2.5">
                                    <Label htmlFor="name" className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        Full Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. John Doe"
                                        className={`bg-white border-gray-200 transition-all ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        Email Address <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="e.g. john@example.com"
                                        className={`bg-white border-gray-200 transition-all ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2.5">
                                    <Label htmlFor="phone" className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="e.g. +1 234 567 890"
                                        className={`bg-white border-gray-200 transition-all ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    <Label htmlFor="password" className="flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                        Password <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Min. 8 characters"
                                        className={`bg-white border-gray-200 transition-all ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Must be at least 8 characters long.
                                    </p>
                                    {errors.password && (
                                        <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-4 sticky bottom-4 md:static p-4 md:p-0 bg-background/80 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none rounded-lg border md:border-none border-border/50 shadow-lg md:shadow-none z-10">
                        <Button variant="ghost" asChild className="gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full">
                            <Link href="/parents">
                                <X className="h-4 w-4" />
                                Cancel
                            </Link>
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="bg-black hover:bg-gray-900 text-white gap-2 shadow-sm transition-all rounded-full"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'Creating...' : 'Create Parent'}
                        </Button>
                    </div>
                </form>
            </div>
            </div>
        </AppLayout>
    );
}
