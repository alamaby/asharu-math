# Fix: Level Tidak Tercatat Saat Anak Keluar Sebelum Konfirmasi Akhir

Created: 2026-08-24 23:20:00

## Objective
Memastikan penyelesaian level selalu tercatat (`completeLevel`) meski anak tidak menekan tombol terakhir pada langkah review, serta melindungi sesi berjalan dengan dialog konfirmasi keluar.

## Root Cause
`completeLevel()` hanya dipanggil saat `state.finished === true` (LearnScreen finish effect). `finished` hanya diset reducer `'next'` saat melewati langkah `review` soal terakhir — satu-satunya langkah yang tidak auto-lanjut. Anak menap 🏠 bottom-nav saat layar perayaan → unmount tanpa `finished` → completion tidak pernah dicatat → level berikutnya tetap terkunci.

## Scope
- Auto-lanjut (autoAdvanceToken) saat transisi ke langkah review pada LearnScreen reducer.
- Leave-guard ringan pada NavigationContext + ConfirmDialog keluar mid-session.
- Regresi test reducer & behavior test LearnScreen.

## Milestones
1. Phase 1 — Root fix auto-lanjut review
2. Phase 2 — Guard keluar mid-session (dialog konfirmasi)
3. Phase 3 — Tests regresi & behavior
4. Phase 4 — Verifikasi penuh + dokumentasi

## Tasks

### Phase 1 — Root fix: auto-lanjut dari review
- [x] Reducer `'next'`: saat transisi ke step `review`, set `updated.autoAdvanceToken = nextToken()`
- [x] Pastikan `'prev'`/`'repeat'` menolkan token; tombol Berikutnya manual tetap berfungsi

### Phase 2 — Guard keluar mid-session
- [x] `NavigationContext`: mekanisme `setLeaveGuard`; `goToTab`/`navigate`/`back` cek guard, simpan target tertahan, batalkan navigasi bila guard aktif (+ `confirmPendingNavigation` / `cancelPendingNavigation`)
- [x] `LearnScreen`: pasang guard selama `!finished`; ConfirmDialog "Lanjut Belajar" / "Ya, Keluar"
- [x] `AppHeader` back ikut ter-guard otomatis (guard berada di level context)
- [x] Guard default null = perilaku lama

### Phase 3 — Tests
- [x] `tests/learnReducer.test.ts`: 5 kasus baru (token saat masuk review; next review terakhir → finished; next review non-terakhir → pindah soal; prev/repeat membatalkan token)
- [x] `tests/LearnScreen.test.tsx` (baru, 5 kasus): auto-finish via fake timers → completeLevel tercatat + probe result; unmount awal → tidak tercatat; dialog batal/konfirmasi; pending tidak tertukar antar target

### Phase 4 — Verifikasi & dokumentasi
- [x] format/lint/typecheck/test/build lulus — **152 test / 21 file**
- [ ] Commit & push (menunggu instruksi)
- [x] Update progress log + `.memory`

## Risks
- Anak hanya ~700ms melihat layar review sebelum loncat; mitigasi: tombol manual tetap ada.
- Perubahan API NavigationContext berisiko regersi navigasi; mitigasi: default no-op + test existing.

## Progress Log
- 2026-08-24 23:20:00 — Plan dibuat setelah RCA dan keputusan user (auto-lanjut review + dialog konfirmasi).
- 2026-08-25 00:10:00 — Semua fase implementasi selesai. Temuan penting saat test: harness awal merender LearnScreen tanpa mendorong stack sehingga probe salah baca (diperbaiki via NavigateToLearn seed). Verifikasi: format ✅ lint ✅ typecheck ✅ 152/152 test ✅ build ✅.

## Notes
- Out of scope: resume sesi half-done; replay sesi saat header-back dari Result (temuan terkait).
- Keputusan desain: auto-lanjut memakai delay 700ms yang sama agar konsisten.
