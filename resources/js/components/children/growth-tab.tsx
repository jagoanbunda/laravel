import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Plus,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Scale,
    Ruler,
    Gauge,
    ArrowUp,
    ArrowRight as ArrowRightIcon,
    Check,
    MapPin,
} from 'lucide-react';
import { useState } from 'react';
import {
    type AnthropometryMeasurement,
    NutritionalStatusLabels,
    MeasurementLocationLabels,
    getNutritionalStatusColor,
} from '@/types/models';

// Mock measurement history data aligned with ERD
const measurementHistory: (AnthropometryMeasurement & { age_label: string })[] = [
    {
        id: 1,
        child_id: 1,
        measurement_date: '2023-10-12',
        age_label: '1 Tahun',
        weight: 12.5,
        height: 88,
        head_circumference: 46.5,
        is_lying: false,
        measurement_location: 'posyandu',
        weight_for_age_zscore: -0.5,
        height_for_age_zscore: -1.2,
        weight_for_height_zscore: 0.3,
        nutritional_status: 'normal',
        stunting_status: 'normal',
        wasting_status: 'normal',
        created_at: '2023-10-12T10:00:00Z',
    },
    {
        id: 2,
        child_id: 1,
        measurement_date: '2023-09-12',
        age_label: '11 Bulan',
        weight: 11.8,
        height: 86,
        head_circumference: 46.0,
        is_lying: false,
        measurement_location: 'posyandu',
        weight_for_age_zscore: -0.6,
        height_for_age_zscore: -1.3,
        weight_for_height_zscore: 0.2,
        nutritional_status: 'normal',
        stunting_status: 'normal',
        wasting_status: 'normal',
        created_at: '2023-09-12T10:00:00Z',
    },
    {
        id: 3,
        child_id: 1,
        measurement_date: '2023-08-12',
        age_label: '10 Bulan',
        weight: 10.5,
        height: 84,
        head_circumference: 45.5,
        is_lying: false,
        measurement_location: 'clinic',
        weight_for_age_zscore: -0.8,
        height_for_age_zscore: -1.4,
        weight_for_height_zscore: 0.1,
        nutritional_status: 'underweight',
        stunting_status: 'normal',
        wasting_status: 'normal',
        created_at: '2023-08-12T10:00:00Z',
    },
    {
        id: 4,
        child_id: 1,
        measurement_date: '2023-07-12',
        age_label: '9 Bulan',
        weight: 9.8,
        height: 82,
        head_circumference: 45.0,
        is_lying: true,
        measurement_location: 'posyandu',
        weight_for_age_zscore: -0.7,
        height_for_age_zscore: -1.2,
        weight_for_height_zscore: 0.2,
        nutritional_status: 'normal',
        stunting_status: 'normal',
        wasting_status: 'normal',
        created_at: '2023-07-12T10:00:00Z',
    },
    {
        id: 5,
        child_id: 1,
        measurement_date: '2023-06-12',
        age_label: '8 Bulan',
        weight: 9.2,
        height: 80,
        head_circumference: 44.5,
        is_lying: true,
        measurement_location: 'home',
        weight_for_age_zscore: -0.6,
        height_for_age_zscore: -1.1,
        weight_for_height_zscore: 0.1,
        nutritional_status: 'normal',
        stunting_status: 'normal',
        wasting_status: 'normal',
        created_at: '2023-06-12T10:00:00Z',
    },
];

const dateRangeOptions = ['3M', '6M', '1Y', 'All'];
const chartTypeOptions = [
    { value: 'waz', label: 'Berat-untuk-Usia' },
    { value: 'haz', label: 'Tinggi-untuk-Usia' },
    { value: 'whz', label: 'Berat-untuk-Tinggi' },
    { value: 'bmi', label: 'BMI-untuk-Usia' },
];

export default function GrowthTabContent() {
    const [selectedRange, setSelectedRange] = useState('6M');
    const [selectedChartType, setSelectedChartType] = useState('waz');

    return (
        <div className="flex flex-col gap-6">
            {/* SECTION 1: GROWTH CHART PANEL */}
            <Card>
                <CardContent className="p-6">
                    {/* Header: Title & Controls */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold">Grafik Pertumbuhan</h2>
                            <p className="text-sm text-muted-foreground">Pantau perkembangan fisik anak berdasarkan standar WHO</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Dropdown */}
                            <div className="relative min-w-[200px]">
                                <select
                                    value={selectedChartType}
                                    onChange={(e) => setSelectedChartType(e.target.value)}
                                    className="appearance-none w-full bg-gray-50 border border-gray-200 text-sm font-medium rounded-lg py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-[#9aba59] focus:border-[#9aba59] cursor-pointer"
                                >
                                    {chartTypeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9aba59] pointer-events-none" />
                            </div>
                            {/* Date Range Pills */}
                            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                                {dateRangeOptions.map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setSelectedRange(range)}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${selectedRange === range
                                            ? 'bg-[#DEEBC5] text-black text-white shadow-sm'
                                            : 'text-gray-500 hover:text-[#9aba59] hover:bg-white'
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Chart Visualization */}
                    <div className="relative w-full h-[320px] md:h-[400px] mb-6 select-none">
                        {/* Y-Axis Labels */}
                        <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-500 font-medium text-right pr-2">
                            <span>16 kg</span>
                            <span>14 kg</span>
                            <span>12 kg</span>
                            <span>10 kg</span>
                            <span>8 kg</span>
                            <span>6 kg</span>
                            <span>4 kg</span>
                        </div>
                        {/* Chart Area */}
                        <div className="ml-10 h-full relative">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 400" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="zoneRed" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#fee2e2" stopOpacity="0.6" />
                                        <stop offset="100%" stopColor="#fee2e2" stopOpacity="0.3" />
                                    </linearGradient>
                                    <linearGradient id="zoneOrange" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#ffedd5" stopOpacity="0.6" />
                                        <stop offset="100%" stopColor="#ffedd5" stopOpacity="0.3" />
                                    </linearGradient>
                                    <linearGradient id="zoneGreen" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.6" />
                                        <stop offset="100%" stopColor="#d1fae5" stopOpacity="0.3" />
                                    </linearGradient>
                                    <linearGradient id="lineGradient" x1="400" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#10b77f" />
                                        <stop offset="1" stopColor="#10b77f" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Background Grid Lines */}
                                <g className="stroke-gray-200" strokeDasharray="4 4" strokeWidth="1">
                                    <line x1="0" y1="66" x2="800" y2="66" />
                                    <line x1="0" y1="132" x2="800" y2="132" />
                                    <line x1="0" y1="198" x2="800" y2="198" />
                                    <line x1="0" y1="264" x2="800" y2="264" />
                                    <line x1="0" y1="330" x2="800" y2="330" />
                                </g>
                                {/* WHO Bands */}
                                <path d="M0,50 Q400,30 800,10 L800,60 Q400,80 0,100 Z" fill="#fee2e2" />
                                <path d="M0,100 Q400,80 800,60 L800,110 Q400,130 0,150 Z" fill="#ffedd5" />
                                <path d="M0,150 Q400,130 800,110 L800,240 Q400,260 0,280 Z" fill="#d1fae5" />
                                <path d="M0,280 Q400,260 800,240 L800,290 Q400,310 0,330 Z" fill="#ffedd5" />
                                <path d="M0,330 Q400,310 800,290 L800,380 Q400,380 0,380 Z" fill="#fee2e2" />
                                {/* Child Growth Line */}
                                <path
                                    d="M0,300 Q100,280 200,250 T400,200 T600,160 L750,140"
                                    fill="none"
                                    stroke="#10b77f"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                {/* Area below line */}
                                <path
                                    d="M0,300 Q100,280 200,250 T400,200 T600,160 L750,140 L750,400 L0,400 Z"
                                    fill="url(#lineGradient)"
                                    style={{ opacity: 0.1 }}
                                />
                                {/* Data Points */}
                                <circle cx="0" cy="300" r="4" fill="white" stroke="#10b77f" strokeWidth="2" />
                                <circle cx="200" cy="250" r="4" fill="white" stroke="#10b77f" strokeWidth="2" />
                                <circle cx="400" cy="200" r="4" fill="white" stroke="#10b77f" strokeWidth="2" />
                                <circle cx="600" cy="160" r="4" fill="white" stroke="#10b77f" strokeWidth="2" />
                                {/* Current Point (Highlighted) */}
                                <circle cx="750" cy="140" r="6" fill="#10b77f" stroke="white" strokeWidth="3" className="drop-shadow-md" />
                            </svg>
                            {/* Tooltip */}
                            <div className="absolute top-[100px] right-[40px] bg-gray-900 text-white text-xs rounded py-1 px-2 shadow-lg pointer-events-none transform -translate-y-full">
                                <span className="font-bold">12.5 kg</span>
                                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                            </div>
                        </div>
                        {/* X-Axis Labels */}
                        <div className="ml-10 flex justify-between mt-2 text-xs text-gray-500 font-medium">
                            <span>Lahir</span>
                            <span>2 Bln</span>
                            <span>4 Bln</span>
                            <span>6 Bln</span>
                            <span>8 Bln</span>
                            <span>10 Bln</span>
                            <span>12 Bln</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-xs font-medium text-gray-500">Sangat Kurang / Lebih</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-xs font-medium text-gray-500">Kurang / Risiko Lebih</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#DEEBC5] text-black" />
                            <span className="text-xs font-medium text-gray-500">Normal</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SECTION 2: TABLE & SUMMARY CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Measurement History Table (Span 2) */}
                <Card className="lg:col-span-2 flex flex-col">
                    <CardHeader className="flex flex-row justify-between items-center border-b pb-4">
                        <CardTitle className="text-lg">Riwayat Pengukuran</CardTitle>
                        <Button className="gap-2 bg-[#DEEBC5] text-black hover:bg-[#c5daa6]">
                            <Plus className="h-4 w-4" />
                            Tambah Pengukuran
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                        <th className="text-left py-5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Umur</th>
                                        <th className="text-left py-5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">BB</th>
                                        <th className="text-left py-5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">TB</th>
                                        <th className="text-left py-5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">LK</th>
                                        <th className="text-left py-5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">WAZ</th>
                                        <th className="text-left py-5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">HAZ</th>
                                        <th className="text-left py-5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lokasi</th>
                                        <th className="text-left py-5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {measurementHistory.map((row) => {
                                        const statusColor = row.nutritional_status ? getNutritionalStatusColor(row.nutritional_status) : 'bg-gray-100 text-gray-700';
                                        const statusLabel = row.nutritional_status ? NutritionalStatusLabels[row.nutritional_status].replace(/Gizi /g, '') : '-';
                                        const locationLabel = row.measurement_location ? MeasurementLocationLabels[row.measurement_location] : '-';
                                        const formattedDate = new Date(row.measurement_date).toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        });
                                        return (
                                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-5 px-6 text-sm font-medium">{formattedDate}</td>
                                                <td className="py-5 px-6 text-sm text-gray-500">{row.age_label}</td>
                                                <td className="py-5 px-6 text-sm font-medium">{row.weight} kg</td>
                                                <td className="py-5 px-6 text-sm">{row.height} cm</td>
                                                <td className="py-5 px-6 text-sm">{row.head_circumference} cm</td>
                                                <td className="py-5 px-6 text-sm">{row.weight_for_age_zscore}</td>
                                                <td className="py-5 px-6 text-sm">{row.height_for_age_zscore}</td>
                                                <td className="py-5 px-6 text-sm">
                                                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                                        <MapPin className="h-3 w-3" />
                                                        {locationLabel}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                                                        {statusLabel}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 border-t flex justify-between items-center">
                            <p className="text-sm text-gray-500">Showing 1-5 of 12 measurements</p>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" disabled>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Summary Cards (Stack) */}
                <div className="flex flex-col gap-4">
                    {/* Weight Card */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#DEEBC5] flex items-center justify-center text-black">
                                        <Scale className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Progres Berat</p>
                                        <p className="text-2xl font-bold">12.5 <span className="text-base font-normal text-gray-500">kg</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center text-black bg-[#DEEBC5] px-2 py-1 rounded text-xs font-medium">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    +2.3 kg
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Persentil</span>
                                    <span className="font-semibold">75%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-[#DEEBC5] text-black h-2 rounded-full" style={{ width: '75%' }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Height Card */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Ruler className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Progres Tinggi</p>
                                        <p className="text-2xl font-bold">88 <span className="text-base font-normal text-gray-500">cm</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center text-black bg-[#DEEBC5] px-2 py-1 rounded text-xs font-medium">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    +8 cm
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Persentil</span>
                                    <span className="font-semibold">45%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Velocity Card */}
                    <Card className="hover:shadow-md transition-shadow flex-1">
                        <CardContent className="p-5 h-full flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                        <Gauge className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm font-medium">Kecepatan Tumbuh</p>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#DEEBC5] text-black border border-[#c5daa6]">
                                    Sesuai Target
                                </span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Weight gain</span>
                                    <span className="font-medium">200g / month</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Height gain</span>
                                    <span className="font-medium">1.5cm / month</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* SECTION 3: Z-SCORE TREND CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* WAZ Card */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Berat-untuk-Usia (WAZ)</p>
                                <h4 className="text-3xl font-bold">-0.5</h4>
                            </div>
                            <span className="bg-[#DEEBC5] text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                Improving <ArrowUp className="h-3 w-3" />
                            </span>
                        </div>
                        {/* Sparkline SVG */}
                        <div className="h-12 w-full">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 200 50">
                                <path
                                    d="M0,40 L40,35 L80,45 L120,30 L160,25 L200,20"
                                    fill="none"
                                    stroke="#10b77f"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <circle cx="200" cy="20" r="3" fill="#10b77f" />
                            </svg>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Normal range (-2 to +2)</p>
                    </CardContent>
                </Card>

                {/* HAZ Card */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Tinggi-untuk-Usia (HAZ)</p>
                                <h4 className="text-3xl font-bold">-1.8</h4>
                            </div>
                            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                Stable <ArrowRightIcon className="h-3 w-3" />
                            </span>
                        </div>
                        {/* Sparkline SVG */}
                        <div className="h-12 w-full">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 200 50">
                                <path
                                    d="M0,40 L40,42 L80,41 L120,40 L160,40 L200,40"
                                    fill="none"
                                    stroke="#f59e0b"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <circle cx="200" cy="40" r="3" fill="#f59e0b" />
                            </svg>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Approaching low range</p>
                    </CardContent>
                </Card>

                {/* WHZ Card */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Berat-untuk-Tinggi (WHZ)</p>
                                <h4 className="text-3xl font-bold">+0.3</h4>
                            </div>
                            <span className="bg-[#DEEBC5] text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                Normal <Check className="h-3 w-3" />
                            </span>
                        </div>
                        {/* Sparkline SVG */}
                        <div className="h-12 w-full">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 200 50">
                                <path
                                    d="M0,25 L40,20 L80,30 L120,25 L160,22 L200,25"
                                    fill="none"
                                    stroke="#10b77f"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <circle cx="200" cy="25" r="3" fill="#10b77f" />
                            </svg>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Optimal proportion</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
