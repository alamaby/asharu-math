# Model GLTF Orang (Masinis & Penumpang) dan Rel Kereta Bebas Atribusi (CC0)

Timestamp: 2026-11-18 17:30:00
Plan: [plans/2026-11-18-modernisasi-model-orang-dan-rel-kereta.md](file:///C:/Works/github.com/alamaby/asharu-math/plans/2026-11-18-modernisasi-model-orang-dan-rel-kereta.md)

## Task / Masalah
Mengganti karakter orang prosedural (balok tubuh & kepala masinis di kabin lokomotif serta kapsul penumpang stasiun) dan rel tunggal prosedural di modul *Petualangan Kereta Angka* (`TrainScene.ts`) dengan aset 3D GLTF berkualitas tinggi berlisensi Public Domain / CC0 tanpa atribusi wajib:
1. **Masinis Asya (`driver.glb`, 749 KB, Quaternius Ultimate Modular Characters CC0)**: Karakter perempuan berseragam kerja masinis di kabin lokomotif lengkap dengan rigged armature dan klip animasi (`Idle`, `Victory`, `Jump`).
2. **Penumpang Stasiun (`passenger.glb`, 776 KB, Quaternius Ultimate Modular Characters CC0)**: Dua karakter warga di peron stasiun yang menyambut kedatangan kereta dengan animasi selebrasi `'Victory'` saat kereta tiba di stasiun.
3. **Bantalan Rel Presisi (`sleeper.glb`, 4.8 KB, Kenney Train Kit CC0)**: Bantalan rel berpelat baja (*tie plates*) presisi yang dipasang mengikuti tangen kurva CatmullRom.
4. **Rel Baja Ganda Paralel (Dual Parallel Rails)**: Dua batang rel baja melengkung paralel sejajar (offset lateral normal transversal $\pm 0.36$) tepat di bawah roda kiri dan kanan lokomotif serta gerbong untuk kurva utama dan cabang.

## Berkas Penting yang Diubah / Dibuat
- `public/models/train/driver.glb`: Model karakter masinis perempuan Quaternius CC0 dengan animasi (749 KB).
- `public/models/train/passenger.glb`: Model karakter penumpang Quaternius CC0 dengan animasi (776 KB).
- `public/models/train/sleeper.glb`: Model bantalan rel presisi berpelat baja Kenney CC0 (4.8 KB).
- `src/lib/characterModelLoader.ts`: Modul loader in-memory untuk karakter masinis dan penumpang dengan clone SkeletonUtils, ekstraksi animasi, auto-play `Idle`, dan helper selebrasi stasiun `triggerStationCelebration()`.
- `src/lib/trackModelLoader.ts`: Modul loader in-memory untuk bantalan rel `sleeper.glb`.
- `tests/characterModelLoader.test.ts`: Unit test loader karakter memverifikasi path `/models/train/`, scaling, in-memory caching, dan clone SkeletonUtils (3 test).
- `tests/trackModelLoader.test.ts`: Unit test loader rel memverifikasi path, in-memory caching, dan clone mesh (3 test).
- `src/components/train/TrainScene.ts`:
  - `createParallelCurves`: Helper kalkulasi normal transversal horizontal kurva 3D untuk membentuk dua rel paralel berjarak $\pm 0.36$.
  - `buildTracks`: Menghasilkan 8 dual rails paralel untuk kurva utama dan cabang serta bantalan rel GLTF `sleeperAt`.
  - `buildDriver`: Integrasi masinis Asya GLTF di kabin lokomotif dengan fallback `proceduralDriverGroup`.
  - `buildPassengers`: Integrasi 2 penumpang GLTF di stasiun dengan fallback `proceduralPassengerGroup`.
  - `update(dt)`: Update delta waktu `AnimationMixer` karakter dan trigger selebrasi `'Victory'` saat tiba di stasiun.
- `src/components/train/TrainCanvas.tsx`: Menambahkan `preloadCharacterModels()` dan `preloadTrackModels()` ke `Promise.allSettled`.
- `tests/trainSceneGltf.test.ts`: Menambahkan unit test scene rel dan karakter (verifikasi `gltf-driver`, `gltf-passenger`, `gltf-sleeper`, dan `dual-rail`).
- `package.json`: Bump versi ke `1.21.0`.

## Keputusan Teknis & Bisnis
- **Lisensi 100% CC0 / Bebas Atribusi**: Menggunakan aset Quaternius (Ultimate Modular Characters) dan Kenney (Train Kit) berlisensi CC0 1.0 Universal / Public Domain.
- **Geometri Rel Ganda Akurat (Dual Rails)**: Lebar sepur (*track gauge*) lokomotif dan gerbong adalah $0.72$ unit. Offset kurva $\pm 0.36$ menempatkan rel baja tepat di tengah ketebalan tapak roda baja lokomotif dan gerbong.
- **Animasi SkinnedMesh & SkeletonUtils**: Model karakter memiliki armature beranimasi. Loader mengklon model menggunakan `SkeletonUtils.clone` agar masing-masing penumpang dan masinis memiliki instance `AnimationMixer` independen.
- **Fallback Prosedural Lengkap & Invarian Test**: Elemen tubuh prosedural (`driver-torso`, `driver-brim`, `driver-eye`, `driver-arm`, dsb.) tetap dibuat di dalam container group dan hanya disembunyikan jika GLTF aktif, menjamin 100% backward compatibility dan stabilitas test di lingkungan non-WebGL.
- **PWA Offline Precache**: Model otomatis tercakup dalam precache PWA Workbox (69 entri, 5.43 MB total).

## Asumsi & Risiko
- Ukuran total ketiga aset karakter dan rel sekitar 1.5 MB, sangat efisien berkat pembersihan animasi yang tidak dipakai.
- Penggunaan Three.js `AnimationMixer` ringan (~1-2 mixer aktif per frame) tidak membebani frame rate mobile.

## Verifikasi yang Dilakukan
- `npm run format:check`: 100% lolos Prettier code style.
- `npm run typecheck`: 0 error TypeScript strict.
- `npm run lint`: 0 error dan 0 warning ESLint.
- `npm run test`: 78 test files passed (517 tests) lulus 100%.
- `npm run build`: Build produksi Vite sukses, PWA precache 69 entries.

## Proposed Conventional Commit
`feat(train): integrasikan model gltf masinis, penumpang, dan rel ganda cc0`
