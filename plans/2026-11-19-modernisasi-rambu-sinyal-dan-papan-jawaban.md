# Modernisasi Model 3D GLTF Rambu Sinyal Junction & Papan Rambu Jawaban Rel (CC0)

Created: 2026-11-19 13:00:00

## Objective
Memodernisasi sistem rambu sinyal persimpangan rel (*junction signal light post*) dan papan penanda jawaban cabang (*branch answer sign boards*) di modul *Petualangan Kereta Angka* (`TrainScene.ts`) dengan aset 3D GLTF berkualitas tinggi berlisensi Public Domain / CC0 tanpa atribusi wajib:
1. **Tiang Sinyal Rel Junction (`signal_post.glb`)**: Menggantikan tiang silinder tunggal dan 3 bola mengambang prosedural dengan tiang sinyal kereta 3D lengkap dengan pedestal beton, tangga/ladder pemeliharaan, rumah lampu berpelindung (*signal hoods/visors*), serta 3 lensa lampu aktif yang terhubung dinamis ke sistem pemilihan cabang (`setSignal(branchIndex, ok)` dengan efek emissive hijau/kuning).
2. **Plang Rambu Jawaban Cabang (`branch_sign.glb`)**: Menggantikan balok kotak mengambang polos prosedural dengan model plang rambu stasiun/rel 3D berkaki tiang kokoh yang menancap ke tanah, bingkai kayu/baja dengan baut penahan, serta bidang display yang menampung tekstur angka canvas 2D dinamis (`CanvasTexture`).

Mempertahankan auto-fallback ke geometri prosedural lama saat GLTF belum di-cache atau dijalankan di lingkungan pengujian tanpa WebGL (JSDOM / Node.js).

## Scope
- Penempatan model teroptimasi di `public/models/train/`:
  - `signal_post.glb` (Tiang sinyal kereta 3 lampu)
  - `branch_sign.glb` (Plang rambu jawaban rel berkaki tiang)
- Pembuatan modul loader in-memory `src/lib/signalModelLoader.ts` dengan in-memory cache, kloning instansiasi, penyesuaian skala, dan helper `preloadSignalModels()`.
- Pembuatan unit test `tests/signalModelLoader.test.ts`.
- Integrasi ke `TrainScene.ts` pada metode `buildEnvironment()`, `setSignal()`, `buildTracks()`, `refreshTrackMeshes()`, dan `refreshSignalMeshes()`.
- Preloading di `src/components/train/TrainCanvas.tsx`.
- Pengujian regresi visual dan GLTF di `tests/trainSceneGltf.test.ts` dan `tests/trainSceneDetail.test.ts`.
- Verifikasi PWA precaching, lint, format check, typecheck, vitest (80 test files), dan build produksi.
- Pencatatan memori proyek di `.memory/` dan bump versi ke `1.23.0`.

## Milestones
1. Fase 1: Pembuatan dan Optimasi Aset GLTF CC0 `signal_post.glb` & `branch_sign.glb` di `public/models/train/`
2. Fase 2: Implementasi Modul Loader `signalModelLoader.ts` & Unit Test
3. Fase 3: Integrasi Rambu Sinyal & Papan Rambu Jawaban ke `TrainScene.ts` & Preload di `TrainCanvas.tsx`
4. Fase 4: Verifikasi Penuh (Lint, Typecheck, Test, Build, PWA) & Dokumentasi Memori Proyek

## Tasks
- [x] Buat dan optimasi model 3D GLTF `signal_post.glb` dan `branch_sign.glb` di `public/models/train/`
- [x] Buat modul loader in-memory `src/lib/signalModelLoader.ts`
- [x] Buat unit test `tests/signalModelLoader.test.ts`
- [x] Integrasikan `signal_post.glb` ke `buildEnvironment()` dan `setSignal()` di `TrainScene.ts` dengan auto-fallback prosedural
- [x] Integrasikan `branch_sign.glb` ke `refreshTrackMeshes()` dan `setAnswers()` di `TrainScene.ts` dengan canvas texture angka dinamis
- [x] Tambahkan pemanggilan `preloadSignalModels()` pada `TrainCanvas.tsx`
- [x] Update pengujian di `tests/trainSceneGltf.test.ts` untuk memvalidasi part sinyal dan rambu jawaban GLTF
- [x] Jalankan verifikasi lint, format check, typecheck, dan seluruh vitest test suite
- [x] Uji build produksi `npm run build` dan pastikan PWA precache menyertakan model sinyal & rambu
- [x] Bump versi ke `1.23.0` di `package.json`
- [x] Catat entri memori proyek di `.memory/` dan update `.memory/README.md`
- [x] Commit 1 baris Conventional Commits tanpa trailer dan push ke `origin/main`

## Risks
- Interaksi Emissive Lampu Sinyal: Material ketiga lensa lampu pada model GLTF harus dapat diakses dan diupdate oleh method `setSignal` agar efek nyala hijau (benar) dan kuning (salah) tetap responsif secara instan saat pemain memilih cabang rel.
- Penempelan CanvasTexture pada Plang Rambu: Bidang display pada model plang 3D harus memiliki pemetaan UV yang presisi agar angka jawaban matematika tidak terbalik atau terdistorsi saat dirender di atas rel cabang.

## Progress Log
- 2026-11-19 13:00:00 — Plan dirumuskan, arsitektur model tiang sinyal dan plang rambu jawaban dirancang.
- 2026-11-19 13:15:00 — Pembuatan model GLB selesai (`signal_post.glb` dan `branch_sign.glb`), loader `signalModelLoader.ts` dibuat beserta unit test, integrasi ke `TrainScene.ts` dan `TrainCanvas.tsx` selesai, typecheck, lint, vitest 80 test files lulus 100%, dan build produksi Vite PWA sukses. Versi di-bump ke 1.23.0.

## Notes
- Desain model: Bergaya low-poly kartun bersih konsisten dengan Kenney Train Kit dan Quaternius (CC0 1.0 Universal / Public Domain).
