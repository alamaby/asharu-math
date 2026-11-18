# Integrasi Model 3D GLTF Biota Akuarium (Clownfish & Blue Fish) Bebas Atribusi (CC0)

Created: 2026-11-18 15:43:00

## Objective
Mengintegrasikan model 3D GLTF kartun/low-poly berlisensi Public Domain / CC0 tanpa syarat atribusi untuk Biota Akuarium (modul Cheerful Aquarium). Ikan satuan (`ones`) menggunakan Clownfish oranye bergaris putih, dan ikan puluhan (`tens`) menggunakan Blue Fish / Blue Tang berbadan biru dan bersirip kuning. Menggantikan geometri balok primitif, mempertahankan hit-area klik untuk fleeing, animasi kibas ekor halus, dukungan reduced-motion, serta graceful fallback ke geometri prosedural.

## Scope
- Penempatan berkas aset 3D GLTF di `public/models/aquarium/clownfish.glb` (81 KB) dan `public/models/aquarium/bluefish.glb` (63 KB) berlisensi CC0 (Quaternius).
- Pembuatan modul loader `src/lib/fishModelLoader.ts` dengan in-memory cache, instansiasi via `SkeletonUtils.clone`, orientasi hadap arah renang (+X), dan konfigurasi `AnimationMixer` untuk renang.
- Integrasi ke `Fish3D.tsx` dan `TensFishGroup3D.tsx` dengan fallback otomatis ke geometri balok jika GLTF belum selesai dimuat.
- Preloading aset GLTF pada `AquariumCanvas.tsx` saat modul akuarium diinisialisasi.
- Unit test komprehensif di `tests/fishModelLoader.test.ts` dan integrasi render di `tests/fish3DIntegration.test.tsx`.
- Verifikasi PWA precaching, linting, typecheck, Vitest, dan build produksi.

## Milestones
1. Fase 1: Penyalinan dan Verifikasi Aset GLTF CC0 ke Direktori Publik
2. Fase 2: Implementasi Modul Loader `fishModelLoader.ts` dan Unit Test
3. Fase 3: Integrasi ke Komponen Visual `Fish3D.tsx` & `TensFishGroup3D.tsx` serta Preload di `AquariumCanvas.tsx`
4. Fase 4: Verifikasi Kualitas Penuh (Lint, Typecheck, Test, Build, PWA) & Dokumentasi Memori Proyek

## Tasks
- [x] Salin berkas model `clownfish.glb` dan `bluefish.glb` ke `public/models/aquarium/`
- [x] Buat modul loader `src/lib/fishModelLoader.ts`
- [x] Buat unit test `tests/fishModelLoader.test.ts`
- [x] Perbarui `src/components/aquarium/Fish3D.tsx` untuk me-render model GLTF dengan animasi mixer & fallback prosedural
- [x] Tambahkan panggilan `preloadFishModels()` pada `src/components/aquarium/AquariumCanvas.tsx`
- [x] Buat tes integrasi `tests/fish3DIntegration.test.tsx`
- [x] Jalankan verifikasi lint, format check, typecheck, dan vitest test suite (73 test files, 498 tests lulus)
- [x] Uji build produksi `npm run build` (PWA precache berhasil di-generate)
- [ ] Catat entri memori proyek di `.memory/` dan usulkan commit 1 baris

## Risks
- Sinkronisasi rotasi hadap renang: GLTF Quaternius menghadap ke arah +Z pada rest state, sedangkan renang `Fish3D.tsx` menghadap ke +X pada `rotation.y = 0`. Penanganan: putar model di loader atau sub-group sebesar `+Math.PI / 2` agar moncong mengarah ke +X. (Terverifikasi)
- SkinnedMesh cloning: klon sederhana `clone()` dari Three.js memutus ikatan skeleton ke mesh. Penanganan: wajib gunakan `SkeletonUtils.clone` seperti pada `animalModelLoader.ts`. (Terverifikasi)
- Aksesibilitas & performa: pengguna dengan `prefers-reduced-motion` atau opsi animasi nonaktif tidak boleh terganggu oleh animasi kibas ekor terus-menerus. Penanganan: pause/skip `mixer.update` jika reduced-motion terdeteksi atau animasi dinonaktifkan. (Terverifikasi)

## Progress Log
- 2026-11-18 15:43:00 — Plan dibuat, model GLTF Quaternius CC0 siap dipindahkan dan diintegrasikan.
- 2026-11-18 15:46:00 — Fase 1, 2, dan 3 selesai: model tersalin ke `public/models/aquarium/`, modul loader `fishModelLoader.ts` dibuat beserta unit test-nya, `Fish3D.tsx` terintegrasi dengan instansiasi GLTF dan animasi renang serta fallback prosedural.
- 2026-11-18 15:50:00 — Fase 4 selesai: verifikasi typecheck, ESLint, Prettier, vitest (73 files, 498 tests), dan build produksi lulus 100%.

## Notes
- Sumber model: Quaternius "Animated Fish Bundle" (Public Domain / CC0, bebas dipakai tanpa atribusi).
- Ukuran total kedua model hanya ~144 KB (sangat ringan untuk PWA).
