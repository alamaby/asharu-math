# Model GLTF Fauna Kereta (Sapi & Domba) Bebas Atribusi

Created: 2026-11-18 15:26:00

## Task / Masalah
Mengintegrasikan model 3D GLTF fauna berlisensi bebas atribusi (CC0 / Public Domain) untuk menggantikan sapi dan domba prosedural (balok dan sphere kaku) pada game Petualangan Kereta Angka di *Asharu Math*, lengkap dengan animasi idle alami, offline PWA precaching, dan fallback prosedural transparan.

## Berkas Penting yang Diubah / Dibuat
- `public/models/animals/`: Menempatkan model GLB teroptimasi `cow.glb` (731 KB) dan `sheep.glb` (184 KB) dari Quaternius (CC0).
- `src/lib/animalModelLoader.ts`: Pemuat model GLTF in-memory dengan kloning `SkeletonUtils.clone`, standarisasi skala `ANIMAL_SCALES` (`cow: 0.0045`, `sheep: 0.0042`), deteksi clip animasi idle/eating (`findIdleClip`), dan `instantiateAnimalModel`.
- `tests/animalModelLoader.test.ts`: Unit test untuk validasi path, graceful fallback saat un-cached, penemuan clip idle, dan instansiasi dengan skala/mixer.
- `src/components/train/TrainScene.ts`: Menambahkan integrasi model sapi dan domba GLTF di `buildCow()` dan `buildSheep()`, pembaruan loop animasi `animalMixers` pada `update()`, pembersihan mixer pada `dispose()`, serta refresh mesh mulus pada `setGltfEnabled()`.
- `src/components/train/TrainCanvas.tsx`: Preload background paralel `preloadAnimalModels()` bersama `preloadTrainModels()` saat mount.
- `vite.config.ts`: Memperluas includeAssets ke `'models/**/*.{glb,png}'` untuk caching PWA.
- `tests/trainSceneGltf.test.ts`: Menambahkan pengujian integrasi model fauna GLTF pada tema farm (K2).
- `plans/2026-11-18-integrasi-model-gltf-fauna-kereta.md`: Pelacakan rencana milestone dan tugas.

## Keputusan Teknis & Bisnis
- **Sumber Model:** Memilih model *Cow* dan *Sheep* karya Quaternius dengan lisensi resmi CC0 1.0 Universal (Public Domain, 100% bebas atribusi).
- **Optimasi Aset:** Menjalankan `@gltf-transform/cli` (weld, dedup, resample, prune) untuk memadatkan model dari ~1.25 MB menjadi ~915 KB total, tanpa merusak rig skeletal.
- **Kloning Rig Bersih (`SkeletonUtils.clone`):** Menggunakan `SkeletonUtils.clone` alih-alih `Object3D.clone` agar bind matrix tulang pada SkinnedMesh terikat dengan benar ke instans baru tanpa merusak rig asli di cache.
- **Graceful Fallback:** Jika berkas GLTF belum selesai dimuat atau koneksi offline belum mencache aset, scene secara instan merender representasi geometri prosedural lama sehingga game tidak pernah mengalami layar kosong.
- **Animasi Idle Ramah Lingkungan:** Menghubungkan clip animasi idle (`Eating`/`Idle`) ke `AnimationMixer` lokal per instans dan hanya mengupdatenya jika `animationsEnabled` aktif dan `farmGroup.visible`.

## Asumsi & Risiko
- Model hewan memiliki polycount dan tulang rig lebih tinggi daripada kotak primitif Three.js, namun telah dibatasi hanya untuk 1 sapi dan 2 domba sehingga total draw call dan overhead GPU tetap aman untuk perangkat mobile.

## Blocker / Open Item
- Tidak ada blocker.

## Verifikasi yang Dilakukan
- `npm run test -- tests/animalModelLoader.test.ts` (4 passed).
- `npm run test -- tests/trainSceneGltf.test.ts` (5 passed).
- `npm run test` (71 test files, 491 passed).
- `npm run typecheck` (tsc noEmit — 0 error).
- `npm run lint` (eslint . — 0 error, 0 warning).
- `npm run format:check` (prettier --check . — 100% clean).
- `npm run build` (vite build + PWA generateSW 42 entries — sukses).

## Proposed Conventional Commit
`feat(train): integrasikan model gltf sapi dan domba cc0 dengan animasi idle`
