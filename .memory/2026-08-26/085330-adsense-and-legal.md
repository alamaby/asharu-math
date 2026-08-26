# Google AdSense + Legal Pages

Date: 2026-08-26 08:53:30 (+0700)

## Task / Problem
Menyiapkan monetisasi AdSense aman-anak (TFUA, kontekstual) + dokumen hukum bilingual sebagai prasyarat pendaftaran. Plan: `plans/2026-08-25-adsense-and-legal.md`.

## Key Files Changed
- Legal: `src/content/legal.ts` (Privacy+Terms bilingual, placeholder [NAMA PEMILIK]/[EMAIL KONTAK]); `src/screens/LegalScreen.tsx`; NavigationContext +screen privacy/terms; App router; Settings seksi ⚖️ Legal; footer Home; dict legal.* home.footerRights ads.label settings.legalSection.
- Ads infra: `src/lib/env.ts` (lazy validation ca-pub & slot map), `src/lib/adsense.ts` (loader+requestAd, window.adsbygoogle object[]), `.env.example`, public/ads.txt placeholder, .gitignore (.env/.env.* kecuali example).
- UI: `src/components/common/AdSlot.tsx` (lazy IO rootMargin 200px, min-h 110px anti-CLS, ARIA Iklan, no-op offline/config); penempatan bawah Home/Levels/Achievements/Result.
- Tests: setup.ts +stub IntersectionObserver; tests/{AdSlot,i18n? no—env via AdSlot}.test.tsx baru (6), tests/screens/LegalScreen.test.tsx baru (5). Total 183/25 file.
- README: seksi 💰 Monetisasi 5 langkah lengkap pembuatan ad unit + TFUA + ads.txt + env Vercel.

## Technical / Business Decisions
- Zona bebas iklan total di Learn/Practice; slot hanya bawah Home/Levels/Achievements/Result.
- Publisher ID & slot ID via env vars tervalidasi (`src/lib/env.ts`); tanpa config = no-op total.
- document.title tetap brand; legal bilingual via `src/content/legal.ts` + screen privacy/terms.

## Assumptions / Risks
- Persetujuan Google butuh waktu; RPM child-directed lebih rendah — disepakati user.

## Blockers / Unresolved
- SISA USER ACTION: (1) buat 4 ad unit lalu isi VITE_ADSENSE_SLOT_* di .env.local + env Vercel; (2) deploy lalu tunggu 'Authorized' pada math.asharu.id/ads.txt. Identitas legal terisi: Alam Aby Bashit / alam.aby.b@gmail.com; ads.txt pub-4082765898994990; .env.local ca-pub-4082765898994990.

## Verification Performed
- format ✅ · lint ✅ · typecheck ✅ · **183/183 test (25 file)** ✅ · build ✅ · dist/ads.txt ✓

## Commit Proposal
- `feat: halaman legal bilingual dan integrasi adsense ramah anak`
