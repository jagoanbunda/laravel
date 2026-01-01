import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Baby,
    ClipboardList,
    Utensils,
    CheckCircle,
    AlertTriangle,
    XCircle,
    TrendingUp,
} from 'lucide-react';

interface Props {
    stats: {
        total_children: number;
        active_children: number;
        total_screenings: number;
        completed_screenings: number;
        pmt_completion_rate: number;
        screening_results: {
            sesuai: number;
            pantau: number;
            perlu_rujukan: number;
        };
        pmt_distribution: {
            habis: number;
            half: number;
            quarter: number;
            none: number;
        };
    };
}

export default function ReportsIndex({ stats }: Props) {
    const totalScreeningResults =
        stats.screening_results.sesuai +
        stats.screening_results.pantau +
        stats.screening_results.perlu_rujukan;

    const getPercentage = (value: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    const totalPmtDistribution =
        stats.pmt_distribution.habis +
        stats.pmt_distribution.half +
        stats.pmt_distribution.quarter +
        stats.pmt_distribution.none;

    return (
        <AppLayout title="Reports">
            <Head title="Reports" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Overview of children health monitoring data</p>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Children</CardTitle>
                            <Baby className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_children}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active_children} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Screenings</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_screenings}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.completed_screenings} completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">PMT Completion</CardTitle>
                            <Utensils className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pmt_completion_rate}%</div>
                            <Progress value={stats.pmt_completion_rate} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Needs Follow-up</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">
                                {stats.screening_results.pantau + stats.screening_results.perlu_rujukan}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Children requiring attention
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Stats */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Screening Results */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-emerald-500" />
                                ASQ-3 Screening Results
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                        <span className="text-sm font-medium">Sesuai (Normal)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-emerald-100 text-emerald-700">
                                            {stats.screening_results.sesuai}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground w-12 text-right">
                                            {getPercentage(stats.screening_results.sesuai, totalScreeningResults)}%
                                        </span>
                                    </div>
                                </div>
                                <Progress
                                    value={getPercentage(stats.screening_results.sesuai, totalScreeningResults)}
                                    className="h-2 bg-emerald-100"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        <span className="text-sm font-medium">Pantau (Monitor)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-amber-100 text-amber-700">
                                            {stats.screening_results.pantau}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground w-12 text-right">
                                            {getPercentage(stats.screening_results.pantau, totalScreeningResults)}%
                                        </span>
                                    </div>
                                </div>
                                <Progress
                                    value={getPercentage(stats.screening_results.pantau, totalScreeningResults)}
                                    className="h-2 bg-amber-100"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-sm font-medium">Perlu Rujukan (Referral)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-red-100 text-red-700">
                                            {stats.screening_results.perlu_rujukan}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground w-12 text-right">
                                            {getPercentage(stats.screening_results.perlu_rujukan, totalScreeningResults)}%
                                        </span>
                                    </div>
                                </div>
                                <Progress
                                    value={getPercentage(stats.screening_results.perlu_rujukan, totalScreeningResults)}
                                    className="h-2 bg-red-100"
                                />
                            </div>

                            {totalScreeningResults === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No screening results yet
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* PMT Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Utensils className="h-5 w-5 text-emerald-500" />
                                PMT Consumption Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Habis (100%)</span>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-emerald-100 text-emerald-700">
                                            {stats.pmt_distribution.habis}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground w-12 text-right">
                                            {getPercentage(stats.pmt_distribution.habis, totalPmtDistribution)}%
                                        </span>
                                    </div>
                                </div>
                                <Progress
                                    value={getPercentage(stats.pmt_distribution.habis, totalPmtDistribution)}
                                    className="h-2 bg-emerald-100"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Setengah (50%)</span>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-blue-100 text-blue-700">
                                            {stats.pmt_distribution.half}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground w-12 text-right">
                                            {getPercentage(stats.pmt_distribution.half, totalPmtDistribution)}%
                                        </span>
                                    </div>
                                </div>
                                <Progress
                                    value={getPercentage(stats.pmt_distribution.half, totalPmtDistribution)}
                                    className="h-2 bg-blue-100"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Seperempat (25%)</span>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-amber-100 text-amber-700">
                                            {stats.pmt_distribution.quarter}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground w-12 text-right">
                                            {getPercentage(stats.pmt_distribution.quarter, totalPmtDistribution)}%
                                        </span>
                                    </div>
                                </div>
                                <Progress
                                    value={getPercentage(stats.pmt_distribution.quarter, totalPmtDistribution)}
                                    className="h-2 bg-amber-100"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Tidak Dimakan (0%)</span>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-red-100 text-red-700">
                                            {stats.pmt_distribution.none}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground w-12 text-right">
                                            {getPercentage(stats.pmt_distribution.none, totalPmtDistribution)}%
                                        </span>
                                    </div>
                                </div>
                                <Progress
                                    value={getPercentage(stats.pmt_distribution.none, totalPmtDistribution)}
                                    className="h-2 bg-red-100"
                                />
                            </div>

                            {totalPmtDistribution === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No PMT distribution data yet
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
