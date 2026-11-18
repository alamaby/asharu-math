# Unifikasi State Machine Nilai Tempat (Garden & Aquarium)

Created: 2026-11-18 10:41:00

## Task / Masalah
Mengaudit dan menyatukan 20+ variabel status terpisah (`useState`) yang paralel dan redundan pada komponen manipulatif nilai tempat `MagicAppleGarden.tsx` dan `CheerfulAquarium.tsx`. Variabel-variabel tersebut meliputi kuantitas visual (`visualTens`, `visualOnes`, `visualHundreds`), status pertukaran/pembongkaran (`exchanged`, `exchangedHundred`, `opened`, `openedHundred`), fase siklus (`phase`), kolom aktif/sorotan (`activeColumn`, `highlight`), jawaban digit (`onesAnswer`, `tensAnswer`, `hundredsAnswer`), status salah per kolom (`wrongOnes`, `wrongTens`, `wrongHundreds`), percobaan gagal (`wrongAttempts`), feedback, dan tutorial.
Sebelumnya, pergantian soal memicu 18 pemanggilan setter berurutan di dalam `useEffect` yang memerlukan `/* eslint-disable react-hooks/set-state-in-effect */`, berisiko menimbulkan cascading renders dan partial updates.

## Berkas Penting yang Diubah / Dibuat
- [src/lib/placeValueWorldMachine.ts](file:///C:/Works/github.com/alamaby/asharu-math/src/lib/placeValueWorldMachine.ts): Mesin status terpadu murni (`placeValueWorldReducer`) dan pabrik status awal (`createInitialPlaceValueWorldState`) dengan aksi-aksi atomik (`RESET`, `START_ANIMATION`, `FINISH_EXCHANGE_ONES`, `FINISH_OPEN_ONES`, `FINISH_EXCHANGE_HUNDRED`, `FINISH_OPEN_HUNDRED`, `INPUT_DIGIT`, `BACKSPACE`, `CHECK_SUCCESS`, `CHECK_FAILURE`, `SELECT_COLUMN`, tutorial).
- [tests/placeValueWorldMachine.test.ts](file:///C:/Works/github.com/alamaby/asharu-math/tests/placeValueWorldMachine.test.ts): 8 unit test yang memverifikasi reset atomik, alur digit berurutan kanan-ke-kiri, backspace antar kolom, animasi pertukaran/pembongkaran, idempoten cek sukses, dan transisi tutorial.
- [src/components/garden/MagicAppleGarden.tsx](file:///C:/Works/github.com/alamaby/asharu-math/src/components/garden/MagicAppleGarden.tsx): Menggantikan 20 `useState` dengan `useReducer(placeValueWorldReducer, ...)`. Merapikan reset `problem.id` menjadi 1 aksi `RESET` atomik dan menghapus eslint suppression.
- [src/components/aquarium/CheerfulAquarium.tsx](file:///C:/Works/github.com/alamaby/asharu-math/src/components/aquarium/CheerfulAquarium.tsx): Menggantikan 20+ `useState` dengan `useReducer(placeValueWorldReducer, ...)`, menstandarkan aksi keypad, animasi kelompok ikan, dan kontrol tutorial.
- [plans/2026-11-18-explicit-state-machines-modernization.md](file:///C:/Works/github.com/alamaby/asharu-math/plans/2026-11-18-explicit-state-machines-modernization.md): Memperbarui checklist Prioritas 5 dan progress log.

## Keputusan Teknis / Bisnis
1. **Unifikasi Reducer Lintas Tema**: Kebun (apel/keranjang/peti) dan Akuarium (ikan/kelompok/tangki) memiliki matematika dan aturan nilai tempat yang 100% kongruen. Reducer `placeValueWorldReducer` menampung seluruh siklus hidup bersama tanpa mencemari logika render UI masing-masing tema.
2. **Pedagogi Input Digit Kanan ke Kiri**: Aksi `INPUT_DIGIT` secara otomatis menggeser fokus aktif dari satuan ke puluhan, lalu ke ratusan (pada soal 3-digit), dan `BACKSPACE` mundur secara teratur saat kolom saat ini kosong.
3. **Idempoten Reward**: Aksi `CHECK_SUCCESS` mengunci fase ke `'completed'` dan mencegah penggandaan skor jika anak mengetuk tombol Periksa berkali-kali.

## Asumsi / Risiko
- **Efek Samping dan Timer DOM**: Durasi animasi CSS/DOM (700ms normal, 50ms reduced motion) dan jeda penyelesaian ke parent (800ms) tetap dikelola melalui `setTimeout` pada handler komponen dan dibersihkan rapi via `clearTimers()` saat unmount/reset untuk mencegah memory leak.
- **Scene 3D Canvas**: Nilai visual tetap diteruskan murni sebagai props angka ke `GardenScene` dan `AquariumCanvas` tanpa mengubah frame-rate Three.js.

## Blocker / Open Item
- Tidak ada blocker.

## Verifikasi yang Dilakukan / Disarankan
- `npx vitest run tests/placeValueWorldMachine.test.ts` (8 passed).
- `npx vitest run tests/gardenLifecycle.test.tsx` (7 passed).
- `npx vitest run tests/aquariumLifecycle.test.tsx` (11 passed).
- `npm run typecheck` (`tsc --noEmit` lulus 100% tanpa error).
- `npm test` (65 test files, 462 tests lulus 100%).

## Proposed Conventional Commit
`refactor(math): unify place value world state machine for garden and aquarium`

## Link Terkait
- Plan: [plans/2026-11-18-explicit-state-machines-modernization.md](file:///C:/Works/github.com/alamaby/asharu-math/plans/2026-11-18-explicit-state-machines-modernization.md)
