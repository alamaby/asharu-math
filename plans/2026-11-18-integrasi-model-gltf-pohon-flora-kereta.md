# Integrasi Model 3D GLTF Pohon & Flora Kereta Bebas Atribusi (CC0)

Created: 2026-11-18 16:54:00

## Objective
Mengintegrasikan model 3D GLTF kartun/low-poly berlisensi Public Domain / CC0 tanpa atribusi wajib untuk elemen vegetasi dan flora di modul *Petualangan Kereta Angka* (`TrainScene.ts`):
1. **Pohon Rindang Utama (`tree_default.glb`, 9.4 KB, Kenney CC0)**: Menggantikan 4 pohon silinder + kerucut tunggal di sekitar stasiun dan perlintasan rel, dengan mempertahankan animasi goyang angin dedaunan (`sway`).
2. **Pohon Pinus Latar (`tree_pine.glb`, 17.2 KB, Kenney CC0)**: Menggantikan kerucut pinus bertumpuk pada 6 posisi bukit di latar belakang lanskap.
3. **Pohon Bulat Rimbun / Oak (`tree_oak.glb`, 14.6 KB, Kenney CC0)**: Menggantikan bola kanopi ganda pada 4 posisi padang rumput di lanskap stasiun.

Mempertahankan auto-fallback ke geometri prosedural saat un-cached, preloading terpadu di `TrainCanvas.tsx`, integrasi loader `treeModelLoader.ts`, serta pengujian 100%.

## Scope
- Penempatan model di `public/models/train/tree_default.glb`, `public/models/train/tree_pine.glb`, dan `public/models/train/tree_oak.glb`.
- Pembuatan modul loader `src/lib/treeModelLoader.ts` dengan in-memory cache, instansiasi via cloning, dan skala penyesuaian.
- Integrasi ke `TrainScene.ts` dengan fallback otomatis ke geometri prosedural lama (silinder batang, kerucut daun, sphere kanopi).
- Preloading aset pohon di `TrainCanvas.tsx`.
- Unit test di `tests/treeModelLoader.test.ts` dan pengujian stabilitas `trainScene`.
- Verifikasi PWA precaching, lint, typecheck, vitest, dan build produksi.

## Milestones
1. Fase 1: Penempatan dan Verifikasi Aset Model GLTF CC0 di `public/models/train/`
2. Fase 2: Implementasi Modul Loader `treeModelLoader.ts` dan Unit Test
3. Fase 3: Integrasi ke `TrainScene.ts` & Preload di `TrainCanvas.tsx`
4. Fase 4: Verifikasi Penuh (Lint, Typecheck, Test, Build, PWA) & Dokumentasi Memori Proyek

## Tasks
- [x] Salin berkas model `tree_default.glb`, `tree_pineDefaultA.glb`, dan `tree_oak.glb` ke `public/models/train/`
- [x] Buat modul loader `src/lib/treeModelLoader.ts`
- [x] Buat unit test `tests/treeModelLoader.test.ts`
- [x] Integrasikan instansiasi model pohon ke `TrainScene.ts` dengan fallback prosedural
- [x] Tambahkan pemanggilan `preloadTreeModels()` di `TrainCanvas.tsx`
- [x] Jalankan verifikasi lint, format check, typecheck, dan vitest test suite
- [x] Uji build produksi `npm run build`
- [x] Catat entri memori proyek di `.memory/` dan usulkan commit 1 baris

## Risks
- Animasi Angin Dedaunan: Pada model GLTF, jika seluruh group diputar z, batangnya bisa ikut miring di pangkal tanah. (Mitigasi: identifikasi sub-mesh daun `leafs...` di dalam instance atau putar pivot kanopi dengan offset alami agar pangkal batang tetap menancap kokoh di tanah).
- Performa: Instansiasi model low-poly (~200 poligon per pohon) menjaga performa scene tetap 60 FPS di layar mobile.

## Progress Log
- 2026-11-18 16:54:00 — Plan dibuat, aset model pohon CC0 siap disalin dan diintegrasikan.
- 2026-11-18 17:01:00 — Integrasi model GLTF pohon rindang, pinus, dan oak selesai; 76 test files (509 tests) lulus 100%; build PWA 63 entries berhasil; versi bumped ke 1.20.0.

## Notes
- Sumber model: Kenney Nature Kit (CC0 1.0 Universal, Public Domain).
- Total ukuran ketiga aset hanya ~41.2 KB.
