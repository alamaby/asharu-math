# 2026-10-07 — Detail Visual Objek 3D Kereta Fase 1–2 (v1.11.0)

Waktu: 2026-10-07 14:50:00
Versi: `1.10.0` → `1.11.0` (feat → minor)
Plan: `plans/2026-10-07-kereta-detail-visual.md` (5 fase; Fase 1–2 selesai, 3–5 menunggu tinjauan)
Lanjutan sesi perbaikan kereta (v1.9.2 anti-terjungkir, v1.10.0 ancang-ancang). User meminta analisa peluang detail objek 3D, lalu memilih mengimplementasi Fase 1 (identitas kereta) dan Fase 2 (karakter hidup).

## Fase 1 — Identitas kereta (TrainScene.ts)

- Batang roda (connecting rod) ×2 untuk variant classic & tank: box tipis di luar roda kiri/kanan (x=±0.78, z-center 0.3, panjang 1.5), bob vertikal `y = 0.28 + 0.1·sin(elapsed·rate)·side` dengan `rate = rm ? 4 : 8` (sinkon laju roda, kiri/kanan berlawanan fase). Ref `this.rods` diisi dari filter `userData.part === 'rod'` di `makeLocoParts`.
- Cowcatcher: box (1.05×0.55×0.1) miring `rotation.x=0.8` di depan loko; z per-bentuk: classic 1.55, diesel 1.65, tank 1.3.
- Coupling: box penghubung loko↔gerbong-1 (z=−0.9, panjang 0.7) dan antar gerbong (panjang 0.5) — jumlah = jumlah gerbong; dibangun di `makeWagonParts`.
- Jendela kabin (classic & diesel): plane biru muda di muka depan kabin.
- Dome uap (classic): sphere kuning `#fcd34d` di atas boiler.
- `buildTrain` kini memakai `makeLocoParts('classic', '#e05555')` — kereta default identik dengan hasil ganti variant (hapus duplikasi).

## Fase 2 — Karakter hidup

- Kupu-kupu: 1 plane → Group (tubuh capsule `#5b21b6` + 2 sayap plane hinge di badan; `userData.wings`). Flap `rotation.z = ±sin(elapsed·12+i·2)·0.7` di `update()` (blok `!rm`); wander/heading lama dipertahankan. Field `butterflies` berganti tipe `THREE.Group[]`.
- Masinis: torso capsule `#2563eb` (y 1.6), tangan kedua mirror (−0.55), brim topi cylinder 0.44 (`#1d4ed8`), 2 mata sphere 0.035 sebagai ANAK `driverHead` (ikut rotasi nengok cabang).
- Penumpang: kepala sphere 0.17 sebagai ANAK capsule (ikut animasi lompat) + 2 mata anak kepala; wajah ke +z (menghadap rel datang).
- Semua part baru bertag `userData.part` (rod/cowcatcher/coupling/dome/cabin-window/driver-torso/driver-brim/driver-eye/driver-arm) untuk test & animasi.

## File yang diubah

- `src/components/train/TrainScene.ts` — semua di atas + komentar budget header ±104 mesh / ±105 draw call.
- `tests/trainSceneDetail.test.ts` (baru, 4 test) — kehadiran part per variant (classic vs diesel, 1 vs 2 gerbong), part masinis, animasi rod.
- `tests/trainSceneLean.test.ts` — selector kepala masinis diganti: sphere radius terbesar (trainGroup kini berisi dome 0.16 & — via anak — mata 0.035).
- `package.json` — 1.11.0.

## Keputusan arsitektur

- Part baru masuk `locoParts`/`wagonParts` → ikut atomic rebuild saat ganti variant (tidak boleh share material/geometri lintas generasi).
- Mata = sphere kecil (bukan CanvasTexture) — sphere-UV face placement rawan salah orientasi; mesh kecil lebih murah diprediksi.
- Kupu = Group berisi 3 mesh; sayap digeometry-translate ke hinge agar `rotation.z` memutar di badan.
- Fase 3–5 (vegetasi, bangunan, bonus) tertunda menunggu tinjauan user — detail di plan file.

## Verifikasi

- `npm test` 58 file / 410 test hijau (4 test detail baru).
- `npm run lint`, `npm run format:check`, `npm run build` (tsc + vite) hijau.
- Visual browser (5211, shim rAF): alur ronde 1→3 normal dengan detail baru; torso/brim masinis terlihat dari belakang; rel melengkung + papan mengikuti kurva; maneuver kamera stabil tetap bekerja.

## Asumsi / risiko

- Draw call ±105 — belum diukur aktual di browser (devtools) — risiko rendah untuk target visual.
- Rod hanya animasi bob vertikal (bukan rotasi crank penuh) — cukup untuk skala low-poly.
- Verifikasi manual perangkat nyata tetap terbuka (akumulasi).

## Commit proposal

`feat: detail visual kereta - batang roda, cowcatcher, kupu flapping, karakter`
