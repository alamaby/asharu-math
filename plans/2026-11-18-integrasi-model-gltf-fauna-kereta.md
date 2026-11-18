# Integrasi Model GLTF Fauna Kereta (Sapi & Domba) Bebas Atribusi

Created: 2026-11-18 15:16:00

## Objective
Mengintegrasikan model 3D GLTF fauna berlisensi bebas atribusi (CC0 / Public Domain) untuk menggantikan sapi dan domba prosedural (balok dan sphere kaku) pada scene Petualangan Kereta Angka (`TrainScene.ts`), lengkap dengan pemutaran animasi idle alami, loader in-memory caching, offline PWA precaching, serta fallback otomatis ke geometri prosedural.

## Scope
- Penyiapan berkas aset model 3D GLTF teroptimasi: `public/models/animals/cow.glb` dan `public/models/animals/sheep.glb` (Quaternius CC0).
- Konfigurasi Workbox PWA di `vite.config.ts` untuk mencakup direktori model baru (`models/**/*.{glb,png}`).
- Modul pemuat aset: `src/lib/animalModelLoader.ts` dengan in-memory cache, kloning instans independen, dan binding `THREE.AnimationMixer`.
- Unit test komprehensif: `tests/animalModelLoader.test.ts` untuk memverifikasi isolasi model, fallback saat un-cached, dan penanganan animasi.
- Integrasi ke `TrainScene.ts`: menggantikan representasi balok sapi (`cowBody`, `cowHead`, tanduk, telinga) dan domba (`SphereGeometry`) dengan model GLTF, sekaligus mengupdate `AnimationMixer` di loop animasi frame.
- Preload background di `src/components/train/TrainCanvas.tsx` saat mount komponen.
- Verifikasi regresi: TypeScript strict (`typecheck`), linter (`lint`), dan seluruh suite pengujian (`test`).

## Milestones
1. Fase 1: Penyiapan aset model GLTF teroptimasi di `public/models/animals/` dan update PWA caching.
2. Fase 2: Implementasi `animalModelLoader.ts` dan unit test `tests/animalModelLoader.test.ts`.
3. Fase 3: Integrasi model fauna GLTF ke dalam `TrainScene.ts` dengan pemutaran animasi idle dan fallback prosedural.
4. Fase 4: Preload di `TrainCanvas.tsx`, pengujian regresi, dan validasi build produksi.

## Tasks
- [x] Siapkan direktori `public/models/animals/` dan salin model teroptimasi `cow.glb` serta `sheep.glb`
- [x] Perbarui `vite.config.ts` agar mencakup `models/**/*.{glb,png}` dalam Workbox precache
- [x] Buat modul `src/lib/animalModelLoader.ts` dengan loader, scaling, animation mixer, dan fallback
- [x] Buat unit test `tests/animalModelLoader.test.ts`
- [x] Integrasikan instans fauna GLTF ke `TrainScene.ts` pada metode `buildEnvironment` dan `buildInstancedDetail`
- [x] Tambahkan pembaruan `AnimationMixer` pada `TrainScene.ts` di metode `update(delta)`
- [x] Tambahkan pemanggilan `preloadAnimalModels()` di `TrainCanvas.tsx`
- [x] Jalankan verifikasi linting, typecheck, dan unit tests
- [ ] Perbarui catatan memori proyek di `.memory/`

## Risks
- **Konsumsi Memori & CPU Akibat Skinned Mesh Animation**: Model rigged dengan puluhan tulang (bones) dan `AnimationMixer` dapat memakan siklus CPU pada ponsel kelas bawah jika ada terlalu banyak hewan yang dianimasikan bersamaan.
  - *Mitigasi*: Batasi instans animasi hanya pada 1 sapi dan 2 domba yang ada di dekat rel; nonaktifkan mixer jika `animationsEnabled` dimatikan oleh preferensi pengguna.
- **Ukuran Aset PWA**: Berkas model menambah ukuran unduhan awal sebesar ~915 KB (cow 731 KB + sheep 184 KB).
  - *Mitigasi*: Aset telah dioptimasi dengan `gltf-transform` (weld, dedup, resample, prune); cache PWA diatur secara lazy-preload di latar belakang tanpa menghalangi interaksi pertama anak.

## Progress Log
- 2026-11-18 15:16:00 — Rencana dirumuskan dan berkas plan dibuat.
- 2026-11-18 15:26:00 — Seluruh tugas implementasi dan verifikasi selesai (491 tests lulus, build PWA 42 entries berhasil).

## Notes
- Sumber model: Quaternius (CC0 1.0 Universal / Public Domain Dedication).
- Fallback prosedural lama di `TrainScene.ts` tetap dipertahankan 100% utuh agar game tidak pernah gagal render meski koneksi lambat atau berkas GLB terblokir.
