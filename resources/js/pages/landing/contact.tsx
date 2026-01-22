import { Head } from '@inertiajs/react';
import LandingLayout from '@/components/layouts/landing-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingTextarea } from '@/components/ui/floating-textarea';
import { FloatingSelect } from '@/components/ui/floating-select';
import {
    Mail,

    Phone,
    MapPin,
    Send,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

const contactInfo = [
    {
        icon: Mail,
        title: 'Email',
        value: 'info@jagoanbunda.id',
        description: 'Kirim email kapan saja',
    },
    {
        icon: Phone,
        title: 'Telepon',
        value: '+62 21 1234 5678',
        description: 'Senin - Jumat, 08:00 - 17:00 WIB',
    },
    {
        icon: MapPin,
        title: 'Alamat',
        value: 'Jakarta, Indonesia',
        description: 'Jl. Kesehatan No. 123',
    },
];

const faqs = [
    {
        question: 'Apakah aplikasi JagoanBunda gratis?',
        answer: 'Ya, aplikasi JagoanBunda dapat diunduh dan digunakan secara gratis oleh semua orang tua di Indonesia.',
    },
    {
        question: 'Bagaimana cara menghubungkan dengan tenaga kesehatan?',
        answer: 'Setelah registrasi, Anda dapat memilih puskesmas terdekat dan data anak Anda akan terhubung dengan tenaga kesehatan setempat.',
    },
    {
        question: 'Apakah data anak saya aman?',
        answer: 'Keamanan data adalah prioritas kami. Semua data dienkripsi dan disimpan sesuai standar keamanan kesehatan.',
    },
    {
        question: 'Bagaimana jika hasil screening menunjukkan perlu rujukan?',
        answer: 'Aplikasi akan memberikan rekomendasi dan menghubungkan Anda dengan tenaga kesehatan terdekat untuk tindak lanjut.',
    },
];

export default function ContactPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        alert('Pesan Anda telah terkirim!');
    };

    return (
        <LandingLayout>
            <Head title="Hubungi Kami - JagoanBunda" />

            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-[oklch(0.975_0.008_85)] via-[oklch(0.98_0.005_120)] to-[oklch(0.97_0.02_55)]">
                <div className="container px-4 mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4 text-[oklch(0.20_0.02_60)]">Hubungi Kami</h1>
                    <p className="text-lg text-[oklch(0.50_0.02_60)] max-w-2xl mx-auto">
                        Ada pertanyaan atau masukan? Kami siap membantu Anda.
                    </p>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20 bg-white">
                <div className="container px-4 mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <Card className="border-0 shadow-md">
                            <CardHeader>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                                    <FloatingInput
                                        label="Nama"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                    <FloatingInput
                                        label="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                    <FloatingSelect
                                        label="Subjek"
                                        value={formData.subject}
                                        onValueChange={(val) => setFormData({ ...formData, subject: val })}
                                        options={[
                                            { value: "general", label: "Pertanyaan Umum" },
                                            { value: "technical", label: "Bantuan Teknis" },
                                            { value: "partnership", label: "Kerjasama" },
                                            { value: "feedback", label: "Masukan & Saran" },
                                        ]}
                                        placeholder="Pilih subjek"
                                        required
                                    />
                                    <FloatingTextarea
                                        label="Pesan"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                    />
                                    <Button type="submit" className="w-full h-12 rounded-xl gap-2 bg-[oklch(0.60_0.12_163)] hover:bg-[oklch(0.55_0.14_163)] text-white font-medium text-base">
                                        <Send className="h-4 w-4" />
                                        Kirim Pesan
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Contact Info */}
                        <div className="space-y-6">
                            {contactInfo.map((info, index) => (
                                <Card key={index} className="border-0 shadow-md bg-white">
                                    <CardContent className="flex items-start gap-4 p-6">
                                        <div className="h-12 w-12 rounded-lg bg-[oklch(0.92_0.04_163)] flex items-center justify-center flex-shrink-0">
                                            <info.icon className="h-6 w-6 text-[oklch(0.60_0.12_163)]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-[oklch(0.25_0.02_60)]">{info.title}</h3>
                                            <p className="text-[oklch(0.50_0.12_163)] font-medium">{info.value}</p>
                                            <p className="text-sm text-[oklch(0.50_0.02_60)]">{info.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Map placeholder */}
                            <Card className="border-0 shadow-md bg-white">
                                <CardContent className="p-0">
                                    <div className="h-48 bg-[oklch(0.95_0.02_145)] rounded-lg flex items-center justify-center">
                                        <div className="text-center text-[oklch(0.50_0.02_60)]">
                                            <MapPin className="h-8 w-8 mx-auto mb-2 text-[oklch(0.60_0.12_163)]" />
                                            <p className="text-sm">Peta lokasi kantor</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-[oklch(0.975_0.008_85)]">
                <div className="container px-4 mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12 text-[oklch(0.20_0.02_60)]">Pertanyaan Umum</h2>
                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, index) => (
                            <Card key={index} className="border-0 shadow-md bg-white">
                                <button
                                    className="w-full text-left p-6 flex items-center justify-between"
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                >
                                    <span className="font-medium text-[oklch(0.25_0.02_60)]">{faq.question}</span>
                                    {openFaq === index ? (
                                        <ChevronUp className="h-5 w-5 text-[oklch(0.50_0.02_60)] flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-[oklch(0.50_0.02_60)] flex-shrink-0" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <CardContent className="pt-0 pb-6 px-6">
                                        <p className="text-[oklch(0.50_0.02_60)]">{faq.answer}</p>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}
