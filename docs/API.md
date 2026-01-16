# API Documentation - NAKES / JagoanBunda

Dokumentasi API untuk backend aplikasi mobile **NAKES / JagoanBunda**. Aplikasi ini digunakan untuk pelacakan kesehatan anak, pemantauan pertumbuhan, dan skrining perkembangan.

## Dasar (Base URL)

Semua endpoint API diawali dengan path berikut:
```text
/api/v1
```

## Autentikasi

Aplikasi ini menggunakan **Laravel Sanctum** untuk autentikasi. Sebagian besar endpoint memerlukan token Bearer yang valid.

### Mendapatkan Token
Token diperoleh melalui endpoint `/auth/login` atau `/auth/register`.

### Menggunakan Token
Sertakan token dalam header `Authorization` pada setiap permintaan yang memerlukan autentikasi:

```text
Authorization: Bearer {your_access_token}
```

## Format Respon Kesalahan

Permintaan yang gagal akan mengembalikan kode status HTTP yang sesuai (4xx atau 5xx) dan badan respon JSON dengan pesan kesalahan.

### Kesalahan Umum
```json
{
  "message": "Pesan kesalahan yang menjelaskan apa yang salah."
}
```

### Kesalahan Validasi (422)
```json
{
  "message": "Data yang diberikan tidak valid.",
  "errors": {
    "field_name": [
      "Pesan kesalahan validasi pertama",
      "Pesan kesalahan validasi kedua"
    ]
  }
}
```

## Daftar Endpoint

---

### Autentikasi (`/auth`)

#### POST /auth/register
Mendaftarkan pengguna baru.

- **Autentikasi Diperlukan:** Tidak
- **Parameter Body:**
  - `name` (string, required): Nama lengkap pengguna.
  - `email` (string, required): Alamat email unik.
  - `password` (string, required): Minimal 8 karakter.
  - `password_confirmation` (string, required): Harus sama dengan password.
  - `phone` (string, optional): Nomor telepon pengguna.
- **Respon Berhasil (201 Created):**
  ```json
  {
    "message": "Registrasi berhasil",
    "user": {
      "id": 1,
      "name": "Bunda Hebat",
      "email": "bunda@example.com",
      "phone": "08123456789",
      "avatar_url": null,
      "push_notifications": true,
      "weekly_report": true,
      "created_at": "2026-01-17T10:00:00Z"
    },
    "token": "1|abcdef123456..."
  }
  ```

#### POST /auth/login
Masuk ke aplikasi dan mendapatkan token akses.

- **Autentikasi Diperlukan:** Tidak
- **Parameter Body:**
  - `email` (string, required): Email terdaftar.
  - `password` (string, required): Password akun.
  - `revoke_others` (boolean, optional): Jika true, semua token aktif lainnya akan dihapus.
- **Respon Berhasil (200 OK):**
  ```json
  {
    "message": "Login berhasil",
    "user": { ... },
    "token": "2|ghjkl7890..."
  }
  ```

#### POST /auth/logout
Mengakhiri sesi dan mencabut token saat ini.

- **Autentikasi Diperlukan:** Ya
- **Respon Berhasil (200 OK):**
  ```json
  {
    "message": "Logout berhasil"
  }
  ```

#### POST /auth/refresh
Mencabut token saat ini dan membuat token baru.

- **Autentikasi Diperlukan:** Ya
- **Respon Berhasil (200 OK):**
  ```json
  {
    "message": "Token berhasil diperbarui",
    "token": "3|qwertyuiop..."
  }
  ```

#### GET /auth/me
Mendapatkan profil pengguna yang sedang login.

- **Autentikasi Diperlukan:** Ya
- **Respon Berhasil (200 OK):**
  ```json
  {
    "user": {
      "id": 1,
      "name": "Bunda Hebat",
      "email": "bunda@example.com",
      ...
    }
  }
  ```

#### PUT /auth/profile
Memperbarui profil pengguna.

- **Autentikasi Diperlukan:** Ya
- **Parameter Body:**
  - `name` (string, optional)
  - `phone` (string, optional)
  - `avatar_url` (url, optional)
  - `push_notifications` (boolean, optional)
  - `weekly_report` (boolean, optional)
- **Respon Berhasil (200 OK):**
  ```json
  {
    "message": "Profil berhasil diperbarui",
    "user": { ... }
  }
  ```

---

### Anak (`/children`)

#### GET /children
Mendapatkan daftar anak yang dimiliki pengguna.

- **Autentikasi Diperlukan:** Ya
- **Parameter Query:**
  - `active_only` (any, optional): Jika ada, hanya menampilkan anak yang aktif.
- **Respon Berhasil (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Si Buah Hati",
      "birthday": "2024-01-01",
      "gender": "male",
      "avatar_url": "https://example.com/photo.jpg",
      "age": {
        "months": 24,
        "days": 730,
        "label": "2 tahun"
      },
      ...
    }
  ]
  ```

#### POST /children
Menambahkan data anak baru.

- **Autentikasi Diperlukan:** Ya
- **Parameter Body:**
  - `name` (string, required)
  - `birthday` (date, required): Format YYYY-MM-DD.
  - `gender` (string, required): 'male' atau 'female'.
  - `avatar_url` (url, optional)
  - `birth_weight` (numeric, optional): Dalam kg (0.5 - 10).
  - `birth_height` (numeric, optional): Dalam cm (20 - 70).
  - `head_circumference` (numeric, optional): Dalam cm (20 - 50).
- **Respon Berhasil (201 Created):**
  ```json
  {
    "message": "Data anak berhasil ditambahkan",
    "child": { ... }
  }
  ```

#### GET /children/{child}
Mendapatkan detail data anak.

- **Autentikasi Diperlukan:** Ya
- **Respon Berhasil (200 OK):**
  ```json
  {
    "child": { ... }
  }
  ```

#### PUT /children/{child}
Memperbarui data anak.

- **Autentikasi Diperlukan:** Ya
- **Parameter Body:** Sama dengan POST /children (semua bersifat opsional).
- **Respon Berhasil (200 OK):**
  ```json
  {
    "message": "Data anak berhasil diperbarui",
    "child": { ... }
  }
  ```

#### DELETE /children/{child}
Menghapus data anak (soft delete).

- **Autentikasi Diperlukan:** Ya
- **Respon Berhasil (200 OK):**
  ```json
  {
    "message": "Data anak berhasil dihapus"
  }
  ```

#### GET /children/{child}/summary
Mendapatkan ringkasan kesehatan anak termasuk pengukuran terakhir dan skrining terbaru.

- **Autentikasi Diperlukan:** Ya
- **Respon Berhasil (200 OK):**
  ```json
  {
    "child": { ... },
    "age": { "months": 24, "days": 730 },
    "latest_measurement": {
      "date": "2025-12-30",
      "weight": 12.5,
      "height": 85.0,
      "nutritional_status": "Gizi Baik",
      "stunting_status": "Normal",
      "wasting_status": "Gizi Baik"
    },
    "latest_screening": {
      "date": "2025-11-15",
      "overall_status": "sesuai"
    },
    "today_nutrition": {
      "calories": 450.5,
      "protein": 15.2,
      "carbohydrate": 60.0,
      "fat": 12.5
    }
  }
  ```

---

### Antropometri (`/children/{child}/anthropometry`)

#### GET /children/{child}/anthropometry
Daftar riwayat pengukuran pertumbuhan anak.

- **Autentikasi Diperlukan:** Ya
- **Parameter Query:**
  - `per_page` (integer, optional): Default 20.
- **Respon Berhasil (200 OK):**
  ```json
  {
    "data": [
      {
        "id": 1,
        "measurement_date": "2025-12-30",
        "weight": 12.5,
        "height": 85.0,
        "head_circumference": 48.0,
        "bmi": 17.3,
        "z_scores": {
          "weight_for_age": 0.5,
          "height_for_age": -0.2,
          ...
        },
        "status": {
          "nutritional": "Gizi Baik",
          "stunting": "Normal",
          "wasting": "Gizi Baik"
        }
      }
    ],
    "links": { ... },
    "meta": { ... }
  }
  ```

#### POST /children/{child}/anthropometry
Mencatat pengukuran baru. Z-Score dan status gizi akan dihitung otomatis.

- **Autentikasi Diperlukan:** Ya
- **Parameter Body:**
  - `measurement_date` (date, required): Format YYYY-MM-DD.
  - `weight` (numeric, required): Dalam kg (1 - 100).
  - `height` (numeric, required): Dalam cm (30 - 200).
  - `head_circumference` (numeric, optional): Dalam cm (20 - 60).
  - `is_lying` (boolean, optional): Pengukuran dilakukan sambil berbaring.
  - `measurement_location` (string, optional): 'posyandu', 'home', 'clinic', 'hospital', 'other'.
  - `notes` (string, optional)
- **Respon Berhasil (201 Created):**
  ```json
  {
    "message": "Data pengukuran berhasil ditambahkan",
    "measurement": { ... }
  }
  ```

#### GET /children/{child}/anthropometry/{anthropometry}
Mendapatkan detail satu catatan pengukuran.

- **Autentikasi Diperlukan:** Ya

#### PUT /children/{child}/anthropometry/{anthropometry}
Memperbarui catatan pengukuran.

- **Autentikasi Diperlukan:** Ya

#### DELETE /children/{child}/anthropometry/{anthropometry}
Menghapus catatan pengukuran.

- **Autentikasi Diperlukan:** Ya

#### GET /children/{child}/growth-chart
Mendapatkan data untuk grafik pertumbuhan (berat/usia, tinggi/usia, BMI/usia).

- **Autentikasi Diperlukan:** Ya
- **Respon Berhasil (200 OK):**
  ```json
  {
    "child": { "id": 1, "name": "...", "gender": "...", "birthday": "..." },
    "measurements": [
      {
        "date": "2025-12-30",
        "age_months": 24,
        "weight": 12.5,
        "height": 85.0,
        "weight_for_age_zscore": 0.5,
        ...
      }
    ]
  }
  ```

---

### Makanan (`/foods`)

#### GET /foods
Mendapatkan daftar makanan (sistem + custom pengguna).

- **Autentikasi Diperlukan:** Ya
- **Parameter Query:**
  - `search` (string, optional): Cari berdasarkan nama.
  - `category` (string, optional): Filter kategori.
  - `per_page` (integer, optional)
- **Respon Berhasil (200 OK):**
  ```json
  {
    "data": [
      {
        "id": 1,
        "name": "Nasi Putih",
        "category": "Karbohidrat",
        "serving_size": 100,
        "nutrition": {
          "calories": 130,
          "protein": 2.7,
          "fat": 0.3,
          "carbohydrate": 28.2
        },
        "is_system": true
      }
    ]
  }
  ```

#### POST /foods
Membuat data makanan kustom sendiri.

- **Autentikasi Diperlukan:** Ya
- **Parameter Body:**
  - `name` (string, required)
  - `category` (string, required)
  - `serving_size` (numeric, required): Ukuran porsi (misal: 100).
  - `calories` (numeric, required): Dalam kkal.
  - `protein` (numeric, required): Dalam gram.
  - `fat` (numeric, required): Dalam gram.
  - `carbohydrate` (numeric, required): Dalam gram.
  - `fiber` (numeric, optional)
  - `sugar` (numeric, optional)
- **Respon Berhasil (201 Created):**
  ```json
  {
    "message": "Makanan berhasil ditambahkan",
    "food": { ... }
  }
  ```

#### GET /foods/{food}
Detail makanan.

- **Autentikasi Diperlukan:** Ya

#### PUT /foods/{food}
Memperbarui makanan kustom (hanya untuk makanan buatan sendiri).

- **Autentikasi Diperlukan:** Ya

#### DELETE /foods/{food}
Menghapus makanan kustom (hanya untuk makanan buatan sendiri).

- **Autentikasi Diperlukan:** Ya

#### GET /foods-categories
Mendapatkan daftar semua kategori makanan yang tersedia.

- **Autentikasi Diperlukan:** Ya

---

### Log Makanan (`/children/{child}/food-logs`)

#### GET /children/{child}/food-logs
Daftar riwayat makan anak.

- **Autentikasi Diperlukan:** Ya
- **Parameter Query:**
  - `start_date` (date, optional)
  - `end_date` (date, optional)
  - `meal_time` (string, optional): 'breakfast', 'lunch', 'dinner', 'snack'.
- **Respon Berhasil (200 OK):**
  ```json
  {
    "data": [
      {
        "id": 1,
        "log_date": "2026-01-17",
        "meal_time": "breakfast",
        "meal_time_label": "Sarapan",
        "totals": {
          "calories": 350.0,
          "protein": 12.5,
          ...
        },
        "items": [
          {
            "food": { "name": "Bubur Ayam", ... },
            "quantity": 1,
            "nutrition": { ... }
          }
        ]
      }
    ]
  }
  ```

#### POST /children/{child}/food-logs
Mencatat aktivitas makan.

- **Autentikasi Diperlukan:** Ya
- **Parameter Body:**
  - `log_date` (date, required)
  - `meal_time` (string, required): 'breakfast', 'lunch', 'dinner', 'snack'.
  - `notes` (string, optional)
  - `items` (array, required): Minimal 1 item.
    - `items[].food_id` (integer, required)
    - `items[].quantity` (numeric, required): Jumlah porsi.
    - `items[].serving_size` (numeric, optional): Ukuran porsi kustom.
- **Respon Berhasil (201 Created):**
  ```json
  {
    "message": "Log makanan berhasil ditambahkan",
    "food_log": { ... }
  }
  ```

#### GET /children/{child}/food-logs/{foodLog}
Detail log makanan tertentu.

- **Autentikasi Diperlukan:** Ya

#### PUT /children/{child}/food-logs/{foodLog}
Memperbarui log makanan.

- **Autentikasi Diperlukan:** Ya

#### DELETE /children/{child}/food-logs/{foodLog}
Menghapus log makanan.

- **Autentikasi Diperlukan:** Ya

#### GET /children/{child}/nutrition-summary
Mendapatkan ringkasan asupan nutrisi untuk periode tertentu.

- **Autentikasi Diperlukan:** Ya
- **Parameter Query:**
  - `period` (string, optional): 'day', 'week', 'month'. Default 'day'.
  - `date` (date, optional): Tanggal acuan. Default hari ini.
- **Respon Berhasil (200 OK):**
  ```json
  {
    "period": "day",
    "start_date": "2026-01-17",
    "end_date": "2026-01-17",
    "totals": {
      "calories": 1200.5,
      "protein": 45.0,
      ...
    },
    "by_meal_time": {
      "breakfast": { "calories": 350, ... },
      ...
    }
  }
  ```

---

### ASQ-3 Data Master (`/asq3`)

#### GET /asq3/domains
Daftar ranah perkembangan dalam ASQ-3 (Komunikasi, Motorik Kasar, dll).

- **Autentikasi Diperlukan:** Ya

#### GET /asq3/age-intervals
Daftar interval usia untuk kuesioner ASQ-3.

- **Autentikasi Diperlukan:** Ya

#### GET /asq3/age-intervals/{interval}/questions
Daftar pertanyaan untuk interval usia tertentu.

- **Autentikasi Diperlukan:** Ya

#### GET /asq3/recommendations
Daftar rekomendasi berdasarkan hasil skrining.

- **Autentikasi Diperlukan:** Ya
- **Parameter Query:**
  - `domain_id` (integer, optional)
  - `age_interval_id` (integer, optional)

---

### Skrining ASQ-3 (`/children/{child}/screenings`)

#### GET /children/{child}/screenings
Riwayat skrining perkembangan anak.

- **Autentikasi Diperlukan:** Ya

#### POST /children/{child}/screenings
Memulai sesi skrining baru. Sistem akan otomatis memilih kuesioner berdasarkan usia anak.

- **Autentikasi Diperlukan:** Ya
- **Parameter Body:**
  - `screening_date` (date, optional)
  - `notes` (string, optional)
- **Respon Berhasil (201 Created):**
  ```json
  {
    "message": "Screening baru berhasil dibuat",
    "screening": {
      "id": 5,
      "status": "in_progress",
      "age_interval": { "age_label": "24 Bulan", ... }
    }
  }
  ```

#### GET /children/{child}/screenings/{screening}
Detail sesi skrining.

- **Autentikasi Diperlukan:** Ya

#### PUT /children/{child}/screenings/{screening}
Memperbarui informasi atau status skrining.

- **Autentikasi Diperlukan:** Ya
- **Parameter Body:**
  - `notes` (string, optional)
  - `status` (string, optional): 'in_progress', 'cancelled'.

#### POST /children/{child}/screenings/{screening}/answers
Mengirim jawaban untuk pertanyaan skrining. Jika semua pertanyaan terjawab, status akan berubah menjadi 'completed' secara otomatis.

- **Autentikasi Diperlukan:** Ya
- **Parameter Body:**
  - `answers` (array, required)
    - `answers[].question_id` (integer, required)
    - `answers[].answer` (string, required): 'yes', 'sometimes', 'no'.
- **Respon Berhasil (200 OK):**
  ```json
  {
    "message": "Jawaban berhasil disimpan",
    "screening": { ... }
  }
  ```

#### GET /children/{child}/screenings/{screening}/results
Mendapatkan hasil interpretasi skor skrining.

- **Autentikasi Diperlukan:** Ya
- **Respon Berhasil (200 OK):**
  ```json
  {
    "screening": { "overall_status": "sesuai", ... },
    "results": [
      {
        "domain": { "name": "Komunikasi", ... },
        "total_score": 55.0,
        "status": "sesuai",
        "status_label": "Sesuai Harapan"
      }
    ],
    "recommendations": [ ... ]
  }
  ```

---

### PMT (Pemberian Makanan Tambahan) (`/pmt`)

#### GET /pmt/menus
Daftar menu PMT yang tersedia.

- **Autentikasi Diperlukan:** Ya
- **Parameter Query:**
  - `age_months` (integer, optional): Filter menu berdasarkan usia anak.

#### GET /children/{child}/pmt-schedules
Daftar jadwal PMT untuk anak.

- **Autentikasi Diperlukan:** Ya
- **Parameter Query:**
  - `start_date` (date, optional)
  - `end_date` (date, optional)

#### POST /children/{child}/pmt-schedules
Membuat jadwal PMT untuk anak.

- **Autentikasi Diperlukan:** Ya
- **Parameter Body:**
  - `menu_id` (integer, required)
  - `scheduled_date` (date, required)

#### GET /children/{child}/pmt-progress
Statistik kepatuhan dan progres konsumsi PMT.

- **Autentikasi Diperlukan:** Ya
- **Parameter Query:**
  - `start_date` (date, optional)
  - `end_date` (date, optional)

#### POST /pmt-schedules/{schedule}/log
Mencatat realisasi konsumsi PMT dari jadwal yang ada.

- **Autentikasi Diperlukan:** Ya
- **Parameter Body:**
  - `portion` (string, required): 'habis', 'half', 'quarter', 'none'.
  - `photo_url` (url, optional): Foto bukti konsumsi.
  - `notes` (string, optional)

#### PUT /pmt-schedules/{schedule}/log
Memperbarui catatan realisasi PMT.

- **Autentikasi Diperlukan:** Ya

---

### Notifikasi (`/notifications`)

#### GET /notifications
Daftar notifikasi untuk pengguna.

- **Autentikasi Diperlukan:** Ya
- **Parameter Query:**
  - `unread_only` (boolean, optional)
  - `type` (string, optional)
  - `per_page` (integer, optional)

#### GET /notifications/unread-count
Jumlah notifikasi yang belum dibaca.

- **Autentikasi Diperlukan:** Ya

#### PUT /notifications/{notification}/read
Menandai satu notifikasi sebagai sudah dibaca.

- **Autentikasi Diperlukan:** Ya

#### POST /notifications/read-all
Menandai semua notifikasi sebagai sudah dibaca.

- **Autentikasi Diperlukan:** Ya

#### DELETE /notifications/{notification}
Menghapus satu notifikasi.

- **Autentikasi Diperlukan:** Ya

---

## Kode Status HTTP Umum

| Kode | Nama | Deskripsi |
|------|------|-----------|
| 200 | OK | Permintaan berhasil. |
| 201 | Created | Sumber daya baru berhasil dibuat. |
| 401 | Unauthorized | Token autentikasi hilang atau tidak valid. |
| 403 | Forbidden | Pengguna tidak memiliki izin untuk mengakses sumber daya ini. |
| 404 | Not Found | Sumber daya yang diminta tidak ditemukan. |
| 422 | Unprocessable Entity | Kesalahan validasi pada parameter yang dikirim. |
| 500 | Internal Server Error | Terjadi kesalahan pada server. |

## Contoh Header Permintaan

```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer 12|mYpErSoNaLtOkEnHeRe...
```
