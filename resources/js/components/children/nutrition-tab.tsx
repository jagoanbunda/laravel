import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Flame,
    Dumbbell,
    Utensils,
    Sun,
    Sunrise,
    Cookie,
    Moon,
    TrendingUp,
    MoreHorizontal,
} from 'lucide-react';

// Mock nutrition data
const dailyOverview = {
    calories: { current: 850, target: 1200, percentage: 70 },
    protein: { current: 25, target: 35, percentage: 71 },
    mealsToday: 3,
};

const foodLog = [
    {
        id: 1,
        time: '07:30',
        meal: 'Sarapan',
        food: 'Bubur ayam + telur rebus',
        calories: 320,
        protein: 12,
        icon: Sunrise,
        iconBg: 'bg-amber-100 text-amber-500',
    },
    {
        id: 2,
        time: '12:00',
        meal: 'Makan Siang',
        food: 'Nasi + sayur bayam + tempe goreng',
        calories: 380,
        protein: 10,
        icon: Sun,
        iconBg: 'bg-[#DEEBC5] text-black',
    },
    {
        id: 3,
        time: '15:30',
        meal: 'Snack',
        food: 'Pisang 1 buah + susu UHT',
        calories: 150,
        protein: 3,
        icon: Cookie,
        iconBg: 'bg-orange-100 text-orange-500',
    },
];

const weeklyData = [
    { day: 'Sen', calories: 800, percentage: 40, onTarget: false },
    { day: 'Sel', calories: 1250, percentage: 75, onTarget: true },
    { day: 'Rab', calories: 1180, percentage: 70, onTarget: true },
    { day: 'Kam', calories: 900, percentage: 50, onTarget: false },
    { day: 'Jum', calories: 1300, percentage: 80, onTarget: true },
    { day: 'Sab', calories: 850, percentage: 45, onTarget: false },
    { day: 'Min', calories: 0, percentage: 25, onTarget: false, isToday: true },
];

const nutrients = [
    { name: 'Karbohidrat', current: 105, target: 150, unit: 'g', percentage: 70, status: 'normal', color: 'emerald' },
    { name: 'Protein', current: 21, target: 35, unit: 'g', percentage: 60, status: 'warning', color: 'amber' },
    { name: 'Lemak', current: 28, target: 35, unit: 'g', percentage: 80, status: 'normal', color: 'emerald' },
    { name: 'Serat', current: 6, target: 15, unit: 'g', percentage: 40, status: 'low', color: 'orange' },
    { name: 'Vitamin A', current: 450, target: 500, unit: 'mcg', percentage: 90, status: 'good', color: 'blue' },
    { name: 'Zat Besi', current: 5, target: 8, unit: 'mg', percentage: 62, status: 'warning', color: 'amber' },
];

function getStatusBadge(status: string) {
    switch (status) {
        case 'normal':
            return <Badge className="bg-[#DEEBC5] text-black border-[#c5daa6] text-[10px]">Normal</Badge>;
        case 'good':
            return <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Baik</Badge>;
        case 'warning':
            return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">Perlu Ditingkatkan</Badge>;
        case 'low':
            return <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px]">Kurang</Badge>;
        default:
            return null;
    }
}

function getProgressColor(status: string) {
    switch (status) {
        case 'normal':
            return 'bg-[#DEEBC5]';
        case 'good':
            return 'bg-blue-500';
        case 'warning':
            return 'bg-amber-400';
        case 'low':
            return 'bg-orange-500';
        default:
            return 'bg-gray-400';
    }
}

export default function NutritionTabContent() {
    return (
        <div className="flex flex-col gap-6">
            {/* Section 1: Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Calorie Ring */}
                <Card className="relative overflow-hidden group hover:border-[#c5daa6] transition-colors">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="font-semibold mb-1">Asupan Kalori</p>
                                <p className="text-xs text-muted-foreground">Target harian</p>
                            </div>
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <circle
                                        className="text-gray-100"
                                        cx="18"
                                        cy="18"
                                        r="15.9155"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3.5"
                                    />
                                    <circle
                                        className="text-black"
                                        cx="18"
                                        cy="18"
                                        r="15.9155"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3.5"
                                        strokeDasharray={`${dailyOverview.calories.percentage}, 100`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="absolute text-[10px] font-bold text-black">
                                    {dailyOverview.calories.percentage}%
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-bold tracking-tight">
                                {dailyOverview.calories.current}{' '}
                                <span className="text-lg text-muted-foreground font-medium">
                                    / {dailyOverview.calories.target.toLocaleString()} kkal
                                </span>
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {dailyOverview.calories.percentage}% dari kebutuhan harian
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 2: Protein */}
                <Card className="group hover:border-[#c5daa6] transition-colors">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="font-semibold mb-1">Protein</p>
                                <p className="text-xs text-muted-foreground">Pembangun otot</p>
                            </div>
                            <Badge className="bg-[#DEEBC5] text-black border-[#c5daa6]">Cukup</Badge>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <p className="text-3xl font-bold tracking-tight">{dailyOverview.protein.current}g</p>
                                <p className="text-lg text-muted-foreground font-medium">/ {dailyOverview.protein.target}g</p>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 mt-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-[#9aba59] to-teal-400 h-2.5 rounded-full transition-all"
                                    style={{ width: `${dailyOverview.protein.percentage}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 3: Frequency */}
                <Card className="group hover:border-[#c5daa6] transition-colors">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="font-semibold mb-1">Frekuensi Makan</p>
                                <p className="text-xs text-muted-foreground">Jadwal teratur</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                                <Utensils className="h-5 w-5" />
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-bold tracking-tight">{dailyOverview.mealsToday}x</p>
                            <p className="text-sm text-muted-foreground mt-1">Makan hari ini</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section 2: Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Food Log */}
                <Card className="lg:col-span-2 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <CardTitle className="text-lg">Catatan Makan Hari Ini</CardTitle>
                        <Button className="bg-[#DEEBC5] text-black hover:bg-[#c5daa6] gap-2" size="sm">
                            <Plus className="h-4 w-4" />
                            Tambah Makanan
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6 flex-1">
                        <div className="flex flex-col gap-0 relative">
                            {/* Vertical Timeline Line */}
                            <div className="absolute left-[19px] top-4 bottom-20 w-0.5 bg-gray-100 -z-0" />

                            {/* Food Items */}
                            {foodLog.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <div key={item.id} className="flex gap-4 relative pb-6 group">
                                        <div className="relative z-10 flex-none bg-white py-1">
                                            <div className={`w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${item.iconBg}`}>
                                                <IconComponent className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-gray-50 p-4 rounded-xl border hover:border-[#c5daa6] transition-colors flex gap-4 items-start">
                                            <div className="w-14 h-14 bg-gradient-to-br from-[#DEEBC5] to-teal-50 rounded-lg flex items-center justify-center shrink-0">
                                                <Utensils className="h-6 w-6 text-black" />
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <div className="flex justify-between w-full">
                                                    <p className="text-xs font-bold text-black tracking-wide uppercase">
                                                        {item.time} - {item.meal}
                                                    </p>
                                                    <button className="text-muted-foreground hover:text-foreground">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <p className="font-semibold">{item.food}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-white px-2 py-1 rounded border">
                                                        <Flame className="h-3.5 w-3.5 text-orange-400" />
                                                        {item.calories} kkal
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-white px-2 py-1 rounded border">
                                                        <Dumbbell className="h-3.5 w-3.5 text-blue-400" />
                                                        Protein: {item.protein}g
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Empty State for Dinner */}
                            <div className="flex gap-4 relative">
                                <div className="relative z-10 flex-none bg-white py-1">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 border-4 border-white text-gray-400 flex items-center justify-center">
                                        <Moon className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="flex-1 border border-dashed rounded-xl p-4 flex items-center justify-center text-muted-foreground gap-2 bg-gray-50">
                                    <span className="text-sm font-medium">Tambahkan makan malam untuk melengkapi hari ini</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Weekly Analysis */}
                <Card className="flex flex-col">
                    <CardHeader className="border-b pb-4">
                        <CardTitle className="text-lg">Analisis Nutrisi Mingguan</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col">
                        {/* Chart Area */}
                        <div className="flex-1 flex flex-col justify-end gap-2 min-h-[200px] relative pb-6">
                            {/* Target Line */}
                            <div className="absolute top-[30%] left-0 right-0 border-t border-dashed border-gray-300 z-0" />
                            <span className="absolute top-[26%] right-0 text-[10px] bg-white px-1 text-gray-400">Target</span>

                            <div className="flex items-end justify-between h-full gap-2 z-10 px-2">
                                {weeklyData.map((item, index) => (
                                    <div key={index} className="flex flex-col items-center gap-2 w-full group cursor-pointer">
                                        <div
                                            className={`w-full max-w-[24px] rounded-t-md group-hover:opacity-80 transition-opacity ${item.onTarget ? 'bg-[#DEEBC5]' : 'bg-amber-400'
                                                } ${item.isToday ? 'border-2 border-dashed border-amber-500' : ''}`}
                                            style={{ height: `${item.percentage}%` }}
                                            title={`${item.calories} kkal`}
                                        />
                                        <span className={`text-xs font-medium ${item.isToday ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                                            {item.day}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Rata-rata: <span className="text-foreground font-bold">920 kkal/hari</span>
                                </p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                                    <span className="font-bold">Rekomendasi:</span> Tingkatkan asupan protein dan karbohidrat kompleks untuk mencapai target pertumbuhan.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section 3: Nutrient Breakdown */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <CardTitle className="text-lg">Detail Nutrisi Harian</CardTitle>
                    <Button variant="link" className="text-black p-0 h-auto">
                        Lihat Detail Lengkap
                    </Button>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {nutrients.map((nutrient, index) => (
                            <div key={index} className="flex flex-col gap-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-medium">{nutrient.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold">
                                            {nutrient.current}{nutrient.unit}{' '}
                                            <span className="text-muted-foreground font-normal">
                                                / {nutrient.target}{nutrient.unit}
                                            </span>
                                        </span>
                                        {getStatusBadge(nutrient.status)}
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${getProgressColor(nutrient.status)}`}
                                        style={{ width: `${nutrient.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Action Footer */}
            <Card className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Button className="bg-[#DEEBC5] text-black hover:bg-[#c5daa6] gap-2">
                        <Plus className="h-5 w-5" />
                        Catat Makanan
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Utensils className="h-5 w-5 text-gray-500" />
                        Lihat Menu Rekomendasi
                    </Button>
                </div>
                <Button variant="ghost" className="text-muted-foreground hover:text-black gap-2 w-full sm:w-auto">
                    <TrendingUp className="h-5 w-5" />
                    Lihat Laporan Mingguan
                </Button>
            </Card>
        </div>
    );
}
