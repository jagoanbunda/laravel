import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    Baby,
    AlertTriangle,
    ClipboardList,
    ArrowRight,
    TrendingUp,
    MoreHorizontal,
    Plus,
    Utensils,
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    children_at_risk: Array<{ id: number; name: string; age_months: number; parent_name: string; status: string; last_screening: string }>;
    recent_activities: Array<{ id: string; type: string; text: string; time: string; timestamp: number }>;
}

function NutritionalPieChart({ data }: { data: Props['nutritional_distribution'] }) {
    return (
        <ResponsiveContainer width="100%" height={240}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                >
                    {data.map((entry, index) => (
                        <Cell key={index} fill={entry.color} strokeWidth={0} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" verticalAlign="bottom" height={36} />
            </PieChart>
        </ResponsiveContainer>
    );
}

function ScreeningBarChart({ data }: { data: Props['screening_results'] }) {
    return (
        <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} barSize={48} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <Tooltip
                    cursor={{ fill: 'var(--muted)/0.5' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

function MonthlyTrendsChart({ data }: { data: Props['monthly_trends'] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
                <Line
                    type="monotone"
                    dataKey="children"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0, fill: "var(--primary)" }}
                    name="Children"
                />
                <Line
                    type="monotone"
                    dataKey="screenings"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0, fill: "var(--chart-1)" }}
                    name="Screenings"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

function StatCard({
    title,
    value,
    trend,
    icon: Icon,
    trendLabel,
}: {
    title: string;
    value: string | number;
    trend?: string;
    icon?: any;
    trendLabel?: string;
}) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-border/50">
            <CardContent className="p-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        {Icon && (
                            <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center text-primary">
                                <Icon className="h-4 w-4" />
                            </div>
                        )}
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-3xl font-semibold tracking-tight">{value.toLocaleString()}</h3>
                        {trend && (
                            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <TrendingUp className="h-3 w-3" />
                                {trend}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
// ... (QuickAction and getStatusBadge remain unchanged, no need to replace if not touching them, but since I'm using AllowMultiple I should target specific blocks)

// Using another ReplacementChunk for usage:



function QuickAction({ label, icon: Icon, onClick }: { label: string, icon: any, onClick?: () => void }) {
    return (
        <button
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/50 bg-card hover:bg-secondary/50 hover:border-border transition-all group"
            onClick={onClick}
        >
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                <Icon className="h-5 w-5 text-foreground" />
            </div>
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
}

function getStatusBadge(status: string | undefined) {
    const statusConfig: Record<string, { label: string; class: string }> = {
        sesuai: { label: 'SESUAI', class: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        pantau: { label: 'PANTAU', class: 'bg-amber-50 text-amber-700 border-amber-100' },
        perlu_rujukan: { label: 'RUJUKAN', class: 'bg-rose-50 text-rose-700 border-rose-100' },
    };

    const config = statusConfig[status || 'sesuai'] || statusConfig.sesuai;
    return (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${config.class}`}>
            {config.label}
        </span>
    );
}

export default function Dashboard({ stats, nutritional_distribution, screening_results, pmt_distribution, monthly_trends, children_at_risk, recent_activities }: Props) {
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
                                <CardTitle>Growth Trends</CardTitle>
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

                        {/* Children at Risk - Compact List */}
                        <Card className="border-destructive/20 shadow-sm bg-destructive/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-destructive flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    Risk Attention
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {children_at_risk.slice(0, 3).map(child => (
                                        <div key={child.id} className="flex items-center justify-between bg-white/50 p-2 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium">{child.name}</p>
                                                <p className="text-xs text-muted-foreground">{getStatusBadge(child.status)}</p>
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-6 w-6">
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {children_at_risk.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No children flagged at risk.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
