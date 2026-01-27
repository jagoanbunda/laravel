import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
    Users,
    AlertTriangle,
    ClipboardList,
    ArrowRight,
    TrendingUp,
    Plus,
    Utensils,
    CheckCircle2,
} from 'lucide-react';

import { StatCard } from './components/stat-card';
import { NutritionalPieChart } from './components/nutritional-pie-chart';
import { ScreeningBarChart } from './components/screening-bar-chart';
import { MonthlyTrendsChart } from './components/monthly-trends-chart';

interface Props {
    stats: {
        total_parents: number;
        total_children: number;
        active_children: number;
        at_risk_children: number;
        active_pmt_programs: number;
        total_screenings: number;
    };
    nutritional_distribution: Array<{ name: string; value: number; color: string }>;
    screening_results: Array<{ name: string; value: number; color: string }>;
    pmt_distribution: Array<{ name: string; value: number; color: string }>;
    monthly_trends: Array<{ month: string; children: number; screenings: number }>;
    children_at_risk: Array<{ id: number; name: string; age_months: number; parent_name: string; status: string; last_screening: string; risk_domains: string[] }>;
    recent_activities: Array<{ id: string; type: string; text: string; time: string; timestamp: number }>;
}

function QuickAction({ label, icon: Icon, onClick }: { label: string, icon: any, onClick?: () => void }) {
    return (
        <button
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/60 bg-background hover:border-primary/50 hover:bg-primary/5 hover:shadow-md transition-all group cursor-pointer"
            onClick={onClick}
        >
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 mb-3">
                <Icon className="h-5 w-5 text-foreground group-hover:text-primary-foreground transition-colors" />
            </div>
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
}

function getStatusBadge(status: string | undefined) {
    const variant = status === 'sesuai' ? 'sesuai' 
        : status === 'pantau' ? 'pantau' 
        : status === 'perlu_rujukan' ? 'perlu_rujukan' 
        : 'sesuai';
    
    return <StatusBadge variant={variant} size="sm" />;
}

export default function Dashboard({ stats, nutritional_distribution, screening_results, monthly_trends, children_at_risk, recent_activities }: Props) {
    return (
        <AppLayout title="Dashboard">
            <Head title="Home" />

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
                        <p className="text-muted-foreground mt-1">
                            Welcome back, here's what's happening today.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button className="rounded-full h-10 px-6 font-medium">
                            <Plus className="mr-2 h-4 w-4" />
                            New Entry
                        </Button>
                    </div>
                </div>

                {/* Risk Alert Banner */}
                {children_at_risk.length > 0 && (
                    <Alert variant="error" className="shadow-md border-destructive/30 bg-gradient-to-r from-destructive/10 to-destructive/5">
                        <AlertTitle className="text-base font-semibold">Review Required</AlertTitle>
                        <AlertDescription className="mt-1">
                            <span className="font-semibold">{children_at_risk.length} {children_at_risk.length === 1 ? 'child needs' : 'children need'}</span> referral review based on latest ASQ-3 screening results.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Children"
                        value={stats.total_children}
                        trend="+12%"
                        icon={Users}
                    />
                    <StatCard
                        title="Total Screenings"
                        value={stats.total_screenings}
                        trend="+5%"
                        icon={ClipboardList}
                    />
                    <StatCard
                        title="Active Programs"
                        value={stats.active_pmt_programs}
                        icon={Utensils}
                    />
                    <StatCard
                        title="Children at Risk"
                        value={stats.at_risk_children}
                        icon={AlertTriangle}
                    />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left & Center: Charts */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Monthly Trends */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle>Activity Trends</CardTitle>
                                <CardDescription>Children registered vs screenings over time</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-0">
                                <MonthlyTrendsChart data={monthly_trends} />
                            </CardContent>
                        </Card>

                        {/* Recent Activity & Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
                                        {recent_activities.slice(0, 4).map((activity, i) => (
                                            <div key={activity.id} className="flex gap-3 py-3 border-b border-border/40 last:border-0 group">
                                                <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{activity.text}</p>
                                                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 gap-4 h-full">
                                <QuickAction label="New Screening" icon={ClipboardList} />
                                <QuickAction label="Add Parent" icon={Users} />
                                <QuickAction label="View Reports" icon={TrendingUp} />
                                <QuickAction label="PMT Menu" icon={AlertTriangle} />
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Breakdown & Lists */}
                    <div className="space-y-6">
                        {/* Children at Risk - Compact List */}
                        <Card className="border-destructive/20 shadow-sm bg-destructive/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-destructive flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                                    Risk Attention
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {children_at_risk.length > 0 ? (
                                    <ul className="space-y-3">
                                        {children_at_risk.slice(0, 3).map(child => (
                                            <li key={child.id} className="flex items-center justify-between bg-white/60 p-3 rounded-lg border border-destructive/10">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate">{child.name}</p>
                                                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                        {getStatusBadge(child.status)}
                                                        {child.risk_domains.length > 0 && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                                                                <AlertTriangle className="h-2.5 w-2.5" />
                                                                {child.risk_domains.slice(0, 2).join(', ')}
                                                                {child.risk_domains.length > 2 && ` +${child.risk_domains.length - 2}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0">
                                                    <Link href={`/children/${child.id}`} aria-label={`View details for ${child.name}`}>
                                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                                    </Link>
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-3 ring-4 ring-success/5">
                                            <CheckCircle2 className="h-6 w-6 text-success" aria-hidden="true" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">All Clear</p>
                                        <p className="text-xs text-muted-foreground mt-1">No children currently flagged at risk.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle>Nutritional Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <NutritionalPieChart data={nutritional_distribution} />
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle>Screening Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScreeningBarChart data={screening_results} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
