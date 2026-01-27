import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: string;
    icon?: any;
}

export function StatCard({
    title,
    value,
    trend,
    icon: Icon,
}: StatCardProps) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-border/50">
            <CardContent className="p-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        {Icon && (
                            <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center text-primary">
                                <Icon className="h-4 w-4" />
                            </div>
                        )}
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                        <h3 className="text-3xl font-semibold tracking-tight">{value.toLocaleString()}</h3>
                        {trend && (
                            <div className="flex items-center gap-1 text-sm font-medium text-success-muted-foreground bg-success-muted px-2 py-0.5 rounded-full">
                                <TrendingUp className="h-3 w-3" />
                                {trend}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
