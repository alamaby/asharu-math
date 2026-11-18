# Plan: Integrasi Model 3D GLTF Kereta & Gerbong (Bebas Atribusi)

Created: 2026-11-18 12:40:00

## Objective

Mengintegrasikan model 3D GLTF/GLB lokomotif dan gerbong kereta berlisensi CC0 (bebas atribusi) dari Kenney Train Kit ke dalam game Petualangan Kereta Angka (`TrainScene.ts`), meningkatkan kualitas estetika visual tanpa mengorbankan performa, kompatibilitas offline PWA, maupun animasi artikulasi rel yang sudah ada.

## Scope

- Aset terpilih: lokomotif (`train-locomotive-a.glb`, `train-diesel-a.glb`), gerbong boxcar (`train-carriage-box.glb`), tanker (`train-carriage-tank.glb`), flatbed (`train-carriage-flatbed.glb`), dan gerbong penumpang (`train-locomotive-passenger-a.glb`).
- Loader & caching: `GLTFLoader` (Three.js), precaching PWA di `vite-plugin-pwa`, fallback ke geometri prosedural jika aset gagal termuat.
- Animasi & integrasi: rotasi node roda (`wheel`, `wheels-front`, `wheels-back`), artikulasi pivot gerbong, dan sinkronisasi partikel asap.
- Pengujian: test suite Three.js (`trainScene*.test.ts`) dan lint/typecheck.

## Milestones

1. **Fase 1 — Kurasi & Penempatan Aset**: Menyaring model GLB esensial dan tekstur `colormap.png` ke dalam direktori publik `public/models/train/` (~600 KB total).
2. **Fase 2 — Modul Loader & Service Worker Precache**: Membuat utility asynchronous loader (`src/lib/trainModelLoader.ts`) dengan caching in-memory, fallback gracefull ke prosedural, serta konfigurasi Workbox/PWA glob pattern.
3. **Fase 3 — Integrasi ke TrainScene**: Menghubungkan model GLB ke dalam metode `buildTrain` dan `buildWagonUnits`.
4. **Fase 4 — Binding Animasi & Artikulasi**: Mengaitkan rotasi roda pada node roda GLTF dan mempertahankan logika artikulasi jarak tempuh per gerbong (`placeUnitOnJourney`).
5. **Fase 5 — Verifikasi & Testing**: Memastikan semua test Vitest lulus, tidak ada regresi performa, dan offline PWA bekerja optimal.

## Tasks

### Fase 1 — Kurasi & Penempatan Aset
- [x] Unduh dan verifikasi lisensi CC0 paket Kenney Train Kit (1.1).
- [x] Inspeksi struktur internal node GLB (memastikan node roda terpisah dari bodi).
- [x] Buat direktori `public/models/train/` dan tempatkan model terpilih + `colormap.png`:
  - [x] `train-locomotive-a.glb` (lokomotif uap klasik)
  - [x] `train-diesel-a.glb` (lokomotif diesel)
  - [x] `train-carriage-box.glb` (gerbong boks)
  - [x] `train-carriage-tank.glb` (gerbong tangki)
  - [x] `train-carriage-flatbed.glb` (gerbong datar)
  - [x] `train-locomotive-passenger-a.glb` (gerbong penumpang)
  - [x] `Textures/colormap.png` (palet warna bersama)

### Fase 2 — Modul Loader & Precache
- [x] Buat `src/lib/trainModelLoader.ts` menggunakan Three.js `GLTFLoader`.
- [x] Tambahkan konfigurasi `includeAssets` di `vite.config.ts` untuk file `models/train/**`.
- [x] Implementasikan fallback otomatis ke `makeLocoParts` prosedural jika load model gagal/offline belum ter-cache.
- [x] Buat unit test `tests/trainModelLoader.test.ts` (100% lulus).

### Fase 3 — Integrasi TrainScene
- [ ] Integrasikan `trainModelLoader` ke siklus hidup inisialisasi `TrainScene`.
- [ ] Pertahankan attachment masinis, penumpang, dan asap partikel pada koordinat GLTF.
- [ ] Sesuaikan skala (*scale*) dan orientasi model GLTF agar cocok dengan rel Three.js saat ini.

### Fase 4 — Binding Animasi Roda & Artikulasi
- [ ] Bind rotasi roda pada node `wheel`, `wheels-front`, dan `wheels-back` saat `elapsed` bertambah.
- [ ] Pastikan posisi pivot gerbong GLTF selaras dengan `placeUnitOnJourney` (artikulasi belokan).

### Fase 5 — Verifikasi
- [ ] Jalankan Vitest (`npm run test`) dan pastikan seluruh test suite lolos.
- [ ] Jalankan Typecheck (`npm run typecheck`) dan linter (`npm run lint`).
- [ ] Validasi build produksi (`npm run build`).

## Risks & Mitigations
- **Risiko A — Asynchronous Loading**: Model GLTF butuh waktu fetch beberapa milidetik; jika canvas langsung merender frame pertama sebelum model siap, kereta bisa berkedip (*flicker*).
  - *Mitigasi*: Preload model saat layar `TrainMenu` terbuka, atau tampilkan model prosedural secara instan lalu ganti (*seamless swap*) saat GLTF siap.
- **Risiko B — Skala & Arah Heading**: Model GLTF eksternal mungkin memiliki skala unit berbeda (misal 1 unit Blender = 1 meter) dan heading berbeda (Z vs -Z).
  - *Mitigasi*: Standarisasi root group transform (scale & rotation) di wrapper loader.

## Progress Log
- 2026-11-18 12:40:00 — Paket Kenney Train Kit (CC0) berhasil diunduh ke scratch, diverifikasi lisensinya (CC0 1.0 Universal), dan diinspeksi struktur nodenya (node roda terbukti terpisah dari bodi). Plan integrasi dibuat.
- 2026-11-18 14:04:00 — Fase 1 & 2 selesai: file GLB model lokomotif & gerbong + tekstur ditempatkan di `public/models/train/`, utilitas loader `src/lib/trainModelLoader.ts` dibuat dengan in-memory cache & wheel detection, `vite.config.ts` diperbarui untuk precaching PWA, dan test suite lulus 100% (482 test).

## Notes
- Sumber resmi: [Kenney Train Kit](https://kenney.nl/assets/train-kit).
- Lisensi murni CC0 (Public Domain), bebas dipakai komersial tanpa atribusi.
