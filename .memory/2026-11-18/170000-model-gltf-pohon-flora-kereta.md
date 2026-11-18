# Model GLTF Pohon & Flora Kereta Bebas Atribusi (CC0)

Timestamp: 2026-11-18 17:00:00
Plan: [plans/2026-11-18-integrasi-model-gltf-pohon-flora-kereta.md](file:///C:/Works/github.com/alamaby/asharu-math/plans/2026-11-18-integrasi-model-gltf-pohon-flora-kereta.md)

## Task / Masalah
Mengganti elemen pohon prosedural (batang silinder + kerucut daun tunggal / tumpuk) di modul *Petualangan Kereta Angka* (`TrainScene.ts`) dengan model 3D GLTF berkualitas tinggi berlisensi Public Domain / CC0 tanpa atribusi:
1. Pohon Rindang Utama (`tree_default.glb`, 9.4 KB, Kenney Nature Kit, CC0 1.0 Universal): Menggantikan 4 pohon silinder di dekat stasiun dan rel, dengan animasi ayunan angin dedaunan (`sway`) pada sub-mesh daun.
2. Pohon Pinus Latar (`tree_pine.glb`, 17.2 KB, Kenney Nature Kit, CC0 1.0 Universal): Menggantikan 6 pohon pinus kerucut bertumpuk di bukit latar lanskap.
3. Pohon Bulat / Oak (`tree_oak.glb`, 14.6 KB, Kenney Nature Kit, CC0 1.0 Universal): Menggantikan 4 pohon bulat kanopi ganda di padang rumput stasiun.

## Berkas Penting yang Diubah / Dibuat
- `public/models/train/tree_default.glb`: Model GLTF pohon rindang Kenney CC0 (9.4 KB).
- `public/models/train/tree_pine.glb`: Model GLTF pohon pinus Kenney CC0 (17.2 KB).
- `public/models/train/tree_oak.glb`: Model GLTF pohon bulat oak Kenney CC0 (14.6 KB).
- `src/lib/treeModelLoader.ts`: Modul loader in-memory terpadu untuk pohon (`tree_default`, `tree_pine`, `tree_oak`), in-memory caching, helper `preloadTreeModels()`, dan pendeteksi otomatis `leafMesh` untuk animasi goyang angin.
- `tests/treeModelLoader.test.ts`: Unit test loader memverifikasi path `/models/train/`, skala positif, in-memory caching, dan pendeteksian leafMesh (3 test).
- `src/components/train/TrainScene.ts`: Mengintegrasikan model GLTF pohon utama, pinus, dan oak dengan auto-fallback prosedural, pemisahan instanced mesh saat GLTF aktif, dan pemutaran rotasi angin pada sub-mesh daun.
- `src/components/train/TrainCanvas.tsx`: Menambahkan `preloadTreeModels()` pada `Promise.allSettled`.
- `tests/trainSceneGltf.test.ts`: Menambahkan unit test scene pohon GLTF (verifikasi part `gltf-tree`, `gltf-pine`, dan `gltf-oak`).
- `package.json`: Bump versi ke `1.20.0`.

## Keputusan Teknis & Bisnis
- **Lisensi 100% CC0 / Bebas Atribusi**: Menggunakan bundel Kenney Nature Kit (CC0 1.0 Universal) yang bebas royalti dan atribusi, aman untuk konten anak-anak.
- **Pemisahan Leaf Sub-Mesh untuk Animasi Sway**: Pada `tree_default.glb`, sub-mesh daun (`leafsGreen`) dideteksi oleh loader dan didaftarkan ke array `this.leaves`, sehingga ayunan angin lembut alami (`Math.sin(elapsed * 1.5 + i) * 0.06`) tetap berjalan tanpa memiringkan pangkal batang dari tanah.
- **Isolasi Instanced Tree Group**: Pinus dan round trees di `buildInstancedDetail()` dikelompokkan ke dalam `instancedTreeGroup` yang dapat disembunyikan saat GLTF aktif, mencegah duplikasi mesh dengan model GLTF baru sambil mempertahankan elemen detail lainnya (apel merah, batu, pagar, bunga, burung).
- **Graceful Auto-Fallback**: Geometri prosedural lama tetap dipertahankan penuh saat GLTF belum di-cache atau saat dijalankan di lingkungan non-WebGL (JSDOM).
- **PWA Offline Precache**: Model otomatis tercakup dalam precache PWA Workbox (63 entri, 3.93 MB total).

## Asumsi & Risiko
- Ukuran total ketiga aset pohon hanya ~41.2 KB, sangat ringan dan tidak membebani kuota atau memori perangkat anak-anak.
- Jumlah poligon sangat minim (~150-200 segitiga per pohon), menjamin performa scene Three.js tetap mulus di 60 FPS pada perangkat mobile.

## Verifikasi yang Dilakukan
- `npm run format:check`: 100% lolos Prettier code style.
- `npm run typecheck`: 0 error TypeScript strict.
- `npm run lint`: 0 error dan 0 warning ESLint.
- `npm run test`: 76 test files passed (509 tests) lulus 100%.
- `npm run build`: Build produksi Vite sukses, PWA precache 63 entries.

## Proposed Conventional Commit
`feat(train): integrasikan model gltf pohon rindang, pinus, dan oak cc0`
