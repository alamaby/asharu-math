# ⭐ Asharu Math

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

| Bagian | Teknologi |
| --- | --- |
| UI | React 18 + TypeScript (strict) |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 |
| Unit test | Vitest + @testing-library/react + jsdom |
| Penyimpanan | localStorage (terversi + validasi + fallback) |

Tidak ada backend, tidak ada API berbayar, tidak ada environment variable.

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
