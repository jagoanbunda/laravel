<?php

namespace Database\Seeders;

use App\Models\Asq3AgeInterval;
use App\Models\Asq3Domain;
use App\Models\Asq3Recommendation;
use Illuminate\Database\Seeder;

class Asq3RecommendationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates age-interval specific Indonesian recommendations for all ASQ-3 domains.
     * Based on evidence-based ASQ-3 Learning Activities.
     */
    public function run(): void
    {
        $domains = Asq3Domain::all()->keyBy('code');
        $intervals = Asq3AgeInterval::all()->keyBy('age_months');

        foreach ($this->getRecommendations() as $domainCode => $ageGroups) {
            $domain = $domains->get($domainCode);
            if (! $domain) {
                continue;
            }

            foreach ($ageGroups as $ageGroup => $recommendations) {
                $intervalIds = $this->getIntervalIdsForAgeGroup($intervals, $ageGroup);

                foreach ($intervalIds as $intervalId) {
                    foreach ($recommendations as $priority => $text) {
                        Asq3Recommendation::updateOrCreate(
                            [
                                'domain_id' => $domain->id,
                                'age_interval_id' => $intervalId,
                                'priority' => $priority + 1,
                            ],
                            [
                                'recommendation_text' => $text,
                            ]
                        );
                    }
                }
            }
        }
    }

    /**
     * Get interval IDs for a given age group range.
     */
    private function getIntervalIdsForAgeGroup($intervals, string $ageGroup): array
    {
        $mapping = [
            '0-6' => [2, 4, 6],
            '6-12' => [8, 9, 10, 12],
            '12-18' => [14, 16, 18],
            '18-24' => [20, 22, 24],
            '24-36' => [27, 30, 33, 36],
            '36-48' => [42, 48],
            '48-60' => [54, 60],
        ];

        $ageMonths = $mapping[$ageGroup] ?? [];
        $ids = [];

        foreach ($ageMonths as $month) {
            $interval = $intervals->get($month);
            if ($interval) {
                $ids[] = $interval->id;
            }
        }

        return $ids;
    }

    /**
     * Get all recommendations organized by domain and age group.
     *
     * @return array<string, array<string, array<int, string>>>
     */
    private function getRecommendations(): array
    {
        return [
            'communication' => $this->getCommunicationRecommendations(),
            'gross_motor' => $this->getGrossMotorRecommendations(),
            'fine_motor' => $this->getFineMotorRecommendations(),
            'problem_solving' => $this->getProblemSolvingRecommendations(),
            'personal_social' => $this->getPersonalSocialRecommendations(),
        ];
    }

    /**
     * Communication domain recommendations (Komunikasi).
     */
    private function getCommunicationRecommendations(): array
    {
        return [
            '0-6' => [
                'Bicara dan bernyanyi untuk bayi saat rutinitas harian seperti mandi, mengganti popok, dan menyusui.',
                'Tirukan suara ocehan bayi dan tunggu responnya untuk membangun percakapan awal.',
                'Bacakan buku dengan gambar kontras tinggi dan ceritakan apa yang Anda lihat.',
            ],
            '6-12' => [
                'Sebutkan nama benda-benda di sekitar anak dengan jelas dan berulang.',
                'Bermain "mana...?" dengan menunjukkan dan menyebutkan anggota tubuh.',
                'Bernyanyi lagu anak sederhana dengan gerakan tangan seperti "Pok Ame-Ame".',
            ],
            '12-18' => [
                'Ajak anak berbicara tentang aktivitas sehari-hari dengan kalimat pendek dan jelas.',
                'Bermain telepon-teleponan untuk melatih percakapan bolak-balik.',
                'Tanyakan "Mau apa?" dan tunggu anak mencoba menjawab sebelum memberikan.',
            ],
            '18-24' => [
                'Bacakan buku bergambar setiap hari dan minta anak menunjukkan gambar yang disebutkan.',
                'Perluas kalimat anak - jika anak berkata "susu", katakan "Oh, mau minum susu?".',
                'Ajak anak menyanyikan lagu dengan kata-kata sederhana dan gerak tubuh.',
            ],
            '24-36' => [
                'Ajak anak bercerita tentang apa yang dilakukan hari ini menggunakan kalimat lengkap.',
                'Bermain peran dengan boneka atau mainan untuk melatih dialog.',
                'Bacakan cerita dan ajukan pertanyaan "Apa yang terjadi selanjutnya?".',
            ],
            '36-48' => [
                'Minta anak menceritakan kembali cerita yang baru dibacakan dengan kata-katanya sendiri.',
                'Bermain tebak-tebakan dengan memberi petunjuk tentang suatu benda.',
                'Ajak anak berbicara tentang perasaannya dan ajari kata-kata untuk emosi.',
            ],
            '48-60' => [
                'Ajak anak berdiskusi tentang topik yang menarik minatnya dengan pertanyaan terbuka.',
                'Bermain permainan kata seperti mencari kata yang berawalan huruf sama.',
                'Minta anak menjelaskan cara melakukan sesuatu langkah demi langkah.',
            ],
        ];
    }

    /**
     * Gross Motor domain recommendations (Motorik Kasar).
     */
    private function getGrossMotorRecommendations(): array
    {
        return [
            '0-6' => [
                'Lakukan tummy time (tengkurap) 3-5 menit beberapa kali sehari untuk menguatkan leher dan punggung.',
                'Bantu bayi berguling dengan meletakkan mainan menarik di samping.',
                'Pegang bayi dalam posisi duduk dengan ditopang untuk melatih keseimbangan.',
            ],
            '6-12' => [
                'Letakkan mainan agak jauh untuk mendorong bayi merangkak.',
                'Bantu bayi berdiri berpegangan pada furnitur yang stabil.',
                'Bermain "ci-luk-ba" dengan bergerak ke berbagai arah.',
            ],
            '12-18' => [
                'Ajak anak berjalan dengan memegang satu tangan, lalu lepaskan perlahan.',
                'Bermain menendang bola besar yang ringan.',
                'Ajak anak naik-turun tangga dengan berpegangan dan diawasi.',
            ],
            '18-24' => [
                'Bermain lari dan berhenti sesuai aba-aba.',
                'Ajak anak melompat dari ketinggian rendah (1 anak tangga) dengan dipegang.',
                'Bermain menari mengikuti musik dengan berbagai gerakan.',
            ],
            '24-36' => [
                'Buat obstacle course sederhana dengan bantal dan kotak untuk dilalui.',
                'Bermain jalan seperti binatang - beruang, kelinci, katak.',
                'Latih anak menendang bola ke arah sasaran.',
            ],
            '36-48' => [
                'Ajak anak bersepeda roda tiga atau balance bike.',
                'Bermain lompat dengan dua kaki bersamaan.',
                'Bermain lempar tangkap bola dengan jarak dekat.',
            ],
            '48-60' => [
                'Ajak anak melompat dengan satu kaki bergantian.',
                'Bermain kejar-kejaran dengan aturan sederhana.',
                'Latih keseimbangan berjalan di atas garis lurus atau balok rendah.',
            ],
        ];
    }

    /**
     * Fine Motor domain recommendations (Motorik Halus).
     */
    private function getFineMotorRecommendations(): array
    {
        return [
            '0-6' => [
                'Berikan mainan bertekstur berbeda untuk digenggam dan diraba.',
                'Bermain dengan mainan kerincingan yang mudah dipegang.',
                'Latih bayi memindahkan benda dari satu tangan ke tangan lain.',
            ],
            '6-12' => [
                'Bermain memasukkan dan mengeluarkan benda dari wadah.',
                'Berikan finger food untuk latihan makan sendiri dengan jari.',
                'Ajak bermain menumpuk 2-3 balok.',
            ],
            '12-18' => [
                'Bermain mencoret-coret dengan krayon besar di kertas.',
                'Ajak anak membuka halaman buku karton tebal.',
                'Bermain memasukkan benda ke dalam lubang yang sesuai.',
            ],
            '18-24' => [
                'Bermain playdough - meremas, menekan, dan membentuk.',
                'Latih anak memegang sendok dan makan sendiri.',
                'Bermain menumpuk balok 4-6 tumpukan.',
            ],
            '24-36' => [
                'Ajak anak merangkai manik-manik besar atau makaroni.',
                'Latih memegang pensil dengan pegangan yang benar.',
                'Bermain menggunting kertas dengan gunting anak yang aman.',
            ],
            '36-48' => [
                'Ajak anak menggambar bentuk sederhana - lingkaran, garis.',
                'Latih mengancingkan baju dan menarik resleting.',
                'Bermain puzzle dengan kepingan lebih kecil.',
            ],
            '48-60' => [
                'Ajak anak menulis huruf namanya sendiri.',
                'Bermain menggunting mengikuti garis.',
                'Latih mengikat tali sepatu dengan bantuan.',
            ],
        ];
    }

    /**
     * Problem Solving domain recommendations (Pemecahan Masalah).
     */
    private function getProblemSolvingRecommendations(): array
    {
        return [
            '0-6' => [
                'Bermain petak-umpet dengan mainan - tutup dengan kain, buka kembali.',
                'Berikan mainan sebab-akibat seperti mainan yang berbunyi saat ditekan.',
                'Ajak bayi mengikuti benda bergerak dengan mata.',
            ],
            '6-12' => [
                'Bermain mencari mainan yang disembunyikan di bawah selimut.',
                'Berikan wadah dengan tutup untuk dibuka-tutup.',
                'Bermain memasukkan benda ke dalam wadah yang sesuai ukurannya.',
            ],
            '12-18' => [
                'Bermain puzzle sederhana dengan 2-3 keping.',
                'Ajak anak mencocokkan bentuk dengan lubangnya.',
                'Bermain menyortir benda berdasarkan warna.',
            ],
            '18-24' => [
                'Bermain puzzle 4-6 keping.',
                'Ajak anak mengelompokkan benda berdasarkan kategori (buah, hewan).',
                'Bermain menuang air atau pasir antar wadah.',
            ],
            '24-36' => [
                'Bermain menyortir benda berdasarkan ukuran (besar-kecil).',
                'Ajak anak menyelesaikan puzzle 8-12 keping.',
                'Bermain menghitung benda sampai 5.',
            ],
            '36-48' => [
                'Bermain permainan memori sederhana dengan kartu bergambar.',
                'Ajak anak mengurutkan benda dari kecil ke besar.',
                'Bermain mencocokkan pola sederhana.',
            ],
            '48-60' => [
                'Ajak anak memecahkan masalah sederhana - "Bagaimana caranya...?".',
                'Bermain permainan papan sederhana dengan aturan.',
                'Bermain menghitung dan mengenali angka sampai 10.',
            ],
        ];
    }

    /**
     * Personal-Social domain recommendations (Personal Sosial).
     */
    private function getPersonalSocialRecommendations(): array
    {
        return [
            '0-6' => [
                'Bermain ciluk-ba untuk membangun ikatan dan kepercayaan.',
                'Respon cepat saat bayi menangis untuk membangun rasa aman.',
                'Ajak bayi melihat wajah di cermin dan sebutkan bagian wajah.',
            ],
            '6-12' => [
                'Bermain tepuk tangan bersama dan permainan interaktif.',
                'Ajak bayi makan sendiri dengan finger food.',
                'Bermain dengan anak lain dalam pengawasan.',
            ],
            '12-18' => [
                'Ajak anak membantu tugas sederhana seperti meletakkan baju ke keranjang.',
                'Latih anak minum dari gelas dengan bantuan.',
                'Bermain pura-pura menyuapi boneka.',
            ],
            '18-24' => [
                'Ajak anak bermain di samping anak lain (parallel play).',
                'Latih melepas pakaian sederhana seperti kaus kaki.',
                'Bermain pura-pura masak-masakan.',
            ],
            '24-36' => [
                'Ajak anak bermain giliran - "Sekarang giliranmu, lalu giliranku".',
                'Latih anak memakai baju sendiri dengan bantuan.',
                'Bermain peran seperti dokter-dokteran atau sekolah-sekolahan.',
            ],
            '36-48' => [
                'Ajak anak bermain kooperatif dengan teman - membangun sesuatu bersama.',
                'Latih anak buang air di toilet secara mandiri.',
                'Ajarkan berbagi mainan dengan teman.',
            ],
            '48-60' => [
                'Ajak anak memilih pakaian sendiri dan berpakaian mandiri.',
                'Latih anak menyelesaikan konflik dengan kata-kata.',
                'Bermain permainan dengan aturan dan menerima kalah-menang.',
            ],
        ];
    }
}
