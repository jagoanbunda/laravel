import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import {
    Package,
    Calendar,
    TrendingUp,
    Check,
    Phone,
    FileText,
    Plus,
    Clock,
    Percent,
    AlertTriangle,
    FileQuestion,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import {
    type PmtPortion,
    PmtPortionLabels,
    getPortionPercentage,
    getPortionColor,
} from '@/types/models';

interface PmtScheduleItem {
    id: number;
    food_name: string | null;
    scheduled_date: string;
    portion: PmtPortion | null;
    portion_label: string | null;
    logged_at: string | null;
    photo_url: string | null;
    notes: string | null;
}

export interface PmtStatus {
    status: 'healthy' | 'needs_enrollment' | 'active' | 'no_data';
    latest_nutritional_status: string | null;
    latest_stunting_status: string | null;
    latest_wasting_status: string | null;
    has_active_program: boolean;
    has_historical_programs: boolean;
    message: string;
}

interface Props {
    childId: number;
    schedules: PmtScheduleItem[];
    pmtStatus: PmtStatus;
    onTabChange: (tab: string) => void;
}

export default function PmtTabContent({ childId, schedules, pmtStatus, onTabChange }: Props) {
    // Render based on status
    if (pmtStatus.status === 'healthy') {
        return (
            <HealthyEmptyState 
                childId={childId}
                pmtStatus={pmtStatus} 
                onTabChange={onTabChange} 
            />
        );
    }

    if (pmtStatus.status === 'needs_enrollment') {
        return (
            <NeedsEnrollmentState 
                childId={childId}
                pmtStatus={pmtStatus} 
            />
        );
    }

    if (pmtStatus.status === 'no_data') {
        return (
            <NoDataState 
                pmtStatus={pmtStatus} 
                onTabChange={onTabChange} 
            />
        );
    }

    // Default to Active State (existing logic)
    return (
        <ActivePmtState 
            schedules={schedules} 
            childId={childId}
        />
    );
}

function HealthyEmptyState({ 
    childId, 
    pmtStatus, 
    onTabChange 
}: { 
    childId: number; 
    pmtStatus: PmtStatus; 
    onTabChange: (tab: string) => void;
}) {
    return (
        <Card className="border-dashed border-2 bg-gradient-to-br from-white to-[#f4f9ea] border-[#DEEBC5] overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-[#DEEBC5]/50 flex items-center justify-center mb-6 ring-4 ring-white shadow-sm">
                    <CheckCircle2 className="h-10 w-10 text-[#5f8b2d]" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Status Gizi Baik
                </h3>
                
                <p className="text-muted-foreground max-w-md mb-2">
                    {pmtStatus.message}
                </p>
                <p className="text-sm text-gray-500 max-w-md mb-8">
                    Tetap pantau pertumbuhan secara berkala untuk memastikan tumbuh kembang yang optimal.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button 
                        onClick={() => onTabChange('growth')}
                        className="bg-[#DEEBC5] text-black hover:bg-[#c5daa6] gap-2 shadow-sm"
                    >
                        <TrendingUp className="h-4 w-4" />
                        Lihat Pertumbuhan
                    </Button>
                    
                    {pmtStatus.has_historical_programs && (
                        <Button 
                            variant="outline" 
                            asChild
                            className="gap-2"
                        >
                            <Link href={`/pmt/programs?child_id=${childId}`}>
                                <Package className="h-4 w-4" />
                                Lihat Riwayat PMT
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function NeedsEnrollmentState({ 
    childId, 
    pmtStatus 
}: { 
    childId: number; 
    pmtStatus: PmtStatus;
}) {
    return (
        <Card className="border-amber-200 bg-amber-50/50 overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6 text-amber-600">
                    <AlertTriangle className="h-8 w-8" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Perlu Program PMT
                </h3>
                
                <p className="text-gray-600 max-w-lg mb-6">
                    {pmtStatus.message}
                </p>

                {/* Status Indicators */}
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                    {pmtStatus.latest_stunting_status && pmtStatus.latest_stunting_status !== 'Normal' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                            {pmtStatus.latest_stunting_status}
                        </span>
                    )}
                    {pmtStatus.latest_wasting_status && pmtStatus.latest_wasting_status !== 'Gizi Baik' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                            {pmtStatus.latest_wasting_status}
                        </span>
                    )}
                    {pmtStatus.latest_nutritional_status && pmtStatus.latest_nutritional_status !== 'Berat Badan Normal' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                            {pmtStatus.latest_nutritional_status}
                        </span>
                    )}
                </div>

                <Button 
                    asChild 
                    size="lg"
                    className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-sm"
                >
                    <Link href={`/pmt/programs/create?child_id=${childId}`}>
                        <Plus className="h-5 w-5" />
                        Daftarkan Program PMT
                        <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

function NoDataState({ 
    pmtStatus, 
    onTabChange 
}: { 
    pmtStatus: PmtStatus; 
    onTabChange: (tab: string) => void;
}) {
    return (
        <Card className="bg-gray-50/50 border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6 text-gray-400">
                    <FileQuestion className="h-8 w-8" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Belum Ada Data Pengukuran
                </h3>
                
                <p className="text-muted-foreground max-w-md mb-8">
                    {pmtStatus.message || "Lakukan pengukuran pertumbuhan terlebih dahulu untuk menentukan apakah anak memerlukan program PMT."}
                </p>

                <Button 
                    onClick={() => onTabChange('growth')}
                    className="gap-2"
                    variant="default"
                >
                    <TrendingUp className="h-4 w-4" />
                    Lihat Pertumbuhan
                </Button>
            </CardContent>
        </Card>
    );
}

// Original implementation wrapped in a component
function ActivePmtState({ schedules, childId }: { schedules: PmtScheduleItem[], childId: number }) {
    const loggedSchedules = schedules.filter((s) => s.portion !== null);
    const pendingSchedules = schedules.filter((s) => s.portion === null);
    const totalDistributions = loggedSchedules.length;
    const thisMonthDistributions = loggedSchedules.filter((s) => {
        const date = new Date(s.scheduled_date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Section 1: PMT Status Banner */}
            <div className="w-full bg-[#047857] rounded-2xl p-6 shadow-sm text-white relative overflow-hidden">
                {/* Decorative pattern overlay */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl" />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="z-10 flex flex-col gap-4 max-w-xl">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 w-fit">
                            <div className="w-2 h-2 rounded-full bg-green-300 mr-2 animate-pulse" />
                            <span className="text-xs font-semibold tracking-wide">
                                {schedules.length > 0 ? 'Program Aktif' : 'Belum Ada Program'}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-1">PMT Balita Stunting</h2>
                            <div className="flex items-center gap-2 text-white/80 text-sm">
                                <Calendar className="h-4 w-4" />
                                <span>{totalDistributions} jadwal tercatat</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-white/90 font-medium">
                            <Clock className="h-4 w-4" />
                            <span>{pendingSchedules.length} jadwal menunggu</span>
                        </div>
                    </div>

                    <div className="z-10 flex items-center gap-6 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            {/* Circular Progress SVG */}
                            <svg className="transform -rotate-90 w-16 h-16">
                                <circle
                                    className="text-white/20"
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <circle
                                    className="text-white"
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeDasharray="175.9"
                                    strokeDashoffset={175.9 - (175.9 * (schedules.length > 0 ? (loggedSchedules.length / schedules.length) * 100 : 0)) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute text-xs font-bold">
                                {schedules.length > 0 ? Math.round((loggedSchedules.length / schedules.length) * 100) : 0}%
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-wider text-white/70">Tercatat</span>
                            <span className="text-lg font-bold">{loggedSchedules.length}/{schedules.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#DEEBC5] flex items-center justify-center text-black shrink-0">
                            <Package className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{totalDistributions}x</p>
                            <p className="text-xs text-muted-foreground font-medium">Total Distribusi</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{thisMonthDistributions}x</p>
                            <p className="text-xs text-muted-foreground font-medium">Distribusi Bulan Ini</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{pendingSchedules.length}</p>
                            <p className="text-xs text-muted-foreground font-medium">Menunggu</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#DEEBC5] flex items-center justify-center text-black shrink-0">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {schedules.length > 0 ? Math.round((loggedSchedules.length / schedules.length) * 100) : 0}%
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">Tingkat Kepatuhan</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section 3: Distribution History */}
            <Card className="flex flex-col h-full">
                <CardHeader className="flex flex-row justify-between items-center border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg">Riwayat Distribusi PMT</CardTitle>
                </CardHeader>
                <CardContent className="p-5 flex-1 relative">
                    {schedules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Package className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-sm">Belum ada jadwal PMT</p>
                        </div>
                    ) : (
                        <>
                            {/* Vertical Line */}
                            <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-gray-100" />

                            <div className="flex flex-col gap-6">
                                {schedules.map((item) => {
                                    const isLogged = item.portion !== null;
                                    const portionPercentage = item.portion ? getPortionPercentage(item.portion) : 0;
                                    const portionLabel = item.portion ? PmtPortionLabels[item.portion] : 'Belum dicatat';
                                    const portionColorClass = item.portion ? getPortionColor(item.portion) : 'bg-gray-100 text-gray-600';
                                    
                                    return (
                                        <div key={item.id} className="flex gap-4 relative z-10">
                                            <div className={`w-10 h-10 rounded-full bg-white border-2 flex items-center justify-center shrink-0 shadow-sm ${isLogged ? 'border-[#9aba59]' : 'border-gray-300'}`}>
                                                {isLogged ? (
                                                    <Check className="h-4 w-4 text-[#9aba59]" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold text-muted-foreground bg-white px-2 py-1 rounded border border-gray-100">
                                                        {formatDate(item.scheduled_date)}
                                                    </span>
                                                    <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full gap-1 ${isLogged ? 'text-black bg-[#DEEBC5]' : 'text-gray-600 bg-gray-200'}`}>
                                                        {isLogged ? (
                                                            <>
                                                                <Check className="h-3 w-3" /> Dicatat
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className="h-3 w-3" /> Menunggu
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="font-bold text-sm mb-1">
                                                    {item.food_name || 'Makanan belum ditentukan'}
                                                </p>

                                                {/* Portion Tracking */}
                                                {isLogged && (
                                                    <div className="bg-white rounded-lg p-3 border border-gray-100 mt-3">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                                                <Percent className="h-3 w-3" /> Porsi Dikonsumsi
                                                            </span>
                                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${portionColorClass}`}>
                                                                {portionLabel}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className={`h-2 rounded-full transition-all ${portionPercentage === 100 ? 'bg-[#DEEBC5]' : portionPercentage >= 50 ? 'bg-blue-500' : portionPercentage > 0 ? 'bg-amber-400' : 'bg-red-400'}`}
                                                                style={{ width: `${portionPercentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {item.notes && (
                                                    <div className="mt-3 text-xs text-muted-foreground bg-white rounded-lg p-2 border border-gray-100">
                                                        <span className="font-medium">Catatan:</span> {item.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Section 4: Actions Footer */}
            <Card className="p-6 sticky bottom-0 z-20 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-lg border-t bg-white/95 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Button className="bg-[#DEEBC5] text-black hover:bg-[#c5daa6] gap-2 shadow-sm" asChild>
                        <Link href={`/pmt/programs/create?child_id=${childId}`}>
                            <Plus className="h-5 w-5" />
                            Catat Distribusi Baru
                        </Link>
                    </Button>
                    <Button variant="outline" className="gap-2" asChild>
                         <Link href={`/pmt/reports?child_id=${childId}`}>
                            <FileText className="h-5 w-5 text-gray-500" />
                            Lihat Laporan PMT
                         </Link>
                    </Button>
                </div>
                <Button variant="ghost" className="text-muted-foreground hover:text-black gap-2 w-full sm:w-auto">
                    <Phone className="h-5 w-5" />
                    Hubungi Petugas
                </Button>
            </Card>
        </div>
    );
}
