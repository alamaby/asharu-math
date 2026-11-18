# Integrasi Model 3D GLTF Bangunan Kereta (Rumah & Lumbung) Bebas Atribusi (CC0)

Created: 2026-11-18 15:58:00

## Objective
Mengintegrasikan model 3D GLTF kartun/low-poly berlisensi Public Domain / CC0 tanpa atribusi wajib untuk elemen bangunan di lintasan *Petualangan Kereta Angka* (`TrainScene.ts`):
1. **Rumah Warga (`house.glb`, 49 KB)**: Menggantikan kotak prosedural rumah warga di tepi rel kiri dan kanan (posisi `[-11, -2]` dan `[11, -3]`).
2. **Lumbung Pertanian (`barn.glb` / `small_barn.glb`, 96 KB)**: Menggantikan balok prosedural lumbung pertanian petak K2 (posisi `[-12, -16]`).

Mempertahankan auto-fallback ke geometri prosedural jika GLTF belum/gagal dimuat, mempertahankan centering pivot dan pencahayaan tema/malam (emissive/lampu jendela), integrasi PWA precache, serta verifikasi pengujian 100%.

## Scope
- Penempatan model di `public/models/train/house.glb` (49.3 KB) dan `public/models/train/barn.glb` (96.8 KB).
- Penambahan fungsi pemuatan dan instansiasi pada modul loader bangunan (`src/lib/buildingModelLoader.ts`).
- Integrasi ke `TrainScene.ts`:
  - `buildHouses()`: instansiasi GLTF rumah warga di spot kiri dan kanan, dengan fallback prosedural.
  - `buildBarn()`: instansiasi GLTF lumbung di petak pertanian K2, dengan fallback prosedural.
- Preloading aset bangunan di `TrainCanvas.tsx` saat inisialisasi modul kereta.
- Unit test di `tests/buildingModelLoader.test.ts` dan integrasi di `tests/trainSceneGltf.test.ts`.
- Verifikasi PWA precaching, lint, typecheck, vitest, dan build produksi.

## Milestones
1. Fase 1: Penempatan dan Verifikasi Aset Model GLTF CC0 di `public/models/train/`
2. Fase 2: Implementasi Modul Loader `buildingModelLoader.ts` dan Unit Test
3. Fase 3: Integrasi ke `TrainScene.ts` & Preload di `TrainCanvas.tsx`
4. Fase 4: Verifikasi Penuh (Lint, Typecheck, Test, Build, PWA) & Dokumentasi Memori Proyek

## Tasks
- [x] Salin berkas model `house.glb` dan `small_barn.glb` ke `public/models/train/house.glb` dan `public/models/train/barn.glb`
- [x] Buat modul loader `src/lib/buildingModelLoader.ts`
- [x] Buat unit test `tests/buildingModelLoader.test.ts`
- [x] Integrasikan instansiasi model rumah dan lumbung ke `TrainScene.ts` dengan fallback prosedural
- [x] Tambahkan pemanggilan preload bangunan di `TrainCanvas.tsx`
- [x] Tambahkan tes integrasi di `tests/trainSceneGltf.test.ts`
- [x] Jalankan verifikasi lint, format check, typecheck, dan vitest test suite (74 test files, 502 tests lulus)
- [x] Uji build produksi `npm run build` (PWA precache 49 entries berhasil)
- [ ] Catat entri memori proyek di `.memory/` dan usulkan commit 1 baris

## Risks
- Penyesuaian Pivot & Ground Offset: Model GLTF bangunan harus memiliki dasar bawah yang menempel pas di permukaan tanah (`y = 0` atau permukaan bukit), tidak melayang dan tidak tenggelam. (Terverifikasi: offset center diterapkan di loader)
- Penanganan Emissive Malam: Pada mode malam (Kelas 3 / Tema Dusk), jendela rumah memiliki emissive. Penanganan: pastikan material GLTF mendukung atau dapat di-tweak materialnya saat pergantian tema `applyTheme`. (Terverifikasi)
- Performa: Bangunan statis tidak memiliki animasi armature/skinned mesh, sehingga instansiasi sangat ringan dan cepat di-clone (`master.clone(true)`). (Terverifikasi)

## Progress Log
- 2026-11-18 15:58:00 — Plan dibuat, model GLTF Quaternius CC0 untuk rumah dan lumbung siap disalin dan diintegrasikan.
- 2026-11-18 16:02:00 — Fase 1, 2, dan 3 selesai: model disalin, `buildingModelLoader.ts` dibuat beserta unit test-nya, `TrainScene.ts` dan `TrainCanvas.tsx` terintegrasi dengan fallback otomatis.
- 2026-11-18 16:05:00 — Fase 4 selesai: verifikasi typecheck, ESLint, Prettier, vitest (74 files, 502 tests), dan build produksi lulus 100%.

## Notes
- Sumber model: Quaternius "Farm Buildings Bundle" dan "Low Poly Buildings" (Public Domain / CC0).
- Ukuran total kedua model hanya ~146 KB.
