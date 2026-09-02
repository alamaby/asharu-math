# ⭐ Asharu Math

[![CI](https://github.com/alamaby/asharu-math/actions/workflows/ci.yml/badge.svg)](https://github.com/alamaby/asharu-math/actions/workflows/ci.yml)

Aplikasi web interaktif untuk membantu anak kelas 2 SD (usia 6–8 tahun) belajar
**penjumlahan dan pengurangan bersusun pendek** dengan teknik menyimpan (carry) dan
meminjam (borrow). Seluruh antarmuka menggunakan Bahasa Indonesia yang sederhana dan ramah anak.

## ✨ Fitur Utama

- **Mode Belajar langkah demi langkah** dengan maskot Asya: satu kotak aktif pada satu waktu, petunjuk bertahap, dan penjelasan meminjam/menyimpan.
- **Mode Latihan** dengan konfigurasi: jenis soal (tambah/kurang/campuran), jumlah digit (2–4), jumlah soal (5–20), dan kesulitan (tanpa/dengan menyimpan-meminjam).
- **Buat Soal Sendiri**: ketik dua angka dan kerjakan bersusun di layar.
- **Sapaan nama anak** (opsional, hanya tersimpan di perangkat) yang ikut pada kartu pencapaian saat dibagikan.
- **Berbagi pencapaian**: kartu gambar PNG 1080×1080 bernama anak (Web Share API dengan fallback unduh), tombol langsung WhatsApp/Facebook/X/Telegram, dan salin teks.
- **11 level bertahap + Level Tantangan** adaptif yang menyesuaikan kesulitan dengan performa anak.
- **9 pencapaian (achievement)** yang bisa dibagikan lewat Web Share API dengan fallback "Salin Pencapaian".
- **Progres tersimpan lokal** (localStorage) — tanpa server, tanpa akun, tanpa data pribadi anak.
- **Susunan angka dijamin akurat**: operand tidak pernah tertukar, digit tidak pernah terbalik (26 tetap 26, bukan 62), dan operator `+`/`−` selalu di sebelah kanan baris kedua.

## 🧰 Tech Stack

| Bagian      | Teknologi                                                            |
| ----------- | -------------------------------------------------------------------- |
| UI          | React 18 + TypeScript (strict)                                       |
| Build       | Vite 6                                                               |
| Styling     | Tailwind CSS v4                                                      |
| Unit test   | Vitest + @testing-library/react + jsdom                              |
| Kualitas    | ESLint 9 (flat config) + Prettier + CI GitHub Actions (Node 20 & 22) |
| PWA         | vite-plugin-pwa (manifest + service worker auto-update, offline)     |
| Penyimpanan | localStorage (terversi + validasi + fallback)                        |

Tidak ada backend, tidak ada API berbayar, tidak ada environment variable.

## 🌐 Dua Bahasa

Antarmuka tersedia dalam **Bahasa Indonesia** (default) dan **English**. Ganti bahasa kapan saja
melalui **Pengaturan → Bahasa** — perubahan langsung berlaku di seluruh aplikasi, termasuk
instruksi langkah belajar dan kartu pencapaian. Preferensi tersimpan di perangkat.

## 📲 Pasang di Smartphone

Aplikasi ini adalah **PWA** — bisa dipasang seperti aplikasi dan berjalan offline:

- **Android (Chrome/Edge/Samsung Internet)**: buka [math.asharu.id](https://math.asharu.id), tekan tombol **📲 Pasang Aplikasi** di halaman utama, konfirmasi dialog peramban.
- **iPhone/iPad (Safari)**: buka situsnya, tekan tombol **Bagikan**, lalu pilih **Tambahkan ke Layar Utama** (petunjuk ringkas juga tampil di halaman utama).
- Setelah terpasang: ikon bintang muncul di layar utama, aplikasi terbuka layar penuh tanpa bilah peramban, dan tetap berfungsi tanpa internet.
- Pembaruan diterapkan otomatis saat kunjungan berikutnya (service worker `autoUpdate`).

Regenerasi ikon PWA setelah mengubah logo:

```bash
npm run icons   # butuh sharp; hasil di public/icons/
```

## 📦 Instalasi Lokal

Prasyarat: Node.js 18+ dan npm.

```bash
npm install
```

## 🚀 Menjalankan Aplikasi

```bash
npm run dev
```

Buka URL yang tertera (biasanya http://localhost:5173).

## 🧪 Menjalankan Unit Test

```bash
npm test        # sekali jalan
npm run test:watch   # mode pantau
```

## 🔍 Kualitas Kode

```bash
npm run lint          # ESLint atas seluruh repo
npm run lint:fix      # ESLint dengan perbaikan otomatis
npm run format        # Prettier tulis ulang format
npm run format:check  # Prettier cek tanpa menulis
npm run typecheck     # tsc --noEmit
```

CI GitHub Actions (`.github/workflows/ci.yml`) menjalankan `format:check → lint → typecheck → test → build`
pada setiap push ke `main` dan setiap pull request, dengan matrix Node.js 20 dan 22.

## 🏗️ Production Build

```bash
npm run build     # pemeriksaan tsc + build Vite
npm run preview   # pratayang hasil build di http://localhost:4173
```

## ☁️ Deployment ke Vercel

1. Push repositori ini ke GitHub.
2. Buka [vercel.com/new](https://vercel.com/new) lalu impor repositorinya.
3. Vercel otomatis mendeteksi Vite (Framework Preset: **Vite**, Build Command: `npm run build`, Output Directory: `dist`).
4. Klik **Deploy** — selesai, tanpa environment variable apa pun.

### Domain kustom `math.asharu.id`

1. Di dashboard Vercel proyek ini, buka **Settings → Domains → Add** dan masukkan `math.asharu.id`.
2. Pada pengelola DNS pemilik `asharu.id`, tambahkan record:
   `CNAME math → cname.vercel-dns.com`
3. Tunggu propagasi DNS (biasanya beberapa menit sampai beberapa jam); Vercel otomatis menerbitkan SSL.
4. Aplikasi kanonik berjalan di **https://math.asharu.id** — seluruh tautan berbagi pencapaian (WhatsApp, Facebook, X, Telegram) dan meta Open Graph sudah memakai alamat ini.

Alternatif CLI:

```bash
npm i -g vercel
vercel          # deploy pra-produksi
vercel --prod   # deploy produksi
```

## 💰 Monetisasi (Google AdSense)

Aplikasi ini **child-directed** (anak SD): iklan hanya kontekstual non-personalized, tanpa profil
minat, tanpa remarketing. Zona bebas iklan total selama anak mengerjakan soal (Learn & Practice) —
slot hanya muncul di bagian bawah Home, Belajar, Pencapaian, dan Hasil.

### Langkah 1 — Aktifkan di dashboard AdSense (wajib sebelum membuat unit)

1. Buka [adsense.google.com](https://adsense.google.com) → **Sites → Add site** → masukkan
   `math.asharu.id` → ikuti proses verifikasi (tempel snippet `ads.txt` / meta bila diminta).
2. Setelah situs terverifikasi, buka **Sites → math.asharu.id → ⋮ → Settings**:
   - Aktifkan **"Tag for age treatment (TFAT) = Child"** (menggantikan TFUA/TFCD yang sudah deprecated — lihat https://support.google.com/adsense/answer/3248194 dan https://support.google.com/adsense/answer/9007197). Nilai `TFAT=1` setara child-directed, menonaktifkan personalized/remarketing. ← WAJIB, aplikasi anak.
   - Pastikan **Personalized ads = Off** untuk situs ini (otomatis off saat TFAT=1, tapi verifikasi tetap).
3. **Ads → By site**: pastikan **Auto ads = Off** untuk situs ini (Auto Ads bisa menyuntikkan
   anchor/vignette yang mengganggu anak).
4. Di **Privacy & messaging**, tidak perlu CMP GDPR karena iklan sudah non-personalized (TFAT child). Di level kode, setiap slot sudah mengirim `data-tag-for-age-treatment="1"` via `src/components/common/AdSlot.tsx:84` — ini precedence atas setting site-level.

### Langkah 2 — Buat 4 ad unit display responsif ✅ (sudah dibuat)

Buka **Ads → By ad unit → Display ads**, buat unit berikut satu per satu. Untuk setiap unit (unit produksi sudah ada — lihat nilai Langkah 3):

1. Klik **Create new ad unit → pilih jenis "Display ads"**.
2. Beri **nama** sesuai tabel (nama bebas, tapi samakan agar mudah dicocokkan):
   | #   | Nama unit di dashboard       | Penempatan di aplikasi  | Slot produksi |
   | --- | ---------------------------- | ----------------------- | ------------- |
   | 1   | `asharu-home-bottom`         | Bawah halaman Home      | `9803844531`  |
   | 2   | `asharu-levels-bottom`       | Bawah daftar level      | `9602815350`  |
   | 3   | `asharu-achievements-bottom` | Bawah daftar pencapaian | `8289733684`  |
   | 4   | `asharu-result-bottom`       | Bawah layar hasil sesi  | `3182595864`  |
3. **Ad size**: biarkan default **"Responsive"** (disarankan; slot aplikasi sudah full-width).
4. Biarkan opsi lain default → klik **Create**.
5. Setiap unit yang dibuat menampilkan potongan kode berisi dua nilai — catat:
   - `data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"` → publisher ID (sama untuk semua unit)
   - `data-ad-slot="YYYYYYYYYY"` → angka 10 digit unik per unit

### Langkah 3 — Isi `.env.local`

```bash
cp .env.example .env.local
# lalu isi dengan nilai dari Langkah 2 (nilai produksi aktif):
VITE_ADSENSE_CLIENT=ca-pub-4082765898994990
VITE_ADSENSE_SLOT_HOME=9803844531          # asharu-home-bottom
VITE_ADSENSE_SLOT_LEVELS=9602815350        # asharu-levels-bottom
VITE_ADSENSE_SLOT_ACHIEVEMENTS=8289733684  # asharu-achievements-bottom
VITE_ADSENSE_SLOT_RESULT=3182595864        # asharu-result-bottom
```

> File `.env*.local` sengaja tidak di-commit. Untuk deploy Vercel, isi variabel yang sama pada
> **Project → Settings → Environment Variables**.

### Langkah 4 — `public/ads.txt` ✅ (sudah terisi)

File sudah berisi publisher ID produksi:
`google.com, pub-4082765898994990, DIRECT, f08c47fec0942fa0`.
Setelah deploy, verifikasi di `math.asharu.id/ads.txt` dan tunggu status "Authorized" pada
dashboard AdSense (biasanya beberapa hari).

### Langkah 5 — Deploy & verifikasi

1. Deploy ke Vercel (`vercel --prod`) — env var produksi harus sudah terisi.
2. Buka `math.asharu.id/ads.txt` → pastikan isinya benar.
3. Slot iklan akan tampil (biasanya butuh beberapa menit–jam) di bagian bawah 4 halaman.
4. Cek **Ads → Sites** di dashboard: status situs dan unit menjadi "Active".

> Catatan: karena child-directed, pendapatan per tayang lebih rendah dibanding situs biasa —
> ini konsekuensi memilih mode paling aman untuk anak.

## 🏛️ Arsitektur Singkat

```
src/
  types/        Tipe data inti (MathProblem, LearningStep, Level, UserProgress, ...)
  lib/          Logika murni tanpa UI — mudah diuji terpisah
    placeValue.ts       Mapping digit → kolom nilai tempat (kiri-ke-kanan, tanpa reverse())
    arithmetic.ts       Rencana carry & borrow per kolom (dihitung kanan-ke-kiri)
    problemGenerator.ts Generator soal dengan jaminan carry/borrow sesuai konfigurasi
    learningSteps.ts    Pembangun langkah belajar per soal (state machine)
    validation.ts       Pemeriksaan jawaban per kolom + petunjuk bertahap
    storage.ts          localStorage terversi: validasi bentuk + fallback data rusak
    achievements.ts     Definisi & evaluasi achievement
    share.ts            Web Share API + fallback clipboard
    socialShare.ts      Tautan berbagi WhatsApp/Facebook/X/Telegram
    shareImage.ts       Kartu pencapaian 1080x1080 (canvas → PNG) bernama anak
    site.ts             URL kanonik math.asharu.id
    sound.ts            Efek suara ringan via Web Audio (tanpa file aset)
    scoring.ts          Perhitungan bintang
  data/levels.ts  Definisi Level 1–11 + Level Tantangan adaptif
  components/
    math/         VerticalMathProblem (CSS Grid), DigitCell, OperatorCell,
                  CarryCell, BorrowCell, AnswerCell, PlaceValueHeader
    guide/        StepGuide, HintPanel, FeedbackMessage, ProgressBar
    input/        NumericKeypad (tombol ≥ 44px, inputMode numeric)
    layout/       AppHeader, BottomNavigation, Mascot, MascotBubble
    achievement/  AchievementCard, ShareAchievement
    common/       ConfirmDialog
  screens/       Home, LevelSelect, Learn (step-by-step), Practice, Result,
                  Achievements, Settings
  state/         NavigationContext (navigasi ringan), ProgressContext (progres + localStorage)
```

### Jaminan susunan angka (aturan kritis)

- Operand disimpan sebagai string urutan asli (`"26"`, `"87"`); tampilan dipetakan **kiri ke kanan** tanpa `reverse()`.
- Perhitungan carry/borrow berjalan **kanan ke kiri** di `arithmetic.ts`, sepenuhnya terpisah dari jalur tampilan.
- Soal dirender dengan satu **CSS Grid** yang kolomnya dipasang eksplisit (`gridColumn`/`gridRow`) sehingga satuan selalu lurus dengan satuan pada semua lebar layar.
- Simbol operator menempati **kolom khusus paling kanan** pada baris operand kedua, tidak pernah masuk kolom digit.
- Kotak simpan berada **di atas kolom tujuan** (carry dari satuan → kotak simpan di atas puluhan).
- Hasil tanpa leading zero: kolom ribuan kosong ditampilkan redup/kosong, bukan angka 0.

### Aksesibilitas

- Semua kotak adalah tombol berlabel ARIA — keyboard huruf perangkat tidak pernah muncul; input via keyboard angka aplikasi atau keyboard fisik (0–9, Backspace, Enter).
- Umpan balik diumumkan lewat `aria-live="polite"`.
- Fokus keyboard jelas, urutan tab mengikuti urutan pengerjaan, dukungan `prefers-reduced-motion` + saklar animasi.

## 🔒 Privasi

Semua progres (level, skor, achievement, preferensi) hanya tersimpan di `localStorage` perangkat.
Aplikasi tidak meminta dan tidak menyimpan nama, foto, lokasi, atau data pribadi anak lainnya.
