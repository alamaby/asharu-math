# Kereta Fase 4 — TTS Narasi + Resume Sesi (Implementation Plan atomik)

Created: 2026-09-25 16:30:00

## Objective

Tutup TODO-1 (TTS browser, tanpa file audio) dan TODO-3 (resume sesi setelah refresh, per-batas-ronde) pada mini game "Petualangan Kereta Angka". Tanpa file manual, tanpa dependensi baru, tanpa TTS rekaman, tanpa backend.

## Keputusan pengguna yang sudah final (jangan tanyakan ulang)

1. Tombol "ulangi narasi" DIPERLUKAN (repeat button ada).
2. Feedback (benar/salah) IKUT diucapkan (bukan soal+hint saja).
3. Resume mid-round → attempts RESET (ronde diulang bersih).
4. Kedaluwarsa snapshot sesi = 14 hari.

## Scope

In scope:
- `src/lib/trainStorage.ts`: field opsional `voiceEnabled` + `TrainSessionSnapshot` + `save/load/clear/isValidTrainSession` (key terpisah `asharu-train-session:v1`, kedaluwarsa 14 hari).
- `src/lib/trainNarration.ts` (baru, pure): `speakablePrompt(question, lang)` — operator dibaca kata (`+`→"tambah", dst) untuk TTS.
- `src/lib/trainSound.ts`: `speakTrain(text, enabled)`, `repeatTrainNarration(enabled)`, `stopTrainSpeech()`. `stopTrainAudio()` tidak diubah.
- `src/i18n/dicts/id.ts` + `en.ts`: 5 key baru (`train.repeatNarration`, `train.resumeSession`, `train.startNewHint`, `train.voiceMute`, `train.voiceUnmute`).
- `src/components/train/TrainHUD.tsx`: 3 props + 2 tombol baru (voice toggle, repeat).
- `src/components/train/TrainMenu.tsx`: 2 props opsional + tombol "Lanjutkan perjalanan".
- `src/screens/TrainScreen.tsx`: wiring narasi (soal/hint/feedback + repeat + delay anti-tabrakan), snapshot save/clear, `handleResumeSession`, keyboard `r`.
- Test: `tests/trainNarration.test.ts` (baru), `tests/trainSessionStorage.test.ts` (baru), update `tests/trainStorage.test.ts` (+2), `tests/trainSfx.test.ts` (+1), `tests/trainMenu.test.tsx` (baru).
- Verifikasi penuh + manual (termasuk tes voice `id-ID` di perangkat nyata) + memory + bump `1.7.0` → `1.8.0`.

Out of scope (dilarang):
- TTS rekaman/file audio biner (MP3/WAV/OGG); dependensi npm baru.
- Perubahan gameplay: generator soal, state machine 14 state, bintang 3/2/1, mapping cabang 0=kiri/1=tengah/2=kanan, `GradeLevel`, `LEVELS`, ResultScreen, achievement.
- `vite.config.ts`, CI, `BottomNavigation`, `TAB_SCREENS`, `ProgressContext`, `storage.ts`, `scoring.ts`, file Aquarium/Garden, `sound.ts`, `trainMusic.ts`, `TrainScene.ts`, `TrainCanvas.ts`, `QuestionDialog.tsx`.
- Kata "gagal" di UI train. Backend/sync (TODO-2 tetap TODO).

## Milestones

1. M1 logika murni + storage (S1–S2) — test dulu, tanpa React.
2. M2 audio narasi (S3) — terisolasi.
3. M3 i18n + UI (S4–S5) — HUD & Menu.
4. M4 wiring Screen (S6) — narasi + resume.
5. M5 verifikasi + handoff (S7–S9).

## Tasks

- [x] S0 audit read-only state `5d798be`
- [x] S1 `trainStorage.ts`: `voiceEnabled` + snapshot sesi + validasi/kedaluwarsa + test
- [x] S2 `trainNarration.ts` (pure) + test
- [x] S3 `trainSound.ts`: speak/repeat/stopSpeech + test smoke
- [x] S4 i18n 5 key baru ID/EN
- [x] S5 `TrainHUD` (voice+repeat) & `TrainMenu` (resume) props+tombol
- [x] S6 `TrainScreen`: wiring narasi + snapshot + `handleResumeSession` + keyboard `r`
- [x] S7 verifikasi otomatis (lint, typecheck, test, build, format, grep)
- [x] S8 checklist manual (narrasi, repeat, resume, kedaluwarsa, perangkat nyata)
- [x] S9 memory + bump 1.8.0 + handoff (tanpa commit)

## Risks

- R1: jsdom tanpa `speechSynthesis` → semua fungsi narasi no-op; test pakai `not.toThrow()`. Pola existing `aquariumSound.ts`/`trainSound.ts` sudah begitu.
- R2: Konflik screen reader (TalkBack/VoiceOver) → toggle manual (`voiceEnabled`), default true; catat sebagai batasan.
- R3: Voice `id-ID` tidak ada di sebagian perangkat → tetap bicara dengan voice default (keputusan: jangan diam) agar bantuan tetap ada.
- R4: Narasi menabrak SFX peluit → narasi soal dijadwalkan dalam callback `later(400, ...)` yang sudah ada (bukan langsung).
- R5: Snapshot basi/menggantung → kedaluwarsa 14 hari; validasi ketat; dihapus saat selesai/quit.
- R6: Model kecil menyimpang API → signature + cuplikan exact tiap langkah; larangan improvisasi nama.

## Requirement Traceability Matrix

| ID | Finding / requirement | Langkah | Verifikasi |
|----|------------------------|---------|------------|
| F1 | Narasi TTS soal/hint/feedback (TODO-1) | S2, S3, S6 | test + dengar manual S8 |
| F2 | Toggle voice terpisah + persist | S1, S4, S5, S6 | test storage + manual |
| F3 | Tombol ulangi narasi | S3, S4, S5, S6 | manual S8 |
| F4 | Resume sesi per-ronde (TODO-3) | S1, S5, S6 | test storage + manual |
| F5 | Kedaluwarsa 14 hari | S1 | test + manual |
| F6 | Attempts reset saat resume | S6 | manual + review kode |
| C1 | Tanpa file audio biner / dep baru | S3 | S7 grep + build |
| C2 | Lifecycle bersih (speech di-cancel) | S3, S6 | S7 + S8 |
| C3 | DOM satu-satunya antarmuka; tanpa "gagal" | S4, S5 | S7 grep |
| C4 | Reduced-motion & fallback 2D utuh | S6 | S8 manual |

---

## S0 — Audit read-only state `5d798be`

- Tujuan: kunci pemahaman API existing; tanpa ubah file.
- Finding: fondasi F1–F6 + C1–C4.
- Dependency: tidak ada.
- File yang harus dibaca (7 file, penuh):
  1. `src/lib/trainStorage.ts` (pola `validateTrainProgress`, `StorageLike`, `getTrainStorage`).
  2. `src/lib/trainSound.ts` (`stopTrainAudio` cancel speech; fungsi play*).
  3. `src/lib/aquariumSound.ts` (pola `speak`, `repeatLastNarration`, `stopAllAudio`, anti-tumpuk).
  4. `src/screens/TrainScreen.tsx` (`handleStart`, `handleAnswer`, `handleReachStation`, `handlePause`, keyboard effect, cleanup unmount, render Menu/HUD).
  5. `src/components/train/TrainHUD.tsx` + `src/components/train/TrainMenu.tsx` (props).
  6. `src/i18n/dicts/id.ts` baris 512–538 (blok Kereta Angka, urutan alfabetis).
  7. `tests/trainStorage.test.ts` + `tests/trainSfx.test.ts` (pola case) + `src/lib/trainQuestionGenerator.ts` (bentuk `TrainQuestion`).
- File diubah: tidak ada.
- Simbol terkait: `TrainProgress`, `loadTrainProgress`, `speak`, `handleStart`, `TrainMenuProps`, `TrainHUDProps`, `TrainQuestion`.
- Kondisi saat ini: versi `1.7.0`; `TrainProgress` punya `soundEnabled` + `musicEnabled?`; narasi TTS belum ada di train; refresh → kembali MENU; HUD 4 tombol (mute/musik/jeda/keluar); Menu hanya 3 tombol grade.
- Perubahan konkret: tidak ada.
- Behavior dipertahankan: seluruh app.
- Error/edge: tidak ada.
- Test: tidak ada.
- Command verifikasi: tidak ada.
- Hasil yang diharapkan: pelaksana dapat menyebut: (a) key storage terpisah untuk snapshot; (b) `speak` harus `cancel()` dulu (anti-tumpuk); (c) `TrainQuestion` fields = `id, grade, topic, prompt, choices[3], correctIndex, correctValue, hintText`.
- Completion: 7 file dibaca; `git status --short` bersih (kecuali plan).
- Tidak boleh diubah: semua file.

---

## S1 — `trainStorage.ts`: `voiceEnabled` + snapshot sesi + test

- Tujuan: persist toggle voice + snapshot sesi (validasi ketat, kedaluwarsa 14 hari).
- Finding: F2, F4, F5.
- Dependency: S0.
- File dibaca: `src/lib/trainStorage.ts`, `src/lib/trainQuestionGenerator.ts` (tipe `TrainQuestion`/`TrainGrade`/`TrainTopic`), `tests/trainStorage.test.ts`.
- File diubah: `src/lib/trainStorage.ts` (edit); `tests/trainStorage.test.ts` (+2 case); buat `tests/trainSessionStorage.test.ts`.
- Simbol exact (tambah):
  ```ts
  // di TrainProgress
  voiceEnabled?: boolean
  // baru
  export const TRAIN_SESSION_KEY = 'asharu-train-session:v1'
  export const TRAIN_SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000
  export interface TrainSessionSnapshot {
    version: 1
    grade: 1 | 2 | 3
    questions: TrainQuestion[]
    round: number
    attemptsLog: number[]
    savedAt: number
  }
  export function isValidTrainSession(value: unknown): value is TrainSessionSnapshot
  export function saveTrainSession(snapshot: TrainSessionSnapshot, storage?: StorageLike | null): boolean
  export function loadTrainSession(storage?: StorageLike | null): TrainSessionSnapshot | null
  export function clearTrainSession(storage?: StorageLike | null): void
  ```
- Kondisi saat ini: tanpa `voiceEnabled`; tanpa snapshot; `StorageLike` privat sudah ada.
- Perubahan konkret (urut di file):
  1. Interface `TrainProgress`: tambah `voiceEnabled?: boolean` setelah `musicEnabled`.
  2. `defaultTrainProgress()`: tambah `voiceEnabled: true`.
  3. `validateTrainProgress`: setelah cek `musicEnabled` tambah
     `if (value.voiceEnabled !== undefined && typeof value.voiceEnabled !== 'boolean') return null;`
     dan pada return tambah `voiceEnabled: (value.voiceEnabled as boolean | undefined) ?? true,`.
  4. Tambah `import type { TrainQuestion } from './trainQuestionGenerator'` (type-only, tidak siklus runtime).
  5. Tambah konstanta `TRAIN_SESSION_KEY`, `TRAIN_SESSION_TTL_MS`.
  6. Tambah helper privat `isValidQuestion(v: unknown): boolean` — cek: `isRecord(v)`, `typeof v.id === 'string'`, `v.grade === 1|2|3`, `v.topic ∈ {addition,subtraction,multiplication,division,comparison}`, `typeof v.prompt === 'string'`, `Array.isArray(v.choices) && v.choices.length === 3 && semua string && new Set(choices).size === 3`, `v.correctIndex === 0|1|2`, `typeof v.correctValue === 'string'`, `typeof v.hintText === 'string'`, dan `v.choices[v.correctIndex] === v.correctValue`.
  7. `isValidTrainSession(value)`: `isRecord`, `version === 1`, `grade ∈ {1,2,3}`, `Array.isArray(questions) && questions.length === 5 && questions.every(isValidQuestion)`, `Number.isInteger(round) && round >= 0 && round <= 4`, `Array.isArray(attemptsLog) && attemptsLog.length === round && attemptsLog.every(n => Number.isInteger(n) && n >= 1)`, `Number.isFinite(savedAt)`.
  8. `saveTrainSession`: `setItem(TRAIN_SESSION_KEY, JSON.stringify(snapshot))` try/catch → boolean.
  9. `loadTrainSession`: ambil storage; `getItem`; parse; `isValidTrainSession` gagal → `null`; bila `Date.now() - savedAt > TTL` → `clearTrainSession(storage)` + `null`; else return snapshot. Semua dalam try/catch → null.
  10. `clearTrainSession`: `removeItem(TRAIN_SESSION_KEY)` try/catch (tanpa throw).
- Urutan: interface → default → validate → import type → konstanta → `isValidQuestion` → `isValidTrainSession` → save/load/clear.
- Behavior dipertahankan: `loadTrainProgress`/`saveTrainProgress`/`recordTrainSession` tidak berubah; key progress tidak berubah; data lama tanpa `voiceEnabled` tetap valid (→ true).
- Error/edge: `round` 5 → invalid; `attemptsLog.length !== round` → invalid; `correctIndex` 3 → invalid; `savedAt` NaN → invalid; snapshot kedaluwarsa → dihapus + null; storage null → load null, save false, clear no-op; JSON rusak → null.
- Test `tests/trainStorage.test.ts` (+2, jangan ubah existing):
  - "voice default true & roundtrip": `defaultTrainProgress().voiceEnabled === true`; save `{...d, voiceEnabled:false}` → load `false`.
  - "voice backward compatible": validate objek tanpa `voiceEnabled` → `voiceEnabled === true`; `voiceEnabled: 'ya'` → null.
- Test `tests/trainSessionStorage.test.ts` (baru, 5 case):
  - roundtrip: save snapshot valid (grade 2, 5 soal dari `generateTrainSession(2,5)`, round 3, attemptsLog [1,1,2], savedAt `Date.now()`) → load sama.
  - invalid round: `round: 5` → `isValidTrainSession` false, load null.
  - invalid questions: 4 soal / correctIndex 3 / choices duplikat → false.
  - inconsistent log: `round: 3`, `attemptsLog: [1]` → false.
  - kedaluwarsa: `savedAt: Date.now() - TRAIN_SESSION_TTL_MS - 1` → load null DAN `getItem(TRAIN_SESSION_KEY) === null` (terhapus); `clearTrainSession` lalu load → null.
- Input/expected: memory storage (pola `tests/trainStorage.test.ts`).
- Command verifikasi: `npm test -- tests/trainStorage.test.ts tests/trainSessionStorage.test.ts` lalu `npm run typecheck`.
- Hasil diharapkan: 9 case hijau; typecheck 0 error.
- Completion: field + 5 simbol + 3 fungsi exact; key terpisah; TTL 14 hari; test hijau.
- Tidak boleh diubah: `loadTrainProgress`/`saveTrainProgress`/`recordTrainSession` signature; `TRAIN_STORAGE_KEY`; `src/lib/storage.ts`; `ProgressContext.tsx`.

---

## S2 — `trainNarration.ts` (pure) + test

- Tujuan: ubah prompt simbolik jadi kalimat yang enak dibaca TTS.
- Finding: F1 (bagian teks).
- Dependency: S0.
- File dibaca: `src/lib/trainQuestionGenerator.ts` (tipe + format prompt: `"7 + 5"`, `"9 − 5"` (U+2212), `"4 × 3"`, `"36 ÷ 4"`, `"14 ? 4"`).
- File diubah: buat `src/lib/trainNarration.ts`; buat `tests/trainNarration.test.ts`.
- Simbol exact:
  ```ts
  import type { TrainQuestion } from './trainQuestionGenerator'
  export function speakablePrompt(question: TrainQuestion, lang: 'id' | 'en'): string
  export const _narrationHelpers: { OP_WORDS: Record<'id' | 'en', Record<TrainQuestion['topic'], string>> }
  ```
- Kondisi saat ini: belum ada; prompt mentah berisi simbol (`+ − × ÷ ?`).
- Perubahan konkret (urut):
  1. `OP_WORDS` exact:
     - id: `{ addition: 'tambah', subtraction: 'kurang', multiplication: 'kali', division: 'bagi', comparison: 'dibandingkan dengan' }`
     - en: `{ addition: 'plus', subtraction: 'minus', multiplication: 'times', division: 'divided by', comparison: 'compared with' }`
  2. `speakablePrompt`: parse angka dari `question.prompt` via `split(/[^0-9]+/).filter(Boolean).map(Number)`; bila `< 2` angka → return `question.prompt` (fallback aman); else `` `${nums[0]} ${OP_WORDS[lang][question.topic]} ${nums[1]}` ``.
  3. Export `_narrationHelpers` (OP_WORDS) untuk test.
- Urutan dalam file: import type → OP_WORDS → fungsi → export helpers.
- Behavior dipertahankan: tidak mengubah generator; tidak import react/three; fungsi pure.
- Error/edge: prompt tanpa angka → kembalikan prompt apa adanya; angka besar (500) tetap valid; `lang` selain id/en tidak mungkin (tipe).
- Test `tests/trainNarration.test.ts` (3 case):
  - `speakablePrompt({...prompt:'7 + 5', topic:'addition'}, 'id') === '7 tambah 5'`.
  - `'36 ÷ 4'` division id → `'36 bagi 4'`; `'14 ? 4'` comparison en → `'14 compared with 4'`.
  - fallback: prompt `'abc'` → `'abc'`.
- Input/expected: fixture `TrainQuestion` literal (buat helper `mk(prompt, topic)`).
- Command: `npm test -- tests/trainNarration.test.ts` lalu `npm run typecheck`.
- Hasil: 3 case hijau; typecheck 0.
- Completion: fungsi + helpers exact; tanpa import three/react (grep).
- Tidak boleh diubah: `trainQuestionGenerator.ts`, i18n.

---

## S3 — `trainSound.ts`: speak / repeat / stopSpeech + test

- Tujuan: narasi TTS id-ID anti-tumpuk, aman di jsdom.
- Finding: F1, F3, C1, C2.
- Dependency: S0.
- File dibaca: `src/lib/trainSound.ts`, `src/lib/aquariumSound.ts` (pola `speak` baris 10–62).
- File diubah: `src/lib/trainSound.ts` (tambah 3 fungsi + state); `tests/trainSfx.test.ts` (+1 case).
- Simbol exact:
  ```ts
  export function speakTrain(text: string, enabled: boolean): void
  export function repeatTrainNarration(enabled: boolean): void
  export function stopTrainSpeech(): void
  ```
- Kondisi saat ini: hanya `stopTrainAudio()` yang memanggil `speechSynthesis.cancel()`; tanpa speak.
- Perubahan konkret (urut):
  1. Tambah state modul: `let lastNarration: string | null = null` dan `let speaking = false`.
  2. Helper privat `supportsSpeech(): boolean` (`typeof window !== 'undefined' && 'speechSynthesis' in window`) dan `cancelSpeech(): void` (cancel + `speaking = false`), pola `aquariumSound.ts`.
  3. `speakTrain(text, enabled)`: set `lastNarration = text`; bila `!enabled` return; bila `typeof window === 'undefined'` return; `cancelSpeech()`; bila `!supportsSpeech()` return; buat `SpeechSynthesisUtterance`, `lang = 'id-ID'`, `rate = 0.9`, `onstart` → `speaking = true`, `onend`/`onerror` → `speaking = false`; pilih voice `v.lang.toLowerCase().startsWith('id')` bila ada; `speechSynthesis.speak(utter)`; semua try/catch.
  4. `repeatTrainNarration(enabled)`: bila `lastNarration` → `speakTrain(lastNarration, enabled)`.
  5. `stopTrainSpeech()`: `cancelSpeech()`.
  6. `stopTrainAudio()` TIDAK diubah (tetap cancel speech — idempoten dengan stopTrainSpeech).
- Urutan: state → helpers → speakTrain → repeat → stopSpeech (setelah `stopTrainAudio` atau sebelum; jangan ubah `stopTrainAudio`).
- Behavior dipertahankan: semua `playTrain*` tidak berubah; `stopTrainAudio` signature + perilaku tetap.
- Error/edge: jsdom tanpa speechSynthesis → no-op; `enabled=false` → tetap simpan `lastNarration` (agar repeat bisa saat diaktifkan) tapi tidak bicara; exception → swallow; speak ganda → `cancelSpeech()` dulu (anti-tumpuk).
- Test `tests/trainSfx.test.ts` (+1 case, jangan ubah 2 existing):
  - "narasi tidak melempar tanpa speechSynthesis": `speakTrain('halo', true); speakTrain('halo', false); repeatTrainNarration(true); stopTrainSpeech(); stopTrainAudio();` → `not.toThrow()`.
- Input/expected: jsdom tanpa speechSynthesis → no-op.
- Command: `npm test -- tests/trainSfx.test.ts` lalu `npm run typecheck`.
- Hasil: 3 case hijau; typecheck 0.
- Completion: 3 fungsi exact; tanpa file audio; `stopTrainAudio` tak berubah.
- Tidak boleh diubah: `sound.ts`, `aquariumSound.ts`, fungsi `playTrain*`, `stopTrainAudio`.

---

## S4 — i18n 5 key baru ID/EN

- Tujuan: string toggle voice, repeat, resume, hint mulai-baru terpusat.
- Finding: F2, F3, F4, C3.
- Dependency: S0.
- File dibaca: `src/i18n/dicts/id.ts` (blok Kereta Angka 512–538, urutan alfabetis), `en.ts`.
- File diubah: `src/i18n/dicts/id.ts`, `src/i18n/dicts/en.ts`.
- Key exact + nilai ID exact + posisi (jaga urutan alfabetis):
  - setelah `'train.questionOf'` → `'train.repeatNarration': 'Ulangi narasi'` (en: `'Repeat narration'`)
  - setelah `'train.resume'` → `'train.resumeSession': (p: { gradeLabel: string; n: number; total: number }) => `▶ Lanjutkan perjalanan (${p.gradeLabel}, soal ${p.n}/${p.total})`` (en: `▶ Continue journey (${p.gradeLabel}, question ${p.n}/${p.total})`)
  - setelah `'train.starsAria'` → `'train.startNewHint': 'Mulai kelas baru akan menghapus sesi tersimpan.'` (en: `'Starting a new grade will clear the saved session.'`)
  - setelah `'train.unmute'` → `'train.voiceMute': 'Matikan narasi suara'` (en: `'Turn narration off'`) dan `'train.voiceUnmute': 'Nyalakan narasi suara'` (en: `'Turn narration on'`)
- Kondisi saat ini: 25 key `train.*`; tidak ada kelima key di atas.
- Perubahan konkret: sisipkan sesuai posisi; tidak hapus/ubah baris lain; en bertipe `Dict` sehingga key harus identik.
- Urutan: id lalu en.
- Behavior dipertahankan: `createT` tak berubah; key lama tak berubah; tanpa kata "gagal".
- Error/edge: key tidak sinkron → typecheck gagal (bukti otomatis).
- Test: tidak ada test baru (verifikasi typecheck).
- Command: `npm run typecheck`.
- Hasil: 0 error.
- Completion: 5 key ada di kedua file; urutan alfabetis terjaga.
- Tidak boleh diubah: `core.ts`, `LanguageContext.tsx`, key non-train.

---

## S5 — `TrainHUD` (voice+repeat) & `TrainMenu` (resume)

- Tujuan: kontrol narasi di HUD + tombol lanjutkan di Menu.
- Finding: F2, F3, F4.
- Dependency: S4 (label) + S1 (tipe snapshot tidak langsung dipakai di komponen).
- File dibaca: `src/components/train/TrainHUD.tsx`, `src/components/train/TrainMenu.tsx`, `src/components/train/TrainCelebration.tsx` (pola props opsional).
- File diubah: `TrainHUD.tsx`, `TrainMenu.tsx`.
- Simbol exact:
  ```tsx
  // TrainHUD: props BARU (existing tidak diubah)
  export interface TrainHUDProps {
    round: number; total: number; stars: number
    muted: boolean; paused: boolean; musicOn: boolean; voiceOn: boolean
    onToggleMute: () => void; onToggleMusic: () => void; onToggleVoice: () => void
    onRepeatNarration: () => void
    onPause: () => void; onQuit: () => void
  }
  // TrainMenu: props BARU opsional
  export interface TrainMenuProps {
    onStart: (grade: TrainGrade) => void
    bestStarsByGrade: Record<string, number>
    resumeInfo?: { grade: TrainGrade; round: number; total: number } | null
    onResume?: () => void
  }
  ```
- Kondisi saat ini: HUD 4 tombol (mute/musik/jeda/keluar); Menu 3 tombol grade.
- Perubahan konkret (urut):
  1. `TrainHUD`: destructure + 2 tombol baru setelah tombol musik — voice: `aria-label={voiceOn ? t('train.voiceMute') : t('train.voiceUnmute')}`, isi `{voiceOn ? '🗣️' : '🚫🗣️'}`; repeat: `aria-label={t('train.repeatNarration')}`, isi `🔁`. Class identik tombol existing (`min-h-11 rounded-2xl border-2 ... focus-visible:ring-4`). Urutan tombol: mute, musik, voice, repeat, jeda, keluar.
  2. `TrainMenu`: bila `resumeInfo && onResume` → render tombol resume setelah blok header `rounded-3xl ...` dan sebelum `{GRADES.map(...)}`; class hijau `border-b-4 border-emerald-600 bg-emerald-500 text-white`, label `t('train.resumeSession', { gradeLabel: t('train.grade1'|'grade2'|'grade3'), n: resumeInfo.round + 1, total: resumeInfo.total })`; tambah `<p>` kecil `t('train.startNewHint')` (text-xs slate-400) di bawah tombol resume.
- Urutan: HUD (interface, destructure, 2 tombol) → Menu (interface, destructure, blok resume).
- Behavior dipertahankan: 4 tombol HUD existing identik; 3 tombol grade Menu identik.
- Error/edge: `resumeInfo` null → tombol resume tidak dirender; `onResume` undefined tapi `resumeInfo` ada → jangan render (guard `&&`).
- Test: tambahkan `tests/trainMenu.test.tsx` (2 case) agar F4 punya test.
- Input/expected test Menu: `render(<Providers><TrainMenu onStart={()=>{}} bestStarsByGrade={{}} resumeInfo={{grade:2,round:2,total:5}} onResume={()=>{}} /></Providers>)` → `screen.getByRole('button', { name: /Lanjutkan perjalanan/ })` ada; tanpa `resumeInfo` → `queryByRole` null. Provider: `NavigationProvider`+`ProgressProvider`+`LanguageProvider` (pola `tests/trainDialog.test.tsx`), `cleanup()` di finally.
- Command: `npm test -- tests/trainMenu.test.tsx` lalu `npm run typecheck`.
- Hasil: 2 case hijau; typecheck 0 error (error caller di S6 akan muncul — TETAPKAN: S5 selesai bila test-nya hijau; typecheck repo diperbaiki di S6).
- Completion: props exact; 2+1 tombol; test Menu hijau.
- Tidak boleh diubah: 4 tombol HUD existing, 3 tombol grade, `TrainCelebration`, `QuestionDialog`.

---

## S6 — `TrainScreen`: wiring narasi + snapshot + resume + keyboard `r`

- Tujuan: hubungkan narasi TTS (soal/hint/feedback/repeat), simpan & pulihkan sesi, tombol resume berfungsi.
- Finding: F1, F2, F3, F4, F6, C2, C4.
- Dependency: S1–S5.
- File dibaca: `src/screens/TrainScreen.tsx` penuh, `src/lib/trainNarration.ts`, `src/lib/trainStorage.ts`.
- File diubah: `src/screens/TrainScreen.tsx` saja.
- Simbol terkait: `speakTrain`, `repeatTrainNarration`, `stopTrainSpeech`, `speakablePrompt`, `saveTrainSession`, `loadTrainSession`, `clearTrainSession`, `lang` dari `useI18n`.
- Kondisi saat ini: `const { t } = useI18n()` (tanpa `lang`); tanpa narasi; tanpa snapshot.
- Perubahan konkret (urut dalam file):
  1. Import: tambah `repeatTrainNarration, speakTrain, stopTrainSpeech` ke import `'../lib/trainSound'`; tambah `clearTrainSession, loadTrainSession, saveTrainSession` + tipe `TrainSessionSnapshot` ke import `'../lib/trainStorage'`; tambah `speakablePrompt` dari `'../lib/trainNarration'`.
  2. `const { lang, t } = useI18n()` (ganti destructure).
  3. State baru: `const [voiceOn, setVoiceOn] = useState(() => loadTrainProgress().voiceEnabled ?? true)` dan `const [resumable, setResumable] = useState<TrainSessionSnapshot | null>(() => loadTrainSession())`.
  4. Helper `narrate` via `useCallback`:
     ```ts
     const narrate = useCallback((text: string) => { speakTrain(text, voiceOn) }, [voiceOn])
     ```
  5. `handleStart`: hitung `const qs = generateTrainSession(g, TOTAL_QUESTIONS)`; `setQuestions(qs)`; setelah `setMusicIntensity(1)` tambah `saveTrainSession({ version: 1, grade: g, questions: qs, round: 0, attemptsLog: [], savedAt: Date.now() }, undefined)` dan `setResumable(null)`.
  6. Handler baru `handleResumeSession` (`useCallback`, deps `[clearTimers, later, muted, musicOn, reducedMotion, resumable]`): bila `!resumable` return; `clearTimers()`; `finishedRef.current = false`; `setGrade(resumable.grade)`; `setQuestions(resumable.questions)`; `setRound(resumable.round)`; `setAttempts(0)` (F6: reset); `setAttemptsLog(resumable.attemptsLog)`; `setFeedback(null)`; `setShowHint(false)`; `setPausedFrom(null)`; `setCelebrate(false)`; `sceneRef.current?.reset()`; `setCameraMode('follow')`; `setPhase('INTRO')`; `if (!muted) playTrainWhistle()`; blok musik/chug sama seperti `handleStart`; `setMusicIntensity(resumable.round < 2 ? 1 : resumable.round < 4 ? 2 : 3)`; `setResumable(null)`; `later(800, () => { if (phaseRef.current === 'INTRO') setPhase('TRAIN_MOVING') })`.
  7. Narasi soal: di `handleReachJunction` callback existing `later(400, () => { if (phaseRef.current === 'APPROACHING_JUNCTION') setPhase('WAITING_FOR_ANSWER') })` tambah di dalamnya setelah setPhase:
     ```ts
     const q = questions[round]
     if (q) narrate(`${t('train.questionOf', { n: round + 1, total: TOTAL_QUESTIONS })}. ${speakablePrompt(q, lang)}.`)
     ```
     deps `handleReachJunction` tambah `questions, round, narrate, t, lang`.
  8. Narasi feedback benar: di cabang benar `handleAnswer`, setelah `setCelebrate(true)` tambah `later(300, () => narrate(t('train.correct')))`.
  9. Narasi feedback salah: di cabang salah, setelah `sceneRef.current?.setSignal(choiceIndex, false)` tambah `later(300, () => narrate(t('train.retry')))`.
  10. Narasi hint: di blok `if (nextAttempts >= 2)`, setelah `setShowHint(true)` tambah `later(900, () => { const q = questions[round]; if (q) narrate(`${t('train.hintTitle')}. ${q.hintText}`) })`.
  11. `handleToggleVoice`: mirror `handleToggleMusic`:
      ```ts
      const next = !voiceOn
      setVoiceOn(next)
      saveTrainProgress({ ...loadTrainProgress(), voiceEnabled: next }, undefined)
      if (!next) stopTrainSpeech()
      ```
      deps `[voiceOn]`.
  12. `handleRepeatNarration`: `repeatTrainNarration(voiceOn)` (deps `[voiceOn]`).
  13. Snapshot saat ronde selesai: di `handleReachStation` blok `round + 1 < TOTAL_QUESTIONS`, setelah `setMusicIntensity(...)` tambah:
      ```ts
      if (grade) saveTrainSession({ version: 1, grade, questions, round: round + 1, attemptsLog: log, savedAt: Date.now() }, undefined)
      ```
      deps `handleReachStation` tambah `grade, questions`.
  14. Bersihkan snapshot: di `finishSession` (setelah `saveTrainProgress`) tambah `clearTrainSession(undefined)`; di `ConfirmDialog onConfirm` (quit) tambah `clearTrainSession(undefined)` dan `stopTrainSpeech()`.
  15. Cleanup unmount: di effect cleanup existing (`clearTimers(); stopTrainAudio(); stopAllTrainAudio()`) tambah `stopTrainSpeech()`.
  16. Pause: `handlePause` tambah `stopTrainSpeech()`; `handleResume` tidak perlu (narasi berikutnya otomatis).
  17. Keyboard: di effect `onKey`, setelah handler `'n'` tambah:
      ```ts
      if (e.key === 'r' || e.key === 'R') { handleRepeatNarration(); return }
      ```
      deps effect tambah `handleRepeatNarration`.
  18. Render `TrainMenu`: tambah props
      ```tsx
      resumeInfo={resumable ? { grade: resumable.grade, round: resumable.round, total: TOTAL_QUESTIONS } : null}
      onResume={handleResumeSession}
      ```
  19. Render `TrainHUD`: tambah `voiceOn={voiceOn} onToggleVoice={handleToggleVoice} onRepeatNarration={handleRepeatNarration}`.
- Urutan: import → destructure lang → state → narrate → handleStart → handleResumeSession → narasi (junction/benar/salah/hint) → toggleVoice/repeat → snapshot ronde → clear (finish/quit) → cleanup/pause → keyboard → render.
- Behavior dipertahankan: state machine, timer `later`, guard fase, glow/wave/signal, kamera, confetti, ducking, music/chug, summary/result, mapping cabang, copy feedback exact.
- Error/edge: `questions[round]` undefined → guard `if (q)` sebelum narasi; `resumable` null → tombol resume tak dirender + handler return; fallback 2D (`sceneRef` null) → narasi tetap jalan (tidak bergantung scene); `voiceOn` false → `speakTrain` tetap simpan `lastNarration` (repeat bisa mengucapkan bila diaktifkan); refresh di tengah ronde → resume ronde itu dengan `attempts = 0`.
- Test: tidak ada test React baru (jsdom); pure coverage di S1–S3 + Menu di S5.
- Command: `npm run typecheck` + `npm run lint`.
- Hasil: 0 error keduanya (error caller S5 terselesaikan di sini).
- Completion: 19 sub-perubahan ada; typecheck+lint hijau.
- Tidak boleh diubah: `TrainScene`, `TrainCanvas`, `QuestionDialog`, `ConfirmDialog`, `TrainCelebration`, state machine, generator, `trainMusic`.

---

## S7 — Verifikasi otomatis (tanpa kode baru)

- Tujuan: buktikan constraint sebelum klaim selesai; bug-fix 1 baris hanya bila verifikasi gagal + dicatat.
- Finding: F1–F6 + C1–C4.
- Dependency: S1–S6.
- File dibaca: output command; `vite.config.ts` (baca saja).
- File diubah: tidak ada (kecuali bug-fix terpaksa + `npx prettier --write` pada file tersentuh S1–S6).
- Checklist exact:
  1. `npm run lint` → 0 error.
  2. `npm run typecheck` → 0 error.
  3. `npm test -- tests/trainStorage.test.ts tests/trainSessionStorage.test.ts tests/trainNarration.test.ts tests/trainSfx.test.ts tests/trainMenu.test.tsx` → hijau.
  4. `npm test` penuh → `failed = 0`.
  5. `npm run build` → sukses; `three` tetap chunk terpisah; TIDAK ada `.mp3/.wav/.ogg` di `dist/assets`.
  6. `npm run format:check` → hijau.
  7. Grep: (a) `gagal` (case-insensitive) di `src/components/train src/screens/TrainScreen.tsx src/i18n/dicts` → kosong; (b) `from 'three'` di `src/lib` → kosong; (c) `speechSynthesis` di `src` → hanya `aquariumSound.ts`, `gardenSound.ts`, `trainSound.ts`; (d) `shadowMap.enabled = true|ShaderMaterial|Physics` di `src/components/train` → kosong.
  8. Audit: tidak ada import `SpeechSynthesisUtterance` di luar `trainSound.ts`/`aquariumSound.ts`/`gardenSound.ts`.
- Behavior dipertahankan: tidak ada perubahan perilaku.
- Error/edge: bila 1–6 gagal → perbaiki minimal, ulangi, catat (file + baris + alasan) di Progress Log.
- Test: tidak ada test baru.
- Command: delapan di atas.
- Hasil: semua hijau/sesuai.
- Completion: 8 checklist hijau/tercatat; penyimpangan → blocker.
- Tidak boleh diubah: CI, vite config, file non-train.

---

## S8 — Checklist manual (preview + perangkat nyata)

- Tujuan: verifikasi indrawi (suara, resume) yang tidak bisa diuji vitest.
- Finding: F1–F6, C2, C4.
- Dependency: S7 hijau.
- File dibaca: tidak ada. Prasyarat: `npm run build` + `npm run preview -- --host 127.0.0.1 --port 4175`.
- File diubah: tidak ada.
- Langkah exact (catat centang/gagal + bukti di Progress Log):
  1. Desktop/laptop bersuara: mulai Kelas 1 → dengar peluit lalu narasi soal ("Soal 1 dari 5. 7 tambah 5."); jawab benar → narasi feedback + SFX bintang; jawab salah → narasi "Hampir benar, coba lagi."; setelah 2 salah → narasi hint.
  2. Tombol 🔁 → mengulang narasi terakhir.
  3. Toggle 🗣️ → narasi berhenti; toggle lagi → narasi berikutnya berbunyi; refresh halaman → preferensi tersimpan.
  4. Resume: mulai Kelas 2 → jawab 2 ronde (sampai soal 3) → refresh → menu menampilkan "Lanjutkan perjalanan (Kelas 2, soal 3/5)" → klik → lanjut di soal 3, bintang dari 2 soal sebelumnya tetap (`★` sesuai `attemptsLog`), attempts soal 3 = 0 (bintang bisa 3 lagi).
  5. Kedaluwarsa: set `savedAt` di localStorage ke 15 hari lalu (DevTools) → refresh → tombol resume tidak muncul + key terhapus.
  6. Selesai sesi → snapshot hilang (localStorage `asharu-train-session:v1` null); quit dikonfirmasi → snapshot hilang.
  7. Keyboard: `1/2/3` jawab, `m` SFX, `n` musik, `r` ulangi narasi, `Esc` jeda.
  8. Perangkat nyata (HP Android + iPhone bila ada): voice `id-ID` terdengar wajar; bila tak ada voice id → tetap berbunyi (fallback) dan catat kualitasnya.
  9. Console: 0 error/warning selama 1 sesi penuh; restart 3× tanpa `Context Lost`.
  10. Reduced-motion on: narasi tetap jalan (opsi terpisah); fallback 2D (WebGL off) → narasi + resume tetap berfungsi.
- Behavior dipertahankan: tidak ada perubahan kode selama S8 kecuali bug (kembali ke S7).
- Error/edge: Service Worker menyajikan build lama → rebuild + hard refresh + catat.
- Test: tidak ada.
- Command: `npm run preview -- --host 127.0.0.1 --port 4175` (foreground; hentikan setelah selesai).
- Hasil: 10 langkah centang.
- Completion: semua centang atau blocker tercatat (termasuk keterbatasan environment otomasi bila ada).
- Tidak boleh diubah: semua file (kecuali bug-fix terpaksa).

---

## S9 — Memory + bump 1.8.0 + handoff (tanpa commit)

- Tujuan: jejak lengkap; tanpa commit kecuali diminta eksplisit.
- Finding: penutup.
- Dependency: S7–S8.
- File dibaca: `git status --short`, `.memory/README.md`, `package.json`.
- File diubah (hanya ini):
  1. `package.json`: `1.7.0` → `1.8.0`.
  2. `.memory/YYYY-MM-DD/HHmmss-kereta-fase-4-tts-resume.md` (tugas, file diubah, keputusan, asumsi/risiko, blocker, verifikasi, commit proposal 1 baris, relasi plan).
  3. `.memory/README.md` (timestamp, 1 baris current state, 1 entri recent ≤20; jangan hapus histori).
  4. File plan ini (centang Tasks S0–S9 + Progress Log).
- TODO yang wajib tetap tertulis: TODO-2 sync progres (butuh backend/privacy — tetap TODO), TODO verifikasi manual interaktif penuh bila belum tuntas.
- Dilarang: `git add/commit/push`.
- Handoff checklist (wajib centang):
  - [ ] S0–S9 berurutan; API exact (`speakTrain`, `repeatTrainNarration`, `stopTrainSpeech`, `speakablePrompt`, `save/load/clearTrainSession`, `voiceEnabled`, props HUD/Menu baru, wiring S6).
  - [ ] `lint/typecheck/test/build/format:check` hijau; grep S7 sesuai; tanpa file audio biner.
  - [ ] Manual S8 dicentang (termasuk voice perangkat nyata + resume + kedaluwarsa 14 hari).
  - [ ] `package.json` 1.8.0; memory + plan diperbarui; jawaban akhir = ringkasan file, keputusan, batasan.
- Completion: 4 file diperbarui; tanpa commit.
- Tidak boleh diubah: semua kode/test selain S9.1.

---

## Progress Log

- 2026-09-25 16:30:00 — Plan Fase 4 (TTS browser + resume sesi) dibuat. Keputusan pengguna: repeat button perlu; feedback diucapkan; attempts reset saat resume; kedaluwarsa 14 hari. Belum ada implementasi.
- 2026-09-25 17:15:00 — S0–S9 selesai. lint/typecheck/test (54 file/389 test)/build/format hijau; tanpa aset audio di dist; grep constraint lolos. Manual: HUD 6 tombol (mute/musik/voice/repeat/jeda/keluar) tampil; resume terverifikasi end-to-end (mulai Kelas 2 → refresh → tombol "Lanjutkan perjalanan (Kelas 2, soal 1/5)" + hint → klik → soal `42 ? 98` dipulihkan dari snapshot). Penyimpangan minor: tambah `isTrainSpeaking()` getter di `trainSound.ts` (state `speaking` perlu terbaca agar lolos `noUnusedLocals`). Versi 1.8.0. Keterbatasan: verifikasi audio nyata/perangkat + restart 3×/WebGL-off/reduced-motion belum dapat dijalankan di otomasi (tab headless ter-throttle rAF) → TODO verifikasi manual. Tanpa commit.

## Notes

- **Keputusan terkunci:** TTS = browser `speechSynthesis` (bukan rekaman); voice `id-ID` bila ada, fallback tetap bicara; anti-tumpuk via `cancelSpeech()`; toggle voice default `true` + persist `voiceEnabled`; snapshot per-batas-ronde (mid-round diulang, attempts reset); TTL 14 hari; key snapshot terpisah `asharu-train-session:v1`.
- **Counter-pertimbangan yang ditolak:** TTS rekaman ~35 klip (ditolak: bundle + maintenance); resume mid-round per-frame (ditolak: kompleks, rawan bug kurva/kamera); menyimpan `attempts`/`showHint` di snapshot (ditolak: reset lebih deterministik); sync backend (tetap TODO-2).
- **Batasan yang tetap ada setelah plan ini:** kualitas voice `id-ID` bergantung perangkat; konflik screen reader tidak terdeteksi otomatis; `hintText` generator berbahasa Indonesia saja (tidak diterjemahkan ke EN untuk narasi); refresh mid-round mengulang ronde (attempts reset); progres tetap lokal; TODO-2 belum.
- **OQ tersisa:** tidak ada yang memblokir. Bila `SpeechSynthesisUtterance` tidak ada di environment test tertentu → guard `supportsSpeech()` sudah menangani.
- **Perintah (eksekutor):** `npm run lint`, `npm run typecheck`, `npm test`, `npm test -- <file>`, `npm run build`, `npm run format:check`, `npm run preview -- --host 127.0.0.1 --port 4175`, `git status --short`. Dilarang: `git add/commit/push`, perubahan di luar file listed.

---

## Handoff Checklist (untuk model eksekutor kecil)

- [ ] Kerjakan S0→S9 berurutan; S1–S3 hijau sebelum UI (S5) dan Screen (S6).
- [ ] Setiap langkah: baca file listed → ubah hanya file listed → API + cuplikan exact → test listed → command listed → penuhi completion criteria.
- [ ] Setiap finding F1–F6 + constraint C1–C4 ditangani ≥1 langkah + verifikasi.
- [ ] Jangan ubah area "Tidak boleh diubah"; bila harus, jadikan blocker + minta keputusan.
- [ ] Akhiri dengan S7–S9 + ringkasan file diubah, keputusan arsitektur, batasan tersisa.
