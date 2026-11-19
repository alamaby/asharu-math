# Perbaikan Animasi Roda Kereta Api & Siklus Selebrasi Karakter Petualangan Kereta

Task/Masalah:
Menyelesaikan dua masalah animasi di Petualangan Kereta Api (`TrainScene.ts`):
1. **Gerakan Roda Kurang Natural & Terus Berputar Saat Diam**:
   - Roda lokomotif dan gerbong sebelumnya dihitung menggunakan akumulasi kecepatan konstan setiap frame tanpa mempertimbangkan apakah kereta sedang melaju atau berhenti.
   - Akibatnya, roda terus berputar kencang bahkan saat kereta berhenti di persimpangan rel menunggu jawaban anak (`WAITING_FOR_ANSWER`) maupun saat berhenti di stasiun akhir peron.
   - Batang piston lokomotif uap terus berayun tanpa henti secara mekanis tidak realistis.
2. **Animasi Selebrasi Karakter Terus Berlanjut ke Soal Berikutnya**:
   - Saat kereta tiba di stasiun akhir peron, animasi `'Victory'` dipicu pada masinis Asya (`gltfDriver`) dan seluruh penumpang (`gltfPassengers`).
   - Namun method `reset()` di `TrainScene.ts` tidak pernah mem-fade out aksi `'Victory'` dan tidak mengembalikan aksi ke `'Idle'`, sehingga masinis dan penumpang terus melompat/selebrasi tanpa henti di ronde-ronde soal berikutnya.

Berkas Penting yang Diubah / Dibuat:
- `src/components/train/TrainScene.ts`:
  - Menghitung jarak tempuh aktual kereta `currentDist` di jalur utama, manuver, dan percabangan rel.
  - Menghitung delta perpindahan linier nyata $\Delta s$ per frame (`deltaDist = currentDist - prevJourneyDist`).
  - Menerapkan kinematika roda berputar murni (*pure rolling physics*): $\Delta \theta = \Delta s / r_{\text{wheel}}$ dengan radius roda $r = 0.28$.
  - Menghentikan rotasi roda dan ayunan batang piston lokomotif seketika saat kereta diam (`isMoving = false`).
  - Mendukung putaran roda mundur saat fase manuver belok ancang-ancang mundur di persimpangan rel.
  - Memperbarui `reset()` untuk mengembalikan masinis Asya dan seluruh penumpang ke `'Idle'` via `fadeOut(0.25)` pada `'Victory'` dan `reset().fadeIn(0.25).play()` pada `'Idle'`.
  - Mengoptimalkan kepulan asap cerobong uap (`updateSmoke`): mengepul lembut (*idle waft*) saat lokomotif diam di peron/junction dan menyembur aktif (*chuff*) tersinkron roda saat melaju.
  - Menyesuaikan getaran bodi lokomotif (*bobbing*) dan ayunan gerbong (*sway*): berubah menjadi getaran mesin idle halus saat berhenti.
- `tests/trainSceneGltf.test.ts`:
  - Menambahkan test case pengujian kinematika roda (roda berputar saat melaju, berhenti di junction, mundur saat maneuver, berhenti di stasiun).
  - Menambahkan test case pengujian siklus hidup animasi karakter (selebrasi di stasiun dan kembali ke 'Idle' saat `reset()`).
- `package.json`: Bump versi patch ke `1.24.1`.
- `plans/2026-11-19-perbaikan-animasi-roda-dan-selebrasi-karakter.md`: Plan dan progress log diperbarui.

Keputusan Teknis/Bisnis:
1. **Kinematika Pure Rolling vs Delta Jarak Rel**:
   - Rotasi roda tidak lagi memakai waktu sembarang `dt * rate`, melainkan turunan langsung dari geometri kurva lintasan kereta Three.js CatmullRomCurve3.
   - Dengan formula $\Delta \theta = \Delta s / r$, roda selalu bergulir di atas rel tanpa efek tergelincir (*no wheel slip*) pada kecepatan berapapun, termasuk saat Reduced Motion aktif atau saat manuver ancang-ancang mundur.
2. **Siklus Hidup Aksi Karakter Defensif**:
   - Pengecekan defensif `actions.has('Idle')` dan `actions.has('Victory')` menjamin kompatibilitas baik dengan model karakter beranimasi lengkap maupun lingkungan pengujian dengan mock clips.
   - Transisi crossfade 0.25s memberikan peralihan gestur yang luwes dari kegembiraan selebrasi kemenangan menuju kesiapan tenang (*Idle*) menghadapi tantangan matematika berikutnya.

Verifikasi yang Dilakukan:
- `npm run format:check` (Prettier konsisten 100%)
- `npm run typecheck` (`tsc --noEmit` lulus 0 error)
- `npm run lint` (`eslint .` lulus 0 error/warning)
- `npm run test` (Vitest: 81 test files / 537 tests lulus 100%)
- `npm run build` (Vite production build sukses dalam 10.48s, PWA precache 89 entries)

Proposed Conventional Commit:
`fix(train): perbaiki kinematika rotasi roda alami dan reset selebrasi karakter`
