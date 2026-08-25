# Plan: Fix Temuan Review Implementasi i18n

Created: 2026-08-25 20:00:00

## Objective
Menutup 8 temuan hasil review implementasi dua bahasa: 2 bug fungsional (label nilai tempat, argumen columns), 2 drift konten judul sesi, 2 kerapian (ConfirmDialog default ID, aria Mascot), 1 keputusan deviasi terdokumentasi (document.title = brand konstan), dan 1 gap test (smoke EN layar).

## Temuan → Keputusan
- F1 BUG High: PLACE_LABELS/SHORT hardcoded di grid & legenda nilai tempat.
- F2 BUG Medium: stepInstruction dipanggil tanpa columns → leftPlace kosong pada pinjam sederhana.
- F3 Low: fallback judul ad-hoc memakai t('tab.levels').
- F4 Low: judul sesi latihan 'Latihan'; custom memakai label form beremoji.
- F5 Tidy → KEPUTUSAN USER: label ConfirmDialog dijadikan WAJIB.
- F6 Tidy: aria Mascot belum dilokalkan.
- F7 Deviasi → KEPUTUSAN USER: document.title tetap brand konstan "Asharu Math".
- F8 Gap: smoke test EN layar belum ada.

## Milestones & Tasks

### Phase A — Bug fungsional
- [x] F1 helper `src/i18n/places.ts` (short ID S/P/R/Rb · EN O/T/H/Th) + VerticalMathProblem + PlaceValueHeader + AnswerCell/CarryCell/BorrowCell (aria juga dilokalkan); konstanta PLACE_* dihapus dari placeValue.ts
- [x] F2 LearnScreen kirim problem.columns ke stepInstruction
- [x] F3 key `learn.adhocTitle`
- [x] F4 key `practice.sessionTitle` & `practice.customSessionTitle`

### Phase B — Tidy
- [x] F5 ConfirmDialog label wajib (props required)
- [x] F6 Mascot aria via dict key `mascot.aria`
- [x] Hapus re-export `Language` duplikat di core.ts

### Phase C — Tests
- [x] EN grid labels (title 'ones', short 'O'); regresi F2 ('puluhan'/'tens'); smoke EN Home & Settings; smoke judul ad-hoc — 172 test / 23 file

### Phase D — Verifikasi & dokumentasi
- [x] format/lint/typecheck/test/build lulus semua
- [ ] Commit & push (menunggu instruksi)

## Risks
- Penghapusan konstanta PLACE_* dapat memutus impor tak terduga → terverifikasi via grep + typecheck.
- Perubahan props ConfirmDialog menyentuh 2 call site saja → aman.

## Progress Log
- 2026-08-25 20:00:00 — Plan dibuat setelah review implementasi i18n dan keputusan user (F5 label wajib, F7 brand konstan).
- 2026-08-25 21:00:00 — Seluruh fase selesai. Catatan: cakupan F1 meluas ke aria cell components (AnswerCell/CarryCell/BorrowCell) yang ternyata juga memakai PLACE_LABELS; verticalProblem.test perlu wrapper AllProviders. Verifikasi penuh hijau.
