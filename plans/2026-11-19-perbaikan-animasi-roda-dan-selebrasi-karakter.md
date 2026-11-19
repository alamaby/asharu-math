# Perbaikan Animasi Roda Kereta Api & Siklus Selebrasi Karakter Petualangan Kereta

Created: 2026-11-19 14:35:00

## Objective
Menyempurnakan dan memperbaiki sistem animasi di *Petualangan Kereta Angka* (`TrainScene.ts`):
1. **Kinematika Rotasi Roda Kereta & Gerbong Alami (*Pure Rolling Physics*)**:
   - Menghubungkan rotasi roda lokomotif (GLTF & prosedural) dan roda gerbong langsung ke delta perpindahan jarak nyata di atas rel ($\Delta \theta = \Delta s / r_{\text{wheel}}$).
   - Memastikan roda **benar-benar berhenti berputar** saat kereta berhenti di persimpangan rel menunggu jawaban kuis (`WAITING_FOR_ANSWER`) dan saat kereta berhenti di stasiun akhir peron.
   - Mengakomodasi putaran roda mundur saat fase manuver belok ancang-ancang mundur di junction.
   - Mensinkronkan batang piston penggerak lokomotif (`rods`) dengan sudut putar roda sehingga berhenti saat kereta diam.
2. **Siklus Hidup Animasi Karakter Masinis & Penumpang**:
   - Memperbaiki method `reset()` di `TrainScene.ts` agar menghentikan animasi `'Victory'` dan mengembalikan masinis Asya (`gltfDriver`) serta seluruh penumpang (`gltfPassengers`) ke animasi `'Idle'` secara halus (`fadeOut`/`fadeIn`) saat soal/ronde baru dimulai.
3. **Penyempurnaan Efek Sekunder Kereta Saat Berhenti vs Melaju**:
   - Kepulan asap cerobong lokomotif (`updateSmoke`): Berpindah ke mode kepulan santai (*idle waft*) yang tenang saat kereta berhenti, dan mode semburan uap (*chuff*) saat kereta melaju.
   - Getaran bodi kereta (`trainGroup.position.y`): Beralih ke getaran mesin idle halus saat kereta diam di peron/junction.

## Scope
- Berkas yang dimodifikasi:
  - `src/components/train/TrainScene.ts`: Perhitungan delta jarak linier, akumulasi `wheelAngle`, pembaruan rotasi roda dan batang piston, transisi balik `'Victory'` ke `'Idle'` di `reset()`, dan logika idle asap/bobbing.
  - `tests/trainSceneGltf.test.ts`: Penambahan test case verifikasi roda berhenti saat diam di junction/stasiun dan verifikasi kembalinya animasi masinis/penumpang ke `'Idle'` saat `reset()`.
  - `package.json`: Bump versi patch ke `1.24.1`.
  - `.memory/`: Entri memori proyek bertanggal dan update `.memory/README.md`.

## Milestones
1. Fase 1: Implementasi Kinematika Roda Murni & Sinkronisasi Batang Piston di `TrainScene.ts`
2. Fase 2: Implementasi Reset Animasi Karakter Masinis & Penumpang ke `'Idle'` di `reset()`
3. Fase 3: Penyempurnaan Asap Lokomotif dan Getaran Bodi Kereta Saat Diam
4. Fase 4: Pengujian Komprehensif (Unit Tests, Typecheck, Lint, Test Suite Penuh, Build Produksi) & Dokumentasi

## Tasks
- [x] Implementasikan perhitungan delta jarak tempuh dan sudut rotasi roda kinematik ($\Delta \theta = \Delta s / r$) di `TrainScene.update()`
- [x] Pastikan roda dan batang piston lokomotif berhenti berputar saat `t >= 1` di jalur utama dan cabang
- [x] Implementasikan transisi kembali dari `'Victory'` ke `'Idle'` pada `gltfDriver` dan `gltfPassengers` di `TrainScene.reset()`
- [x] Sesuaikan animasi asap cerobong uap (`updateSmoke`) agar mengepul lembut saat idle
- [x] Buat unit test di `tests/trainSceneGltf.test.ts` untuk memverifikasi roda berhenti saat diam dan aksi karakter kembali ke `'Idle'` saat `reset()`
- [x] Jalankan verifikasi lint, format check, typecheck, dan seluruh vitest suite (81+ test files, 537 tests passed)
- [x] Uji build produksi `npm run build`
- [x] Bump versi ke `1.24.1` di `package.json`
- [x] Catat entri memori proyek di `.memory/` dan update `.memory/README.md`
- [x] Commit 1 baris Conventional Commits tanpa trailer dan push ke `origin/main`

## Risks
- Diskontinuitas Sudut Roda: Jangan me-reset sudut roda `wheelAngle` ke 0 secara tiba-tiba di tengah perjalanan agar tidak terjadi lompatan visual (*visual snap/glitch*). Sudut roda harus berlanjut mulus.
- Animasi Karakter Jika Aksi Tidak Ditemukan: Pastikan pengecekan defensif `actions.has('Idle')` dan `actions.has('Victory')` agar tidak melempar error jika model template pengujian hanya memuat subset animasi.

## Progress Log
- 2026-11-19 14:35:00 — Plan dirumuskan berdasarkan temuan analisis animasi roda dan siklus selebrasi karakter.
- 2026-11-19 14:46:00 — Implementasi kinematika roda murni, reset selebrasi karakter ke Idle, penyempurnaan efek asap dan getaran bodi selesai; unit test lulus; typecheck, lint, full vitest (537 tests), dan build produksi lulus 100%. Versi dibump ke 1.24.1.
