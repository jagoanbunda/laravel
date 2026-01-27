import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface NutritionalPieChartProps {
    data: Array<{ name: string; value: number; color: string }>;
}

const COLORS: Record<string, string> = {
    'normal': '#22c55e', // green-500
    'sesuai': '#22c55e',
    'gizi baik': '#22c55e',
    
    'underweight': '#eab308', // yellow-500
    'kurang gizi': '#eab308',
    'pantau': '#eab308',
    
    'stunted': '#f97316', // orange-500
    'pendek': '#f97316',
    
    'wasted': '#ef4444', // red-500
    'gizi buruk': '#ef4444',
    'sangat pendek': '#ef4444',
    'perlu rujukan': '#ef4444',
};

const DEFAULT_COLOR = '#94a3b8'; // slate-400

export function NutritionalPieChart({ data }: NutritionalPieChartProps) {
    const getColor = (name: string) => {
        const lowerName = name.toLowerCase();
        // Check for partial matches if exact match fails
        if (COLORS[lowerName]) return COLORS[lowerName];
        
        if (lowerName.includes('normal') || lowerName.includes('baik') || lowerName.includes('sesuai')) return COLORS['normal'];
        if (lowerName.includes('kurang') || lowerName.includes('underweight')) return COLORS['underweight'];
        if (lowerName.includes('stunt') || lowerName.includes('pendek')) return COLORS['stunted'];
        if (lowerName.includes('buruk') || lowerName.includes('wasted') || lowerName.includes('rujukan')) return COLORS['wasted'];
        
        return DEFAULT_COLOR;
    };

    return (
        <ResponsiveContainer width="100%" height={240}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                >
                    {data.map((entry, index) => (
                        <Cell key={index} fill={getColor(entry.name)} strokeWidth={0} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" verticalAlign="bottom" height={36} />
            </PieChart>
        </ResponsiveContainer>
    );
}
