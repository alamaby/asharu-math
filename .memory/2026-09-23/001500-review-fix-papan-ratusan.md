# 2026-09-23 — Review Fix: Crash 3-Digit, Fase Macet Intro, Visual Ratusan Salah

- Task: review implementasi `plans/2026-09-22-aquarium-garden-ratusan-dan-periksa.md` di commit `70697ce`; temukan + perbaiki 6 bug dalam scope (R1–R6), tambah test regresi.
- Key files changed:
  - `src/lib/placeValueMath.ts`, `src/lib/aquariumPlaceValueMath.ts` (R1: basketsFor/applesFor/fishesFor/groupsFor/combinedForAddition via splitPlaces 0..999 + komentar 2-digit-only di isCorrectTensAnswer)
  - `src/lib/gardenQuestionGenerator.ts`, `src/lib/aquariumQuestionGenerator.ts` (R2: kebun-5/akuarium-5 hasil ≤999 + fixture 245+138)
  - `CheerfulAquarium.tsx`, `MagicAppleGarden.tsx` (R3: hasCarry/hasBorrow global, afterTens/afterOnes normalisasi berantai 3-digit, 2-digit identik lama; R6 root-cause: reset-async → reset sinkron + block eslint-disable + deps [problem.id]; tombol tukar/buka ratusan bertahap + carryValues/hint/carryShown gating per tahap)
  - `StackedPlaceValueBoard.tsx` (R4: label span inline-block agar w-11 berlaku)
  - `PlaceValueZones.tsx` (+hundredsUnitLabel), `CheerfulAquarium.tsx` (R5: overlay/live-region/zona pakai t('aquarium.tankLabel')); `GardenScene.tsx` (label via t('garden.crateLabel')); `dicts/id.ts`+`en.ts` (crateLabel + '100 apel')
  - `tests/garden.test.ts`, `tests/aquarium.test.ts` (regresi helper 3-digit + guard hasil ≤999/kolom 3); `tests/reviewThreeDigit.test.tsx` (BARU, 4 test render 3-digit + regresi fase-intro); `package.json` 1.4.1→1.4.2
- Decisions: reset sinkron + block eslint-disable (deps problem.id, aman dari cascading); tombol ratusan bertahap S-dulu-baru-R (bukan sekaligus); kunci i18n baru dipakai langsung (tidak ada TODO S7 tersisa); isu duplikat number 20–23 TIDAK diubah (plan S7 melarang ubah level lama) — tindak lanjut terpisah.
- Assumptions/risks: soal 2-digit piksel-perilaku identik (test lifecycle hijau); kunci EN cermin ID (typecheck memaksa); visual ratusan = jumlah peti logis, bukan 100 ikon.
- Blockers: verifikasi manual browser BELUM dilakukan (259+178 tukar bertahap, 432−176 pecah bertahap, Periksa saat tutorial) — butuh browser interaktif.
- Verification: typecheck 0, lint 0, build OK, test 309 lulus/1 gagal (PracticeScreenStory pre-existing flake: gagal di full-suite baseline 70697ce maupun kerja ini, lolos terisolasi; file di luar diff), prettier file-scope lulus.
- Commit proposal: `fix: selaraskan implementasi papan ratusan dengan plan dan temuan review`
- Related: `plans/2026-09-22-aquarium-garden-ratusan-dan-periksa.md`
