# Asharu Math — Project Memory Index

Last Updated: 2026-08-24 23:01:59
Format Version: 1

## Current State
- Aplikasi web edukasi matematika SD (React 18 + TS strict + Vite 6 + Tailwind v4), full client-side, localStorage.
- Kualitas: ESLint 9 + Prettier aktif; 142 test / 20 file lulus; CI GitHub Actions Node 20 & 22 (format/lint/typecheck/test/build).
- Perubahan belum di-commit (menunggu instruksi user).

## Active Decisions
- Susunan angka soal: operand disimpan sebagai string asli tanpa `reverse()`; perhitungan carry/borrow kanan-ke-kiri terpisah dari jalur tampilan (aturan kritis, jangan dilanggar).
- ESLint: aturan `react-refresh/only-export-components` dinonaktifkan karena pola Context (provider + hook di satu file).
- Prettier: no semi, single quote, printWidth 100 — seluruh repo sudah diformat.
- Test wajib lewat `tests/setup.ts` (shim localStorage in-memory untuk jsdom tidak lengkap) dan cleanup RTL eksplisit.
- PWA/offline (`vite-plugin-pwa`) dan coverage report ditunda menunggu keputusan eksplisit.

## Open Items / Blockers
- Belum ada commit untuk pekerjaan kualitas ini.
- Coverage report (`@vitest/coverage-v8`) belum dipasang (opsional).

## Recent Entries
- [2026-08-24 23:01:59 — Quality improvement: CI, testing, tooling](2026-08-24/223949-quality-improvement-ci-testing-tooling.md)

## Legacy Archive
- Tidak ada `PROJECT_MEMORY.md` (memori dimulai baru).
