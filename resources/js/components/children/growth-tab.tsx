import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Plus,
    TrendingUp,
    ChevronDown,
    Scale,
    Ruler,
    Gauge,
    ArrowUp,
    ArrowRight as ArrowRightIcon,
    ArrowDown,
    AlertCircle,
} from 'lucide-react';
import MeasurementHistoryTable from '@/components/children/measurement-history-table';
import { router } from '@inertiajs/react';
import {
    ResponsiveContainer,
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ReferenceArea,
    Scatter,
} from 'recharts';

interface GrowthMeasurement {
    id: number;
    measurement_date: string;
    age_in_months: number | null;
    age_label: string;
    weight: number;
    height: number;
    head_circumference: number;
    is_lying: boolean;
    measurement_location: string;
    weight_for_age_zscore: number;
    height_for_age_zscore: number;
    weight_for_height_zscore: number;
    bmi_for_age_zscore: number;
    nutritional_status: string;
    stunting_status: string;
    wasting_status: string;
}

interface GrowthDataPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface GrowthData {
    chart_data: GrowthMeasurement[];
    table_data: GrowthMeasurement[];
    pagination: GrowthDataPagination;
}

interface GrowthFilters {
    date_range: string;
    chart_type: string;
}

interface GrowthTabContentProps {
    childId: number;
    growthData: GrowthData;
    filters: GrowthFilters;
}

const dateRangeOptions = ['3M', '6M', '1Y', 'All'];
const chartTypeOptions = [
    { value: 'waz', label: 'Berat-untuk-Usia', zscoreKey: 'weight_for_age_zscore', valueKey: 'weight', unit: 'kg' },
    { value: 'haz', label: 'Tinggi-untuk-Usia', zscoreKey: 'height_for_age_zscore', valueKey: 'height', unit: 'cm' },
    { value: 'whz', label: 'Berat-untuk-Tinggi', zscoreKey: 'weight_for_height_zscore', valueKey: 'weight', unit: 'kg' },
    { value: 'bmi', label: 'BMI-untuk-Usia', zscoreKey: 'bmi_for_age_zscore', valueKey: 'weight', unit: 'kg/m2' },
];

function getZScoreTrend(data: GrowthMeasurement[], key: keyof GrowthMeasurement): 'improving' | 'stable' | 'declining' | null {
    if (data.length < 2) return null;
    const sorted = [...data].sort((a, b) => 
        new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime()
    );
    const latest = sorted[sorted.length - 1][key] as number;
    const previous = sorted[sorted.length - 2][key] as number;
    const diff = latest - previous;
    if (Math.abs(diff) < 0.1) return 'stable';
    return diff > 0 ? 'improving' : 'declining';
}

function getTrendBadge(trend: 'improving' | 'stable' | 'declining' | null, zscore: number) {
    if (trend === null) return null;
    
    const isNormal = zscore >= -2 && zscore <= 2;
    
    if (trend === 'improving') {
        return (
            <span className="bg-[#DEEBC5] text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                Improving <ArrowUp className="h-3 w-3" />
            </span>
        );
    }
    if (trend === 'stable') {
        return (
            <span className={`${isNormal ? 'bg-[#DEEBC5] text-black' : 'bg-amber-100 text-amber-700'} text-xs font-bold px-2 py-1 rounded flex items-center gap-1`}>
                Stable <ArrowRightIcon className="h-3 w-3" />
            </span>
        );
    }
    return (
        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
            Declining <ArrowDown className="h-3 w-3" />
        </span>
    );
}

type IndicatorType = 'waz' | 'haz' | 'whz' | 'bmi';

function getZScoreStatus(zscore: number, indicator: IndicatorType = 'whz'): { label: string; color: string } {
    // BB/U - Berat Badan menurut Umur (Weight-for-Age)
    if (indicator === 'waz') {
        if (zscore < -3) return { label: 'BB Sangat Kurang', color: 'text-red-600' };
        if (zscore < -2) return { label: 'BB Kurang', color: 'text-amber-600' };
        if (zscore <= 1) return { label: 'BB Normal', color: 'text-emerald-600' };
        return { label: 'Risiko BB Lebih', color: 'text-amber-600' };
    }
    
    // TB/U or PB/U - Tinggi/Panjang Badan menurut Umur (Height-for-Age / Stunting)
    if (indicator === 'haz') {
        if (zscore < -3) return { label: 'Sangat Pendek', color: 'text-red-600' };
        if (zscore < -2) return { label: 'Pendek', color: 'text-amber-600' };
        if (zscore <= 3) return { label: 'Normal', color: 'text-emerald-600' };
        return { label: 'Tinggi', color: 'text-amber-600' };
    }
    
    // BB/TB or BB/PB - Berat Badan menurut Tinggi Badan (Weight-for-Height / Wasting)
    // Also used for BMI-for-Age (similar thresholds)
    if (zscore < -3) return { label: 'Gizi Buruk', color: 'text-red-600' };
    if (zscore < -2) return { label: 'Gizi Kurang', color: 'text-amber-600' };
    if (zscore <= 1) return { label: 'Gizi Baik', color: 'text-emerald-600' };
    if (zscore <= 2) return { label: 'Berisiko Gizi Lebih', color: 'text-amber-600' };
    if (zscore <= 3) return { label: 'Gizi Lebih', color: 'text-orange-600' };
    return { label: 'Obesitas', color: 'text-red-600' };
}

export default function GrowthTabContent({ 
    childId, 
    growthData, 
    filters 
}: GrowthTabContentProps) {
    const { chart_data: chartMeasurements, table_data: tableMeasurements, pagination } = growthData;
    const selectedRange = filters.date_range;
    const selectedChartType = filters.chart_type;
    const chartConfig = chartTypeOptions.find(c => c.value === selectedChartType) ?? chartTypeOptions[0];

    const handleRangeChange = (range: string) => {
        router.get(`/children/${childId}`, { 
            growth_range: range, 
            chart_type: selectedChartType,
            growth_page: 1,
        }, { 
            preserveState: true, 
            preserveScroll: true,
            only: ['child', 'growth_filters'],
        });
    };

    const handleChartTypeChange = (type: string) => {
        router.get(`/children/${childId}`, { 
            growth_range: selectedRange, 
            chart_type: type,
            growth_page: 1,
        }, { 
            preserveState: true, 
            preserveScroll: true,
            only: ['child', 'growth_filters'],
        });
    };

    const handlePageChange = (page: number) => {
        router.get(`/children/${childId}`, { 
            growth_range: selectedRange, 
            chart_type: selectedChartType,
            growth_page: page,
        }, { 
            preserveState: true, 
            preserveScroll: true,
            only: ['child', 'growth_filters'],
        });
    };

    const chartData = [...chartMeasurements]
        .sort((a, b) => new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime())
        .map(m => ({
            ...m,
            measurementTimestamp: new Date(m.measurement_date).getTime(),
            value: m[chartConfig.valueKey as keyof GrowthMeasurement] as number,
            zscore: m[chartConfig.zscoreKey as keyof GrowthMeasurement] as number,
            bandMinus3: -3,
            bandMinus2: -2,
            bandMinus1: -1,
            bandMedian: 0,
            bandPlus1: 1,
            bandPlus2: 2,
            bandPlus3: 3,
        }));

    const getSparklineXDomain = (): [number, number] => {
        if (chartData.length === 0) return [0, 1];
        if (chartData.length === 1) {
            const ts = chartData[0].measurementTimestamp;
            return [ts - 86400000, ts + 86400000]; // +/- 1 day padding
        }
        const timestamps = chartData.map(d => d.measurementTimestamp);
        return [Math.min(...timestamps), Math.max(...timestamps)];
    };

    const getXAxisDomain = (): [number, number] | ['auto', 'auto'] => {
        if (chartData.length === 0) return ['auto', 'auto'];

        const timestamps = chartData.map(d => d.measurementTimestamp);
        const minTime = Math.min(...timestamps);
        const maxTime = Math.max(...timestamps);

        const rangePaddingMs: Record<string, number> = {
            '3M': 7 * 24 * 60 * 60 * 1000,
            '6M': 14 * 24 * 60 * 60 * 1000,
            '1Y': 30 * 24 * 60 * 60 * 1000,
            'All': 30 * 24 * 60 * 60 * 1000,
        };
        const defaultPadding = rangePaddingMs[selectedRange] ?? 14 * 24 * 60 * 60 * 1000;

        const range = maxTime - minTime;
        const minPadding = defaultPadding;
        const padding = Math.max(range * 0.05, minPadding);

        return [minTime - padding, maxTime + padding];
    };

    const getValueAxisTicks = (): number[] => {
        if (chartData.length === 0) return [];
        const values = chartData.map(d => d.value);
        const minVal = Math.floor(Math.min(...values));
        const maxVal = Math.ceil(Math.max(...values));
        const step = Math.ceil((maxVal - minVal) / 4) || 1;
        const ticks: number[] = [];
        for (let v = minVal - step; v <= maxVal + step; v += step) {
            ticks.push(v);
        }
        return ticks;
    };

    const latestMeasurement = chartMeasurements.length > 0 ? chartMeasurements[chartMeasurements.length - 1] : null;

    const wazTrend = getZScoreTrend(chartMeasurements, 'weight_for_age_zscore');
    const hazTrend = getZScoreTrend(chartMeasurements, 'height_for_age_zscore');
    const whzTrend = getZScoreTrend(chartMeasurements, 'weight_for_height_zscore');

    if (chartMeasurements.length === 0) {
        return (
            <div className="flex flex-col gap-6">
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                <AlertCircle className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Belum Ada Data Pengukuran</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Anak ini belum memiliki data pertumbuhan. Tambahkan pengukuran pertama untuk memulai pemantauan.
                                </p>
                            </div>
                            <Button className="gap-2 bg-[#DEEBC5] text-black hover:bg-[#c5daa6] mt-2">
                                <Plus className="h-4 w-4" />
                                Tambah Pengukuran Pertama
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                                    onChange={(e) => handleChartTypeChange(e.target.value)}
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
                                        onClick={() => handleRangeChange(range)}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${selectedRange === range
                                            ? 'bg-[#DEEBC5] text-black shadow-sm'
                                            : 'text-gray-500 hover:text-[#9aba59] hover:bg-white'
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Chart Visualization with Recharts */}
                    <div className="relative w-full mb-6">
                        <ResponsiveContainer width="100%" height={400} minWidth={300}>
                            <ComposedChart data={chartData} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
                                <defs>
                                    <linearGradient id="childLineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b77f" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#10b77f" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="measurementTimestamp"
                                    type="number"
                                    scale="time"
                                    domain={getXAxisDomain()}
                                    ticks={chartData.map(d => d.measurementTimestamp)}
                                    label={{ value: 'Tanggal Pengukuran', position: 'bottom', offset: 0 }}
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                />
                                <YAxis 
                                    yAxisId="zscore"
                                    orientation="right"
                                    domain={[-4, 4]}
                                    ticks={[-3, -2, -1, 0, 1, 2, 3]}
                                    label={{ value: 'Z-Score', angle: 90, position: 'insideRight', offset: 10 }}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis 
                                    yAxisId="value"
                                    orientation="left"
                                    domain={['auto', 'auto']}
                                    ticks={getValueAxisTicks()}
                                    label={{ value: chartConfig.unit, angle: -90, position: 'insideLeft' }}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip 
                                    trigger="hover"
                                    cursor={{ stroke: '#10b77f', strokeDasharray: '3 3' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload as GrowthMeasurement & { value: number; zscore: number };
                                            return (
                                                <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg">
                                                    <p className="font-bold mb-1">{data.age_label}</p>
                                                    <p>{chartConfig.label}: <span className="font-bold">{data.value} {chartConfig.unit}</span></p>
                                                    <p>Z-Score: <span className="font-bold">{data.zscore?.toFixed(2)}</span></p>
                                                    <p className="text-xs text-gray-300 mt-1">{new Date(data.measurement_date).toLocaleDateString('id-ID')}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                
                                {/* Permenkes RI Z-Score Bands - Background Areas */}
                                {/* Obesitas: >+3 SD (Red) */}
                                <ReferenceArea yAxisId="zscore" y1={4} y2={3} fill="#fee2e2" fillOpacity={0.7} />
                                {/* Gizi Lebih: +2 s/d +3 SD (Orange) */}
                                <ReferenceArea yAxisId="zscore" y1={3} y2={2} fill="#ffedd5" fillOpacity={0.7} />
                                {/* Berisiko Gizi Lebih: +1 s/d +2 SD (Amber/Yellow) */}
                                <ReferenceArea yAxisId="zscore" y1={2} y2={1} fill="#fef3c7" fillOpacity={0.7} />
                                {/* Normal: -2 s/d +1 SD (Green) */}
                                <ReferenceArea yAxisId="zscore" y1={1} y2={-2} fill="#d1fae5" fillOpacity={0.7} />
                                {/* Gizi Kurang: -3 s/d -2 SD (Amber/Yellow) */}
                                <ReferenceArea yAxisId="zscore" y1={-2} y2={-3} fill="#fef3c7" fillOpacity={0.7} />
                                {/* Gizi Buruk: <-3 SD (Red) */}
                                <ReferenceArea yAxisId="zscore" y1={-3} y2={-4} fill="#fee2e2" fillOpacity={0.7} />
                                
                                {/* Median Line (0) */}
                                <ReferenceLine yAxisId="zscore" y={0} stroke="#10b77f" strokeDasharray="8 4" strokeWidth={2} />

                                {/* Child's Growth Z-Score Line */}
                                <Area
                                    yAxisId="zscore"
                                    type="monotone"
                                    dataKey="zscore"
                                    stroke="#10b77f"
                                    strokeWidth={3}
                                    fill="url(#childLineGradient)"
                                    dot={{ fill: 'white', stroke: '#10b77f', strokeWidth: 2, r: 5 }}
                                    activeDot={{ fill: '#10b77f', stroke: 'white', strokeWidth: 3, r: 8 }}
                                />
                                
                                {/* Latest Point Highlight */}
                                {chartData.length > 0 && (
                                    <Scatter
                                        yAxisId="zscore"
                                        data={[chartData[chartData.length - 1]]}
                                        dataKey="zscore"
                                        fill="#10b77f"
                                        shape={(props: any) => (
                                            <circle 
                                                cx={props.cx} 
                                                cy={props.cy} 
                                                r={8} 
                                                fill="#10b77f" 
                                                stroke="white" 
                                                strokeWidth={3}
                                                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                                            />
                                        )}
                                    />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 pt-4 border-t">
                        {selectedChartType === 'haz' ? (
                            // TB/U Legend
                            <>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-200" />
                                    <span className="text-xs font-medium text-gray-500">Sangat Pendek (&lt;-3 SD)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-200" />
                                    <span className="text-xs font-medium text-gray-500">Pendek (-3 s/d -2 SD)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-200" />
                                    <span className="text-xs font-medium text-gray-500">Normal (-2 s/d +3 SD)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-200" />
                                    <span className="text-xs font-medium text-gray-500">Tinggi (&gt;+3 SD)</span>
                                </div>
                            </>
                        ) : selectedChartType === 'waz' ? (
                            // BB/U Legend
                            <>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-200" />
                                    <span className="text-xs font-medium text-gray-500">BB Sangat Kurang (&lt;-3 SD)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-200" />
                                    <span className="text-xs font-medium text-gray-500">BB Kurang (-3 s/d -2 SD)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-200" />
                                    <span className="text-xs font-medium text-gray-500">BB Normal (-2 s/d +1 SD)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-200" />
                                    <span className="text-xs font-medium text-gray-500">Risiko BB Lebih (&gt;+1 SD)</span>
                                </div>
                            </>
                        ) : (
                            // BB/TB or BMI Legend (whz, bmi)
                            <>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-200" />
                                    <span className="text-xs font-medium text-gray-500">Gizi Buruk/Obesitas (&lt;-3 atau &gt;+3 SD)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-200" />
                                    <span className="text-xs font-medium text-gray-500">Gizi Lebih (+2 s/d +3 SD)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-200" />
                                    <span className="text-xs font-medium text-gray-500">Kurang/Berisiko Lebih (-3 s/d -2 atau +1 s/d +2 SD)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-200" />
                                    <span className="text-xs font-medium text-gray-500">Gizi Baik (-2 s/d +1 SD)</span>
                                </div>
                            </>
                        )}
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
                        <MeasurementHistoryTable
                            data={tableMeasurements}
                            pagination={pagination}
                            onPageChange={handlePageChange}
                        />
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
                                        <p className="text-2xl font-bold">
                                            {latestMeasurement?.weight ?? '-'} <span className="text-base font-normal text-gray-500">kg</span>
                                        </p>
                                    </div>
                                </div>
                                {chartMeasurements.length >= 2 && latestMeasurement && (
                                    <div className="flex items-center text-black bg-[#DEEBC5] px-2 py-1 rounded text-xs font-medium">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        {(latestMeasurement.weight - chartMeasurements[chartMeasurements.length - 2].weight).toFixed(1)} kg
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Z-Score WAZ</span>
                                    <span className={`font-semibold ${getZScoreStatus(latestMeasurement?.weight_for_age_zscore ?? 0, 'waz').color}`}>
                                        {latestMeasurement?.weight_for_age_zscore?.toFixed(2) ?? '-'}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-[#DEEBC5] h-2 rounded-full transition-all" 
                                        style={{ width: `${Math.min(100, Math.max(0, ((latestMeasurement?.weight_for_age_zscore ?? 0) + 3) / 6 * 100))}%` }} 
                                    />
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
                                        <p className="text-2xl font-bold">
                                            {latestMeasurement?.height ?? '-'} <span className="text-base font-normal text-gray-500">cm</span>
                                        </p>
                                    </div>
                                </div>
                                {chartMeasurements.length >= 2 && latestMeasurement && (
                                    <div className="flex items-center text-black bg-[#DEEBC5] px-2 py-1 rounded text-xs font-medium">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        +{(latestMeasurement.height - chartMeasurements[chartMeasurements.length - 2].height).toFixed(1)} cm
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Z-Score HAZ</span>
                                    <span className={`font-semibold ${getZScoreStatus(latestMeasurement?.height_for_age_zscore ?? 0, 'haz').color}`}>
                                        {latestMeasurement?.height_for_age_zscore?.toFixed(2) ?? '-'}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-blue-500 h-2 rounded-full transition-all" 
                                        style={{ width: `${Math.min(100, Math.max(0, ((latestMeasurement?.height_for_age_zscore ?? 0) + 3) / 6 * 100))}%` }} 
                                    />
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
                                {latestMeasurement && (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        getZScoreStatus(latestMeasurement.weight_for_age_zscore, 'waz').label === 'BB Normal' 
                                            ? 'bg-[#DEEBC5] text-black border-[#c5daa6]'
                                            : 'bg-amber-100 text-amber-700 border-amber-200'
                                    }`}>
                                        {getZScoreStatus(latestMeasurement.weight_for_age_zscore, 'waz').label === 'BB Normal' ? 'Sesuai Target' : 'Perlu Perhatian'}
                                    </span>
                                )}
                            </div>
                            {chartMeasurements.length >= 2 && latestMeasurement && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Weight gain</span>
                                        <span className="font-medium">
                                            {((latestMeasurement.weight - chartMeasurements[0].weight) / chartMeasurements.length * 30).toFixed(0)}g / month
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Height gain</span>
                                        <span className="font-medium">
                                            {((latestMeasurement.height - chartMeasurements[0].height) / chartMeasurements.length).toFixed(1)}cm / month
                                        </span>
                                    </div>
                                </div>
                            )}
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
                                <h4 className="text-3xl font-bold">{latestMeasurement?.weight_for_age_zscore?.toFixed(1) ?? '-'}</h4>
                            </div>
                            {getTrendBadge(wazTrend, latestMeasurement?.weight_for_age_zscore ?? 0)}
                        </div>
                        {/* Mini Sparkline */}
                        <div className="h-12 w-full">
                            <ResponsiveContainer width="100%" height={48}>
                                <ComposedChart data={chartData}>
                                    <XAxis 
                                        dataKey="measurementTimestamp" 
                                        type="number"
                                        domain={getSparklineXDomain()}
                                        hide 
                                    />
                                    <YAxis 
                                        hide 
                                        domain={[-4, 4]} 
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="weight_for_age_zscore" 
                                        stroke="#10b77f" 
                                        strokeWidth={2}
                                        dot={{ fill: '#10b77f', strokeWidth: 0, r: 3 }}
                                    />
                                    <Scatter 
                                        data={chartData.length > 0 ? [chartData[chartData.length - 1]] : []}
                                        dataKey="weight_for_age_zscore"
                                        fill="#10b77f"
                                        shape={(props: any) => <circle cx={props.cx} cy={props.cy} r={5} fill="#10b77f" />}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
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
                                <h4 className="text-3xl font-bold">{latestMeasurement?.height_for_age_zscore?.toFixed(1) ?? '-'}</h4>
                            </div>
                            {getTrendBadge(hazTrend, latestMeasurement?.height_for_age_zscore ?? 0)}
                        </div>
                        {/* Mini Sparkline */}
                        <div className="h-12 w-full">
                            <ResponsiveContainer width="100%" height={48}>
                                <ComposedChart data={chartData}>
                                    <XAxis 
                                        dataKey="measurementTimestamp" 
                                        type="number"
                                        domain={getSparklineXDomain()}
                                        hide 
                                    />
                                    <YAxis 
                                        hide 
                                        domain={[-4, 4]} 
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="height_for_age_zscore" 
                                        stroke="#f59e0b" 
                                        strokeWidth={2}
                                        dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
                                    />
                                    <Scatter 
                                        data={chartData.length > 0 ? [chartData[chartData.length - 1]] : []}
                                        dataKey="height_for_age_zscore"
                                        fill="#f59e0b"
                                        shape={(props: any) => <circle cx={props.cx} cy={props.cy} r={5} fill="#f59e0b" />}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {(latestMeasurement?.height_for_age_zscore ?? 0) < -2 ? 'Approaching low range' : 'Normal range (-2 to +2)'}
                        </p>
                    </CardContent>
                </Card>

                {/* WHZ Card */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Berat-untuk-Tinggi (WHZ)</p>
                                <h4 className="text-3xl font-bold">{latestMeasurement?.weight_for_height_zscore?.toFixed(1) ?? '-'}</h4>
                            </div>
                            {getTrendBadge(whzTrend, latestMeasurement?.weight_for_height_zscore ?? 0)}
                        </div>
                        {/* Mini Sparkline */}
                        <div className="h-12 w-full">
                            <ResponsiveContainer width="100%" height={48}>
                                <ComposedChart data={chartData}>
                                    <XAxis 
                                        dataKey="measurementTimestamp" 
                                        type="number"
                                        domain={getSparklineXDomain()}
                                        hide 
                                    />
                                    <YAxis 
                                        hide 
                                        domain={[-4, 4]} 
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="weight_for_height_zscore" 
                                        stroke="#10b77f" 
                                        strokeWidth={2}
                                        dot={{ fill: '#10b77f', strokeWidth: 0, r: 3 }}
                                    />
                                    <Scatter 
                                        data={chartData.length > 0 ? [chartData[chartData.length - 1]] : []}
                                        dataKey="weight_for_height_zscore"
                                        fill="#10b77f"
                                        shape={(props: any) => <circle cx={props.cx} cy={props.cy} r={5} fill="#10b77f" />}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Optimal proportion</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
