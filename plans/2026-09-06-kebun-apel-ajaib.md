# Kebun Apel Ajaib — Modul Animasi Interaktif Nilai Tempat 2 Digit

Created: 2026-09-06 22:05:00

## Objective

Menambahkan modul animasi interaktif "Kebun Apel Ajaib" ke math.asharu.id untuk mengajarkan penjumlahan & pengurangan bersusun 2 digit (nilai tempat, menyimpan 1 puluhan = 10 satuan, menukar 1 puluhan → 10 satuan) bagi siswa kelas 2 SD — paralel dengan level bersusun existing, soal dinamis tiap buka, sinkron apel/keranjang ↔ angka bersusun, audio edukatif `id-ID`, aksesibel, responsif, ringan tanpa Three.js.

## Scope

- 4 level paralel Kelas 2 baru: `kebun-1` tambah tanpa simpan, `kebun-2` tambah simpan, `kebun-3` kurang tanpa tukar, `kebun-4` kurang tukar — tidak memutus rantai `level-1..11 → tantangan`.
- Generator soal dinamis (2-digit, validasi aturan per level, anti-duplikat berurutan, `hasCarry`/`hasBorrow`).
- UI kebun: Area Puluhan/Satuan, Apel satuan, Keranjang puluhan (=10), Papan bersusun, state machine 10 fase, animasi CSS/SVG 300–800ms, hormati `prefers-reduced-motion`/`no-anim`.
- Audio: Web Audio sfx + Web Speech `id-ID` fallback, anti-tumpuk, toggle, ulangi.
- Integrasi routing `NavigationContext` + `App.tsx` + `LevelSelectScreen`/`HomeScreen` deep-link.
- i18n `id`/`en` narasi kebun, bump minor `1.1.0 → 1.2.0`.
- Test Vitest: generator, placeValueMath, validasi kolom, reset, anti-ganda, keyboard, lifecycle.

## Milestones

1. Audit & baseline (selesai 2026-09-06 — typecheck 0, 209 test pass)
2. Logika matematika + test
3. Audio & i18n
4. Komponen garden + animasi
5. State machine MagicAppleGarden + sinkron bersusun
6. Integrasi routing/level/entry point
7. Quality gates (lint/typecheck/test/build) + manual responsif
8. Laporan akhir

## Tasks

- [x] Audit arsitektur existing & baseline
- [x] Tulis plan file ini
- [x] `src/lib/placeValueMath.ts` — pure: digit puluhan/satuan, keranjang↔apel, validasi
- [x] `src/lib/gardenQuestionGenerator.ts` — generator dinamis 2-digit per level
- [x] `src/lib/gardenSound.ts` — AudioManager (Web Audio + speech id-ID, anti-tumpuk)
- [x] i18n `dicts/id.ts` + `en.ts` — narasi kebun
- [x] `src/components/garden/*` — AppleUnit, TensBasket, GardenScene, PlaceValueBoard, StackedOperation, LearningControls, FeedbackPanel, ProgressIndicator
- [x] `src/components/garden/MagicAppleGarden.tsx` — state machine 10 fase + sinkron
- [x] `src/screens/GardenScreen.tsx` — wrapper sesi 5 soal + ProgressContext
- [x] `src/types/index.ts` — GardenPhase / GardenLevelId bila perlu
- [x] `src/data/levels.ts` — tambah 4 level paralel `kebun-*`
- [x] `src/state/NavigationContext.tsx` — Screen `garden`
- [x] `src/App.tsx` — route `garden`
- [x] `src/screens/LevelSelectScreen.tsx` + `HomeScreen.tsx` — entry point kebun
- [x] Bump `package.json` 1.2.0
- [x] Tests `tests/garden*.test.ts*`
- [x] `npm run lint/typecheck/test/build` + fix
- [ ] Manual responsif + laporan akhir (13 poin output)

## Risks

- Salah urut `requires` mengunci veteran — mitigasi: uji `isLevelUnlocked` dengan progres dummy legacy.
- Animasi 10↔1 atomik — single source `MathProblem`, animasi hanya visual.
- Web Speech `id-ID` inkonsisten di iOS — fallback subtitle + try/catch.

## Progress Log

- 2026-09-06 22:01 — Baseline: `tsc --noEmit` 0 error, `vitest` 209/209 pass (28 files). Stack React18+TS strict+Vite6+Tailwind4+PWA. Tanpa Three.js.
- 2026-09-06 22:05 — Plan ditulis; keputusan paralel + dinamis + bump minor disetujui.
- 2026-09-06 22:30 — Implementasi kebun selesai: 232/232 test pass (30 files), lint 0, typecheck 0, build 94.92kB gzip. Versi 1.2.0.

## Notes

- Three.js/R3F tidak dipakai: belum ada di repo; overhead bundle/WebGL tidak sebanding untuk 2-digit (maks ~9 keranjang + 19 apel). SVG+CSS transform cukup, lazy-load via React.lazy bila perlu 3D nanti.
- Angka spec `27+15=42` / `42-17=25` hanya fixture test/docs, bukan hardcode runtime.
- Warna konsisten: satuan `amber`, puluhan `emerald/sky` + label `S`/`P` + pola agar tidak hanya warna.
- Anak: tanpa data pribadi baru, tanpa iklan baru, tanpa provider audio berbayar, `localStorage` existing.
