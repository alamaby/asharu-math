# Eksplisit Step Status Lifecycle di `LearnScreen` (`learnReducer`)

- **Tanggal / Waktu**: 2026-11-18 10:06:00 (WIB)
- **Status**: Selesai
- **Terkait**: Prioritas 4 dari [plans/2026-11-18-explicit-state-machines-modernization.md](file:///C:/Works/github.com/alamaby/asharu-math/plans/2026-11-18-explicit-state-machines-modernization.md)

## Masalah / Latar Belakang
Sebelumnya, `LearnScreen.tsx` dan `learnReducer` mengelola status langkah pembelajaran menggunakan pasangan nilai implisit:
1. `stepComplete: boolean` dan `autoAdvanceToken: number | null` (counter inkremental yang dipakai mendeteksi pemicu auto-advance).
2. Tidak ada representasi tegas antara langkah yang sedang menunggu input anak (`interactive`), langkah yang selesai benar dan sedang menghitung mundur auto-advance 700ms (`advancing`), langkah yang terungkap setelah 3x salah (`revealed`), dan langkah informatif yang siap dilanjutkan secara manual (`ready_next`).

## Perubahan Teknis
1. **Definisi Status Siklus Hidup Langkah Eksplisit (`src/screens/LearnScreen.tsx`)**:
   - Ditambahkan tipe:
     ```ts
     export type StepStatus = 'interactive' | 'advancing' | 'revealed' | 'ready_next'
     ```
   - `stepStatus` dimasukkan ke dalam `LearnState` dan dikelola di seluruh aksi `learnReducer` (`digit`, `choose`, `check-interim`, `next`, `prev`, `repeat`).
   - `stepComplete` dan `autoAdvanceToken` tetap dipertahankan dan disinkronkan secara mulus untuk menjamin *strict backward-compatibility* terhadap seluruh suite pengujian yang sudah ada.
2. **Sinkronisasi Auto-Advance & UI Controls**:
   - `useEffect` auto-advance kini memeriksa `state.stepStatus === 'advancing'` bersama `autoAdvanceToken`.
   - Transisi mundur (`prev`), pengulangan (`repeat`), atau klik manual `next` segera membatalkan timer penundaan dengan mengubah status ke non-`advancing`.
   - Kontrol panduan (`canGoNext`, `pulseNext`) di `StepGuide` merefleksikan status eksplisit (`stepStatus !== 'interactive'`).
3. **Pengujian**:
   - Ditambahkan unit test di `tests/learnReducer.test.ts` untuk memverifikasi transisi state: `ready_next -> interactive -> advancing -> revealed`.
   - Seluruh tes integrasi `tests/LearnScreen.test.tsx` (6 tes) dan unit test `tests/learnReducer.test.ts` (13 tes) lulus 100%.

## Verifikasi
- `npm run typecheck` (`tsc --noEmit`): 0 error.
- `npm test`: 64 berkas pengujian (454 tes) lulus 100%.

## Proposed Commit Message
`refactor(learn): introduce explicit step status lifecycle machine in learn reducer`
