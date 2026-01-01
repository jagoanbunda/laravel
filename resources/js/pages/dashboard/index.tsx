import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    Baby,
    AlertTriangle,
    ClipboardList,
    ArrowRight,
    UserPlus,
    Utensils,
    FileText,
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
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {data.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}

function ScreeningBarChart({ data }: { data: Props['screening_results'] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Count">
                    {data.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

function PmtPieChart({ data }: { data: Props['pmt_distribution'] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {data.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}

function MonthlyTrendsChart({ data }: { data: Props['monthly_trends'] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="children" stroke="#10b981" name="Children" />
                <Line type="monotone" dataKey="screenings" stroke="#3b82f6" name="Screenings" />
            </LineChart>
        </ResponsiveContainer>
    );
}

function StatCard({
    title,
    value,
    icon: Icon,
    color = 'primary',
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: 'primary' | 'secondary' | 'destructive' | 'accent';
}) {
    const colorClasses = {
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        destructive: 'bg-destructive/10 text-destructive',
        accent: 'bg-accent/10 text-accent',
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function getStatusBadge(status: string | undefined) {
    const statusConfig: Record<string, { label: string; class: string }> = {
        sesuai: { label: 'Sesuai', class: 'bg-emerald-100 text-emerald-700' },
        pantau: { label: 'Pantau', class: 'bg-amber-100 text-amber-700' },
        perlu_rujukan: { label: 'Perlu Rujukan', class: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[status || 'sesuai'] || statusConfig.sesuai;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${config.class}`}>
            {config.label}
        </span>
    );
}

export default function Dashboard({ stats, nutritional_distribution, screening_results, pmt_distribution, monthly_trends, children_at_risk, recent_activities }: Props) {
    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Welcome Section with Gradient */}
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary/80 p-8 text-white">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold">Welcome to Jagoan Bunda Dashboard</h1>
                        <p className="mt-2 text-primary-foreground/90">
                            Monitor children's health and development with comprehensive data visualization
                        </p>
                        <div className="mt-6 flex gap-3">
                            <Button variant="secondary" size="sm">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Parent
                            </Button>
                            <Button variant="secondary" size="sm">
                                <Utensils className="mr-2 h-4 w-4" />
                                PMT Programs
                            </Button>
                            <Button variant="secondary" size="sm">
                                <FileText className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
                        <Baby className="h-full w-full" />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    <StatCard
                        title="Total Parents"
                        value={stats.total_parents}
                        icon={Users}
                        color="primary"
                    />
                    <StatCard
                        title="Total Children"
                        value={stats.total_children}
                        icon={Baby}
                        color="secondary"
                    />
                    <StatCard
                        title="Active Children"
                        value={stats.active_children}
                        icon={Baby}
                        color="secondary"
                    />
                    <StatCard
                        title="At Risk Children"
                        value={stats.at_risk_children}
                        icon={AlertTriangle}
                        color="destructive"
                    />
                    <StatCard
                        title="Active PMT Programs"
                        value={stats.active_pmt_programs}
                        icon={ClipboardList}
                        color="accent"
                    />
                    <StatCard
                        title="Total Screenings"
                        value={stats.total_screenings}
                        icon={ClipboardList}
                        color="accent"
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Nutritional Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Nutritional Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <NutritionalPieChart data={nutritional_distribution} />
                        </CardContent>
                    </Card>

                    {/* Screening Results */}
                    <Card>
                        <CardHeader>
                            <CardTitle>ASQ-3 Screening Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScreeningBarChart data={screening_results} />
                        </CardContent>
                    </Card>

                    {/* PMT Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>PMT Portion Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PmtPieChart data={pmt_distribution} />
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Activity</CardTitle>
                            <Button variant="ghost" size="sm">
                                View all <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recent_activities.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3">
                                        <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                                        <div className="flex-1">
                                            <p className="text-sm">{activity.text}</p>
                                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Trends (Last 6 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MonthlyTrendsChart data={monthly_trends} />
                    </CardContent>
                </Card>

                {/* Children Requiring Attention */}
                {children_at_risk.length > 0 && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Children Requiring Attention</CardTitle>
                            <Button variant="outline" size="sm">
                                View all <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Name</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Age</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Parent</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Last Screening</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {children_at_risk.map((child) => (
                                            <tr key={child.id} className="border-b hover:bg-muted/50">
                                                <td className="py-3 px-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <span className="text-xs font-medium text-primary">
                                                                {child.name.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <span className="font-medium">{child.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 text-sm text-muted-foreground">
                                                    {child.age_months} months
                                                </td>
                                                <td className="py-3 px-2 text-sm text-muted-foreground">
                                                    {child.parent_name}
                                                </td>
                                                <td className="py-3 px-2">
                                                    {getStatusBadge(child.status)}
                                                </td>
                                                <td className="py-3 px-2 text-sm text-muted-foreground">
                                                    {child.last_screening}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
