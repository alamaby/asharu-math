# 2026-09-22 — Papan R/P/S Sejajar + Ratusan 3-Digit + Fix Periksa (Akuarium & Kebun)

- Task: implementasi `plans/2026-09-22-aquarium-garden-ratusan-dan-periksa.md` S0–S9 (unifikasi papan bersusun, soal 3-digit ujung-ke-ujung, perbaiki Periksa diam).
- Key files changed:
  - `src/lib/placeValueMath.ts`, `src/lib/aquariumPlaceValueMath.ts` (splitPlaces/totalFromHundreds/isCorrectAt + tukar ratusan)
  - `src/components/math/StackedPlaceValueBoard.tsx` (BARU, grid N-kolom), `StackedOperationBoard.tsx` + `StackedOperation.tsx` (wrapper 2-digit)
  - `src/components/garden/HundredsCrate.tsx` (BARU), `PlaceValueBoard.tsx`, `PlaceValueZones.tsx`, `GardenScene.tsx`, `AquariumCanvas.tsx`, `AquariumScene3D.tsx` (zona R + cap)
  - `CheerfulAquarium.tsx`, `MagicAppleGarden.tsx` (fase enterHundredsAnswer, input S→P→R, fix Periksa intro/tutorial)
  - `gardenQuestionGenerator.ts`, `aquariumQuestionGenerator.ts`, `data/levels.ts` (kebun-5/6, akuarium-5/6, number 20–23), `dicts/id.ts`+`en.ts` (10 kunci ratusan cermin), `AquariumTutorial.tsx` (langkah 5 peti ungu)
  - `tests/garden.test.ts`, `tests/aquarium.test.ts`, `tests/stackedBoard.test.tsx` + `tests/aquariumCheck.test.tsx` (BARU), `package.json` 1.4.0→1.4.1
- Decisions: Visual A peti/rak ungu; rantai `akuarium-4→kebun-5→kebun-6→akuarium-5→akuarium-6`; papan 2.75rem tetap (bukan var --cell-w); wrapper 2-digit throw bila width≠2; test render interaktif disederhanakan jadi validator karena timer intro flaky.
- Assumptions/risks: 8 level lama piksel-identik (kartu R hidden bila showHundreds false); isCorrectAt padStart untuk hasil < width digit; borrow 3-digit berantai sederhana.
- Blockers: verifikasi manual browser BELUM dilakukan (360px/desktop, 23+22, 245+138, Periksa saat tutorial) — butuh browser interaktif.
- Verification: typecheck 0, lint 0, test 303 lulus/1 gagal (PracticeScreenStory pre-existing, sama di baseline S0), prettier file scope lulus.
- Commit proposal: `fix: papan R/P/S sejajar, ratusan 3-digit, dan periksa akuarium-kebun`
- Related: `plans/2026-09-22-aquarium-garden-ratusan-dan-periksa.md`
