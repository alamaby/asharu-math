# Model GLTF Lingkungan Akuarium (Karang, Rumput Laut, Batu) Bebas Atribusi (CC0)

Timestamp: 2026-11-18 16:30:00
Plan: [plans/2026-11-18-integrasi-model-gltf-lingkungan-akuarium.md](file:///C:/Works/github.com/alamaby/asharu-math/plans/2026-11-18-integrasi-model-gltf-lingkungan-akuarium.md)

## Task / Masalah
Mengganti elemen lingkungan bawah laut yang sebelumnya berupa balok prosedural kasar (`boxGeometry`) dan silinder hijau polos (`cylinderGeometry`) di `AquariumEnvironment3D.tsx` dengan model 3D GLTF berkualitas tinggi berlisensi Public Domain / CC0 tanpa atribusi:
1. Terumbu Karang (`coral.glb`, 395 KB, MiniPoly CC0 Public Domain): Formasi karang laut warna-warni bercahaya (emissive bioluminescent) di dasar pasir tengah akuarium.
2. Rumput Laut (`seaweed.glb`, 3.4 KB, Kenney Nature Kit, CC0 1.0 Universal): Tanaman berdaun pita alami di sisi kiri dan kanan akuarium.
3. Batu Karang (`rock.glb`, 3.0 KB, Kenney Nature Kit, CC0 1.0 Universal): Batuan karang laut alami di dasar pasir.

## Berkas Penting yang Diubah / Dibuat
- `public/models/aquarium/coral.glb`: Model 3D formasi karang laut bercahaya MiniPoly CC0 (395 KB).
- `public/models/aquarium/seaweed.glb`: Model 3D tanaman laut berdaun pita Kenney CC0 (3.4 KB).
- `public/models/aquarium/rock.glb`: Model 3D bebatuan karang Kenney CC0 (3.0 KB).
- `src/lib/aquariumEnvLoader.ts`: Modul loader in-memory terpadu untuk lingkungan akuarium (`coral`, `seaweed`, `rock`), caching instans, helper preloading, dan instansiasi via cloning dengan penyesuaian skala.
- `tests/aquariumEnvLoader.test.ts`: Unit test loader memverifikasi path `/models/aquarium/`, skala positif, in-memory caching, dan graceful fallback (3 test).
- `src/components/aquarium/AquariumEnvironment3D.tsx`: Mengintegrasikan model GLTF karang, batuan karang, dan rumput laut dengan variasi rotasi alami dan auto-fallback ke geometri prosedural lama saat GLTF belum/gagal dimuat.
- `src/components/aquarium/AquariumCanvas.tsx`: Menambahkan pemanggilan `preloadAquariumEnvModels()` secara asinkron saat modul dimuat.
- `package.json`: Bump versi dari `1.18.0` ke `1.19.0`.

## Keputusan Teknis & Bisnis
- **Lisensi 100% CC0 / Bebas Atribusi**: Menggunakan bundel karang MiniPoly (Public Domain) dan Kenney Nature Kit (CC0 1.0 Universal) sehingga aman tanpa kewajiban atribusi di UI aplikasi anak-anak.
- **Kedalaman Z & Frustum Guard**: Formasi karang ditempatkan di posisi `[0, -2.18, -0.35]` tepat di atas pasir (`y = -2.2`) di latar belakang (`z = -0.35`), sehingga tidak menutupi lintasan renang ikan satuan di kanan dan grup puluhan di kiri.
- **Graceful Fallback Prosedural**: Geometri balok dan silinder lama tetap dipertahankan sebagai fallback otomatis jika GLTF belum dimuat atau berjalan di lingkungan test (JSDOM) tanpa WebGL.
- **PWA Offline Precache**: Model otomatis terdaftar dalam precache PWA Workbox (57 entri, 3.89 MB total) melalui aturan glob pattern `.glb` di `vite.config.ts`.

## Asumsi & Risiko
- Ukuran total ketiga aset lingkungan hanya ~401 KB, sehingga sangat ramah memori dan jaringan seluler anak-anak.
- Jumlah poligon sangat rendah (<1000 segitiga untuk seluruh lingkungan), menjaga performa tetap 60 FPS di layar perangkat mobile berdaya rendah.

## Verifikasi yang Dilakukan
- `npm run format:check`: 100% kode rapi dan lolos Prettier.
- `npm run typecheck`: 0 error TypeScript strict.
- `npm run lint`: 0 error dan 0 warning ESLint.
- `npm run test`: 75 test files passed (505 tests) lolos 100%.
- `npm run build`: Build produksi Vite sukses, PWA precache 57 entries.

## Proposed Conventional Commit
`feat(aquarium): integrasikan model gltf karang, rumput laut, dan batu cc0`
