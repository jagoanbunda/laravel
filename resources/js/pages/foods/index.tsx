import AppLayout from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PaginationNav } from '@/components/ui/pagination-nav';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Search, Zap, Drumstick, Droplets, Wheat } from 'lucide-react';
import { useState } from 'react';

interface Food {
    id: number;
    name: string;
    category: string | null;
    icon: string | null;
    serving_size: number;
    calories: number;
    protein: number;
    fat: number;
    carbohydrate: number;
    fiber: number | null;
    sugar: number | null;
    is_active: boolean;
    is_system: boolean;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface FoodsIndexProps {
    foods: PaginatedData<Food>;
    categories: string[];
    filters: {
        search?: string;
        category?: string;
        status?: string;
    };
}

export default function FoodsIndex({ foods, categories, filters }: FoodsIndexProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);
    const [searchValue, setSearchValue] = useState(filters.search || '');

    const handleSearch = () => {
        router.get('/foods', { search: searchValue, category: filters.category, status: filters.status }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get('/foods', { ...filters, [key]: value === 'all' ? '' : value }, { preserveState: true });
    };

    const handleDeleteOpen = (food: Food) => {
        setSelectedFood(food);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!selectedFood) return;
        router.delete(`/foods/${selectedFood.id}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setSelectedFood(null);
            },
        });
    };

    return (
        <AppLayout title="Food Database">
            <Head title="Food Database" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Food Database</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage nutrition data for foods.
                        </p>
                    </div>
                    <Button className="rounded-full" asChild>
                        <Link href="/foods/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Food
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card className="border-border/50 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search foods..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10 rounded-full border-border/60 bg-card"
                                />
                            </div>
                            <Select value={filters.category || 'all'} onValueChange={(v) => handleFilterChange('category', v)}>
                                <SelectTrigger className="w-[180px] rounded-full border-border/60 bg-card">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filters.status || 'all'} onValueChange={(v) => handleFilterChange('status', v)}>
                                <SelectTrigger className="w-[150px] rounded-full border-border/60 bg-card">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[200px]">Food Item</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Calories</TableHead>
                                    <TableHead className="text-right">Protein</TableHead>
                                    <TableHead className="text-right">Fat</TableHead>
                                    <TableHead className="text-right">Carbs</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {foods.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                            No food items found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    foods.data.map((food) => (
                                        <TableRow key={food.id} className="group">
                                            <TableCell>
                                                <span className="font-semibold text-foreground capitalize">{food.name}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal bg-muted text-muted-foreground border-transparent hover:bg-muted">
                                                    {food.category || 'Uncategorized'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5 font-medium">
                                                    <Zap className="h-3 w-3 text-warning" />
                                                    {food.calories}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Drumstick className="h-3 w-3" />
                                                    {food.protein}g
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Droplets className="h-3 w-3" />
                                                    {food.fat}g
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Wheat className="h-3 w-3" />
                                                    {food.carbohydrate}g
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {food.is_active ? (
                                                    <Badge variant="secondary" className="bg-success-muted text-success-muted-foreground hover:bg-success-muted/80 border-transparent">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-neutral-muted text-neutral-muted-foreground hover:bg-neutral-muted/80 border-transparent">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        asChild
                                                        className="h-8 w-8 hover:bg-secondary"
                                                    >
                                                        <Link href={`/foods/${food.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteOpen(food)}
                                                        className="h-8 w-8 text-muted-foreground hover:text-danger hover:bg-danger-muted"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    {/* Pagination */}
                    <div className="border-t border-border/50 p-4 bg-muted/20">
                        <PaginationNav
                            currentPage={foods.current_page}
                            lastPage={foods.last_page}
                            total={foods.total}
                            perPage={foods.per_page}
                            baseUrl="/foods"
                            filters={filters}
                        />
                    </div>
                </Card>
            </div>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Food</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{selectedFood?.name}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
