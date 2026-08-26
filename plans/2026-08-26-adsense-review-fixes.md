# Plan: Fix Temuan Review AdSense + Legal

Created: 2026-08-26 09:20:00

## Objective
Menutup temuan review implementasi AdSense + halaman legal: bug iklan tidak pernah dimuat setelah koneksi pulih (offline listener), typo penomoran README, shadowing variabel `document`, dead code, dan gap test env getter.

## Temuan → Fix
- F1 BUG Medium: offline saat mount → tanpa listener 'online', request tidak pernah terkirim sampai remount.
- F2 BUG Low: README tabel unit 1,3,3,4 → 1,2,3,4.
- F3 Tidy: shadowing `document` di LegalScreen → `doc`.
- F4 Dead code: `legalDocumentTitle()` tak terpakai + import `Language`.
- F5 Tidy: komentar eslint-disable usang di adsense.ts.
- F6 Gap: unit test `getClientId/getSlotId/isAdsenseEnabled` + regresi F1 (offline→online).

## Milestones & Tasks

### Phase A — Bug & robustness
- [x] F1 AdSlot: tryRequest() + listener 'online' + cleanup; guard requestedRef dipertahankan
- [x] F2 README penomoran tabel 1,2,3,4

### Phase B — Tidy
- [x] F3 rename document→doc
- [x] F4 hapus legalDocumentTitle + import Language
- [x] F5 hapus eslint-disable usang

### Phase C — Tests
- [x] Unit test env getters (3 kasus)
- [x] Regresi F1 di file terpisah (vi.mock adsense + ImmediateIntersectionObserver): offline saat mount → online memicu sekali; dedupe event berulang
- [x] Bonus kerobosan: callback IO kini aman terhadap observer yang menyala sinkron (sentinel optional-chaining)

### Phase D — Verifikasi & dokumentasi
- [x] format/lint/typecheck/test/build hijau — **188 test / 26 file**
- [x] Plan progress log + memory akhir

## Risks
- vi.mock modul adsense memengaruhi test lain dalam file — gunakan file test terpisah untuk regresi F1.

## Progress Log
- 2026-08-26 09:20:00 — Plan dibuat setelah review implementasi AdSense+Legal.
- 2026-08-26 09:40:00 — Seluruh fase selesai. Temuan bonus dari penulisan regresi: callback IntersectionObserver rentan TDZ bila observer menyala sinkron — diperbaiki dengan sentinel optional-chaining.
