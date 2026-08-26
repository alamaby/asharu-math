# Asharu Math — Project Memory Index

Last Updated: 2026-08-26 09:10:00
Format Version: 1

## Current State
- Aplikasi web edukasi matematika SD (React 18 + TS strict + Vite 6 + Tailwind v4), full client-side, localStorage.
- Kualitas: ESLint 9 + Prettier aktif; 167 test / 23 file lulus; CI GitHub Actions Node 20 & 22.
- PWA aktif: installable (tombol di HomeScreen), offline via service worker auto-update, petunjuk iOS A2HS.
- i18n: dua bahasa ID(default)/EN switch instan (commit `e27cfd4`).
- AdSense siap-dipasang: AdSlot lazy no-op tanpa env; zona bebas iklan di Learn/Practice; legal Privacy/Terms bilingual live; TFUA + instruksi ad unit ada di README — belum di-commit.

## Active Decisions
- Susunan angka soal: operand disimpan sebagai string asli tanpa `reverse()`; perhitungan carry/borrow kanan-ke-kiri terpisah dari jalur tampilan (aturan kritis, jangan dilanggar).
- ESLint: aturan `react-refresh/only-export-components` dinonaktifkan karena pola Context (provider + hook di satu file).
- Prettier: no semi, single quote, printWidth 100 — seluruh repo sudah diformat.
- Test wajib lewat `tests/setup.ts` (shim localStorage in-memory untuk jsdom tidak lengkap) dan cleanup RTL eksplisit.
- NavigationContext punya leave-guard (`setLeaveGuard`); guard null = perilaku lama — navigasi programatik internal wajib bersihkan guard dulu.
- PWA: auto-update senyap; ikon PWA digenerate dari favicon.svg via `npm run icons` (sharp); iOS tanpa prompt programatik → petunjuk A2HS dismissible.
- i18n: custom t() tanpa dependensi (`src/i18n/`, dict id/en typed); UI chrome via dict, data domain (level/achievement) via LocalizedText pairs; LearningStep data murni diterjemahkan render-time (`stepInstruction`) agar switch instan; bahasa disimpan di UserProgress.language.

## Open Items / Blockers

- Coverage report (`@vitest/coverage-v8`) belum dipasang (opsional).
- Uji manual PWA di perangkat nyata setelah deploy Vercel berikutnya (checklist di plan).
- Out of scope tercatat: resume sesi half-done; replay sesi saat header-back dari Result ke Learn; judul sesi pada Result tidak ikut berubah bila bahasa diganti setelah sesi dimulai.

## Recent Entries
- [2026-08-26 08:53:30 — AdSense + legal pages](2026-08-26/085330-adsense-and-legal.md)
- [2026-08-25 20:47:34 — Fix temuan review i18n](2026-08-25/204734-i18n-review-fixes.md)
- [2026-08-25 19:46:54 — Bilingual ID/EN](2026-08-25/190113-bilingual-id-en.md)
- [2026-08-25 14:18:03 — PWA install button](2026-08-25/141803-pwa-install-button.md)
- [2026-08-25 12:12:57 — Fix level completion review dead-end](2026-08-25/121257-fix-level-completion-review-dead-end.md)
- [2026-08-24 22:39:49 — Quality improvement: CI, testing, tooling](2026-08-24/223949-quality-improvement-ci-testing-tooling.md)

## Legacy Archive
- Tidak ada `PROJECT_MEMORY.md` (memori dimulai baru).
