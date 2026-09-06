# Asharu Math — Project Memory Index

Last Updated: 2026-09-06 00:00:00
Format Version: 1

## Current State
- Aplikasi web edukasi matematika SD (React 18 + TS strict + Vite 6 + Tailwind v4), full client-side, localStorage — versi `1.1.0` (feat Kelas 1 track).
- Konten: K1 3 konsep (membilang/banding/nilai-tempat) + 4 kolom 1–2 digit; K2 11 bersusun; Tantangan adaptif; 10 achievement (`bintang-kelas-1` mencakup 7 K1).
- Kualitas: ESLint 9 + Prettier aktif; 209 test / 28 file lulus; CI GitHub Actions Node 20 & 22.
- PWA aktif: installable (tombol di HomeScreen), offline via service worker auto-update, petunjuk iOS A2HS.
- i18n: dua bahasa ID(default)/EN switch instan; concept i18n render-time; Home/Result routing per-grade & per-levelKind.
- AdSense + legal: AdSlot TFAT=1 child; zona bebas iklan Learn/Practice/Concept; Privacy/Terms bilingual (pemilik Alam Aby Bashit, alam.aby.b@gmail.com); ads.txt `pub-4082765898994990` live.

## Active Decisions
- Susunan angka soal: operand disimpan sebagai string asli tanpa `reverse()`; perhitungan carry/borrow kanan-ke-kiri terpisah dari jalur tampilan (aturan kritis, jangan dilanggar).
- ESLint: aturan `react-refresh/only-export-components` dinonaktifkan karena pola Context (provider + hook di satu file).
- Prettier: no semi, single quote, printWidth 100 — seluruh repo sudah diformat.
- Test wajib lewat `tests/setup.ts` (shim localStorage in-memory untuk jsdom tidak lengkap) dan cleanup RTL eksplisit.
- NavigationContext punya leave-guard (`setLeaveGuard`); guard null = perilaku lama — navigasi programatik internal wajib bersihkan guard dulu.
- PWA: auto-update senyap; ikon PWA digenerate dari favicon.svg via `npm run icons` (sharp); iOS tanpa prompt programatik → petunjuk A2HS dismissible.
- i18n: custom t() tanpa dependensi (`src/i18n/`, dict id/en typed); UI chrome via dict, data domain (level/achievement) via LocalizedText pairs; LearningStep/Concept data murni diterjemahkan render-time (`stepInstruction`/`conceptPrompt`) agar switch instan; bahasa disimpan di UserProgress.language.
- Web versioning (SemVer): `feat` → bump **minor** + reset patch 0; `fix` → bump **patch**; `feat!`/breaking → bump **major**; wajib bump `package.json:version` sebelum commit yang mengubah perilaku/user-facing; tampilkan `vX.Y.Z` di Home footer + Settings.
- Unlock: `requires` + veteran bypass `K1_IDS` 7; `isLevelUnlocked` — level yang sudah selesai selalu `true`; next linear via `LEVELS` order.

## Open Items / Blockers
- Sisa AdSense: verifikasi 4 display unit produksi di dashboard setelah deploy.
- Coverage report (`@vitest/coverage-v8`) belum dipasang (opsional).
- Uji manual PWA di perangkat nyata setelah deploy Vercel berikutnya (checklist di plan).
- Out of scope tercatat: resume sesi half-done; replay sesi saat header-back dari Result ke Learn; judul sesi pada Result tidak ikut berubah bila bahasa diganti setelah sesi dimulai.
- Konsep: counting 1–20, distraktor pool `1..20\{target}` agar tidak deadlock di tepi; compare helper deterministik untuk angka eksplisit — pertahankan.

## Recent Entries
- [2026-09-06 18:?? — Review M3 polish](2026-09-06/1810-review-k1-m3-fixes.md)
- [2026-09-06 16:50:00 — Review M2 fixes (sound, determinisme, i18n)](2026-09-06/1650-review-k1-m2-fixes.md)
- [2026-09-06 15:00:00 — M2 concept levels membilang/banding/nilai-tempat](2026-09-06/1500-m2-concept-levels.md)
- [2026-09-06 11:15:00 — Review M1 fixes (veteran unlock)](2026-09-06/1115-review-k1-m1-fixes.md)
- [2026-09-06 — Kelas 1 track (K1) feat](k1-track.md)
- [2026-08-26 09:30:12 — Fix temuan review AdSense](2026-08-26/093012-adsense-review-fixes.md)
- [2026-08-26 08:53:30 — AdSense + legal pages](2026-08-26/085330-adsense-and-legal.md)
- [2026-08-25 20:47:34 — Fix temuan review i18n](2026-08-25/204734-i18n-review-fixes.md)
- [2026-08-25 19:46:54 — Bilingual ID/EN](2026-08-25/190113-bilingual-id-en.md)
- [2026-08-25 14:18:03 — PWA install button](2026-08-25/141803-pwa-install-button.md)
- [2026-08-25 12:12:57 — Fix level completion review dead-end](2026-08-25/121257-fix-level-completion-review-dead-end.md)
- [2026-08-24 22:39:49 — Quality improvement: CI, testing, tooling](2026-08-24/223949-quality-improvement-ci-testing-tooling.md)

## Legacy Archive
- Tidak ada `PROJECT_MEMORY.md` (memori dimulai baru).
