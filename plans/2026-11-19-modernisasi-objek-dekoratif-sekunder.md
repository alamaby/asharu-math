# Modernisasi Model 3D GLTF Objek Dekoratif Sekunder Petualangan Kereta (CC0)

Created: 2026-11-19 13:25:00

## Objective
Memodernisasi objek dekoratif sekunder di dunia 3D *Petualangan Kereta Angka* (`TrainScene.ts`) yang saat ini masih berupa bola mengambang atau geometri primitif dasar menjadi aset 3D GLTF berkualitas tinggi berlisensi CC0/Public Domain tanpa atribusi wajib:
1. **Lentera Tiang Stasiun Senja (`station_lantern.glb`)**: Menggantikan 2 bola lampu mengambang polos tanpa tiang pada tema Kelas 3 (dusk) dengan model tiang lampu stasiun/taman 3D besi berpelindung kap lentera klasik dan bohlam hangat yang terhubung ke kontrol emissive `stationLight` (`lanternMats`).
2. **Rumpun Bunga Padang Rumput (`flower_patch.glb`)**: Menggantikan 2 bola petal pink/kuning polos pada tema Kelas 1 (flowers) dengan model rumpun bunga low-poly cerah lengkap dengan daun dan kelopak bunga yang asri.
3. **Kupu-kupu Tematik (`butterfly.glb`)**: Menggantikan kapsul silinder dan plane datar polos dengan model 3D kupu-kupu low-poly yang manis, memiliki sub-mesh sayap berengsel (`wing_left`, `wing_right`) yang mengepak dinamis dan melayang di atas taman bunga.

Mempertahankan 100% backward-compatibility dan auto-fallback ke geometri prosedural saat GLTF belum di-cache atau berjalan di lingkungan pengujian tanpa WebGL (JSDOM).

## Scope
- Penempatan model 3D GLTF teroptimasi CC0 di `public/models/train/`:
  - `station_lantern.glb` (Tiang lentera stasiun senja)
  - `flower_patch.glb` (Rumpun bunga padang rumput)
  - `butterfly.glb` (Kupu-kupu manis berengsel sayap)
- Pembuatan modul loader in-memory `src/lib/decorModelLoader.ts` dengan kloning instance, ekstraksi sub-mesh, isolasi material, dan helper `preloadDecorModels()`.
- Pembuatan unit test `tests/decorModelLoader.test.ts`.
- Integrasi ke `TrainScene.ts`:
  - Pembaruan `flowersGroup` untuk kupu-kupu dan bunga GLTF.
  - Pembaruan `duskGroup` untuk lentera tiang stasiun GLTF dan sinkronisasi emissive di `applyTheme()`.
  - Pembaruan loop animasi `update()` untuk kibasan sayap kupu-kupu GLTF.
- Preloading background di `src/components/train/TrainCanvas.tsx`.
- Pengujian regresi di `tests/trainSceneGltf.test.ts`.
- Verifikasi penuh (lint, format, typecheck, vitest 80+ test files, build produksi PWA precache).
- Bump versi ke `1.24.0` di `package.json`, catat entri memori proyek di `.memory/`, commit 1 baris Conventional Commits, dan push ke `origin/main`.

## Milestones
1. Fase 1: Pembuatan dan Optimasi Aset 3D GLTF CC0 `station_lantern.glb`, `flower_patch.glb`, dan `butterfly.glb`
2. Fase 2: Implementasi Modul Loader `decorModelLoader.ts` & Unit Test `decorModelLoader.test.ts`
3. Fase 3: Integrasi ke `TrainScene.ts`, `TrainCanvas.tsx`, dan Pengujian `trainSceneGltf.test.ts`
4. Fase 4: Verifikasi Penuh (Lint, Typecheck, Test, Build, PWA) & Dokumentasi Memori Proyek

## Tasks
- [x] Buat aset GLTF teroptimasi `station_lantern.glb`, `flower_patch.glb`, dan `butterfly.glb` di `public/models/train/`
- [x] Buat modul loader in-memory `src/lib/decorModelLoader.ts`
- [x] Buat unit test `tests/decorModelLoader.test.ts`
- [x] Integrasikan lentera tiang stasiun GLTF ke `duskGroup` & `applyTheme()` di `TrainScene.ts`
- [x] Integrasikan bunga dan kupu-kupu GLTF ke `flowersGroup` & loop animasi di `TrainScene.ts`
- [x] Tambahkan pemanggilan `preloadDecorModels()` pada `TrainCanvas.tsx`
- [x] Update pengujian di `tests/trainSceneGltf.test.ts` untuk memverifikasi dekorasi sekunder GLTF
- [x] Jalankan verifikasi lint, format check, typecheck, dan seluruh vitest test suite
- [x] Uji build produksi `npm run build` dan pastikan PWA precache menyertakan model dekoratif
- [x] Bump versi ke `1.24.0` di `package.json`
- [x] Catat entri memori proyek di `.memory/` dan update `.memory/README.md`
- [x] Commit 1 baris Conventional Commits tanpa trailer dan push ke `origin/main`

## Risks
- Animasi Sayap Kupu-Kupu: Sub-mesh sayap kiri dan kanan harus memiliki titik tumpu (pivot/origin) di tepi dalam engsel badan agar rotasi pada sumbu Z menghasilkan kibasan sayap yang natural tanpa terlepas dari tubuh.
- Material Emissive Lentera: Lensa/kubah lampu pada `station_lantern.glb` harus menggunakan material terpisah yang dapat diakses oleh `applyTheme()` untuk mengubah `emissiveIntensity` antara 0.15 (siang) dan 1.4 (senja).

## Progress Log
- 2026-11-19 13:25:00 — Plan dirumuskan, arsitektur model dekoratif sekunder (lentera tiang, bunga, kupu-kupu) dirancang.
- 2026-11-19 13:35:00 — Model GLB selesai dibuat (`station_lantern.glb`, `flower_patch.glb`, `butterfly.glb`), loader `decorModelLoader.ts` dan unit test selesai, integrasi ke `TrainScene.ts` (animasi sayap kupu-kupu & kontrol emissive lentera senja), `TrainCanvas.tsx`, vitest 81 test files lulus 100%, dan build produksi Vite PWA sukses. Versi di-bump ke 1.24.0.

## Notes
- Desain model: Bergaya low-poly kartun konsisten dengan Kenney Assets dan Quaternius (CC0 1.0 Universal / Public Domain).
