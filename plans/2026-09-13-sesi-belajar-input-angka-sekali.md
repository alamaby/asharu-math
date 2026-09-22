# Sesi Belajar: Input Angka Cukup Sekali per Kolom

Created: 2026-09-13 00:00:00

## Objective

Di layar Belajar (langkah demi langkah) penjumlahan, anak mengetik **jumlah kolom saja sekali** di Kotak Hitung; digit jawaban dan kotak simpan terisi otomatis, lalu auto-lanjut. Pengurangan sudah sekali input per kolom sehingga tidak diubah.

## Scope

- `learningSteps.ts`: rantai `interim-sum → answer-digit → carry-digit` pada penjumlahan dilipat jadi satu `interim-sum` dengan auto-fill; kolom turunan carry jadi langkah `carry-down` auto-complete.
- `LearnScreen.tsx` reducer: `check-interim` mengisi jawaban + simpan; `next` mengisi `carry-down` + auto-advance; `replayTo`/`repeat`/`acceptsDigits` disesuaikan.
- `types/index.ts`: `interim-sum` diberi `expectedDigit` + `carry?`; varian `carry-digit` dihapus.
- i18n (`steps.ts`, `dicts/id.ts`, `dicts/en.ts`): kunci `steps.carryDown` baru; kunci mati dihapus.
- Tes diperbarui: `learningSteps.test.ts`, `learnReducer.test.ts`.

## Milestones

1. Types + step builder + instruksi i18n
2. Reducer + screen LearnScreen
3. Update & jalankan tes, lint, typecheck

## Tasks

- [x] Task 1: perluas varian `interim-sum`, tambah `carry-down`, hapus `carry-digit` (types + learningSteps)
- [x] Task 2: i18n instruksi baru (carryDown) + bersih-bersih kunci mati
- [x] Task 3: reducer LearnScreen auto-fill jawaban/simpan + replay/repeat
- [x] Task 4: update tes unit & jalankan `npm run test`, `npm run typecheck`, `npm run lint`

## Risks

- Anak kehilangan latihan motorik menulis digit jawaban/simpan — mitigasi: auto-isi disorot hijau (done) dan langkah review tetap menampilkan hasil lengkap.
- `wrongAttempts` tetap agregat per soal, sehingga skor/pencapaian tidak berubah makna.

## Progress Log

- 2026-09-13 — Plan dibuat dan disetujui user; implementasi dimulai.
- 2026-09-13 21:45 — Selesai. `npm run test` 263/263 lolos, `typecheck` + `lint` + prettier bersih.

## Notes

Akar masalah: pada 26 + 87 anak menekan angka hingga 3× per kolom (jumlah → digit jawaban → kotak simpan). Setelah perubahan cukup ketik `13`, `11`; sisanya otomatis.
