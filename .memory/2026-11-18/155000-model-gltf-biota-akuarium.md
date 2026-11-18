# Integrasi Model 3D GLTF Biota Akuarium (Clownfish & Blue Fish) Bebas Atribusi (CC0)

- **Tanggal & Waktu:** 2026-11-18 15:50:00 WIB
- **Topik:** Integrasi Model 3D GLTF Biota Akuarium Bebas Atribusi (CC0)
- **Terkait:** [`plans/2026-11-18-integrasi-model-gltf-biota-akuarium.md`](file:///C:/Works/github.com/alamaby/asharu-math/plans/2026-11-18-integrasi-model-gltf-biota-akuarium.md)

---

## 1. Task & Masalah
Mengganti representasi visual biota akuarium di modul *Cheerful Aquarium* (`Fish3D.tsx` dan `TensFishGroup3D.tsx`) dari bentuk balok primitif (`BoxGeometry` + `ConeGeometry`) menjadi model 3D GLTF kartun/low-poly berlisensi Public Domain / CC0 tanpa atribusi wajib:
- Ikan satuan (`ones`): Clownfish oranye bergaris putih.
- Ikan puluhan (`tens`): Blue Fish / Blue Tang berwarna biru dengan sirip kuning.
Mempertahankan seluruh interaksi anak (fleeing saat diklik, renang mengapung / wander, prefers-reduced-motion, dan auto-fallback prosedural).

---

## 2. Berkas Penting yang Diubah / Dibuat
- [`public/models/aquarium/clownfish.glb`](file:///C:/Works/github.com/alamaby/asharu-math/public/models/aquarium/clownfish.glb) (81.5 KB, Quaternius CC0).
- [`public/models/aquarium/bluefish.glb`](file:///C:/Works/github.com/alamaby/asharu-math/public/models/aquarium/bluefish.glb) (63.6 KB, Quaternius CC0).
- [`src/lib/fishModelLoader.ts`](file:///C:/Works/github.com/alamaby/asharu-math/src/lib/fishModelLoader.ts): loader model GLTF ikan dengan in-memory cache, instansiasi SkinnedMesh via `SkeletonUtils.clone`, penyesuaian rotasi Y (`Math.PI / 2`) agar kepala menghadap sumbu renang +X, dan inisialisasi `AnimationMixer`.
- [`src/components/aquarium/Fish3D.tsx`](file:///C:/Works/github.com/alamaby/asharu-math/src/components/aquarium/Fish3D.tsx): rendering GLTF entity via `<primitive object={gltfEntity.root} />`, kibasan ekor alami via `mixer.update(delta)` dengan time offset unik per ikan, hit-area klik tak terlihat, dan fallback mulus ke geometri balok.
- [`src/components/aquarium/AquariumCanvas.tsx`](file:///C:/Works/github.com/alamaby/asharu-math/src/components/aquarium/AquariumCanvas.tsx): pemanggilan `preloadFishModels()` saat mount.
- [`tests/fishModelLoader.test.ts`](file:///C:/Works/github.com/alamaby/asharu-math/tests/fishModelLoader.test.ts): unit test loader model ikan (path, scale, fallback saat un-cached, clip selection, dan cloning).
- [`tests/fish3DIntegration.test.tsx`](file:///C:/Works/github.com/alamaby/asharu-math/tests/fish3DIntegration.test.tsx): integration test rendering Fish3D dengan fallback maupun model GLTF.
- [`package.json`](file:///C:/Works/github.com/alamaby/asharu-math/package.json): bump versi minor ke `1.17.0`.

---

## 3. Keputusan Teknis & Bisnis
1. **Model CC0 Quaternius "Animated Fish Bundle":**
   Menggunakan model GLTF resmi CC0 dari Quaternius tanpa royalti atau keharusan atribusi, ukuran total kedua model hanya ~144 KB sehingga sangat ramah PWA web mobile.
2. **Kesesuaian Nilai Tempat Satuan & Puluhan:**
   - Ikan satuan (`ones`): Clownfish bernuansa oranye cerah sesuai palet angka satuan.
   - Ikan puluhan (`tens`): Blue Fish / Blue Tang bernuansa biru pekat dengan sirip kuning sesuai palet puluhan.
3. **Penyelarasan Orientasi Renang:**
   Model GLTF secara default menghadap ke arah +Z pada rest pose Blender. Di `fishModelLoader.ts`, rotasi awal Y diatur sebesar `+Math.PI / 2` (90 derajat) sehingga moncong/kepala ikan menghadap ke +X, selaras dengan arah renang default di `Fish3D.tsx`.
4. **Desinkronisasi Gerak Ekor (Natural Jitter):**
   `action.time` diberi offset berdasarkan `wiggleOffset` sehingga ikan-ikan pada kelompok puluhan tidak mengibaskan ekornya secara seragam kaku.
5. **Aksesibilitas & Reduced Motion:**
   Jika pengguna mengaktifkan `prefers-reduced-motion` atau mematikan animasi di pengaturan, `mixer.update` dilewati untuk menjaga kenyamanan visual anak.
6. **Graceful Fallback:**
   Jika model belum terunduh atau terjadi kendala jaringan offline, komponen merender geometri balok prosedural bawaan tanpa error.

---

## 4. Asumsi & Risiko
- *Risiko:* Performa rendering pada perangkat mobile low-end ketika merender 10+ ikan GLTF.
- *Mitigasi:* Model sangat low-poly (<500 poligon), draw call diminimalkan, dan rendering WebGL dikonfigurasi `powerPreference: 'low-power'`. PWA precaching memastikan model dimuat dari cache lokal tanpa beban jaringan berulang.

---

## 5. Blocker & Open Items
- Tidak ada blocker. Seluruh tes dan build lulus 100%.

---

## 6. Verifikasi yang Dilakukan
- `npm run typecheck`: lolos tanpa error.
- `npm run lint`: lolos tanpa peringatan/error.
- `npm run format:check`: lolos 100% Prettier.
- `npm run test`: 73 test files (498 tests) lulus 100%.
- `npm run build`: vite build berhasil (10.64s), PWA manifest dan service worker precache (47 entries) terbangun sempurna.

---

## 7. Proposed Conventional Commit (1 baris)
```
feat(aquarium): integrasikan model gltf clownfish dan bluefish cc0 dengan animasi renang
```
