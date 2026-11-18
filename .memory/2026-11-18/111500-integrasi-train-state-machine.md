# Integrasi Explicit Train State Machine ke TrainScreen

Tanggal: 2026-11-18 11:15:00
Topik: `refactor(train): connect explicit train state machine transitions in train screen`

## Task / Masalah
Modul `src/lib/trainStateMachine.ts` telah mendefinisikan tabel transisi lengkap (14 status fase) dan fungsi validasi `transitionTrain`. Namun sebelumnya, implementasi di `TrainScreen.tsx` mengabaikan mesin status ini dan memanggil `setPhase(...)` secara langsung dengan nilai string sembarang, sehingga transisi ilegal tidak terproteksi dan alur fase (seperti pause/resume/answer) tidak terverifikasi secara deterministik.

## Berkas yang Diubah
- `src/lib/trainStateMachine.ts`: Menambahkan event `READY_FOR_ANSWER` (transisi `APPROACHING_JUNCTION -> WAITING_FOR_ANSWER`), penanganan keluar dari pause (`QUIT_TO_MENU`, `RETRY`, `START`), penanganan `WAITING_FOR_ANSWER:LOAD_FAIL -> ERROR`, serta komentar proses bisnis pedagogis.
- `src/screens/TrainScreen.tsx`: Menghubungkan transisi melalui helper `sendEvent(event)` yang memanggil `transitionTrain(current, event)` dan menyinkronkan `phaseRef.current`. Mengganti seluruh raw `setPhase` pada handler UI/animasi dengan event semantik.
- `tests/trainStateMachine.test.ts`: Menambahkan tes transisi baru (`READY_FOR_ANSWER`, quit/retry dari paused).
- `tests/screens/TrainScreenLifecycle.test.tsx`: Integrasi test lifecyle TrainScreen (start -> pause -> unpause/resume, dsb).
- `plans/2026-11-18-explicit-state-machines-modernization.md`: Update task dan progress log.

## Keputusan Teknis & Bisnis
- Mengubah penjagaan lemparan `PAUSED` di `trainStateMachine.ts`: alih-alih melempar error pada *setiap* aksi saat berstatus `PAUSED`, guard dibatasi khusus `from === 'PAUSED' && event === 'RESUME'` karena resume memerlukan pemulihan `prePausePhase`. Aksi navigasi lain seperti `QUIT_TO_MENU`, `RETRY`, dan `START` diizinkan keluar dari kondisi pause secara langsung dan aman.
- Menjaga sinkronisasi ganda antara React state `phase` dan instance scene Three.js melalui `phaseRef.current` yang di-update tepat saat `sendEvent` dieksekusi.

## Verifikasi
- `npm run typecheck` (`tsc --noEmit`): 0 error.
- `npx vitest run tests/trainStateMachine.test.ts tests/screens/TrainScreenLifecycle.test.tsx`: 7/7 tes lulus.
- Seluruh rangkaian test suite (`npm test`): 66 test files, 464 tests lulus 100%.

## Proposed Commit Message
`refactor(train): connect explicit train state machine transitions in train screen`
