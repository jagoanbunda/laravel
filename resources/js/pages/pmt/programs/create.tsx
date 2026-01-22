import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Baby, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { FormEvent } from 'react';

interface ChildOption {
    id: number;
    name: string;
    parent_name: string;
    age_months: number;
    has_active_program: boolean;
}

interface Props {
    children: ChildOption[];
}

export default function PmtProgramCreate({ children }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        child_id: '',
        start_date: new Date().toISOString().split('T')[0],
        duration_days: 90,
        notes: '',
    });

    const selectedChild = children.find(c => c.id.toString() === data.child_id);
    
    const endDate = new Date(data.start_date);
    endDate.setDate(endDate.getDate() + (data.duration_days as number));

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/pmt/programs');
    };

    return (
        <AppLayout>
            <Head title="Daftarkan Program PMT" />

            <div className="space-y-6 max-w-3xl mx-auto">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/pmt/programs" className="hover:text-primary hover:underline flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Program PMT
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Daftarkan Program Baru</h1>
                    <p className="text-muted-foreground mt-1">
                        Mulai program pemberian makanan tambahan untuk anak.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Baby className="h-5 w-5" />
                                Data Anak
                            </CardTitle>
                            <CardDescription>
                                Pilih anak yang akan didaftarkan ke program ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="child_id">Pilih Anak *</Label>
                                <Select
                                    value={data.child_id}
                                    onValueChange={(value) => setData('child_id', value)}
                                >
                                    <SelectTrigger className={errors.child_id ? 'border-danger' : ''}>
                                        <SelectValue placeholder="Pilih anak..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {children.map((child) => (
                                            <SelectItem 
                                                key={child.id} 
                                                value={child.id.toString()}
                                                disabled={child.has_active_program}
                                            >
                                                <div className="flex items-center justify-between w-full gap-2">
                                                    <span>{child.name} ({child.age_months} bulan) - {child.parent_name}</span>
                                                    {child.has_active_program && (
                                                        <span className="text-xs text-danger flex items-center gap-1">
                                                            <AlertCircle className="h-3 w-3" />
                                                            Sudah Aktif
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.child_id && (
                                    <p className="text-sm text-danger">{errors.child_id}</p>
                                )}
                                {selectedChild && (
                                    <div className="mt-2 p-3 bg-muted/30 rounded-lg text-sm">
                                        <p><span className="font-medium">Orang Tua:</span> {selectedChild.parent_name}</p>
                                        <p><span className="font-medium">Usia:</span> {selectedChild.age_months} Bulan</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Durasi & Jadwal
                            </CardTitle>
                            <CardDescription>
                                Tentukan durasi program dan tanggal mulai.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label>Durasi Program *</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[90, 120].map((days) => (
                                        <div
                                            key={days}
                                            onClick={() => setData('duration_days', days)}
                                            className={`
                                                cursor-pointer rounded-xl border-2 p-4 transition-all hover:bg-muted/50
                                                ${data.duration_days === days 
                                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                                                    : 'border-muted bg-card hover:border-primary/50'}
                                            `}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-lg">{days} Hari</span>
                                                {data.duration_days === days && (
                                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Program intensif selama {days} hari berturut-turut.
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Tanggal Mulai *</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className={errors.start_date ? 'border-danger' : ''}
                                    />
                                    {errors.start_date && (
                                        <p className="text-sm text-danger">{errors.start_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">Perkiraan Selesai</Label>
                                    <Input
                                        id="end_date"
                                        value={endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        disabled
                                        className="bg-muted text-muted-foreground"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Catatan (Opsional)</Label>
                                <textarea
                                    id="notes"
                                    rows={3}
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Tambahkan catatan khusus untuk program ini..."
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-between items-center">
                        <Button variant="outline" asChild>
                            <Link href="/pmt/programs">Batal</Link>
                        </Button>
                        <Button type="submit" disabled={processing || !data.child_id} className="gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            {processing ? 'Menyimpan...' : 'Mulai Program'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
