import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import GrowthTabContent from '@/components/children/growth-tab';
import PmtTabContent from '@/components/children/pmt-tab';
import ScreeningsTabContent from '@/components/children/screenings-tab';
import NutritionTabContent from '@/components/children/nutrition-tab';
import {
    ArrowLeft,
    Edit,
    Plus,
    User,
    Phone,
    Cake,
    Scale,
    TrendingUp,
    Ruler,
    Activity,
    Utensils,
    ClipboardList,
    Pill,
    Syringe,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    AlertTriangle,
    ArrowRight,
} from 'lucide-react';

interface Props {
    child: {
        id: number;
        name: string;
        date_of_birth: string;
        gender: string;
        avatar_url?: string;
        birth_weight?: number;
        birth_height?: number;
        birth_head_circumference?: number;
        is_active: boolean;
        parent: {
            id: number;
            name: string;
            email: string;
            phone?: string;
        };
        growth_data: any[];
        food_logs: any[];
        pmt_schedules: any[];
        screenings: any[];
    };
}

const recentActivities = [
    {
        id: 1,
        type: 'vaccine',
        title: 'Polio Vaccine Administered',
        time: 'Today, 10:30 AM by Dr. Smith',
        icon: Syringe,
        color: 'bg-blue-100 text-blue-600',
    },
    {
        id: 2,
        type: 'checkup',
        title: 'Growth Check-up',
        time: '2 days ago, 9:00 AM',
        icon: Ruler,
        color: 'bg-emerald-100 text-emerald-600',
    },
    {
        id: 3,
        type: 'supplement',
        title: 'Vitamin A Supplement',
        time: '1 week ago',
        icon: Pill,
        color: 'bg-purple-100 text-purple-600',
    },
];

const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'growth', label: 'Growth', icon: TrendingUp },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
    { id: 'screenings', label: 'Screenings', icon: ClipboardList },
    { id: 'pmt', label: 'PMT', icon: Pill },
];

function getStatusBadge(status: string) {
    const configs: Record<string, { label: string; bgClass: string; textClass: string }> = {
        normal: { label: 'Normal', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' },
        moderate: { label: 'Moderate', bgClass: 'bg-amber-100', textClass: 'text-amber-700' },
        severe: { label: 'Severe', bgClass: 'bg-red-100', textClass: 'text-red-700' },
    };
    const config = configs[status] || configs.normal;
    return (
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${config.bgClass} ${config.textClass}`}>
            {config.label}
        </span>
    );
}

// Helper to calculate age from date of birth
function calculateAge(dateOfBirth: string) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    return { years, months, totalMonths: ageInMonths };
}

export default function ChildDetail({ child }: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const age = calculateAge(child.date_of_birth);
    const latestGrowth = child.growth_data[0]; // Most recent measurement

    return (
        <AppLayout title="Child Profile">
            <Head title={`${child.name} - Child Profile`} />

            <div className="space-y-6">
                {/* Breadcrumbs & Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/children" className="hover:text-primary hover:underline flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Children
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">{child.name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h1 className="text-2xl font-bold tracking-tight">Child Profile</h1>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="gap-2">
                                <Edit className="h-4 w-4" />
                                Edit Profile
                            </Button>
                            <Button className="gap-2 bg-[#DEEBC5] text-black hover:bg-[#c5daa6]">
                                <Plus className="h-4 w-4" />
                                Add Measurement
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Left Column: Profile Card */}
                    <aside className={`w-full flex flex-col gap-6 lg:sticky lg:top-24 transition-all duration-300 ${sidebarCollapsed ? 'lg:w-auto' : 'lg:w-1/3'}`}>
                        <Card className="overflow-hidden" style={{ background: 'linear-gradient(180deg, #DEEBC5 0%, #DEEBC5 120px, white 120px, white 100%)' }}>
                            {/* Collapse Toggle Button */}
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="hidden lg:flex absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            >
                                {sidebarCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                            </button>

                            {/* Profile Header */}
                            <div className={`p-6 flex flex-col items-center border-b ${sidebarCollapsed ? 'py-4' : ''}`}>
                                <div className="relative mb-4">
                                    <div className={`rounded-full flex items-center justify-center font-bold border-4 border-white shadow-md transition-all ${sidebarCollapsed ? 'w-16 h-16 text-xl' : 'w-28 h-28 text-3xl'} ${child.gender === 'female' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {child.name.charAt(0)}
                                    </div>
                                    <div className={`absolute rounded-full border-2 border-white ${sidebarCollapsed ? 'bottom-0 right-0 w-4 h-4' : 'bottom-1 right-1 w-5 h-5'}`} style={{ backgroundColor: '#9aba59' }} title="Active Status" />
                                </div>
                                {!sidebarCollapsed && (
                                    <>
                                        <h2 className="text-xl font-bold text-center mb-1">{child.name}</h2>
                                        <Badge variant="secondary" className="mb-4">ID: #{child.id}</Badge>
                                        <div className="flex justify-center gap-6 w-full">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs text-muted-foreground uppercase tracking-wide">Age</span>
                                                <span className="font-semibold">{age.years} Yrs {age.months} Mo</span>
                                            </div>
                                            <div className="w-px h-8 bg-border" />
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs text-muted-foreground uppercase tracking-wide">Gender</span>
                                                <span className="font-semibold capitalize">{child.gender}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {sidebarCollapsed && (
                                    <p className="text-sm font-semibold text-center mt-1">{child.name.split(' ')[0]}</p>
                                )}
                            </div>

                            {/* Profile Details - Hidden when collapsed */}
                            {!sidebarCollapsed && (
                                <CardContent className="p-0">
                                    <div className="px-6 py-4 border-b flex items-center gap-3 hover:bg-muted/50 transition-colors">
                                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Primary Guardian</p>
                                            <p className="text-sm font-medium">{child.parent.name}</p>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 border-b flex items-center gap-3 hover:bg-muted/50 transition-colors">
                                        <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Contact Number</p>
                                            <p className="text-sm font-medium">{child.parent.phone}</p>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 border-b flex items-center gap-3 hover:bg-muted/50 transition-colors">
                                        <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                                            <Cake className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Date of Birth</p>
                                            <p className="text-sm font-medium">
                                                {new Date(child.date_of_birth).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                                        <div className="bg-teal-100 text-teal-600 p-2 rounded-lg">
                                            <Scale className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Birth Weight</p>
                                            <p className="text-sm font-medium">{child.birth_weight} kg</p>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </aside>

                    {/* Right Column: Tabs & Content */}
                    <main className={`w-full flex flex-col gap-6 transition-all duration-300 ${sidebarCollapsed ? 'lg:flex-1' : 'lg:w-2/3'}`}>
                        {/* Tabs */}
                        <Card className="p-1">
                            <nav className="flex gap-1 overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-3 text-sm font-medium rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === tab.id
                                            ? 'bg-[#DEEBC5] text-[#000000]'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                    >
                                        <tab.icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </Card>

                        {/* Content Area */}
                        {activeTab === 'growth' ? (
                            <GrowthTabContent />
                        ) : activeTab === 'pmt' ? (
                            <PmtTabContent />
                        ) : activeTab === 'screenings' ? (
                            <ScreeningsTabContent />
                        ) : activeTab === 'nutrition' ? (
                            <NutritionTabContent />
                        ) : (
                            <div className="flex flex-col gap-6">
                                {/* Latest Measurements Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Weight */}
                                    <Card className="relative overflow-hidden group">
                                        <CardContent className="p-5">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Scale className="h-16 w-16 text-emerald-500" />
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Scale className="h-5 w-5" />
                                                <span className="text-sm font-medium">Weight</span>
                                            </div>
                                            <div className="flex items-baseline gap-2 mt-2">
                                                <span className="text-3xl font-bold tracking-tight">{latestGrowth?.weight || '-'}</span>
                                                <span className="text-sm font-medium text-muted-foreground">kg</span>
                                            </div>
                                            <div className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md mt-2" style={{ backgroundColor: '#DEEBC5', color: '#000000' }}>
                                                <TrendingUp className="h-3 w-3" />
                                                {latestGrowth ? 'Latest measurement' : 'No data'}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Height */}
                                    <Card className="relative overflow-hidden group">
                                        <CardContent className="p-5">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Ruler className="h-16 w-16 text-blue-500" />
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Ruler className="h-5 w-5" />
                                                <span className="text-sm font-medium">Height</span>
                                            </div>
                                            <div className="flex items-baseline gap-2 mt-2">
                                                <span className="text-3xl font-bold tracking-tight">{latestGrowth?.height || '-'}</span>
                                                <span className="text-sm font-medium text-muted-foreground">cm</span>
                                            </div>
                                            <div className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md mt-2" style={{ backgroundColor: '#DEEBC5', color: '#000000' }}>
                                                <TrendingUp className="h-3 w-3" />
                                                {latestGrowth ? 'Latest measurement' : 'No data'}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* MUAC */}
                                    <Card className="relative overflow-hidden group">
                                        <CardContent className="p-5">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Activity className="h-16 w-16 text-purple-500" />
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Activity className="h-5 w-5" />
                                                <span className="text-sm font-medium">MUAC</span>
                                            </div>
                                            <div className="flex items-baseline gap-2 mt-2">
                                                <span className="text-3xl font-bold tracking-tight">{latestGrowth?.head_circumference || '-'}</span>
                                                <span className="text-sm font-medium text-muted-foreground">cm</span>
                                            </div>
                                            <div className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md mt-2">
                                                No change
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Health Status Summary */}
                                    {/* Quick Health Overview */}
                                    <Card className="flex flex-col h-full">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg">Health Overview</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col gap-4">
                                            {/* Nutritional Status */}
                                            <div className="flex items-center justify-between p-3 rounded-lg border" style={{ backgroundColor: '#DEEBC5', borderColor: '#c5daa6' }}>
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-white p-2 rounded-full shadow-sm" style={{ color: '#6b8a3e' }}>
                                                        <Utensils className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold" style={{ color: '#000000' }}>Nutritional Status</p>
                                                        <p className="text-xs" style={{ color: '#000000' }}>Within normal range</p>
                                                    </div>
                                                </div>
                                                {getStatusBadge('normal')}
                                            </div>

                                            {/* Stunting Status */}
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-white p-2 rounded-full shadow-sm text-amber-600">
                                                        <Ruler className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-amber-900">Stunting Risk</p>
                                                        <p className="text-xs text-amber-700">Height-for-age is slightly low</p>
                                                    </div>
                                                </div>
                                                {getStatusBadge('normal')}
                                            </div>

                                            {/* Wasting Status */}
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-white p-2 rounded-full shadow-sm text-gray-600">
                                                        <Scale className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">Wasting</p>
                                                        <p className="text-xs text-muted-foreground">Weight-for-height ratio</p>
                                                    </div>
                                                </div>
                                                {getStatusBadge('normal')}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Recent Activity Timeline */}
                                    <Card className="flex flex-col h-full">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <CardTitle className="text-lg">Recent Activity</CardTitle>
                                            <Button variant="link" size="sm" style={{ color: '#000000' }}>View All</Button>
                                        </CardHeader>
                                        <CardContent className="relative">
                                            {/* Vertical Line */}
                                            <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-border" />
                                            <div className="space-y-6">
                                                {recentActivities.map((activity) => (
                                                    <div key={activity.id} className="relative flex gap-4">
                                                        <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0 border-2 border-white ${activity.color}`}>
                                                            <activity.icon className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-sm font-medium">{activity.title}</p>
                                                            <span className="text-xs text-muted-foreground">{activity.time}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Action Footer */}
                                <Card className="p-4">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                                                <AlertTriangle className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">Screening Due</p>
                                                <p className="text-xs text-muted-foreground">Developmental screening is due for 24 months.</p>
                                            </div>
                                        </div>
                                        <Button className="w-full sm:w-auto gap-2 bg-gray-900 hover:bg-gray-800">
                                            Start Screening
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </AppLayout>
    );
}

