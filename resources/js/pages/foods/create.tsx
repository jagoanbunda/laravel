import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    Utensils,
    Zap,
    Drumstick,
    Droplets,
    Wheat,
    Leaf,
    Candy,
    Scale,
    Save,
} from 'lucide-react';
import { FormEvent } from 'react';

interface FoodCreateProps {
    categories: string[];
}

// Icon options for food items
const FOOD_ICONS = [
    { value: 'rice', label: 'Nasi' },
    { value: 'bread', label: 'Roti' },
    { value: 'meat', label: 'Daging' },
    { value: 'fish', label: 'Ikan' },
    { value: 'egg', label: 'Telur' },
    { value: 'vegetable', label: 'Sayur' },
    { value: 'fruit', label: 'Buah' },
    { value: 'milk', label: 'Susu' },
    { value: 'snack', label: 'Snack' },
    { value: 'restaurant', label: 'Restaurant' },
];

export default function FoodCreate({ categories }: FoodCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        category: '',
        icon: '',
        serving_size: 100,
        calories: 0,
        protein: 0,
        fat: 0,
        carbohydrate: 0,
        fiber: 0,
        sugar: 0,
        is_active: true,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/foods');
    };

    return (
        <AppLayout title="Add Food">
            <Head title="Add New Food" />

            <div className="space-y-6 max-w-3xl">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/foods" className="hover:text-primary hover:underline flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Food Database
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Add New Food</h1>
                    <p className="text-muted-foreground mt-1">
                        Add a new food item to the nutrition database.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Utensils className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>
                                Enter the food name and category.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Food Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Nasi Putih"
                                        className={errors.name ? 'border-danger' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-danger">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={data.category}
                                        onValueChange={(value) => setData('category', value)}
                                    >
                                        <SelectTrigger className={errors.category ? 'border-danger' : ''}>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <p className="text-sm text-danger">{errors.category}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="icon">Icon</Label>
                                    <Select
                                        value={data.icon}
                                        onValueChange={(value) => setData('icon', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select icon (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FOOD_ICONS.map((icon) => (
                                                <SelectItem key={icon.value} value={icon.value}>
                                                    {icon.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="serving_size" className="flex items-center gap-2">
                                        <Scale className="h-4 w-4 text-muted-foreground" />
                                        Serving Size (gram) *
                                    </Label>
                                    <Input
                                        id="serving_size"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.serving_size}
                                        onChange={(e) => setData('serving_size', parseFloat(e.target.value) || 0)}
                                        className={errors.serving_size ? 'border-danger' : ''}
                                    />
                                    {errors.serving_size && (
                                        <p className="text-sm text-danger">{errors.serving_size}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Nutrition Information */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-warning" />
                                Nutrition Facts
                            </CardTitle>
                            <CardDescription>
                                Enter nutritional values per serving size.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Calories - Highlighted */}
                            <div className="p-4 rounded-lg bg-warning-muted/50 border border-warning/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center">
                                            <Zap className="h-5 w-5 text-warning" />
                                        </div>
                                        <div>
                                            <Label htmlFor="calories" className="text-base font-medium">
                                                Calories *
                                            </Label>
                                            <p className="text-xs text-muted-foreground">Energy in kcal</p>
                                        </div>
                                    </div>
                                    <div className="w-32">
                                        <Input
                                            id="calories"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.calories}
                                            onChange={(e) => setData('calories', parseFloat(e.target.value) || 0)}
                                            className={`text-right text-lg font-semibold ${errors.calories ? 'border-danger' : ''}`}
                                        />
                                    </div>
                                </div>
                                {errors.calories && (
                                    <p className="text-sm text-danger mt-2">{errors.calories}</p>
                                )}
                            </div>

                            {/* Macronutrients Grid */}
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="p-4 rounded-lg bg-info-muted/30 border border-info/10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Drumstick className="h-4 w-4 text-info" />
                                        <Label htmlFor="protein" className="font-medium">Protein (g) *</Label>
                                    </div>
                                    <Input
                                        id="protein"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.protein}
                                        onChange={(e) => setData('protein', parseFloat(e.target.value) || 0)}
                                        className={errors.protein ? 'border-danger' : ''}
                                    />
                                    {errors.protein && (
                                        <p className="text-sm text-danger mt-1">{errors.protein}</p>
                                    )}
                                </div>

                                <div className="p-4 rounded-lg bg-danger-muted/30 border border-danger/10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Droplets className="h-4 w-4 text-danger" />
                                        <Label htmlFor="fat" className="font-medium">Fat (g) *</Label>
                                    </div>
                                    <Input
                                        id="fat"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.fat}
                                        onChange={(e) => setData('fat', parseFloat(e.target.value) || 0)}
                                        className={errors.fat ? 'border-danger' : ''}
                                    />
                                    {errors.fat && (
                                        <p className="text-sm text-danger mt-1">{errors.fat}</p>
                                    )}
                                </div>

                                <div className="p-4 rounded-lg bg-success-muted/30 border border-success/10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Wheat className="h-4 w-4 text-success" />
                                        <Label htmlFor="carbohydrate" className="font-medium">Carbohydrate (g) *</Label>
                                    </div>
                                    <Input
                                        id="carbohydrate"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.carbohydrate}
                                        onChange={(e) => setData('carbohydrate', parseFloat(e.target.value) || 0)}
                                        className={errors.carbohydrate ? 'border-danger' : ''}
                                    />
                                    {errors.carbohydrate && (
                                        <p className="text-sm text-danger mt-1">{errors.carbohydrate}</p>
                                    )}
                                </div>
                            </div>

                            {/* Additional Nutrients */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fiber" className="flex items-center gap-2">
                                        <Leaf className="h-4 w-4 text-success" />
                                        Fiber (g)
                                    </Label>
                                    <Input
                                        id="fiber"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.fiber}
                                        onChange={(e) => setData('fiber', parseFloat(e.target.value) || 0)}
                                        placeholder="Optional"
                                    />
                                    {errors.fiber && (
                                        <p className="text-sm text-danger">{errors.fiber}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sugar" className="flex items-center gap-2">
                                        <Candy className="h-4 w-4 text-danger" />
                                        Sugar (g)
                                    </Label>
                                    <Input
                                        id="sugar"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.sugar}
                                        onChange={(e) => setData('sugar', parseFloat(e.target.value) || 0)}
                                        placeholder="Optional"
                                    />
                                    {errors.sugar && (
                                        <p className="text-sm text-danger">{errors.sugar}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                            <CardDescription>
                                Set whether this food is active and available for selection.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base font-medium">Active</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Active foods can be used in food logs and meal planning.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                        <Button variant="outline" asChild>
                            <Link href="/foods">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Food'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
