# Review Temuan M1 — Kelas 1 Track (K1) & Perbaikan

Created: 2026-09-06 11:15:00

## Objective
Menutup celah M1 agar sesuai plan `2026-09-06-konten-kelas-1-dan-2.md`: unlock tidak regresi untuk progres lama, generator 1-digit aman, test & i18n lengkap, dan dokumen konsisten sebelum melanjutkan M2 (membilang/banding/nilai tempat).

## Scope
- In: perbaikan `isLevelUnlocked` + migrasi veteran, konsistensi `LevelDefinition`, generator fallback 1-digit, test 1-digit, test unlock/migrasi, test achievement `bintang-kelas-1`, rapian plan/README.
- Out: materi konseptual M2 (membilang/banding/nilai tempat) — tetap di plan utama; UI konsep tidak dikerjakan di plan ini.

## Temuan Review (prioritas)

### P1 — Kritis
- **F1. Regresi unlock untuk progres lama (veteran terkunci):**
  - `src/data/levels.ts:255` `isLevelUnlocked` hanya mem-bypass untuk `grade === 1`. Akibatnya `level-1` (grade 2, `requires: k1-jembatan-2-digit`) terkunci untuk veteran yang `completedLevelIds` berisi legacy (`level-1..tantangan`) tetapi belum menyelesaikan K1. Veteran yang sudah `completedLevelIds=['level-1']` juga akan melihat `level-1` sendiri sebagai terkunci karena `requires` tidak terpenuhi — `completed` card tetap terkunci.
  - Dampak: pengguna lama tidak bisa lanjut/mengulang `level-1..11` tanpa wajib menyelesaikan K1, bertentangan dengan plan (migrasi = unlock, bukan auto-complete, dan tidak memaksa ulang).
- **F2. Plan task tidak jujur:**
  - `plans/2026-09-06-konten-kelas-1-dan-2.md:26-27` Task `tambah test carry/borrow none/required 1-digit` dicentang [x] tetapi `tests/problemGenerator.test.ts:37` masih hanya loop `2|3|4`. Tidak ada test 1-digit.
  - Task `union ColumnarSettings | ConceptSettings` dicentang [x] padahal M1 tidak butuh/ tidak diimplementasi — centang prematur.

### P2 — Penting
- **F3. Inkonsistensi urutan field `LevelDefinition`:** `src/types/index.ts:102` urut `number, grade, requires`; di `src/data/levels.ts:77-83` objek `level-2..` tertulis `grade, requires, number`. Tidak merusak runtime, tapi melanggar clean code & menyulitkan review.
- **F4. `getNextLevelId` masih posisi-based (`LEVELS[index+1]`)** sementara unlock sudah `requires`-based. Saat ini array linear sehingga identik, tapi komentar/maksud tidak sinkron dengan plan (unlock eksplisit per-level).
- **F5. Fallback generator 1-digit tidak sepenuhnya selaras:**
  - `src/lib/problemGenerator.ts:232-233` `fallbackNoBorrow` hanya untuk `operation==='subtraction' && digitCount===1`. Untuk `settings.operation==='mixed' && digitCount===1 && carryMode==='any'`, jalur `addition` di fallback akan memakai `buildAdditionWithCarry` (bisa 2-digit). Secara UX masuk akal, tapi tidak terdokumentasi dan tidak ada test yang mengunci perilaku ini vs `none` untuk sesi K1/Practice `mixed 1-digit`.
  - Komentar risiko plan `Hasil tambah 1-digit bisa 2-digit (9+8=17)` belum di-cover test render `VerticalMathProblem` width 2 untuk 1-digit `carry`.

### P3 — Sedang/Ringan
- **F6. Belum ada test `isLevelUnlocked` & migrasi veteran:** plan mensyaratkan `test isLevelUnlocked + skenario progres lama`. Belum ada file test `levels.test.ts`.
- **F7. Belum ada test achievement `bintang-kelas-1`:** `tests/achievements.test.ts` tidak menguji syarat 4 level K1.
- **F8. Verifikasi plan tidak mencantumkan bukti mutakhir:** Progress Log M1 menulis `188/188` tetapi setelah perbaikan jumlah level bertambah; perlu `format:check → lint → typecheck → test → build` ulang dan update log.

## Rencana Perbaikan

### Milestones
1. Fix kritis F1 + rapikan F3/F4 agar unlock konsisten dengan plan.
2. Lengkapi test yang dijanjikan plan (F2, F6, F7) + dokumentasi generator (F5).
3. Update plan & README, lalu verifikasi penuh sebelum commit.

## Tasks
- [x] F1 — Perbaiki `isLevelUnlocked`:
  - [x] `level` yang sudah ada di `completedLevelIds` selalu `true` (bisa mengulang).
  - [x] Veteran bypass diperluas: jika `completedLevelIds` mengandung legacy (`LEGACY_LEVEL_IDS`), maka prasyarat yang berada di rantai K1 (`K1_IDS = ['k1-tambah-1-digit','k1-kurang-1-digit','k1-campur-1-digit','k1-jembatan-2-digit']`) dianggap terpenuhi — mencakup `level-1` (requires `k1-jembatan-2-digit`).
  - [x] Tambah komentar yang menjelaskan migrasi vs auto-complete, selaras plan.
- [x] F2 — Koreksi `plans/2026-09-06-konten-kelas-1-dan-2.md`:
  - [x] Ubah checklist `Generator 1-digit ... tambah test` menjadi belum centang, atau pisah menjadi sub-task dan hubungkan ke plan perbaikan ini.
  - [x] Ubah `union ColumnarSettings` menjadi catatan M2 (belum diperlukan M1) — jangan centang prematur.
- [x] F3 — Rapikan urutan field `LevelDefinition` di `src/data/levels.ts` menjadi `id, number, grade, requires, name...` konsisten.
- [x] F4 — Dokumentasikan `getNextLevelId` sebagai posisi-based yang sengaja linear; tambahkan komentar bahwa untuk rantai linear identik dengan `requires`, dan tidak diubah di M1 (hindari over-engineering M2 non-linear).
- [x] F5 — Dokumentasi & test generator:
  - [x] Perjelas komentar `fallbackNoBorrow`/`effectiveCarryMode` untuk 1-digit.
  - [x] Tambah test di `tests/problemGenerator.test.ts`: `digit sesuai pilihan` mencakup `1|2|3|4`; `mixed 1-digit` tidak pernah menghasilkan borrow; `addition 1-digit none` tidak pernah carry; serta render `VerticalMathProblem` width 2 untuk `9+8` (opsional quick check).
- [x] F6 — Buat `tests/levels.test.ts` (atau perluas test yang ada) untuk `isLevelUnlocked`:
  - [x] User baru: hanya `k1-tambah-1-digit` terbuka.
  - [x] User veteran `['level-1']` dan `['level-5']`: K1 terbuka penuh, `level-1` terbuka, `level-N+1` terbuka sesuai progres.
  - [x] User yang sudah menyelesaikan K1: `level-1` terbuka via `requires`.
  - [x] `getNextLevelId` linear sesuai array.
- [x] F7 — Tambah test `bintang-kelas-1` di `tests/achievements.test.ts`.
- [x] F8 — Jalankan `npm run format:check → lint → typecheck → test → build`, perbarui `Progress Log` di kedua plan, dan commit.

## Risks
- Over-fix migrasi: bypass terlalu luas bisa membuka level yang belum seharusnya untuk user baru — batasi hanya K1_IDS, bukan semua `grade 1`.
- Test flaky generator (acak): mitigasi dengan `RUNS=300` yang sudah ada + assert deterministik (`hasCarry/hasBorrow`).
- Scope creep M2: jangan bawa tipe `ConceptProblem` ke plan ini.

## Progress Log
- 2026-09-06 11:15:00 — Plan temuan dibuat dari review M1 vs plan induk.
- 2026-09-06 14:00:00 — Fix F1 (veteran unlock) + F3/F4 + F2/F5-F7 selesai: `isLevelUnlocked` kini selalu buka level yang sudah selesai, bypass `K1_IDS` untuk veteran, `getNextLevelId` terdokumentasi, test 1-digit/levels/bintang-kelas-1 ditambah. Verifikasi: `typecheck` OK, `lint` OK, `test` 198/198 (satu fix ekspektasi rantai), `build` OK. Commit berikutnya menutup plan ini.

## Notes
- Aturan kritis dipertahankan: operand string asli tanpa `reverse()`; carry/borrow kanan-ke-kiri terpisah dari jalur tampilan; i18n render-time.
- Perubahan ID level lama tetap dilarang; hanya `number/grade/requires` yang ditambah.
