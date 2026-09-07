# Akuarium Ikan Ceria — Implementation Plan

Created: 2026-09-07 13:55:00

## Objective
Menambahkan modul animasi interaktif "Akuarium Ikan Ceria" untuk penjumlahan/pengurangan bersusun 2-digit (4 level) dengan visual 1 ikan=1 satuan, 10 ikan=1 puluhan, papan bersusun sinkron, audio edukatif, aksesibel, responsif, performa mobile, terintegrasi ke routing existing math.asharu.id. Rendering akuarium menggunakan Three.js + React Three Fiber (canvas always, ikan low-poly), papan soal tetap DOM overlay.

## Scope
- In: 4 level (tambah tanpa/dengan menyimpan, kurang tanpa/dengan menukar), tutorial, papan bersusun DOM, zona puluhan/satuan, mekanisme kelompok 10, animasi pembentukan/pecah, state machine, generator/validator, audio+subtitle, feedback/reward, progres, a11y (keyboard, aria-live, reduced-motion), responsive, performa (DPR cap, pooling, dispose), integrasi routing/levels/i18n/storage, test.
- Out: Physics engine berat, model 3D kompleks, analytics provider baru, data pribadi anak, refactor besar, perubahan framework, fallback 2D interaktif (canvas always — hanya pesan error jika WebGL gagal).

## Milestones
1. M1 Fondasi — model nilai-tempat + generator + state machine + sound + unit test
2. M2 Canvas 3D — AquariumCanvas + AquariumScene3D + Fish3D + TensFishGroup3D + Environment (low-poly, canvas always)
3. M3 UI DOM — StackedOperationBoard + PlaceValueZones overlay + Controls/Progress/Feedback/Subtitle/Reward/Tutorial + sinkron animasi↔angka
4. M4 Integrasi — routing/levels/types/i18n/storage + Home/LevelSelect entry + E2E (27+15 & 42-17) + lint/typecheck/build + docs

## Tasks
- [x] Audit codebase + baseline lint/typecheck/test/build (232 passed, lint/typecheck bersih)
- [x] Bump minor version 1.2.0 → 1.3.0 (feat) + install deps `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`
- [x] `src/lib/aquariumPlaceValueMath.ts` — pure: splitTensOnes, totalFromSplit, isValidAquariumState, formGroup(ones-10,tens+1), splitGroup(tens-1,ones+10), combinedForAddition, needsCarry/Borrow, isCorrectOnes/TensAnswer, FISH_PER_GROUP=10, totalInvariant
- [x] `src/lib/aquariumQuestionGenerator.ts` — AquariumLevelId `akuarium-1..4`, aquariumSettingsFor, generateAquariumProblem/Session, buildAquariumFixture, dedup previous, non-negatif, pool guard
- [x] State di CheerfulAquarium — states intro/tutorial/showQuestion/exchangeOrGroup/enterOnesAnswer/enterTensAnswer/completed + guards (disable saat animating, no double reward, no duplicate fish, reset cancel timers/tweens/audio)
- [x] `src/lib/aquariumSound.ts` — clone pola gardenSound.ts (speak id-ID 0.9, anti-tumpuk cancel, repeatLast, SFX pick/group/split/reward), lazy AudioContext via sound.ts
- [x] Unit test lib (generator 4 level, value 1/10, form/split, invariant, validasi jawaban, reset, idempotensi, no identical consecutive) — tests/aquarium.test.ts 19 tests
- [x] `src/components/aquarium/AquariumCanvas.tsx` — Canvas wrapper canvas-always: `dpr={[1,1.5]}`, `gl antialias+low-power`, `frameloop never` saat hidden, pesan error jika WebGL gagal (tanpa fallback interaktif)
- [x] `src/components/aquarium/AquariumScene3D.tsx` — R3F scene: fog biru, 2 zona (puluhan/satuan), posisi ikan/kelompok
- [x] `src/components/aquarium/Fish3D.tsx` — low-poly: Box body + Cone tail + Sphere eyes, MeshLambert shared, warna satuan amber vs puluhan sky + pola bintik, ~150-200 tris, wiggle via useFrame
- [x] `src/components/aquarium/TensFishGroup3D.tsx` — 10 Fish3D formasi lingkaran + Ring bubble transparan + label "10" via drei/Text, selalu 10 ikan, slow rotation
- [x] `src/components/aquarium/AquariumEnvironment3D.tsx` — pasir Plane, batu Box, tanaman Cylinder, gelembung 10 rising, draw calls ≤30, seeded deterministic
- [x] `src/components/aquarium/StackedOperationBoard.tsx` — DOM reuse pola VerticalMathProblem, carry/borrow column, highlight sinkron
- [x] `src/components/aquarium/PlaceValueZones.tsx` — DOM overlay label PULUHAN/SATUAN, warna terhubung papan
- [x] `src/components/aquarium/AquariumControls.tsx` + `AquariumProgress.tsx` + `AquariumFeedbackPanel.tsx` + `NarrationSubtitle.tsx` + `RewardDecoration.tsx`
- [x] `src/components/aquarium/CheerfulAquarium.tsx` — orchestrator (mirip MagicAppleGarden), sinkron animasi↔angka via state sebagai source of truth, tutorial 4 langkah
- [x] Tutorial overlay (skip/repeat, subtitle, keyboard/touch, no-audio fallback) — AquariumTutorial.tsx
- [x] Aksesibilitas: aria-live jumlah kelompok/ikan, focus ring, semantic, Canvas aria-hidden, reduced-motion (duration 50ms)
- [x] Responsive: `min(58vw,320px)` canvas height, flex/grid, papan sticky, indikator numerik
- [x] Integrasi: `src/data/levels.ts` 4 level akuarium-1..4, `NavigationContext` Screen `aquarium`, `src/screens/AquariumScreen.tsx` (session 5, stars, guard), entry di `LevelSelectScreen` + `HomeScreen` (akuarium-1), App.tsx lazy AquariumScreen
- [x] i18n `dicts/id|en` — 26 keys aquarium.*
- [x] Storage — progress via existing ProgressContext/levels (tidak tambah key baru)
- [x] Integration test — tests/aquariumLifecycle.test.tsx 10 tests (27+15,42-17, source of truth, guard, render, keypad, speak, unmount, reduced-motion)
- [x] `npm run lint && npm run typecheck && npm test && npm run build` — lint ok, typecheck ok, 32 files 261 tests, build ok (AquariumScreen lazy 24.65kB, three 666kB, fiber 401kB)
- [ ] Dokumentasi Z — laporan akhir di bawah

## Risks
- Bundle +700kB Three.js → lazy-load `React.lazy+Suspense` + `vite manualChunks aquarium` + cek size build.
- Performa low-end → primitive geometry shared, instancing jika >20, gelembung ≤15, DPR cap 1.5, pause saat tab hidden, draw calls ≤30.
- Duplikasi ikan saat klik ganda → guard `isAnimating` + state sebagai source of truth, posisi visual bukan kebenaran.
- Narasi tumpuk → `speechSynthesis.cancel()` + queue tunggal.
- Aksesibilitas drag-only → tap/klik + tombol "Gabungkan"/"Pecah" + keyboard (44px target).
- WebGL unsupported (canvas always) → tampilkan pesan error statis non-interaktif, jangan crash.
- Memory leak geometry → `dispose()` on unmount, audit `renderer.info` setelah 5x ganti soal.
- Regresi Garden/Learn → reuse `planAddition/planSubtraction` sebagai oracle.

## Progress Log
- 2026-09-07 13:55:00 — Audit codebase + baseline bersih (lint ok, typecheck ok, 30 files 232 tests) + draft plan Three.js canvas-always low-poly DOM-board
- 2026-09-07 14:00:00 — Plan file dibuat, mulai eksekusi M1
- 2026-09-07 14:30:00 — Commit c9b4bad: 31 files 3083+ lines, lazy AquariumScreen, three/fiber chunks, 32 files 261 tests
- 2026-09-07 14:35:00 — Review c9b4bad → temuan T-01..T-07, plan perbaikan ditulis di 2026-09-07-akuarium-ikan-ceria-review-fix-plan.md
- 2026-09-07 14:42:00 — Fix T-01..T-07: App.tsx dead-code, WebGL hasWebGL guard+useMemo, Fish3D posRef+useProgress+reduced-motion, TensFishGroup3D reduced-motion, AquariumEnvironment3D reduced-motion, CheerfulAquarium tutorial phase, test heading query. Verifikasi: lint ok, typecheck ok, 32 files 261 tests passed, build ok.

## Notes
- Stack existing: React 18.3 + TS 5.6 strict + Vite 6.3 + Tailwind v4 + Vitest 3.1, tanpa router, tanpa Three.js. Garden (kebun apel) jadi referensi langsung: placeValueMath, gardenQuestionGenerator, gardenSound, MagicAppleGarden pattern.
- Rendering: StackedOperationBoard dan kontrol tetap DOM (reuse VerticalMathProblem, NumericKeypad, Tailwind) untuk a11y dan keterbacaan; hanya akuarium (ikan, kelompok 10, gelembung, pasir) di dalam <Canvas> R3F.
- TOGAF/Oracle C2M/TM Forum ODA tidak relevan (edukasi SD); acuan pedagogis nilai-tempat.
- Warna satuan amber vs puluhan sky + label/pola, bukan hanya warna (spec D).
- Audio Web Speech id-ID 0.9 fallback dev, siap ganti rekaman manusia.
- Analytics reuse existing jika ada; event `cheerful_aquarium_*` anonim tanpa PII.
