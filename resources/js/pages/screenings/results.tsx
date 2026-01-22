import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    Plus,
    Trash2,
    Clock,
    Stethoscope,
    type LucideIcon,
} from 'lucide-react';
import { useState, FormEvent } from 'react';

interface Intervention {
    id: number;
    domain_id: number | null;
    domain_name: string | null;
    domain_code: string | null;
    type: 'stimulation' | 'referral' | 'follow_up' | 'counseling' | 'other';
    type_label: string;
    action: string;
    notes: string | null;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    status_label: string;
    follow_up_date: string | null;
    completed_at: string | null;
    created_by: string | null;
    created_at: string;
}

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
    interventions?: Intervention[];
}

interface Props {
    screening: ScreeningData;
    typeOptions: Array<{ value: string; label: string }>;
    statusOptions: Array<{ value: string; label: string }>;
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

function getInterventionStatusBadge(status: string) {
    const config = {
        planned: { label: 'Direncanakan', className: 'bg-blue-100 text-blue-700' },
        in_progress: { label: 'Dalam Proses', className: 'bg-amber-100 text-amber-700' },
        completed: { label: 'Selesai', className: 'bg-emerald-100 text-emerald-700' },
        cancelled: { label: 'Dibatalkan', className: 'bg-gray-100 text-gray-700' },
    };

    const { label, className } =
        config[status as keyof typeof config] || config.planned;
    return <Badge className={className}>{label}</Badge>;
}

export default function ScreeningResults({ screening, typeOptions = [], statusOptions = [] }: Props) {
    const domainResults = screening.domain_results || [];
    // Pre-convert scores to numbers for better performance
    const domainScores = domainResults.map((d) => Number(d.total_score));
    const totalScore = domainScores.reduce((sum, score) => sum + score, 0);
    const maxTotalScore = domainResults.length * MAX_DOMAIN_SCORE;
    const overallProgress = maxTotalScore > 0 ? (totalScore / maxTotalScore) * 100 : 0;

    const [isAddingIntervention, setIsAddingIntervention] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        type: 'stimulation',
        action: '',
        notes: '',
        status: 'planned',
        follow_up_date: '',
    });

    const handleAddIntervention = (e: FormEvent) => {
        e.preventDefault();
        post(`/screenings/${screening.id}/interventions`, {
            onSuccess: () => {
                setIsAddingIntervention(false);
                reset();
            },
        });
    };

    const handleCompleteIntervention = (id: number) => {
        if (confirm('Tandai intervensi ini sebagai selesai?')) {
            router.post(`/screenings/${screening.id}/interventions/${id}/complete`);
        }
    };

    const handleDeleteIntervention = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus intervensi ini?')) {
            router.delete(`/screenings/${screening.id}/interventions/${id}`);
        }
    };

    return (
        <AppLayout>
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
                                    <p className="font-semibold">
                                        {screening.age_at_screening_months} bulan ({screening.age_interval})
                                    </p>
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
                                <span className="font-semibold">
                                    {totalScore} / {maxTotalScore}
                                </span>
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
                            {domainResults.map((domain, index) => {
                                const config = domainConfig[domain.domain_code] || defaultDomainConfig;
                                const DomainIcon = config.icon;
                                const score = domainScores[index];
                                const progress = (score / MAX_DOMAIN_SCORE) * 100;

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
                                                        Skor: {score} / {MAX_DOMAIN_SCORE}
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

                {/* Interventions Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Stethoscope className="h-5 w-5 text-primary" />
                            Intervensi & Tindak Lanjut
                        </h2>
                        {!isAddingIntervention && (
                            <Button onClick={() => setIsAddingIntervention(true)} className="gap-2 bg-black hover:bg-gray-900 text-white rounded-full">
                                <Plus className="h-4 w-4" />
                                Tambah Intervensi
                            </Button>
                        )}
                    </div>

                    {isAddingIntervention && (
                        <Card className="bg-white border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-lg">Tambah Intervensi Baru</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddIntervention} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type" className="text-gray-900">Jenis Intervensi</Label>
                                        <Select
                                            value={data.type}
                                            onValueChange={(val) => setData('type', val)}
                                        >
                                            <SelectTrigger className="bg-white border-gray-200">
                                                <SelectValue placeholder="Pilih jenis..." />
                                            </SelectTrigger>
                                                <SelectContent>
                                                    {typeOptions.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status" className="text-gray-900">Status</Label>
                                            <Select
                                                value={data.status}
                                                onValueChange={(val) => setData('status', val)}
                                            >
                                                <SelectTrigger className="bg-white border-gray-200">
                                                    <SelectValue placeholder="Pilih status..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statusOptions.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="action" className="text-gray-900">Tindakan / Rencana</Label>
                                        <textarea
                                            id="action"
                                            className="flex min-h-[80px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Deskripsikan tindakan yang akan dilakukan..."
                                            value={data.action}
                                            onChange={(e) => setData('action', e.target.value)}
                                        />
                                        {errors.action && <p className="text-sm text-red-500">{errors.action}</p>}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="follow_up_date" className="text-gray-900">Tanggal Tindak Lanjut (Opsional)</Label>
                                            <Input
                                                id="follow_up_date"
                                                type="date"
                                                value={data.follow_up_date}
                                                onChange={(e) => setData('follow_up_date', e.target.value)}
                                                className="bg-white border-gray-200"
                                            />
                                            {errors.follow_up_date && (
                                                <p className="text-sm text-red-500">{errors.follow_up_date}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes" className="text-gray-900">Catatan Tambahan (Opsional)</Label>
                                        <textarea
                                            id="notes"
                                            className="flex min-h-[80px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Catatan tambahan..."
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                        />
                                        {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsAddingIntervention(false);
                                                reset();
                                                clearErrors();
                                            }}
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full border-gray-200"
                                        >
                                            Batal
                                        </Button>
                                        <Button type="submit" disabled={processing} className="bg-black hover:bg-gray-900 text-white rounded-full">
                                            {processing ? 'Menyimpan...' : 'Simpan Intervensi'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Intervention List */}
                    <div className="grid gap-4">
                        {screening.interventions && screening.interventions.length > 0 ? (
                            screening.interventions.map((intervention) => (
                                <Card key={intervention.id} className="overflow-hidden">
                                    <div className="flex flex-col md:flex-row">
                                        <div
                                            className={`w-full md:w-2 ${
                                                intervention.status === 'completed'
                                                    ? 'bg-emerald-500'
                                                    : intervention.status === 'cancelled'
                                                    ? 'bg-gray-400'
                                                    : 'bg-amber-500'
                                            }`}
                                        />
                                        <div className="flex-1 p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="font-normal">
                                                            {intervention.type_label}
                                                        </Badge>
                                                        {getInterventionStatusBadge(intervention.status)}
                                                    </div>
                                                    <h3 className="text-lg font-medium">{intervention.action}</h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {intervention.status !== 'completed' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                            onClick={() => handleCompleteIntervention(intervention.id)}
                                                            title="Tandai Selesai"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDeleteIntervention(intervention.id)}
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground mt-4">
                                                <div className="space-y-2">
                                                    {intervention.follow_up_date && (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>
                                                                Tindak Lanjut:{' '}
                                                                {new Date(intervention.follow_up_date).toLocaleDateString(
                                                                    'id-ID',
                                                                    { day: 'numeric', month: 'long', year: 'numeric' }
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        <span>
                                                            Dibuat:{' '}
                                                            {new Date(intervention.created_at).toLocaleDateString(
                                                                'id-ID',
                                                                { day: 'numeric', month: 'long', year: 'numeric' }
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                {intervention.notes && (
                                                    <div className="bg-muted/50 p-3 rounded-md">
                                                        <p className="italic">{intervention.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                <p>Belum ada intervensi yang dicatat.</p>
                                <Button
                                    onClick={() => setIsAddingIntervention(true)}
                                    className="mt-2 bg-black hover:bg-gray-900 text-white rounded-full"
                                >
                                    Tambah Intervensi Sekarang
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

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
