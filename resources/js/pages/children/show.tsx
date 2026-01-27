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
    ChevronRight,
    AlertTriangle,
    ArrowRight,
} from 'lucide-react';

import {
    type Asq3ScreeningDetail,
    type Asq3ScreeningHistoryItem,
} from '@/types/models';

interface PmtScheduleItem {
    id: number;
    food_name: string | null;
    scheduled_date: string;
    portion: 'habis' | 'half' | 'quarter' | 'none' | null;
    portion_label: string | null;
    logged_at: string | null;
    photo_url: string | null;
    notes: string | null;
}

interface FoodLogItem {
    id: number;
    food_name: string | null;
    quantity: string;
    serving_size: string;
    calories: string;
    protein: string;
}

interface FoodLog {
    id: number;
    log_date: string;
    meal_time: string | null;
    total_calories: string;
    total_protein: string;
    total_fat: string;
    total_carbohydrate: string;
    notes: string | null;
    items: FoodLogItem[];
}

interface GrowthMeasurement {
    id: number;
    measurement_date: string;
    age_in_months: number | null;
    age_label: string;
    weight: number;
    height: number;
    head_circumference: number;
    is_lying: boolean;
    measurement_location: string;
    weight_for_age_zscore: number;
    height_for_age_zscore: number;
    weight_for_height_zscore: number;
    bmi_for_age_zscore: number;
    nutritional_status: string;
    stunting_status: string;
    wasting_status: string;
}

interface GrowthDataPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface GrowthData {
    chart_data: GrowthMeasurement[];
    table_data: GrowthMeasurement[];
    pagination: GrowthDataPagination;
}

interface GrowthFilters {
    date_range: string;
    chart_type: string;
}

interface PmtStatus {
    status: 'healthy' | 'needs_enrollment' | 'active' | 'no_data';
    latest_nutritional_status: string | null;
    latest_stunting_status: string | null;
    latest_wasting_status: string | null;
    has_active_program: boolean;
    has_historical_programs: boolean;
    message: string;
}

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
        growth_data: GrowthData;
        food_logs: FoodLog[];
        pmt_schedules: PmtScheduleItem[];
        pmt_status: PmtStatus;
        screenings: {
            latestScreening: Asq3ScreeningDetail | null;
            screeningHistory: Asq3ScreeningHistoryItem[];
        };
    };
    growth_filters: GrowthFilters;
}

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

export default function ChildDetail({ child, growth_filters }: Props) {
    const [activeTab, setActiveTab] = useState('overview');

    const age = calculateAge(child.date_of_birth);
    const chartData = child.growth_data.chart_data;
    const latestGrowth = chartData.length > 0 ? chartData[chartData.length - 1] : null; // Most recent measurement

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

                {/* Compact Profile Header */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                            {/* Avatar & Basic Info */}
                            <div className="flex items-center gap-4 p-4 md:p-5">
                                <div className="relative">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl border-4 border-white shadow-md ${child.gender === 'female' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {child.name.charAt(0)}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: '#9aba59' }} title="Active Status" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">{child.name}</h2>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Badge variant="secondary" className="text-xs">ID: #{child.id}</Badge>
                                        <span>•</span>
                                        <span>{age.years} Yrs {age.months} Mo</span>
                                        <span>•</span>
                                        <span className="capitalize">{child.gender}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block w-px h-12 bg-border" />

                            {/* Details Grid */}
                            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:py-4 md:pr-5 border-t md:border-t-0">
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Guardian</p>
                                        <p className="text-sm font-medium truncate">{child.parent.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="bg-purple-100 text-purple-600 p-1.5 rounded-lg">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Phone</p>
                                        <p className="text-sm font-medium truncate">{child.parent.phone || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="bg-orange-100 text-orange-600 p-1.5 rounded-lg">
                                        <Cake className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Born</p>
                                        <p className="text-sm font-medium">
                                            {new Date(child.date_of_birth).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="bg-teal-100 text-teal-600 p-1.5 rounded-lg">
                                        <Scale className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Birth Weight</p>
                                        <p className="text-sm font-medium">{child.birth_weight} kg</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                    <GrowthTabContent
                        childId={child.id}
                        growthData={child.growth_data}
                        filters={growth_filters}
                    />
                ) : activeTab === 'pmt' ? (
                    <PmtTabContent
                        childId={child.id}
                        schedules={child.pmt_schedules}
                        pmtStatus={child.pmt_status}
                        onTabChange={setActiveTab}
                    />
                ) : activeTab === 'screenings' ? (
                    <ScreeningsTabContent
                        childId={child.id}
                        latestScreening={child.screenings.latestScreening}
                        screeningHistory={child.screenings.screeningHistory}
                    />
                ) : activeTab === 'nutrition' ? (
                    <NutritionTabContent foodLogs={child.food_logs} />
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

                        <div className="grid grid-cols-1 gap-6">
                            {/* Quick Health Overview */}
                            <Card>
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
            </div>
        </AppLayout>
    );
}

