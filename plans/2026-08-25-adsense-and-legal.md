# Plan: Google AdSense + Terms of Service + Privacy Policy

Created: 2026-08-25 21:30:00

## Objective
Menyiapkan monetisasi Google AdSense yang aman untuk anak (child-directed, iklan kontekstual non-personalized) dengan dokumen hukum bilingual sebagai prasyarat pendaftaran, komponen AdSlot non-intrusif, dan dokumentasi lengkap pembuatan ad unit di dashboard AdSense.

## Prinsip Terkunci (keputusan user)
1. Publisher ID sudah ada → dikirim via `.env.local` (tidak di-commit); tanpa var semua slot no-op.
2. Zona bebas iklan total saat pengerjaan soal (Learn/Practice). Slot hanya: Home-bottom, LevelSelect-bottom, Achievements-bottom, Result-bottom.
3. Dokumen legal pakai placeholder `[NAMA PEMILIK]` / `[EMAIL KONTAK]`.
4. Legal bilingual via sistem i18n.

## Milestones & Tasks

### Phase 1 — Halaman Legal (prasyarat apply AdSense)
- [x] `src/content/legal.ts`: Privacy Policy & Terms bilingual terstruktur (placeholder pemilik/email)
- [x] Screen `privacy` & `terms` + `LegalScreen`; tautan dari Settings (seksi ⚖️ Legal) & footer Home; dict keys

### Phase 2 — Infrastruktur Adsense
- [x] `.env.example`; .gitignore kini mengecualikan .env/.env.* kecuali example
- [x] `src/lib/env.ts`: lazy validation ca-pub & slot map per penempatan
- [x] `src/lib/adsense.ts`: loader sekali-jalur bertipe + requestAd
- [x] `public/ads.txt` placeholder pub-0000…

### Phase 3 — Komponen AdSlot
- [x] Lazy IO (rootMargin 200px), reserved min-height, ARIA 'Iklan', no-op offline/tanpa config
- [x] Stub IntersectionObserver di tests/setup.ts

### Phase 4 — Penempatan
- [x] Home/LevelSelect/Achievements/Result-bottom; nol di Learn/Practice

### Phase 5 — Tests & dokumentasi
- [x] Tests: isValidClient, AdSlot no-op/render-atribut/slot-lain, legal ID+EN+navigasi probe — total 183 test / 25 file
- [x] README seksi "💰 Monetisasi": 5 langkah lengkap (aktifkan situs → TFUA child-directed + non-personalized + Auto Ads off → buat 4 display responsive unit bernama asharu-*-bottom dan catat data-ad-slot → isi .env.local/Vercel env → perbaiki ads.txt → deploy & verifikasi)
- [x] Memory entry

## Risks
- Persetujuan Google butuh waktu — slot aman no-op tanpa konfigurasi.
- RPM lebih rendah karena non-personalized — konsekuensi child-directed.
- Workbox SW hanya precache aset build; pagead eksternal network-only.

## Progress Log
- 2026-08-25 21:30:00 — Plan dibuat setelah analisa dan keputusan user (publisher ID siap, zona bebas iklan penuh, legal placeholder, bilingual).
- 2026-08-26 09:10:00 — Seluruh fase selesai. Verifikasi: format ✅ lint ✅ typecheck ✅ 183/183 test ✅ build ✅ (dist memuat ads.txt). Catatan: tipe window.adsbygoogle = object[]; IO stub wajib di setup.ts; slot no-op tanpa env.
