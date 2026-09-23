# Implementation Plan — Akuarium Puluhan Hilang + Ikan Berenang + Klik Menghindar

Created: 2026-09-23 12:00:00

## Objective

1. Perbaiki bug "ikan puluhan tidak ada" pada soal tanpa carry/borrow (contoh screenshot `34+25` tampil `5 kelompok · 50` di badge tapi kanvas 3D kosong di zona kiri).
2. Tambah animasi berenang kesana-kemari untuk ikan satuan (kuning) dan kelompok puluhan (biru) tanpa merusak invariansi matematika nilai tempat.
3. Tambah interaksi klik/tap pada ikan: ikan berenang menjauh (flee) seperti menghindar mau ditangkap, visual-only, tidak mengubah hitungan jawaban.

Plan ini eksplisit, atomik, deterministik untuk model kecil. Jangan implementasi di luar langkah. Jangan ubah matematika, generator, level, i18n, atau flow jawaban.

## Scope

Masuk (hanya file ini yang boleh diubah selama implementasi):
- `src/components/aquarium/AquariumScene3D.tsx`
- `src/components/aquarium/Fish3D.tsx`
- `src/components/aquarium/TensFishGroup3D.tsx`
- `src/components/aquarium/CheerfulAquarium.tsx` (hanya baris props kanvas 671-679, dilarang sentuh state machine lain)
- `src/components/aquarium/AquariumCanvas.tsx` (hanya jika perlu tambah `onCreated`/`event` prop, dilarang ubah camera/fog/light)
- `src/lib/aquariumSwim.ts` (BARU, pure math deterministik)
- `tests/aquariumSwim.test.ts` (BARU)
- `tests/aquariumSceneLayout.test.ts` (BARU)
- `tests/aquariumLifecycle.test.tsx` (hanya tambah case, jangan ubah case lama)
- `package.json` (dilarang kecuali bump versi bila diminta eksplisit di S9 — default JANGAN bump)

Tidak masuk / dilarang diubah:
- `src/lib/aquariumPlaceValueMath.ts`, `src/lib/aquariumQuestionGenerator.ts`, `src/lib/problemGenerator.ts`, `src/lib/arithmetic.ts`, `src/lib/aquariumSound.ts` (hanya boleh dipanggil, tidak boleh ubah API), `src/lib/sound.ts`
- `src/components/math/StackedPlaceValueBoard.tsx`, `src/components/aquarium/PlaceValueZones.tsx`, `src/components/aquarium/AquariumTutorial.tsx`, `src/components/aquarium/AquariumControls.tsx`, `src/components/aquarium/AquariumFeedbackPanel.tsx`, `src/components/aquarium/AquariumProgress.tsx`, `src/components/input/NumericKeypad.tsx`
- `src/screens/AquariumScreen.tsx`, `src/state/*`, `src/i18n/*`, `src/data/levels.ts`, `src/types/*`
- `src/components/garden/*`, `vite.config.ts`, `.github/*`, `src/index.css`
- Seluruh area kebun, cerita, K1/K2, PWA, AdSense, legal.

## Milestones

1. M1 — Puluhan terlihat lagi (S0-S2). Kriteria: soal `34+25` render 5 grup biru + 9 ikan kuning.
2. M2 — Berenang kesana-kemari (S3-S5). Kriteria: ikan bergerak dalam bounds, flip arah, hormati reduced-motion.
3. M3 — Klik menghindar + verifikasi penuh (S6-S9). Kriteria: klik menjauhkan ikan max 1.2 unit, hitungan tetap, semua command hijau.

## Tasks

- [ ] S0 — Rekon baseline read-only
- [ ] S1 — Fix visibility puluhan (`rg*sp` → selalu tampil)
- [ ] S2 — Fix layout `tensPositions`/`onesPositions` agar dalam frustum
- [ ] S3 — Ekstrak pure math renang + flee ke `aquariumSwim.ts`
- [ ] S4 — Implement renang ikan satuan di `Fish3D.tsx`
- [ ] S5 — Implement drift grup puluhan di `TensFishGroup3D.tsx`
- [ ] S6 — Implement klik menghindar (flee) visual-only
- [ ] S7 — Guards a11y + reduced-motion + performa + suara
- [ ] S8 — Tests baru + update lifecycle
- [ ] S9 — Verifikasi akhir + checklist manual

## Risks

- R3F `useFrame` per ikan (19 ikan + 10×N grup) berat di HP kentang. Mitigasi: S3-S5 pakai math murah (`sin/cos`, tanpa alokasi per-frame), `dpr [1,1.5]` dipertahankan, `frameloop='never'` saat hidden dipertahankan.
- Raycast klik di kanvas kecil sulit untuk anak. Mitigasi: hit-area invisible diperbesar, fallback `NumericKeypad` tetap satu-satunya jalur jawaban.
- `Text` dari `@react-three/drei` butuh font fetch; jangan tambah `Text` baru selain label `10` existing.
- Flake pre-existing `tests/screens/PracticeScreenStory.test.tsx` gagal di full-suite tapi lolos terisolasi (catatan memori 2026-09-23). Bukan regresi plan ini bila pola sama.
- Counter-argument: swim penuh + flee menambah kompleksitas vs sekadar wiggle. Dipilih karena user eksplisit minta, tapi dibatasi visual-only agar risiko matematika nol.

## Progress Log

- 2026-09-23 12:00:00 — Plan dibuat dari temuan screenshot `34+25` + analisis `rg*sp=0`. Belum ada implementasi.

---

## Findings (semua harus ditangani minimal satu langkah + verifikasi)

| ID | Temuan / Requirement | Lokasi bukti | Ditangani | Verifikasi |
|---|---|---|---|---|
| F1 | Puluhan `scale 0` karena `animProgress=rg*sp`, `rg=exchanged?1:0`, `sp=opened?1:0` → `0*0=0` default, `1*0=0` setelah form/split. Tidak pernah tampil. | `CheerfulAquarium.tsx:671-679`, `AquariumScene3D.tsx:71-83`, `TensFishGroup3D.tsx:48-51` | S1 | S8-T1, S9 typecheck+manual |
| F2 | `tensPositions` overflow: `startX=-3.8, stepX=2.45, perRow=2, startY=0.75, stepY=1.55` → grup ke-5 `y=-2.35` di bawah pasir `y=-2.2`, `x=-3.8-r1.02=-4.82` mepet frustum. `onesPositions` `x` hingga `~4.4` mepet kanan. | `AquariumScene3D.tsx:16-53`, `AquariumEnvironment3D.tsx:49`, `AquariumCanvas.tsx:71` camera `[0,0,7.2] fov 52` | S2 | S8-T2 layout bounds test |
| F3 | Renang belum ada, hanya `wiggle y ±0.06 + rotasi z ±0.08`. Requirement: berenang kesana-kemari. | `Fish3D.tsx:54-68`, `TensFishGroup3D.tsx:34-46` | S3+S4+S5 | S8-T3/T4 swim bounds test + manual |
| F4 | Klik menghindar belum ada. Requirement: klik ikan → menjauh seperti mau ditangkap. | Tidak ada handler `onClick/onPointerDown` di `Fish3D.tsx:70-109`, `TensFishGroup3D.tsx:50-89` | S3+S6 | S8-T5 flee test + manual |
| F5 | Guards harus dipertahankan: `animationsEnabled`, `prefers-reduced-motion 50ms`, `animating` guard form/split, `aria-hidden=true` kanvas, `NumericKeypad` jalur jawaban. | `ProgressContext.tsx`, `CheerfulAquarium.tsx:139-143,280-416,772-779`, `AquariumCanvas.tsx:41-65` | S7 | S8-T6 + S9 lint |

## Konvensi verifikasi (berlaku semua langkah)

- Command yang tersedia (tidak mengubah repo kecuali `format`): `npm run typecheck` (harap 0 error), `npm run lint` (harap 0 error/warning), `npm test` (harap 0 gagal baru; baseline memori 304 test/36 file, 1 pre-existing gagal `PracticeScreenStory` di full-suite), `npm run format:check` (harap lolos; bila gagal hanya boleh `npm run format` di S9).
- Jangan jalankan `vite dev/build/preview`, `npm run icons`, `lint:fix` kecuali S9. Jangan `git add/commit/staging` apa pun. Hanya file plan ini yang sudah dibuat; implementasi dilarang commit kecuali diminta eksplisit.
- Prettier: no semi, single quote, printWidth 100. TypeScript strict. Jangan pakai `Math.random` di render; pakai seeded `sin` seperti `AquariumEnvironment3D.tsx:18-22`.
- Contoh cara baca file sebelum edit (wajib): pakai Read dengan `filePath` absolut + `offset/limit` untuk blok yang diubah.

---

## S0 — Rekon baseline (read-only, tanpa ubah file apa pun)

- Tujuan langkah: Catat kondisi awal agar regresi terdeteksi, tanpa mengubah repo.
- Finding/requirement: Prasyarat semua langkah, bukan finding.
- Dependency: Tidak ada.
- File yang harus dibaca:
  - `src/components/aquarium/AquariumScene3D.tsx` seluruhnya (99 baris)
  - `src/components/aquarium/Fish3D.tsx` seluruhnya (110 baris)
  - `src/components/aquarium/TensFishGroup3D.tsx` seluruhnya (90 baris)
  - `src/components/aquarium/CheerfulAquarium.tsx:107-143,280-347,671-679`
  - `src/components/aquarium/AquariumCanvas.tsx` seluruhnya (87 baris)
  - `src/components/aquarium/AquariumEnvironment3D.tsx:46-52` (posisi pasir)
  - `tests/aquarium.test.ts`, `tests/aquariumLifecycle.test.tsx`, `tests/setup.ts`, `vite.config.ts:63-68`
- File yang harus diubah: Tidak ada.
- Simbol terkait: `tensPositions`, `onesPositions`, `regroupProgress`, `splitProgress`, `animProgress`, `wiggleOffset`, `animationsEnabled`.
- Kondisi saat ini: Puluhan invisible (F1), layout overflow (F2), wiggle-only (F3), tanpa flee (F4).
- Perubahan konkret: Tidak ada. Hanya catat.
- Urutan perubahan: N/A.
- Behavior dipertahankan: N/A.
- Error handling/edge: N/A. Jika `npm test` gagal selain `PracticeScreenStory`, catat sebagai blocker, jangan lanjut asumsi hijau.
- Test ditambah/diupdate: Tidak ada.
- Input/expected: N/A.
- Command verifikasi: `npm run typecheck`, `npm run lint`, `npm test` (baca saja, jangan ubah). Catat angka di handoff log, bukan file repo.
- Hasil diharapkan: typecheck 0 error, lint 0, test 0 gagal baru (kecuali 1 pre-existing flake).
- Completion criteria: Tiga output tercatat (typecheck/lint/test) + konfirmasi `tens=5, ones=9` untuk `34+25` menghasilkan `rg=0, sp=0, scale=0` di analisis (tanpa ubah kode).
- Tidak boleh diubah: Seluruh `src/*`, `tests/*`, `package.json`, config.

---

## S1 — Fix visibility puluhan (`rg*sp` → selalu tampil)

- Tujuan: Puluhan selalu `scale=1` terlihat, kecuali saat animasi form/split yang memakai `animating`.
- Finding: F1.
- Dependency: S0.
- File dibaca: `src/components/aquarium/AquariumScene3D.tsx:55-99`, `src/components/aquarium/TensFishGroup3D.tsx:15-51`, `src/components/aquarium/CheerfulAquarium.tsx:671-679`.
- File diubah: `src/components/aquarium/AquariumScene3D.tsx` dan `src/components/aquarium/CheerfulAquarium.tsx` (2 file saja).
- Simbol: `AquariumScene3DProps.regroupProgress/splitProgress/animating`, `rg/sp`, `TensFishGroup3DProps.animProgress`.
- Kondisi saat ini:
  ```tsx
  // AquariumScene3D.tsx:71-83
  const rg = Math.min(1, regroupProgress)
  const sp = Math.min(1, splitProgress)
  // ...
  animProgress={rg * sp}
  // CheerfulAquarium.tsx:677-678
  regroupProgress={exchanged ? 1 : 0}
  splitProgress={opened ? 1 : 0}
  // TensFishGroup3D.tsx:48-51
  const s = Math.min(1, animProgress)
  <group position={position} scale={s} ...>
  ```
- Perubahan konkret (urutan dalam file, lakukan persis):
  1. `AquariumScene3D.tsx:60-63` — ubah default props `regroupProgress=1, splitProgress=1` tetap, tapi tambah komentar `// S1: visibility selalu 1, animasi via animating`. Jangan hapus props (kompatibilitas).
  2. `AquariumScene3D.tsx:71-72` — hapus `const rg/sp`, ganti dengan `const visibleScale = 1` + komentar. Dilarang logika lain.
  3. `AquariumScene3D.tsx:78-85` — ganti `animProgress={rg * sp}` menjadi `animProgress={visibleScale}`. Pertahankan `key`, `position`, `highlight`.
  4. `CheerfulAquarium.tsx:671-679` — ganti `regroupProgress={exchanged ? 1 : 0}` menjadi `regroupProgress={1}` dan `splitProgress={opened ? 1 : 0}` menjadi `splitProgress={1}`. Pertahankan `tens/ones/hundreds/highlight/animating` persis. Tambah komentar `// S1: selalu 1 agar puluhan terlihat; animasi via animating`.
  5. `TensFishGroup3D.tsx:48` — ganti `const s = Math.min(1, animProgress)` menjadi `const s = Math.max(0.0001, Math.min(1, animProgress))` agar tidak pernah `scale 0` walau caller kirim 0 (defensive). Jangan ubah `ref/groupRef` lain.
- Behavior dipertahankan: Jumlah grup = `min(tens,19)`, highlight ring, label `10`, `animating` guard form/split di `CheerfulAquarium` tidak disentuh, `visualTens/visualOnes` state machine tidak disentuh.
- Error/edge: `tens=0` → `tPos=[]` render nol grup (bukan satu grup scale 0). `tens>19` → cap 19 dipertahankan. `NaN/undefined regroupProgress` → `visibleScale=1` fallback (jangan `NaN*`).
- Test: Lihat S8-T1. S1 sendiri tanpa test baru, verifikasi via S8.
- Command: `npm run typecheck` (harap 0 error).
- Hasil diharapkan: typecheck bersih, tidak ada import baru.
- Completion: File `34+25` secara logika akan hasilkan 5 grup `scale=1`; tidak ada `0*` tersisa (grep `rg * sp` nol hasil).
- Tidak boleh diubah: `Fish3D.tsx`, `AquariumEnvironment3D.tsx`, `AquariumCanvas.tsx`, lib matematika, generator, `doFormGroup/doSplitGroup`, `NumericKeypad`.

---

## S2 — Fix layout `tensPositions`/`onesPositions` dalam frustum

- Tujuan: Semua grup/ikan dalam frustum kamera `[0,0,7.2] fov 52` + di atas pasir `y=-2.2`, tidak overlap zona.
- Finding: F2.
- Dependency: S1 (harus setelah visibility, agar uji visual valid).
- File dibaca: `src/components/aquarium/AquariumScene3D.tsx:16-53`, `src/components/aquarium/AquariumCanvas.tsx:63-71`, `src/components/aquarium/AquariumEnvironment3D.tsx:46-66`.
- File diubah: `src/components/aquarium/AquariumScene3D.tsx` saja (fungsi `tensPositions`, `onesPositions`, tambah export untuk test).
- Simbol: `tensPositions(count)`, `onesPositions(count,highlight)`, `TENS_BOUNDS`, `ONES_BOUNDS`.
- Kondisi saat ini: `tensPositions` `perRow=2, startX=-3.8, stepX=2.45, startY=0.75, stepY=1.55`; `onesPositions` `startX=1.1, stepX=0.95, startY=0.85, stepY=0.78, cols 3/4`.
- Perubahan konkret (urutan):
  1. Atas file setelah import, tambah exported konstanta (persis):
     ```ts
     export const TENS_BOUNDS = { minX: -3.2, maxX: -0.6, minY: -1.0, maxY: 0.9 } as const
     export const ONES_BOUNDS = { minX: 0.8, maxX: 3.9, minY: -1.0, maxY: 1.0 } as const
     export const TENS_GROUP_RADIUS = 1.02
     ```
  2. Ganti isi `tensPositions` menjadi (jangan ubah signature):
     ```ts
     function tensPositions(count: number): [number, number, number][] {
       const perRow = count <= 4 ? 2 : 3
       const positions: [number, number, number][] = []
       const startX = -2.9
       const stepX = 1.35
       const startY = 0.7
       const stepY = 1.05
       for (let i = 0; i < count; i++) {
         const col = i % perRow
         const row = Math.floor(i / perRow)
         const x = startX + col * stepX
         const y = startY - row * stepY
         const cx = Math.min(TENS_BOUNDS.maxX, Math.max(TENS_BOUNDS.minX, x))
         const cy = Math.min(TENS_BOUNDS.maxY, Math.max(TENS_BOUNDS.minY, y))
         positions.push([cx, cy, 0])
       }
       return positions
     }
     ```
     Catatan: `perRow=3` untuk `count>=5` agar `5 grup` jadi 3+2 baris, `y` terendah `-0.35` (di atas pasir). `x` max `-0.2→clamp -0.6` agar tidak masuk zona satuan.
  3. Ubah `onesPositions` clamp akhir: setelah `positions.push`, tidak perlu ubah rumus grid, tapi bungkus `x,y` dengan clamp ke `ONES_BOUNDS` sebelum push. Jitter `sin/cos` dipertahankan persis.
  4. Tambah `export` pada kedua fungsi: `export function onesPositions...` dan `export function tensPositions...` (agar S8 bisa import tanpa render WebGL). Jangan ubah `useMemo` cap `Math.min(...,19)`.
- Behavior dipertahankan: Urutan index → posisi deterministik, jitter sama, `highlight` hanya geser `z +0.06`, cap 19.
- Error/edge: `count=0` → `[]`; `count<0` → `[]` (tambah guard `if (count<=0) return []`); `count=19` → 7 baris, `y` di-clamp `-1.0` (tumpuk tapi terlihat, tidak hilang di bawah pasir — dokumentasikan sebagai limitasi, bukan bug); overlap antar grup radius 1.02 vs step 1.35/1.05 → sedikit overlap acceptable untuk anak, jangan kecilkan radius.
- Test: S8-T2.
- Command: `npm run typecheck` harap 0 error.
- Completion: `tensPositions(5)` semua dalam `TENS_BOUNDS`, `y>=-1.0`; `onesPositions(9,false)` semua dalam `ONES_BOUNDS`; tidak ada posisi `y=-2.35` lagi.
- Tidak boleh diubah: Camera, fog, lights, pasir/batu/tanaman, `AquariumCanvas` style height, logika `tens/ones` count.

---

## S3 — Ekstrak pure math renang + flee (`aquariumSwim.ts` BARU)

- Tujuan: Sediakan fungsi murni deterministik tanpa `three`/`react` agar bisa di-test di jsdom dan dipakai S4-S6 tanpa analisis ulang.
- Finding: Prasyarat F3+F4 (testability).
- Dependency: S2 (butuh `TENS_BOUNDS/ONES_BOUNDS` final).
- File dibaca: `src/components/aquarium/AquariumEnvironment3D.tsx:17-22` (pola seeded), `src/components/aquarium/Fish3D.tsx:54-68`.
- File diubah: BARU `src/lib/aquariumSwim.ts` saja (jangan ubah file lain di langkah ini).
- Simbol BARU: `SwimBounds {minX,maxX,minY,maxY}`, `seeded01(i:number,s:number):number`, `clampToBounds(x,y,bounds)`, `nextWanderPosition(px,py,time,speed,phase,bounds)`, `fleeTarget(px,py,clickX,clickY,strength,bounds)`, konstanta `ONES_SWIM`, `TENS_DRIFT`.
- Kondisi saat ini: File belum ada.
- Perubahan konkret (urutan dalam file baru, tulis persis struktur):
  1. Header komentar `/** Pure math renang+flee akuarium — deterministik, tanpa three/react. */`.
  2. `export interface SwimBounds { minX:number; maxX:number; minY:number; maxY:number }`.
  3. `export function seeded01(i:number,s:number):number` — salin rumus `Math.sin(i*12.9898+s*78.233)*43758.5453` lalu `x-Math.floor(x)`, return `0..1`.
  4. `export function clampToBounds(x:number,y:number,b:SwimBounds):[number,number]` — `Math.min/max` clamp, handle `NaN` → return center bounds.
  5. `export function nextWanderPosition(px,py,time,speed,phase,bounds):[number,number]` — implementasi: `nx=px+Math.sin(time*speed+phase)*0.35`, `ny=py+Math.cos(time*speed*0.8+phase*1.7)*0.25`, lalu `clampToBounds`. Jika `time<0` atau `speed<=0` → return `[px,py]` clamped. Tanpa `Math.random`.
  6. `export function fleeTarget(px,py,cx,cy,strength,bounds):[number,number]` — `dx=px-cx, dy=py-cy`, `len=Math.hypot(dx,dy)`, jika `len<0.0001` → `dx=1,dy=0.3,len=1`; `nx=px+dx/len*strength`, `ny=py+dy/len*strength*0.8`, clamp. `strength` default `1.2`, clamp `0.5..1.5` di dalam fungsi.
  7. `export const ONES_SWIM = { speedMin:0.5, speedMax:1.1, ampX:0.35, ampY:0.25 } as const`, `export const TENS_DRIFT = { ampX:0.2, ampY:0.15, speed:0.35 } as const`.
  8. Prettier format (single quote, no semi).
- Behavior dipertahankan: Tidak ada behavior lama diubah (file baru).
- Error/edge: Semua fungsi murni, tidak throw kecuali tipe salah (TypeScript cegah). `NaN/Infinity` input → clamp ke center, jangan throw. `bounds` terbalik (`min>max`) → swap di `clampToBounds`.
- Test: S8-T3/T5 langsung uji file ini.
- Command: `npm run typecheck` harap 0 error.
- Completion: File ada, diekspor, `npm run typecheck` lolos, tidak ada import `three`/`react` di file ini (grep `from 'three'` nol hasil).
- Tidak boleh diubah: File komponen 3D mana pun, test existing, `aquariumPlaceValueMath.ts`.

---

## S4 — Renang ikan satuan di `Fish3D.tsx`

- Tujuan: Ikan satuan kuning berenang kesana-kemari dalam `ONES_BOUNDS`, flip arah, ekor goyang, tetap wiggle halus.
- Finding: F3 (satuan).
- Dependency: S3 (wajib pakai `aquariumSwim.ts`, jangan tulis math inline baru).
- File dibaca: `src/components/aquarium/Fish3D.tsx` seluruhnya, `src/lib/aquariumSwim.ts` (hasil S3), `src/components/aquarium/AquariumScene3D.tsx:66-96` (cara `Fish3D` dipanggil).
- File diubah: `src/components/aquarium/Fish3D.tsx` saja.
- Simbol: `Fish3DProps` (+3 props baru opsional), `groupRef`, `posRef`, `useFrame`, `useProgress().progress.animationsEnabled`.
- Kondisi saat ini: `useFrame` hanya sync `x/z` + `y=target+sin*0.06` + `rotation.z`, tanpa gerak `x`, tanpa flip `rotation.y`.
- Perubahan konkret (urutan edit, jangan reorder):
  1. Import tambah di baris 6: `import { clampToBounds, nextWanderPosition, type SwimBounds } from '../../lib/aquariumSwim'`. Jangan ubah import `three/fiber/progress` lain.
  2. `Fish3DProps` tambah 3 field opsional di akhir (pertahankan existing):
     ```ts
     swimBounds?: SwimBounds
     swimSpeed?: number
     swimPhase?: number
     fleeOffset?: [number, number] // diisi S6, default [0,0]; S4 hanya baca, jangan isi logika flee
     ```
  3. Destructure default: `swimBounds = undefined, swimSpeed = 0.8, swimPhase = wiggleOffset, fleeOffset = [0,0]`. `swimPhase` default = `wiggleOffset` agar deterministik per-index tanpa prop baru dari caller.
  4. `useRef` tambah `fleeRef = useRef<[number,number]>([0,0])` + `useEffect` sync `fleeRef.current = fleeOffset` (persis pola `posRef` existing). Jangan ubah `posRef` logic.
  5. Ganti isi `useFrame` menjadi (pertahankan early-return `animationsEnabled`):
     ```ts
     useFrame(({ clock }) => {
       if (!groupRef.current) return
       if (!progress.animationsEnabled) return
       const target = posRef.current
       const t = clock.getElapsedTime() + wiggleOffset
       const hasSwim = !!swimBounds
       let baseX = target[0]
       let baseY = target[1]
       if (hasSwim && swimBounds) {
         const [wx, wy] = nextWanderPosition(target[0], target[1], t, swimSpeed, swimPhase, swimBounds)
         baseX = wx
         baseY = wy
       } else {
         baseY = target[1] + Math.sin(t * 1.2) * 0.06
       }
       const fx = fleeRef.current[0]
       const fy = fleeRef.current[1]
       const wantX = baseX + fx
       const wantY = (hasSwim ? baseY : baseY) + fy
       const clamped = swimBounds ? clampToBounds(wantX, wantY, swimBounds) : ([wantX, wantY] as const)
       // gerak halus: lerp 8%/frame agar tidak teleport
       groupRef.current.position.x += (clamped[0] - groupRef.current.position.x) * 0.08
       groupRef.current.position.y += (clamped[1] - groupRef.current.position.y) * 0.08
       groupRef.current.position.z = target[2]
       // flip arah: bandingkan dengan posisi frame lalu via velocity approx
       const vx = clamped[0] - groupRef.current.position.x
       const desiredY = vx < -0.002 ? Math.PI : 0
       // lerp rotasi y tercepat tanpa snap
       let dy = desiredY - groupRef.current.rotation.y
       // normalisasi -PI..PI
       if (dy > Math.PI) dy -= Math.PI * 2
       if (dy < -Math.PI) dy += Math.PI * 2
       groupRef.current.rotation.y += dy * 0.1
       groupRef.current.rotation.z = Math.sin(t * 0.9) * 0.08
       if (highlight) {
         const s = 1 + Math.sin(t * 2.5) * 0.06
         groupRef.current.scale.set(s * scale, s * scale, s * scale)
       }
     })
     ```
     Jika terlalu panjang, boleh sederhanakan flip menjadi `groupRef.current.rotation.y = wantX > groupRef.current.position.x ? 0 : Math.PI` tapi wajib lerp, dilarang snap langsung tanpa lerp. Ekor goyang: tambah di mesh ekor `rotation={[0, Math.sin(t*6)*0.25, Math.PI/2]}` — butuh `tailRef`? Sederhanakan: biarkan ekor statis di S4, goyang ditangani via `rotation.z` body (jangan tambah ref baru agar atomik).
  6. JSX `return` tidak diubah kecuali tambah `onPointerDown` di S6 (S4 jangan tambah handler).
  7. `AquariumScene3D.tsx` pemanggil `Fish3D` untuk ones: tambah `swimBounds={ONES_BOUNDS}` + `swimSpeed={0.6 + (i%5)*0.12}` + `swimPhase={i*1.37}`. Ini satu-satunya perubahan di `AquariumScene3D` pada langkah ini (baris 87-96). Jangan ubah `tens` mapping di S4.
- Behavior dipertahankan: `position/scale/highlight/wiggleOffset` API lama tetap, `animationsEnabled=false` → diam (return awal), `highlight` pulse sama, `z` tetap `target[2]`, tidak mengubah count.
- Error/edge: `swimBounds=undefined` (misal ikan dalam grup puluhan) → fallback wiggle lama (jangan crash). `prefers-reduced-motion` ditangani S7 (S4 jangan baca `matchMedia` langsung, hanya `animationsEnabled`). `NaN` dari `nextWander` → `clampToBounds` sudah handle center.
- Test: S8-T3 (pure) + manual S9. S4 tanpa test render WebGL (jsdom tidak ada WebGL).
- Command: `npm run typecheck` harap 0 error.
- Completion: Ikan ones bergerak `x` ±0.35, `y` ±0.25 dalam `ONES_BOUNDS`, flip `rotation.y`, tidak keluar bounds setelah 10 detik (cek manual).
- Tidak boleh diubah: `TensFishGroup3D.tsx`, `CheerfulAquarium.tsx`, `AquariumCanvas.tsx`, matematika, `Text`.

---

## S5 — Drift grup puluhan di `TensFishGroup3D.tsx`

- Tujuan: Grup biru (gelembung + 10 ikan + label `10`) drift lambat dalam `TENS_BOUNDS`, ikan di dalam tetap orbit + wiggle, tidak pecah.
- Finding: F3 (puluhan).
- Dependency: S3+S4 (pakai pola swim yang sama, tapi grup bergerak sebagai satu kesatuan).
- File dibaca: `src/components/aquarium/TensFishGroup3D.tsx` seluruhnya, `src/lib/aquariumSwim.ts`, `src/components/aquarium/AquariumScene3D.tsx:78-85`.
- File diubah: `src/components/aquarium/TensFishGroup3D.tsx` saja (+1 baris caller di `AquariumScene3D` bila perlu oper `swimPhase`).
- Simbol: `groupRef`, `ringRef`, `fishPositions`, `TENS_DRIFT`, `SwimBounds`.
- Kondisi saat ini: `useFrame` hanya `rotation.z=sin*0.06` + ring pulse, `position` prop statis.
- Perubahan konkret (urutan):
  1. Import tambah: `import { nextWanderPosition } from '../../lib/aquariumSwim'` + `import { TENS_BOUNDS } from './AquariumScene3D'`. Jangan import `three` tambahan.
  2. Props tambah opsional: `swimPhase?: number` (default 0), `driftEnabled?: boolean` (default true). Jangan ubah `position/highlight/label/animProgress`.
  3. Ref tambah: `baseRef = useRef(position)` + `useEffect` sync `baseRef.current=position` (pola sama `Fish3D`). `groupRef` tetap untuk rotasi+posisi.
  4. Ganti `useFrame` menjadi:
     ```ts
     useFrame(({ clock }) => {
       if (!progress.animationsEnabled) return
       const t = clock.getElapsedTime() + swimPhase
       if (!groupRef.current) return
       if (driftEnabled) {
         const [dx, dy] = nextWanderPosition(baseRef.current[0], baseRef.current[1], t, TENS_DRIFT.speed, swimPhase, TENS_BOUNDS)
         groupRef.current.position.x += (dx - groupRef.current.position.x) * 0.05
         groupRef.current.position.y += (dy - groupRef.current.position.y) * 0.05
         groupRef.current.position.z = baseRef.current[2]
       }
       groupRef.current.rotation.z = Math.sin(t * 0.35) * 0.06
       if (ringRef.current) {
         const s = 1 + Math.sin(t * 1.6) * 0.04
         ringRef.current.scale.set(s, s, 1)
       }
     })
     ```
  5. Inner `Fish3D` mapping (baris 66-75): jangan oper `swimBounds` (biarkan `undefined` → wiggle lokal saja) agar tidak double-swim dengan drift grup. Pertahankan `variant="tens" scale=0.52 wiggleOffset=i*0.45 highlight`. Tambah komentar `// S5: inner fish wiggle-only, drift di grup`.
  6. Caller `AquariumScene3D.tsx:78-85`: tambah `swimPhase={i*0.9}` + `driftEnabled` default (tidak perlu prop). Jangan ubah `animProgress`.
- Behavior dipertahankan: Radius `0.85/0.55`, ring `0.95/1.02`, opacity, label `10` font `0.42`, highlight warna, `scale` defensive S1.
- Error/edge: `driftEnabled=false` atau `animationsEnabled=false` → posisi kembali `baseRef` (tambah fallback di `useFrame` awal bila disabled: `groupRef.current.position.set(...)`). `position` berubah (soal ganti) → `baseRef` sync via effect, drift mulai dari posisi baru (jangan lerp dari posisi lama jauh).
- Test: S8-T4.
- Command: `npm run typecheck` harap 0 error.
- Completion: Grup drift ±0.2 dalam `TENS_BOUNDS`, tidak keluar, inner fish tetap 10 ekor.
- Tidak boleh diubah: `Fish3D.tsx` (sudah S4), `AquariumCanvas`, `CheerfulAquarium`, `Text` props selain existing.

---

## S6 — Klik menghindar (flee) visual-only

- Tujuan: Klik/tap ikan satuan atau grup puluhan → menjauh dari titik klik sejauh `strength 1.2`, decay 2.5 detik, mainkan `playPickFish()`, tidak ubah hitungan.
- Finding: F4.
- Dependency: S3+S4+S5 (butuh `fleeTarget` + `fleeRef` + `baseRef`).
- File dibaca: `src/components/aquarium/Fish3D.tsx` (hasil S4), `src/components/aquarium/TensFishGroup3D.tsx` (hasil S5), `src/lib/aquariumSwim.ts:fleeTarget`, `src/lib/aquariumSound.ts:68-70`, `src/components/aquarium/AquariumScene3D.tsx:78-96`.
- File diubah: `src/components/aquarium/Fish3D.tsx`, `src/components/aquarium/TensFishGroup3D.tsx`, `src/components/aquarium/AquariumScene3D.tsx` (hanya tambah `fleeStrength` wiring bila perlu — default jangan tambah prop baru ke Scene).
- Simbol: `onPointerDown`, `ThreeEvent<PointerEvent>`, `fleeOffset`, `fleeRef`, `playPickFish`.
- Kondisi saat ini: Tidak ada handler pointer di grup/mesh; `fleeOffset` S4 default `[0,0]` tidak pernah diisi.
- Perubahan konkret (urutan, lakukan persis):
  1. `Fish3D.tsx`:
     a. Import tambah: `import { fleeTarget } from '../../lib/aquariumSwim'` (gabung dengan import S4) + `import { playPickFish } from '../../lib/aquariumSound'`.
     b. State tambah: `const [flee, setFlee] = useState<[number,number]>([0,0])` + `useEffect(()=>{ fleeRef.current=flee },[flee])` (ganti sync `fleeOffset` prop S4 — hapus prop `fleeOffset`, pakai state internal agar caller tidak perlu kelola). Hapus `fleeOffset` dari `Fish3DProps` (ganti dengan internal). Ini satu-satunya breaking props S4 yang diizinkan, catat di Notes.
     c. Handler tambah sebelum `return`:
        ```ts
        const handleFlee = (e: { point: { x:number; y:number } }) => {
          if (!progress.animationsEnabled) return
          const cur: [number,number] = [groupRef.current?.position.x ?? posRef.current[0], groupRef.current?.position.y ?? posRef.current[1]]
          const bounds = swimBounds ?? { minX: cur[0]-1, maxX: cur[0]+1, minY: cur[1]-1, maxY: cur[1]+1 }
          const [tx, ty] = fleeTarget(cur[0], cur[1], e.point.x, e.point.y, 1.2, bounds)
          setFlee([tx - posRef.current[0] - (swimBounds ? 0 : 0), ty - posRef.current[1]])
          // Catatan: flee disimpan sebagai offset dari base target, bukan posisi absolut, agar swim tetap jalan
          try { playPickFish() } catch { /* abaikan audio gagal */ }
          window.setTimeout(() => setFlee([0,0]), 2500)
        }
        ```
        Sederhanakan bila tipe R3F sulit: pakai `(e: ThreeEvent<PointerEvent>)` dengan `e.point.x/y`, `e.stopPropagation()`.
     d. JSX: pada `<group ref={groupRef} ...>` tambah `onPointerDown={(e)=>{ e.stopPropagation(); handleFlee(e) }}`. Tambah mesh hit-area invisible sebagai anak pertama:
        ```tsx
        <mesh visible={false} position={[0,0,0]}>
          <sphereGeometry args={[0.55, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        ```
        Jangan ubah body/tail/eye/dot mesh lain.
     e. `useFrame` S4 sudah baca `fleeRef` → tidak perlu ubah selain pastikan `flee` decay via timeout di atas. Tambah cleanup timeout via `useEffect` return `clearTimeout` (simpan id di ref).
  2. `TensFishGroup3D.tsx`:
     a. Import `fleeTarget` + `playPickFish` sama.
     b. State `const [fleeG,setFleeG]=useState<[number,number]>([0,0])`, timeout ref, cleanup.
     c. Handler `handleGroupFlee(e)` sama tapi `bounds=TENS_BOUNDS`, `strength=1.0` (grup lebih berat), `setFleeG([tx-baseRef.current[0], ty-baseRef.current[1]])`, timeout 2200ms.
     d. JSX `<group ... onPointerDown={...}>` + hit-area `<mesh visible={false}><sphereGeometry args={[1.25,8,8]}/><meshBasicMaterial .../></mesh>` sebagai anak pertama sebelum ring.
     e. `useFrame` S5: tambah `+ fleeG` ke target: `dx+fleeG[0], dy+fleeG[1]` sebelum lerp, clamp ke `TENS_BOUNDS`.
  3. `AquariumScene3D.tsx`: tidak tambah prop flee (internal state cukup). Pastikan `swimBounds={ONES_BOUNDS}` dari S4 tetap diteruskan agar flee ter-clamp benar.
- Behavior dipertahankan: Klik tidak ubah `visualTens/visualOnes`, tidak panggil `doFormGroup/doSplitGroup`, tidak ubah `onesAnswer/tensAnswer`, tidak navigasi. `NumericKeypad` tetap satu-satunya input jawaban. Kanvas `aria-hidden=true` dipertahankan (interaksi 3D murni visual, screen-reader pakai badge `PlaceValueZones`).
- Error/edge:
  - Klik cepat berulang → throttle: jika `flee` masih aktif (`len>0.05`), abaikan klik baru (guard `if (Math.hypot(flee[0],flee[1])>0.05) return`).
  - Klik tepat di tengah ikan (`len<0.0001`) → `fleeTarget` sudah handle arah default `(1,0.3)`.
  - Audio gagal/`playPickFish` throw → try/catch, jangan blokir flee.
  - `animationsEnabled=false` atau `prefers-reduced-motion` (S7) → `handleFlee` return awal, tidak ada gerak.
  - Unmount sebelum timeout → clearTimeout di cleanup effect.
  - jsdom tanpa WebGL → handler tidak di-test via render, hanya pure `fleeTarget` di S8.
- Test: S8-T5.
- Command: `npm run typecheck` harap 0 error (tipe `ThreeEvent` harus import dari `@react-three/fiber`).
- Completion: Klik ikan → posisi bergeser menjauh ≤1.5 unit, kembali dalam 2.5 detik, badge count tidak berubah, tidak ada error console.
- Tidak boleh diubah: `CheerfulAquarium` state machine, `PlaceValueZones`, `NumericKeypad`, validator `isCorrectAt`, suara selain `playPickFish`.

---

## S7 — Guards a11y + reduced-motion + performa + suara

- Tujuan: Pastikan renang+flee hormati preferensi gerak, low-power, dan tidak merusak a11y/audio existing.
- Finding: F5.
- Dependency: S4+S5+S6.
- File dibaca: `src/components/aquarium/AquariumCanvas.tsx:41-65`, `src/components/aquarium/CheerfulAquarium.tsx:139-143`, `src/state/ProgressContext.tsx` (field `animationsEnabled`), `tests/setup.ts:48-62` (stub matchMedia).
- File diubah: `src/components/aquarium/Fish3D.tsx` (tambah cek reduced-motion), `src/components/aquarium/TensFishGroup3D.tsx` (sama), `src/components/aquarium/AquariumCanvas.tsx` (hanya tambah komentar + pastikan `aria-hidden`, dilarang ubah camera).
- Simbol: `window.matchMedia('(prefers-reduced-motion: reduce)')`, `progress.animationsEnabled`, `frameloop`, `dpr`.
- Kondisi saat ini: `Fish3D/Tens` hanya cek `animationsEnabled`; `CheerfulAquarium` punya `prefersReducedMotion` ref untuk durasi 50ms tapi tidak diteruskan ke 3D; `AquariumCanvas` `aria-hidden=true`, `dpr [1,1.5]`, `frameloop never when hidden`.
- Perubahan konkret (urutan):
  1. `Fish3D.tsx` + `TensFishGroup3D.tsx`: di atas `useFrame`, tambah `const reducedRef = useRef(false)` + `useEffect(()=>{ try{ reducedRef.current = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches }catch{ reducedRef.current=false } },[])`. Di `useFrame` awal tambah `if (reducedRef.current) { /* fallback wiggle mini, skip wander/drift/flee */ }` — implementasi: bila reduced, hanya lakukan `position.y=target[1]+sin*0.02`, skip `nextWander/flee`, skip `rotation.y` flip. Di `handleFlee` tambah `if (reducedRef.current) return`.
  2. `AquariumCanvas.tsx`: pastikan tidak berubah kecuali komentar `// S7: kanvas visual-only, aria-hidden=true dipertahankan, jawaban via NumericKeypad`. Verifikasi `aria-hidden="true"` tetap ada, `dpr={[1,1.5]}`, `frameloop={hidden?'never':'always'}`, `powerPreference:'low-power'` tetap. Bila ada yang hilang, kembalikan (bukan ubah).
  3. Suara: pastikan hanya `playPickFish()` dipanggil di flee, tidak ada `speak()` baru. Jangan tambah `autoplay`.
- Behavior dipertahankan: Toggle animasi di Settings mematikan semua gerak; reduced-motion mempersingkat durasi form/split 50ms (existing) + menonaktifkan swim/flee (baru); unmount batalkan audio (existing test).
- Error/edge: `window.matchMedia` undefined (jsdom lama) → try/catch false; `progress.animationsEnabled` undefined → default gerak (jangan crash, pakai `if (!progress?.animationsEnabled) return` hanya bila false eksplisit? Pertahankan pola existing `if (!progress.animationsEnabled) return`).
- Test: S8-T6.
- Command: `npm run lint` harap 0 warning (perhatikan `react-hooks/exhaustive-deps` untuk `reducedRef`).
- Completion: Dengan `animationsEnabled=false` atau `matchMedia reduce=true`, ikan diam (hanya render statis), klik tidak gerak, tidak error.
- Tidak boleh diubah: `ProgressContext`, `setup.ts`, `CheerfulAquarium` timers, `AquariumControls`, suara API.

---

## S8 — Tests baru + update lifecycle

- Tujuan: Setiap finding punya verifikasi otomatis tanpa WebGL.
- Finding: F1-F5.
- Dependency: S1-S7 selesai (test ditulis setelah implementasi agar API final).
- File dibaca: `tests/aquarium.test.ts:1-20`, `tests/aquariumLifecycle.test.tsx:59-109`, `tests/helpers/renderWithProviders.tsx`, `src/lib/aquariumSwim.ts`, `src/components/aquarium/AquariumScene3D.tsx:16-53`.
- File diubah: BARU `tests/aquariumSwim.test.ts`, BARU `tests/aquariumSceneLayout.test.ts`, tambah case di `tests/aquariumLifecycle.test.tsx` (append only).
- Simbol: `seeded01`, `clampToBounds`, `nextWanderPosition`, `fleeTarget`, `tensPositions`, `onesPositions`, `TENS_BOUNDS`, `ONES_BOUNDS`.
- Kondisi saat ini: `tests/aquarium.test.ts` hanya lib matematika, tidak ada test layout/swim/flee. `tensPositions/onesPositions` belum diekspor (S2 mengekspor).
- Perubahan konkret (urutan file):
  1. `tests/aquariumSwim.test.ts` BARU (struktur persis):
     - Import `describe,it,expect` + 4 fungsi dari `../src/lib/aquariumSwim`.
     - T1 `seeded01 deterministik`: input `(3,0.11)` dua kali → sama, range `0..1`, `(3,0.11)!==(3,0.23)`.
     - T3 `nextWanderPosition dalam bounds`: `bounds={minX:0.8,maxX:3.9,minY:-1,maxY:1}`, `nextWanderPosition(2,0,10,0.8,1.37,bounds)` → dalam bounds; `time=-1` → return clamped input; panggil 50 time berbeda → semua dalam bounds.
     - T5 `fleeTarget menjauh`: `px=2,py=0,cx=1.5,cy=0,strength=1.2` → `tx>2`, dalam bounds; `len~0` (`px==cx`) → tidak `NaN`, `tx>px`; `strength=99` → di-clamp dalam bounds (tidak keluar).
     - `clampToBounds NaN` → return center bounds, tidak throw.
  2. `tests/aquariumSceneLayout.test.ts` BARU:
     - T1 (F1 regresi logika visibility): dokumentasikan `visibleScale=1` — test tidak render WebGL, tapi assert `tensPositions(5).length===5` dan `tensPositions(0).length===0`, `Math.min(5,19)===5`. Komentar `// F1: scale selalu 1, diverifikasi manual S9 + T1 layout`.
     - T2 (F2): `tensPositions(5)` semua `x in [-3.2,-0.6], y in [-1.0,0.9]`; `tensPositions(1)[0]` sama deterministik dua panggil; `onesPositions(9,false)` semua dalam `ONES_BOUNDS`; `onesPositions(0,false)=[]`; `tensPositions(19)` semua dalam bounds (clamped, tidak `y=-2.35`).
  3. `tests/aquariumLifecycle.test.tsx` append (jangan ubah case lama):
     - T6 (F5): `matchMedia reduce` stub ada + `animationsEnabled` default boolean (baca dari `renderScreenWithProviders` + `ProgressContext`? Sederhanakan: assert `typeof window.matchMedia==='function'` dan `AquariumScreen` render heading tanpa throw saat `animationsEnabled` false — cukup dokumentasi, jangan mock WebGL).
- Behavior dipertahankan: Semua case lama tidak diubah satu karakter pun. Test baru tidak import `three`/`fiber`/`drei` (hanya pure lib + layout helpers) agar lolos di jsdom tanpa WebGL.
- Error/edge: `tensPositions` import gagal bila belum diekspor S2 → blocker (jangan duplikasi logika di test). `window.matchMedia` stub di `setup.ts` return `matches:false` → test reduced harus mock `matches:true` lokal via `vi.spyOn(window,'matchMedia')` lalu restore.
- Input/expected spesifik:
  - `seeded01(3,0.11)` → `0<=v<1`, deterministik.
  - `fleeTarget(2,0,1.5,0,1.2,{minX:0.8,maxX:3.9,minY:-1,maxY:1})` → `tx>2.0`, `tx<=3.9`.
  - `tensPositions(5)` → `[[≈-2.9,0.7],[≈-1.55,0.7],[≈-0.2→-0.6,0.7],[≈-2.9,-0.35],[≈-1.55,-0.35]]` (toleransi clamp, assert bounds bukan nilai eksak kecuali `length`).
- Command: `npm test -- tests/aquariumSwim.test.ts tests/aquariumSceneLayout.test.ts` harap lulus; lalu `npm test` full harap 0 gagal baru.
- Completion: 2 file baru hijau + lifecycle append hijau, tidak ada case lama diubah.
- Tidak boleh diubah: `tests/aquarium.test.ts`, `tests/aquariumCheck.test.tsx` existing cases, `tests/setup.ts`, `vite.config.ts`.

---

## S9 — Verifikasi akhir + checklist manual

- Tujuan: Kunci kualitas sebelum handoff, tanpa commit.
- Finding: Semua (gate akhir).
- Dependency: S1-S8.
- File dibaca: Tidak ada (hanya jalankan command + baca output). Bila `format:check` gagal, baca file yang disebut output saja.
- File diubah: Tidak ada. Pengecualian tunggal: bila `npm run format:check` gagal, boleh jalankan `npm run format` (menulis file) lalu ulangi `format:check`. Selain itu dilarang ubah file apa pun di S9. Dilarang bump `package.json:version` kecuali diminta eksplisit user berikutnya.
- Simbol: N/A.
- Kondisi saat ini: Implementasi + test selesai, belum diverifikasi penuh.
- Perubahan konkret (urutan command, jalankan persis):
  1. `npm run typecheck` → harap `0 error`.
  2. `npm run lint` → harap `0 error/warning`.
  3. `npm run format:check` → harap semua lolos; bila gagal, `npm run format` sekali lalu ulangi.
  4. `npm test -- tests/aquariumSwim.test.ts tests/aquariumSceneLayout.test.ts tests/aquarium.test.ts tests/aquariumLifecycle.test.tsx tests/aquariumCheck.test.tsx` → harap semua lulus.
  5. `npm test` full → harap 0 gagal baru (1 pre-existing `PracticeScreenStory` full-suite boleh gagal asal lolos terisolasi `npm test -- tests/screens/PracticeScreenStory.test.tsx`; catat bila begitu).
- Behavior dipertahankan: N/A (gate).
- Error/edge: Bila `typecheck` error `ThreeEvent` → import type dari `@react-three/fiber` (`import type { ThreeEvent } from '@react-three/fiber'`), bukan dari `three`. Bila `lint exhaustive-deps` → tambah deps atau `useCallback` sesuai pesan, jangan disable rule. Bila `format` ubah banyak file → catat di handoff, jangan revert manual.
- Test: Tidak tambah test di S9.
- Input/expected: Output command persis seperti di atas.
- Command verifikasi: Lihat daftar 1-5.
- Hasil diharapkan: Lihat tiap command.
- Completion criteria (semua harus ya):
  - [ ] `typecheck` 0 error
  - [ ] `lint` 0
  - [ ] `format:check` lolos
  - [ ] 5 file test akuarium lulus terisolasi
  - [ ] Full suite 0 gagal baru
  - [ ] Manual (browser bila tersedia, bila tidak tulis `SKIP-manual` dengan alasan): `34+25` tampil 5 biru+9 kuning; tambah carry `29+14` + kurang borrow `32-18` tetap benar hitungan; ikan bergerak 10 detik dalam bounds; klik ikan menjauh lalu kembali; `360px` + desktop tidak overflow; reduced-motion diam; suara klik tidak tumpuk.
- Tidak boleh diubah: Semua file kecuali hasil `npm run format` bila diperlukan. Dilarang `git add/commit/push`, dilarang `vite build/dev`, dilarang `icons`.

---

## Open Questions / Blockers (jangan pilih diam-diam, butuh user)

1. **Bounds vs kamera sempit 360px**: `TENS_BOUNDS maxX=-0.6` + `ONES_BOUNDS minX=0.8` sisakan gap 1.4 agar tidak overlap di tengah. Di layar sangat sempit, frustum efektif menyempit walau kamera sama karena aspect. Opsi A: pertahankan (rekomendasi — kamera `fov 52` + `half-width ~7.7` di desktop, di 360px masih muat karena kanvas `min(58vw,320px)`). Opsi B: tambah responsive `camera.zoom` via `useThree size`. Risiko B: ubah framing semua soal. Rekomendasi: A, verifikasi manual 360px di S9.
2. **Flee grup vs individu**: Dipilih grup utuh menjauh (S6) agar invariansi `10 ikan=1 kelompok` terjaga visual. Opsi alternatif pecah individu ditolak karena merusak metafora nilai tempat. Bila user ingin individu dalam grup juga bisa diklik, tetap flee grup (bukan individu).
3. **Flee memengaruhi hitungan?**: Dipilih visual-only (tidak). Opsi B (klik untuk memilih/menghitung) ditolak karena konflik dengan `NumericKeypad` + a11y. Bila user ingin mode "tangkap ikan untuk menjawab", butuh plan terpisah (state machine baru, bukan scope ini).
4. **Ekor goyangAdvance**: S4 menyederhanakan goyang via `rotation.z` body. Opsi tail-bone terpisah ditunda untuk hemat perf. Bila user minta ekor realistis, tambah `tailRef` di plan lanjutan.

---

## Handoff Checklist (untuk model eksekutor kecil)

- [ ] Kerjakan S0→S9 berurutan, jangan lompat. Setiap langkah baca file yang disebut sebelum edit.
- [ ] Setiap edit: `oldString` dari file saat ini, `newString` minimal, jaga indentasi Prettier (single quote, no semi, width 100).
- [ ] Setelah S1: grep `rg * sp` harus nol hasil di `AquariumScene3D.tsx`.
- [ ] Setelah S2: `tensPositions`/`onesPositions` diekspor, ada `TENS_BOUNDS/ONES_BOUNDS`.
- [ ] Setelah S3: `src/lib/aquariumSwim.ts` ada, tanpa import `three/react`, `typecheck` hijau.
- [ ] Setelah S4-S6: `typecheck` hijau tiap langkah, jangan lanjut bila merah.
- [ ] Setelah S8: 2 file test baru hijau terisolasi.
- [ ] Setelah S9: isi Progress Log di file plan ini? DILARANG — plan ini sudah final, jangan update file plan saat eksekusi kecuali diminta. Catat hasil verifikasi di jawaban chat, bukan file.
- [ ] Dilarang: ubah matematika/generator/level/i18n/screens/state/garden, bump version, commit, `vite build`, `icons`.
- [ ] Bila temui keputusan tak terduga: berhenti, catat sebagai blocker baru di chat, jangan pilih diam-diam.
- [ ] Selesai: kembalikan ringkasan + output 5 command S9 + status manual (`PASS`/`SKIP-manual` + alasan).

## Notes

- Screenshot acuan: soal `34+25` (Soal 2 dari 5, 40%), badge `5 kelompok · 50` + `9 ikan`, kanvas hanya 9 kuning kanan, kiri kosong. Root cause F1 + F2 di atas, bukan data soal.
- Prinsip arsitektur: Database as Code / TOGAF tidak relevan (full client-side, tanpa DB). Domain C2M/TM Forum tidak relevan (edukasi nilai tempat, bukan telecom rating). Jangan tambah abstraksi enterprise.
- Pola kode yang dipertahankan: seeded deterministik `sin`, shared geometries/materials di `Fish3D`, `dispose={null}`, `low-power`, `fog`, `Suspense lazy Scene`, `aria-hidden` kanvas + `sr-only` count, `playPickFish` untuk tap.
- Perubahan props `Fish3D.fleeOffset` S4→S6: S4 perkenalkan sebagai prop, S6 ganti internal state. Eksekutor wajib ikuti S6 final (internal state, bukan prop) agar caller `AquariumScene3D` tidak perlu kelola flee. Bila sudah terlanjur implement prop di S4, hapus di S6.
- File plan ini satu-satunya file yang boleh dibuat di sesi ini. Implementasi oleh model berikutnya dilarang membuat file selain yang disebut di Scope (1 lib + 2 test).
