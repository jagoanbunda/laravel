import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import {
    User,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    BarChart3,
    HelpCircle,
    Loader2,
} from 'lucide-react';

interface PageProps {
    flash: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export default function Login() {
    const { flash } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
            <Head title="Login - JagoanBunda Nakes Portal" />

            {/* Left Side: Visual & Context (Hidden on mobile) */}
            <div className="hidden lg:flex w-[55%] relative overflow-hidden flex-col justify-between p-12 text-white">
                {/* Background - Soft sage gradient */}
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-[oklch(0.72_0.06_163)] via-[oklch(0.68_0.08_165)] to-[oklch(0.62_0.10_170)]" />

                {/* Decorative Elements - Sage and peach tinted */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[oklch(0.85_0.04_163/0.25)] rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[oklch(0.88_0.05_55/0.20)] rounded-full blur-3xl" />

                {/* Content Container */}
                <div className="relative z-10 flex flex-col h-full justify-center max-w-2xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex self-start items-center gap-x-2 rounded-full bg-white/15 backdrop-blur-md px-4 py-1.5 mb-8 border border-white/20">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-sm font-medium tracking-wide">Portal Tenaga Kesehatan</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6 tracking-tight">
                        Pantau Tumbuh Kembang Anak di Wilayah Binaan Anda
                    </h1>

                    {/* Subtext */}
                    <p className="text-lg text-primary-foreground/80 font-normal leading-relaxed mb-10 max-w-lg">
                        Dashboard terintegrasi untuk Bidan, Perawat, dan Kader Posyandu dalam memantau stunting dan kesehatan balita.
                    </p>

                    {/* Floating Preview Card */}
                    <div className="mb-12 transform hover:scale-[1.02] transition-transform duration-500">
                        <div className="bg-white/15 backdrop-blur-xl rounded-xl p-5 shadow-2xl flex items-center gap-6 max-w-lg border border-white/20">
                            <div className="bg-white rounded-lg p-3 shrink-0 shadow-sm">
                                <BarChart3 className="h-8 w-8 text-[oklch(0.50_0.12_163)]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs uppercase tracking-wider text-white/70 font-medium mb-1">Update Terkini</p>
                                <h3 className="text-lg font-bold">Statistik Wilayah</h3>
                                <div className="mt-2 h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-3/4 rounded-full" />
                                </div>
                                <div className="flex justify-between mt-1 text-xs text-white/70">
                                    <span>Target Tercapai</span>
                                    <span>75%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap gap-6 mt-auto border-t border-white/15 pt-8">
                        <div>
                            <p className="text-3xl font-bold">500+</p>
                            <p className="text-sm text-white/70 font-medium">Nakes Aktif</p>
                        </div>
                        <div className="w-px h-12 bg-white/15" />
                        <div>
                            <p className="text-3xl font-bold">100+</p>
                            <p className="text-sm text-white/70 font-medium">Puskesmas</p>
                        </div>
                        <div className="w-px h-12 bg-white/15" />
                        <div>
                            <p className="text-3xl font-bold">25k+</p>
                            <p className="text-sm text-white/70 font-medium">Anak Terpantau</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 md:p-12 relative bg-[oklch(0.99_0.005_80)] min-h-screen">
                {/* Mobile Background */}
                <div className="lg:hidden absolute inset-0 bg-gradient-to-b from-[oklch(0.96_0.02_163)] to-[oklch(0.99_0.005_80)] -z-10" />

                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="text-center lg:text-left space-y-2">
                        <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
                            <img src="/images/logo.png" alt="JagoanBunda" className="h-12 w-12 rounded-lg shadow-lg" />
                            <div className="flex flex-col items-start">
                                <span className="text-xl font-bold text-[oklch(0.20_0.02_60)] tracking-tight">JagoanBunda</span>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-white bg-[oklch(0.65_0.10_163)] px-1.5 py-0.5 rounded">
                                    Portal Nakes
                                </span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-[oklch(0.20_0.02_60)]">Masuk ke Dashboard</h2>
                        <p className="text-[oklch(0.50_0.02_60)]">
                            Akses data tumbuh kembang anak di wilayah kerja Anda dengan aman.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                        {/* Flash Error Alert */}
                        {flash.error && (
                            <Alert variant="error">
                                <AlertDescription>{flash.error}</AlertDescription>
                            </Alert>
                        )}

                        {/* NIP/Email Input */}
                        <div className="space-y-1">
                            <label htmlFor="email" className="block text-sm font-medium text-[oklch(0.35_0.02_60)]">
                                NIP atau Email
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <User className="h-5 w-5 text-[oklch(0.55_0.02_60)]" />
                                </div>
                                <Input
                                    id="email"
                                    type="text"
                                    placeholder="19800101 200501 1 001"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`pl-11 py-6 rounded-xl border-[oklch(0.85_0.02_80)] bg-white focus:ring-2 focus:ring-[oklch(0.60_0.12_163/0.2)] focus:border-[oklch(0.60_0.12_163)] ${
                                        errors.email ? 'border-destructive focus:ring-destructive/20 focus:border-destructive' : ''
                                    }`}
                                />
                            </div>
                            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1">
                            <label htmlFor="password" className="block text-sm font-medium text-[oklch(0.35_0.02_60)]">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Lock className="h-5 w-5 text-[oklch(0.55_0.02_60)]" />
                                </div>
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`pl-11 pr-12 py-6 rounded-xl border-[oklch(0.85_0.02_80)] bg-white focus:ring-2 focus:ring-[oklch(0.60_0.12_163/0.2)] focus:border-[oklch(0.60_0.12_163)] ${
                                        errors.password ? 'border-destructive focus:ring-destructive/20 focus:border-destructive' : ''
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-[oklch(0.55_0.02_60)] hover:text-[oklch(0.35_0.02_60)]"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-[oklch(0.85_0.02_80)] text-[oklch(0.60_0.12_163)] focus:ring-[oklch(0.60_0.12_163)]"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-[oklch(0.50_0.02_60)]">
                                    Ingat saya
                                </label>
                            </div>
                            <Link href="#" className="text-sm font-medium text-[oklch(0.50_0.10_163)] hover:text-[oklch(0.40_0.12_163)] hover:underline">
                                Lupa kata sandi?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full py-6 rounded-xl font-semibold bg-gradient-to-r from-[oklch(0.65_0.10_163)] to-[oklch(0.60_0.12_170)] hover:from-[oklch(0.60_0.12_163)] hover:to-[oklch(0.55_0.14_170)] text-white shadow-lg shadow-[oklch(0.60_0.12_163/0.25)] hover:shadow-[oklch(0.60_0.12_163/0.35)] transition-all hover:-translate-y-0.5 group disabled:opacity-75 disabled:cursor-wait"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    Masuk ke Dashboard
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[oklch(0.90_0.02_80)]" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-[oklch(0.99_0.005_80)] px-2 text-sm text-[oklch(0.55_0.02_60)]">atau</span>
                        </div>
                    </div>

                    {/* Help/Registration Link */}
                    <div className="text-center space-y-4">
                        <p className="text-sm text-[oklch(0.50_0.02_60)]">
                            Belum punya akun?{' '}
                            <Link href="#" className="font-medium text-[oklch(0.50_0.10_163)] hover:text-[oklch(0.40_0.12_163)] hover:underline">
                                Hubungi admin Puskesmas Anda
                            </Link>
                        </p>

                        {/* Support Card */}
                        <div className="mt-8 rounded-xl bg-[oklch(0.96_0.02_163)] p-4 border border-[oklch(0.90_0.04_163)]">
                            <div className="flex items-start">
                                <HelpCircle className="h-5 w-5 text-[oklch(0.55_0.08_163)] shrink-0" />
                                <div className="ml-3 flex-1 md:flex md:justify-between">
                                    <p className="text-sm text-[oklch(0.30_0.02_60)] font-medium">Butuh bantuan teknis?</p>
                                    <Link href="#" className="text-sm text-[oklch(0.50_0.10_163)] hover:text-[oklch(0.40_0.12_163)] md:ml-6">
                                        Kontak Support →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 lg:absolute lg:bottom-8 w-full text-center">
                    <p className="text-xs text-[oklch(0.55_0.02_60)]">
                        © 2024 JagoanBunda Portal Nakes. Versi 2.1.0
                    </p>
                </div>
            </div>
        </div>
    );
}
