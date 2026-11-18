# Integrasi Model 3D GLTF Bangunan Kereta (Rumah & Lumbung) Bebas Atribusi (CC0)

- **Tanggal & Waktu:** 2026-11-18 16:05:00 WIB
- **Topik:** Integrasi Model 3D GLTF Bangunan Kereta (Rumah & Lumbung) Bebas Atribusi (CC0)
- **Terkait:** [`plans/2026-11-18-integrasi-model-gltf-bangunan-kereta.md`](file:///C:/Works/github.com/alamaby/asharu-math/plans/2026-11-18-integrasi-model-gltf-bangunan-kereta.md)

---

## 1. Task & Masalah
Mengganti representasi visual bangunan di lintasan *Petualangan Kereta Angka* (`TrainScene.ts`) dari balok prosedural primitif (`BoxGeometry` + `CylinderGeometry`) menjadi model 3D GLTF kartun/low-poly berlisensi Public Domain / CC0 tanpa syarat atribusi:
1. **Rumah Warga (`house.glb`, 49.3 KB)**: Menggantikan balok rumah di tepi rel kiri dan kanan (posisi `[-11, -2]` dan `[11, -3]`).
2. **Lumbung Pertanian (`barn.glb`, 96.8 KB)**: Menggantikan balok lumbung petak pertanian K2 (posisi `[-12, -16]`).

Mempertahankan auto-fallback ke geometri prosedural jika GLTF belum/gagal dimuat, centering pivot dan ground alignment sempurna, serta dukungan PWA offline precaching.

---

## 2. Berkas Penting yang Diubah / Dibuat
- [`public/models/train/house.glb`](file:///C:/Works/github.com/alamaby/asharu-math/public/models/train/house.glb) (49.3 KB, Quaternius CC0).
- [`public/models/train/barn.glb`](file:///C:/Works/github.com/alamaby/asharu-math/public/models/train/barn.glb) (96.8 KB, Quaternius CC0).
- [`src/lib/buildingModelLoader.ts`](file:///C:/Works/github.com/alamaby/asharu-math/src/lib/buildingModelLoader.ts): loader model GLTF bangunan dengan in-memory cache, instansiasi via cloning dengan penyesuaian pivot center dasar rumah, dan skala proporsional dunia kereta.
- [`src/components/train/TrainScene.ts`](file:///C:/Works/github.com/alamaby/asharu-math/src/components/train/TrainScene.ts): pemisahan method `buildHouses()`, `buildBarn()`, dan `refreshBuildingMeshes()` dengan fallback otomatis ke geometri prosedural.
- [`src/components/train/TrainCanvas.tsx`](file:///C:/Works/github.com/alamaby/asharu-math/src/components/train/TrainCanvas.tsx): penambahan `preloadBuildingModels()` ke `Promise.allSettled`.
- [`tests/buildingModelLoader.test.ts`](file:///C:/Works/github.com/alamaby/asharu-math/tests/buildingModelLoader.test.ts): unit test loader bangunan (path, skala, fallback, instansiasi).
- [`tests/trainSceneGltf.test.ts`](file:///C:/Works/github.com/alamaby/asharu-math/tests/trainSceneGltf.test.ts): pengujian integrasi perenderan GLTF rumah dan lumbung di scene kereta.
- [`package.json`](file:///C:/Works/github.com/alamaby/asharu-math/package.json): bump versi minor ke `1.18.0`.

---

## 3. Keputusan Teknis & Bisnis
1. **Model CC0 Quaternius:**
   Menggunakan model dari Quaternius "Farm Buildings Bundle" dan "Low Poly Buildings" berlisensi CC0 Public Domain, total ukuran kedua model hanya ~146 KB.
2. **Penyelarasan Pivot & Titik Dasar:**
   Model rumah diberi centering offset `(-0.309, 0, 0.456)` di dalam sub-group loader agar titik pivot `(0, 0, 0)` tepat berada di tengah bawah dasar pondasi rumah, menjamin rumah berdiri tepat di permukaan tanah tanpa melayang atau tenggelam.
3. **Orientasi Visual Menghadap Rel:**
   Rumah warga sisi kiri (`[-11, -2]`) diputar sebesar `Math.PI / 4`, sisi kanan (`[11, -3]`) diputar `-Math.PI / 4`, dan lumbung pertanian (`[-12, -16]`) diputar `Math.PI / 4` sehingga pintu dan detail fasad menghadap ke arah pandang kamera dan rel kereta secara estetis.
4. **Graceful Fallback:**
   Jika model belum siap di-cache atau gagal diunduh, `proceduralHouseGroup` dan `proceduralBarnGroup` tetap tampil secara otomatis.

---

## 4. Asumsi & Risiko
- *Risiko:* Lonjakan draw call jika bangunan memiliki banyak material terpisah.
- *Mitigasi:* Model low-poly Quaternius hanya memiliki beberapa material sederhana tanpa tekstur berat, rendering tetap lancar di 60 FPS pada mobile.

---

## 5. Blocker & Open Items
- Tidak ada blocker. Seluruh verifikasi 100% sukses.

---

## 6. Verifikasi yang Dilakukan
- `npm run typecheck`: lolos tanpa error.
- `npm run lint`: lolos tanpa error/warning.
- `npm run format:check`: lolos 100% Prettier.
- `npm run test`: 74 test files (502 tests) lulus 100%.
- `npm run build`: vite build sukses (11.11s), PWA service worker precache 51 entri.

---

## 7. Proposed Conventional Commit (1 baris)
```
feat(train): integrasikan model gltf rumah dan lumbung cc0 ke trainscene
```
