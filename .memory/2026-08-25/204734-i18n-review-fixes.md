# Fix Temuan Review i18n

Date: 2026-08-25 20:47:34 (+0700)

## Task / Problem
Menutup 8 temuan review implementasi bilingual (plan: `plans/2026-08-25-i18n-review-fixes.md`): label nilai tempat hardcoded, stepInstruction tanpa columns, judul sesi bergeser, ConfirmDialog default ID, aria Mascot, document.title deviasi, gap smoke EN.

## Key Files Changed
- `src/i18n/places.ts` (baru): usePlaceLabels — long via dict place.*, short per bahasa (S/P/R/Rb vs O/T/H/Th).
- `src/components/math/`: VerticalMathProblem (title+short), PlaceValueHeader, AnswerCell/CarryCell/BorrowCell (aria dilokalkan via key answer.aria/carry.aria/borrow.*). Konstanta PLACE_LABELS/PLACE_SHORT_LABELS dihapus dari lib/placeValue.ts.
- `src/screens/LearnScreen.tsx`: kirim problem.columns ke stepInstruction (F2); fallback judul ad-hoc ke learn.adhocTitle (F3).
- `src/screens/PracticeScreen.tsx`: judul sesi → practice.sessionTitle / practice.customSessionTitle (F4).
- `src/components/common/ConfirmDialog.tsx`: confirmLabel/cancelLabel required (F5).
- `src/components/layout/Mascot.tsx`: aria via mascot.aria (F6); core.ts re-export Language dihapus.
- Dicts: +answer.aria, carry.aria, borrow.newValueAria, borrow.becomes, learn.adhocTitle, practice.sessionTitle, practice.customSessionTitle, mascot.aria.
- Tests: i18n.test (+2: regresi F2 id/en & EN grid labels), HomeScreen/SettingsScreen (+smoke EN), LearnScreen (+judul adhoc), verticalProblem dibungkus AllProviders.

## Technical / Business Decisions
- F5: confirmLabel/cancelLabel ConfirmDialog dijadikan required (compile guard).
- F7: document.title tetap brand konstan "Asharu Math" — keputusan user.
- Short label nilai tempat per bahasa: ID S/P/R/Rb, EN O/T/H/Th via helper `src/i18n/places.ts`.

## Assumptions / Risks
- Hapus konstanta PLACE_* setelah verifikasi pemakai tersisa nol.

## Blockers / Unresolved
- Belum di-commit (menunggu instruksi user).

## Verification Performed
- format ✅ · lint ✅ · typecheck ✅ · **172/172 test (23 file)** ✅ · build ✅

## Commit Proposal
- `fix: lokalkan label nilai tempat dan rapikan temuan review i18n`
