# Perbaiki flake test PracticeScreenStory (seed-dependent)

Date: 2026-09-23 13:45:00

## Ringkasan

Flake pre-existing `tests/screens/PracticeScreenStory.test.tsx` diperbaiki menjadi deterministik. CI Node 22 sebelumnya gagal di run `7732f43` (v1.5.0), job Node 20 lolos. Full suite kini 334/334 lulus stabil.

## File Diubah

- `tests/screens/PracticeScreenStory.test.tsx` — baris 30: `getByText(/punya/)` → `getAllByText(/punya/).length >= 1` + komentar.

## Akar Masalah

Generator cerita (`storyGenerator.ts`) menggunakan `Math.random()` tanpa seed — family/nama/angka soal acak tiap run. Untuk family F0, prompt 1-part mengulang teks stem → `StoryCard` me-render dua `<p>` identik (stem `text-sm` + prompt `text-base`). `getByText(/punya/)` undefined count-throw bila cocok > 1. Seed lain (family berbeda atau multi-part) lolos karena hanya satu `<p>` cocok. Ini menjelaskan mengapa run lokal lolos terisolasi tapi gagal di CI (Node 22 vs 20 memiliki path execution berbeda yang memengaruhi seeded PRNG).

## Bukti Reproduksi

- Seed `--sequence.seed=12345`: GAGAL dengan error "Found multiple elements with the text: /punya/"
- Seed `--sequence.seed=11111`: GAGAL dengan error yang sama (nama Budi, angka 35+42)
- Seed `--sequence.seed=67890`: LOLOS
- Seed `--sequence.seed=99999`: LOLOS
- Default (random): bervariasi antara LOLOS/GAGAL.

## Alternatif yang Ditolak

- Mock `Math.random` via `vi.spyOn`: overkill, mengikat test ke internal generator, rapuh bila family/pool nama berubah.
- Tambah `aria-label`/role di `StoryCard` (produksi): blast radius lebih besar (a11y benefit nyata tapi perlu sinkron i18n jika pakai key dict); dipisah milestone nanti bila diinginkan.

## Verifikasi

- File test: 2/2 passed × 3 run (seed fail, seed fail, default) ✅
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run format:check` ✅
- `npm run test` (full suite): **334/334 passed**, 39 test files, 0 failed ✅
- Tidak ada file lain yang berubah (diff 1 file, ±3 baris).

## Catatan

- Tidak ada bump versi (fix test-only, bukan perubahan user-facing).
- Setelah hijau, memori diperbarui: status kualitas 334 lulus, hapus butir "Pre-existing flake".
- Plan lengkap: `plans/2026-09-23-practice-screen-story-flake-fix.md`.
