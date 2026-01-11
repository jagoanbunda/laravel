import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Package,
    Calendar,
    Scale,
    TrendingUp,
    Check,
    Phone,
    FileText,
    Plus,
    Zap,
    Clock,
    Flag,
    Utensils,
    Percent,
} from 'lucide-react';
import {
    type PmtPortion,
    PmtPortionLabels,
    getPortionPercentage,
    getPortionColor,
} from '@/types/models';

// Mock distribution history data with portion tracking
const distributionHistory: {
    id: number;
    date: string;
    package: string;
    contents: string;
    status: 'received' | 'pending';
    portion: PmtPortion;
    officer: { name: string; initials: string; color: string };
}[] = [
        {
            id: 1,
            date: '28 Des 2024',
            package: 'Bubur Kacang Hijau',
            contents: '5 sachet @200ml',
            status: 'received',
            portion: 'habis',
            officer: { name: 'Bidan Siti', initials: 'BS', color: 'bg-gray-200 text-gray-600' },
        },
        {
            id: 2,
            date: '21 Des 2024',
            package: 'Biskuit PMT + Susu',
            contents: '10 pcs Biskuit, 2 Kotak Susu',
            status: 'received',
            portion: 'half',
            officer: { name: 'Kader Ani', initials: 'KA', color: 'bg-purple-100 text-purple-600' },
        },
        {
            id: 3,
            date: '14 Des 2024',
            package: 'Telur + Tempe',
            contents: '5 Butir Telur, 500g Tempe',
            status: 'received',
            portion: 'quarter',
            officer: { name: 'Bidan Siti', initials: 'BS', color: 'bg-gray-200 text-gray-600' },
        },
    ];

// Mock menu items
const menuItems = [
    {
        id: 1,
        name: 'Bubur Kacang Hijau',
        category: 'Protein Nabati',
        calories: '150 kkal/porsi',
        frequency: '2x / minggu',
        image: '/images/bubur-kacang-hijau.jpg',
    },
    {
        id: 2,
        name: 'Telur Rebus & Tempe',
        category: 'Protein Hewani',
        calories: '200 kkal/porsi',
        frequency: '3x / minggu',
        image: '/images/telur-tempe.jpg',
    },
];

export default function PmtTabContent() {
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
                            <span className="text-xs font-semibold tracking-wide">Program Aktif</span>
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-1">PMT Balita Stunting</h2>
                            <div className="flex items-center gap-2 text-white/80 text-sm">
                                <Calendar className="h-4 w-4" />
                                <span>Terdaftar sejak 1 Oktober 2024</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-white/90 font-medium">
                            <Clock className="h-4 w-4" />
                            <span>Bulan ke-3 dari 6 bulan program</span>
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
                                    strokeDashoffset="87.95"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute text-xs font-bold">50%</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-wider text-white/70">Durasi</span>
                            <span className="text-lg font-bold">3/6 Bulan</span>
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
                            <p className="text-2xl font-bold">12x</p>
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
                            <p className="text-2xl font-bold">4x</p>
                            <p className="text-xs text-muted-foreground font-medium">Distribusi Bulan Ini</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <Scale className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">10.2 <span className="text-sm font-normal text-muted-foreground">kg</span></p>
                            <p className="text-xs text-muted-foreground font-medium">Berat Awal (1 Okt)</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#DEEBC5] flex items-center justify-center text-black shrink-0">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold">12.5 <span className="text-sm font-normal text-muted-foreground">kg</span></p>
                                <span className="text-xs font-bold text-black bg-[#DEEBC5] px-1.5 py-0.5 rounded flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-0.5" />+2.3
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">Berat Sekarang</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section 3: Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Distribution History */}
                <Card className="flex flex-col h-full">
                    <CardHeader className="flex flex-row justify-between items-center border-b pb-4">
                        <CardTitle className="text-lg">Riwayat Distribusi PMT</CardTitle>
                        <Button variant="link" className="text-black p-0 h-auto">Filter</Button>
                    </CardHeader>
                    <CardContent className="p-5 flex-1 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-gray-100" />

                        <div className="flex flex-col gap-6">
                            {distributionHistory.map((item) => {
                                const portionPercentage = getPortionPercentage(item.portion);
                                const portionLabel = PmtPortionLabels[item.portion];
                                const portionColorClass = getPortionColor(item.portion);
                                return (
                                    <div key={item.id} className="flex gap-4 relative z-10">
                                        <div className="w-10 h-10 rounded-full bg-white border-2 border-[#9aba59] flex items-center justify-center shrink-0 shadow-sm">
                                            <Check className="h-4 w-4 text-[#9aba59]" />
                                        </div>
                                        <div className="flex-1 bg-gray-50 rounded-xl p-4 border">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-muted-foreground bg-white px-2 py-1 rounded border">{item.date}</span>
                                                <span className="flex items-center text-xs font-medium text-black bg-[#DEEBC5] px-2 py-1 rounded-full gap-1">
                                                    <Check className="h-3 w-3" /> Diterima
                                                </span>
                                            </div>
                                            <p className="font-bold text-sm mb-1">Paket: {item.package}</p>
                                            <p className="text-xs text-muted-foreground mb-3">Isi: {item.contents}</p>

                                            {/* Portion Tracking */}
                                            <div className="bg-white rounded-lg p-3 border mb-3">
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

                                            <div className="flex items-center gap-2 border-t pt-2 mt-1">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${item.officer.color}`}>
                                                    {item.officer.initials}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Petugas: <span className="font-medium text-foreground">{item.officer.name}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                    <div className="p-4 border-t text-center">
                        <Button variant="link" className="text-black font-semibold">
                            Lihat Semua Riwayat
                        </Button>
                    </div>
                </Card>

                {/* Right: PMT Menu */}
                <Card className="flex flex-col h-full">
                    <CardHeader className="flex flex-row justify-between items-center border-b pb-4">
                        <CardTitle className="text-lg">Menu PMT Bulan Ini</CardTitle>
                        <span className="text-xs font-medium bg-gray-100 text-muted-foreground px-2 py-1 rounded">Desember</span>
                    </CardHeader>
                    <CardContent className="p-5 flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {menuItems.map((item) => (
                                <div key={item.id} className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                                    <div className="h-32 bg-gradient-to-br from-[#DEEBC5] to-teal-50 overflow-hidden relative flex items-center justify-center">
                                        <Utensils className="h-12 w-12 text-[#b8d49a]" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                            <p className="text-white text-xs font-medium">{item.category}</p>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-sm mb-1">{item.name}</h4>
                                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Zap className="h-3.5 w-3.5 text-orange-400" />
                                                <span>{item.calories}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5 text-blue-400" />
                                                <span>{item.frequency}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <div className="mt-auto p-4 bg-[#f0f7e4] border-t border-[#DEEBC5] mx-5 mb-5 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-full shadow-sm text-black">
                                <Utensils className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Target Harian</p>
                                <p className="text-sm font-bold">500 kkal tambahan</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Section 4: Progress Chart */}
            <Card className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h3 className="font-bold text-lg">Progres Berat Badan</h3>
                        <p className="text-sm text-muted-foreground">Monitoring kenaikan berat badan selama program PMT</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#DEEBC5]" />
                            <span className="text-muted-foreground">Aktual</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-gray-300 border border-dashed border-gray-400" />
                            <span className="text-muted-foreground">Proyeksi</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm bg-green-100 border border-green-200" />
                            <span className="text-muted-foreground">Target Zone</span>
                        </div>
                    </div>
                </div>

                {/* Custom SVG Chart */}
                <div className="w-full h-[300px] relative">
                    {/* Y Axis Labels */}
                    <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-400 w-10 text-right pr-2">
                        <span>15kg</span>
                        <span>14kg</span>
                        <span>13kg</span>
                        <span>12kg</span>
                        <span>11kg</span>
                        <span>10kg</span>
                    </div>

                    {/* Chart Area */}
                    <div className="absolute left-10 right-0 top-2 bottom-8 border-l border-b border-gray-200">
                        {/* Target Zone */}
                        <div className="absolute left-0 right-0 top-[20%] bottom-[40%] bg-green-50/50 border-y border-green-100/50" />

                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="border-b border-gray-100 h-full w-full" />
                            ))}
                        </div>

                        {/* Data Visualization */}
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            {/* Dashed Projection Line */}
                            <line
                                x1="40%"
                                y1="50%"
                                x2="100%"
                                y2="30%"
                                stroke="#9ca3af"
                                strokeWidth="2"
                                strokeDasharray="6,4"
                            />
                            {/* Actual Data Line */}
                            <polyline
                                points="0,96% 20%,80% 40%,50%"
                                fill="none"
                                stroke="#10b77f"
                                strokeWidth="3"
                            />
                            {/* Points */}
                            <circle cx="0%" cy="96%" r="5" fill="#10b77f" stroke="white" strokeWidth="2" />
                            <circle cx="20%" cy="80%" r="5" fill="#10b77f" stroke="white" strokeWidth="2" />
                            <circle cx="40%" cy="50%" r="6" fill="#10b77f" stroke="white" strokeWidth="3" />
                            {/* Target Point */}
                            <circle cx="100%" cy="30%" r="5" fill="#f6f8f7" stroke="#9ca3af" strokeWidth="2" strokeDasharray="2,2" />
                        </svg>

                        {/* Tooltip */}
                        <div className="absolute left-[40%] top-[40%] transform -translate-x-1/2 -translate-y-full mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
                            12.5 kg
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 border-4 border-transparent border-t-gray-900" />
                        </div>
                    </div>

                    {/* X Axis Labels */}
                    <div className="absolute left-10 right-0 bottom-0 flex justify-between text-xs text-muted-foreground pt-2">
                        <span>Okt</span>
                        <span>Nov</span>
                        <span className="font-bold text-foreground">Des</span>
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                    </div>
                </div>

                {/* Progress Footer */}
                <div className="mt-8 flex flex-col md:flex-row items-center gap-6 bg-[#f0f7e4] p-4 rounded-xl border border-[#DEEBC5]">
                    <div className="flex-1 w-full">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-bold">Menuju Target Akhir</span>
                            <span className="text-sm font-bold text-black">85%</span>
                        </div>
                        <div className="w-full bg-[#c5daa6] rounded-full h-2.5">
                            <div className="bg-[#DEEBC5] h-2.5 rounded-full" style={{ width: '85%' }} />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 md:border-l border-[#c5daa6] pt-4 md:pt-0 md:pl-6">
                        <Flag className="h-8 w-8 text-black" />
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase">Target (Gizi Normal)</p>
                            <p className="text-lg font-bold">13.5 kg</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Section 5: Actions Footer */}
            <Card className="p-6 sticky bottom-0 z-20 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Button className="bg-[#DEEBC5] text-black hover:bg-[#c5daa6] gap-2">
                        <Plus className="h-5 w-5" />
                        Catat Distribusi Baru
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        Lihat Laporan PMT
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
