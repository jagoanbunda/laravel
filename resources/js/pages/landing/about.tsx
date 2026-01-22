import { Head } from '@inertiajs/react';
import LandingLayout from '@/components/layouts/landing-layout';
import { Card, CardContent } from '@/components/ui/card';
import {
    Heart,
    Target,
    Users,
    Award,
    Lightbulb,
    Building,
} from 'lucide-react';

const values = [
    {
        icon: Heart,
        title: 'Peduli Kesehatan Anak',
        description: 'Kami berkomitmen untuk kesehatan dan perkembangan optimal setiap anak Indonesia.',
    },
    {
        icon: Target,
        title: 'Berbasis Bukti',
        description: 'Semua fitur dikembangkan berdasarkan standar kesehatan internasional (WHO).',
    },
    {
        icon: Users,
        title: 'Kolaboratif',
        description: 'Menghubungkan orang tua dengan tenaga kesehatan untuk pemantauan terpadu.',
    },
    {
        icon: Lightbulb,
        title: 'Inovatif',
        description: 'Terus berinovasi menghadirkan teknologi terbaik untuk kesehatan anak.',
    },
];

const timeline = [
    { year: '2023', title: 'Awal Mula', description: 'JagoanBunda didirikan dengan visi meningkatkan kesehatan anak Indonesia.' },
    { year: '2024', title: 'Peluncuran Beta', description: 'Aplikasi diluncurkan untuk 100 keluarga pertama.' },
    { year: '2024', title: 'Kemitraan Puskesmas', description: 'Bermitra dengan 50+ puskesmas di Jawa Barat.' },
    { year: '2025', title: 'Ekspansi Nasional', description: 'Target menjangkau 100.000 keluarga di seluruh Indonesia.' },
];

const team = [
    { name: 'Dr. Andi Pratama', role: 'Founder & CEO', initial: 'AP' },
    { name: 'Dr. Siti Nurhaliza', role: 'Chief Medical Officer', initial: 'SN' },
    { name: 'Budi Santoso', role: 'CTO', initial: 'BS' },
    { name: 'Dewi Lestari', role: 'Head of Product', initial: 'DL' },
];

export default function AboutPage() {
    return (
        <LandingLayout>
            <Head title="Tentang Kami - JagoanBunda" />

            {/* Hero Section */}
            <section className="relative py-20 bg-gradient-to-br from-[oklch(0.975_0.008_85)] via-[oklch(0.98_0.005_120)] to-[oklch(0.97_0.02_55)]">
                <div className="container px-4 mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4 text-[oklch(0.20_0.02_60)]">Tentang JagoanBunda</h1>
                    <p className="text-lg text-[oklch(0.50_0.02_60)] max-w-2xl mx-auto">
                        Kami adalah tim yang berdedikasi untuk meningkatkan kualitas kesehatan
                        dan tumbuh kembang anak-anak Indonesia melalui teknologi.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-white">
                <div className="container px-4 mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-[oklch(0.20_0.02_60)]">Misi & Visi Kami</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                        <Target className="h-5 w-5 text-[oklch(0.60_0.12_163)]" />
                                        Misi
                                    </h3>
                                    <p className="text-[oklch(0.50_0.02_60)]">
                                        Memberikan akses mudah bagi setiap keluarga Indonesia untuk memantau
                                        dan mengoptimalkan tumbuh kembang anak mereka dengan dukungan teknologi
                                        dan tenaga kesehatan profesional.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                        <Award className="h-5 w-5 text-[oklch(0.82_0.08_65)]" />
                                        Visi
                                    </h3>
                                    <p className="text-[oklch(0.50_0.02_60)]">
                                        Menjadi platform terdepan dalam pemantauan kesehatan anak di Indonesia,
                                        membantu menurunkan angka stunting dan malnutrisi secara signifikan.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[oklch(0.92_0.04_163)] rounded-3xl p-8 text-center">
                            <Building className="h-16 w-16 mx-auto mb-4 text-[oklch(0.60_0.12_163)]" />
                            <p className="text-4xl font-bold text-[oklch(0.50_0.12_163)] mb-2">100+</p>
                            <p className="text-[oklch(0.50_0.02_60)]">Puskesmas Mitra</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-[oklch(0.975_0.008_85)]">
                <div className="container px-4 mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12 text-[oklch(0.20_0.02_60)]">Nilai-Nilai Kami</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <Card key={index} className="border-0 shadow-md bg-white">
                                <CardContent className="p-6 text-center">
                                    <div className="h-12 w-12 rounded-full bg-[oklch(0.92_0.04_163)] flex items-center justify-center mx-auto mb-4">
                                        <value.icon className="h-6 w-6 text-[oklch(0.60_0.12_163)]" />
                                    </div>
                                    <h3 className="font-semibold mb-2 text-[oklch(0.25_0.02_60)]">{value.title}</h3>
                                    <p className="text-sm text-[oklch(0.50_0.02_60)]">{value.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20 bg-white">
                <div className="container px-4 mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12 text-[oklch(0.20_0.02_60)]">Perjalanan Kami</h2>
                    <div className="max-w-3xl mx-auto">
                        {timeline.map((item, index) => (
                            <div key={index} className="flex gap-4 mb-8 last:mb-0">
                                <div className="flex flex-col items-center">
                                    <div className="h-10 w-10 rounded-full bg-[oklch(0.60_0.12_163)] flex items-center justify-center text-white font-bold text-sm">
                                        {item.year.slice(-2)}
                                    </div>
                                    {index < timeline.length - 1 && (
                                        <div className="w-0.5 h-full bg-[oklch(0.90_0.02_80)] mt-2" />
                                    )}
                                </div>
                                <div className="pb-8">
                                    <p className="text-sm text-[oklch(0.60_0.12_163)] font-medium">{item.year}</p>
                                    <h3 className="font-semibold text-[oklch(0.25_0.02_60)]">{item.title}</h3>
                                    <p className="text-[oklch(0.50_0.02_60)]">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20 bg-[oklch(0.975_0.008_85)]">
                <div className="container px-4 mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12 text-[oklch(0.20_0.02_60)]">Tim Kami</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {team.map((member, index) => (
                            <Card key={index} className="border-0 shadow-md bg-white">
                                <CardContent className="p-6 text-center">
                                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[oklch(0.72_0.08_163)] to-[oklch(0.82_0.08_65)] flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl font-bold text-white">{member.initial}</span>
                                    </div>
                                    <h3 className="font-semibold text-[oklch(0.25_0.02_60)]">{member.name}</h3>
                                    <p className="text-sm text-[oklch(0.50_0.02_60)]">{member.role}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}
