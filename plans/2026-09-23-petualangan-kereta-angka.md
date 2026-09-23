# Petualangan Kereta Angka — Implementation Plan (atomik, deterministik)

Created: 2026-09-23 14:00:00

## Objective

Implementasikan mini game "Petualangan Kereta Angka" (Three.js) sebagai screen baru `train`: anak kelas 1-3 membantu kereta mencapai stasiun dengan memilih rel berjawaban benar. 5 soal per sesi, 3 cabang (kiri/tengah/kanan), bintang 3/2/1, hint setelah 2 salah, audio mute, a11y penuh, fallback 2D, responsive. Logika matematika pure + teruji; scene Three.js terisolasi; lifecycle bersih.

Keputusan pengguna yang sudah final (jangan tanyakan ulang): rentang K3 = tambah/kurang ≤1000, kali 1×1 (2–9), bagi dari tabel kali, banding ≤500; entry = tombol Home + screen `train` (tanpa tab baru); render = Three.js murni (tanpa @react-three/fiber) khusus scene kereta.

## Scope

- In scope: 11 file sumber baru + 4 file test baru + 5 file diubah (Navigation, App, Home, i18n id/en). Detail di langkah S1–S12.
- Out of scope (dilarang): backend, login, analytics baru, multiplayer, leaderboard, payment, iklan baru, toko virtual, physics engine, post-processing, shader kompleks, model besar, perubahan `LEVELS`/`GradeLevel` global, perubahan `starsFor`/`STORAGE_KEY` existing, tab bawah baru.

## Milestones

1. M1 logika murni + test (S1–S5) — tanpa Three.js.
2. M2 integrasi navigasi + i18n (S6–S7).
3. M3 scene + canvas + fallback (S8–S9).
4. M4 DOM gameplay + screen orkestrasi (S10–S11).
5. M5 verifikasi penuh + handoff (S12–S13).

## Tasks

- [x] S0 konfirmasi audit (read-only)
- [x] S1 generator soal train
- [x] S2 bintang train
- [x] S3 state machine train
- [x] S4 storage train
- [x] S5 audio train
- [x] S6 i18n keys train
- [x] S7 navigasi + App + Home entry
- [x] S8 TrainScene (Three murni)
- [x] S9 TrainCanvas + Fallback2D + test
- [x] S10 komponen DOM (Menu/HUD/QuestionDialog)
- [x] S11 TrainScreen orkestrasi + hasil
- [x] S12 test integrasi + optimasi
- [x] S13 verifikasi akhir + handoff

## Risks

- R1: jsdom tidak ada WebGL — mitigasi: semua logika diuji tanpa WebGL; scene tidak di-import di test logika.
- R2: StrictMode double-mount menggandakan loop — mitigasi: guard init/dispose di S9, diverifikasi restart 3×.
- R3: Regresi i18n/Navigation — mitigasi: hanya tambah key/varian, tidak ubah tipe existing; `npm run typecheck` + test i18n existing harus hijau.
- R4: Bundle membesar — mitigasi: tanpa dep baru; `three` sudah di manualChunks; cek `npm run build` warning.
- R5: Model kecil menyimpang dari API — mitigasi: tanda tangan fungsi exact di tiap langkah; jangan improvisasi nama.

## Requirement Traceability Matrix

| Req | Deskripsi | Langkah | Verifikasi |
|-----|-----------|---------|------------|
| R1 | Lingkungan low-poly pedesaan | S8 | review visual + console, mesh count <60 |
| R2 | Kereta + gerbong | S8 | visual + dispose test manual |
| R3 | 1 lintasan utama + 3 cabang | S8 | `mainCurve` + `branchCurves[3]` ada, uji gerak |
| R4 | 3 papan/tombol jawaban | S9, S10 | DOM 3 tombol + papan 3D cermin |
| R5 | Pilihan kelas 1,2,3 | S1, S10 | test range per grade |
| R6 | Tambah/kurang/kali/bagi/banding per grade | S1 | test R6a–R6e |
| R7 | 5 soal per sesi | S1, S11 | `generateTrainSession(g,5).length===5` |
| R8 | Sistem bintang 3/2/1, tanpa negatif | S2 | test S2 |
| R9 | Bantuan visual setelah 2 salah | S10, S11 | test + manual |
| R10 | localStorage progres | S4 | test S4 |
| R11 | Audio dapat dimatikan | S5, S10 | manual toggle + persist |
| R12 | Keyboard, touch, ARIA live, reduced motion | S9, S10, S11 | manual keyboard + axe-lite visual |
| R13 | Fallback 2D tanpa WebGL | S9 | matikan WebGL → playable |
| R14 | Responsive mobile+desktop | S9, S10 | 360px + desktop |
| RC | Curve3 + delta time; idx0=kiri,1=tengah,2=kanan; acak posisi benar | S1, S8 | test shuffle + review kode |
| RG | Geometri bawaan saja; cap pixelRatio/shadow/draw calls | S8 | review kode, dpr≤1.5, shadow off |
| RF | Copy benar/salah exact; larang "gagal" | S6, S10 | grep test |
| RL | Lifecycle bersih (1 loop, cancel, listener, dispose) | S8, S9 | restart 3× + console |
| RT | Test: range, nonneg, bagi bulat, 3 unik, 1 benar, transisi, bintang | S1, S2, S3 | vitest |
| RD | DOM untuk soal/tombol/progres/dialog (bukan teks WebGL saja) | S10 | canvas aria-hidden + DOM ada |

---

## S0 — Konfirmasi audit (read-only, tanpa ubah file)

- Tujuan langkah: mengunci asumsi arsitektur agar langkah berikut deterministik.
- Finding/requirement: fondasi R1–R14 + RC/RG/RL/RD.
- Dependency: tidak ada.
- File yang harus dibaca (6 file, baca penuh sebelum lanjut):
  1. `src/state/NavigationContext.tsx` (tipe `Screen`, `TAB_SCREENS`, `setLeaveGuard`)
  2. `src/App.tsx` (case `ScreenRouter`, pola `lazy` Aquarium)
  3. `src/types/index.ts` (jangan perluas `GradeLevel`; buat tipe train lokal)
  4. `src/lib/storage.ts` (`STORAGE_KEY='asharu-math:v1'`, `validateProgress` — jangan ubah)
  5. `src/lib/scoring.ts` (`starsFor` rasio — jangan ubah; buat fungsi train baru)
  6. `src/components/aquarium/AquariumCanvas.tsx` (pola `hasWebGL`, `CanvasFallback role="alert"`, `dpr={[1,1.5]}`, `powerPreference:'low-power'`, pause saat hidden)
- File yang harus diubah: tidak ada.
- Simbol terkait: `Screen`, `NavigationProvider`, `SessionSummary`, `starsFor`, `hasWebGL`.
- Kondisi saat ini: React 18 + TS strict + Vite 6 + Tailwind v4; npm; Vitest jsdom `tests/**/*.test.{ts,tsx}`; CI lint→typecheck→test→build; PWA manualChunks `three`/`fiber` sudah ada.
- Perubahan konkret: tidak ada perubahan kode.
- Behavior dipertahankan: seluruh app.
- Error/edge: tidak ada.
- Test: tidak ada.
- Command verifikasi: tidak ada (jangan jalankan build/test di S0).
- Completion criteria: pelaksana dapat menyebut tanpa melihat ulang: (a) tambah screen = tambah varian `Screen` + case router + tombol Home; (b) train pakai storage key baru; (c) train pakai fungsi bintang baru.
- Tidak boleh diubah: semua file.

---

## S1 — Generator soal train (pure, tanpa three/react)

- Tujuan: `src/lib/trainQuestionGenerator.ts` pure + teruji; 5 soal/sesi; 3 pilihan unik; 1 benar; acak posisi benar.
- Requirement: R5, R6, R7, RC (acak posisi), RT (range, nonneg, bagi bulat, 3 unik, 1 benar).
- Dependency: S0.
- File yang harus dibaca: `src/lib/problemGenerator.ts` (pola `randomInt`, anti-duplikat berurutan), `src/lib/conceptGenerator.ts` (pola `shuffle`, distraktor tepi), `tests/problemGenerator.test.ts` (pola loop 200–300 iterasi).
- File yang harus diubah (dibuat): `src/lib/trainQuestionGenerator.ts` (baru). Jangan ubah file lain.
- Simbol yang harus dibuat (nama exact, jangan improvisasi):
  ```ts
  export type TrainGrade = 1 | 2 | 3;
  export type TrainTopic = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'comparison';
  export interface TrainQuestion { id: string; grade: TrainGrade; topic: TrainTopic; prompt: string; choices: [string, string, string]; correctIndex: 0 | 1 | 2; correctValue: string; hintText: string; }
  export function generateTrainQuestion(grade: TrainGrade, topic?: TrainTopic): TrainQuestion;
  export function generateTrainSession(grade: TrainGrade, count?: number): TrainQuestion[];
  export const _trainHelpers: { buildAdditionQuestion; buildSubtractionQuestion; buildMultiplicationQuestion; buildDivisionQuestion; buildComparisonQuestion; makeChoices; shuffle3; randomInt };
  ```
- Kondisi saat ini: file belum ada.
- Perubahan konkret (urut):
  1. Buat `id` via counter + `Math.random().toString(36).slice(2,8)` (tirukan `problemGenerator.ts:6-11`).
  2. Implementasi `randomInt(min,max)` inklusif; `shuffle3` Fisher-Yates untuk 3 elemen.
  3. `makeChoices(correct: string, distractors: string[])`: filter `d !== correct`, unik via `Set`, ambil 2 pertama yang valid; jika kurang, bangkitkan `correct±1,±2,±10` (angka) atau simbol sisa (banding); lalu shuffle; return `{choices, correctIndex}`. Jamin `choices.length===3`, unik, tepat 1 sama dengan correct.
  4. Rentang exact per grade (jangan ubah tanpa blocker):
     - K1 addition: a 1–9, b 1–9, `carryMode none` (a+b ≤10 lebih disukai; tolak a+b>18, coba ulang ≤50x); prompt `${a} + ${b}`.
     - K1 subtraction: a 2–10, b 1–a (jamin a≥b, hasil ≥0); prompt `${a} − ${b}` (gunakan U+2212).
     - K1 comparison: a,b 1–20; expected salah satu dari `>`,`<`,`=`; prompt `${a} ? ${b}` + hint "pilih tanda yang benar".
     - K1 tidak ada multiplication/division (jika topic diminta, fallback ke addition dan catat di hint).
     - K2 addition/subtraction: 2-digit 10–99, `any`; hasil tambah ≤199; kurang a≥b.
     - K2 multiplication: a 2–5, b 2–5; prompt `${a} × ${b}`.
     - K2 comparison: 1–100.
     - K3 addition/subtraction: a,b 100–999 untuk tambah (hasil ≤1998) dan 100–999 kurang (a≥b); prompt sama.
     - K3 multiplication: a 2–9, b 2–9.
     - K3 division (wajib bulat): pilih d 2–9, q 2–9, n=d*q; prompt `${n} ÷ ${d}`, correct `q`.
     - K3 comparison: 1–500.
  5. `hintText` per topik (contoh exact): tambah "Hitung dari angka besar, maju sedikit demi sedikit."; kurang "Kurangi pelan-pelan, boleh pakai jari."; kali "Ingat perkalian sebagai penjumlahan berulang."; bagi "Cari angka yang dikali pembagi menghasilkan depan."; banding "Bandingkan puluhannya dulu, lalu satuannya.".
  6. `generateTrainQuestion(grade, topic?)`: jika topic undefined, pilih acak dari pool grade (K1: [addition,subtraction,comparison]; K2: +multiplication; K3: semua 5). Hindari duplikat prompt berurutan di level session (bandingkan dengan previous di `generateTrainSession`).
  7. `generateTrainSession(grade, count=5)`: loop count, teruskan previous untuk anti-duplikat; kembalikan tepat `count`.
- Urutan perubahan di file: tipe → helper random/shuffle → makeChoices → 5 builder → generateTrainQuestion → generateTrainSession → _trainHelpers export.
- Behavior dipertahankan: tidak menyentuh generator existing; K1 fallback kali/bagi→tambah harus deterministik (jangan throw).
- Error/edge: distraktor duplikat → regenerasi; kehabisan kandidat tepi (jawaban 0/1) → pakai ±10/+3; `count<=0` → default 5; grade invalid (runtime JS) → throw `Error('TrainGrade tidak valid')`.
- Test yang harus ditambahkan: `tests/trainQuestionGenerator.test.ts` (baru), pola tiru `tests/problemGenerator.test.ts`:
  - T1 range K1 (200 iterasi): addition operan 1–9; subtraction `first>=second`, hasil ≥0; comparison 1–20.
  - T2 range K2 (200): tambah/kurang 10–99; kali 2–5×2–5.
  - T3 range K3 (300): tambah/kurang 100–999; kali 2–9; division `n % d === 0` dan `correct === n/d`; comparison 1–500.
  - T4 tiga pilihan unik (500 iterasi acak grade/topik): `choices.length===3`, `new Set(choices).size===3`.
  - T5 satu jawaban benar (500): tepat 1 `choices[i]===correctValue`, dan `choices[correctIndex]===correctValue`.
  - T6 acak posisi (500 session): distribusi `correctIndex` memuat 0,1,2 masing-masing >15% (flakiness guard: seed-independent, threshold longgar).
  - T7 session: `generateTrainSession(1,5).length===5`, tidak ada prompt identik berurutan.
  - Input/expected contoh: `buildSubtractionQuestion(1, 3, 8)` harus menormalisasi agar tidak negatif (swap atau regenerasi) — expected `prompt` memuat angka besar dulu dan `correct>=0`. `_trainHelpers.buildDivisionQuestion(3)` expected `parseInt(prompt.split('÷')[0]) % divisor === 0`.
- Command verifikasi: `npm test -- tests/trainQuestionGenerator.test.ts` lalu `npm run typecheck`.
- Hasil verifikasi diharapkan: semua T1–T7 hijau; typecheck 0 error.
- Completion criteria: file ada, API exact, semua test hijau, tidak ada import `three`/`react` di file ini (cek via grep `from 'three'` kosong).
- Tidak boleh diubah: `src/lib/problemGenerator.ts`, `conceptGenerator.ts`, `scoring.ts`, `src/types/index.ts`, `vite.config.ts`, test existing.

---

## S2 — Bintang train (pure)

- Tujuan: `src/lib/trainStars.ts` aturan 3/2/1 tanpa negatif.
- Requirement: R8 + RT (penghitungan bintang).
- Dependency: S0 (independen dari S1, boleh paralel setelah S0).
- File yang harus dibaca: `src/lib/scoring.ts` (8 baris — pahami lalu jangan ubah).
- File yang harus diubah (dibuat): `src/lib/trainStars.ts`.
- Simbol exact:
  ```ts
  export function starsForTrainAttempt(attempt: number): 1 | 2 | 3;
  export function sumTrainStars(attempts: readonly number[]): number;
  export const TRAIN_MAX_STARS_PER_QUESTION = 3;
  ```
- Kondisi saat ini: file belum ada; `starsFor` existing berbasis rasio sesi.
- Perubahan konkret:
  1. `starsForTrainAttempt(attempt)`: `attempt<=1→3`, `===2→2`, `>=3→1`; untuk `attempt<=0` atau NaN → perlakukan sebagai 1 (return 3) agar tidak ada 0/negatif; `Infinity` → 1.
  2. `sumTrainStars(attempts)`: `reduce Nakamura` — jumlahkan `starsForTrainAttempt(a)` per elemen; array kosong → 0.
- Behavior dipertahankan: `scoring.ts` tidak berubah.
- Edge: attempt pecahan (1.5) → `Math.ceil` dulu; attempt >10 → 1.
- Test baru `tests/trainStars.test.ts`:
  - `starsForTrainAttempt(1)===3`, `(2)===2`, `(3)===1`, `(4)===1`, `(0)===3`, `(99)===1`.
  - `sumTrainStars([1,1,1,1,1])===15`; `([1,2,3,2,1])===3+2+1+2+3=11`; `([])===0`.
  - Tidak ada skor negatif: untuk attempts 1..10 semua return ≥1.
- Verifikasi: `npm test -- tests/trainStars.test.ts`, `npm run typecheck`.
- Completion: test hijau; grep `starsFor` existing tidak berubah.
- Jangan ubah: `src/lib/scoring.ts`, test `scoring.test.ts`.

---

## S3 — State machine train (pure)

- Tujuan: `src/lib/trainStateMachine.ts` 14 state eksplisit + transisi teruji.
- Requirement: state list exact dari brief + RT (transisi).
- Dependency: S0.
- File dibaca: tidak ada file existing yang setara (ini baru); baca `src/state/NavigationContext.tsx:46-63` hanya untuk memahami pola guard (jangan tiru event-nya).
- File dibuat: `src/lib/trainStateMachine.ts`.
- Simbol exact:
  ```ts
  export type TrainState = 'LOADING'|'MENU'|'INTRO'|'TRAIN_MOVING'|'APPROACHING_JUNCTION'|'WAITING_FOR_ANSWER'|'CHECKING_ANSWER'|'SHOWING_HINT'|'SWITCHING_TRACK'|'TRAVELLING_TO_STATION'|'ROUND_COMPLETE'|'SESSION_COMPLETE'|'PAUSED'|'ERROR';
  export type TrainEvent = 'LOAD_OK'|'LOAD_FAIL'|'START'|'INTRO_DONE'|'ARRIVE_JUNCTION'|'ANSWER'|'CHECK_OK'|'CHECK_WRONG'|'HINT_SHOWN'|'HINT_DONE'|'SWITCH_DONE'|'ARRIVE_STATION'|'NEXT_ROUND'|'FINISH'|'PAUSE'|'RESUME'|'RETRY'|'QUIT_TO_MENU';
  export const TRAIN_TRANSITIONS: Record<TrainState, readonly TrainState[]>;
  export function canTransition(from: TrainState, to: TrainState): boolean;
  export function transitionTrain(from: TrainState, event: TrainEvent): TrainState;
  export function initialTrainState(): TrainState; // 'LOADING'
  ```
- Perubahan konkret (tabel transisi exact — implementasi harus sama persis):
  - LOADING → [MENU, ERROR] (LOAD_OK→MENU, LOAD_FAIL→ERROR)
  - MENU → [INTRO] (START→INTRO)
  - INTRO → [TRAIN_MOVING] (INTRO_DONE)
  - TRAIN_MOVING → [APPROACHING_JUNCTION, PAUSED, ERROR]
  - APPROACHING_JUNCTION → [WAITING_FOR_ANSWER, PAUSED]
  - WAITING_FOR_ANSWER → [CHECKING_ANSWER, PAUSED] (ANSWER)
  - CHECKING_ANSWER → [SWITCHING_TRACK, WAITING_FOR_ANSWER, SHOWING_HINT] (CHECK_OK→SWITCHING, CHECK_WRONG→WAITING atau SHOWING_HINT — keputusan di TrainScreen berdasarkan attempt count, mesin hanya izinkan keduanya)
  - SHOWING_HINT → [WAITING_FOR_ANSWER] (HINT_DONE)
  - SWITCHING_TRACK → [TRAVELLING_TO_STATION] (SWITCH_DONE)
  - TRAVELLING_TO_STATION → [ROUND_COMPLETE] (ARRIVE_STATION)
  - ROUND_COMPLETE → [TRAIN_MOVING, SESSION_COMPLETE] (NEXT_ROUND jika ronde<5, FINISH jika ronde==5)
  - SESSION_COMPLETE → [MENU] (QUIT_TO_MENU atau RETRY→INTRO? tetapkan: RETRY→INTRO, QUIT_TO_MENU→MENU)
  - PAUSED → [TRAIN_MOVING, WAITING_FOR_ANSWER, MENU] (RESUME kembali ke `pausedFrom` — sederhanakan: simpan `pausedFrom` di screen, mesin izinkan RESUME→keduanya; implementasi `transitionTrain` untuk PAUSED+RESUME butuh argumen? Tetapkan: `transitionTrain('PAUSED','RESUME')` throw dan wajib pakai `resumeTrain(pausedFrom)` helper. Tambahkan `export function resumeTrain(pausedFrom: TrainState): TrainState` yang return pausedFrom jika termasuk [TRAIN_MOVING, WAITING_FOR_ANSWER, APPROACHING_JUNCTION] else throw.)
  - ERROR → [MENU, LOADING] (QUIT_TO_MENU, RETRY)
  - PAUSE dari state gerak mana pun yang diizinkan → PAUSED; selain itu throw.
  - `transitionTrain` throw `Error('Transisi train tidak valid: FROM + EVENT')` untuk kombinasi tak terdaftar; jangan return silent.
- Urutan dalam file: tipe → tabel → canTransition → transitionTrain (+ peta event→target) → resumeTrain → initialTrainState.
- Edge: event di PAUSED selain RESUME/QUIT_TO_MENU → throw; `canTransition` pure tanpa efek.
- Test baru `tests/trainStateMachine.test.ts`:
  - Happy path 5 ronde: LOADING→MENU→INTRO→TRAIN_MOVING→APPROACHING→WAITING→CHECKING→SWITCHING→TRAVELLING→ROUND_COMPLETE (NEXT_ROUND) … FINISH→SESSION_COMPLETE.
  - Salah 1×: CHECKING→WAITING diizinkan; salah 2×: CHECKING→SHOWING_HINT diizinkan; SHOWING_HINT→WAITING.
  - PAUSE/RESUME: TRAIN_MOVING→PAUSED→(resumeTrain)→TRAIN_MOVING; WAITING→PAUSED→WAITING.
  - Invalid: `transitionTrain('MENU','CHECK_OK')` throw; `canTransition('MENU','TRAIN_MOVING')===false`.
  - Semua 14 state muncul di `TRAIN_TRANSITIONS` keys (Object.keys length 14).
- Verifikasi: `npm test -- tests/trainStateMachine.test.ts`, `npm run typecheck`.
- Completion: tabel exact, test hijau.
- Jangan ubah: `NavigationContext.tsx`, test lain.

---

## S4 — Storage train (localStorage terpisah)

- Tujuan: `src/lib/trainStorage.ts` persist progres tanpa migrasi UserProgress.
- Requirement: R10.
- Dependency: S0.
- File dibaca: `src/lib/storage.ts` (pola `isRecord`, `getStorage`, try/catch JSON, `todayString` tidak perlu ditiru penuh — cukup validasi).
- File dibuat: `src/lib/trainStorage.ts`.
- Simbol exact:
  ```ts
  export const TRAIN_STORAGE_KEY = 'asharu-train:v1';
  export interface TrainProgress { version: 1; bestStarsByGrade: Record<string, number>; sessionsCompleted: number; lastGrade: 1 | 2 | 3 | null; soundEnabled: boolean; }
  export function defaultTrainProgress(): TrainProgress;
  export function validateTrainProgress(v: unknown): TrainProgress | null;
  export function loadTrainProgress(s?: Storage | null): TrainProgress;
  export function saveTrainProgress(p: TrainProgress, s?: Storage | null): boolean;
  export function recordTrainSession(p: TrainProgress, grade: 1|2|3, stars: number): TrainProgress;
  ```
- Perubahan konkret:
  1. `defaultTrainProgress()` return `{version:1, bestStarsByGrade:{}, sessionsCompleted:0, lastGrade:null, soundEnabled:true}`.
  2. `validateTrainProgress`: cek record, version===1, bestStarsByGrade values 0–15 finite, sessionsCompleted ≥0 integer, lastGrade null|1|2|3, soundEnabled boolean; selain itu null. Normalisasi: hapus key grade asing.
  3. `loadTrainProgress(storage?)`: default `window.localStorage` guarded try/catch (tirukan `getStorage`); parse JSON; invalid → default. Signature menerima `StorageLike | null` agar test bisa inject memory storage (tirukan interface `StorageLike` dari storage.ts, jangan import tipe DOM saja).
  4. `saveTrainProgress`: `setItem(KEY, JSON.stringify)` try/catch → boolean.
  5. `recordTrainSession`: `sessionsCompleted+1`, `lastGrade=grade`, `bestStarsByGrade[String(grade)]=max(lama, stars)`; jangan mutasi input (return objek baru).
- Edge: quota exceeded → return false; JSON rusak → default; version mismatch → default.
- Test `tests/trainStorage.test.ts`: default shape; roundtrip save→load 15 bintang; best tidak turun (`record(grade1,10)` lalu `record(grade1,8)` tetap 10); invalid (version 2, stars -1, lastGrade 9) → validate null / load default; storage null → load default, save false.
- Verifikasi: `npm test -- tests/trainStorage.test.ts`, typecheck.
- Jangan ubah: `src/lib/storage.ts` (`STORAGE_KEY`, `CURRENT_VERSION`), `ProgressContext.tsx`.

---

## S5 — Audio train (bungkus sound existing)

- Tujuan: `src/lib/trainSound.ts` sfx tanpa file besar, hormati mute.
- Requirement: R11.
- Dependency: S0.
- File dibaca: `src/lib/sound.ts` (fungsi `playTap/playCorrect/playWrong/playCelebrate`, `setSoundEnabled`), `src/lib/aquariumSound.ts` (pola `speak` opsional — untuk MVP jangan pakai TTS, hanya sfx).
- File dibuat: `src/lib/trainSound.ts`.
- Simbol exact:
  ```ts
  export function playTrainClick(): void; export function playTrainCorrect(): void; export function playTrainWrong(): void; export function playTrainHint(): void; export function playTrainCelebrate(): void; export function stopTrainAudio(): void;
  ```
- Perubahan konkret: setiap play* delegasi ke `sound.ts` (`playTrainCorrect→playCorrect`, `playTrainWrong→playWrong`, `playTrainCelebrate→playCelebrate`, `playTrainClick/playTrainHint→playTap`); `stopTrainAudio()` no-op aman (tidak ada loop audio) + `speechSynthesis.cancel` guarded jika ada (tirukan `cancelSpeech` tanpa mengimpor state). Jangan buat AudioContext baru; jangan tambah dep.
- Mute: jangan simpan flag di modul ini; call site membaca `TrainProgress.soundEnabled` / `ProgressContext.soundEnabled` dan skip panggil jika false. Dokumentasikan di komentar file.
- Edge: `window` undefined (SSR/test) → return diam; exception → swallow.
- Test: tidak ada unit audio (jsdom tanpa AudioContext stabil); verifikasi via S12 manual + pastikan file tidak throw saat import di test (tambahkan 1 smoke test di `tests/trainStorage.test.ts`? Tidak — buat `tests/trainSound.test.ts` 1 case: import semua fungsi dan panggil, expected tidak throw).
- Verifikasi: `npm test -- tests/trainSound.test.ts`, typecheck.
- Jangan ubah: `sound.ts`, `aquariumSound.ts`.

---

## S6 — i18n keys train (ID + EN)

- Tujuan: semua string train terpusat, copy exact, larang kata "gagal".
- Requirement: RF + seluruh DOM copy.
- Dependency: S0.
- File dibaca: `src/i18n/dicts/id.ts` (format `‘key’: string | fn`), `src/i18n/dicts/en.ts`, `src/i18n/core.ts` (cara `createT` resolve key — baca sebelum tambah key).
- File diubah: `src/i18n/dicts/id.ts` (tambah blok `// Kereta Angka` di akhir objek sebelum tutup), `src/i18n/dicts/en.ts` (kunci sama persis).
- Perubahan konkret (tambah exact keys, nilai ID exact):
  - `train.title`: 'Petualangan Kereta Angka'
  - `train.subtitle`: 'Bantu kereta sampai ke stasiun!'
  - `train.selectGrade`: 'Pilih kelas'
  - `train.grade1`: 'Kelas 1', `train.grade2`: 'Kelas 2', `train.grade3`: 'Kelas 3'
  - `train.start`: '🚂 Berangkat!'
  - `train.correct`: 'Hebat! Jawabanmu benar.'
  - `train.retry`: 'Hampir benar, coba lagi.'
  - `train.hintTitle`: 'Petunjuk'
  - `train.questionOf`: (p:{n:number;total:number}) => `Soal ${p.n} dari ${p.total}`
  - `train.starsAria`: (p:{stars:number}) => `Bintang: ${p.stars}`
  - `train.paused`: 'Jeda', `train.resume`: 'Lanjutkan', `train.restart`: 'Mulai lagi', `train.quit`: 'Keluar', `train.station`: 'Stasiun 🎉', `train.sessionDone`: 'Perjalanan selesai!'
  - `train.mute`: 'Matikan suara', `train.unmute`: 'Nyalakan suara'
  - `train.fallbackMsg`: 'Perangkat ini tidak mendukung 3D. Tetap bisa bermain dalam mode 2D ya.'
  - `train.chooseBranchAria`: (p:{answer:string}) => `Pilih jalur dengan jawaban ${p.answer}`
  - EN mirror (translate natural, copy correct/retry: 'Great! Your answer is correct.' / 'Almost there, try again.').
- Urutan: tambah di akhir tiap dict, urut alfabetis dalam blok train.
- Behavior: `createT` fallback tidak berubah; jangan hapus key lama.
- Edge: fungsi interpolasi harus type-safe (ikuti pola `home.greetingName`).
- Test: tidak ada test baru; verifikasi via `npm run typecheck` + grep `gagal` di `src/i18n/dicts/*train*` harus kosong (case-insensitive, kecuali komentar).
- Completion: kedua file punya key identik (diff key sets kosong).
- Jangan ubah: `LanguageContext.tsx`, `core.ts`, key non-train.

---

## S7 — Navigasi + App + entry Home

- Tujuan: screen `train` dapat dibuka dari Home tanpa tab baru, dengan leave-guard.
- Requirement: fondasi R4–R14 (routing).
- Dependency: S6 (untuk label tombol; kode tidak strict, tapi urutkan setelah S6).
- File dibaca: `src/state/NavigationContext.tsx:19-38` (union `Screen`), `src/App.tsx:23-73` (ScreenRouter + lazy), `src/screens/HomeScreen.tsx:119-159` (tombol aksi), `src/screens/GardenScreen.tsx:20-55` (pola leave-guard + exit dialog).
- File diubah (3 file, urut):
  1. `src/state/NavigationContext.tsx`: tambah varian `| { name: 'train' }` di akhir union `Screen` (setelah terms). Jangan tambah `TabName`; jangan ubah `TAB_SCREENS`, `perform`, guard logic.
  2. `src/App.tsx`: tambah `const TrainScreen = lazy(() => import('./screens/TrainScreen'))` di samping AquariumScreen (baris ~21); tambah case `case 'train': return (<Suspense fallback={...‘Memuat kereta…'}><TrainScreen /></Suspense>)`. Fallback text exact 'Memuat kereta…'.
  3. `src/screens/HomeScreen.tsx`: tambah tombol setelah tombol garden (setelah baris `tryGarden`): `onClick={() => navigate({ name: 'train' })}`, class tiru tombol garden tapi `border-amber-600 bg-amber-400` agar beda, label `{t('train.title')} 🚂`, `aria-label` sama. Jangan ubah tombol lain.
- Behavior dipertahankan: back-stack, BottomNavigation mapping (train → `currentTab null`, tidak highlight — sama seperti garden/aquarium yang juga null; jangan tambah mapping).
- Edge: deep-link tidak ada (stack in-memory); refresh kembali ke home — diterima MVP.
- Test: tidak ada test baru; verifikasi `npm run typecheck` + `npm test -- tests/NavigationContext.test.tsx` tetap hijau.
- Completion: typecheck hijau; navigasi Home→train→back manual OK (cek di S12).
- Jangan ubah: `BottomNavigation.tsx`, `TAB_SCREENS`, `ProgressContext`, `LEVELS`.

---

## S8 — TrainScene Three.js murni (tanpa fiber)

- Tujuan: `src/components/train/TrainScene.ts` — countryside + kereta + 1 main + 3 branch curves, gerak delta-time, budget ketat, dispose penuh.
- Requirement: R1, R2, R3, RC, RG, RL (bagian scene).
- Dependency: S3 (nama state untuk callback; tidak import mesin, hanya string).
- File dibaca: `src/components/aquarium/AquariumCanvas.tsx` (budget: dpr≤1.5, low-power, fog), `src/components/aquarium/AquariumEnvironment3D.tsx` (pola reuse geometry — baca cepat untuk gaya low-poly).
- File dibuat: `src/components/train/TrainScene.ts` (class saja, tanpa JSX).
- API exact:
  ```ts
  import * as THREE from 'three';
  export type BranchIndex = 0 | 1 | 2;
  export interface TrainSceneCallbacks { onReachJunction?: () => void; onReachStation?: () => void; }
  export class TrainScene {
    constructor(canvas: HTMLCanvasElement, cb?: TrainSceneCallbacks);
    readonly mainCurve: THREE.CatmullRomCurve3; readonly branchCurves: [THREE.CatmullRomCurve3, THREE.CatmullRomCurve3, THREE.CatmullRomCurve3];
    setBranch(i: BranchIndex): void; setPaused(p: boolean): void; setReducedMotion(r: boolean): void;
    update(dt: number): void; render(): void; resize(w: number, h: number): void; dispose(): void;
    readonly trainGroup: THREE.Group; readonly trainT: number; readonly selectedBranch: BranchIndex;
  }
  ```
- Perubahan konkret (urut implementasi dalam file):
  1. Konstanta layout exact: junction di `(0,0,0)`; main dari `(0,0,18)` ke `(0,0,0)`; cabang ke `(-6,0,-14)`, `(0,0,-14)`, `(6,0,-14)` dengan titik kontrol tengah `(±3,0,-7)` agar kurva halus. `mainCurve = CatmullRomCurve3([(0,0,18),(0,0,6),(0,0,0)])`; branch[i] = `CatmullRomCurve3([(0,0,0),(cx,0,-7),(ex,0,-14)])`.
  2. Renderer: `new THREE.WebGLRenderer({canvas, antialias:true, powerPreference:'low-power'})`; `setPixelRatio(Math.min(window.devicePixelRatio||1, 1.5))`; `shadowMap.enabled=false`; `setClearColor('#dff3ff')`. Scene fog `new THREE.Fog('#dff3ff', 18, 40)`; kamera `PerspectiveCamera(50, w/h, 0.1, 100)` posisi `(0,7,10)` lookAt `(0,0,-4)`.
  3. Lights: `HemisphereLight(0xbfe9ff, 0x9db98a, 0.95)` + `DirectionalLight(0xffffff, 0.9)` posisi `(5,10,6)`. Tanpa shadow.
  4. Ground: `PlaneGeometry(60,60)` rotated -PI/2, `MeshLambertMaterial({color:'#a7d8a0'})`. Bukit: 3 `SphereGeometry` pipih (`scale.y=0.45`) warna `#8fce8f`. Pohon ×8: trunk `CylinderGeometry(0.12,0.16,0.8)` coklat + daun `ConeGeometry(0.7,1.4,7)` hijau; reuse 2 geometry + 2 material module-level (jangan new per pohon). Rumah ×2: box + atap prism (`CylinderGeometry(0,1,1,4)` rotated) warna krem/merah. Awan ×3: grup 2–3 sphere putih `MeshLambert`. Stasiun di `(0,0,-16)`: platform box `(10,0.4,4)` abu + papan box + tiang; tanpa teks WebGL wajib (label opsional via canvas texture kecil — boleh skip MVP).
  5. Rel: untuk tiap dari 4 kurva (1 main + 3 branch): `TubeGeometry(curve, 32, 0.07, 6)` material `#8a8f98` ×2 offset lateral ±0.35? Sederhanakan MVP: 1 tube per kurva sebagai rel tengah + bantalan: 14 box kecil `(1.0,0.08,0.28)` diletakkan via `curve.getPointAt(t)` + orientasi `getTangentAt`. Total mesh rel+sleepers ≤ 4 + 56? Itu >budget. Batasi: bantalan hanya main (14) + tiap cabang 8 → 14+24=38 + tubes 4 + env ~20 + kereta ~10 = ~72 >60. Koreksi: bantalan tiap cabang 6, main 10 → 28 + 4 + 20 + 10 = 62. Masih tinggi. Tetapkan exact: main 10, cabang 6×3=18, total sleepers 28; tubes 4; env: ground1+hills3+trees8×2obj=16+houses2×2=4+clouds3×1grup(di-hitung 3)+station3 = 30? Total ~72. Untuk penuhi <60: gabungkan tiap pohon jadi 1 mesh? Tidak bisa tanpa BufferGeometryUtils (dep ada? tidak — jangan tambah). Alternatif: kurangi pohon ke 5, awan 2, bukit 2. Hitung final: ground1+hills2(2)+trees5×2(10)+houses2×2(4)+clouds2(2)+station3(3)=22; rel tubes4+sleeper28=32; kereta 9 (loko body1+cabin1+chimney1+wheels4+gerbong1+gerbong wheels? gabung wheels jadi 1 geometry instanced? MVP: wheels 4 box/cylinder =4) → loko 3+4+gerbong1+gerbong roda2=10. Total 22+32+10=64. Masih 64. Kurangi sleeper cabang ke 5×3=15+main8=23 → total 22+27+10=59 ✓. Tetapkan exact: main 8, cabang 5 tiap. Dokumentasikan budget di komentar file.
  6. Kereta: `trainGroup` berisi loko (`Box(1.2,0.8,2.0)` merah `#e05555` + cabin box biru + cerobong cylinder hitam) + 1 gerbong (`Box(1.1,0.7,1.6)` kuning `#f5b942`) + roda: 4 cylinder hitam loko + 2 gerbong (radius 0.28, `CylinderGeometry(0.28,0.28,0.2,12)` rotated Z 90°). Semua `MeshLambertMaterial`. Posisikan via kurva tiap frame.
  7. Gerak: state internal `t` (0 di awal main), `phase: 'main'|'branch'`, `speed=0.12` unit-t per detik (t dalam 0..1 param kurva: `t += dt*speed`; reduced motion → `speed=0.35` agar cepat + tanpa lerp kamera). `update(dt)`: clamp dt ≤0.05; jika phase main dan `t>=1` → `t=1`, panggil `onReachJunction` sekali (guard flag), berhenti (jangan auto-lanjut). `setBranch(i)` set phase branch, `t=0`, guard reset. Branch `t>=1` → panggil `onReachStation` sekali. Orientasi: `pos=curve.getPointAt(t)`, `tan=curve.getTangentAt(t)`, `trainGroup.position.copy(pos).y+=0.55`, `lookAt(pos+tan)`.
  8. Papan jawaban 3D (cermin DOM): 3 box `(1.6,1.0,0.15)` di ujung tiap cabang `(ex,1.6,-12)` warna `#ffffff` border? MVP: box putih + tiang; tanpa CanvasTexture teks (hindari cost); nomor jawaban hanya di DOM. Komentar: teks WebGL bukan antarmuka.
  9. `resize(w,h)`: `renderer.setSize(w,h,false)`, kamera aspect update.
  10. `dispose()`: `cancel` bukan di sini (loop di Canvas); traverse scene: `geometry.dispose()`, `material.dispose()` (array-aware); `renderer.dispose()`; hapus canvas listener. Jangan dispose shared module-level geometry 2× (gunakan flag atau jangan share lintas instance — pilih: jangan share lintas file, buat per-instance tapi dispose penuh; pohon reuse dalam instance via variabel lokal yang di-cache, tetap di-dispose sekali via Set).
- Behavior: tidak ada fisika/post/shader; `antialias` true OK.
- Edge: WebGL context null → constructor throw `Error('WebGL tidak tersedia')` agar Canvas fallback (jangan return setengah-init). `update` dengan dt NaN → abaikan. `setBranch` sebelum junction → tetap set (idempoten).
- Test: tidak ada vitest (butuh WebGL); verifikasi via S12 manual + `npm run build` lolos + grep `TubeGeometry|Shadow` pastikan shadow off.
- Completion: file kompilasi (`typecheck`), kurva exact, mesh ≤59 (hitung di komentar), dispose traverse ada.
- Jangan ubah: `Aquarium*`, `vite.config.ts`, tambah dep (`three` sudah ada).

---

## S9 — TrainCanvas + Fallback2D (lifecycle bersih)

- Tujuan: wrapper React + 2D fallback playable dengan logika sama.
- Requirement: R13, R14, RL, R12 (reduced motion, keyboard dasar), RC (render loop).
- Dependency: S8.
- File dibaca: `src/components/aquarium/AquariumCanvas.tsx` (pola full: hasWebGL memo, hidden listener, Suspense tidak perlu untuk three murni).
- File dibuat:
  1. `src/components/train/TrainCanvas.tsx`
  2. `src/components/train/TrainFallback2D.tsx`
- API exact:
  ```tsx
  // TrainCanvas.tsx
  export interface TrainCanvasProps { paused: boolean; reducedMotion: boolean; onReachJunction: () => void; onReachStation: () => void; sceneRef: React.MutableRefObject<TrainScene | null>; onReady?: (scene: TrainScene) => void; }
  export default function TrainCanvas(props: TrainCanvasProps): JSX.Element;
  // TrainFallback2D.tsx
  export interface TrainFallback2DProps { paused: boolean; onReachJunction: () => void; onReachStation: () => void; autoAdvance?: boolean }
  ```
- Perubahan konkret `TrainCanvas.tsx` (urut):
  1. `hasWebGL()` copy exact dari AquariumCanvas (canvas getContext webgl/experimental-webgl try/catch). `useMemo` sekali.
  2. Jika `!webGL` → render `<TrainFallback2D ... />` (jangan throw).
  3. Else: `<div className="overflow-hidden rounded-3xl border-2 border-amber-200 bg-sky-50 shadow-sm" style={{height:'min(58vw,320px)',minHeight:220}} aria-hidden="true"><canvas ref className="h-full w-full block" /></div>`.
  4. `useEffect` mount (deps `[]` + callbacks via ref untuk hindari re-init; gunakan `cbRef` pattern): `const scene = new TrainScene(canvas, {onReachJunction, onReachStation})`; `sceneRef.current = scene`; `scene.setReducedMotion(reducedMotion)`; `onReady?.(scene)`; `let raf=0; let last=performance.now(); const loop=(now)=>{const dt=Math.min((now-last)/1000,0.05); last=now; if(!pausedRef.current) {scene.update(dt);} scene.render(); raf=requestAnimationFrame(loop);}; raf=requestAnimationFrame(loop);`
  5. `pausedRef` mirror prop `paused` via effect terpisah (jangan re-init scene). `reducedMotion` effect → `scene.setReducedMotion`.
  6. Resize: `ResizeObserver` pada wrapper div → `scene.resize(clientWidth, clientHeight)`; fallback window resize listener jika RO tak ada. Cleanup `disconnect` + `removeEventListener`.
  7. `visibilitychange`: jika `document.hidden` → set paused internal (jangan unmount); cleanup remove.
  8. Cleanup mount effect (wajib urut): `cancelAnimationFrame(raf)` → `ro.disconnect()` → `document.removeEventListener` → `scene.dispose()` → `sceneRef.current=null`. Guard StrictMode: jika effect jalan 2×, instance pertama harus ter-dispose sebelum kedua init (pola: buat scene di effect, dispose di return — React StrictMode menjamin ini).
- `TrainFallback2D.tsx`: div kereta CSS (emoji 🚂 + rel garis) + tombol "Simulasikan sampai percabangan" dan "Simulasikan sampai stasiun" yang memanggil callbacks (agar flow state machine tetap jalan tanpa WebGL); `role="alert"` pesan `t('train.fallbackMsg')` di atas; `autoAdvance` untuk test manual. Tanpa three import.
- Edge: canvas 0×0 (belum layout) → skip resize hingga >0; context lost (`webglcontextlost` preventDefault + panggil onReachJunction? Tidak — tampilkan fallback pesan; tambahkan listener `webglcontextlost` → `e.preventDefault()`).
- Test: tidak ada vitest WebGL; tambah `tests/trainFallback.test.tsx` (render fallback, klik tombol, expected callback terpanggil) memakai Testing Library (ikuti pola `tests/LearnScreen.test.tsx` setup + cleanup).
- Verifikasi: `npm test -- tests/trainFallback.test.tsx`, typecheck, manual matikan WebGL (devtools) → fallback playable.
- Jangan ubah: `AquariumCanvas.tsx`, test lain.

---

## S10 — Komponen DOM (Menu/HUD/QuestionDialog)

- Tujuan: UI DOM penuh (soal/tombol/progres/dialog/kontrol) + a11y + hint visual.
- Requirement: R4, R5, R9, R11, R12, R14, RF, RD.
- Dependency: S1, S2, S6.
- File dibaca: `src/components/common/ConfirmDialog.tsx` (props open/title/desc/confirm/cancel), `src/components/input/NumericKeypad.tsx` (pola keypad + aria — tiru ukuran tombol), `src/components/aquarium/AquariumControls.tsx` + `AquariumProgress.tsx` (pola kontrol + progres).
- File dibuat (3 file, props exact):
  1. `src/components/train/TrainMenu.tsx`: `export interface TrainMenuProps { onStart: (grade: TrainGrade) => void; bestStarsByGrade: Record<string, number>; }` — 3 tombol grade (`t('train.grade1..3')`) + tiap tombol tampilkan best (`★ x/15` atau '✨ Belum dicoba'); tombol `min-h-14 w-full rounded-2xl border-b-4 focus-visible:ring-4`; container `space-y-2`.
  2. `src/components/train/TrainHUD.tsx`: `export interface TrainHUDProps { round: number; total: number; stars: number; attempts: number; muted: boolean; paused: boolean; onToggleMute: () => void; onPause: () => void; onQuit: () => void; }` — baris progres (`Soal n dari 5`, bintang `★`, mute `🔊/🔇` aria-label `t('train.mute/unmute')`, jeda, keluar). Semua tombol `min-h-11`.
  3. `src/components/train/QuestionDialog.tsx`: `export interface QuestionDialogProps { question: TrainQuestion; round: number; total: number; attempts: number; showHint: boolean; feedback: { kind: 'correct'|'wrong'|'info'; text: string } | null; disabled: boolean; onAnswer: (choiceIndex: 0|1|2) => void; }` — `role="dialog" aria-modal="true" aria-labelledby="train-q-title"`; judul soal `prompt` besar; 3 tombol jawaban (`choices[i]`, `aria-label={t('train.chooseBranchAria',{answer:choices[i]})}`, `data-branch={i}`); hint box jika `showHint` (visual: untuk tambah/kurang tampilkan deret ●/🍎 sejumlah operan kecil (cap 20) + teks `hintText`; untuk banding tampilkan garis bilangan mini; untuk kali/bagi tampilkan tabel mini); feedback `<p aria-live="polite">`; keyboard: tombol native (Enter/Space otomatis), plus `data-testid="train-choice-0/1/2"` untuk test.
- Perubahan konkret: styling tiru repo (`rounded-3xl border-2 bg-white p-4 shadow-sm`, feedback benar `border-emerald-200 bg-emerald-50 text-emerald-800`, salah `border-amber-200 bg-amber-50`). Copy feedback wajib exact dari i18n (`train.correct`/`train.retry`), jangan hardcode string; grep `gagal` dilarang.
- Keyboard global (di TrainScreen, bukan dialog): `1/2/3` → onAnswer, `m` → mute, `Escape` → pause. Touch: tombol besar sudah cukup.
- Edge: `choices` duplikat (seharusnya tak terjadi) → tetap render 3 tombol disabled? Tidak — assert di dev (`if (new Set(choices).size!==3) console.error`) tapi tetap playable.
- Test `tests/trainDialog.test.tsx`: render QuestionDialog dengan fixture `{prompt:'7 + 5', choices:['11','12','13'], correctIndex:1}`; klik pilihan benar → onAnswer dipanggil dengan 1; cek `aria-live` ada; cek hint muncul saat `showHint=true`. Expected: `onAnswer` called once, hint text visible.
- Verifikasi: `npm test -- tests/trainDialog.test.tsx tests/trainFallback.test.tsx`, typecheck.
- Jangan ubah: `NumericKeypad`, `ConfirmDialog`, `Aquarium*`, `Garden*`.

---

## S11 — TrainScreen orkestrasi + hasil (alur penuh 5 soal)

- Tujuan: `src/screens/TrainScreen.tsx` — dari pilih kelas sampai layar hasil, wiring mesin + scene + storage + audio + guard.
- Requirement: R7, R8, R9, R10, R11, R12 + semua state.
- Dependency: S1–S10 (semua).
- File dibaca: `src/screens/GardenScreen.tsx` (pola full: `useState problems/index/results/correctFirstTry/wrongTotal`, `finishedRef`, leave-guard, `recordAnswer/completeLevel`, `navigate result`), `src/screens/AquariumScreen.tsx:35-55` (sound toggle event + guard), `src/screens/ResultScreen.tsx` (props `summary: SessionSummary` — baca untuk field wajib).
- File dibuat/diubah: buat `src/screens/TrainScreen.tsx` (baru). Jangan ubah `ResultScreen.tsx`, `GardenScreen.tsx`.
- State internal exact (nama sama agar deterministik):
  ```tsx
  const [phase, setPhase] = useState<TrainState>('LOADING');
  const [grade, setGrade] = useState<TrainGrade | null>(null);
  const [questions, setQuestions] = useState<TrainQuestion[]>([]);
  const [round, setRound] = useState(0); // 0-based
  const [attempts, setAttempts] = useState(0); // per soal
  const [attemptsLog, setAttemptsLog] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{kind:'correct'|'wrong'|'info';text:string}|null>(null);
  const [showHint, setShowHint] = useState(false);
  const [pausedFrom, setPausedFrom] = useState<TrainState|null>(null);
  const [muted, setMuted] = useState(false);
  const sceneRef = useRef<TrainScene|null>(null);
  const announceRef = useRef<HTMLParagraphElement>(null); // aria-live mirror
  ```
- Alur konkret (urut kode dalam file):
  1. Mount effect: `setPhase('MENU')` (tirukan intro delay Aquarium 600ms? Tidak — langsung MENU; LOADING hanya initial). `loadTrainProgress()` untuk best + muted init; `markLevelStarted('train')`? Jangan — train bukan level; skip agar tidak mengotori `lastLevelId`. (Keputusan eksplisit.)
  2. `handleStart(g)`: `playTrainClick`; `setGrade(g)`; `setQuestions(generateTrainSession(g,5))`; reset round/attempts/log/feedback/hint; `setPhase('INTRO')`; timer 800ms → `setPhase('TRAIN_MOVING')` (reduced motion → 100ms). Simpan timer id di `timersRef`, clear di unmount (tirukan CheerfulAquarium).
  3. Scene callbacks: `onReachJunction` → `setPhase('APPROACHING_JUNCTION')` lalu 400ms → `WAITING_FOR_ANSWER` + announce soal. `onReachStation` → `setPhase('ROUND_COMPLETE')` lalu 600ms → next (jika round<4: `setRound(r+1)`, reset attempts/hint, `setPhase('TRAIN_MOVING')`, `scene.setBranch` akan dipanggil setelah jawaban berikutnya — kereta reset ke awal main? Tetapkan: tiap ronde kereta mulai dari awal main (panggil `scene.reset()` — tambahkan method `reset()` di S8 jika belum ada: `t=0, phase='main'`; jika S8 sudah selesai tanpa reset, implementasikan di S11 via `sceneRef.current` recreate? Jangan recreate — wajib `reset()`. Jika S8 belum ada reset, tambahkan di S8 sebelum S11.) Jika round==4 → `SESSION_COMPLETE` handling (langkah 5).
  4. `handleAnswer(choiceIndex)`: guard hanya saat `WAITING_FOR_ANSWER`/`SHOWING_HINT`; `setPhase('CHECKING_ANSWER')`; bandingkan `choiceIndex===question.correctIndex`; benar → `playTrainCorrect`, feedback `t('train.correct')`, `attemptsLog.push(attempts+1)`, `setPhase('SWITCHING_TRACK')`, `scene.setBranch(choiceIndex)` (mapping exact 0=kiri,1=tengah,2=kanan — jangan invert), 500ms → `TRAVELLING_TO_STATION` (scene update otomatis jalan karena phase branch). Salah → `playTrainWrong`, `attempts+1`, feedback `t('train.retry')`; jika `attempts+1>=2` → `setShowHint(true)`, `setPhase('SHOWING_HINT')`, `playTrainHint`, 800ms → `WAITING_FOR_ANSWER` (tetap soal sama); else → `WAITING_FOR_ANSWER` langsung (400ms).
  5. Session end: `stars=sumTrainStars(attemptsLog)` (max 15) + `stars3 = Math.round(stars/5)`? ResultScreen butuh 0–3. Tetapkan exact: `displayStars = stars>=13?3 : stars>=9?2 : 1` (5 soal: 15 maks; 13≈ semua attempt1 kecuali 1 soal attempt2). `saveTrainProgress(recordTrainSession(...))`; `navigate({name:'result', summary:{title:t('train.title'), totalQuestions:5, correctFirstTry: attemptsLog.filter(a=>a===1).length, wrongAttempts: sum(attemptsLog-1), recovered: attemptsLog.filter(a=>a>1).length, stars: displayStars, levelId:null, settings:null, nextLevelId:null, newAchievementIds:[]}})` — jangan panggil `recordAnswer/completeLevel` (hindari polusi achievement K1/K2).
  6. Pause/quit guard: `setLeaveGuard` pola GardenScreen; `ConfirmDialog` untuk quit; `PAUSED` overlay dengan Resume/Restart/Quit; `Escape` → pause; `pausedFrom` simpan untuk resume (gunakan `resumeTrain`).
  7. Mute: toggle `muted` + `saveTrainProgress({...p, soundEnabled:!muted})` + `setSoundEnabled` (lib sound) agar konsisten global.
  8. ARIA live: `<p ref={announceRef} className="sr-only" aria-live="polite">{announceText}</p>` update tiap soal/feedback/bintang ("Soal 2 dari 5: 7 + 5. ... Hebat! ...").
  9. Render: jika `phase==='MENU'` → TrainMenu; else → TrainHUD + (TrainCanvas atau Fallback otomatis) + QuestionDialog (visible saat WAITING/SHOWING_HINT/CHECKING) + ConfirmDialog + live region. Canvas selalu `aria-hidden`.
- Behavior dipertahankan: ResultScreen existing, ProgressContext, leave-guard semantics.
- Edge: jawaban ganda cepat → guard `disabled` saat CHECKING; timer race saat quit → `clearTimers` + `finishedRef`; WebGL throw → Canvas sudah fallback; `questions[round]` undefined → `ERROR` phase + pesan fallback.
- Test: tidak ada vitest baru untuk screen (jsdom+WebGL); verifikasi manual S12 + typecheck. Tambahkan `tests/trainSession.test.ts` pure: `generateTrainSession(2,5)` + `sumTrainStars` + `transitionTrain` happy path integrasi (tanpa React).
- Verifikasi: `npm test -- tests/trainSession.test.ts`, `npm run typecheck`.
- Jangan ubah: `GardenScreen`, `AquariumScreen`, `ResultScreen`, `ProgressContext`, `storage.ts`, `scoring.ts`.

---

## S12 — Test integrasi, optimasi, responsive

- Tujuan: semua test hijau + budget + responsive + keyboard + console bersih.
- Dependency: S1–S11.
- File dibaca: `tests/setup.ts` (storage mock, matchMedia stub), `vite.config.ts:53-63` (chunks — jangan ubah).
- File diubah: tidak ada sumber baru; boleh perbaiki bug yang ditemukan (catat di Progress Log plan).
- Test yang harus ada total (7 file train): `trainQuestionGenerator`, `trainStars`, `trainStateMachine`, `trainStorage`, `trainSound`, `trainDialog`, `trainFallback`, `trainSession`. Jika salah satu hilang → buat sebelum klaim selesai.
- Optimasi konkret: cek `TrainScene.ts` tidak ada `ShadowMap`, `PostProcessing`, `ShaderMaterial`, `Physics`; `setPixelRatio(min(dpr,1.5))`; mesh count komentar ≤59; `TubeGeometry` segments ≤32; tidak ada texture eksternal.
- Manual checklist (wajib centang di Progress Log):
  - 360×800 + 1280×800: canvas + dialog tanpa scroll horizontal; tombol ≥44px.
  - Keyboard: Tab ke soal, 1/2/3 menjawab, Esc jeda, M mute, Enter konfirmasi.
  - Console: 0 error/warning selama 1 sesi penuh 5 soal.
  - Restart 3× (Acak soal baru / quit→start): 1 loop (cek via `requestAnimationFrame` count manual / tidak ada kereta ganda), listener dilepas, tidak ada `THREE.WebGLRenderer: Context Lost` berulang.
  - WebGL off (chrome `--disable-webgl` atau devtools sensor): fallback 2D playable sampai hasil.
  - Reduced motion on (OS/devtools): kereta cepat, tanpa animasi CSS (class `no-anim` dihormati).
- Command: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run format:check`.
- Expected: lint 0 error; typecheck 0; test semua hijau (termasuk 39 file lama + 8 train); build sukses tanpa chunk warning baru; format:check hijau (jalankan `npx prettier --write` pada file train jika gagal — hanya file train).
- Completion: semua checklist + command hijau.
- Jangan ubah: CI workflow, vite config, file non-train selain yang diizinkan S6–S7.

---

## S13 — Verifikasi akhir + handoff (tanpa implementasi baru)

- Tujuan: ringkasan file diubah, keputusan, batasan, memory.
- Dependency: S12.
- File dibaca: `git status --short` (read-only, diizinkan) untuk daftar file; `.memory/README.md` (format index) sebelum tulis entry.
- File diubah (diizinkan khusus):
  1. `.memory/YYYY-MM-DD/HHmmss-petualangan-kereta-angka.md` (satu entry, ikuti format: tugas, file diubah, keputusan, asumsi/risiko, blocker, verifikasi, commit proposal, relasi plan).
  2. `.memory/README.md` (update timestamp, current state 1 baris, recent entries ≤20 — jangan hapus histori).
  3. Plan ini (centang Tasks + tambah Progress Log).
- Dilarang: staging/commit kode (`git add/commit` kode train) — kecuali jika pengguna eksplisit meminta commit plan saja; default jangan commit apa pun.
- Handoff checklist untuk model kecil (salin ke jawaban akhir juga):
  - [ ] 11 sumber + 8 test ada, API exact sesuai S1–S11
  - [ ] `npm run lint/typecheck/test/build/format:check` hijau
  - [ ] Manual mobile/keyboard/console/fallback/reduced-motion dicentang
  - [ ] Tidak ada kata "gagal" di UI train (`grep -ri gagal src/components/train src/screens/TrainScreen.tsx src/i18n/dicts` kosong)
  - [ ] Tidak ada import `three` di `src/lib/train*` (grep kosong)
  - [ ] Ringkasan file + keputusan + batasan ditulis
- Completion: handoff semua centang; jawaban akhir berisi ringkasan file, keputusan, batasan.
- Jangan ubah: kode sumber selain memory/plan.

---

## Progress Log

- 2026-09-23 14:00:00 — Plan atomik dibuat (S0–S13 + traceability). Belum ada implementasi. Next: eksekusi S1–S5 (logika murni) sebelum sentuh Three.js.
- 2026-09-23 21:35:00 — Implementasi selesai S0–S13. lint/typecheck/test(47f/361t)/format/build hijau. Browser preview: mobile 390px + desktop 1440px OK, alur jawab benar → ★3 + copy exact. Memory: `.memory/2026-09-23/213500-petualangan-kereta-angka.md`. Batasan sisa: heap profiling restart 3× dan screenshot capture belum (timeout env); papan 3D tanpa teks; refresh reset ke home.

## Notes

- **Keputusan yang sudah dikunci (jangan buka ulang tanpa blocker):** storage key baru `asharu-train:v1` (hindari migrasi `UserProgress`); bintang train terpisah dari `starsFor`; `GradeLevel` global tetap 1|2; tanpa TTS (sfx saja); kereta reset ke awal main tiap ronde via `scene.reset()`; hasil via `ResultScreen` dengan `levelId/settings/nextLevelId=null` dan tanpa achievement.
- **Counter-pertimbangan yang ditolak:** fiber untuk scene (ditolak: loop/dispose kurang eksplisit); tab bawah baru (ditolak: chrome berlebih); perluas LEVELS untuk K3 (ditolak: migrasi rantai requires + duplikat number 20–23).
- **Batasan MVP yang tersisa:** 1 env pedesaan, 1 kereta+1 gerbong, geometri bawaan, tanpa fisika/post/shader; bagi K3 hanya dari tabel kali; tidak ada adaptif lintas sesi selain best-stars; progres lokal per browser; refresh reset ke home; papan 3D tanpa teks jawaban (teks hanya di DOM).
- **Open questions:** tidak ada yang memblokir. Jika eksekutor menemukan kontradiksi (mis. `core.ts` membatasi bentuk key i18n), catat sebagai blocker di Progress Log + hentikan langkah terkait, jangan improvisasi diam-diam.
- **Larangan MVP:** backend, login, analytics baru, multiplayer, leaderboard, payment, iklan baru, toko virtual, perubahan framework/package manager/konfig utama.
- **Perintah yang tersedia (jangan jalankan yang mengubah repo selain file plan/memory):** `npm run lint`, `npm run typecheck`, `npm test`, `npm test -- <file>`, `npm run build`, `npm run format:check`, `git status --short`.

---

## Handoff Checklist (untuk model eksekutor kecil)

- [ ] Kerjakan S0→S13 berurutan; jangan lompat ke scene sebelum S1–S5 hijau.
- [ ] Setiap langkah: baca file listed → ubah hanya file listed → API exact → test listed → command listed → penuhi completion criteria.
- [ ] Setiap finding scope (R1–R14, RC/RG/RF/RL/RT/RD) ditangani min. satu langkah + verifikasi.
- [ ] Jangan ubah area "Tidak boleh diubah" tiap langkah; jika harus, jadikan blocker + minta keputusan.
- [ ] Akhiri dengan verifikasi S12–S13 + ringkasan file diubah, keputusan arsitektur, batasan tersisa.
