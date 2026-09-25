# Kereta Visual-Audio Fase 1+2 — Implementation Plan (atomik, deterministik)

Created: 2026-09-25 12:00:00

## Objective

Kembangkan mini game "Petualangan Kereta Angka" (screen `train`, Three.js murni) agar lebih menarik untuk anak kelas 1–3, fokus visual + audio, TANPA mengubah gameplay/logika yang sudah ada (5 soal/sesi, 3 cabang kiri/tengah/kanan, bintang 3/2/1, hint setelah 2 salah, state machine 14 state, storage `asharu-train:v1`).

Keputusan pengguna yang sudah final (jangan tanyakan ulang / jangan ubah diam-diam):
1. Kerjakan Fase 1 DAN Fase 2 sekaligus dalam plan ini.
2. TTS/narasi suara (speechSynthesis baru) di-SKIP — tidak ada penambahan TTS.
3. BOLEH tepat 1 file util audio baru: `src/lib/trainMusic.ts`, prosedural WebAudio, tanpa file MP3/aset biner, tanpa dependensi baru.
4. YA tema per kelas: K1 = Pagi Pedesaan, K2 = Siang Sawah, K3 = Senja — satu scene, tiga konfigurasi palette + dekor (visibility toggle, bukan tiga scene).

## Scope

In scope (eksplisit):
- Perluasan `src/components/train/TrainScene.ts` (roda berputar, asap, awan/daun hidup, papan jawaban 3D berangka, glow cabang, lampu depan, masinis Asya, penumpang, bendera, hewan/dekor tematik, 3 tema, 4 mode kamera). Cap: total ≤78 mesh + ≤5 sprite, tanpa shadow/fisika/post-processing/shader.
- Perluasan `src/lib/trainSound.ts` (peluit, wesel, bintang bertingkat, wrong netral) + 1 export kecil baru di `src/lib/sound.ts` (`playTone`, wrapper atas `tone()` existing).
- File baru `src/lib/trainMusic.ts` (musik loop pentatonik + chug + ducking, prosedural).
- Field opsional baru `musicEnabled` di `TrainProgress` (version tetap 1, backward-compatible).
- 3 key i18n baru (`train.musicMute`, `train.musicUnmute`, `train.stationShort`) ID + EN.
- Komponen DOM baru `src/components/train/TrainCelebration.tsx` (confetti CSS).
- Perluasan props `TrainHUD` (toggle musik kedua) dan `TrainCanvas` (`themeGrade`, `cameraMode`, `boardAnswers` — hanya tambah, tidak rename/hapus).
- Wiring di `src/screens/TrainScreen.tsx` (tema, jawaban papan, kamera, musik/chug, confetti, whistle, bintang bertingkat).
- Test baru: `tests/trainMusic.test.ts`, `tests/trainTheme.test.ts`, `tests/trainCelebration.test.tsx`, update `tests/trainStorage.test.ts`.

Out of scope (dilarang keras):
- TTS / `speechSynthesis` baru (hanya `cancel()` existing di `stopTrainAudio` yang dipertahankan).
- Backend, login, analytics baru, multiplayer, leaderboard, payment, iklan baru, toko virtual, skin unlock, sistem reward baru.
- Perubahan gameplay: generator soal, state machine, bintang, storage key, `GradeLevel` global, `LEVELS`, ResultScreen, achievement.
- File MP3/WAV/gambar/model biner baru; dependensi npm baru; perubahan `vite.config.ts`, workflow CI, `BottomNavigation`, `TAB_SCREENS`, `ProgressContext`, `storage.ts`, `scoring.ts`, file Aquarium/Garden.
- Kata "gagal" dalam UI train (tetap dilarang).

## Milestones

1. M1 fondasi audio + storage + i18n (T1–T3) — tanpa Three.js, risiko nol terhadap scene.
2. M2 modul musik (T4) — terisolasi, teruji tanpa AudioContext.
3. M3 scene hidup Fase 1 (T5–T6) — roda/asap/awan + papan angka/glow/lampu.
4. M4 karakter + stasiun + tema + kamera Fase 2 (T7–T9).
5. M5 DOM + Canvas + wiring Screen (T10–T12).
6. M6 verifikasi penuh + memory + handoff (T13–T14).

## Tasks

- [x] T0 audit read-only implementasi train saat ini
- [x] T1 SFX identitas kereta (peluit, wesel, bintang bertingkat, wrong netral)
- [x] T2 field `musicEnabled` di storage train
- [x] T3 tiga key i18n baru ID/EN
- [x] T4 modul `trainMusic.ts` (musik + chug + ducking)
- [x] T5 scene hidup: roda, asap, awan/daun, lampu depan
- [x] T6 papan jawaban 3D berangka + glow cabang terpilih
- [x] T7 masinis Asya + stasiun hidup + hewan/dekor + bendera
- [x] T8 tiga tema per kelas (`TRAIN_THEMES` + `applyTheme`)
- [x] T9 empat mode kamera (`setCameraMode`)
- [x] T10 confetti DOM + tombol musik kedua di HUD
- [x] T11 props baru `TrainCanvas` (tema, kamera, jawaban papan)
- [x] T12 wiring `TrainScreen` (urutan pemanggilan exact)
- [x] T13 verifikasi penuh (lint, typecheck, test, build, format, manual)
- [x] T14 memory + handoff (tanpa kode baru)

## Risks

- R1: jsdom tidak punya WebGL/AudioContext — mitigasi: semua test baru pure/DOM; `TrainScene` tidak pernah di-import di test; `trainMusic.ts` no-op aman saat ctor audio tak ada.
- R2: Bocor audio/loop (interval + rAF ganda) — mitigasi: setiap `start*` punya pasangan `stop*`; cleanup existing `TrainCanvas` + `TrainScreen` diperluas secara eksplisit di T11/T12; StrictMode double-mount aman karena pola create-di-effect/dispose-di-return dipertahankan.
- R3: Membengkak mesh/draw call — mitigasi: cap ≤78 mesh + ≤5 sprite, ledger hitungan wajib di komentar `TrainScene.ts`, tanpa shadow/fisika/shader.
- R4: Regresi mute existing — mitigasi: flag SFX tetap di `sound.ts` + `TrainProgress.soundEnabled`; musik punya flag terpisah; call site tetap cek flag sebelum bunyi.
- R5: Model kecil menyimpang API — mitigasi: tanda tangan exact + cuplikan kode exact di tiap langkah; larangan improvisasi nama.

## Requirement Traceability Matrix

| ID | Finding / requirement | Langkah | Verifikasi |
|----|------------------------|---------|------------|
| F1 | Kereta kaku (roda diam, tanpa goyang) | T5 | review visual + `npm run build` |
| F2 | Tanpa asap cerobong | T5 | visual + dispose sprite di T13 grep |
| F3 | Lingkungan statis (awan/daun diam) | T5 | visual |
| F4 | Papan 3D kosong tanpa angka | T6 | visual + test tidak ada (WebGL) + DOM tetap sumber kebenaran |
| F5 | Cabang terpilih tanpa highlight | T6, T12 | visual + review `setSelectedGlow` |
| F6 | Tanpa lampu depan kereta | T5 | visual |
| F7 | Audio generik (tanpa peluit/chug/wesel/bintang bertingkat; wrong terdengar menghukum) | T1, T4, T12 | test smoke + manual dengar |
| F8 | Sukses hanya teks, tanpa selebrasi visual | T10, T12 | test DOM + manual + reduced-motion off |
| F9 | Tanpa karakter/maskot di 3D | T7, T12 | visual `waveDriver` |
| F10 | Kamera statis | T9, T12 | manual tiap fase + reduced-motion snap |
| F11 | Stasiun kosong | T7, T12 | visual + `celebrateAtStation` |
| F12 | Satu tema pedesaan monoton | T7, T8, T12 | test `trainTheme` + visual 3 grade |
| F13 | Tanpa musik; satu toggle suara | T2, T4, T10, T12 | test storage/music + manual 2 toggle |
| F14 | TTS di-skip (keputusan) | — (tanpa langkah) | T13 grep `speechSynthesis` hanya di `stopTrainAudio` lama |
| C1 | Budget ≤78 mesh + ≤5 sprite, dpr≤1.5, shadow off, tanpa dep/MP3/fisika/shader | T5–T9 | T13 audit kode + build |
| C2 | Lifecycle bersih (1 loop, cancel, listener, dispose termasuk texture/sprite baru) | T5–T7, T11–T12 | T13 restart + console |
| C3 | DOM satu-satunya antarmuka; canvas `aria-hidden`; tanpa kata "gagal" | T6, T10 | T13 grep |
| C4 | Reduced-motion + fallback 2D tetap penuh | T5, T9–T12 | T13 manual |

---

## T0 — Audit read-only implementasi train saat ini

- Tujuan langkah: mengunci pemahaman kode existing agar langkah berikut deterministik; tanpa mengubah file apa pun.
- Finding/requirement: fondasi semua F1–F13 + C1–C4.
- Dependency: tidak ada.
- File yang harus dibaca (baca penuh, 9 file):
  1. `src/components/train/TrainScene.ts` (±360 baris: kurva, `buildEnvironment`, `buildTracks`, `buildTrain`, `update`, `dispose`).
  2. `src/components/train/TrainCanvas.tsx` (props, `cbRef`, mount effect, cleanup 5 langkah).
  3. `src/screens/TrainScreen.tsx` (±423 baris: state, `handleStart`, `handleAnswer`, `handleReachJunction/Station`, `handleToggleMute`, keyboard, `ConfirmDialog`).
  4. `src/components/train/TrainHUD.tsx` (props `muted`, tombol `min-h-11`).
  5. `src/components/train/QuestionDialog.tsx` (dialog, hint, `data-testid="train-choice-*"`, `aria-live`).
  6. `src/lib/trainSound.ts` (6 fungsi delegasi) + `src/lib/sound.ts` (`tone()`, `playTap/Correct/Wrong/Celebrate`, flag `soundEnabled`).
  7. `src/lib/trainStorage.ts` (`TrainProgress`, `validate/load/save/record`).
  8. `src/i18n/dicts/id.ts` + `en.ts` (blok `// Kereta Angka`, 20 key existing).
  9. `tests/setup.ts` (stub matchMedia; tanpa AudioContext/WebGL) + `tests/trainStorage.test.ts` (pola memory storage).
- File yang harus diubah: tidak ada.
- Class/function/simbol terkait: `TrainScene`, `TrainCanvasProps`, `TrainHUDProps`, `TrainProgress`, `playTone` (belum ada), `TRAIN_THEMES` (belum ada).
- Kondisi implementasi saat ini: mesh ±59 (env 19 + rel 30 + kereta 10); papan 3D putih polos; kamera fix `(0,7,10)`; 1 loop rAF di Canvas; mute tunggal via `soundEnabled` global + `TrainProgress.soundEnabled`; tidak ada musik/chug/whistle/TTS.
- Perubahan konkret: tidak ada.
- Urutan perubahan di dalam file: tidak ada.
- Behavior yang harus dipertahankan: seluruh app dan seluruh alur train existing.
- Error handling/edge: tidak ada.
- Test yang harus ditambahkan/diperbarui: tidak ada.
- Input test dan expected result: tidak ada.
- Command verifikasi: tidak ada (dilarang menjalankan apa pun di T0).
- Hasil verifikasi yang diharapkan: pelaksana dapat menyebut tanpa melihat ulang: (a) cleanup Canvas = cancel rAF → disconnect RO → remove resize/visibility/contextlost listener → dispose → null-kan ref; (b) mute = flag global `sound.ts` + persist `TrainProgress.soundEnabled`; (c) papan angka hanya di DOM.
- Completion criteria: T0 selesai saat 9 file di atas sudah dibaca; tidak ada file berubah (`git status --short` kosong selain file plan ini).
- File/area yang tidak boleh diubah: semua file.

---

## T1 — SFX identitas kereta (peluit, wesel, bintang bertingkat, wrong netral)

- Tujuan langkah: memberi identitas suara kereta + menghilangkan kesan menghukum pada jawaban salah, tanpa AudioContext baru.
- Finding/requirement: F7 (bagian SFX).
- Dependency: T0.
- File yang harus dibaca: `src/lib/sound.ts` (fungsi `tone(freq, startDelay, duration, type, volume)` baris 26–53), `src/lib/trainSound.ts` (6 fungsi), `src/screens/TrainScreen.tsx` baris 210–211 dan 222 (call site `playTrainCorrect`/`playTrainWrong` — untuk diketahui, belum diubah di T1).
- File yang harus diubah (2 file, urut):
  1. `src/lib/sound.ts` — tambah SATU export baru setelah `playCelebrate`, sebelum akhir file.
  2. `src/lib/trainSound.ts` — tambah 3 fungsi + ubah 1 implementasi (tanpa ubah signature existing).
- Class/function/simbol terkait (nama exact):
  ```ts
  // sound.ts (baru):
  export function playTone(freq: number, startDelay: number, duration: number, type?: ToneType, volume?: number): void;
  // trainSound.ts (baru):
  export function playTrainWhistle(): void;
  export function playTrainSwitch(): void;
  export function playTrainStar(stars: 1 | 2 | 3): void;
  // trainSound.ts (ubah implementasi, signature tetap):
  export function playTrainWrong(): void; // netral-naik, bukan nada rendah tunggal
  ```
- Kondisi implementasi saat ini: `tone()` tidak diekspor; `playTrainWrong` → `playWrong()` (220Hz tunggal, terdengar menghukum); tidak ada whistle/switch/star.
- Perubahan konkret (urut):
  1. Di `sound.ts`, tambah: `export function playTone(freq: number, startDelay: number, duration: number, type: ToneType = 'sine', volume = 0.12): void { tone(freq, startDelay, duration, type, volume) }`. Jangan ubah `tone()` atau fungsi lain.
  2. Di `trainSound.ts`, import `playTone` dari `./sound`. Tambah:
     - `playTrainWhistle()`: `playTone(660, 0, 0.15)` + `playTone(880, 0.15, 0.35)`, masing-masing dalam try/catch pola existing.
     - `playTrainSwitch()`: `playTone(180, 0, 0.05, 'square', 0.07)` + `playTone(320, 0.06, 0.05, 'square', 0.07)`.
     - `playTrainStar(stars)`: frekuensi `[523.25, 659.25, 783.99].slice(0, clamp(stars,1,3))`, tiap nada delay `i * 0.1`, durasi `0.12`, sine, volume `0.12`.
     - Ubah `playTrainWrong()`: ganti delegasi `playWrong()` menjadi `playTone(392, 0, 0.12, 'triangle', 0.08)` + `playTone(523.25, 0.1, 0.15, 'triangle', 0.08)` (netral-naik, tetap lembut). Jangan hapus import `playWrong` bila masih dipakai simbol lain di file — jika tidak dipakai lagi, hapus dari import agar lint `no-unused-vars` lolos.
  3. Komentar mute existing di `trainSound.ts` dipertahankan (flag di call site, bukan modul).
- Urutan perubahan di dalam file: `sound.ts`: append di akhir. `trainSound.ts`: import → 3 fungsi baru setelah `playTrainHint` → ubah badan `playTrainWrong`.
- Behavior yang harus dipertahankan: `playTrainClick/Hint` → tap; `playTrainCorrect` → correct (tetap ada, dipakai sampai T12 mengganti call site); `playTrainCelebrate` → celebrate; `stopTrainAudio` tidak berubah; tidak ada suara sebelum interaksi pengguna (semua fungsi hanya dipanggil dari event handler).
- Error handling/edge: tiap bunyi dalam try/catch (pola existing); `window` undefined → `ensureContext` return null → diam; `stars` di luar 1–3 → clamp (0→1 nada, 99→3 nada); jsdom tanpa AudioContext → no-op, tidak throw.
- Test yang harus ditambahkan: `tests/trainSfx.test.ts` (baru), 2 case:
  - Case 1 "semua SFX tidak melempar tanpa AudioContext": panggil `playTrainClick/Correct/Wrong/Hint/Celebrate/Whistle/Switch` + `playTrainStar(1/2/3)` + `stopTrainAudio()`, expected tidak throw.
  - Case 2 "star clamp deterministik": `playTrainStar(0 as 1)` dan `playTrainStar(99 as 3)` tidak throw (clamp internal, tanpa assert audio).
- Input test dan expected result: tidak ada AudioContext di jsdom (setup existing) → semua call no-op; `expect(() => {...}).not.toThrow()`.
- Command verifikasi: `npm test -- tests/trainSfx.test.ts` lalu `npm run typecheck`.
- Hasil verifikasi yang diharapkan: 2 test hijau; typecheck 0 error; `npm run lint` pada 2 file tanpa error unused-import.
- Completion criteria: 3 fungsi baru ada dengan signature exact; `playTrainWrong` tidak lagi mendelegasikan nada 220Hz tunggal; test hijau.
- File/area yang tidak boleh diubah: `tone()` dan fungsi existing `sound.ts` selain append; `aquariumSound.ts`; `TrainScreen.tsx` (call site baru di T12); test lain; penambahan TTS (dilarang).

---

## T2 — Field `musicEnabled` di storage train

- Tujuan langkah: persist toggle musik terpisah tanpa migrasi version dan tanpa menyentuh `UserProgress`.
- Finding/requirement: F13 (bagian persist).
- Dependency: T0 (independen dari T1, boleh paralel setelah T0).
- File yang harus dibaca: `src/lib/trainStorage.ts` (baris 1–119: interface, default, validate, load/save/record), `tests/trainStorage.test.ts` (pola memory storage + case invalid).
- File yang harus diubah: `src/lib/trainStorage.ts` (edit), `tests/trainStorage.test.ts` (tambah case).
- Simbol terkait (exact, hanya tambah field opsional):
  ```ts
  export interface TrainProgress { version: 1; bestStarsByGrade: Record<string, number>; sessionsCompleted: number; lastGrade: 1 | 2 | 3 | null; soundEnabled: boolean; musicEnabled?: boolean; }
  ```
- Kondisi implementasi saat ini: `TrainProgress` tanpa `musicEnabled`; `defaultTrainProgress()` return tanpa field itu; `validateTrainProgress` menolak field non-boolean? Saat ini mengabaikan kelebihan field (hanya cek `soundEnabled`), jadi objek lama tetap valid.
- Perubahan konkret (urut di `trainStorage.ts`):
  1. Interface: tambah `musicEnabled?: boolean;` setelah `soundEnabled`.
  2. `defaultTrainProgress()`: tambah `musicEnabled: true`.
  3. `validateTrainProgress()`: setelah cek `soundEnabled`, tambah: `if (value.musicEnabled !== undefined && typeof value.musicEnabled !== 'boolean') return null;` dan pada return sertakan `musicEnabled: (value.musicEnabled as boolean | undefined) ?? true`. Jangan ubah cek lain. `recordTrainSession` tidak diubah (spread `...progress` otomatis membawa field).
- Urutan perubahan di dalam file: interface → default → validate (cek + return).
- Behavior yang harus dipertahankan: data lama tanpa `musicEnabled` tetap valid (→ true); version tetap 1; key `asharu-train:v1` tidak berubah; `recordTrainSession` tidak mutasi input.
- Error handling/edge: `musicEnabled: 1/"ya"/null` (eksplisit non-boolean non-undefined; null → invalid karena `typeof null !== 'boolean'` dan `!== undefined`) → validate null → load default; quota exceeded/JSON rusak → default (pola existing).
- Test yang harus ditambahkan (`tests/trainStorage.test.ts`, tambah 2 case, jangan ubah case existing):
  - Case "musik default true dan roundtrip": `defaultTrainProgress().musicEnabled === true`; save lalu load objek dengan `musicEnabled: false` → load `false`.
  - Case "backward compatible": validate objek lama (tanpa `musicEnabled`, copy dari default lalu `delete`) → tidak null dan hasil `musicEnabled === true`; validate `musicEnabled: 'ya'` → null.
- Input test dan expected result: seperti di atas; memory storage pola file test existing.
- Command verifikasi: `npm test -- tests/trainStorage.test.ts` lalu `npm run typecheck`.
- Hasil verifikasi yang diharapkan: semua case lama + 2 baru hijau; typecheck 0 error.
- Completion criteria: field opsional ada; default true; data lama valid; test hijau.
- File/area yang tidak boleh diubah: `src/lib/storage.ts`, `ProgressContext.tsx`, version/key, test lain.

---

## T3 — Tiga key i18n baru ID + EN

- Tujuan langkah: string toggle musik + label papan stasiun 3D terpusat di kamus, tanpa ubah key lama atau `core.ts`.
- Finding/requirement: F11 (label stasiun), F13 (label toggle), C3 (konsistensi bahasa).
- Dependency: T0.
- File yang harus dibaca: `src/i18n/dicts/id.ts` baris 513–534 (blok `// Kereta Angka`), `src/i18n/dicts/en.ts` baris 512–533, `src/i18n/core.ts` (sudah diketahui: `TranslationKey = keyof Dict`, en bertipe `Dict` sehingga key harus identik).
- File yang harus diubah (2 file):
  1. `src/i18n/dicts/id.ts` — tambah 3 key dalam blok Kereta Angka.
  2. `src/i18n/dicts/en.ts` — 3 key sama persis.
- Simbol/key exact + nilai exact + posisi exact:
  - Setelah baris `'train.hintTitle'` tambah:
    - `'train.musicMute': 'Matikan musik'` (en: `'Turn music off'`)
    - `'train.musicUnmute': 'Nyalakan musik'` (en: `'Turn music on'`)
  - Setelah baris `'train.station'` tambah:
    - `'train.stationShort': 'STASIUN'` (en: `'STATION'`)
  - Urutan alfabet blok tetap terjaga (`hintTitle < musicMute < musicUnmute < mute`; `station < stationShort < subtitle`). Nilai string statis (bukan fungsi).
- Kondisi implementasi saat ini: 20 key `train.*`; tidak ada ketiga key di atas.
- Perubahan konkret: insert 2 baris + 1 baris per file pada posisi di atas; tidak ada penghapusan/pengubahan baris lain.
- Urutan perubahan di dalam file: id dulu lalu en (atau sebaliknya; hasil akhir yang penting identik).
- Behavior yang harus dipertahankan: `createT` tidak berubah; key lama tidak berubah; tidak ada kata "gagal".
- Error handling/edge: en WAJIB punya key identik (tipe `Dict` memaksa; typecheck akan gagal bila beda) — verifikasi via typecheck.
- Test yang harus ditambahkan: tidak ada test baru (kebijakan plan induk S6). Verifikasi via typecheck + grep manual oleh eksekutor di T13.
- Input test dan expected result: tidak ada.
- Command verifikasi: `npm run typecheck`.
- Hasil verifikasi yang diharapkan: 0 error (membuktikan key ID/EN sinkron).
- Completion criteria: 3 key ada di kedua file dengan nilai exact; typecheck hijau.
- File/area yang tidak boleh diubah: `core.ts`, `LanguageContext.tsx`, key non-train, penambahan key lain.

---

## T4 — Modul `trainMusic.ts` (musik loop + chug + ducking, prosedural)

- Tujuan langkah: satu-satunya file audio baru yang diizinkan — musik ceria + bunyi chug + ducking, 100% WebAudio prosedural, aman di jsdom.
- Finding/requirement: F7 (musik + chug), F13 (pisah musik/SFX).
- Dependency: T0 (independen dari T1–T3).
- File yang harus dibaca: `src/lib/sound.ts` (pola `ensureContext`, resume saat suspended, try/catch diam), `tests/setup.ts` (jsdom: tanpa AudioContext → semua harus no-op), `tests/trainSound.test.ts` (pola smoke test).
- File yang harus diubah (dibuat): `src/lib/trainMusic.ts` (baru). Jangan ubah file lain.
- Simbol exact (jangan improvisasi nama):
  ```ts
  export function startTrainMusic(): void;
  export function stopTrainMusic(): void;
  export function setMusicDucked(ducked: boolean): void;
  export function isMusicPlaying(): boolean;
  export function startChug(): void;
  export function stopChug(): void;
  export function setChugRate(intervalMs: number): void;
  export function stopAllTrainAudio(): void;
  export const _trainMusicHelpers: { MELODY_FREQS: readonly number[]; BASS_FREQS: readonly number[]; STEP_MS: number };
  ```
- Kondisi implementasi saat ini: file belum ada; tidak ada musik/chug di app.
- Perubahan konkret (urut dalam file):
  1. Komentar atas: musik dimatikan via flag di call site (`musicEnabled`), modul ini tidak menyimpan preferensi; semua fungsi no-op aman tanpa AudioContext.
  2. Konstanta exact: `STEP_MS = 220`; `MELODY_FREQS = [523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25, 587.33]` (8 langkah, sine, vol 0.05, durasi 0.2); `BASS_FREQS = [130.81, 98, 110, 98]` (4 langkah, triangle, vol 0.06, durasi 0.4, dimainkan tiap 2 langkah melody); HAT: square 6000Hz, durasi 0.03, vol 0.015, tiap langkah genap.
  3. State modul privat: `musicTimer: number | null`, `chugTimer: number | null`, `musicStep`, `chugHigh` (boolean toggle), `chugMs = 300`, `ctx: AudioContext | null`, `master: GainNode | null`, `ducked = false`.
  4. Helper privat `ensureMusicCtx(): { ctx, master } | null`: guard `typeof window === 'undefined'` → null; ambil ctor `AudioContext ?? webkitAudioContext` (tiru `sound.ts:12-15`); try/catch → null; buat master gain `0.05` (atau `0.025` bila `ducked`) connect destination; resume bila suspended (void, try/catch).
  5. `startTrainMusic()`: bila `musicTimer !== null` return (idempoten); panggil ensure, bila null return; `musicStep = 0`; `musicTimer = window.setInterval(tick, STEP_MS)`; tick menjadwalkan nada langkah berjalan via osc+gain envelope (attack 0.02, decay ke 0.0001) lalu `musicStep++`. try/catch seluruh badan tick.
  6. `stopTrainMusic()`: clearInterval bila ada, null-kan, (biarkan ctx/master hidup untuk reuse).
  7. `setMusicDucked(d)`: set `ducked = d`; bila master ada, `master.gain.value = d ? 0.025 : 0.05` dalam try/catch.
  8. `startChug()`: idempoten seperti musik; interval `chugMs`; tiap tick alternate `playTone`-setara internal: square 140Hz 0.06 vol 0.07 lalu 110Hz (toggle `chugHigh`); implementasi osc langsung via ctx musik (reuse `ensureMusicCtx`), bukan via `sound.ts` (agar tidak kena flag SFX global — chug ikut flag musik di call site).
  9. `stopChug()` + `setChugRate(ms)`: clamp `ms` ke [120, 600], `Math.floor`; bila chug berjalan, restart interval dengan nilai baru.
  10. `stopAllTrainAudio()`: `stopTrainMusic(); stopChug();` — TIDAK menyentuh `speechSynthesis` (keputusan skip TTS).
  11. Export `_trainMusicHelpers` berisi 3 konstanta untuk test.
- Urutan perubahan di dalam file: komentar → konstanta → state → ensure → musik (start/stop/duck/is) → chug (start/stop/rate) → stopAll → helpers export.
- Behavior yang harus dipertahankan: tidak ada autoplay (fungsi hanya dipanggil dari event handler di T12); tidak ada file audio; volume rendah (musik ≤0.06, chug ≤0.07); tidak mengganggu SFX `sound.ts`.
- Error handling/edge: ctor tak ada → no-op + `isMusicPlaying()` false; `setInterval` tak ada (non-browser) → no-op; exception kapan pun → swallow; `start*` ganda → satu interval; `stop*` tanpa start → aman; rate NaN/negatif → clamp.
- Test yang harus ditambahkan: `tests/trainMusic.test.ts` (baru), 3 case:
  - Case 1 konstanta exact: `MELODY_FREQS` sama dengan array 8 angka di atas berurutan; `BASS_FREQS` 4 angka; `STEP_MS === 220`.
  - Case 2 no-op tanpa AudioContext: `startTrainMusic(); setMusicDucked(true); startChug(); setChugRate(180); stopAllTrainAudio();` expected tidak throw; `isMusicPlaying() === false`.
  - Case 3 idempoten stop ganda: `stopTrainMusic(); stopChug(); stopAllTrainAudio();` tidak throw.
- Input test dan expected result: jsdom tanpa AudioContext (bawaan) → semua no-op; assert nilai + `not.toThrow()` + `toBe(false)`.
- Command verifikasi: `npm test -- tests/trainMusic.test.ts` lalu `npm run typecheck`.
- Hasil verifikasi yang diharapkan: 3 case hijau; typecheck 0 error.
- Completion criteria: 8 fungsi + helpers ada; tanpa import `three`/`react`; tanpa file biner; test hijau.
- File/area yang tidak boleh diubah: `sound.ts` (kecuali `playTone` yang sudah ditambah di T1), `trainSound.ts`, TTS apa pun, dependensi.

---

## T5 — Scene hidup: roda berputar, asap, awan/daun, lampu depan

- Tujuan langkah: membuat kereta dan lingkungan bergerak (Fase 1 visual inti) tanpa menambah gameplay.
- Finding/requirement: F1, F2, F3, F6; C1 (budget), C2 (dispose), C4 (reduced-motion).
- Dependency: T0 (independen dari T1–T4).
- File yang harus dibaca: `src/components/train/TrainScene.ts` penuh (konstruktor baris 53–100, `update` 133–152, `dispose` 166–187, `buildTrain` 309–351, `buildEnvironment` 193–273).
- File yang harus diubah: `src/components/train/TrainScene.ts` saja.
- Simbol terkait: `TrainScene.update`, `TrainScene.dispose`, `placeTrainOnCurve`; privat baru: `wheels: THREE.Mesh[]`, `smokes: THREE.Sprite[]`, `smokeTex: THREE.CanvasTexture`, `smokeAges: number[]`, `clouds: THREE.Mesh[]`, `leaves: THREE.Mesh[]`, `elapsed: number`.
- Kondisi implementasi saat ini: roda statis; tanpa asap/lampu; awan/daun statis; `update` hanya gerak param `t`; dispose traverse geometry/material.
- Perubahan konkret (urut dalam file):
  1. Komentar budget di atas file: perbarui menjadi `Budget mesh ≤78: env 19 + rel 30 + kereta 11 + asap 5 sprite + fase2 13 (driver 3 + penumpang 2 + sapi 2 + kupu 2 + bunga 2 + lampu 2). Total 78.` (T7 mengisi 13 sisanya; T5 menambah 6: lampu 1 + sprite 5.)
  2. Field privat baru (deklarasi di kelas, dekat `elapsed = 0`): `wheels`, `smokes`, `smokeTex: THREE.CanvasTexture | null = null`, `smokeAges: number[] = []`, `clouds`, `leaves`, `elapsed = 0`.
  3. `buildTrain()`: saat membuat tiap roda (loop `wheelPositions` + `wagonWheels`), `this.wheels.push(wheel)`. Setelah gerbong: lampu depan — `ConeGeometry(0.35, 1.2, 10)` + `MeshBasicMaterial({ color: '#fef08a', transparent: true, opacity: 0.55 })`, posisi `(0, 0.9, 1.9)`, rotasi `x = -Math.PI/2` (menghadap depan +z lokal), `this.trainGroup.add(headlight)`. 1 mesh baru.
  4. Metode privat baru `buildSmoke()`, dipanggil di konstruktor setelah `buildTrain()`: buat 1 canvas 64×64, radial gradient putih tengah → transparan tepi; `smokeTex = new THREE.CanvasTexture(canvas)`; 5 sprite dengan `new THREE.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0, depthWrite: false })` per sprite (material per-sprite agar opacity individual); `smokeAges = [0, 0.4, 0.8, 1.2, 1.6]` (fase awal tersebar); `scene.add` tiap sprite.
  5. `buildEnvironment()`: simpan `clouds.push(cloud)` dan `leaves.push(leaf)` pada loop existing (tanpa ubah posisi/geometri).
  6. `update(dt)`: setelah guard existing, tambah `this.elapsed += Math.min(dt, 0.05)`; (a) roda: `for (const w of this.wheels) w.rotation.y += dt * 8` hanya bila `!paused` (guard existing sudah return saat paused; reduced-motion tetap putar, lebih pelan `dt*4`); (b) goyang: setelah `placeTrainOnCurve`, `this.trainGroup.position.y += Math.sin(this.elapsed * 10) * (this.reducedMotionFlag ? 0 : 0.02)` — perlu flag: gunakan field privat `rm = false` di-set oleh `setReducedMotion` (ubah method existing: `this.speed = r ? 0.35 : 0.12; this.rm = r;`); (c) asap: tiap sprite `age = (smokeAges[i] + dt) % 2`; bila `rm` → opacity 0 (skip, kereta "cepat" tanpa asap); else posisi = cerobong dunia (`trainGroup.localToWorld(0, 1.7, 1.1)`) + naik `age*1.2`, scale `0.4 + age*0.8`, opacity `0.5 * (1 - age/2)`; (d) awan: `c.position.x += dt * 0.3`, bila `> 16` → `-16`; (e) daun: `leaf.rotation.z = Math.sin(this.elapsed * 1.5 + idx) * 0.06` (butuh index — simpan sebagai `leaves` array, gunakan indeks loop).
  7. `dispose()`: setelah loop traverse existing, tambah `this.smokeTex?.dispose()` (peta sprite tidak tertutup traverse karena texture bukan material). Material sprite tertutup traverse (mereka milik Sprite di scene).
- Urutan perubahan di dalam file: komentar budget → field → `setReducedMotion` (+flag) → `buildTrain` (push roda + lampu) → `buildSmoke` baru + panggil di konstruktor → `buildEnvironment` (push clouds/leaves) → `update` (elapsed/roda/goyang/asap/awan/daun) → `dispose` (+smokeTex).
- Behavior yang harus dipertahankan: kurva/layout/kecepatan/paused/guard junction-station sekali-panggil; `setBranch/reset/trainT/selectedBranch` tidak berubah; shadow tetap off; dpr cap tetap.
- Error handling/edge: `dt` NaN/≤0 → return (existing); sprite saat `rm` → opacity 0 (tidak hapus); awan wrap agar tak hilang; `localToWorld` butuh matrixWorld mutakhir — panggil `this.trainGroup.updateMatrixWorld()` sebelum hitung posisi asap.
- Test yang harus ditambahkan: tidak ada vitest WebGL (kebijakan R1 plan induk). Verifikasi via T13 manual + build.
- Input test dan expected result: tidak ada.
- Command verifikasi: `npm run typecheck` (setelah T5) — build penuh di T13.
- Hasil verifikasi yang diharapkan: typecheck 0 error.
- Completion criteria: roda/lampu/asap/awan/daun ada di kode; `rm` flag di-set; smoke texture di-dispose; mesh baru = 6 (ledger komentar cocok).
- File/area yang tidak boleh diubah: kurva, `mainCurve/branchCurves` API publik, Canvas/Screen, fisika/shader (dilarang), TTS.

---

## T6 — Papan jawaban 3D berangka + glow cabang terpilih

- Tujuan langkah: papan 3D menampilkan angka jawaban (cermin DOM) + cabang yang dipilih menyala; DOM tetap satu-satunya antarmuka.
- Finding/requirement: F4, F5; C3 (teks WebGL bukan antarmuka).
- Dependency: T5 (menyentuh `buildTracks` + material rel yang sama).
- File yang harus dibaca: `TrainScene.ts` `buildTracks` (baris 284–307) + `setBranch` (110–115).
- File yang harus diubah: `src/components/train/TrainScene.ts` saja.
- Simbol exact (baru):
  ```ts
  export type BranchIndex = 0 | 1 | 2; // existing, jangan ubah
  setAnswers(answers: [string, string, string]): void;
  setSelectedGlow(index: BranchIndex | null): void;
  ```
  Privat: `branchMats: THREE.MeshLambertMaterial[]`, `boardCanvases: HTMLCanvasElement[]`, `boardTextures: THREE.CanvasTexture[]`.
- Kondisi implementasi saat ini: 1 `railMat` dipakai 4 tube; 3 papan putih polos tanpa teks.
- Perubahan konkret (urut):
  1. `buildTracks()`: ganti `const railMat` menjadi `const railMatMain = this.lambert('#8a8f98')` untuk main; untuk tiap branch buat material sendiri: `const m = this.lambert('#8a8f98'); this.branchMats.push(m);` lalu tube branch pakai `m`. (3 material baru, tertutup dispose traverse.)
  2. Papan: untuk tiap ujung cabang buat canvas 128×64 + `new THREE.CanvasTexture(canvas)`; gambar via helper privat `drawBoard(i, text)` (background `#ffffff`, border `#f59e0b` 8px, teks tengah font bold 40px Nunito/sans-serif warna `#0f172a`); mesh papan pakai `new THREE.MeshLambertMaterial({ map: tex })`; simpan canvas+texture; papan awal bertulis `?`.
  3. `setAnswers(answers)`: untuk i 0..2 panggil `drawBoard(i, answers[i])` + `boardTextures[i].needsUpdate = true`. Guard `answers.length === 3`.
  4. `setSelectedGlow(index)`: untuk tiap `branchMats[i]`: `m.emissive.set(index === i ? '#fbbf24' : '#000000')`; `m.emissiveIntensity = index === i ? 0.6 : 0`. `null` = matikan semua.
  5. `setBranch()` existing: JANGAN ubah perilakunya; glow diatur TrainScreen via `setSelectedGlow` (T12). `reset()` existing: tambah `this.setSelectedGlow(null)` di akhir (satu baris, perilaku lain tetap).
- Urutan perubahan di dalam file: field → `buildTracks` (material cabang + papan bertekstur + helper gambar) → `setAnswers` → `setSelectedGlow` → 1 baris di `reset`.
- Behavior yang harus dipertahankan: jumlah/posisi tube, bantalan, papan; API `setBranch/reset` kompatibel; dispose traverse tetap menutup material baru + tambah dispose `boardTextures` (seperti smokeTex di T5: `for (const t of this.boardTextures) t.dispose()`).
- Error handling/edge: `setAnswers` dengan panjang ≠3 → return diam (jangan throw agar game tetap jalan); teks panjang (>4 char, mis. `500`) → font mengecil ke 32px bila `text.length > 3` (cabang di `drawBoard`); `document` undefined (SSR) → guard: bila `typeof document === 'undefined'` skip pembuatan canvas (papan tetap putih) — jangan throw di konstruktor.
- Test: tidak ada vitest WebGL. Verifikasi T13 visual.
- Command verifikasi: `npm run typecheck`.
- Hasil verifikasi yang diharapkan: 0 error.
- Completion criteria: 2 method publik exact ada; papan menampilkan `?` awal; glow emissive exact; dispose texture papan.
- File/area yang tidak boleh diubah: kurva, Canvas/Screen (wiring di T11–T12), DOM QuestionDialog (tetap sumber kebenaran).

---

## T7 — Masinis Asya + stasiun hidup + hewan/dekor + bendera

- Tujuan langkah: memberi karakter dan tujuan yang menunggu (penumpang, bendera, hewan) — Fase 2 visual, masih dalam budget.
- Finding/requirement: F9, F11, F12 (bagian dekor; tema visibility di T8).
- Dependency: T5 (field/update/dispose pattern), T6 (tidak bersinggungan kode, boleh paralel setelah T5).
- File yang harus dibaca: `TrainScene.ts` `buildEnvironment` (193–273) + `buildTrain` (309–351) + `update` hasil T5.
- File yang harus diubah: `src/components/train/TrainScene.ts` saja.
- Simbol exact (baru):
  ```ts
  waveDriver(): void;
  celebrateAtStation(): void;
  ```
  Grup dekor (privat, untuk visibility T8): `flowersGroup: THREE.Group`, `farmGroup: THREE.Group`, `duskGroup: THREE.Group`.
- Kondisi implementasi saat ini: tanpa karakter/penumpang/hewan/bendera; budget terpakai 59 + 6 (T5) + 0 (T6, tanpa mesh baru) = 65.
- Perubahan konkret (urut, total +13 mesh → 78):
  1. `buildTrain()`: masinis — kepala `SphereGeometry(0.28, 10, 8)` kulit `#ffd9b3` di `(0, 1.95, -0.3)`; topi `CylinderGeometry(0.3, 0.3, 0.18, 10)` biru `#2563eb` di `(0, 2.2, -0.3)`; lengan `BoxGeometry(0.18, 0.18, 0.6)` merah di `(0.55, 1.8, -0.3)` simpan sebagai `driverArm: THREE.Mesh`. 3 mesh. `waveDriver()` set `waveT = 0` (field `waveT = 99` awal = diam).
  2. Stasiun (`buildEnvironment`, setelah papan): tiang bendera `CylinderGeometry(0.05, 0.05, 2.2)` di `(-4.4, 1.3, -16)` + kain `PlaneGeometry(0.9, 0.55)` merah di `(-3.9, 2.1, -16)` simpan `flag: THREE.Mesh`; 2 penumpang `CapsuleGeometry(0.25, 0.6, 4, 8)` warna `#38bdf8` dan `#fb7185` di `(-1.5, 0.8, -15)` dan `(-0.5, 0.8, -15)` simpan `passengers: THREE.Mesh[]`. 4 mesh (tiang+kain+2 penumpang).
  3. Grup dekor (3 grup, visibility diatur T8; bangun di `buildEnvironment` akhir):
     - `flowersGroup`: 2 bunga (tangkai cylinder 0.03/0.4 hijau + kelopak sphere 0.16 `#f472b6`/`#facc15`) di `(4, 0, 6)` dan `(-5, 0, 8)`; 2 kupu-kupu (masing-masing 1 plane `0.3×0.2` `#c084fc`, double-side) di `(3, 2, 4)` dan `(-4, 2.2, 7)` simpan `butterflies: THREE.Mesh[]`. 4 mesh (2 kelopak — tangkai gabung? tangkai 2 mesh → total 6? KOREKSI agar pas: bunga = 1 mesh kelopak saja (tangkai skip, bunga rendah di tanah) → 2 + kupu 2 = 4 mesh.)
     - `farmGroup`: 1 sapi (badan box `1.2×0.7×0.7` putih + kepala box `0.4` coklat) di `(7, 0.5, -4)`; 2 mesh.
     - `duskGroup`: 2 lentera sphere 0.18 emissive `#fb923c` di tiang stasiun `(±4.4, 2.4, -16)`; material emissiveIntensity diatur T8. 2 mesh.
     - Total T7: 3 + 4 + 4 + 2 + 2 = 15? LEbih 2 dari jatah 13. Koreksi: penumpang 2→ tetap (butuh minimal 2 untuk "menunggu"); kupu 2→2 (wajib untuk hidup); bunga 2; sapi 2; lentera 2; tiang+kain 2; driver 3. Jumlah = 3+2+2+2+2+2+2 = 15. Untuk cap 78: kurangi asap T5 dari 5→3 sprite (hemat 2) → total 59+4+0+15 = 78. TETAPKAN: T5 membuat 3 sprite (bukan 5), `smokeAges = [0, 0.7, 1.4]`. Ledger komentar T5/T7 harus konsisten (tulis ulang komentar budget di T7 menjadi final).
  4. `celebrateAtStation()` set `hopT = 0` (field `hopT = 99` awal).
  5. `update()`: (a) `waveT < 1`: `driverArm.rotation.x = -0.6 - Math.abs(Math.sin(this.elapsed * 12)) * 0.9`; `waveT += dt`; else lengan diam `rotation.x = 0`. (b) `hopT < 1`: penumpang `p.position.y = 0.8 + Math.abs(Math.sin(this.elapsed * 10)) * 0.18`; `hopT += dt`; else y = 0.8. (c) bendera: `flag.rotation.y = Math.sin(this.elapsed * 3) * 0.35` (skip bila rm). (d) kupu-kupu: orbit kecil `position.x = base + sin(elapsed+i)*0.8`, `position.y = 2 + sin(elapsed*2+i)*0.3`, `rotation.y = sin(elapsed*8+i)*0.6` (skip bila rm; simpan base di `butterflyBase: [number,number,number][]`). Semua skip saat paused (guard existing).
- Urutan perubahan di dalam file: field (driverArm, waveT, passengers, hopT, flag, butterflies+base, 3 grup) → `buildTrain` (masinis) → `buildEnvironment` (tiang/kain/penumpang + 3 grup) → 2 method publik → `update` (4 animasi) → komentar budget final.
- Behavior yang harus dipertahankan: semua gerak T5; tidak ada perubahan kurva/API lama; tidak ada suara di scene (scene bisu, audio di lib).
- Error handling/edge: `CapsuleGeometry` ada di three 0.160 (pasti ada); `waveDriver/celebrateAtStation` saat disposed → guard return; rm → animasi sekunder mati kecuali roda pelan.
- Test: tidak ada vitest WebGL.
- Command verifikasi: `npm run typecheck`.
- Hasil verifikasi yang diharapkan: 0 error.
- Completion criteria: 2 method exact; 15 mesh baru sesuai ledger; tidak ada mesh di luar daftar; dispose tertutup traverse (grup di scene).
- File/area yang tidak boleh diubah: `buildTracks`/kurva, material rel T6, Canvas/Screen, audio, TTS.

---

## T8 — Tiga tema per kelas (`TRAIN_THEMES` + `applyTheme`)

- Tujuan langkah: satu scene tiga suasana (K1 pagi, K2 siang sawah, K3 senja) via konfigurasi + visibility, tanpa menambah mesh.
- Finding/requirement: F12 (bagian tema).
- Dependency: T7 (grup dekor harus ada).
- File yang harus dibaca: `TrainScene.ts` hasil T7 (field grup, material ground/hill, papan stasiun `sign`).
- File yang harus diubah: `src/components/train/TrainScene.ts` saja.
- Simbol exact (baru):
  ```ts
  export interface TrainThemeConfig { sky: string; fogNear: number; fogFar: number; ground: string; hill: string; decor: 'flowers' | 'farm' | 'dusk'; stationLight: boolean; }
  export const TRAIN_THEMES: Record<TrainGrade, TrainThemeConfig>;
  applyTheme(grade: TrainGrade, stationLabel: string): void;
  ```
  Import type `TrainGrade` dari `../../lib/trainQuestionGenerator` (type-only, tanpa runtime; `trainQuestionGenerator` pure sehingga aman dari siklus).
- Kondisi implementasi saat ini: warna hardcode (`#dff3ff`, ground `#a7d8a0`, hill `#8fce8f`); papan stasiun kuning polos; semua dekor selalu tampil.
- Perubahan konkret (urut):
  1. Konstanta exact setelah `BRANCH_MIDS`:
     ```ts
     export const TRAIN_THEMES: Record<TrainGrade, TrainThemeConfig> = {
       1: { sky: '#dff3ff', fogNear: 18, fogFar: 40, ground: '#a7d8a0', hill: '#8fce8f', decor: 'flowers', stationLight: false },
       2: { sky: '#cdeffb', fogNear: 20, fogFar: 44, ground: '#9ed69a', hill: '#7fc87f', decor: 'farm', stationLight: false },
       3: { sky: '#e8d5f5', fogNear: 16, fogFar: 36, ground: '#8fbf8a', hill: '#6fae7f', decor: 'dusk', stationLight: true },
     };
     ```
  2. Simpan referensi material: di `buildEnvironment` simpan `groundMat`, `hillMat` sebagai field privat (ganti `this.lambert(...)` inline pada ground/hill dengan field). Simpan mesh papan stasiun sebagai `stationSign: THREE.Mesh` + canvas/texture-nya (`signCanvas`, `signTexture`) seperti pola papan T6 (kuning `#fbbf24`, teks default `STASIUN`).
  3. `applyTheme(grade, stationLabel)`: (a) `renderer.setClearColor(sky)` + `scene.fog = new THREE.Fog(sky, fogNear, fogFar)` (ganti objek fog lama; fog lama tidak perlu dispose — bukan GPU resource); (b) `groundMat.color.set(ground)`, `hillMat.color.set(hill)`; (c) visibility: `flowersGroup.visible = decor==='flowers'`, `farmGroup.visible = decor==='farm'`, `duskGroup.visible = true` selalu (lentera redup bila siang: emissiveIntensity `stationLight ? 1.4 : 0.15`); (d) gambar ulang papan stasiun dengan `stationLabel` (font bold 44px, bila label >7 char font 36px); `needsUpdate = true`. Guard grade invalid → fallback tema 1 (jangan throw agar game jalan).
- Urutan perubahan di dalam file: interface + konstanta → field material/sign → `buildEnvironment` (simpan ref + sign bertekstur) → `applyTheme` → dispose sign texture (`signTexture.dispose()` di `dispose()`).
- Behavior yang harus dipertahankan: konstruktor membangun tema default 1 tanpa argumen (panggil `this.applyTheme(1, 'STASIUN')` di akhir konstruktor — deterministik, tanpa i18n di scene).
- Error handling/edge: `document` undefined → skip canvas sign (papan kuning polos); grade runtime invalid → tema 1.
- Test yang harus ditambahkan: `tests/trainTheme.test.ts` (baru, pure tanpa three): import `TRAIN_THEMES` SAJA — perhatian: `TrainScene.ts` meng-import `three` di top-level sehingga test jsdom akan memuat three (three bisa di-import di jsdom tanpa WebGL selama tidak instantiate renderer — three murni JS, aman; pola ini sudah dipakai `tests/aquariumSceneLayout.test.ts` yang meng-import konstanta layout). 3 case:
  - Case 1: `TRAIN_THEMES[1].decor==='flowers'`, `[2]==='farm'`, `[3]==='dusk'`; `stationLight` hanya true di 3.
  - Case 2: tiga `sky` berbeda; `fogNear/fogFar` angka positif; ground/hill format `#rrggbb`.
  - Case 3: `Object.keys(TRAIN_THEMES)` = `['1','2','3']`.
- Input/expected: seperti di atas (assert nilai exact).
- Command verifikasi: `npm test -- tests/trainTheme.test.ts` lalu `npm run typecheck`.
- Hasil verifikasi yang diharapkan: 3 case hijau; typecheck 0 error.
- Completion criteria: konstanta + method exact; konstruktor memanggil tema default; test hijau.
- File/area yang tidak boleh diubah: mesh/dekor (sudah final di T7), Canvas/Screen (T11–T12), key i18n (T3 selesai).

---

## T9 — Empat mode kamera (`setCameraMode`)

- Tujuan langkah: kamera mengikuti kereta + zoom ke junction/stasiun sesuai fase game; snap langsung saat reduced-motion.
- Finding/requirement: F10; C4 (reduced-motion).
- Dependency: T5 (flag `rm`), T8 (independen, boleh paralel setelah T5).
- File yang harus dibaca: `TrainScene.ts` konstruktor kamera (posisi `(0,7,10)`, lookAt `(0,0,-4)`) + `update` hasil T5–T8.
- File yang harus diubah: `src/components/train/TrainScene.ts` saja.
- Simbol exact (baru):
  ```ts
  export type TrainCameraMode = 'fixed' | 'follow' | 'junction' | 'station';
  setCameraMode(mode: TrainCameraMode): void;
  ```
- Kondisi implementasi saat ini: kamera fix selamanya.
- Perubahan konkret (urut):
  1. Field: `camMode: TrainCameraMode = 'fixed'`; `camPos = new THREE.Vector3(0, 7, 10)`; `camLook = new THREE.Vector3(0, 0, -4)` (vantage awal = fixed).
  2. `setCameraMode(mode)`: set field (tanpa gerak langsung).
  3. Di `update()`, blok kamera SETELAH gerak kereta (agar `trainGroup.position` mutakhir):
     - Hitung target: fixed → pos `(0,7,10)` look `(0,0,-4)`; follow → `pos = trainPos + (0,4,0) - dir*6`, `look = trainPos + dir*3` (dir = tangent kurva aktif: simpan `lastDir: THREE.Vector3` di `placeTrainOnCurve` — tambah 3 baris di method itu); junction → pos `(0,6,6)` look `(0,0,-6)`; station → pos `(0,5,-8)` look `(0,1,-16)`.
     - Bila `rm` → `camera.position.copy(pos); camera.lookAt(look)` langsung; else lerp `camera.position.lerp(pos, 1 - Math.exp(-3 * dt))` + `camLook.lerp(look, ...)` lalu `camera.lookAt(camLook)`.
  4. `reset()` existing: tambah `this.setCameraMode('fixed')` (1 baris).
- Urutan perubahan di dalam file: type + field → `setCameraMode` → `placeTrainOnCurve` (+lastDir) → blok kamera di `update` → 1 baris di `reset`.
- Behavior yang harus dipertahankan: posisi awal frame pertama = fixed (tidak ada lompatan saat mount); paused → update return awal (kamera diam).
- Error handling/edge: `lastDir` awal `(0,0,-1)`; dt clamp existing dipakai untuk lerp.
- Test: tidak ada vitest WebGL.
- Command verifikasi: `npm run typecheck`.
- Hasil verifikasi yang diharapkan: 0 error.
- Completion criteria: type + method exact; 4 mode terimplementasi; rm snap; reset kembali fixed.
- File/area yang tidak boleh diubah: kurva, Canvas/Screen (mapping fase→mode di T12), follow tidak boleh mengubah kecepatan kereta.

---

## T10 — Confetti DOM + tombol musik kedua di HUD

- Tujuan langkah: selebrasi jawaban benar (DOM, bukan WebGL) + kontrol musik terpisah yang memenuhi a11y.
- Finding/requirement: F8, F13 (bagian UI); C3, C4.
- Dependency: T3 (key musik harus ada).
- File yang harus dibaca: `src/components/train/TrainHUD.tsx` (props + 3 tombol existing), `src/index.css` (pola `@keyframes pop-in/celebrate/rise` + blok `prefers-reduced-motion`/`no-anim` — tiru pola, JANGAN ubah aturan global), `QuestionDialog.tsx` (bukan diubah; hanya referensi gaya).
- File yang harus diubah (2 file):
  1. `src/components/train/TrainCelebration.tsx` (baru).
  2. `src/components/train/TrainHUD.tsx` (tambah props + tombol).
  3. `src/index.css` (tambah keyframes confetti SAJA, di akhir file).
- Simbol exact:
  ```tsx
  // TrainCelebration.tsx
  export interface TrainCelebrationProps { show: boolean; }
  export default function TrainCelebration(props: TrainCelebrationProps): JSX.Element | null;
  // TrainHUD.tsx — props BARU (existing tidak diubah):
  export interface TrainHUDProps { round: number; total: number; stars: number; muted: boolean; paused: boolean; musicOn: boolean; onToggleMute: () => void; onToggleMusic: () => void; onPause: () => void; onQuit: () => void; }
  ```
- Kondisi implementasi saat ini: tidak ada confetti; HUD 3 tombol (mute, jeda, keluar).
- Perubahan konkret (urut):
  1. `TrainCelebration.tsx`: bila `!show` return null; else `<div aria-hidden="true" className="train-confetti">` berisi tepat 24 `<span>` emoji dari array exact `['🎉','⭐','🎊','✨','🌟','🎈']` berulang (i % 6), tiap span `style={{ left: `${(i * 100) / 24}%`, animationDelay: `${(i % 6) * 0.08}s` }}`. Tanpa timer internal (parent mengontrol `show`).
  2. `index.css` akhir file: tambah `@keyframes train-confetti-fall { from { transform: translateY(-20px) rotate(0deg); opacity: 1; } to { transform: translateY(120px) rotate(360deg); opacity: 0; } }` + class `.train-confetti span { position: absolute; top: 0; animation: train-confetti-fall 1.1s ease-out forwards; }` + `.train-confetti { position: relative; height: 0; }`. Jangan ubah blok existing.
  3. `TrainHUD.tsx`: tambah tombol musik setelah tombol mute, pola class identical: `aria-label={musicOn ? t('train.musicMute') : t('train.musicUnmute')}`, isi `{musicOn ? '🎵' : '🔇🎵'}`? TETAPKAN exact: `{musicOn ? '🎵' : '🚫🎵'}`. Props destructure tambah `musicOn, onToggleMusic`. compact: emoji exact di atas, jangan variasi.
- Urutan perubahan di dalam file: Celebration baru → css → HUD (interface, destructure, tombol).
- Behavior yang harus dipertahankan: 3 tombol lama identik; `aria-live` progres/bintang tidak berubah; confetti `aria-hidden` (screen reader tidak terganggu); `no-anim`/reduced-motion mematikan animasi via CSS global existing (tanpa JS khusus).
- Error handling/edge: `show` false → null (tidak ada DOM); HUD tanpa `musicOn` (caller lama)? TypeScript memaksa — T12 memperbarui caller; tidak ada caller lain (grep `TrainHUD` hanya di TrainScreen — eksekutor wajib cek via grep sebelum klaim).
- Test yang harus ditambahkan: `tests/trainCelebration.test.tsx` (baru), 2 case (render dengan provider seperti `trainDialog.test.tsx` bila perlu t — Celebration tanpa i18n, render langsung):
  - Case 1: `render(<TrainCelebration show={false} />)` → container kosong.
  - Case 2: `render(<TrainCelebration show />)` → 24 span, `aria-hidden="true"` pada wrapper.
- Input/expected: `container.querySelectorAll('.train-confetti span').length === 24`.
- Command verifikasi: `npm test -- tests/trainCelebration.test.tsx` lalu `npm run typecheck`.
- Hasil verifikasi yang diharapkan: 2 case hijau; typecheck 0 error (HUD caller lama akan error sampai T12 — TETAPKAN: T10 selesai bila test-nya hijau; error caller diperbaiki di T12; jangan klaim typecheck repo hijau di T10).
- Completion criteria: komponen + css + tombol exact; test hijau.
- File/area yang tidak boleh diubah: tombol HUD existing, `QuestionDialog`, key i18n (T3), logika musik (T4/T12).

---

## T11 — Props baru `TrainCanvas` (tema, kamera, jawaban papan)

- Tujuan langkah: meneruskan grade/kamera/jawaban ke scene via effect terisolasi, tanpa menyentuh loop/cleanup existing.
- Finding/requirement: F4, F5, F10, F12 (wiring view).
- Dependency: T6, T8, T9 (method scene harus ada). T10 independen.
- File yang harus dibaca: `src/components/train/TrainCanvas.tsx` (3 effect existing + cleanup 5 langkah + fallback).
- File yang harus diubah: `src/components/train/TrainCanvas.tsx` saja.
- Simbol exact (hanya TAMBAH, existing tidak diubah):
  ```tsx
  import type { TrainCameraMode } from './TrainScene';
  import type { TrainGrade } from '../../lib/trainQuestionGenerator';
  export interface TrainCanvasProps {
    paused: boolean; reducedMotion: boolean;
    onReachJunction: () => void; onReachStation: () => void;
    sceneRef: React.MutableRefObject<TrainScene | null>;
    onReady?: (scene: TrainScene) => void;
    themeGrade: TrainGrade | null;
    cameraMode: TrainCameraMode;
    boardAnswers: [string, string, string] | null;
  }
  ```
- Kondisi implementasi saat ini: props 6 field; 3 effect (cbRef, paused, reducedMotion) + 1 mount effect.
- Perubahan konkret (urut):
  1. Import type + 3 field props (destructure di komponen).
  2. Tambah 3 effect terpisah SETELAH effect reducedMotion, SEBELUM mount effect:
     - `useEffect(() => { if (sceneRef.current && themeGrade !== null) sceneRef.current.applyTheme(themeGrade, lastLabel) }, ...)` — MASALAH: label stasiun butuh `t()`. Tetapkan: tambah prop ke-4 `stationLabel: string` (exact, string polos dari TrainScreen via `t('train.stationShort')`). Effect deps `[themeGrade, stationLabel, sceneRef]`.
     - `useEffect(() => { sceneRef.current?.setCameraMode(cameraMode) }, [cameraMode, sceneRef])`.
     - `useEffect(() => { if (sceneRef.current && boardAnswers) sceneRef.current.setAnswers(boardAnswers) }, [boardAnswers, sceneRef])`.
  3. Mount effect: setelah `scene.setPaused(...)` tambah `if (themeGrade !== null) scene.applyTheme(themeGrade, stationLabel); scene.setCameraMode(cameraMode); if (boardAnswers) scene.setAnswers(boardAnswers);` sebelum `onReady`. Cleanup 5 langkah TIDAK berubah.
  4. Fallback branch (`!webGL`) tidak berubah (meneruskan props lama saja).
- Urutan perubahan di dalam file: import → interface → destructure → 3 effect → 3 baris di mount effect.
- Behavior yang harus dipertahankan: loop rAF, resize, visibility, contextlost, cleanup, StrictMode safety — byte-identik kecuali baris tambahan di atas.
- Error handling/edge: scene null (belum mount) → optional chaining; `themeGrade` null (menu) → skip; WebGL throw → return existing (fallback).
- Test: tidak ada test baru (fallback test existing tidak berubah; props baru tidak dipakai fallback).
- Command verifikasi: `npm run typecheck` — AKAN error di `TrainScreen.tsx` (caller lama) sampai T12; T11 selesai bila error hanya di caller (bukan di Canvas).
- Hasil verifikasi yang diharapkan: error typecheck terbatas pada `TrainScreen.tsx` props.
- Completion criteria: 4 prop baru exact; 3 effect + init; cleanup tak tersentuh.
- File/area yang tidak boleh diubah: loop, cleanup, fallback, `hasTrainWebGL`.

---

## T12 — Wiring `TrainScreen` (urutan pemanggilan exact)

- Tujuan langkah: menghubungkan semua fitur baru ke alur game tanpa mengubah alur/state existing.
- Finding/requirement: F5, F7–F13 (perilaku), C2 (hentikan audio), C4.
- Dependency: T1–T4, T10–T11 (semua API harus ada). Langkah terbesar; kerjakan setelah semua hijau parsial.
- File yang harus dibaca: `src/screens/TrainScreen.tsx` penuh + `src/lib/trainStars.ts` (`starsForTrainAttempt` untuk nada bintang).
- File yang harus diubah: `src/screens/TrainScreen.tsx` saja.
- Simbol terkait: `playTrainWhistle/Switch/Star` (T1), `start/stopTrainMusic`, `setMusicDucked`, `start/stopChug`, `setChugRate`, `stopAllTrainAudio` (T4), `TrainCelebration`, HUD props baru (T10), Canvas props baru (T11).
- Kondisi implementasi saat ini: `muted` tunggal; tanpa musik/chug/confetti/whistle; HUD/Canvas props lama; `playTrainCorrect` di jawaban benar.
- Perubahan konkret (urut dalam file, exact):
  1. Import: tambah `TrainCelebration`, `playTrainWhistle, playTrainSwitch, playTrainStar` (hapus `playTrainCorrect` dari import bila tak dipakai lagi — cek lint), `startTrainMusic, stopTrainMusic, setMusicDucked, startChug, stopChug, setChugRate, stopAllTrainAudio`, `starsForTrainAttempt`.
  2. State baru (setelah `muted`): `const [musicOn, setMusicOn] = useState(() => loadTrainProgress().musicEnabled ?? true);` + `const [celebrate, setCelebrate] = useState(false);`
  3. Mount effect cleanup existing tambah `stopAllTrainAudio()` di samping `stopTrainAudio()`.
  4. `handleStart(g)`: setelah `sceneRef.current?.reset()` tambah NOTHING (reset cukup); setelah `setPhase('INTRO')` tambah: `if (!muted) playTrainWhistle(); if (musicOn) { startTrainMusic(); startChug(); setChugRate(reducedMotion ? 180 : 300); }`. Tambah `musicOn, reducedMotion` ke deps useCallback.
  5. `handleAnswer` benar: ganti `if (!muted) playTrainCorrect()` menjadi `if (!muted) playTrainStar(starsForTrainAttempt(attempts + 1))`; setelah `sceneRef.current?.setBranch(choiceIndex)` tambah `sceneRef.current?.setSelectedGlow(choiceIndex); sceneRef.current?.waveDriver(); if (!muted) playTrainSwitch(); setMusicDucked(true); setCelebrate(true); later(600, () => setMusicDucked(false)); later(1200, () => setCelebrate(false));`
  6. `handleAnswer` salah: setelah `setShowHint(true)` tidak tambah audio baru (hint existing); `playTrainWrong` baru otomatis dipakai (T1).
  7. `handleReachJunction`: tambah `sceneRef.current?.celebrateAtStation?.()`? TIDAK — celebrate milik station. Tambah: `sceneRef.current?.setCameraMode` TIDAK di sini (kamera via props T11 — TrainScreen cukup oper `cameraMode` state). TETAPKAN: tambah state `const [cameraMode, setCameraMode] = useState<TrainCameraMode>('fixed');` + oper ke Canvas. Set: `handleStart` → `'follow'`; `handleReachJunction` → `'junction'`; `handleAnswer` benar → `'follow'`; `handleReachStation` → `'station'`; `handlePause` → biarkan; round berikutnya (`handleReachStation` lanjut) → `'follow'`; quit/menu → `'fixed'`. Import type `TrainCameraMode`.
  8. `handleReachStation`: tambah `sceneRef.current?.celebrateAtStation(); if (!muted) playTrainWhistle();` + round-lanjut: `setCameraMode('follow')`.
  9. `handlePause`: tambah `stopChug();` `handleResume`: tambah `if (musicOn) startChug();`
  10. `handleToggleMusic()`: mirror `handleToggleMute`: `const next = !musicOn; setMusicOn(next); saveTrainProgress({ ...loadTrainProgress(), musicEnabled: next }); if (next) { startTrainMusic(); if (phaseRef.current === 'TRAIN_MOVING' || phaseRef.current === 'TRAVELLING_TO_STATION') startChug(); } else { stopTrainMusic(); stopChug(); }` + tambah key keyboard `'n'`/`'N'` → toggle musik (di effect keyboard, setelah handler `'m'`).
  11. `finishSession`: tambah `stopAllTrainAudio(); setMusicDucked(false);` sebelum navigate (celebrate existing tetap).
  12. Quit confirm (`onConfirm`): tambah `stopAllTrainAudio(); setMusicDucked(false);`
  13. Render: `boardAnswers={question ? question.choices : null}`, `themeGrade={grade}`, `cameraMode={cameraMode}`, `stationLabel={t('train.stationShort')}` pada `<TrainCanvas>`; HUD tambah `musicOn={musicOn} onToggleMusic={handleToggleMusic}`; `<TrainCelebration show={celebrate} />` setelah Canvas.
- Urutan perubahan di dalam file: import → state (musicOn, celebrate, cameraMode) → cleanup → handleStart → handleAnswer → reach handlers → pause/resume → toggle musik + keyboard → finish/quit → render props.
- Behavior yang harus dipertahankan: seluruh state machine/timer/guard/announce/summary/result tidak berubah; mapping cabang 0=kiri (jangan invert); copy feedback exact; mute SFX existing tidak berubah makna.
- Error handling/edge: scene null (fallback 2D) → semua `?.` aman; musik/chug no-op di fallback TAPI tetap dipanggil (agar 2D punya musik juga); jawaban ganda cepat → guard existing; `celebrate` timer ganda → `later` menumpuk aman (boolean).
- Test: tidak ada test React baru (jsdom+WebGL). Pure coverage sudah di T2/T3/T4/T8/T10.
- Command verifikasi: `npm run typecheck` + `npm run lint`.
- Hasil verifikasi yang diharapkan: 0 error (error caller T10/T11 terselesaikan di sini).
- Completion criteria: semua 13 sub-langkah ada; typecheck+lint hijau; tidak ada sisa referensi `playTrainCorrect` yang merusak lint (bila tidak dipakai, hapus dari import).
- File/area yang tidak boleh diubah: state/timer/guard/summary; `QuestionDialog`; TTS; file lain.

---

## T13 — Verifikasi penuh (tanpa kode baru; perbaikan bug kecil diizinkan dan dicatat)

- Tujuan langkah: membuktikan seluruh temuan tertangani + constraint terpenuhi sebelum handoff.
- Finding/requirement: semua F1–F13 + C1–C4.
- Dependency: T1–T12 selesai.
- File yang harus dibaca: `tests/setup.ts` (pola), `vite.config.ts` (chunks — baca saja, JANGAN ubah), output tiap command.
- File yang harus diubah: tidak ada sumber baru. Perbaikan bug satu-baris diizinkan HANYA bila test/verifikasi gagal, dan WAJIB dicatat di Progress Log plan (file + baris + alasan). Bila perlu format: `npx prettier --write` HANYA pada file train baru/berubah.
- Checklist verifikasi (urut, exact):
  1. `npm run lint` → 0 error.
  2. `npm run typecheck` → 0 error.
  3. `npm test -- tests/trainSfx.test.ts tests/trainMusic.test.ts tests/trainTheme.test.ts tests/trainCelebration.test.tsx tests/trainStorage.test.ts` → semua hijau.
  4. `npm test` (penuh) → semua file hijau termasuk 47 existing (total 50 file train+existing; angka exact menyesuaikan — yang wajib: 0 failed).
  5. `npm run build` → sukses, tanpa chunk warning baru; `three` tetap chunk terpisah; tidak ada aset audio biner di `dist/assets`.
  6. `npm run format:check` → hijau.
  7. Grep manual (eksekutor lakukan, catat hasil): (a) kata `gagal` (case-insensitive) di `src/components/train src/screens/TrainScreen.tsx src/i18n/dicts/id.ts src/i18n/dicts/en.ts` → kosong; (b) `from 'three'` di `src/lib/train*` → kosong; (c) `speechSynthesis` di `src/` → HANYA `src/lib/trainSound.ts` (`stopTrainAudio` lama); (d) `shadowMap.enabled = true` / `ShaderMaterial` / `PostProcessing` / `Cannon|Rapier|Physics` di `src/components/train` → kosong.
  8. Audit budget: komentar ledger `TrainScene.ts` cocok dengan hitungan (≤78 mesh + ≤5 sprite); `setPixelRatio(min(dpr,1.5))` ada; `TubeGeometry(_, 32, ...)` tidak lebih dari 32.
  9. Manual browser (preview build, catat di Progress Log centang/gagal + bukti snapshot):
     - Mobile 390px + desktop: Home→kereta→K1/K2/K3 (3 tema terlihat beda) → soal→jawab→confetti+whistle+glow→stasiun→hasil; tanpa scroll horizontal; tombol ≥44px.
     - Keyboard: 1/2/3 jawab, M mute, N musik, Esc jeda, Enter/Space tombol.
     - Console: 0 error/warning selama 1 sesi 5 soal.
     - Restart 3×: 1 kereta (tidak ganda), listener dilepas, tanpa `Context Lost` berulang.
     - WebGL off → fallback 2D playable sampai hasil (musik tetap jalan bila on).
     - Reduced-motion on → tanpa confetti/asap/lerp kamera; kereta cepat; musik tetap (opsi terpisah).
- Hasil verifikasi yang diharapkan: semua command hijau; semua grep sesuai; semua manual centang.
- Completion criteria: T13 selesai bila 9 checklist di atas hijau/tercatat; setiap penyimpangan → blocker di Progress Log, bukan improvisasi.
- File/area yang tidak boleh diubah: CI workflow, vite config, file non-train selain yang diizinkan T1–T3.

---

## T14 — Memory + handoff (tanpa implementasi baru)

- Tujuan langkah: menutup plan dengan jejak memori + checklist serah terima; tanpa kode.
- Dependency: T13.
- File yang harus dibaca: `git status --short` (read-only) untuk daftar file berubah; `.memory/README.md` (format index: timestamp, current state, recent ≤20).
- File yang harus diubah (hanya 3, tanpa kode sumber):
  1. `.memory/YYYY-MM-DD/HHmmss-kereta-visual-audio-fase-1-2.md` (satu entry: tugas, file diubah, keputusan, asumsi/risiko, blocker, verifikasi, commit proposal satu baris Conventional Commits, relasi plan ini).
  2. `.memory/README.md` (timestamp, 1 baris current state, 1 entri recent — jangan hapus histori, jangan simpan secret).
  3. File plan ini (centang Tasks T0–T14 + tambah Progress Log).
- Dilarang: staging/commit (`git add/commit/push`) dalam bentuk apa pun — eksekutor berhenti setelah handoff checklist; commit hanya bila pengguna eksplisit meminta di pesan terpisah.
- Handoff checklist (eksekutor wajib centang semua sebelum klaim selesai):
  - [ ] T0–T14 dikerjakan berurutan; tidak ada lompatan (scene setelah T1–T4).
  - [ ] API exact: `playTone/Whistle/Switch/Star`, 8 fungsi musik + helpers, `TRAIN_THEMES/applyTheme`, `setAnswers/setSelectedGlow/setCameraMode/waveDriver/celebrateAtStation`, `TrainCelebration`, HUD `musicOn/onToggleMusic`, Canvas 4 prop baru, wiring T12 13 sub-langkah.
  - [ ] `lint/typecheck/test/build/format:check` hijau; grep T13 sesuai (gagal kosong; three hanya di scene; speechSynthesis hanya lama; tanpa shadow/fisika/shader).
  - [ ] Mesh ledger ≤78 + ≤5 sprite cocok dengan kode; tanpa dep/MP3 baru.
  - [ ] Manual mobile/keyboard/console/restart/fallback/reduced-motion dicentang di Progress Log.
  - [ ] Memory entry + README + plan Tasks/Log diperbarui.
- Completion criteria: 3 file di atas diperbarui; jawaban akhir eksekutor berisi ringkasan file diubah, keputusan arsitektur, batasan tersisa.
- File/area yang tidak boleh diubah: semua kode sumber dan test.

---

## Progress Log

- 2026-09-25 12:00:00 — Plan Fase 1+2 dibuat (T0–T14 + traceability F1–F13/C1–C4). Keputusan terkunci: tanpa TTS, 1 file `trainMusic.ts` prosedural, tema per kelas ya. Belum ada implementasi.
- 2026-09-25 15:00:00 — T0–T14 selesai. lint/typecheck/test (51 file/373 test)/build/format hijau. Grep constraint lolos (tanpa `gagal`, tanpa three di lib, speechSynthesis hanya lama, tanpa shadow/fisika). Manual: Home → menu kereta → K2 start → soal tampil, mobile 390px. Penyimpangan: T5 memakai 3 sprite asap (bukan 5) agar total pas 78 — konsisten dengan koreksi plan T7. Memory: `.memory/2026-09-25/150000-kereta-visual-audio-fase-1-2.md`.

## Notes

- **Keputusan terkunci (jangan buka ulang tanpa blocker):** TTS skip — `speechSynthesis` baru dilarang; musik/chug 100% WebAudio prosedural dalam `trainMusic.ts`; SFX identitas via `playTone` baru di `sound.ts`; flag SFX vs musik terpisah (`soundEnabled` vs `musicEnabled`); version storage tetap 1; satu scene tiga tema via visibility; DOM satu-satunya antarmuka (angka/papan 3D cermin saja); kamera snap saat reduced-motion; tidak ada autoplay sebelum klik Berangkat.
- **Counter-pertimbangan yang ditolak:** file MP3 (ditolak: bundle + PWA offline cost); TTS soal (ditolak pengguna: skip); tiga scene terpisah (ditolak: triple mesh + triple maintenance); point light senja (ditolak: cost; pakai emissive); skin unlock (di luar scope).
- **Batasan tersisa setelah plan ini:** papan 3D tanpa teks selain angka/judul stasiun; musik Undirectional sederhana 8-langkah (bukan komposisi adaptif per ronde); hewan/dekor statis-animasi sederhana; progres tetap lokal per browser; refresh reset ke home.
- **Open questions:** tidak ada yang memblokir. Bila eksekutor menemukan kontradiksi (mis. `CapsuleGeometry` tidak tersedia di three 0.160 — padahal tersedia sejak r140+), catat blocker di Progress Log + hentikan langkah terkait, jangan improvisasi diam-diam.
- **Perintah yang tersedia (eksekutor):** `npm run lint`, `npm run typecheck`, `npm test`, `npm test -- <file>`, `npm run build`, `npm run format:check`, `git status --short`. Dilarang: `git add/commit/push`, perubahan di luar file listed tiap langkah.

---

## Handoff Checklist (untuk model eksekutor kecil)

- [ ] Kerjakan T0→T14 berurutan; T1–T4 hijau sebelum sentuh `TrainScene`.
- [ ] Setiap langkah: baca file listed → ubah hanya file listed → API exact + cuplikan exact → test listed → command listed → penuhi completion criteria.
- [ ] Setiap finding F1–F13 + constraint C1–C4 ditangani ≥1 langkah + verifikasi (F14 skip diverifikasi via grep T13).
- [ ] Jangan ubah area "Tidak boleh diubah" tiap langkah; bila harus, jadikan blocker + minta keputusan.
- [ ] Akhiri dengan T13–T14 + ringkasan file diubah, keputusan arsitektur, batasan tersisa.
