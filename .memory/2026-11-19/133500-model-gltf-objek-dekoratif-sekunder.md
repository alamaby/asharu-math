# Modernisasi Model 3D GLTF Objek Dekoratif Sekunder Petualangan Kereta (CC0)

Task/Masalah:
Memodernisasi objek dekoratif sekunder di dunia 3D Petualangan Kereta (`TrainScene.ts`) yang sebelumnya masih berupa bola mengambang atau geometri primitif polos menjadi aset 3D GLTF berkualitas tinggi berlisensi Public Domain / CC0 tanpa atribusi:
1. **Lentera Tiang Stasiun Senja (`station_lantern.glb`)**: Menggantikan 2 bola mengambang polos tanpa tiang pada tema Kelas 3 (dusk) dengan model tiang lampu stasiun/taman 3D besi dengan kubah kaca bohlam hangat (`lantern_glass`) yang terhubung ke kontrol emissive intensitas cahaya senja.
2. **Rumpun Bunga Padang Rumput (`flower_patch.glb`)**: Menggantikan 2 bola petal pink/kuning polos pada tema Kelas 1 (flowers) dengan model rumpun bunga low-poly cerah lengkap dengan daun dasar dan 4 kuntum bunga warna-warni yang asri.
3. **Kupu-Kupu Tematik Beranimasi (`butterfly.glb`)**: Menggantikan kapsul polos dan plane sayap dengan model 3D kupu-kupu manis berengsel sayap ganda (`wing_left`, `wing_right`) yang mengepak dinamis dan melayang di udara.

Berkas Penting yang Diubah / Dibuat:
- `public/models/train/station_lantern.glb`: Model 3D tiang lentera stasiun (26.7 KB) dengan pedestal besi cor, tiang vertikal, kerah cincin, bracket, kubah kaca `lantern_glass`, 4 jeruji pelindung, dan atap kanopi lentera.
- `public/models/train/flower_patch.glb`: Model 3D rumpun bunga (91.1 KB) dengan daun dasar di tanah, 4 tangkai, dan 4 kuntum bunga berkelopak 5 dengan putik bulat cerah.
- `public/models/train/butterfly.glb`: Model 3D kupu-kupu (12.9 KB) dengan tubuh, kepala, antena, dan sayap kiri-kanan berengsel di sumbu X.
- `src/lib/decorModelLoader.ts`: Modul loader in-memory singleton untuk model dekoratif sekunder dengan kloning instansiasi, isolasi material kaca lentera, dan helper preloading.
- `tests/decorModelLoader.test.ts`: Unit test loader memvalidasi cache in-memory, isolasi klon material kubah lentera, dan ekstraksi sayap kupu-kupu.
- `src/components/train/TrainScene.ts`: Integrasi model lentera GLTF ke `duskGroup`, rumpun bunga dan kupu-kupu ke `flowersGroup`, pembaruan loop animasi kibasan sayap kupu-kupu di `update()`, pembaruan intensitas emissive lentera di `applyTheme()`, dan auto-fallback prosedural.
- `src/components/train/TrainCanvas.tsx`: Menambahkan `preloadDecorModels()` pada antrean preload inisialisasi.
- `tests/trainSceneGltf.test.ts`: Pengetesan integrasi part `gltf-station-lantern`, `gltf-flower-patch`, dan `gltf-butterfly` beserta kontrol emissive senja.
- `package.json`: Bump versi ke `1.24.0`.
- `plans/2026-11-19-modernisasi-objek-dekoratif-sekunder.md`: Plan dan progress log diselesaikan.

Keputusan Teknis/Bisnis:
1. **Binding Material Kaca Lentera Independen**: Tiap instansi `station_lantern` memiliki sub-mesh `lantern_glass` yang dikloning materialnya (`material.clone()`) agar pembaruan `emissiveIntensity` di `applyTheme(theme.stationLight ? 1.4 : 0.15)` berjalan terisolasi tanpa mempengaruhi template aslinya. Lentera ditempatkan di `y = 0.38` berdiri kokoh di atas permukaan peron stasiun semen.
2. **Animasi Sayap Kupu-Kupu Tanpa Rangka Tulang (Bones)**: Sub-mesh `wing_left` dan `wing_right` didesain dengan titik pivot tepat di engsel badan ($x = 0$), sehingga rotasi `wingRight.rotation.z = flap` dan `wingLeft.rotation.z = -flap` menghasilkan kepakan sayap alami berkecepatan tinggi tanpa memerlukan overhead komputasi skeletal skinning.
3. **Graceful Fallback & Isolasi**: Jika GLTF belum termuat atau berjalan di lingkungan pengujian tanpa WebGL (JSDOM), elemen prosedural lama (`procedural-lantern`, `procedural-flower`, `procedural-butterfly`) otomatis aktif dan tetap beranimasi.

Verifikasi yang Dilakukan:
- `npm run format:check` & `npm run format` (Prettier konsisten)
- `npm run typecheck` (`tsc --noEmit` lulus 0 error)
- `npm run lint` (`eslint .` lulus 0 error/warning)
- `npm run test` (Vitest: 81 test files / 535 tests lulus 100%)
- `npm run build` (Vite production build sukses dalam 11.27s, PWA precache 89 entries)

Proposed Conventional Commit:
`feat(train): integrasikan model gltf objek dekoratif sekunder cc0`
