# Integrasi Model 3D GLTF Lingkungan Bawah Laut Akuarium (Karang, Rumput Laut, Batu) Bebas Atribusi (CC0)

Created: 2026-11-18 16:23:00

## Objective
Mengintegrasikan model 3D GLTF kartun/low-poly berlisensi Public Domain / CC0 tanpa atribusi wajib untuk elemen lingkungan bawah laut di modul *Cheerful Aquarium* (`AquariumEnvironment3D.tsx`):
1. **Karang Laut / Coral Reef (`coral.glb`, 395 KB, MiniPoly CC0)**: Formasi karang laut warna-warni bercahaya (emissive bioluminescent) di dasar akuarium.
2. **Rumput Laut / Seaweed (`seaweed.glb`, 3.4 KB, Kenney CC0)**: Tanaman laut berdaun pita di sisi kiri dan kanan akuarium menggantikan silinder hijau polos.
3. **Batu Karang / Rock (`rock.glb`, 3.0 KB, Kenney CC0)**: Bebatuan karang alami di dasar pasir menggantikan kubus kotak abu-abu.

Mempertahankan efek partikel gelembung naik (`rising bubbles`), dasar pasir (`sand bottom plane`), auto-fallback ke geometri prosedural saat un-cached, preloading terpadu di `AquariumCanvas.tsx`, serta pengujian 100%.

## Scope
- Penempatan model di `public/models/aquarium/coral.glb`, `public/models/aquarium/seaweed.glb`, dan `public/models/aquarium/rock.glb`.
- Pembuatan modul loader `src/lib/aquariumEnvLoader.ts` dengan in-memory cache, instansiasi via cloning, dan skala penyesuaian.
- Integrasi ke `AquariumEnvironment3D.tsx` dengan fallback otomatis ke geometri prosedural lama.
- Preloading aset lingkungan di `AquariumCanvas.tsx`.
- Unit test di `tests/aquariumEnvLoader.test.ts` dan integrasi di `tests/aquariumLifecycle.test.tsx`.
- Verifikasi PWA precaching, lint, typecheck, vitest, dan build produksi.

## Milestones
1. Fase 1: Penempatan dan Verifikasi Aset Model GLTF CC0 di `public/models/aquarium/`
2. Fase 2: Implementasi Modul Loader `aquariumEnvLoader.ts` dan Unit Test
3. Fase 3: Integrasi ke `AquariumEnvironment3D.tsx` & Preload di `AquariumCanvas.tsx`
4. Fase 4: Verifikasi Penuh (Lint, Typecheck, Test, Build, PWA) & Dokumentasi Memori Proyek

## Tasks
- [x] Salin berkas model `coral_reef.glb`, `plant_flatTall.glb`, dan `rock_smallA.glb` ke `public/models/aquarium/`
- [x] Buat modul loader `src/lib/aquariumEnvLoader.ts`
- [x] Buat unit test `tests/aquariumEnvLoader.test.ts`
- [x] Integrasikan instansiasi model karang, rumput laut, dan batu ke `AquariumEnvironment3D.tsx` dengan fallback prosedural
- [x] Tambahkan pemanggilan `preloadAquariumEnvModels()` di `AquariumCanvas.tsx`
- [x] Jalankan verifikasi lint, format check, typecheck, dan vitest test suite
- [x] Uji build produksi `npm run build`
- [x] Catat entri memori proyek di `.memory/` dan usulkan commit 1 baris

## Risks
- Posisi dan Kedalaman Z (Frustum Clipping): Karang dan tanaman laut harus ditempatkan di bidang belakang atau sejajar dengan pasir (`z: -0.3` s/d `+0.2`) agar tidak menutupi lintasan renang ikan satuan di kanan dan grup puluhan di kiri. (Penanganan: posisi diatur di latar belakang dasar akuarium).
- Performa Rendering: Model low-poly (<1000 poligon total untuk semua lingkungan) menjaga frame rate tetap 60 FPS di layar mobile.

## Progress Log
- 2026-11-18 16:23:00 — Plan dibuat, aset model CC0 siap disalin dan diintegrasikan.
- 2026-11-18 16:29:00 — Integrasi model lingkungan akuarium selesai, 75 test files passed (505 tests), build PWA 57 precache entries sukses, versi bumped ke 1.19.0.

## Notes
- Sumber model: MiniPoly (Coral Reef Set, Public Domain) dan Kenney (Nature Kit, CC0 1.0 Universal).
- Total ukuran ketiga aset hanya ~401 KB.
