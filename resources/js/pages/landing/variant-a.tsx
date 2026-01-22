import { Head, Link } from '@inertiajs/react';
import LandingLayout from '@/components/layouts/landing-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    Apple,
    Brain,
    ClipboardCheck,
    Download,
    Star,
    Check,
    ArrowRight,
} from 'lucide-react';

/**
 * VARIANT A: Sage & Soft Peach - Warm/Wellness Theme
 * 
 * Color Psychology:
 * - Sage Green: Calm, mental clarity, anxiety reduction, balance
 * - Soft Peach: Warmth, cheerfulness, comfort, positivity
 * - Muted Lavender: Grace, femininity, tranquility
 * 
 * Best for: Family/parenting apps, wellness platforms
 */

const features = [
    {
        icon: Activity,
        title: 'Tracking Antropometri',
        description: 'Pantau berat badan, tinggi badan, dan lingkar kepala anak dengan standar WHO.',
        color: 'bg-[oklch(0.72_0.08_163)]', // Soft Sage
    },
    {
        icon: Apple,
        title: 'Monitoring Nutrisi',
        description: 'Catat asupan makanan harian dan pastikan kebutuhan gizi anak terpenuhi.',
        color: 'bg-[oklch(0.75_0.08_145)]', // Muted Green
    },
    {
        icon: Brain,
        title: 'Screening ASQ-3',
        description: 'Deteksi dini perkembangan anak dengan kuesioner terstandar internasional.',
        color: 'bg-[oklch(0.78_0.06_300)]', // Soft Lavender
    },
    {
        icon: ClipboardCheck,
        title: 'Program PMT',
        description: 'Kelola program pemberian makanan tambahan untuk anak yang membutuhkan.',
        color: 'bg-[oklch(0.82_0.08_65)]', // Soft Peach/Amber
    },
];

const stats = [
    { value: '10,000+', label: 'Keluarga Terdaftar' },
    { value: '25,000+', label: 'Anak Terpantau' },
    { value: '500+', label: 'Tenaga Kesehatan' },
    { value: '100+', label: 'Puskesmas Mitra' },
];

const testimonials = [
    {
        name: 'Ibu Dewi',
        role: 'Orang Tua',
        content: 'Aplikasi ini sangat membantu saya memantau tumbuh kembang anak. Fitur screening ASQ-3 nya lengkap sekali!',
        rating: 5,
    },
    {
        name: 'Bidan Sari',
        role: 'Tenaga Kesehatan',
        content: 'Dashboard untuk Nakes sangat memudahkan kami memantau status gizi anak-anak di wilayah binaan.',
        rating: 5,
    },
    {
        name: 'Ibu Rina',
        role: 'Orang Tua',
        content: 'Suka banget dengan fitur reminder untuk jadwal imunisasi dan pemeriksaan rutin.',
        rating: 5,
    },
];

// User avatars for social proof - using soft colors
const userAvatars = [
    { name: 'User 1', color: 'bg-[oklch(0.72_0.08_163)]' }, // Soft Sage
    { name: 'User 2', color: 'bg-[oklch(0.82_0.08_65)]' },  // Soft Peach
    { name: 'User 3', color: 'bg-[oklch(0.78_0.06_300)]' }, // Soft Lavender
];

export default function LandingVariantA() {
    return (
        <LandingLayout>
            <Head title="JagoanBunda - Variant A (Sage & Peach)" />
            
            {/* Theme Indicator */}
            <div className="fixed top-4 right-4 z-50">
                <Badge className="bg-[oklch(0.72_0.08_163)] text-white">
                    Variant A: Sage & Peach
                </Badge>
            </div>

            {/* Hero Section - Soft Sage & Peach Theme */}
            <section className="relative overflow-hidden min-h-[90vh] flex items-center theme-soft-sage">
                {/* Gradient Background - Warm cream with sage/peach hints */}
                <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.975_0.008_85)] via-[oklch(0.96_0.02_145)] to-[oklch(0.97_0.02_55)]" />

                {/* Decorative circles - Soft sage and peach */}
                <div className="absolute top-20 right-1/3 w-72 h-72 bg-[oklch(0.88_0.06_163/0.30)] rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-[oklch(0.90_0.05_55/0.25)] rounded-full blur-3xl" />

                <div className="container px-4 mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-4 lg:gap-2 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            {/* Badge - Soft sage */}
                            <div className="inline-flex items-center gap-2 bg-[oklch(0.92_0.04_163)] text-[oklch(0.35_0.10_163)] rounded-full px-4 py-2 text-sm font-medium">
                                <span className="h-2 w-2 rounded-full bg-[oklch(0.65_0.12_163)] animate-pulse" />
                                #1 HEALTH APP FOR KIDS
                            </div>

                            {/* Main Headline */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[oklch(0.20_0.02_60)]">
                                Monitor Tumbuh Kembang Anak dengan{' '}
                                <span className="text-[oklch(0.60_0.12_163)]">Mudah</span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-lg text-[oklch(0.45_0.02_60)] max-w-lg">
                                Pantau kesehatan, nutrisi, dan perkembangan si kecil dalam satu aplikasi terpadu.
                                Dapatkan analisis akurat dan rekomendasi medis terpercaya.
                            </p>

                            {/* CTA Buttons - Soft sage primary, outlined secondary */}
                            <div className="flex flex-wrap gap-4">
                                <Link href="/download">
                                    <Button size="lg" className="gap-2 bg-[oklch(0.60_0.12_163)] hover:bg-[oklch(0.55_0.14_163)] text-white px-6 py-6 text-base rounded-xl shadow-lg shadow-[oklch(0.60_0.12_163/0.25)]">
                                        <Download className="h-5 w-5" />
                                        Download App
                                    </Button>
                                </Link>
                                <Link href="/#features">
                                    <Button size="lg" variant="outline" className="gap-2 px-6 py-6 text-base rounded-xl border-2 border-[oklch(0.75_0.08_163)] text-[oklch(0.45_0.10_163)] hover:bg-[oklch(0.95_0.03_163)]">
                                        Learn More
                                    </Button>
                                </Link>
                            </div>

                            {/* Social Proof */}
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {userAvatars.map((avatar, i) => (
                                        <div
                                            key={i}
                                            className={`h-10 w-10 rounded-full ${avatar.color} border-2 border-white flex items-center justify-center text-white text-sm font-medium shadow-md`}
                                        >
                                            {avatar.name.charAt(0)}
                                        </div>
                                    ))}
                                    <div className="h-10 w-10 rounded-full bg-[oklch(0.92_0.02_80)] border-2 border-white flex items-center justify-center text-[oklch(0.45_0.02_60)] text-xs font-medium">
                                        +2k
                                    </div>
                                </div>
                                <span className="text-sm text-[oklch(0.50_0.02_60)]">
                                    Bergabung dengan orang tua lainnya
                                </span>
                            </div>
                        </div>

                        {/* Right Content - Phone Mockup */}
                        <div className="relative flex justify-center lg:justify-start lg:pl-8 mt-12">
                            {/* Phone Frame */}
                            <div className="relative">
                                {/* Phone outer frame */}
                                <div className="relative bg-[oklch(0.25_0.02_60)] rounded-[3rem] p-3 shadow-2xl">
                                    {/* Phone notch */}
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-[oklch(0.25_0.02_60)] rounded-b-2xl z-20" />

                                    {/* Screenshot */}
                                    <div className="relative rounded-[2.5rem] overflow-hidden bg-white w-[280px] sm:w-[320px]">
                                        <img
                                            src="/images/app-screenshot.png"
                                            alt="JagoanBunda App Screenshot"
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>

                                {/* Floating Status Card - Soft colors */}
                                <div className="absolute -bottom-4 -left-8 sm:-left-16 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-[oklch(0.90_0.02_80)]">
                                    <div className="h-10 w-10 rounded-full bg-[oklch(0.92_0.04_163)] flex items-center justify-center">
                                        <Check className="h-5 w-5 text-[oklch(0.50_0.12_163)]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-[oklch(0.55_0.02_60)]">Status Gizi</p>
                                        <p className="font-semibold text-[oklch(0.25_0.02_60)]">Gizi Baik</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Soft background */}
            <section id="features" className="py-20 bg-[oklch(0.99_0.005_80)]">
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-12">
                        <Badge variant="secondary" className="mb-4 bg-[oklch(0.92_0.04_163)] text-[oklch(0.40_0.10_163)]">Fitur Unggulan</Badge>
                        <h2 className="text-3xl font-bold mb-4 text-[oklch(0.20_0.02_60)]">Semua yang Anda Butuhkan</h2>
                        <p className="text-[oklch(0.50_0.02_60)] max-w-2xl mx-auto">
                            Fitur lengkap untuk memantau tumbuh kembang anak dalam satu aplikasi.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-white">
                                <CardContent className="p-6">
                                    <div className={`h-12 w-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 text-white shadow-sm`}>
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-semibold mb-2 text-lg text-[oklch(0.25_0.02_60)]">{feature.title}</h3>
                                    <p className="text-sm text-[oklch(0.50_0.02_60)]">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section - Soft gradient */}
            <section className="py-20 bg-gradient-to-r from-[oklch(0.68_0.10_163)] to-[oklch(0.70_0.10_200)] text-white">
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Dipercaya oleh Ribuan Keluarga Indonesia</h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className="text-4xl font-bold mb-2">{stat.value}</p>
                                <p className="text-white/80">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-[oklch(0.975_0.008_85)]">
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-12">
                        <Badge variant="secondary" className="mb-4 bg-[oklch(0.92_0.04_55)] text-[oklch(0.45_0.10_55)]">Testimonial</Badge>
                        <h2 className="text-3xl font-bold mb-4 text-[oklch(0.20_0.02_60)]">Apa Kata Mereka?</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="border-0 shadow-md bg-white">
                                <CardContent className="p-6">
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-[oklch(0.80_0.12_85)] text-[oklch(0.80_0.12_85)]" />
                                        ))}
                                    </div>
                                    <p className="text-[oklch(0.45_0.02_60)] mb-4">"{testimonial.content}"</p>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[oklch(0.72_0.08_163)] to-[oklch(0.82_0.08_65)] flex items-center justify-center text-white font-medium">
                                            {testimonial.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[oklch(0.25_0.02_60)]">{testimonial.name}</p>
                                            <p className="text-sm text-[oklch(0.55_0.02_60)]">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Soft gradient */}
            <section className="py-20 bg-white">
                <div className="container px-4 mx-auto">
                    <Card className="bg-gradient-to-r from-[oklch(0.68_0.10_163)] to-[oklch(0.70_0.10_200)] border-0 overflow-hidden">
                        <CardContent className="p-12 text-center text-white relative">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold mb-4">Mulai Pantau Tumbuh Kembang Anak Anda</h2>
                                <p className="text-white/90 max-w-2xl mx-auto mb-8">
                                    Download aplikasi JagoanBunda sekarang dan bergabung dengan ribuan keluarga Indonesia
                                    yang telah mempercayakan pemantauan tumbuh kembang anak mereka.
                                </p>
                                <Link href="/download">
                                    <Button size="lg" variant="secondary" className="gap-2 bg-white text-[oklch(0.50_0.12_163)] hover:bg-[oklch(0.97_0.02_80)] px-8 py-6 text-base rounded-xl shadow-lg">
                                        <Download className="h-5 w-5" />
                                        Download Gratis
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Comparison Links */}
            <section className="py-8 bg-[oklch(0.97_0.005_80)] border-t border-[oklch(0.90_0.02_80)]">
                <div className="container px-4 mx-auto">
                    <div className="flex flex-wrap justify-center gap-4 items-center">
                        <span className="text-sm text-[oklch(0.50_0.02_60)]">Compare Variants:</span>
                        <Link href="/variant-a">
                            <Badge className="bg-[oklch(0.72_0.08_163)] text-white cursor-pointer">
                                ✓ Variant A (Current)
                            </Badge>
                        </Link>
                        <Link href="/variant-b">
                            <Badge variant="outline" className="cursor-pointer border-[oklch(0.70_0.10_250)] text-[oklch(0.50_0.12_250)] hover:bg-[oklch(0.95_0.03_250)]">
                                Variant B (Blue & Teal)
                            </Badge>
                        </Link>
                        <Link href="/">
                            <Badge variant="outline" className="cursor-pointer">
                                Original
                            </Badge>
                        </Link>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}
