import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Calendar,
    Download,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    MessageCircle,
    Award,
    Brain,
    Hand,
    Users,
    Puzzle,
    Activity,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    Clock,
    ClipboardList,
} from 'lucide-react';
import {
    type ScreeningResult,
    type ASQ3DomainCode,
    type Asq3ScreeningDetail,
    type Asq3ScreeningHistoryItem,
    type Asq3DomainResult,
    type Asq3RecommendationDisplay,
    ScreeningResultLabels,
    ASQ3DomainLabels,
    getScreeningResultColor,
} from '@/types/models';

interface ScreeningsTabProps {
    childId: number;
    latestScreening: Asq3ScreeningDetail | null;
    screeningHistory: Asq3ScreeningHistoryItem[];
}

function getDomainIcon(domainCode: ASQ3DomainCode) {
    switch (domainCode) {
        case 'communication':
            return MessageCircle;
        case 'gross_motor':
            return Activity;
        case 'fine_motor':
            return Hand;
        case 'problem_solving':
            return Puzzle;
        case 'personal_social':
            return Users;
        default:
            return Brain;
    }
}

function getStatusConfig(status: ScreeningResult) {
    switch (status) {
        case 'sesuai':
            return {
                label: ScreeningResultLabels.sesuai,
                color: getScreeningResultColor('sesuai'),
                icon: CheckCircle,
                iconColor: 'text-black',
                bgColor: 'bg-[#DEEBC5]',
            };
        case 'pantau':
            return {
                label: ScreeningResultLabels.pantau,
                color: getScreeningResultColor('pantau'),
                icon: AlertTriangle,
                iconColor: 'text-amber-500',
                bgColor: 'bg-amber-100',
            };
        case 'perlu_rujukan':
            return {
                label: ScreeningResultLabels.perlu_rujukan,
                color: getScreeningResultColor('perlu_rujukan'),
                icon: AlertTriangle,
                iconColor: 'text-red-500',
                bgColor: 'bg-red-100',
            };
        default:
            return {
                label: 'Unknown',
                color: 'bg-gray-100 text-gray-700 border-gray-200',
                icon: CheckCircle,
                iconColor: 'text-gray-500',
                bgColor: 'bg-gray-100',
            };
    }
}

function EmptyState() {
    return (
        <Card className="border-dashed">
            <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Belum Ada Skrining</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                    Anak ini belum pernah menjalani skrining ASQ-3. Mulai skrining pertama untuk memantau perkembangan anak.
                </p>
                <Button className="bg-[#DEEBC5] text-black hover:bg-[#c5daa6] gap-2">
                    <Brain className="h-5 w-5" />
                    Mulai Skrining Pertama
                </Button>
            </CardContent>
        </Card>
    );
}

function formatNextScreeningDate(dateString: string | null): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function RecommendationsSummary({
    recommendations,
    domainResults,
}: {
    recommendations: Asq3RecommendationDisplay[];
    domainResults: Asq3DomainResult[];
}) {
    const [openDomains, setOpenDomains] = useState<Record<string, boolean>>({});

    const toggleDomain = (code: string) => {
        setOpenDomains((prev) => ({ ...prev, [code]: !prev[code] }));
    };

    // Group recommendations by domain
    const grouped = recommendations.reduce((acc, rec) => {
        if (!acc[rec.domain_code]) {
            acc[rec.domain_code] = [];
        }
        acc[rec.domain_code].push(rec);
        return acc;
    }, {} as Record<string, Asq3RecommendationDisplay[]>);

    // Domain status map
    const domainStatusMap = domainResults.reduce((acc, domain) => {
        acc[domain.domain_code] = domain;
        return acc;
    }, {} as Record<string, Asq3DomainResult>);

    // Sort by priority: perlu_rujukan > pantau > sesuai
    const sortedDomainCodes = Object.keys(grouped).sort((a, b) => {
        const statusA = domainStatusMap[a]?.status || 'sesuai';
        const statusB = domainStatusMap[b]?.status || 'sesuai';
        const priority = { perlu_rujukan: 3, pantau: 2, sesuai: 1 };
        return (priority[statusB as keyof typeof priority] || 0) - (priority[statusA as keyof typeof priority] || 0);
    });

    // Check for 0% domains (critical)
    const zeroScoreDomains = domainResults.filter((d) => d.total_score === 0).map((d) => d.domain_name);

    // Count domains by status
    const statusCounts = domainResults.reduce(
        (acc, d) => {
            acc[d.status] = (acc[d.status] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    if (recommendations.length === 0) {
        return (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Semua Sesuai Tahapan</span>
                </div>
                <p className="text-sm text-green-700">
                    Semua domain perkembangan anak sesuai dengan tahapan usianya. Teruskan stimulasi yang sudah baik!
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Urgency Banner - Critical domains */}
            {zeroScoreDomains.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-red-800 text-sm">Perhatian Khusus Diperlukan</h4>
                        <p className="text-sm text-red-700 mt-1">
                            Domain <span className="font-semibold">{zeroScoreDomains.join(', ')}</span> belum mendapatkan skor (0%).
                        </p>
                    </div>
                </div>
            )}

            {/* Status Summary Badges */}
            <div className="flex flex-wrap gap-2">
                {statusCounts.perlu_rujukan && (
                    <Badge className="bg-red-100 text-red-800 border-red-200 gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {statusCounts.perlu_rujukan} Perlu Rujukan
                    </Badge>
                )}
                {statusCounts.pantau && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {statusCounts.pantau} Pantau
                    </Badge>
                )}
                {statusCounts.sesuai && (
                    <Badge className="bg-[#DEEBC5] text-[#2d4a0e] border-[#c5daa6] gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {statusCounts.sesuai} Sesuai
                    </Badge>
                )}
            </div>

            {/* Recommendation Count */}
            <p className="text-sm text-muted-foreground">
                Total <span className="font-medium text-foreground">{recommendations.length} rekomendasi</span> dari{' '}
                {sortedDomainCodes.length} domain
            </p>

            {/* View Details Button - Opens Modal */}
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2 justify-between">
                        <span>Lihat Detail Rekomendasi</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Detail Rekomendasi</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                        <div className="flex flex-col gap-3">
                            {sortedDomainCodes.map((code) => {
                                const recs = grouped[code];
                                const domainResult = domainStatusMap[code];
                                const status = domainResult?.status || 'sesuai';
                                const isOpen = openDomains[code] ?? true;
                                const Icon = getDomainIcon(code as ASQ3DomainCode);

                                const headerColor =
                                    status === 'perlu_rujukan'
                                        ? 'bg-red-100'
                                        : status === 'pantau'
                                          ? 'bg-amber-100'
                                          : 'bg-[#DEEBC5]';

                                const textColor =
                                    status === 'perlu_rujukan'
                                        ? 'text-red-900'
                                        : status === 'pantau'
                                          ? 'text-amber-900'
                                          : 'text-[#2d4a0e]';

                                return (
                                    <div
                                        key={code}
                                        className="border rounded-xl overflow-hidden transition-all duration-200 shadow-sm bg-white"
                                    >
                                        <button
                                            onClick={() => toggleDomain(code)}
                                            className={`w-full flex items-center justify-between p-4 ${headerColor} transition-colors text-left`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white/50 p-1.5 rounded-lg backdrop-blur-sm">
                                                    <Icon className={`h-4 w-4 ${textColor}`} />
                                                </div>
                                                <div>
                                                    <span className={`font-bold text-sm ${textColor}`}>
                                                        {ASQ3DomainLabels[code as ASQ3DomainCode]}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span
                                                            className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-white/40 ${textColor}`}
                                                        >
                                                            {status.replace('_', ' ')}
                                                        </span>
                                                        <span className={`text-xs opacity-80 ${textColor}`}>
                                                            {recs.length} saran
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {isOpen ? (
                                                <ChevronUp className={`h-4 w-4 ${textColor} opacity-70`} />
                                            ) : (
                                                <ChevronDown className={`h-4 w-4 ${textColor} opacity-70`} />
                                            )}
                                        </button>

                                        <div
                                            className={`grid transition-all duration-200 ease-in-out ${
                                                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                            }`}
                                        >
                                            <div className="overflow-hidden bg-white">
                                                <div className="p-4 flex flex-col gap-3 border-t">
                                                    {recs.map((rec) => (
                                                        <div
                                                            key={rec.id}
                                                            className="relative pl-4 border-l-2 border-gray-100 hover:border-gray-300 transition-colors"
                                                        >
                                                            <h5 className="font-semibold text-sm text-gray-900 mb-1">
                                                                {rec.title}
                                                            </h5>
                                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                                {rec.recommendation_text}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ScreeningsTabContent({
    childId: _childId,
    latestScreening,
    screeningHistory,
}: ScreeningsTabProps) {
    if (!latestScreening) {
        return <EmptyState />;
    }

    const statusConfig = getStatusConfig(latestScreening.overall_status ?? 'sesuai');
    const StatusIcon = statusConfig.icon;

    const domainResults: Asq3DomainResult[] = latestScreening.domain_results;
    const recommendations: Asq3RecommendationDisplay[] = latestScreening.recommendations;

    return (
        <div className="flex flex-col gap-6">
            {/* Header Section */}
            <Card className="border-0 bg-[#f0f7e4]">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Brain className="h-6 w-6 text-black" />
                                <h2 className="text-xl font-bold">Hasil Skrining ASQ-3</h2>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Skrining perkembangan usia <span className="font-medium text-foreground">{latestScreening.age_at_screening_months} bulan</span> • {new Date(latestScreening.screening_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Jadwal Ulang
                            </Button>
                            <Button className="gap-2 bg-[#DEEBC5] text-black hover:bg-[#c5daa6]">
                                <Download className="h-4 w-4" />
                                Unduh Laporan
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Score */}
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[#DEEBC5] flex items-center justify-center">
                                <Award className="h-5 w-5 text-black" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">TOTAL SKOR</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-black">{latestScreening.total_score}</span>
                            <span className="text-lg text-muted-foreground">/ {latestScreening.max_score}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Status */}
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.bgColor}`}>
                                <StatusIcon className={`h-5 w-5 ${statusConfig.iconColor}`} />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">STATUS</span>
                        </div>
                        <p className="text-xl font-bold">{statusConfig.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {latestScreening.overall_status === 'sesuai'
                                ? 'Tidak ada keterlambatan terdeteksi'
                                : latestScreening.overall_status === 'pantau'
                                    ? 'Beberapa area perlu dipantau'
                                    : 'Perlu evaluasi lebih lanjut'}
                        </p>
                    </CardContent>
                </Card>

                {/* Next Screening */}
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">JADWAL BERIKUTNYA</span>
                        </div>
                        <p className="text-xl font-bold">{formatNextScreeningDate(latestScreening.next_screening_date)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {latestScreening.days_until_next
                                ? `Dalam ${latestScreening.days_until_next} hari`
                                : 'Jadwalkan skrining berikutnya'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Domain Analysis & Recommendations */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
                {/* Domain Scores */}
                <Card className="xl:col-span-3">
                    <CardHeader className="pb-4 border-b">
                        <CardTitle className="text-lg">Analisis Domain Perkembangan</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Perbandingan skor anak vs ambang batas (<span className="text-black">cutoff</span>)
                        </p>
                    </CardHeader>
                    <CardContent className="p-5">
                        <div className="flex flex-col gap-5">
                            {domainResults.map((domain) => {
                                const IconComponent = getDomainIcon(domain.domain_code);
                                const percentage = Math.round((domain.total_score / domain.max_score) * 100);
                                const cutoffPercentage = Math.round((domain.cutoff_score / domain.max_score) * 100);
                                return (
                                    <div key={domain.id} className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                                    <IconComponent className="h-4 w-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{ASQ3DomainLabels[domain.domain_code]}</p>
                                                    <p className="text-xs text-muted-foreground">Skor: {domain.total_score} / {domain.max_score}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-black">{percentage}%</span>
                                        </div>
                                        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                                            {/* Threshold line */}
                                            <div
                                                className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
                                                style={{ left: `${cutoffPercentage}%` }}
                                                title="Ambang Batas"
                                            />
                                            {/* Score bar */}
                                            <div
                                                className={`h-full rounded-full transition-all ${domain.status === 'sesuai' ? 'bg-[#DEEBC5]' : domain.status === 'pantau' ? 'bg-amber-400' : 'bg-red-400'}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-6 pt-4 border-t flex items-center gap-6 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#DEEBC5]" />
                                <span>Skor Anak</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-0.5 bg-gray-400" />
                                <span>Ambang Batas</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="xl:col-span-2 flex flex-col">
                    <CardHeader className="pb-4 border-b">
                        <CardTitle className="text-lg text-black">Rekomendasi</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 flex-1 flex flex-col gap-4">
                        <RecommendationsSummary recommendations={recommendations} domainResults={domainResults} />
                    </CardContent>
                </Card>
            </div>

            {/* Screening History */}
            {screeningHistory.length > 0 && (
                <Card>
                    <CardHeader className="pb-4 border-b flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Riwayat Skrining</CardTitle>
                        <Button variant="link" className="text-black p-0 h-auto">Lihat Semua</Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {screeningHistory.map((item) => {
                                const itemStatus = getStatusConfig(item.overall_status);
                                const ItemIcon = itemStatus.icon;
                                const formattedDate = new Date(item.screening_date).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                });
                                return (
                                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                <Clock className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{formattedDate}</p>
                                                <p className="text-xs text-muted-foreground">Usia: {item.age_at_screening_months} bulan</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-sm">{item.total_score}/300</p>
                                                <p className="text-xs text-muted-foreground">Total Skor</p>
                                            </div>
                                            <Badge className={`${itemStatus.color} border gap-1`}>
                                                <ItemIcon className="h-3 w-3" />
                                                {itemStatus.label}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Footer */}
            <Card className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Button className="bg-[#DEEBC5] text-black hover:bg-[#c5daa6] gap-2">
                        <Brain className="h-5 w-5" />
                        Mulai Skrining Baru
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        Jadwalkan Skrining
                    </Button>
                </div>
                <Button variant="ghost" className="text-muted-foreground hover:text-black gap-2 w-full sm:w-auto">
                    <Download className="h-5 w-5" />
                    Unduh Semua Riwayat
                </Button>
            </Card>
        </div >
    );
}
