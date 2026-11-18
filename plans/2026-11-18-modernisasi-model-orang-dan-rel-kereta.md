# Modernisasi Model 3D GLTF Orang (Masinis & Penumpang) dan Rel Kereta Bebas Atribusi (CC0)

Created: 2026-11-18 17:20:00

## Objective
Memodernisasi karakter orang (Masinis Asya dan Penumpang) serta rel kereta di modul *Petualangan Kereta Angka* (`TrainScene.ts`) dengan aset 3D GLTF berkualitas tinggi berlisensi Public Domain / CC0 tanpa atribusi wajib:
1. **Masinis Asya (`driver.glb`, ~749 KB, Quaternius CC0)**: Menggantikan balok/kapsul tubuh masinis prosedural di kabin lokomotif dengan model karakter 3D GLTF berpakaian masinis/pekerja lengkap dengan animasi idle dan perayaan kemenangan.
2. **Penumpang Stasiun (`passenger.glb`, ~768 KB, Quaternius CC0)**: Menggantikan 2 kapsul penumpang di peron stasiun dengan model karakter 3D GLTF warga kasual lengkap dengan animasi kegirangan (*Victory* / *Jump*) saat kereta tiba di stasiun.
3. **Bantalan Rel Presisi (`sleeper.glb`, 4.8 KB, Kenney Train Kit CC0)**: Menggantikan balok kayu kotak mentah dengan model bantalan rel berpelat baja (*tie plates*) berorientasi tangen kurva.
4. **Rel Baja Ganda Paralel (Dual Parallel Rails)**: Menggantikan pipa tunggal di tengah sumbu dengan dua batang rel baja paralel melengkung (offset ±0.35) yang pas menapak di bawah roda lokomotif dan gerbong.

Mempertahankan auto-fallback ke geometri prosedural saat un-cached, preloading terpadu di `TrainCanvas.tsx`, serta pengujian 100%.

## Scope
- Penempatan model di:
  - `public/models/train/driver.glb` (Masinis Asya)
  - `public/models/train/passenger.glb` (Penumpang Stasiun)
  - `public/models/train/sleeper.glb` (Bantalan Rel GLTF)
- Pembuatan modul loader `src/lib/characterModelLoader.ts` dan `src/lib/trackModelLoader.ts` dengan in-memory cache, instansiasi via cloning, dan penyesuaian skala.
- Integrasi ke `TrainScene.ts` dengan fallback otomatis ke geometri prosedural lama (`driver-torso`, `driver-brim`, `driver-eye`, `driver-arm`, kapsul penumpang, dan balok sleeper).
- Preloading aset karakter dan rel di `TrainCanvas.tsx`.
- Unit test loader dan penyesuaian pengujian scene di `tests/trainSceneGltf.test.ts` dan `tests/characterModelLoader.test.ts`.
- Verifikasi PWA precaching, lint, typecheck, vitest, dan build produksi.

## Milestones
1. Fase 1: Penempatan dan Verifikasi Aset Model GLTF CC0 di `public/models/train/`
2. Fase 2: Implementasi Modul Loader `characterModelLoader.ts` & `trackModelLoader.ts` dan Unit Test
3. Fase 3: Integrasi Dual Rail & Karakter ke `TrainScene.ts` & Preload di `TrainCanvas.tsx`
4. Fase 4: Verifikasi Penuh (Lint, Typecheck, Test, Build, PWA) & Dokumentasi Memori Proyek

## Tasks
- [x] Salin berkas model `driver_opt.glb` -> `public/models/train/driver.glb`, `passenger_female_opt.glb` -> `public/models/train/passenger.glb`, dan `spline-segment.glb` -> `public/models/train/sleeper.glb`
- [x] Buat modul loader `src/lib/characterModelLoader.ts` dan `src/lib/trackModelLoader.ts`
- [x] Buat unit test `tests/characterModelLoader.test.ts` dan `tests/trackModelLoader.test.ts`
- [x] Integrasikan rel ganda paralel (dual rails) dan bantalan rel GLTF ke `buildTracks()` di `TrainScene.ts` dengan fallback prosedural
- [x] Integrasikan model GLTF Masinis Asya ke `makeLocoParts()` di `TrainScene.ts` dengan fallback prosedural
- [x] Integrasikan model GLTF Penumpang Stasiun ke `buildStation()` di `TrainScene.ts` dengan fallback prosedural
- [x] Tambahkan pemanggilan preload di `TrainCanvas.tsx`
- [x] Jalankan verifikasi lint, format check, typecheck, dan vitest test suite
- [x] Uji build produksi `npm run build`
- [x] Catat entri memori proyek di `.memory/` dan usulkan commit 1 baris

## Risks
- Animasi Karakter di Lokomotif: Masinis bergerak bersama bodi lokomotif saat melaju di kurva rel. (Mitigasi: model masinis ditambahkan sebagai anak dari bodi kabin/loco group sehingga mengikuti orientasi dan manuver kereta secara otomatis).
- Stabilitas Dual Rail pada Belokan: Kurva cabang harus memiliki offset normal horizontal presisi agar kedua rel tetap paralel tanpa distorsi di sambungan junction.

## Progress Log
- 2026-11-18 17:20:00 — Plan dirumuskan, model karakter Quaternius CC0 dan bantalan rel Kenney CC0 siap disalin dan diintegrasikan.
- 2026-11-18 17:30:00 — Implementasi modul loader selesai, integrasi dual parallel rails dan karakter masinis & penumpang GLTF di TrainScene sukses, seluruh 78 test files (517 tests) lulus 100%, build produksi sukses dengan 69 precached assets. Version bump 1.21.0.

## Notes
- Sumber model: Quaternius (Ultimate Modular Characters, CC0 Public Domain) dan Kenney (Train Kit, CC0 1.0 Universal).
