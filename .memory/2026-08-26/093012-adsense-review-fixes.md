# Fix Temuan Review AdSense + Legal

Date: 2026-08-26 09:30:12 (+0700)

## Task / Problem
Menutup 6 temuan review implementasi AdSense + halaman legal (plan: `plans/2026-08-26-adsense-review-fixes.md`): bug offline-permanent pada AdSlot, typo penomoran README, shadowing `document`, dead code `legalDocumentTitle`, komentar eslint usang, dan gap test env getter.

## Key Files Changed
- `src/components/common/AdSlot.tsx`: tryRequest() dipanggil saat visible + listener event 'online'; IO callback aman sinkron (sentinel let + optional chaining).
- `src/screens/LegalScreen.tsx`: rename shadowing document→doc; hapus dead export legalDocumentTitle + import Language.
- `src/lib/adsense.ts`: hapus komentar eslint-disable usang.
- README.md: penomoran tabel ad unit 1,2,3,4.
- Tests: tests/AdSlot.test.tsx (+3 env getters), tests/AdSlotOffline.test.tsx baru (regresi F1 via vi.mock adsense + ImmediateIntersectionObserver).

## Technical / Business Decisions
- F1: permintaan iklan diekstrak ke tryRequest() dan dipicu ulang oleh event 'online' — requestedRef tetap guard anti-dobel.
- Regresi F1 memakai file test terpisah dengan vi.mock lib/adsense agar tidak mengganggu test lain.

## Assumptions / Risks
- Commit 2b01f03 (fitur dasar) masih lokal; push menyusul instruksi user.

## Blockers / Unresolved
- Commit fitur dasar `2b01f03` + fix ini masih lokal; push menunggu instruksi user.

## Verification Performed
- format ✅ · lint ✅ · typecheck ✅ · **188/188 test (26 file)** ✅ · build ✅

## Commit Proposal
- `fix: muat ulang iklan saat koneksi pulih dan rapikan temuan review adsense`
