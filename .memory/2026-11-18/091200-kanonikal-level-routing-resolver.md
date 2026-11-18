# Kanonikal Level Routing Resolver (v1.14.2)

Tanggal: 2026-11-18 09:12:00

## Task / Masalah
Menuntaskan Prioritas 1 dari audit mesin status implisit: memperbaiki diskrepansi rute level ke layar target yang tersebar di `HomeScreen`, `LevelSelectScreen`, dan `ResultScreen`. Sebelumnya, tombol "Lanjutkan" di Beranda dan "Ulangi/Level Berikutnya" di Layar Hasil salah mengarahkan level kebun (`kebun-*`) dan akuarium (`akuarium-*`) ke layar bersusun standar (`LearnScreen`), alih-alih layar dunia interaktifnya masing-masing (`GardenScreen` dan `AquariumScreen`).

## Berkas Penting yang Diubah
- `src/data/levels.ts`: Menambahkan fungsi kanonikal `resolveScreenForLevel(levelId: string): Screen` dengan business commentary lengkap mengapa routing berbeda per pedagogi level.
- `src/screens/LevelSelectScreen.tsx`: Mengganti percabangan manual 15 baris pada `onStart` dengan pemanggilan `navigate(resolveScreenForLevel(level.id))`.
- `src/screens/HomeScreen.tsx`: Menggunakan `resolveScreenForLevel` pada `handleContinue` dan tombol pintasan kebun/akuarium.
- `src/screens/ResultScreen.tsx`: Membersihkan variabel boolean `isConceptLevel`, `isNextConcept`, `isStoryLevel`, `isNextStory` dan menyederhanakan `retryLevel` serta `nextLevel` via `resolveScreenForLevel`.
- `tests/levels.test.ts`: Menambahkan unit test kanonikal untuk semua pemetaan level (kebun, akuarium, konsep, cerita, kolom, fallback).
- `tests/screens/HomeScreen.test.tsx`: Menambahkan test case navigasi `lastLevelId` kebun, akuarium, dan cerita.
- `tests/screens/ResultScreen.test.tsx`: Menambahkan test case retry dan nextLevel untuk kebun, akuarium, dan transisi lintas tipe (`akuarium-4` ke `kebun-5`).
- `tests/screens/LevelSelectScreen.test.tsx`: Menambahkan test interaksi kartu kebun dan akuarium.
- `package.json`: Bump patch version ke `1.14.2`.
- `.gitignore`: Mengabaikan `.openchamber/`.

## Keputusan Teknis & Bisnis
- `resolveScreenForLevel` menjadi satu-satunya sumber kebenaran (*single source of truth*) dalam memetakan `levelId` ke `Screen`.
- Level yang berawalan `kebun-` selalu dipetakan ke `{ name: 'garden', levelId }`.
- Level yang berawalan `akuarium-` selalu dipetakan ke `{ name: 'aquarium', levelId }`.
- Level dengan `levelKind === 'story'` dipetakan ke `{ name: 'story-learn', levelId }`.
- Level dengan `levelKind === 'concept'` dipetakan ke `{ name: 'concept-learn', levelId }`.
- Level kolom lainnya atau id tidak dikenal dipetakan ke `{ name: 'learn', levelId }`.

## Asumsi & Risiko
- Kompatibilitas props: Layar `GardenScreen` dan `AquariumScreen` menerima `levelId` sebagai `string` (diteruskan ke `GardenLevelId` / `AquariumLevelId` di router).
- Perilaku fungsional: 100% kontrak layar, perhitungan skor, riwayat, dan penyimpanan lokal tetap terjaga tanpa regresi.

## Verifikasi yang Dilakukan
- Menjalankan Vitest tertarget: `npm test tests/levels.test.ts tests/screens/HomeScreen.test.tsx tests/screens/ResultScreen.test.tsx tests/screens/LevelSelectScreen.test.tsx`. Seluruh 33 pengujian lulus (100% pass).
- Menjalankan Prettier untuk penataan kode.

## Proposed Conventional Commit
`fix(router): use canonical resolveScreenForLevel across home, levels, and result`

## Link Plan / Spec Terkait
- Plan: `plans/2026-11-18-explicit-state-machines-modernization.md`
