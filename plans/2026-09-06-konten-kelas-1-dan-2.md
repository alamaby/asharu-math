# Konten Pembelajaran Kelas 1 dan 2 SD

Created: 2026-09-06 07:00:00

## Objective
Menambah jalur Kelas 1 (fondasi: membilang, banding bilangan, nilai tempat, tambah/kurang 1-digit, jembatan 2-digit tanpa simpan/pinjam) di depan konten Kelas 2 yang sudah ada, dengan label kelas di UI. Keputusan pengguna: materi konseptual cukup 3 topik (A), level baru di depan, nomor level per-grade + label kelas (B).

## Scope
- In:
  - Field `grade: 1 | 2` di `LevelDefinition`; level lama = Kelas 2 (ID stabil `level-1..11`, `tantangan`).
  - Level baru Kelas 1 ber-ID `k1-*` di depan: tambah 1-digit, kurang 1-digit, campuran 1-digit (kolom), jembatan 2-digit tanpa simpan/pinjam, plus 3 topik konsep (membilang, banding bilangan, nilai tempat).
  - `DigitCount` 1|2|3|4 + opsi `1 digit` di Practice.
  - Unlock eksplisit per-level + migrasi agar pengguna lama tidak terkunci.
  - Label/grup Kelas 1 vs Kelas 2 di LevelSelect; nomor level per-grade.
  - Achievement Kelas 1 baru; i18n ID+EN untuk semua teks baru.
- Out:
  - Mengganti ID level lama; mengubah syarat achievement/bintang lama.
  - Aset audio/gambar baru; topik konsep di luar 3 yang disepakati.

## Milestones
1. M1 — Fondasi kolom 1-digit + label kelas + unlock aman (risiko kecil, bisa rilis duluan).
2. M2 — Jalur konsep Kelas 1: tipe, generator, layar, langkah, i18n (risiko besar, terpisah dari M1).
3. M3 — Polish: achievement, Home/Result per-grade, QA + test penuh.

## Tasks
- [x] Tipe: `DigitCount` tambah `1`; `LevelDefinition` tambah `grade: 1 | 2` dan `requires: string | null`
- [x] Generator 1-digit: `lo/hi` generik + guard `effectiveCarryMode`/`fallbackNoBorrow` untuk 1-digit; test 1-digit (`tests/problemGenerator.test.ts` loop `1|2|3|4` + `none/any`)
- [x] Level `k1-*` kolom (ID+EN): 3 konsep (`k1-membilang`/`k1-banding`/`k1-nilai-tempat` via `conceptGenerator`) + tambah 1-digit, kurang 1-digit, campuran 1-digit, jembatan 2-digit; levelKind `column|concept` & `ConceptSettings`; opsi `1 digit` di `PracticeScreen.tsx`
- [x] Unlock eksplisit + migrasi veteran: level sudah selesai selalu unlock; veteran (legacy `level-1..tantangan`) bypass `K1_IDS` (kini 7: 3 konsep+4 kolom) sehingga rantai baru tidak mengunci progres lama; `getNextLevelId` linear terdokumentasi; test `tests/levels.test.ts` diperbarui
- [x] `LevelSelectScreen` grup per kelas + `LevelCard` label kelas + routing `concept-learn` vs `learn`; nomor per-grade; dict `id.ts`+`en.ts` berpasangan (parity `core.ts`) termasuk `concept.*`
- [x] M2 konsep: tipe `ConceptProblem`/`ConceptQuestion` (`counting|compare|place-value`), `conceptGenerator.ts`, `ConceptQuestionView` + `ConceptLearnScreen` (state terpisah, bukan `learnReducer`), `i18n/concept.ts` render-time, `recordConceptAnswer` di `ProgressContext`, navigasi `concept-learn` di `App.tsx`/`NavigationContext.tsx`
- [x] Achievement `bintang-kelas-1` diperluas ke 7 level — test di `tests/achievements.test.ts`
- [x] Verifikasi M1+M2: `npm test`, `typecheck`, `lint`, `format:check`, `build` + QA manual unlock/progres lama (veteran bypass)

## Risks
- Regresi unlock pengguna lama (mitigasi: test migrasi + QA dengan seed progres lama berisi `level-1..4` selesai).
- Key EN/ID tidak sinkron → typecheck gagal (mitigasi: tambah key berpasangan di kedua dict).
- Scope creep jalur konsep (mitigasi: M1 rilis dulu; M2 dibatasi 3 topik × 5 soal).
- Hasil tambah 1-digit bisa 2-digit (mis. 9+8=17, width 2) — diterima sebagai jembatan, pastikan UI/label nilai tempat tetap benar.

## Progress Log
- 2026-09-06 07:00:00 — Plan dibuat dari analisis kode; keputusan pengguna: konsep cukup 3 topik, level baru di depan, nomor per-grade + label kelas. Belum ada eksekusi.
- 2026-09-06 11:00:00 — M1 selesai: `DigitCount 1`, 4 level Kelas 1 (k1-tambah/kurang/campur 1-digit + jembatan 2-digit), `grade+requires` + unlock eksplisit dengan migrasi veteran (progres lama tetap unlock), LevelSelect grup Kelas 1/2 + chip grade, opsi 1 digit di Practice, achievement `bintang-kelas-1`, label i18n Kelas 1/2. Verifikasi: `typecheck` lulus, `lint` OK, `test` 188/188 (LevelSelectScreen diperbarui untuk penomoran per-grade), `build` OK.
- 2026-09-06 11:30:00 — Review M1: temuan F1 (regresi unlock veteran) & rapian field diperbaiki di `src/data/levels.ts` + test 1-digit/levels/achievement ditambah; plan perbaikan terpisah `2026-09-06-review-k1-m1-fixes.md`.
- 2026-09-06 14:00:00 — Review fix `08cc82c`: migrasi veteran + test ditutup.
- 2026-09-06 15:00:00 — M2 selesai: 3 level konsep Kelas 1 (`k1-membilang`, `k1-banding`, `k1-nilai-tempat`) disisipkan di depan rantai; `ConceptProblem`/`ConceptSettings`/`levelKind` di `types`; `conceptGenerator.ts` + render-time `i18n/concept.ts` + `ConceptQuestionView` + `ConceptLearnScreen` (terpisah dari `learnReducer`, route `concept-learn`); `LevelSelectScreen` routing per `levelKind`; `Achievement bintang-kelas-1` diperluas ke 7 level; i18n `concept.*` ID/EN parity. Verifikasi: `typecheck` OK, `lint` OK, `test` 204/204, `build` OK. Commit M2 berikut.
- 2026-09-06 16:50:00 — Review M2 fix: F1–F8 ditutup (determinisme compare, counting 1–20, distraktor tepi, i18n place, stale closure/timerRef, ConfirmDialog, test counting tepi).
- 2026-09-06 17:15:00 — M3 polish: `HomeScreen` ringkasan per-kelas `K1 7/K2 12` + continue branching `concept-learn`/`learn`; `ResultScreen` retry/next branching per `levelKind`; verifikasi `typecheck` OK, `lint` OK, `test` 205/205, `build` OK. Commit M3 berikut.

## Notes
- Aturan kritis repo dipertahankan: operand string asli tanpa `reverse()`; carry/borrow kanan-ke-kiri terpisah dari jalur tampilan; i18n data murni + render-time.
- ID level lama (`level-1..11`, `tantangan`) stabil karena dipakai storage (`completedLevelIds`, `bestScores`, `lastLevelId`) dan achievement hardcode.
- Standar: proyek kecil, tanpa seremoni enterprise penuh; cukup pola repo (data murni + render-time i18n). Deviasi dari TOGAF/ODA tidak relevan untuk skala ini.
- Keputusan desain: nomor per-grade + label kelas (contoh: Kelas 1 Level 1–5, Kelas 2 Level 1–11) agar pedagogis jelas; alternatif nomor global ditolak karena membingungkan.
- Alternatif "append level di belakang" ditolak pengguna; prepend + migrasi unlock dipilih meski butuh kerja migrasi.
