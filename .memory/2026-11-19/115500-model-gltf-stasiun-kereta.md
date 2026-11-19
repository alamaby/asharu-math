# Model GLTF Area Stasiun Kereta Bebas Atribusi (CC0)

Timestamp: 2026-11-19 11:55:00
Plan: [plans/2026-11-19-modernisasi-model-stasiun-kereta.md](file:///C:/Works/github.com/alamaby/asharu-math/plans/2026-11-19-modernisasi-model-stasiun-kereta.md)

## Task / Masalah
Mengganti elemen stasiun prosedural (platform kotak semen polos, atap balok peneduh & tiang silinder, balok bangku kayu kasar, jam silinder polos, dan tiang bendera plane datar) di modul *Petualangan Kereta Angka* (`TrainScene.ts`) dengan aset 3D GLTF berkualitas tinggi berlisensi Public Domain / CC0 tanpa atribusi wajib:
1. **Bangku Tunggu Peron (`station_bench.glb`, 10.8 KB, Kenney Furniture Kit CC0)**: Model bangku kayu stasiun dengan sandaran dan rangka kaki melengkung elegan menggantikan balok kotak mentah.
2. **Kanopi & Peneduh Stasiun (`station_canopy.glb`, 34.5 KB, Kenney City Kit CC0)**: Model atap stasiun merah dengan fascia putih dan 4 tiang baja ber-braket siku diagonal.
3. **Tiang Bendera & Bendera (`station_flag.glb`, 17.0 KB, Kenney Castle Kit CC0)**: Tiang bendera logam dengan finial bola emas dan kain bendera bergelombang merah yang berayun lembut ditiup angin.
4. **Jam Dinding Stasiun (`station_clock.glb`, 43.4 KB, Kenney CC0)**: Jam stasiun klasik berbingkai slate, dial putih, 12 penanda jam, dan jarum jam/menit oranye-emas.
5. **Peron Stasiun Modular (`station_platform.glb`, 5.9 KB)**: Lantai peron beton dengan beveled curb dan strip batas aman kuning (*yellow tactile warning strip*).

## Berkas Penting yang Diubah / Dibuat
- `public/models/train/station_bench.glb`: Model GLTF bangku stasiun Kenney CC0 (10.8 KB).
- `public/models/train/station_canopy.glb`: Model GLTF kanopi peneduh stasiun Kenney CC0 (34.5 KB).
- `public/models/train/station_flag.glb`: Model GLTF tiang bendera dan kain bendera berkibar (17.0 KB).
- `public/models/train/station_clock.glb`: Model GLTF jam stasiun klasik (43.4 KB).
- `public/models/train/station_platform.glb`: Model GLTF peron modular bergaris batas aman (5.9 KB).
- `src/lib/stationModelLoader.ts`: Modul loader in-memory terpadu untuk elemen stasiun (`bench`, `canopy`, `flag`, `clock`, `platform`), in-memory caching, dan helper `preloadStationModels()`.
- `tests/stationModelLoader.test.ts`: Unit test loader memverifikasi path `/models/train/`, scaling, in-memory caching, dan instansiasi (4 test).
- `src/components/train/TrainScene.ts`:
  - `buildStation`: Mengelompokkan peron, kanopi, bangku, jam, dan bendera ke dalam `proceduralStationGroup` dan `gltfStationGroup`. Papan nama stasiun bertekstur dinamis tetap aktif di `stationGroup`.
  - `refreshStationMeshes`: Hot-swapping grup prosedural dan GLTF stasiun saat mode GLTF aktif.
  - `update(dt)`: Mengayunkan bendera GLTF (`this.gltfFlagCloth`) bersinkronisasi dengan gelombang angin.
- `src/components/train/TrainCanvas.tsx`: Menambahkan `preloadStationModels()` pada `Promise.allSettled`.
- `tests/trainSceneGltf.test.ts`: Menambahkan unit test integrasi scene untuk memvalidasi part `gltf-station-platform`, `gltf-station-canopy`, `gltf-station-bench`, `gltf-station-clock`, dan `gltf-station-flag`.
- `package.json`: Bump versi ke `1.22.0`.

## Keputusan Teknis & Bisnis
- **Lisensi 100% CC0 / Bebas Atribusi**: Menggunakan aset dari Kenney (Furniture Kit, City Kit, Castle Kit) berlisensi CC0 1.0 Universal / Public Domain.
- **Ukuran Sangat Ringan**: Total ukuran kelima aset GLTF stasiun hanya ~111 KB, tidak membebani kuota atau memori perangkat seluler anak-anak.
- **Papan Nama Dinamis Tetap Terjaga**: Papan nama stasiun bertuliskan "STASIUN" dengan `CanvasTexture` tetap diposisikan secara konsisten di atas peron stasiun sehingga teks stasiun dan status ("SELESAI", dsb.) selalu terbaca jelas.
- **Graceful Auto-Fallback**: Geometri prosedural lama tetap dipertahankan penuh saat GLTF belum di-cache atau saat dijalankan di lingkungan non-WebGL (JSDOM).
- **PWA Offline Precache**: Model otomatis tercakup dalam precache PWA Workbox (79 entri, 5.54 MB total).

## Asumsi & Risiko
- Elevasi peron stasiun disetel sejajar dengan pijakan lokomotif dan kaki penumpang ($y = 0.38 - 0.4$) sehingga masinis dan penumpang berdiri mantap di atas peron.
- Tiang kanopi berada di belakang peron ($z = -17$) sehingga tidak menghalangi bodi kereta yang berhenti di $z = -16$.

## Verifikasi yang Dilakukan
- `npm run format:check`: 100% lolos Prettier code style.
- `npm run typecheck`: 0 error TypeScript strict.
- `npm run lint`: 0 error dan 0 warning ESLint.
- `npm run test`: 79 test files passed (522 tests) lulus 100%.
- `npm run build`: Build produksi Vite sukses dalam 8.79s, PWA precache 79 entries.

## Proposed Conventional Commit
`feat(train): integrasikan model gltf area stasiun kereta cc0`
