# Eksplisit Share Dialog State Machine (ShareAchievement)

Tanggal: 2026-11-18 11:23:00
Topik: `refactor(social): make share achievement modal state machine explicit`

## Task / Masalah
Modal dialog berbagi kartu pencapaian (`ShareAchievement.tsx`) sebelumnya menggunakan 5 variabel status terpisah (`open`, `imageBlob`, `imageUrl`, `message`, `busy`). Ketika pembuatan canvas gambar gagal atau tidak didukung (misal di lingkungan terbatas/jsdom), dialog terjebak selamanya di status loading ("Menyiapkan gambar…") tanpa jalan keluar dan tombol berbagi gambar terus dinonaktifkan tanpa fallback informatif.

## Berkas yang Diubah
- `src/lib/shareDialogMachine.ts`: Membuat pure reducer `shareDialogReducer` dengan discriminated union `phase: 'closed' | 'rendering' | 'ready' | 'error'`, status busy lock, dan feedback pesan.
- `src/components/achievement/ShareAchievement.tsx`: Mengadopsi `useReducer(shareDialogReducer, ...)`, menghubungkan pembuatan gambar dengan penanganan error ramah anak, dan mengamankan pembersihan `URL.revokeObjectURL`.
- `src/i18n/dicts/id.ts` & `src/i18n/dicts/en.ts`: Menambahkan kunci bilingual `'share.imageFail'`.
- `tests/shareDialogMachine.test.ts`: Tes unit komprehensif pure reducer share machine (8 tes).
- `tests/ShareAchievement.test.tsx`: Tes komponen untuk siklus buka, tutup (✕ & Escape), dan salin teks (5 tes).
- `plans/2026-11-18-explicit-state-machines-modernization.md`: Update task dan progress log.

## Keputusan Teknis & Bisnis
- Jika peramban atau perangkat tidak mendukung pembuatan canvas gambar, modal tidak lagi macet di loading skeleton, melainkan beralih ke `phase: 'error'` dengan pesan bersahabat, sementara fitur berbagi teks pencapaian dan tombol sosial tetap dapat diakses.
- Menjaga URL lifecycle object yang aman melalui `activeUrlRef` yang selalu me-revoke URL lama sebelum membuka dialog baru atau saat komponen di-unmount.
- Penggunaan `busy: boolean` pada `phase: 'ready'` mengunci tombol Web Share API untuk mencegah anak melakukan tap ganda yang memicu dialog duplikat.

## Verifikasi
- `npm run typecheck` (`tsc --noEmit`): 0 error.
- `npx vitest run tests/shareDialogMachine.test.ts tests/ShareAchievement.test.tsx`: 13/13 tes lulus.
- Rangkaian tes penuh (`npm test`): 68 test files, 478 tests lulus 100%.

## Proposed Commit Message
`refactor(social): make share achievement modal state machine explicit`
