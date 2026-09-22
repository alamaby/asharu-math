# Sesi Belajar: Input Angka Cukup Sekali per Kolom

## Task / Masalah

Di sesi Belajar penjumlahan, anak harus mengetik angka hingga 3× per kolom
(jumlah di Kotak Hitung → digit jawaban → kotak simpan), membingungkan anak
usia 6–8 tahun. Request user: anak cukup input angka sekali saja.

## Key Files Changed

- `src/types/index.ts` — `interim-sum` ditambah `expectedDigit` + `carry?`
  opsional; varian baru `carry-down`; varian `carry-digit` dihapus.
- `src/lib/learningSteps.ts` — `buildAdditionSteps` tidak lagi memancarkan
  `answer-digit`/`carry-digit` untuk penjumlahan; tiap kolom satu `interim-sum`
  yang membawa payload auto-fill, kolom turunan carry jadi `carry-down`.
- `src/screens/LearnScreen.tsx` — `check-interim` benar/ungkap langsung mengisi
  `answers` + `carries` + `doneAnswerColumns`; `next` mengisi `carry-down` dan
  auto-advance; `replayTo`/`repeat` membersihkan hasil otomatis; cabang
  `carry-digit` (digit/backspace/repeat/acceptsDigits/activeCell) dihapus.
- `src/i18n/steps.ts` + `src/i18n/dicts/{id,en}.ts` — kunci baru
  `steps.carryDown`; teks interim diupdate (kotak jawaban ikut terisi);
  kunci mati `writeCarryAnswer`, `answerFromSum`, `writeCarryBox` dihapus.
- `tests/learningSteps.test.ts`, `tests/learnReducer.test.ts` — ekspektasi
  urutan langkah baru `[intro, interim-sum, interim-sum, carry-down, review]`
  untuk 26+87; assert auto-fill jawaban + simpanan dari sekali ketik.

## Decisions

- Desain yang dipilih: ketik jumlah per kolom sekali di Kotak Hitung, sisanya
  otomatis (opsi yang user pilih dari 2 opsi; opsi alternatif tanpa Kotak Hitung
  ditolak karena menambah beban mental hic).
- Kolom turunan carry terakhir (mis. ratusan 113) jadi langkah `carry-down`
  auto-complete bernarasi + auto-advance 700 ms (konsisten pola review).
- Pengurangan tidak diubah (sudah 1 input angka per kolom); pilihan Bisa/Tidak
  bisa bukan input angka.
- Feedback reducer tetap hardcode ID mengikuti konvensi eksisting; instruksi
  langkah tetap via dict ID/EN agar switch bahasa instan.

## Assumptions / Risks

- Anak kehilangan latihan motorik menulis digit — mitigasi: sel terisi otomatis
  disorot hijau (done) + review tetap menampilkan hasil lengkap.
- `wrongAttempts` (skor/achievement) tetap agregat per soal — makna tak berubah.

## Blockers / Unresolved

- Tidak ada.

## Verification

- `npm run typecheck` — bersih.
- `npm run test` — 263/263 lolos, 32 file (termasuk 4 file tes terkait yang
  diupdate/dijalankan ulang terpisah).
- `npm run lint` — bersih; `prettier --check` pada 8 file tersentuh — bersih.

## Commit Proposal

`feat(learn): input angka sekali per kolom di sesi belajar penjumlahan`

## Related

- Plan: `plans/2026-09-13-sesi-belajar-input-angka-sekali.md`
