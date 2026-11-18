# Unifikasi Mesin Kuis Terpadu (`questionSessionMachine` & `useQuestionSession`)

- **Tanggal / Waktu**: 2026-11-18 09:35:00 (WIB)
- **Status**: Selesai
- **Terkait**: Prioritas 2 dari [plans/2026-11-18-explicit-state-machines-modernization.md](file:///C:/Works/github.com/alamaby/asharu-math/plans/2026-11-18-explicit-state-machines-modernization.md)

## Masalah / Latar Belakang
`ConceptLearnScreen.tsx` (soal konsep pilihan ganda) dan `StoryLearnScreen.tsx` (soal cerita input keypad numerik) sebelumnya memiliki logika siklus hidup sesi kuis yang diduplikasi secara implisit:
1. State tersebar di banyak variabel terpisah (`index`, `interim`, `attempts`, `wrongInPart`, `feedback`, `locked`, `results`, `finished`).
2. Efek samping `window.setTimeout` rentan terhadap *timer leak* atau *race condition* saat perpindahan soal berlangsung cepat (*rapid tap*).
3. Di `StoryLearnScreen.tsx`, tombol bantuan hitung bersusun (`switchToGuided`) lupa membersihkan `leaveGuard`, sehingga memicu dialog keluar (*exit dialog*) alih-alih berpindah langsung ke `LearnScreen`.

## Perubahan Teknis
1. **Pure Reducer Mesin Kuis (`src/lib/questionSessionMachine.ts`)**:
   - Mendefinisikan discriminated union state phase: `'answering' | 'showing_correct' | 'showing_wrong' | 'showing_reveal' | 'completed'`.
   - Menjamin transisi state deterministik untuk aksi `digit`, `backspace`, `set_interim`, `submit`, `unlock`, dan `advance`.
   - Mengakumulasi metadata statistik percobaan salah (`wrongAttempts`) dan jawaban per item secara *immutable*.
2. **Custom Hook React (`src/hooks/useQuestionSession.ts`)**:
   - Membungkus reducer dengan manajemen timer otomatis (`advanceDelayMs`, `revealDelayMs`, `unlockDelayMs`).
   - Sinkronisasi efek suara ramah anak (`playCorrect`, `playWrong`) terpadu sesuai status feedback.
   - Mengisolasi penanganan penyelesaian sesi (`onComplete`) tanpa *double-invoke*.
3. **Refaktorisasi Layar UI**:
   - `src/screens/ConceptLearnScreen.tsx`: Beralih menggunakan `useQuestionSession`, menghilangkan mutable ref dan variabel state ad-hoc.
   - `src/screens/StoryLearnScreen.tsx`: Beralih menggunakan `useQuestionSession`, memperbaiki pemanggilan `setLeaveGuard(null)` pada transisi bantuan bersusun (`switchToGuided`), dan merapikan integrasi dengan `NumericKeypad`.
4. **Pengujian Menyeluruh**:
   - `tests/questionSessionMachine.test.ts`: 10 unit test memverifikasi alur state machine murni.
   - `tests/screens/ConceptLearnScreen.test.tsx`: 5 tes integrasi layar konsep (jawaban benar, salah, reveal 3x salah, dan navigasi result).
   - `tests/screens/StoryLearnScreen.test.tsx`: 4 tes integrasi layar cerita (keypad, auto-advance, wrong attempt, dan transisi ke bantuan bersusun).

## Verifikasi
- `npm run typecheck` (`tsc --noEmit`): 0 error.
- `npm test`: 62 berkas pengujian (438 tes) lulus 100%.

## Proposed Commit Message
`refactor(quiz): extract unified question session machine for concept and story`
