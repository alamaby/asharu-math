# Model GLTF Kereta & Gerbong Bebas Atribusi (Fase 1 & 2: Aset, Loader, dan PWA Cache)

Created: 2026-11-18 14:05:00

## Task / Masalah
Mencarikan dan menyiapkan model 3D GLTF lokomotif dan gerbong kereta yang 100% bebas atribusi (CC0), serta menyiapkan infrastruktur loader dan caching PWA untuk game Petualangan Kereta Angka di *Asharu Math*.

## Berkas Penting yang Diubah / Dibuat
- `public/models/train/`: Menempatkan model GLB esensial (`train-locomotive-a.glb`, `train-diesel-a.glb`, `train-carriage-box.glb`, `train-carriage-tank.glb`, `train-carriage-flatbed.glb`, `train-locomotive-passenger-a.glb`, `train-connector.glb`) dan tekstur `Textures/colormap.png`.
- `src/lib/trainModelLoader.ts`: Utilitas asynchronous loader berbasis `GLTFLoader` Three.js dengan in-memory cache, auto-detection node roda (`wheel`/`wheels`), standarisasi skala `KENNEY_TRAIN_SCALE = 0.85`, dan fallback sinkron/asinkron.
- `vite.config.ts`: Menambahkan `models/train/**/*.{glb,png}` ke `includeAssets` dan `globPatterns` Workbox PWA.
- `tests/trainModelLoader.test.ts`: Unit test untuk validasi path, graceful fallback, in-memory caching, dan deteksi node roda.
- `plans/2026-11-18-integrasi-model-gltf-kereta.md`: Dokumen pelacakan rencana 5 fase.

## Keputusan Teknis & Bisnis
- **Sumber Model:** Memilih *Kenney Train Kit* (v1.1) dengan lisensi resmi CC0 1.0 Universal (Public Domain Dedication, tanpa kewajiban atribusi).
- **Skala Gauge:** Menerapkan skala 0.85 pada root group GLTF agar lebar bodi (1.21) dan jarak roda pas dengan gauge rel Three.js (0.90) yang sudah ada.
- **Hierarki Roda Terpisah:** Node roda diverifikasi independen dari bodi sehingga dapat dianimasikan putarannya secara terpisah.
- **Graceful Fallback:** Jika GLTF belum selesai dimuat atau gagal jaringan, fungsi `instantiateTrainModel` mengembalikan `null` sehingga scene secara instan merender geometri prosedural tanpa layar kosong.

## Asumsi & Risiko
- Integrasi ke `TrainScene.ts` (Fase 3 & 4) membutuhkan penyesuaian posisi attachment masinis, penumpang, dan asap agar pas dengan kabin/cerobong model GLTF baru.

## Blocker / Open Item
- Fase 3 & 4: Integrasi model GLTF ke dalam `TrainScene.ts` dan binding animasi putaran roda.

## Verifikasi
- `npm run test -- tests/trainModelLoader.test.ts` (4 passed).
- `npm run test` (69 test files, 482 passed).
- `npm run typecheck` (tsc noEmit — 0 error).
- `npm run lint` (eslint . — 0 error, 0 warning).

## Proposed Conventional Commit
`feat(train): siapkan model gltf lokomotif dan gerbong cc0 serta loader pwa`
