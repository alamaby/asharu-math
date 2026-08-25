# Asharu Math — Project Memory Index

Last Updated: 2026-08-25 14:18:03
Format Version: 1

## Current State
- Aplikasi web edukasi matematika SD (React 18 + TS strict + Vite 6 + Tailwind v4), full client-side, localStorage.
- Kualitas: ESLint 9 + Prettier aktif; 161 test / 22 file lulus; CI GitHub Actions Node 20 & 22.
- PWA aktif: installable (tombol di HomeScreen), offline via service worker auto-update, petunjuk iOS A2HS (belum di-commit).

## Active Decisions
- Susunan angka soal: operand disimpan sebagai string asli tanpa `reverse()`; perhitungan carry/borrow kanan-ke-kiri terpisah dari jalur tampilan (aturan kritis, jangan dilanggar).
- ESLint: aturan `react-refresh/only-export-components` dinonaktifkan karena pola Context (provider + hook di satu file).
- Prettier: no semi, single quote, printWidth 100 — seluruh repo sudah diformat.
- Test wajib lewat `tests/setup.ts` (shim localStorage in-memory untuk jsdom tidak lengkap) dan cleanup RTL eksplisit.
- NavigationContext punya leave-guard (`setLeaveGuard`); guard null = perilaku lama — navigasi programatik internal wajib bersihkan guard dulu.
- PWA: auto-update senyap; ikon PWA digenerate dari favicon.svg via `npm run icons` (sharp); iOS tanpa prompt programatik → petunjuk A2HS dismissible.

## Open Items / Blockers
- PWA belum di-commit.
- Coverage report (`@vitest/coverage-v8`) belum dipasang (opsional).
- Out of scope tercatat: resume sesi half-done; replay sesi saat header-back dari Result ke Learn; uji manual perangkat nyata (checklist di plan PWA).

## Recent Entries
- [2026-08-25 14:18:03 — PWA install button](2026-08-25/141803-pwa-install-button.md)
- [2026-08-25 12:12:57 — Fix level completion review dead-end](2026-08-25/121257-fix-level-completion-review-dead-end.md)
- [2026-08-24 22:39:49 — Quality improvement: CI, testing, tooling](2026-08-24/223949-quality-improvement-ci-testing-tooling.md)

## Legacy Archive
- Tidak ada `PROJECT_MEMORY.md` (memori dimulai baru).
