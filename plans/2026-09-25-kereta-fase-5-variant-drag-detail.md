# Kereta Fase 5 — Variant Kereta, Drag Kamera, Detail Objek, Maneuver Belok

Created: 2026-09-25 18:00:00

## Objective

Tingkatkan daya tarik visual mini game kereta dengan 4 peningkatan: (1) detail objek lingkungan lebih kaya via `InstancedMesh`, (2) drag kiri-kanan untuk melihat sekitar (yaw + auto-return), (3) randomisasi bentuk & warna lokomotif + gerbong (tersimpan di snapshot), (4) maneuver belok lebih halus (mundur sedikit → jeda → maju + belok).

## Keputusan pengguna yang sudah final (jangan tanyakan ulang)

1. Budget baru: **≤82 mesh + InstancedMesh, ≤90 draw call total**.
2. Drag kamera: **auto-return ke tengah saat kereta bergerak** (opsi B).
3. Variant kereta **disimpan di snapshot** (resume tampil sama).
4. Timing maneuver belok: default `MANEUVER_BACK_MS = 350` + `MANEUVER_PAUSE_MS = 250` sebagai konstanta terpisah untuk review pengguna nanti.

Sub-keputusan dari rekomendasi (pengguna belum menolak):
- Drag = **yaw saja** (tanpa pitch).
- Jumlah gerbong **1–2** (tidak 0) untuk menjaga janji "kereta dengan gerbong".

## Scope

In scope:
- `src/lib/trainVariants.ts` (baru, pure): `pickTrainVariant(seed?)`, `isValidTrainVariant`, `_variantHelpers`.
- `src/lib/trainManeuver.ts` (baru, pure): `computeManeuver(elapsedMs)`, `MANEUVER_BACK_MS`, `MANEUVER_PAUSE_MS`.
- `src/lib/trainStorage.ts`: `TrainSessionSnapshot.variant?` + validasi.
- `src/components/train/TrainScene.ts`: `applyTrainVariant`, maneuver belok, drag kamera (yaw + auto-return), detail objek via InstancedMesh.
- `src/components/train/TrainCanvas.tsx`: prop `trainVariant` + `touch-action: none`.
- `src/screens/TrainScreen.tsx`: `pickTrainVariant` di start, `variant` dari snapshot saat resume, simpan ke snapshot tiap ronde, timer `SWITCHING_TRACK` 500→900ms.
- Test baru: `tests/trainVariants.test.ts`, `tests/trainManeuver.test.ts`; update `tests/trainSessionStorage.test.ts`.
- Verifikasi penuh + manual + memory + bump `1.8.0` → `1.9.0`.

Out of scope (dilarang):
- Dependensi baru; file audio/model biner; physics engine; post-processing; shader kompleks; shadow.
- Perubahan gameplay: generator soal, state machine 14 state, bintang 3/2/1, mapping cabang, `GradeLevel`, `LEVELS`, ResultScreen, achievement, TTS/repeat/resume logic existing (kecuali tambah `variant`).
- `vite.config.ts`, CI, `BottomNavigation`, `TAB_SCREENS`, `ProgressContext`, `storage.ts`, `scoring.ts`, file Aquarium/Garden, `sound.ts`, `trainMusic.ts`, `trainNarration.ts`, `QuestionDialog.tsx`, `TrainMenu.tsx`, `TrainHUD.tsx`.
- Kata "gagal" di UI train.

## Milestones

1. M1 logika murni (S1–S2) — variant + maneuver, test dulu.
2. M2 snapshot variant (S3).
3. M3 scene: variant render (S4) → maneuver (S5) → drag (S6) → detail instanced (S7).
4. M4 wiring + verifikasi (S8–S10).

## Tasks

- [x] S0 audit read-only state `bcec2aa`
- [x] S1 `trainVariants.ts` (pure) + test
- [x] S2 `trainManeuver.ts` (pure) + test
- [x] S3 snapshot `variant?` + validasi + test
- [x] S4 `TrainScene.applyTrainVariant` (3 bentuk loko + 3 jenis gerbong)
- [x] S5 maneuver belok di `TrainScene` + timer `TrainScreen` 900ms
- [x] S6 drag kamera yaw + auto-return
- [x] S7 detail objek via InstancedMesh (umum + per tema)
- [x] S8 wiring `TrainCanvas`/`TrainScreen` (variant + snapshot)
- [x] S9 verifikasi otomatis (lint, typecheck, test, build, format, grep)
- [x] S10 checklist manual + memory + bump 1.9.0 (tanpa commit)

## Risks

- R1: InstancedMesh menambah kompleksitas dispose — mitigasi: traverse existing sudah menangkap `isMesh`; `InstancedMesh` adalah `Mesh` subclass sehingga geometry/material-nya ikut ter-dispose; verifikasi di S9.
- R2: Rebuild trainGroup saat `applyTrainVariant` berpotensi leak — mitigasi: dispose geometry/material lama secara eksplisit sebelum rebuild (pola sama seperti `setAnswers` yang reuse texture).
- R3: Drag listener bocor saat unmount — mitigasi: listener dipasang di `TrainScene` (canvas) dan dilepas di `dispose()`; `pointercancel` ditangani.
- R4: Maneuver bentrok dengan guard `paused`/`disposed` — mitigasi: timeline di-reset saat `reset()`/`setBranch`; reduced-motion skip maneuver.
- R5: Snapshot lama tanpa `variant` → valid (fallback roll baru saat resume) — dijaga oleh `variant?` opsional + validasi kondisional.
- R6: Model kecil menyimpang API — signature exact tiap langkah; larangan improvisasi nama.

## Requirement Traceability Matrix

| ID | Finding / requirement | Langkah | Verifikasi |
|----|------------------------|---------|------------|
| F1 | Detail objek lebih kaya (poin 1) | S7 | manual + build |
| F2 | Drag kiri-kanan lihat sekitar (poin 2) | S6 | manual |
| F3 | Randomize loko + gerbong (poin 3) | S1, S4, S8 | test + manual |
| F4 | Variant konsisten saat resume (poin 3) | S3, S8 | test + manual |
| F5 | Maneuver belok halus (poin 4) | S2, S5 | test + manual |
| F6 | Budget ≤82 mesh + instanced ≤90 draw call | S7 | S9 audit |
| C1 | Tanpa dep/biner baru; tanpa shadow/fisika/shader | S4–S7 | S9 grep + build |
| C2 | Lifecycle bersih (dispose + listener) | S4, S6, S7 | S9 + S10 restart |
| C3 | Reduced-motion & fallback 2D utuh | S5, S6 | S10 manual |
| C4 | Tanpa kata "gagal" | — | S9 grep |

---

## S0 — Audit read-only state `bcec2aa`

- Tujuan: kunci pemahaman API existing; tanpa ubah file.
- File yang harus dibaca (6 file, penuh):
  1. `src/components/train/TrainScene.ts` (field, `buildTrain`, `buildEnvironment`, `update`, `updateCamera`, `dispose`, `setBranch`, `reset`).
  2. `src/components/train/TrainCanvas.tsx` (props, mount effect, cleanup).
  3. `src/screens/TrainScreen.tsx` (`handleStart`, `handleResumeSession`, `handleReachStation`, `handleAnswer` benar, render `TrainCanvas`).
  4. `src/lib/trainStorage.ts` (`TrainSessionSnapshot`, `isValidTrainSession`, `isValidQuestion`).
  5. `src/lib/trainQuestionGenerator.ts` (tipe).
  6. `tests/trainSessionStorage.test.ts` (pola case).
- File diubah: tidak ada.
- Kondisi saat ini: versi `1.8.0`; scene 82 mesh; kereta tunggal (loko merah + 1 gerbong kuning); kamera 4 mode tanpa drag; `setBranch` langsung pindah ke cabang; snapshot punya `version/grade/questions/round/attemptsLog/savedAt`.
- Perubahan konkret: tidak ada.
- Command: tidak ada.
- Completion: 6 file dibaca; tidak ada file berubah.
- Tidak boleh diubah: semua file.

---

## S1 — `trainVariants.ts` (pure) + test

- Tujuan: generator variant kereta deterministik berbasis seed.
- Finding: F3.
- Dependency: S0.
- File dibaca: `src/lib/trainQuestionGenerator.ts` (pola `randomInt`).
- File diubah: buat `src/lib/trainVariants.ts`; buat `tests/trainVariants.test.ts`.
- Simbol exact:
  ```ts
  export type LocoShape = 'classic' | 'diesel' | 'tank'
  export type WagonKind = 'boxcar' | 'tanker' | 'flatbed'
  export interface TrainVariantWagon { kind: WagonKind; color: string }
  export interface TrainVariant {
    loco: LocoShape
    locoColor: string
    wagons: TrainVariantWagon[]
  }
  export function pickTrainVariant(seed?: number): TrainVariant
  export function isValidTrainVariant(v: unknown): boolean
  export const _variantHelpers: {
    LOCO_SHAPES: readonly LocoShape[]
    WAGON_KINDS: readonly WagonKind[]
    LOCO_COLORS: readonly string[]
    WAGON_COLORS: readonly string[]
  }
  ```
- Perubahan konkret (urut):
  1. `LOCO_SHAPES = ['classic', 'diesel', 'tank']`; `WAGON_KINDS = ['boxcar', 'tanker', 'flatbed']`.
  2. `LOCO_COLORS = ['#e05555', '#3f9e5a', '#3b82f6', '#8b5cf6', '#f59e0b']`; `WAGON_COLORS = ['#f5b942', '#e2e8f0', '#a3e635', '#f472b6', '#60a5fa']`.
  3. Helper privat `mulberry32(seed: number): () => number` (PRNG deterministik 10 baris) + `randInt(rng, max)`.
  4. `pickTrainVariant(seed?)`: bila `seed` undefined → `Math.random() * 2 ** 32`; `rng = mulberry32(seed >>> 0)`; pilih `loco`, `locoColor`; `wagonCount = 1 + randInt(rng, 2)` (1 atau 2); tiap gerbong pilih `kind` + `color` unik-kind bila 2 gerbong (jangan sama jenis).
  5. `isValidTrainVariant(v)`: `isRecord`-like cek inline (tanpa import): `loco ∈ LOCO_SHAPES`, `locoColor` string diawali `#`, `Array.isArray(wagons) && length 1..2`, tiap wagon `kind ∈ WAGON_KINDS` + `color` string.
  6. Export `_variantHelpers`.
- Behavior dipertahankan: pure, tanpa react/three; tidak menyentuh file lain.
- Error/edge: `seed` negatif/pecahan → `>>> 0`; 2 gerbong tidak boleh sama jenis (retry sekali, fallback ke kind berikutnya); `seed` 0 valid.
- Test `tests/trainVariants.test.ts` (5 case):
  - seed sama → `JSON.stringify` hasil sama (determinisme).
  - 50 seed berbeda → minimal 2 `loco` berbeda muncul (variasi).
  - semua hasil: `loco ∈ LOCO_SHAPES`, `locoColor ∈ LOCO_COLORS`, `wagons.length ∈ {1,2}`, tiap `kind ∈ WAGON_KINDS`, `color ∈ WAGON_COLORS`.
  - 2 gerbong → jenis berbeda.
  - `isValidTrainVariant` menolak: `null`, `{loco:'x'}`, `wagons: []`, `wagons: [3]`, warna tanpa `#`.
- Command: `npm test -- tests/trainVariants.test.ts` lalu `npm run typecheck`.
- Hasil: 5 case hijau; typecheck 0.
- Completion: tipe + 2 fungsi + helpers exact; tanpa import three/react.
- Tidak boleh diubah: `trainQuestionGenerator.ts`, i18n, storage.

---

## S2 — `trainManeuver.ts` (pure) + test

- Tujuan: timeline maneuver belok yang bisa diuji tanpa WebGL.
- Finding: F5.
- Dependency: S0.
- File dibaca: tidak ada yang spesifik.
- File diubah: buat `src/lib/trainManeuver.ts`; buat `tests/trainManeuver.test.ts`.
- Simbol exact:
  ```ts
  export const MANEUVER_BACK_MS = 350
  export const MANEUVER_PAUSE_MS = 250
  export const MANEUVER_TOTAL_MS = MANEUVER_BACK_MS + MANEUVER_PAUSE_MS
  export type ManeuverPhase = 'back' | 'pause' | 'forward'
  export function computeManeuver(elapsedMs: number): { phase: ManeuverPhase; t: number }
  ```
- Perubahan konkret:
  1. Konstanta exact di atas (pengguna akan review nilai ini).
  2. `computeManeuver(elapsedMs)`: bila `elapsedMs <= 0` → `{ phase: 'back', t: 1 }`; bila `< MANEUVER_BACK_MS` → fase `back`, `t = 1 - 0.07 * easeOut(progress)` dengan `easeOut(x) = 1 - (1-x) ** 2`, `progress = elapsedMs / MANEUVER_BACK_MS` (t turun dari 1 ke 0.93); bila `< MANEUVER_TOTAL_MS` → `{ phase: 'pause', t: 0.93 }`; else → `{ phase: 'forward', t: 0.93 }` (scene melanjutkan sendiri dari 0.93).
  3. Guard: `elapsedMs` NaN/Infinity → perlakukan sebagai `0`.
- Behavior dipertahankan: pure, tanpa three/react.
- Error/edge: nilai negatif → fase `back` t=1; nilai sangat besar → `forward`.
- Test `tests/trainManeuver.test.ts` (4 case):
  - `computeManeuver(0)` → `{ back, 1 }`; `(350)` → `{ pause, 0.93 }` (dibulatkan 2 desimal); `(600)` → `{ forward, 0.93 }`.
  - Timeline monoton: `t` pada fase back tidak pernah naik.
  - `MANEUVER_TOTAL_MS === 600`.
  - `computeManeuver(NaN)` → `{ back, 1 }`; `computeManeuver(-5)` → `{ back, 1 }`.
- Command: `npm test -- tests/trainManeuver.test.ts` lalu `npm run typecheck`.
- Hasil: 4 case hijau; typecheck 0.
- Completion: konstanta + fungsi exact; test hijau.
- Tidak boleh diubah: file lain.

---

## S3 — Snapshot `variant?` + validasi + test

- Tujuan: variant kereta tersimpan di snapshot agar resume tampil sama.
- Finding: F4.
- Dependency: S1.
- File dibaca: `src/lib/trainStorage.ts`, `src/lib/trainVariants.ts`, `tests/trainSessionStorage.test.ts`.
- File diubah: `src/lib/trainStorage.ts`; `tests/trainSessionStorage.test.ts` (+2 case).
- Simbol exact:
  ```ts
  // di TrainSessionSnapshot
  variant?: TrainVariant
  ```
- Perubahan konkret:
  1. Import `import { isValidTrainVariant, type TrainVariant } from './trainVariants'`.
  2. `TrainSessionSnapshot`: tambah `variant?: TrainVariant`.
  3. `isValidTrainSession`: tambah cek `if (value.variant !== undefined && !isValidTrainVariant(value.variant)) return false`.
  4. Tidak ada perubahan pada fungsi lain.
- Behavior dipertahankan: snapshot lama (tanpa `variant`) tetap valid; `version` tetap 1.
- Error/edge: `variant` rusak → invalid → load null; `variant: null` (eksplisit) → invalid karena `null !== undefined` dan `isValidTrainVariant(null)` false.
- Test `tests/trainSessionStorage.test.ts` (+2, jangan ubah 5 existing):
  - "snapshot lama tanpa variant tetap valid": buat snapshot, `delete variant` → `isValidTrainSession` true.
  - "variant rusak ditolak": `variant: { loco: 'x', locoColor: 'red', wagons: [] }` → false; `variant: null` → false.
- Command: `npm test -- tests/trainSessionStorage.test.ts tests/trainVariants.test.ts` lalu `npm run typecheck`.
- Hasil: 7+5 case hijau; typecheck 0.
- Completion: field opsional + validasi kondisional; test hijau.
- Tidak boleh diubah: fungsi progress existing, key storage.

---

## S4 — `TrainScene.applyTrainVariant` (3 bentuk loko + 3 jenis gerbong)

- Tujuan: render variant kereta secara prosedural, ganti bentuk & warna.
- Finding: F3.
- Dependency: S1.
- File dibaca: `src/components/train/TrainScene.ts` (`buildTrain`, field `trainGroup`/`wheels`/`smokes`/`driverHead`/`driverArm`, `dispose`).
- File diubah: `src/components/train/TrainScene.ts`.
- Simbol exact:
  ```ts
  applyTrainVariant(variant: TrainVariant): void
  ```
  Field privat baru: `locoParts: THREE.Object3D[] = []`, `wagonParts: THREE.Object3D[] = []`, `locoShape: LocoShape = 'classic'`.
- Perubahan konkret (urut):
  1. Import type `TrainVariant`, `LocoShape` dari `../../lib/trainVariants`.
  2. Tambah method privat `disposeParts(parts: THREE.Object3D[])`: traverse tiap part → `geometry.dispose()` + material (array-aware) `dispose()` → `this.trainGroup.remove(...parts)` → kosongkan array. **Jangan dispose roda** (dipakai ulang lintas variant).
  3. Tambah method privat `buildLoco(shape: LocoShape, color: string)`: hapus loko lama via `disposeParts(this.locoParts)`; bangun 3 varian:
     - `classic`: `Box(1.2, 0.8, 2.0)` + `Box(1.0, 0.7, 0.8)` cabin + `Cylinder(0.16, 0.2, 0.6)` cerobong.
     - `diesel`: `Box(1.2, 0.9, 2.2)` + `Box(1.0, 0.6, 0.7)` cabin lebih rendah, **tanpa cerobong**.
     - `tank`: `Box(1.1, 0.7, 1.5)` + `Cylinder(0.5, 0.5, 1.2, 12)` tangki horizontal (rotasi Z 90°), tanpa cerobong.
     Simpan tiap mesh ke `this.locoParts`; tambah ke `this.trainGroup`.
  4. Tambah method privat `buildWagons(wagons: TrainVariantWagon[])`: `disposeParts(this.wagonParts)`; untuk tiap wagon (index i, offset z `-2.0 - i * 1.9`):
     - `boxcar`: `Box(1.1, 0.7, 1.6)`.
     - `tanker`: `Cylinder(0.42, 0.42, 1.4, 12)` rotasi Z 90°.
     - `flatbed`: `Box(1.1, 0.25, 1.6)` + `Box(0.7, 0.3, 0.9)` muatan di atas.
     Simpan ke `this.wagonParts`.
  5. `applyTrainVariant(variant)`: guard `isValidTrainVariant(variant)` (import fungsi) → bila invalid return; `this.locoShape = variant.loco`; `buildLoco(...)`; `buildWagons(...)`.
  6. `updateSmoke`: tambah guard `if (this.locoShape !== 'classic') { set semua opacity 0; return }` di awal (varian diesel/tank tidak berasap).
  7. `dispose()`: tambah `this.disposeParts(this.locoParts); this.disposeParts(this.wagonParts)` **sebelum** traverse (agar tidak dobel-dispose; traverse hanya menangkap yang masih di scene).
- Behavior dipertahankan: `buildTrain()` existing tetap dipanggil di konstruktor (default classic merah + 1 gerbong kuning) sehingga tidak ada perubahan tampilan sebelum `applyTrainVariant`; roda/wheels/driverHead/driverArm tidak disentuh; lampu depan tidak disentuh.
- Error/edge: variant invalid → return tanpa perubahan; `applyTrainVariant` dipanggil berulang → part lama ter-dispose (tidak leak); `disposed` → guard return.
- Test: tidak ada (WebGL).
- Command: `npm run typecheck`.
- Hasil: 0 error.
- Completion: 1 method publik + 2 privat; dispose eksplisit; asap hanya classic.
- Tidak boleh diubah: `buildTrain` default, roda, driver, lampu, kurva, tema, kamera, track.

---

## S5 — Maneuver belok + timer 900ms

- Tujuan: kereta mundur sedikit, jeda, lalu maju & belok.
- Finding: F5.
- Dependency: S2, S4.
- File dibaca: `src/components/train/TrainScene.ts` (`setBranch`, `update`, `reset`), `src/screens/TrainScreen.tsx` (timer `SWITCHING_TRACK`), `src/lib/trainManeuver.ts`.
- File diubah: `TrainScene.ts`, `TrainScreen.tsx`.
- Simbol terkait: `computeManeuver`, `MANEUVER_TOTAL_MS`, `maneuverStart: number | null`, `maneuverElapsed`.
- Perubahan konkret (urut di `TrainScene.ts`):
  1. Import `computeManeuver, MANEUVER_TOTAL_MS` dari `../../lib/trainManeuver`.
  2. Field baru: `private maneuverStart = -1` dan `private maneuverActive = false`.
  3. `setBranch(i)`: ubah agar **tidak langsung** pindah fase. Tetapkan:
     ```ts
     setBranch(i: BranchIndex): void {
       this.selected = i
       this.stationFired = false
       if (this.rm) {
         this.phase = 'branch'
         this.t = 0
         return
       }
       this.maneuverActive = true
       this.maneuverStart = this.elapsed
       this.phase = 'main'
       this.t = 1
     }
     ```
     (Kereta tetap di ujung lintasan utama `t=1` saat maneuver.)
  4. `update(dt)`: **sebelum** blok gerak existing, tambah blok maneuver:
     ```ts
     if (this.maneuverActive) {
       const elapsedMs = (this.elapsed - this.maneuverStart) * 1000
       const m = computeManeuver(elapsedMs)
       this.placeTrainOnCurve(this.mainCurve, m.t)
       if (elapsedMs >= MANEUVER_TOTAL_MS) {
         this.maneuverActive = false
         this.phase = 'branch'
         this.t = 0
       }
       this.updateSmoke(dtc)
       this.updateCamera(dtc)
       return
     }
     ```
     Catatan: blok ini menggantikan gerak normal selama maneuver; roda/goyang tetap bisa dipanggil sebelum return (tambahkan `spin` roda di dalam blok agar roda berputar).
  5. **Lean**: saat fase `branch` dan `t < 0.3`, tambah roll kecil: setelah `placeTrainOnCurve`, `this.trainGroup.rotation.z = (this.selected - 1) * 0.08 * (1 - this.t / 0.3)`; reset `rotation.z = 0` saat `t >= 0.3`.
  6. `reset()`: tambah `this.maneuverActive = false; this.maneuverStart = -1; this.trainGroup.rotation.z = 0`.
- Perubahan di `TrainScreen.tsx`:
  7. Timer `later(500, ...)` di `handleAnswer` cabang benar → `later(900, ...)` (selaras dengan `MANEUVER_TOTAL_MS` + margin). Tidak ada perubahan lain di alur.
- Behavior dipertahankan: `onReachStation` tetap dipanggil saat `t >= 1` di fase branch; guard `paused`/`disposed` tetap; reduced-motion langsung belok.
- Error/edge: pause saat maneuver → `update` early-return (maneuver tertahan, lanjut saat resume — diterima); `reset` di tengah maneuver → maneuver batal; `setBranch` dipanggil dua kali cepat → maneuver restart dari `elapsed` terbaru (aman).
- Test: tidak ada test WebGL; timeline sudah diuji di S2.
- Command: `npm run typecheck` + `npm run lint`.
- Hasil: 0 error.
- Completion: maneuver + lean + timer 900ms; reduced-motion skip.
- Tidak boleh diubah: state machine `TrainState` (14 state tetap), `handleAnswer` logika lain, guard fase.

---

## S6 — Drag kamera (yaw + auto-return)

- Tujuan: anak bisa melihat sekitar dengan drag; kamera kembali saat kereta bergerak.
- Finding: F2.
- Dependency: S4 (mengubah `updateCamera`).
- File dibaca: `TrainScene.ts` (konstruktor, `updateCamera`, `dispose`, `resize`).
- File diubah: `TrainScene.ts`; `TrainCanvas.tsx` (style `touch-action: none`).
- Simbol terkait: `yawOffset`, `dragging`, `dragStartX`, `lastPointerX`.
- Perubahan konkret (urut di `TrainScene.ts`):
  1. Field: `private yawOffset = 0`, `private dragging = false`, `private dragLastX = 0`.
  2. Konstruktor: simpan referensi canvas (`private canvasEl: HTMLCanvasElement`), lalu pasang listener:
     ```ts
     this.canvasEl.addEventListener('pointerdown', this.onPointerDown)
     this.canvasEl.addEventListener('pointermove', this.onPointerMove)
     window.addEventListener('pointerup', this.onPointerUp)
     window.addEventListener('pointercancel', this.onPointerUp)
     ```
     Handler sebagai arrow-function field (bind otomatis):
     - `onPointerDown = (e: PointerEvent) => { this.dragging = true; this.dragLastX = e.clientX; this.canvasEl.setPointerCapture?.(e.pointerId) }`
     - `onPointerMove = (e) => { if (!this.dragging) return; const dx = e.clientX - this.dragLastX; this.dragLastX = e.clientX; this.yawOffset = clamp(this.yawOffset + dx * 0.005, -Math.PI/3, Math.PI/3) }`
     - `onPointerUp = () => { this.dragging = false }`
  3. `updateCamera(dt)`: setelah menghitung `camPos`/`camLook` untuk mode aktif, terapkan rotasi yaw di sekitar target:
     ```ts
     if (this.yawOffset !== 0) {
       const pivot = this.camLook
       const dx = this.camera.position.x - pivot.x
       const dz = this.camera.position.z - pivot.z
       const cos = Math.cos(this.yawOffset)
       const sin = Math.sin(this.yawOffset)
       this.camPos.set(pivot.x + dx * cos - dz * sin, this.camPos.y, pivot.z + dx * sin + dz * cos)
     }
     ```
     Terapkan ke `camPos` **sebelum** lerp (agar lerp tetap mulus).
  4. Auto-return: di `updateCamera`, bila `!this.dragging` dan kereta bergerak (`this.t > 0` atau `maneuverActive`): `this.yawOffset *= Math.max(0, 1 - dt * 2)`; bila `|yawOffset| < 0.001` → `yawOffset = 0`.
  5. `dispose()`: lepas 4 listener (`canvasEl` 2 + window 2) sebelum `renderer.dispose()`.
- Perubahan di `TrainCanvas.tsx`:
  6. Canvas style: tambah `style={{ touchAction: 'none' }}` pada `<canvas>` (agar drag tidak men-scroll halaman di mobile).
- Behavior dipertahankan: 4 mode kamera tetap berfungsi; `resize` tidak berubah; drag saat paused tidak menggerakkan kamera (`update` early-return) — dicatat sebagai batasan.
- Error/edge: `setPointerCapture` tidak ada (browser lama) → optional chaining; pointer keluar canvas → `window` pointerup tetap menangkap; yaw di-clamp ±60°.
- Test: tidak ada (WebGL); verifikasi manual S10.
- Command: `npm run typecheck` + `npm run lint`.
- Hasil: 0 error.
- Completion: 4 listener + auto-return + clamp; listener dilepas di dispose.
- Tidak boleh diubah: `TrainCameraMode` existing, `resize`, loop rAF di Canvas.

---

## S7 — Detail objek via InstancedMesh

- Tujuan: lingkungan lebih kaya tanpa meledakkan draw call.
- Finding: F1, F6.
- Dependency: S4 (mengubah `buildEnvironment`).
- File dibaca: `TrainScene.ts` (`buildEnvironment`, `applyTheme`, `dispose`, grup dekor).
- File diubah: `TrainScene.ts`.
- Simbol terkait: `buildInstancedDetail()`, field `detailGroup: THREE.Group`.
- Perubahan konkret (urut):
  1. Komentar ledger: `≤82 mesh + instanced, ≤90 draw call`.
  2. Tambah method privat `addInstanced(geo, mat, transforms: {pos:[x,y,z]; rotY?: number; scale?: number}[])`: buat `InstancedMesh(geo, mat, transforms.length)`, set matrix tiap instance via `Object3D` dummy, `instanceMatrix.needsUpdate = true`, tambah ke `detailGroup`, simpan ke array untuk dispose.
  3. `buildInstancedDetail()` — panggil di konstruktor setelah `buildEnvironment`:
     - **Pohon pinus ×6**: `ConeGeometry(0.7, 1.6, 6)` + `CylinderGeometry(0.1, 0.14, 0.5, 6)`; 2 InstancedMesh (daun + batang), posisi tersebar (x ±9–13, z −14..8).
     - **Pohon bulat ×4**: `SphereGeometry(0.75, 8, 6)` + batang; 2 InstancedMesh.
     - **Batu ×6**: `DodecahedronGeometry(0.3, 0)`; 1 InstancedMesh; skala acak 0.7–1.3.
     - **Pagar rel ×8**: `BoxGeometry(0.12, 0.5, 0.12)`; 1 InstancedMesh; posisi sepanjang sisi rel utama (x ±2.2, z 2..16).
     - **Semak ×4**: `SphereGeometry(0.4, 6, 4)`; 1 InstancedMesh.
     - **Burung ×3**: `ConeGeometry(0.18, 0.4, 4)` rotasi Z 90°; 1 InstancedMesh; animasi orbit ditambahkan di `update` (baca posisi base dari array field).
  4. Grup per tema (visibilitas via `applyTheme` existing):
     - `flowersGroup` + InstancedMesh rumpun bunga ×6 (`SphereGeometry(0.14, 6, 5)`).
     - `farmGroup` + InstancedMesh petak padi ×12 (`BoxGeometry(0.9, 0.25, 0.9)`) + lumbung (`Box(1.4, 1.0, 1.2)` + `Cylinder(0, 0.9, 0.6, 4)`) + 2 domba (`Sphere(0.35)` + `Sphere(0.2)`).
     - `duskGroup` + 6 sprite kunang-kunang (sprite kecil warna `#fde68a`, animasi kedip opacity sin) + 2 jendela rumah menyala (`PlaneGeometry(0.3, 0.3)` emissive kuning).
  5. `update()`: tambah animasi burung (orbit `sin/cos` kecil) dan kedip kunang-kunang (opacity `0.3 + 0.7 * |sin(elapsed * 3 + i)|`) — keduanya di-skip saat `rm`.
  6. `applyTheme`: tambah visibilitas `detailGroup.visible = true` (selalu) — detail umum tampil di semua tema.
  7. `dispose()`: instanced mesh tertangkap traverse (`isMesh` true) sehingga geometry/material ter-dispose; sprite kunang-kunang ditangkap blok sprite existing.
- Behavior dipertahankan: tema & visibility existing; tidak mengubah pohon/rumah/bukit existing (detail **tambahan**); tidak menambah shadow.
- Error/edge: `InstancedMesh` count 0 → jangan buat; semua posisi deterministik (bukan random runtime) agar konsisten.
- Test: tidak ada (WebGL); verifikasi manual + audit draw call S9.
- Command: `npm run typecheck` + `npm run build`.
- Hasil: 0 error; build sukses.
- Completion: ≥6 InstancedMesh + detail per tema; ledger diperbarui; tanpa dep baru.
- Tidak boleh diubah: `buildEnvironment` existing (hanya boleh tambah pemanggilan), kurva, tema palette.

---

## S8 — Wiring `TrainCanvas`/`TrainScreen` (variant + snapshot)

- Tujuan: variant di-roll saat mulai, diterapkan ke scene, dan disimpan di snapshot.
- Finding: F3, F4.
- Dependency: S3, S4.
- File dibaca: `TrainCanvas.tsx`, `TrainScreen.tsx`.
- File diubah: `TrainCanvas.tsx`, `TrainScreen.tsx`.
- Simbol exact:
  ```tsx
  // TrainCanvas props tambah
  trainVariant: TrainVariant | null
  ```
- Perubahan konkret (urut di `TrainCanvas.tsx`):
  1. Import type `TrainVariant` dari `../../lib/trainVariants`.
  2. Interface: tambah `trainVariant: TrainVariant | null`.
  3. Effect baru (setelah effect `boardAnswers`):
     ```ts
     useEffect(() => {
       if (sceneRef.current && trainVariant) sceneRef.current.applyTrainVariant(trainVariant)
     }, [trainVariant, sceneRef])
     ```
  4. Mount effect: setelah `scene.setAnswers(boardAnswers)` tambah `if (trainVariant) scene.applyTrainVariant(trainVariant)`.
- Perubahan di `TrainScreen.tsx`:
  5. Import `pickTrainVariant, type TrainVariant` dari `../lib/trainVariants`.
  6. State: `const [variant, setVariant] = useState<TrainVariant | null>(null)`.
  7. `handleStart(g)`: tambah `const v = pickTrainVariant(); setVariant(v)` dan `saveTrainSession({ ..., variant: v }, ...)` (snapshot awal memuat variant).
  8. `handleResumeSession`: tambah `setVariant(resumable.variant ?? pickTrainVariant())` (snapshot lama tanpa variant → roll baru).
  9. Snapshot tiap ronde (`handleReachStation`): tambah `variant: variant ?? undefined` ke objek `saveTrainSession`.
  10. Render `TrainCanvas`: tambah `trainVariant={variant}`.
- Behavior dipertahankan: alur start/resume/snapshot existing; state machine; timer.
- Error/edge: `variant` null (belum start) → Canvas skip; fallback 2D → `sceneRef` null, aman via `?.`; snapshot lama → roll baru (tidak error).
- Test: tidak ada test React baru.
- Command: `npm run typecheck` + `npm run lint`.
- Hasil: 0 error keduanya.
- Completion: 1 prop + 2 effect + 4 titik wiring; typecheck+lint hijau.
- Tidak boleh diubah: `TrainMenu`, `TrainHUD`, `QuestionDialog`, `TrainCelebration`.

---

## S9 — Verifikasi otomatis

- Tujuan: buktikan constraint; bug-fix 1 baris bila gagal + dicatat.
- Finding: F1–F6 + C1–C4.
- File dibaca: output command.
- File diubah: tidak ada (kecuali bug-fix + prettier pada file tersentuh).
- Checklist:
  1. `npm run lint` → 0 error.
  2. `npm run typecheck` → 0 error.
  3. `npm test -- tests/trainVariants.test.ts tests/trainManeuver.test.ts tests/trainSessionStorage.test.ts` → hijau.
  4. `npm test` penuh → `failed = 0`.
  5. `npm run build` → sukses; tanpa aset audio baru; `three` tetap chunk terpisah.
  6. `npm run format:check` → hijau.
  7. Grep: `gagal` di train → kosong; `from 'three'` di `src/lib` → kosong; `shadowMap.enabled = true|ShaderMaterial|Physics` di `src/components/train` → kosong.
  8. Audit ledger: komentar `TrainScene.ts` menyebut `≤82 mesh + instanced, ≤90 draw call`.
- Command: delapan di atas.
- Hasil: semua hijau.
- Completion: 8 checklist hijau/tercatat.
- Tidak boleh diubah: CI, vite config.

---

## S10 — Checklist manual + memory + bump 1.9.0

- Tujuan: verifikasi indrawi + jejak; tanpa commit kecuali diminta.
- Finding: penutup.
- File dibaca: `git status --short`, `.memory/README.md`, `package.json`.
- File diubah:
  1. `package.json`: `1.8.0` → `1.9.0`.
  2. `.memory/YYYY-MM-DD/HHmmss-kereta-fase-5-variant-drag-detail.md`.
  3. `.memory/README.md` (timestamp + 1 baris state + 1 entri recent).
  4. Plan ini (Tasks + Progress Log).
- Langkah manual (catat hasil):
  1. Variant: mulai sesi baru 3× (keluar-masuk) → loko/gerbong berbeda-beda; refresh di tengah sesi → variant **sama** (tersimpan).
  2. Drag: geser kiri/kanan di canvas → kamera berputar (maks ±60°); saat kereta mulai bergerak → kamera kembali ke tengah perlahan; drag saat jeda → tidak mengembalikan (kereta diam).
  3. Maneuver: jawab benar → kereta mundur sedikit, jeda ~0.25 dtk, lalu maju & belok; total ~0.6 dtk; label state tidak "nyangkut".
  4. Detail: 3 tema punya detail berbeda (K1 bunga+kupu, K2 padi+lumbung+domba, K3 kunang-kunang+jendela); tidak ada lag/penurunan FPS terasa.
  5. Reduced-motion on → maneuver dilewati (langsung belok), detail ambient (burung/kunang-kunang) diam.
  6. Fallback 2D (WebGL off) → tetap playable, variant/drag tidak error.
  7. Console 0 error/warning; restart 3× tanpa `Context Lost`.
  8. Mobile 390px: drag tidak men-scroll halaman (`touch-action: none`).
- Handoff checklist:
  - [ ] API exact (`pickTrainVariant`, `isValidTrainVariant`, `computeManeuver`, `MANEUVER_*`, `applyTrainVariant`, `TrainCanvas.trainVariant`, snapshot `variant?`).
  - [ ] `lint/typecheck/test/build/format:check` hijau; grep sesuai.
  - [ ] Manual dicentang; ledger ≤82 mesh + instanced ≤90 draw call.
  - [ ] `package.json` 1.9.0; memory + plan diperbarui.
- Completion: 4 file diperbarui; tanpa commit.
- Tidak boleh diubah: semua kode/test selain S10.1.

---

## Progress Log

- 2026-09-25 18:00:00 — Plan Fase 5 dibuat (variant kereta, drag kamera, detail instanced, maneuver belok). Keputusan pengguna: budget ≤82 mesh + instanced ≤90 draw call; drag auto-return; variant disimpan; timing maneuver default (review nanti). Belum ada implementasi.
- 2026-09-25 20:40:00 — S0–S10 selesai. lint/typecheck/test (56 file/400 test)/build/format hijau; grep constraint lolos. Manual: detail objek baru terverifikasi terlihat di K2 & K3 (pagar rel, batu, semak, pohon pinus+bulat, lumbung, domba, jendela menyala), HUD 6 tombol utuh. Penyimpangan minor: (a) tambah dep `variant` ke deps `useCallback` `handleReachStation` (lint exhaustive-deps); (b) firefly memakai material emissive (bukan sprite) agar reuse pola `lanternMats`. Versi 1.9.0. Keterbatasan: drag/maneuver/FPS belum dapat diverifikasi di otomasi (tab headless ter-throttle rAF) → TODO verifikasi manual. Tanpa commit.

## Notes

- **Keputusan terkunci:** budget baru (instanced diizinkan); drag yaw-only dengan auto-return; variant disimpan di snapshot (`variant?` opsional, backward-compatible); gerbong 1–2; maneuver 350ms mundur + 250ms jeda (konstanta terpisah untuk review).
- **Counter-pertimbangan yang ditolak:** pitch drag (ditolak: risiko pusing + framing rusak); gerbong 0 (ditolak: melanggar janji "kereta dengan gerbong"); re-roll variant saat resume (ditolak: inkonsistensi); physics engine untuk belok (ditolak: out of scope).
- **Batasan yang tetap ada:** drag tidak aktif saat paused; detail instanced statis (kecuali burung/kunang-kunang); maneuver tidak presisi fisik (easing sederhana); variant terbatas 3 bentuk × 5 warna.
- **Perintah:** `npm run lint`, `npm run typecheck`, `npm test`, `npm test -- <file>`, `npm run build`, `npm run format:check`, `git status --short`.

---

## Handoff Checklist (untuk model eksekutor kecil)

- [ ] Kerjakan S0→S10 berurutan; S1–S3 hijau sebelum scene (S4–S7).
- [ ] Setiap langkah: baca file listed → ubah hanya file listed → API + cuplikan exact → test listed → command listed → penuhi completion criteria.
- [ ] Setiap finding F1–F6 + constraint C1–C4 ditangani ≥1 langkah + verifikasi.
- [ ] Jangan ubah area "Tidak boleh diubah"; bila harus, jadikan blocker + minta keputusan.
- [ ] Akhiri dengan S9–S10 + ringkasan file diubah, keputusan arsitektur, batasan tersisa.
