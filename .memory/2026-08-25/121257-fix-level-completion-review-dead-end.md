# Fix Level Completion Review Dead-End

Date: 2026-08-25 12:12:57 (+0700)

## Task / Problem
Laporan: level selesai dikerjakan, anak pulang tanpa klik "Level Berikutnya", level berikutnya tetap terkunci. RCA: `completeLevel()` hanya jalan saat `state.finished`, yang hanya diset setelah tap "Berikutnya" pada langkah `review` terakhir — satu-satunya langkah non-auto-lanjut. Anak menap 🏠 bottom-nav saat layar perayaan → unmount → completion tak tercatat.

## Key Files Changed
- `src/screens/LearnScreen.tsx` — reducer `'next'`: masuk review kini set `autoAdvanceToken` (auto-lanjut 700ms → finished pasti tercapai); leave-guard effect + ConfirmDialog keluar mid-session; finish effect membersihkan guard sebelum navigate programatik.
- `src/state/NavigationContext.tsx` — API baru: `setLeaveGuard(guard)`, `confirmPendingNavigation()`, `cancelPendingNavigation()`; semua entry navigasi (navigate/back/goToTab) cek guard dan menahan target di ref. Guard null = perilaku lama.
- `tests/learnReducer.test.ts` (+5), `tests/LearnScreen.test.tsx` (baru, 5 kasus).
- `plans/2026-08-24-fix-level-completion-review-dead-end.md`.

## Technical / Business Decisions
- Root fix dipilih: auto-lanjut dari review (konsisten pola ketik-sekali/auto-flow commit 9e953ff); tombol manual tetap ada.
- Guard konfirmasi keluar dipasang di level NavigationContext sehingga bottom-nav DAN header back otomatis ter-guard; LearnScreen memasang guard hanya saat `!finished`.
- Navigasi programatik ke Result membersihkan guard lebih dulu agar tidak tertahan dialog.

## Assumptions / Risks
- Anak kini hanya ~700ms melihat layar review sebelum auto-lanjut; tombol "Berikutnya" tetap tersedia untuk yang ingin cepat.
- Out of scope (dicatat): resume sesi half-done; replay sesi saat header-back dari Result ke Learn (LearnScreen remount fresh).

## Blockers / Unresolved
- Belum di-commit (menunggu instruksi user).

## Verification Performed
- format ✅ · lint ✅ · typecheck ✅ · **152/152 test (21 file)** ✅ · build ✅

## Commit Proposal
- `fix: auto-selesaikan sesi dari langkah review dan guard keluar mid-session`
