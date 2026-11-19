# Modernisasi Model 3D GLTF Rambu Sinyal Junction & Papan Rambu Jawaban Cabang (CC0)

Task/Masalah:
Memodernisasi sistem visual tiang sinyal persimpangan rel (`signal_post.glb`) dan 3 papan penanda jawaban cabang (`branch_sign.glb`) di Petualangan Kereta Angka (`TrainScene.ts`) dari silinder tunggal dan balok kotak melayang prosedural menjadi model 3D GLTF berkualitas tinggi berlisensi Public Domain / CC0 tanpa atribusi wajib, dengan interaktivitas lampu emissive dinamis dan perenderan teks canvas 2D yang tajam.

Berkas Penting yang Diubah / Dibuat:
- `public/models/train/signal_post.glb`: Model 3D tiang sinyal rel 3 lampu dengan pedestal beton, tangga maintenance, visor lampu pelindung matahari, dan 3 lensa lampu aktif (`signal_lamp_0`, `signal_lamp_1`, `signal_lamp_2`).
- `public/models/train/branch_sign.glb`: Model 3D plang rambu stasiun/rel dengan 2 tiang kayu menancap ke tanah, bingkai kayu amber dengan baut, dan sub-mesh display `sign_display` datar menghadap kereta.
- `src/lib/signalModelLoader.ts`: Loader in-memory singleton untuk model sinyal dan papan jawaban dengan kloning material mandiri dan preload helper.
- `tests/signalModelLoader.test.ts`: Unit test loader validasi in-memory caching, sub-mesh display, dan 3 lampu lensa.
- `src/components/train/TrainScene.ts`: Integrasi tiang sinyal ke `signalGroup`, pembaruan `setSignal(branchIndex, ok)` dengan penyesuaian emissive warna hijau/kuning lampu GLTF, integrasi `branch_sign` di `refreshTrackMeshes()`, dan penempelan `boardTextures` ke `sign.displayMesh.material`.
- `src/components/train/TrainCanvas.tsx`: Menambahkan `preloadSignalModels()` pada `Promise.allSettled`.
- `tests/trainSceneGltf.test.ts`: Pengetesan integrasi GLTF sinyal tiang dan 3 plang rambu jawaban beserta responsivitas emissive.
- `package.json`: Bump versi ke `1.23.0`.
- `plans/2026-11-19-modernisasi-rambu-sinyal-dan-papan-jawaban.md`: Plan dan progress log diselesaikan.

Keputusan Teknis/Bisnis:
1. **Binding Material Emissive Lampu Sinyal**: Model `signal_post.glb` memiliki 3 lensa lampu bernama `signal_lamp_0..2`. Pada instansiasi, material lensa lampu di-clone secara mandiri (`material.clone()`) agar perubahan `emissive` di satu scene tidak mencemari scene lain. Method `setSignal(branchIndex, ok)` menyalakan lampu cabang aktif dengan warna hijau `#22c55e` (benar) atau kuning `#facc15` (salah) dengan `emissiveIntensity = 1.2`, serta mematikan lampu lainnya menjadi hitam `#000000`.
2. **Pemetaan CanvasTexture ke Sub-Mesh Plang Jawaban**: Display bidang jawaban pada `branch_sign.glb` menggunakan UV standar dengan orientasi menghadap arah datangnya kereta (+Z). Material display langsung di-assign `new THREE.MeshLambertMaterial({ map: this.boardTextures[i] })` sehingga update teks angka dinamis di `setAnswers` langsung tersinkronisasi tanpa memerlukan render buffer terpisah.
3. **Posisian di Tanah**: Plang rambu GLTF memiliki dua tiang penyangga yang menancap ke tanah ($y = 0$). Oleh karena itu, posisi root ditempatkan di `[p.x, 0, p.z]` di mana papan berada di ketinggian mata masinis ($y = 1.6$), berbeda dari kotak lama yang melayang bebas di udara.

Asumsi & Risiko:
- Kinerja Mobile & Perangkat Low-End: Dua model baru berukuran sangat ringan (40 KB dan 22 KB) dengan budget vertex dan draw calls minimal, menghasilkan total precache PWA sebesar 5.6 MB yang tetap sangat cepat diunduh secara offline.
- Graceful Degradation: Jika aset GLTF gagal dimuat atau pengujian berjalan di JSDOM tanpa WebGL, auto-fallback ke tiang dan kotak prosedural langsung aktif tanpa melempar runtime exception.

Verifikasi yang Dilakukan:
- `npm run format:check` & `npm run format` (Prettier)
- `npm run typecheck` (tsc --noEmit)
- `npm run lint` (ESLint 9)
- `npm run test` (Vitest: 80 test files / 528 tests passed 100%)
- `npm run build` (Vite production build sukses, PWA precache 83 entries)

Proposed Conventional Commit:
`feat(train): integrasikan model gltf rambu sinyal dan papan jawaban cc0`
