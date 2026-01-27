import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
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
    UtensilsCrossed,
    ChevronLeft,
    ChevronRight,
    Search,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FoodLogItem {
    id: number;
    food_name: string | null;
    quantity: string;
    serving_size: string;
    calories: string;
    protein: string;
}

interface FoodLog {
    id: number;
    log_date: string;
    meal_time: string | null;
    total_calories: string;
    total_protein: string;
    total_fat: string;
    total_carbohydrate: string;
    notes: string | null;
    items: FoodLogItem[];
}

interface Props {
    foodLogs: FoodLog[];
}

// Meal time configuration
const mealTimeConfig: Record<string, { label: string; icon: LucideIcon; iconBg: string }> = {
    breakfast: { label: 'Sarapan', icon: Sunrise, iconBg: 'bg-amber-100 text-amber-500' },
    lunch: { label: 'Makan Siang', icon: Sun, iconBg: 'bg-[#DEEBC5] text-black' },
    dinner: { label: 'Makan Malam', icon: Moon, iconBg: 'bg-indigo-100 text-indigo-500' },
    snack: { label: 'Snack', icon: Cookie, iconBg: 'bg-orange-100 text-orange-500' },
};

// Helper to normalize date string from Laravel (handles timezone correctly)
function normalizeDate(dateValue: string): string {
    // Laravel sends dates like "2026-01-22T00:00:00.000000Z" - extract YYYY-MM-DD directly
    return dateValue.split('T')[0];
}

// Helper to get local date string (YYYY-MM-DD format)
function getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper to get today's date string
function getTodayDateString(): string {
    return getLocalDateString(new Date());
}

// Helper to format date
function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

// Helper to filter logs by date
function getLogsForDate(foodLogs: FoodLog[], dateStr: string): FoodLog[] {
    return foodLogs.filter((log) => {
        const logDate = normalizeDate(log.log_date);
        return logDate === dateStr;
    });
}

// Helper to calculate daily overview
function calculateDailyOverview(logs: FoodLog[]) {
    const totalCalories = logs.reduce((sum, log) => sum + parseFloat(log.total_calories || '0'), 0);
    const totalProtein = logs.reduce((sum, log) => sum + parseFloat(log.total_protein || '0'), 0);
    const mealsToday = logs.length;

    const calorieTarget = 1200;
    const proteinTarget = 35;

    return {
        calories: {
            current: Math.round(totalCalories),
            target: calorieTarget,
            percentage: Math.min(100, Math.round((totalCalories / calorieTarget) * 100)),
        },
        protein: {
            current: Math.round(totalProtein),
            target: proteinTarget,
            percentage: Math.min(100, Math.round((totalProtein / proteinTarget) * 100)),
        },
        mealsToday,
    };
}

// Helper to calculate nutrients from logs
function calculateNutrients(logs: FoodLog[]) {
    const totalCalories = logs.reduce((sum, log) => sum + parseFloat(log.total_calories || '0'), 0);
    const totalProtein = logs.reduce((sum, log) => sum + parseFloat(log.total_protein || '0'), 0);
    const totalFat = logs.reduce((sum, log) => sum + parseFloat(log.total_fat || '0'), 0);
    const totalCarbs = logs.reduce((sum, log) => sum + parseFloat(log.total_carbohydrate || '0'), 0);

    const getStatus = (percentage: number) => {
        if (percentage >= 80) return 'good';
        if (percentage >= 60) return 'normal';
        if (percentage >= 40) return 'warning';
        return 'low';
    };

    const carbTarget = 150;
    const proteinTarget = 35;
    const fatTarget = 35;

    const carbPercentage = Math.min(100, Math.round((totalCarbs / carbTarget) * 100));
    const proteinPercentage = Math.min(100, Math.round((totalProtein / proteinTarget) * 100));
    const fatPercentage = Math.min(100, Math.round((totalFat / fatTarget) * 100));

    return [
        {
            name: 'Karbohidrat',
            current: Math.round(totalCarbs),
            target: carbTarget,
            unit: 'g',
            percentage: carbPercentage,
            status: getStatus(carbPercentage),
        },
        {
            name: 'Protein',
            current: Math.round(totalProtein),
            target: proteinTarget,
            unit: 'g',
            percentage: proteinPercentage,
            status: getStatus(proteinPercentage),
        },
        {
            name: 'Lemak',
            current: Math.round(totalFat),
            target: fatTarget,
            unit: 'g',
            percentage: fatPercentage,
            status: getStatus(fatPercentage),
        },
        {
            name: 'Kalori',
            current: Math.round(totalCalories),
            target: 1200,
            unit: 'kkal',
            percentage: Math.min(100, Math.round((totalCalories / 1200) * 100)),
            status: getStatus(Math.round((totalCalories / 1200) * 100)),
        },
    ];
}

// Helper to generate weekly data from logs
function generateWeeklyData(foodLogs: FoodLog[]) {
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const today = new Date();

    // Get last 7 days
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getLocalDateString(date);
        const dayIndex = date.getDay();

        const dayLogs = foodLogs.filter((log) => {
            const logDate = normalizeDate(log.log_date);
            return logDate === dateStr;
        });

        const totalCalories = dayLogs.reduce((sum, log) => sum + parseFloat(log.total_calories || '0'), 0);
        const percentage = Math.min(100, Math.round((totalCalories / 1200) * 100));

        weeklyData.push({
            day: dayNames[dayIndex],
            calories: Math.round(totalCalories),
            percentage: percentage || 5, // Minimum 5% for visibility
            onTarget: totalCalories >= 1000,
            isToday: i === 0,
        });
    }

    return weeklyData;
}

// Calculate average calories from weekly data
function calculateAverageCalories(weeklyData: ReturnType<typeof generateWeeklyData>): number {
    const daysWithData = weeklyData.filter((d) => d.calories > 0);
    if (daysWithData.length === 0) return 0;
    const total = daysWithData.reduce((sum, d) => sum + d.calories, 0);
    return Math.round(total / daysWithData.length);
}

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

function getProteinStatus(percentage: number): string {
    if (percentage >= 80) return 'Baik';
    if (percentage >= 60) return 'Cukup';
    if (percentage >= 40) return 'Kurang';
    return 'Sangat Kurang';
}

export default function NutritionTabContent({ foodLogs }: Props) {
    const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
    const [historyPage, setHistoryPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const selectedDateLogs = getLogsForDate(foodLogs, selectedDate);
    const dailyOverview = calculateDailyOverview(selectedDateLogs);
    const nutrients = calculateNutrients(selectedDateLogs);
    const weeklyData = generateWeeklyData(foodLogs);
    const averageCalories = calculateAverageCalories(weeklyData);

    // Filter food logs by search query
    const filteredFoodLogs = foodLogs.filter((log) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const foodNames = log.items.map((item) => item.food_name?.toLowerCase() || '').join(' ');
        const mealLabel = mealTimeConfig[log.meal_time || 'snack']?.label.toLowerCase() || '';
        const dateStr = formatDate(normalizeDate(log.log_date)).toLowerCase();
        const notes = log.notes?.toLowerCase() || '';
        return foodNames.includes(query) || mealLabel.includes(query) || dateStr.includes(query) || notes.includes(query);
    });

    // Sort filtered logs by date descending, then by meal time order
    const sortedFoodLogs = [...filteredFoodLogs].sort((a, b) => {
        const dateA = normalizeDate(a.log_date);
        const dateB = normalizeDate(b.log_date);
        if (dateB !== dateA) return dateB.localeCompare(dateA);
        const mealOrder = { breakfast: 1, lunch: 2, snack: 3, dinner: 4 };
        const orderA = mealOrder[a.meal_time as keyof typeof mealOrder] || 5;
        const orderB = mealOrder[b.meal_time as keyof typeof mealOrder] || 5;
        return orderA - orderB;
    });

    const totalPages = Math.ceil(sortedFoodLogs.length / itemsPerPage);
    const paginatedLogs = sortedFoodLogs.slice(
        (historyPage - 1) * itemsPerPage,
        historyPage * itemsPerPage
    );

    // Reset to page 1 when search or items per page changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setHistoryPage(1);
    };

    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value);
        setHistoryPage(1);
    };

    // Empty state
    if (foodLogs.length === 0) {
        return (
            <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <UtensilsCrossed className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Belum Ada Catatan Makanan</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Orang tua belum mencatat makanan anak melalui aplikasi mobile.
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Date Filter */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold">Filter Tanggal</h3>
                        <p className="text-sm text-muted-foreground">Pilih tanggal untuk melihat catatan makanan</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DEEBC5]"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDate(getTodayDateString())}
                        >
                            Hari Ini
                        </Button>
                    </div>
                </div>
            </Card>

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
                            <Badge className="bg-[#DEEBC5] text-black border-[#c5daa6]">
                                {getProteinStatus(dailyOverview.protein.percentage)}
                            </Badge>
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
                        <CardTitle className="text-lg">
                            Catatan Makan {selectedDate === getTodayDateString() ? 'Hari Ini' : formatDate(selectedDate)}
                        </CardTitle>
                        <Button className="bg-[#DEEBC5] text-black hover:bg-[#c5daa6] gap-2" size="sm">
                            <Plus className="h-4 w-4" />
                            Tambah Makanan
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6 flex-1">
                        {selectedDateLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                    <Utensils className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-sm text-muted-foreground">Belum ada catatan makanan tanggal ini</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-0 relative">
                                {/* Vertical Timeline Line */}
                                <div className="absolute left-[19px] top-4 bottom-20 w-0.5 bg-gray-100 -z-0" />

                                {/* Food Items */}
                                {selectedDateLogs.map((log) => {
                                    const mealConfig = mealTimeConfig[log.meal_time || 'snack'] || mealTimeConfig.snack;
                                    const IconComponent = mealConfig.icon;
                                    const foodNames =
                                        log.items.map((item) => item.food_name).filter(Boolean).join(' + ') ||
                                        'Makanan tidak tercatat';

                                    return (
                                        <div key={log.id} className="flex gap-4 relative pb-6 group">
                                            <div className="relative z-10 flex-none bg-white py-1">
                                                <div
                                                    className={`w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${mealConfig.iconBg}`}
                                                >
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
                                                            {mealConfig.label}
                                                        </p>
                                                        <button className="text-muted-foreground hover:text-foreground">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <p className="font-semibold">{foodNames}</p>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-white px-2 py-1 rounded border">
                                                            <Flame className="h-3.5 w-3.5 text-orange-400" />
                                                            {Math.round(parseFloat(log.total_calories || '0'))} kkal
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-white px-2 py-1 rounded border">
                                                            <Dumbbell className="h-3.5 w-3.5 text-blue-400" />
                                                            Protein: {Math.round(parseFloat(log.total_protein || '0'))}g
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-white px-2 py-1 rounded border">
                                                            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center text-[8px] text-white font-bold">L</span>
                                                            Lemak: {Math.round(parseFloat(log.total_fat || '0'))}g
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-white px-2 py-1 rounded border">
                                                            <span className="w-3.5 h-3.5 rounded-full bg-purple-400 flex items-center justify-center text-[8px] text-white font-bold">K</span>
                                                            Karbo: {Math.round(parseFloat(log.total_carbohydrate || '0'))}g
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Empty State for remaining meals */}
                                {selectedDateLogs.length < 3 && (
                                    <div className="flex gap-4 relative">
                                        <div className="relative z-10 flex-none bg-white py-1">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 border-4 border-white text-gray-400 flex items-center justify-center">
                                                <Moon className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <div className="flex-1 border border-dashed rounded-xl p-4 flex items-center justify-center text-muted-foreground gap-2 bg-gray-50">
                                            <span className="text-sm font-medium">Tambahkan catatan makanan lainnya</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Column: Weekly Analysis */}
                <Card className="flex flex-col">
                    <CardHeader className="border-b pb-4">
                        <CardTitle className="text-lg">Analisis Nutrisi Mingguan</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col">
                        {/* Chart Area - explicit height required for percentage bars */}
                        <div className="relative h-[180px] mb-6">
                            {/* Background grid lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className="border-b border-gray-100" />
                                ))}
                            </div>

                            {/* Target Line at 100% (top area) */}
                            <div className="absolute top-0 left-0 right-0 border-t-2 border-dashed border-green-400 z-0" />
                            <span className="absolute -top-5 right-0 text-[10px] bg-white px-1 text-green-600 font-medium">Target</span>

                            {/* Bars container */}
                            <div className="flex items-end justify-between gap-2 h-full px-2 relative z-10">
                                {weeklyData.map((item, index) => (
                                    <div key={index} className="flex-1 h-full flex flex-col items-center justify-end group cursor-pointer">
                                        {/* Bar */}
                                        <div
                                            className={`w-full max-w-[28px] rounded-t-md group-hover:opacity-80 transition-all duration-300 ${item.onTarget ? 'bg-green-400' : 'bg-amber-400'} ${item.isToday ? 'ring-2 ring-amber-500 ring-offset-1' : ''}`}
                                            style={{ height: `${Math.max(5, item.percentage)}%` }}
                                            title={`${item.calories} kkal (${item.percentage}%)`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Day labels - separate row */}
                        <div className="flex justify-between px-2">
                            {weeklyData.map((item, index) => (
                                <div key={index} className="flex-1 text-center">
                                    <span className={`text-xs font-medium ${item.isToday ? 'text-amber-600 font-bold' : 'text-muted-foreground'}`}>
                                        {item.day}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Rata-rata: <span className="text-foreground font-bold">{averageCalories} kkal/hari</span>
                                </p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                                    <span className="font-bold">Rekomendasi:</span>{' '}
                                    {averageCalories < 800
                                        ? 'Tingkatkan asupan kalori dan protein untuk mencapai target pertumbuhan.'
                                        : averageCalories < 1000
                                          ? 'Asupan cukup baik. Pastikan variasi makanan seimbang.'
                                          : 'Asupan nutrisi baik! Pertahankan pola makan sehat.'}
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
                                            {nutrient.current}
                                            {nutrient.unit}{' '}
                                            <span className="text-muted-foreground font-normal">
                                                / {nutrient.target}
                                                {nutrient.unit}
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

            {/* Section 4: Food History */}
            <Card>
                <CardHeader className="border-b pb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg">Riwayat Makanan</CardTitle>
                            <span className="text-sm text-muted-foreground">
                                {searchQuery ? `${sortedFoodLogs.length} dari ${foodLogs.length} catatan` : `${foodLogs.length} catatan`}
                            </span>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari makanan, tanggal, catatan..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DEEBC5]"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {paginatedLogs.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground">
                            Tidak ada riwayat makanan
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Waktu Makan</TableHead>
                                    <TableHead className="min-w-[200px]">Makanan</TableHead>
                                    <TableHead className="text-right">Kalori</TableHead>
                                    <TableHead className="text-right">Protein</TableHead>
                                    <TableHead className="text-right">Lemak</TableHead>
                                    <TableHead className="text-right">Karbo</TableHead>
                                    <TableHead>Catatan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedLogs.map((log) => {
                                    const mealConfig = mealTimeConfig[log.meal_time || 'snack'] || mealTimeConfig.snack;
                                    const IconComponent = mealConfig.icon;
                                    const foodNames = log.items.map((item) => item.food_name).filter(Boolean).join(', ') || '-';
                                    
                                    return (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">
                                                {formatDate(normalizeDate(log.log_date))}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${mealConfig.iconBg}`}>
                                                        <IconComponent className="h-3 w-3" />
                                                    </div>
                                                    <span className="text-sm">{mealConfig.label}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[250px]">
                                                <span className="line-clamp-2 text-sm">{foodNames}</span>
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {Math.round(parseFloat(log.total_calories || '0'))} kkal
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {Math.round(parseFloat(log.total_protein || '0'))}g
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {Math.round(parseFloat(log.total_fat || '0'))}g
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {Math.round(parseFloat(log.total_carbohydrate || '0'))}g
                                            </TableCell>
                                            <TableCell className="max-w-[150px]">
                                                {log.notes ? (
                                                    <span className="text-sm text-muted-foreground line-clamp-2">{log.notes}</span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                    
                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Tampilkan</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#DEEBC5]"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="text-sm text-muted-foreground">per halaman</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <p className="text-sm text-muted-foreground">
                                Halaman {historyPage} dari {totalPages || 1}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                                    disabled={historyPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setHistoryPage((p) => Math.min(totalPages || 1, p + 1))}
                                    disabled={historyPage >= totalPages || totalPages === 0}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
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
