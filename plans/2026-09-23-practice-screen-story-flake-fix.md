# Perbaikan Flake PracticeScreenStory (getByText /punya/ ganda)

Created: 2026-09-23 13:15:00

## Objective

Membuat `tests/screens/PracticeScreenStory.test.tsx` deterministik sehingga CI hijau stabil:
test "round-trip presentation story langsung ke fase solving-story" tidak lagi gagal acak dengan
`TestingLibraryElementError: Found multiple elements with the text: /punya/`.

## Scope

- Termasuk: `tests/screens/PracticeScreenStory.test.tsx` SAJA (1 file), verifikasi via
  `vitest run` file tersebut + full suite + `typecheck`/`lint`/`format:check`.
- Tidak termasuk: perubahan produksi (`PracticeScreen`, `StoryCard`, `storyGenerator`),
  test lain, bump versi, perubahan workflow CI.

## Milestones

1. Reproduksi & konfirmasi akar masalah (seed acak generator cerita).
2. Perbaiki asersi ambigu menjadi deterministik untuk semua seed.
3. Verifikasi stabilitas + tidak ada regresi.

## Tasks

- [ ] Langkah 1 — Reproduksi flake secara lokal (cek seed-dependence)
- [ ] Langkah 2 — Ganti `getByText(/punya/)` dengan asersi deterministik
- [ ] Langkah 3 — Verifikasi (file test + full suite + typecheck/lint/format)

---

### Langkah 1 — Reproduksi flake secara lokal

- Tujuan langkah: membuktikan kegagalan bergantung pada seed acak, bukan pada perubahan
  kode level-bintang (agar fix menyasar akar yang benar).
- Finding yang diselesaikan: CI Node 22 gagal di test ini sementara job Node 20 pada run
  yang SAMA lolos, dan file ini lolos bila dijalankan terisolasi — ciri khas flake seed.
- File yang harus dibaca: `tests/screens/PracticeScreenStory.test.tsx` (33 baris),
  `src/components/story/StoryCard.tsx` (baris 16–20),
  `src/lib/storyGenerator.ts` (baris 37–51: `Math.random` tanpa seed).
- Mekanisme flake (sudah dikonfirmasi dari log CI):
  1. `PracticeScreen` dengan `presentation: 'story'` membangkitkan soal via `storyGenerator`
     yang memakai `Math.random()` tanpa seed (family, nama, angka acak tiap run).
  2. `StoryCard` me-render DUA `<p>`: stem (`text-sm`) dan prompt (`text-base`).
     Untuk sebagian seed (cerita 1-part), prompt mengulang teks stem sehingga KEDUA `<p>`
     cocok dengan regex `/punya/`; untuk seed lain hanya satu yang cocok.
  3. Test memakai `screen.getByText(/punya/)` yang throw bila cocok > 1 → gagal acak.
  4. Bukti log CI: dua `<p>` berisi teks identik
     "Siti punya 15 bola. Dibagikan sebanyak 11 bola. Berapa bola Siti sekarang?".
- Perintah reproduksi (dari root repo, ulangi sampai gagal, mis. 5–10x):
  `npx vitest run tests/screens/PracticeScreenStory.test.tsx`
  Jika tidak kunjung gagal (peluang seed), variasikan dengan
  `npx vitest run tests/screens/PracticeScreenStory.test.tsx --sequence.seed=<angka>`
  beberapa seed berbeda untuk menunjukkan lolos/gagal bergantian.
- Completion criteria: tercatat minimal 1 run gagal lokal dengan error "multiple elements"
  yang SAMA dengan CI, ATAU penjelasan tertulis bila peluang seed kecil (lalu lanjut
  Langkah 2 dengan keyakinan dari bukti log CI).
- File yang tidak boleh diubah di langkah ini: apapun (murni observasi).

### Langkah 2 — Ganti `getByText(/punya/)` dengan asersi deterministik

- Tujuan langkah: asersi lolos untuk SEMUA seed tanpa menyentuh kode produksi.
- Dependency: Langkah 1 selesai (akar dipahami).
- File yang harus diubah: `tests/screens/PracticeScreenStory.test.tsx` SAJA (baris 30).
- Perubahan konkret — ganti baris 30:
  ```tsx
  expect(screen.getByText(/punya/)).not.toBeNull()
  ```
  menjadi:
  ```tsx
  // Teks soal acak per seed; stem dan prompt bisa sama-sama mengandung kata yang sama,
  // jadi cocokkan jamak (deterministik untuk semua seed).
  expect(screen.getAllByText(/punya/).length).toBeGreaterThanOrEqual(1)
  ```
  Baris 31 (`Keyboard angka`) dan baris 28 (`Mulai Latihan` null) PERTAHANKAN apa adanya —
  keduanya sudah deterministik dan mengunci maksud test (fase solving-story, bukan setup).
- Behavior yang harus dipertahankan: maksud test tetap "sudah di story solving:
  menampilkan soal cerita + keypad angka". `getAllByText` + `>= 1` tetap membuktikan ada
  teks soal ter-render, tanpa asumsi jumlah kemunculan yang bergantung seed.
- Alternatif yang DITOLAK (cantumkan alasan di Progress Log bila ditanya):
  - Mock `Math.random` via `vi.spyOn` — mengikat test ke detail internal generator,
    rapuh terhadap perubahan family/pool nama; overkill untuk asersi teks.
  - Tambah `aria-label`/role di `StoryCard` (produksi) — manfaat a11y nyata tapi blast
    radius lebih besar (snapshot/teks lain) untuk masalah yang murni milik test;
    dipindah ke milestone terpisah bila diinginkan (lihat Notes).
- Error handling / edge case: tidak ada I/O; bila generator di masa depan tidak lagi
  memakai kata "punya" di family manapun, test ini akan gagal eksplisit (`length 0`) —
  itu sinyal yang benar (test perlu diperbarui), bukan flake.
- Completion criteria: diff tepat 3–4 baris (komentar + 1 asersi) di 1 file test.
- File yang tidak boleh diubah: `src/**`, workflow CI, test lain, `package.json`.

### Langkah 3 — Verifikasi

- Tujuan langkah: pastikan fix stabil dan tidak ada regresi.
- Dependency: Langkah 2 selesai.
- Command (berurutan, dari root repo):
  1. `npx vitest run tests/screens/PracticeScreenStory.test.tsx` → expected: 2/2 passed.
  2. Ulangi command 1 sebanyak 5x (atau dengan 3 `--sequence.seed` berbeda) → expected:
     selalu 2/2 passed (bukti deterministik; catat seed di Progress Log).
  3. `npm run typecheck` → exit 0.
  4. `npm run lint` → exit 0.
  5. `npm run format:check` → exit 0 (file test satu ini harus lolos Prettier;
     bila gagal, `npx prettier --write tests/screens/PracticeScreenStory.test.tsx` lalu ulangi).
  6. `npm run test` (full suite) → expected: 334/334 passed, 0 failed —
     untuk pertama kalinya tanpa pengecualian flake.
- Completion criteria: 6 command hijau; full suite 100% (menutup status "1 pre-existing
  gagal" di memori menjadi 0).
- File yang tidak boleh diubah: apapun di luar Langkah 2.

## Risks

- Peluang seed gagal kecil sehingga Langkah 1 sulit reproduksi lokal → mitigasi: bukti log
  CI sudah konklusif (dua `<p>` identik); reproduksi bersifat konfirmasi, bukan gate.
- `getAllByText` + `>= 1` sedikit melemahkan ketajaman asersi (tidak lagi memastikan TEPAT
  satu) → diterima: ketajaman lama adalah sumber flake; maksud test (soal ter-render)
  tetap terkunci. Counter-argument: bila ingin ketajaman + determinisme, opsinya adalah
  mock seed generator — ditolak karena kerapuhan (lihat Langkah 2).
- Full suite tetap bisa merah karena flake LAIN yang belum terlihat → mitigasi: catat di
  Progress Log, jangan lebarkan scope plan ini.

## Progress Log

- 2026-09-23 13:15:00 — Plan dibuat (belum ada implementasi). Menunggu eksekusi Langkah 1–3.
- 2026-09-23 13:44:00 — Semua 3 langkah selesai.
  - Langkah 1: Reproduksi lokal berhasil. Seed `--sequence.seed=12345` dan `11111` gagal dengan error "Found multiple elements with the text: /punya/" yang sama dengan CI; seed `67890` dan `99999` lolos. Akar masalah dikonfirmasi: `StoryCard` me-render DUA `<p>` identik (stem + prompt) untuk beberapa family cerita 1-part; `getByText` undefined count throw.
  - Langkah 2: Edit `tests/screens/PracticeScreenStory.test.tsx:30` — ganti `expect(screen.getByText(/punya/)).not.toBeNull()` dengan `expect(screen.getAllByText(/punya/).length).toBeGreaterThanOrEqual(1)` + komentar seed. Diff ±3 baris, 1 file.
  - Langkah 3: Re-run seed-fail (`12345`, `11111`) & default: 2/2 passed semua. `typecheck` exit 0 ✅, `lint` exit 0 ✅, `format:check` exit 0 ✅. Full suite: 334/334 passed (39 test files), untuk pertama kalinya tanpa pengecualian flake pre-existing.

## Notes

- Standar arsitektur: tidak ada perubahan skema/database; TOGAF/ODA tidak relevan
  (aplikasi client-side localStorage). Tidak ada deviasi standar domain.
- Aturan memori yang dipakai: Prettier (no semi, single quote, printWidth 100); test wajib
  via `tests/setup.ts` + cleanup RTL eksplisit; JANGAN bump versi untuk fix test-only
  (bukan perubahan user-facing).
- Tindak lanjut opsional (di luar plan ini): tambah label aksesibel pembeda stem vs prompt
  di `StoryCard` (mis. `aria-label` "Soal cerita" / "Pertanyaan") + asersi berbasis role —
  lebih tajam dan ramah screen-reader; butuh cek snapshot/teks dan sinkron i18n bila
  menambah key dict.
- Setelah plan ini hijau, perbarui `.memory/README.md`: ubah status kualitas menjadi
  "334 test / 39 file (334 lulus)" dan hapus butir "Pre-existing flake PracticeScreenStory".

## Handoff Checklist (untuk model eksekutor)

- [ ] Baca sebelum mulai: `tests/screens/PracticeScreenStory.test.tsx` (penuh, 33 baris),
  `src/components/story/StoryCard.tsx` (baris 15–25), `src/lib/storyGenerator.ts` (baris 37–51).
- [ ] Kerjakan berurutan Langkah 1 → 3; edit HANYA 1 file test di Langkah 2.
- [ ] Jangan menyentuh: `src/**`, `.github/workflows/**`, test lain, `package.json`,
  `package-lock.json`.
- [ ] Kriteria selesai: file test 2/2 passed di ≥5 run/seed berbeda; `typecheck` + `lint` +
  `format:check` hijau; full suite 334/334.
- [ ] Jangan staging/commit apapun; perubahan dilakukan eksekutor dalam kerjaannya sendiri.
- [ ] Open questions: tidak ada yang memblokir (opsi mock-seed dan opsi produksi sudah
  diputuskan: DITOLAK untuk plan ini, lihat Langkah 2).
