import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    ArrowLeft,
    Calendar,
    User,
    Baby,
    CheckCircle,
    AlertTriangle,
    XCircle,
    MessageCircle,
    Activity,
    Hand,
    Puzzle,
    Users,
    FileText,
    Download,
    type LucideIcon,
} from 'lucide-react';

interface DomainResult {
    domain_id: number;
    domain_name: string;
    domain_code: string;
    domain_color: string | null;
    total_score: number;
    cutoff_score: number;
    monitoring_score: number;
    status: 'sesuai' | 'pantau' | 'perlu_rujukan';
}

interface ScreeningData {
    id: number;
    child: {
        id: number;
        name: string;
        date_of_birth: string;
        gender: string;
    };
    parent: {
        name: string;
        email: string;
    };
    screening_date: string;
    age_at_screening_months: number;
    age_interval: string;
    status: string;
    overall_status: 'sesuai' | 'pantau' | 'perlu_rujukan';
    completed_at: string | null;
    domain_results: DomainResult[];
}

interface Props {
    screening: ScreeningData;
}

// Map domain codes to icons and colors
const domainConfig: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
    communication: { icon: MessageCircle, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    gross_motor: { icon: Activity, color: 'text-green-600', bgColor: 'bg-green-50' },
    fine_motor: { icon: Hand, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    problem_solving: { icon: Puzzle, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    personal_social: { icon: Users, color: 'text-pink-600', bgColor: 'bg-pink-50' },
};

// Default config for unknown domains
const defaultDomainConfig = { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-50' };

// Max score per domain (constant for ASQ-3)
const MAX_DOMAIN_SCORE = 60;

function getStatusBadge(status: string) {
    const config = {
        sesuai: {
            label: 'Perkembangan Sesuai',
            className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            icon: CheckCircle,
        },
        pantau: {
            label: 'Perlu Pemantauan',
            className: 'bg-amber-100 text-amber-700 border-amber-200',
            icon: AlertTriangle,
        },
        perlu_rujukan: {
            label: 'Perlu Rujukan',
            className: 'bg-red-100 text-red-700 border-red-200',
            icon: XCircle,
        },
    };

    const { label, className, icon: Icon } = config[status as keyof typeof config] || config.sesuai;
    return (
        <Badge className={`${className} gap-2 px-3 py-1 text-sm`}>
            <Icon className="h-4 w-4" />
            {label}
        </Badge>
    );
}

function getDomainStatusBadge(status: string) {
    const config = {
        sesuai: { label: 'Sesuai', className: 'bg-emerald-100 text-emerald-700' },
        pantau: { label: 'Pantau', className: 'bg-amber-100 text-amber-700' },
        perlu_rujukan: { label: 'Perlu Rujukan', className: 'bg-red-100 text-red-700' },
    };

    const { label, className } = config[status as keyof typeof config] || config.sesuai;
    return <Badge className={className}>{label}</Badge>;
}

export default function ScreeningResults({ screening }: Props) {
    const domainResults = screening.domain_results || [];
    const totalScore = domainResults.reduce((sum, d) => sum + Number(d.total_score), 0);
    const maxTotalScore = domainResults.length * MAX_DOMAIN_SCORE;
    const overallProgress = maxTotalScore > 0 ? (totalScore / maxTotalScore) * 100 : 0;

    return (
        <AppLayout title="Hasil Screening ASQ-3">
            <Head title="Hasil Screening ASQ-3" />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <Link href="/screenings">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Unduh PDF
                    </Button>
                </div>

                {/* Screening Info */}
                <Card>
                    <CardHeader className="border-b">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl mb-2">Hasil Screening ASQ-3</CardTitle>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {new Date(screening.screening_date).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                            {getStatusBadge(screening.overall_status)}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Baby className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Nama Anak</p>
                                        <p className="font-semibold">{screening.child.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Orang Tua</p>
                                        <p className="font-semibold">{screening.parent.name}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Usia saat Screening</p>
                                    <p className="font-semibold">{screening.age_at_screening_months} bulan ({screening.age_interval})</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="font-semibold capitalize">{screening.status}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Overall Score */}
                <Card>
                    <CardHeader>
                        <CardTitle>Skor Keseluruhan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Skor</span>
                                <span className="font-semibold">{totalScore} / {maxTotalScore}</span>
                            </div>
                            <Progress value={overallProgress} className="h-3" />
                            <p className="text-xs text-muted-foreground text-center">
                                {overallProgress.toFixed(1)}% dari skor maksimal
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Domain Results */}
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Hasil per Domain
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {domainResults.map((domain) => {
                                const config = domainConfig[domain.domain_code] || defaultDomainConfig;
                                const DomainIcon = config.icon;
                                const progress = (Number(domain.total_score) / MAX_DOMAIN_SCORE) * 100;

                                return (
                                    <div key={domain.domain_id} className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-3 rounded-lg ${config.bgColor}`}>
                                                    <DomainIcon className={`h-6 w-6 ${config.color}`} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">{domain.domain_name}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Skor: {domain.total_score} / {MAX_DOMAIN_SCORE}
                                                    </p>
                                                </div>
                                            </div>
                                            {getDomainStatusBadge(domain.status)}
                                        </div>

                                        <div className="space-y-2">
                                            <Progress value={progress} className="h-2" />
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Cutoff: {domain.cutoff_score}</span>
                                                <span>Monitoring: {domain.monitoring_score}</span>
                                                <span>Max: {MAX_DOMAIN_SCORE}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle>Rekomendasi</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="prose prose-sm max-w-none">
                            <p className="text-muted-foreground">
                                Berdasarkan hasil screening ASQ-3, perkembangan anak menunjukkan hasil yang sesuai dengan usia.
                                Terus lakukan stimulasi sesuai usia dan pantau perkembangan anak secara berkala.
                            </p>
                            <ul className="mt-4 space-y-2">
                                <li>Lakukan screening ulang pada usia berikutnya sesuai interval ASQ-3</li>
                                <li>Berikan stimulasi yang sesuai untuk setiap domain perkembangan</li>
                                <li>Konsultasikan dengan tenaga kesehatan jika ada kekhawatiran</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
