import { useMemo, useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type VisibilityState,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    MapPin,
} from 'lucide-react';
import {
    type NutritionalStatus,
    type MeasurementLocation,
    NutritionalStatusLabels,
    MeasurementLocationLabels,
    getNutritionalStatusColor,
    getZScoreIndicatorColor,
} from '@/types/models';

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

interface MeasurementHistoryTableProps {
    data: GrowthMeasurement[];
    pagination: GrowthDataPagination;
    onPageChange: (page: number) => void;
}

function ZScoreCell({ value }: { value: number | null | undefined }) {
    return (
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${getZScoreIndicatorColor(value)}`} />
            <span>{value?.toFixed(2) ?? '-'}</span>
        </div>
    );
}

function SortableHeader({ 
    column, 
    children 
}: { 
    column: { getIsSorted: () => false | 'asc' | 'desc'; toggleSorting: (desc?: boolean) => void; getCanSort: () => boolean };
    children: React.ReactNode;
}) {
    const sorted = column.getIsSorted();
    
    if (!column.getCanSort()) {
        return <span>{children}</span>;
    }
    
    return (
        <button
            type="button"
            onClick={() => column.toggleSorting(sorted === 'asc')}
            className="flex items-center gap-1 hover:text-foreground transition-colors -ml-2 px-2 py-1 rounded hover:bg-muted/50"
        >
            {children}
            {sorted === 'asc' ? (
                <ArrowUp className="h-3.5 w-3.5" />
            ) : sorted === 'desc' ? (
                <ArrowDown className="h-3.5 w-3.5" />
            ) : (
                <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
            )}
        </button>
    );
}

export default function MeasurementHistoryTable({
    data,
    pagination,
    onPageChange,
}: MeasurementHistoryTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    // Handle responsive column visibility
    useEffect(() => {
        const updateVisibility = () => {
            const isMobile = window.innerWidth < 768;
            setColumnVisibility({
                head_circumference: !isMobile,
                measurement_location: !isMobile,
            });
        };

        updateVisibility();
        window.addEventListener('resize', updateVisibility);
        return () => window.removeEventListener('resize', updateVisibility);
    }, []);

    const columns = useMemo<ColumnDef<GrowthMeasurement>[]>(() => [
        {
            accessorKey: 'measurement_date',
            header: ({ column }) => <SortableHeader column={column}>Tanggal</SortableHeader>,
            cell: ({ row }) => {
                const date = new Date(row.getValue('measurement_date'));
                return (
                    <span className="font-medium">
                        {date.toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>
                );
            },
            sortingFn: 'datetime',
        },
        {
            accessorKey: 'age_label',
            header: ({ column }) => <SortableHeader column={column}>Umur</SortableHeader>,
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.getValue('age_label')}</span>
            ),
        },
        {
            accessorKey: 'weight',
            header: ({ column }) => <SortableHeader column={column}>BB</SortableHeader>,
            cell: ({ row }) => (
                <span className="font-medium">{row.getValue('weight')} kg</span>
            ),
            sortingFn: 'basic',
        },
        {
            accessorKey: 'height',
            header: ({ column }) => <SortableHeader column={column}>TB</SortableHeader>,
            cell: ({ row }) => <span>{row.getValue('height')} cm</span>,
            sortingFn: 'basic',
        },
        {
            accessorKey: 'head_circumference',
            header: ({ column }) => <SortableHeader column={column}>LK</SortableHeader>,
            cell: ({ row }) => <span>{row.getValue('head_circumference')} cm</span>,
            sortingFn: 'basic',
        },
        {
            accessorKey: 'weight_for_age_zscore',
            header: ({ column }) => <SortableHeader column={column}>WAZ</SortableHeader>,
            cell: ({ row }) => <ZScoreCell value={row.getValue('weight_for_age_zscore')} />,
            sortingFn: 'basic',
        },
        {
            accessorKey: 'height_for_age_zscore',
            header: ({ column }) => <SortableHeader column={column}>HAZ</SortableHeader>,
            cell: ({ row }) => <ZScoreCell value={row.getValue('height_for_age_zscore')} />,
            sortingFn: 'basic',
        },
        {
            accessorKey: 'measurement_location',
            header: ({ column }) => <SortableHeader column={column}>Lokasi</SortableHeader>,
            cell: ({ row }) => {
                const location = row.getValue('measurement_location') as MeasurementLocation;
                const label = location 
                    ? (MeasurementLocationLabels[location] || location) 
                    : '-';
                return (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {label}
                    </span>
                );
            },
        },
        {
            accessorKey: 'nutritional_status',
            header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
            cell: ({ row }) => {
                const status = row.getValue('nutritional_status') as NutritionalStatus;
                if (!status) return <span className="text-muted-foreground">-</span>;
                
                const colorClass = getNutritionalStatusColor(status);
                const label = (NutritionalStatusLabels[status] || status).replace(/Gizi /g, '').replace(/Berat Badan /g, '');
                
                return (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
                        {label}
                    </span>
                );
            },
        },
    ], []);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
        },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-muted/30">
                                {headerGroup.headers.map((header) => (
                                    <TableHead 
                                        key={header.id}
                                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="text-sm">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Tidak ada data pengukuran.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t flex flex-col sm:flex-row justify-between items-center gap-2">
                <p className="text-sm text-muted-foreground">
                    {pagination.from && pagination.to
                        ? `Menampilkan ${pagination.from}-${pagination.to} dari ${pagination.total} pengukuran`
                        : `Total ${pagination.total} pengukuran`}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={pagination.current_page <= 1}
                        onClick={() => onPageChange(pagination.current_page - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                        {pagination.current_page} / {pagination.last_page}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={pagination.current_page >= pagination.last_page}
                        onClick={() => onPageChange(pagination.current_page + 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
