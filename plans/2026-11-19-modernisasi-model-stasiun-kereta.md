# Modernisasi Model 3D GLTF Area Stasiun Kereta Bebas Atribusi (CC0)

Created: 2026-11-19 11:45:00

## Objective
Memodernisasi seluruh elemen arsitektur dan perlengkapan stasiun di modul *Petualangan Kereta Angka* (`TrainScene.ts`) menggunakan aset 3D GLTF berkualitas tinggi berlisensi Public Domain / CC0 tanpa atribusi wajib:
1. **Bangku Tunggu Peron (`station_bench.glb`)**: Menggantikan balok kayu kasar prosedural dengan model bangku stasiun 3D berpalet kayu dengan sandaran dan rangka kaki kokoh (Kenney Furniture Kit, CC0).
2. **Kanopi & Peneduh Peron (`station_canopy.glb`)**: Menggantikan balok merah dan 4 silinder tiang prosedural dengan model atap peneduh stasiun (*station awning / canopy shelter*) berangka penopang (Kenney City Kit, CC0).
3. **Tiang Bendera & Bendera (`station_flag.glb`)**: Menggantikan silinder dan plane datar prosedural dengan model tiang bendera 3D ber-finial bola logam dan bendera stasiun merah berkibar (Kenney Castle Kit, CC0).
4. **Jam Dinding Stasiun (`station_clock.glb`)**: Menggantikan silinder putih polos dan jarum balok prosedural dengan model jam stasiun klasik (*station clock*) berbingkai lingkar rapi dan jarum penunjuk waktu (Kenney Furniture Kit, CC0).
5. **Peron Stasiun Modular (`station_platform.glb`)**: Menggantikan balok beton tunggal dengan platform peron semen modular bertekstur batas aman (tactile warning strip) yang pas di depan gerbong saat kereta berhenti.

Menjaga backward compatibility 100% dengan auto-fallback ke geometri prosedural lama saat GLTF belum di-cache atau dijalankan di lingkungan pengujian tanpa WebGL (JSDOM / Node.js).

## Scope
- Penempatan model teroptimasi di `public/models/train/`:
  - `station_bench.glb`
  - `station_canopy.glb`
  - `station_flag.glb`
  - `station_clock.glb`
  - `station_platform.glb`
- Pembuatan modul loader `src/lib/stationModelLoader.ts` dengan in-memory cache, kloning instansiasi, dan helper `preloadStationModels()`.
- Pembuatan unit test `tests/stationModelLoader.test.ts`.
- Integrasi ke `TrainScene.ts` dengan grup terpisah `stationGroup` dan fallback otomatis.
- Preloading aset stasiun di `TrainCanvas.tsx`.
- Pengujian regresi visual dan GLTF di `tests/trainSceneGltf.test.ts` dan `tests/trainSceneDetail.test.ts`.
- Verifikasi PWA precaching (penambahan entri precache), lint, format check, typecheck, vitest (78+ files), dan build produksi.
- Pencatatan memori proyek di `.memory/` dan bump versi ke `1.22.0`.

## Milestones
1. Fase 1: Kurasi dan Optimasi Aset GLTF CC0 Area Stasiun ke `public/models/train/`
2. Fase 2: Implementasi Modul Loader `stationModelLoader.ts` & Unit Test
3. Fase 3: Integrasi Elemen Stasiun GLTF ke `TrainScene.ts` & Preloading di `TrainCanvas.tsx`
4. Fase 4: Verifikasi Penuh (Lint, Typecheck, Test, Build, PWA) & Dokumentasi Memori Proyek

## Tasks
- [x] Siapkan dan optimasi aset 3D GLTF CC0 stasiun (`station_bench.glb`, `station_canopy.glb`, `station_flag.glb`, `station_clock.glb`, `station_platform.glb`) di `public/models/train/`
- [x] Buat modul loader in-memory `src/lib/stationModelLoader.ts`
- [x] Buat unit test `tests/stationModelLoader.test.ts`
- [x] Integrasikan loader model stasiun ke `TrainScene.ts` (bangku, kanopi, bendera, jam, dan peron) dengan fallback prosedural
- [x] Tambahkan pemanggilan `preloadStationModels()` pada `TrainCanvas.tsx`
- [x] Update pengujian di `tests/trainSceneGltf.test.ts` untuk memvalidasi part stasiun GLTF
- [x] Jalankan verifikasi lint, format check, typecheck, dan seluruh vitest test suite
- [x] Uji build produksi `npm run build` dan pastikan PWA precache menyertakan model stasiun
- [x] Bump versi ke `1.22.0` di `package.json`
- [x] Catat entri memori proyek di `.memory/` dan update `.memory/README.md`
- [x] Commit 1 baris Conventional Commits tanpa trailer dan push ke `origin/main`

## Risks
- Posisi Berhenti Kereta & Pintu Penumpang: Elevasi peron stasiun harus tepat sejajar ($y = 0.2$ sampai $0.4$) dengan pijakan tangga kereta dan ketinggian kaki penumpang agar masinis dan penumpang berdiri mantap di atas peron tanpa melayang atau tenggelam.
- Visibilitas Papan Nama Stasiun: Papan nama stasiun bertuliskan "STASIUN" dengan CanvasTexture dinamis harus tetap terpasang jelas di bawah/depan kanopi tanpa tertutup geometri atap atau tiang.

## Progress Log
- 2026-11-19 11:45:00 — Plan dirumuskan, model bangku, kanopi, bendera dari Kenney CC0 telah diidentifikasi dan siap diintegrasikan.
- 2026-11-19 11:55:00 — Seluruh 5 model GLTF stasiun selesai dibuat dan diintegrasikan, unit test 100% lulus (79 test files, 522 tests), build produksi sukses dengan PWA precache 79 entries, version bump 1.22.0.

## Notes
- Sumber lisensi: Kenney (Furniture Kit, City Kit, Castle Kit — CC0 1.0 Universal / Public Domain).
