# Model GLTF Kereta & Gerbong (Fase 3 & 4: Integrasi TrainScene, Animasi Roda & Artikulasi)

Created: 2026-11-18 14:26:00

## Task / Masalah
Mengintegrasikan model 3D GLTF lokomotif dan gerbong ke dalam `TrainScene.ts` (`makeLocoParts` dan `buildWagonUnits`), memutar seluruh node roda GLTF secara dinamis pada update loop, mempertahankan artikulasi belokan rel, dan menyediakan fallback otomatis ke geometri prosedural jika model belum selesai dimuat.

## Berkas Penting yang Diubah / Dibuat
- `src/components/train/TrainScene.ts`:
  - Menambahkan opsi `TrainSceneOptions` (`useGltf?: boolean`) dan metode `setGltfEnabled(enabled: boolean)`, `isGltfEnabled()`, dan `isDisposed()`.
  - Mengintegrasikan `instantiateTrainModel` ke `makeLocoParts` (dengan fallback ke `makeProceduralLocoParts`).
  - Mengintegrasikan `instantiateTrainModel` ke `buildWagonUnits` (dengan fallback ke `buildProceduralWagonUnits`).
  - Menghubungkan rotasi roda GLTF pada `this.wheels` dan `unit.userData.wheels` di `update(dt)` (`w.rotation.x += spin`).
  - Menghindari tumpang-tindih visual: menyembunyikan roda silinder prosedural dan batang roda prosedural (`rods`) saat mode GLTF aktif.
- `src/components/train/TrainCanvas.tsx`:
  - Menambahkan effect background `preloadTrainModels()` yang secara mulus mengaktifkan `scene.setGltfEnabled(true)` setelah model selesai diunduh/di-cache.
- `tests/trainSceneGltf.test.ts`:
  - 4 pengujian baru yang menguji fallback saat cache kosong, pemasangan mesh GLTF lokomotif/gerbong, rotasi dinamis roda, dan toggle runtime `setGltfEnabled`.
- `plans/2026-11-18-integrasi-model-gltf-kereta.md`: Pembaruan checklist tugas dan progress log.

## Keputusan Teknis & Bisnis
- **Seamless Progressive Upgrade:** Layar kereta selalu langsung terbuka secara instan (0 ms jeda) menggunakan geometri prosedural Three.js. Setelah `preloadTrainModels` di latar belakang selesai, scene beralih ke model GLTF tanpa perlu me-reload atau menghentikan perjalanan kereta.
- **Atomic Carriage Replacement:** Pada `buildWagonUnits`, jika ada satu saja tipe gerbong yang belum siap di-cache GLTF, seluruh rangkaian tetap menggunakan mode prosedural agar tidak terjadi inkonsistensi visual setengah-GLTF setengah-prosedural.
- **Artikulasi Terjaga:** Kloning model GLTF gerbong ditempatkan di dalam grup pivot `unit`, sehingga fungsi `placeUnitOnJourney(wagonS, unit)` yang menghitung orientasi kurva rel tetap bekerja 100% presisi.

## Asumsi & Risiko
- Perangkat dengan koneksi sangat lambat atau offline pertama kali akan menampilkan kereta prosedural sampai service worker selesai mengunduh model. Tidak ada risiko crash atau layar kosong.

## Blocker / Open Item
- Tidak ada blocker.

## Verifikasi
- `npm run test -- train` (23 berkas pengujian, 86 tes train lulus).
- `npm run test` (70 berkas pengujian, 486 tes lulus).
- `npm run typecheck` (tsc noEmit — 0 error).
- `npm run lint` (eslint . — 0 error, 0 warning).

## Proposed Conventional Commit
`feat(train): integrasikan model gltf lokomotif dan gerbong ke trainscene dengan animasi roda`
