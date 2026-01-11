import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    ChevronRight,
    Phone,
    Clock,
} from 'lucide-react';
import {
    type ScreeningResult,
    type ASQ3DomainCode,
    ScreeningResultLabels,
    ASQ3DomainLabels,
    getScreeningResultColor,
} from '@/types/models';

// Mock screening data aligned with ERD
const latestScreening = {
    id: 1,
    child_id: 1,
    age_interval_id: 10,
    screening_date: '2024-12-28',
    age_at_screening_months: 27,
    age_at_screening_days: 820,
    status: 'completed' as const,
    overall_status: 'sesuai' as ScreeningResult,
    totalScore: 270,
    maxScore: 300,
    nextScreeningDate: '28 Maret 2025',
    daysUntilNext: 90,
};

const domainScores: {
    id: number;
    domain_code: ASQ3DomainCode;
    icon: typeof MessageCircle;
    total_score: number;
    cutoff_score: number;
    monitoring_score: number;
    max_score: number;
    status: ScreeningResult;
}[] = [
        {
            id: 1,
            domain_code: 'communication',
            icon: MessageCircle,
            total_score: 55,
            cutoff_score: 30,
            monitoring_score: 40,
            max_score: 60,
            status: 'sesuai',
        },
        {
            id: 2,
            domain_code: 'gross_motor',
            icon: Activity,
            total_score: 60,
            cutoff_score: 25,
            monitoring_score: 35,
            max_score: 60,
            status: 'sesuai',
        },
        {
            id: 3,
            domain_code: 'fine_motor',
            icon: Hand,
            total_score: 50,
            cutoff_score: 30,
            monitoring_score: 40,
            max_score: 60,
            status: 'sesuai',
        },
        {
            id: 4,
            domain_code: 'problem_solving',
            icon: Puzzle,
            total_score: 55,
            cutoff_score: 25,
            monitoring_score: 35,
            max_score: 60,
            status: 'sesuai',
        },
        {
            id: 5,
            domain_code: 'personal_social',
            icon: Users,
            total_score: 50,
            cutoff_score: 30,
            monitoring_score: 40,
            max_score: 60,
            status: 'sesuai',
        },
    ];

const recommendations = [
    {
        id: 1,
        domain_id: 3,
        title: 'Stimulasi Motorik Halus',
        recommendation_text: 'Ajak anak bermain menyusun balok atau memasukkan benda kecil ke dalam botol untuk melatih jari-jari.',
        priority: 1,
    },
    {
        id: 2,
        domain_id: 5,
        title: 'Sosialisasi',
        recommendation_text: 'Dorong anak untuk bermain dengan teman sebaya guna meningkatkan kemampuan berbagi dan interaksi.',
        priority: 2,
    },
];

const screeningHistory: {
    id: number;
    screening_date: string;
    age_at_screening_months: number;
    total_score: number;
    overall_status: ScreeningResult;
}[] = [
        { id: 1, screening_date: '2024-12-28', age_at_screening_months: 27, total_score: 270, overall_status: 'sesuai' },
        { id: 2, screening_date: '2024-09-28', age_at_screening_months: 24, total_score: 255, overall_status: 'sesuai' },
        { id: 3, screening_date: '2024-06-28', age_at_screening_months: 21, total_score: 240, overall_status: 'pantau' },
    ];

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

export default function ScreeningsTabContent() {
    const statusConfig = getStatusConfig(latestScreening.overall_status);
    const StatusIcon = statusConfig.icon;

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
                            <span className="text-4xl font-bold text-black">{latestScreening.totalScore}</span>
                            <span className="text-lg text-muted-foreground">/ {latestScreening.maxScore}</span>
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
                        <p className="text-xs text-muted-foreground mt-1">Tidak ada keterlambatan terdeteksi</p>
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
                        <p className="text-xl font-bold">{latestScreening.nextScreeningDate}</p>
                        <p className="text-xs text-muted-foreground mt-1">Dalam {latestScreening.daysUntilNext} hari</p>
                    </CardContent>
                </Card>
            </div>

            {/* Domain Analysis & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Domain Scores */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-4 border-b">
                        <CardTitle className="text-lg">Analisis Domain Perkembangan</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Perbandingan skor anak vs ambang batas (<span className="text-black">cutoff</span>)
                        </p>
                    </CardHeader>
                    <CardContent className="p-5">
                        <div className="flex flex-col gap-5">
                            {domainScores.map((domain) => {
                                const IconComponent = domain.icon;
                                const percentage = Math.round((domain.total_score / domain.max_score) * 100);
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
                                                style={{ left: `${Math.round((domain.cutoff_score / domain.max_score) * 100)}%` }}
                                                title="Ambang Batas"
                                            />
                                            {/* Score bar */}
                                            <div
                                                className={`h-full rounded-full transition-all ${percentage >= 60 ? 'bg-[#DEEBC5]' : 'bg-amber-500'}`}
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
                <Card className="flex flex-col">
                    <CardHeader className="pb-4 border-b">
                        <CardTitle className="text-lg text-black">Rekomendasi</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 flex-1 flex flex-col gap-4">
                        {recommendations.map((rec) => (
                            <div key={rec.id} className="p-4 bg-gray-50 rounded-xl border">
                                <h4 className="font-bold text-sm mb-2 text-[#2d4a0e]">{rec.title}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">{rec.recommendation_text}</p>
                            </div>
                        ))}

                        <Button variant="link" className="text-black text-sm p-0 h-auto justify-start gap-1 mt-2">
                            Lihat Semua Saran
                            <ChevronRight className="h-4 w-4" />
                        </Button>

                        {/* Help Card */}
                        <div className="mt-auto p-4 bg-gray-900 text-white rounded-xl">
                            <h4 className="font-bold text-sm mb-2">Punya Pertanyaan?</h4>
                            <p className="text-xs text-gray-300 mb-3">
                                Jika Anda memiliki kekhawatiran mengenai hasil ini, konsultasikan dengan dokter anak kami.
                            </p>
                            <Button size="sm" variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-800 gap-2">
                                <Phone className="h-4 w-4" />
                                Chat Dokter Sekarang
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Screening History */}
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
