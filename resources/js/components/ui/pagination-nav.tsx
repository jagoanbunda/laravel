import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationNavProps {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
    baseUrl: string;
    filters?: Record<string, string | undefined>;
}

export function PaginationNav({
    currentPage,
    lastPage,
    total,
    perPage,
    baseUrl,
    filters = {},
}: PaginationNavProps) {
    const buildUrl = (page: number) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        params.set('page', String(page));
        return `${baseUrl}?${params.toString()}`;
    };

    const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, total);

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
                Showing {from}-{to} of {total}
            </p>
            <div className="flex items-center gap-2">
                {currentPage > 1 ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={buildUrl(currentPage - 1)}>
                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                )}
                <span className="text-sm px-2">{currentPage} / {lastPage}</span>
                {currentPage < lastPage ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={buildUrl(currentPage + 1)}>
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                )}
            </div>
        </div>
    );
}
