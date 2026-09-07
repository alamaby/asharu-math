# Review Akuarium Ikan Ceria — Plan Perbaikan Temuan

Created: 2026-09-07 14:35:00
Fix Branch: main (dari commit c9b4bad)

## Objective
Menindaklanjuti commit awal `c9b4bad` (31 files, 3083+ lines) terhadap plan `plans/2026-09-07-akuarium-ikan-ceria-implementation-plan.md` dan spec A–Z. Empat temuan P0/P1 perlu diperbaiki sebelum push final: dead-code, WebGL sync check, sinkron props 3D, dan stabilisasi test jsdom. Plan ini menjadi panduan perbaikan terstruktur dengan verifikasi aman.

## Scope
- In: hapus dead-code `AquariumCanvasLazyHint`, perbaiki WebGL sync + SSR guard, sinkron `Fish3D` position via effect + non-animating scale init, hapus prefix `g-/f-` keys, aktifkan `.no-anim` dalam Canvas saat reduced-motion, dokumentasi `type tutorial` phase, perbaiki 2 test flaky `aquariumLifecycle`.
- Out: perubahan behaviour matematika/generator, penambahan level, perubahan routing, perubahan PWA manifest, penambahan analytics.

## Temuan Review (temuan yang ditutup plan ini)

### T-01 Dead-code App.tsx (P1 — kebersihan)
- `src/App.tsx:21` `const AquariumCanvasLazyHint = 'aquarium'` + `void AquariumCanvasLazyHint` tidak dipakai. Sisa rename manualChunks. Dihapus.

### T-02 WebGL sync + SSR guard (P0 — correctness)
- `AquariumCanvas.tsx:39` `const webGL = hasWebGL()` sync di render: (a) tidak ada guard `typeof window === 'undefined'` untuk SSR/prerender, (b) `document.createElement('canvas')` bisa throw di jsdom tanpa canvas, (c) tidak ada memo — re-run tiap render. Perbaiki: `useState(()=> hasWebGL())` + guard + try/catch, atau `useMemo` + window check. Dipilih `useMemo` + guard agar sekali hitung, lint `set-state-in-effect` tetap lolos.

### T-03 Sinkron props position Fish3D (P0 — visual bug)
- `Fish3D.tsx:42` `useFrame` menimpa `position.y` dengan `position[1] + sin` tiap frame, tapi `position` prop yang berubah (mis. `initialTens/Ones`) tidak memicu update `x/z` via state — hanya `y` yang sinkron. Saat soal pindah atau `exchanged/opened`, ikan terlihat teleport vertikal sesaat. Perbaiki: simpan `position` ke `ref`/state via `useEffect` dan `lerp` x/z, atau gunakan `group position` binding langsung + `useFrame` hanya rotasi/scale.

### T-04 Key prefix `g-`/`f-` & non-animating scale (P2 — konsistensi)
- `AquariumScene3D.tsx:73` key `` `g-${String(i)}` `` dan `f-` tidak perlu; cukup `${i}` dengan prefix konteks berbeda (kelompok vs ikan sudah di array terpisah). Minor, tapi diserapatkan. Juga `scale={highlight ? scale : scale}` tautologi di `Fish3D.tsx:56`.

### T-05 Reduced-motion di dalam Canvas (P1 — a11y R.11 / P.10)
- `AppShell` memakai `progress.animationsEnabled ? '' : 'no-anim'` pada root `div`, tapi `<Canvas>` berada di shadow WebGL — `no-anim` via CSS tidak mem-pause `useFrame` (wiggle/rotation/bubble). Sudah ada `frameloop never` saat `hidden`, namun `prefers-reduced-motion` perlu juga pause `useFrame` atau kurangi animasi. Tambahkan `reducedMotion` flag via `matchMedia` dan skip `useFrame` wiggle.

### T-06 Phase `tutorial` tidak pernah dipakai (P2 — state)
- `CheerfulAquarium.tsx:36` type `Phase` deklarasi `'tutorial'` tapi tidak ada `setPhase('tutorial')`; tutorial dikontrol `tutorialOpen` boolean terpisah. Sinkronkan atau hapus dari union + dokumentasikan.

### T-07 Test flaky jsdom + WebGL (P0 — CI)
- `tests/aquariumLifecycle.test.tsx:63` `AquariumScreen render` timeout 5000ms dan `Found multiple elements with text /Akuarium Ikan Ceria/` pada test kedua (race `lazy` + suspsense fallback vs content). Penyebab: `AquariumCanvas` sync `hasWebGL()` + `lazy AquariumScene3D` tanpa `act` wait. Perbaiki: mock `hasWebGL` atau stub `Canvas`, dan gunakan `getByRole('heading', {name})` spesifik vs `getByText` yang ambigu.

## Milestones
1. M-FIX-1 Dead-code & lint (T-01, T-06)
2. M-FIX-2 Three.js sync & perf (T-02, T-03, T-04, T-05)
3. M-FIX-3 Test stabilisasi (T-07)
4. M-FIX-4 Verifikasi akhir (lint/typecheck/test/build + manual)

## Tasks
- [x] T-01: hapus `AquariumCanvasLazyHint` + `void` di `src/App.tsx:20-24`
- [x] T-02: `src/components/aquarium/AquariumCanvas.tsx:39` — ganti `const webGL = hasWebGL()` dengan `const webGL = useMemo(()=> typeof window !== 'undefined' ? hasWebGL() : false, [])` + guard `window` di `hasWebGL`, tambah `useEffect` visibility tetap
- [x] T-03: `src/components/aquarium/Fish3D.tsx` — simpan `position` prop ke `posRef` via `useEffect`, `useFrame` lerp/assign `x/z` jika drift > eps, init scale non-highlight `s*scale`
- [x] T-04: `src/components/aquarium/Fish3D.tsx:56` `scale={scale}` (hapus ternary); `AquariumScene3D.tsx:72,81` key prefix atau keep tapi konsisten
- [x] T-05: `Fish3D`/`TensFishGroup3D`/`AquariumEnvironment3D` — baca `prefers-reduced-motion` / `progress.animationsEnabled` dan skip/ringankan `useFrame`; `AquariumCanvas` `frameloop='never'` saat `reducedMotion`
- [x] T-06: `CheerfulAquarium.tsx:34` — hapus `'tutorial'` dari union atau dokumentasikan `// 'tutorial' reserved; actual via tutorialOpen`
- [x] T-07: `tests/aquariumLifecycle.test.tsx` — perbaiki 2 failing tests: (a) mock `HTMLCanvasElement.getContext` atau `hasWebGL` stub di setup, (b) ganti `getByText(/Akuarium Ikan Ceria/i)` jadi `getByRole('heading', {name})` atau `queryByText` dengan `within`
- [x] Verifikasi: `npm run lint && npm run typecheck && npm test && npm run build` — target `lint` clean, 32 files **261/261 passed**, build chunk size tetap lazy
- [x] Update plan file `plans/2026-09-07-akuarium-ikan-ceria-implementation-plan.md` progress log + checklist
- [x] Commit fix + push origin/main

## Risks
- Mengubah `hasWebGL()` sync ke `useMemo` + guard berpotensi menunda deteksi WebGL pada hydration; mitigasi: `useEffect` fallback re-check jika `false` initial.
- `useFrame` lerp x/z bisa menambah jitter; mitigasi: threshold eps 0.001 + linear assignment jika `!reducedMotion`.
- Test mock `getContext` bisa bocor ke test lain; mitigasi: `vi.restoreAllMocks` di `afterEach`.

## Progress Log
- 2026-09-07 14:35:00 — Review commit c9b4bad, temuan T-01..T-07 dicatat, plan perbaikan ini ditulis.
- 2026-09-07 14:42:00 — Semua T-01..T-07 diperbaiki, verifikasi lint/typecheck/test/build ok, siap commit push.
