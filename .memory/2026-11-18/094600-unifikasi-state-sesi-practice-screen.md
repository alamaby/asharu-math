# Unifikasi State Sesi Latihan (`PracticeScreen` & `columnSessionMachine`)

- **Tanggal / Waktu**: 2026-11-18 09:46:00 (WIB)
- **Status**: Selesai
- **Terkait**: Prioritas 3 dari [plans/2026-11-18-explicit-state-machines-modernization.md](file:///C:/Works/github.com/alamaby/asharu-math/plans/2026-11-18-explicit-state-machines-modernization.md)

## Masalah / Latar Belakang
Sebelumnya, `PracticeScreen.tsx` mengelola sesi latihan bersusun (*column*) dan latihan cerita (*story*) secara terpecah dan bertumpuk:
1. Variabel state `phase` (`'setup' | 'solving' | 'solving-story'`), `session`, dan `storySession` disimpan terpisah, membuka kemungkinan *impossible state* (mis. phase solving namun session null).
2. Mode cerita di `PracticeScreen` menduplikasi logika input keypad, timer delay 700ms/1200ms, feedback sound, dan reveal yang sebelumnya sudah diekstraksi ke `useQuestionSession`.
3. Sesi hitung bersusun memiliki kalkulasi pergeseran kolom aktif (`advanceActiveCol`), pengelolaan salah, dan timer auto-advance yang tersebar dalam callback mutable.

## Perubahan Teknis
1. **Pure Reducer Mesin Bersusun (`src/lib/columnSessionMachine.ts`)**:
   - Mengekstrak fungsi murni `advanceActiveCol` untuk perpindahan kolom aktif otomatis dari kanan ke kiri yang kosong.
   - Mengelola aksi `digit`, `backspace`, `select_col`, `check_correct`, `check_wrong`, `unlock`, `advance`, dan `dismiss_help` secara deterministik dan bebas efek samping.
2. **Discriminated Union State di Layar Latihan (`src/screens/PracticeScreen.tsx`)**:
   - Mendefinisikan `PracticeSessionState = { kind: 'setup' } | { kind: 'column'; ... } | { kind: 'story'; ... }`.
   - Memecah tampilan menjadi tiga subkomponen murni dan modular:
     - `PracticeSetupView`: Konfigurasi opsi latihan atau pembuatan soal kustom.
     - `PracticeColumnSolvingView`: Eksekusi latihan bersusun berbasis `columnSessionReducer` dan pengelolaan timer terisolasi via ref.
     - `PracticeStorySolvingView`: Eksekusi latihan soal cerita menggunakan custom hook terpadu `useQuestionSession<StoryQueueItem>`.
3. **Pengujian Menyeluruh**:
   - `tests/columnSessionMachine.test.ts`: 11 unit test menguji inisialisasi kolom, pergeseran otomatis, penguncian saat benar/salah, serta penyelesaian sesi.
   - `tests/screens/PracticeScreen.test.tsx`: 4 tes integrasi layar (setup -> solving, custom input -> solving 1 soal, jawaban benar auto-advance ke result, dan feedback salah membuka kunci).
   - `tests/screens/PracticeScreenStory.test.tsx`: Tetap lulus untuk verifikasi round-trip presentasi cerita.

## Verifikasi
- `npm run typecheck` (`tsc --noEmit`): 0 error.
- `npm test`: 64 berkas pengujian (453 tes) lulus 100%.

## Proposed Commit Message
`refactor(practice): unify dual-session state machine for column and story practice`
