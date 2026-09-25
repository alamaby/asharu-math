# Kereta Fase 3 — Implementation Plan (atomik, deterministik)

Created: 2026-09-25 15:30:00

## Objective

Tutup 4 dari 7 batasan tersisa mini game "Petualangan Kereta Angka" (commit `7715a08` sudah memuat Fase 1+2): (a) musik repetitif → adaptif per ronde; (b) papan 3D minim → rambu sinyal junction + papan info stasiun; (c) animasi dekor sederhana → variasi idle + confetti warna per tema; (d) celah verifikasi manual → eksekusi checklist yang tertunda. Sisa 3 poin (TTS, sync progres, resume refresh) + bump versi dicatat sebagai TODO eksplisit, bukan scope kerja.

Keputusan final dari pengguna (jangan tanyakan ulang): kerjakan poin 2, 3, 4, 7; poin 1, 5, 6 masuk TODO. Tanpa TTS, tanpa file audio biner, tanpa dependensi baru, tanpa ubah gameplay.

## Scope

In scope (eksplisit, tertutup):
- `src/lib/trainMusic.ts`: tambah `setMusicIntensity(level)` + wiring tendency existing (restart interval pola `setChugRate`).
- `src/components/train/TrainScene.ts`: rambu sinyal (+4 mesh), `setSignal`, `setStationBoard`, `drawSign(label, sub?)`, variasi idle (hop bergantian, sapi mengangguk, masinis menoleh), ref `cowHead`. Cap mesh naik 78 → 82 (satu-satunya perubahan budget, dicatat di Notes + ledger komentar).
- `src/components/train/TrainCelebration.tsx`: prop opsional `tone` + 3 set emoji exact.
- `src/screens/TrainScreen.tsx`: wiring intensitas per ronde, signal, station board effect, prop `tone`, tanpa ubah state machine/timer/guard.
- Test: `tests/trainMusic.test.ts` (+2 case), `tests/trainCelebration.test.tsx` (+1 case). Tanpa test WebGL.
- Verifikasi penuh + checklist manual + memory + handoff. Tanpa commit kecuali pengguna meminta eksplisit di pesan terpisah.

Out of scope (dilarang):
- TTS / `speechSynthesis` baru; file MP3/WAV/gambar/model biner; dependensi npm baru.
- Perubahan gameplay: generator, state machine 14 state, bintang 3/2/1, storage key, `GradeLevel`, `LEVELS`, ResultScreen, achievement, mapping cabang 0=kiri/1=tengah/2=kanan.
- Perubahan `vite.config.ts`, workflow CI, `BottomNavigation`, `TAB_SCREENS`, `ProgressContext`, `storage.ts`, `scoring.ts`, file Aquarium/Garden, `sound.ts` (kecuali tidak disentuh sama sekali — `playTone` sudah ada).
- Kata "gagal" di UI train. Lerp transisi tema (ditolak di plan draft — ganti via kamera + confetti yang sudah ada).

## Milestones

1. M1 musik adaptif (S1–S2: lib + wiring intensitas).
2. M2 rambu + papan info (S3–S4: scene + wiring signal/board).
3. M3 variasi idle + confetti tema (S5–S6: scene + celebration + wiring tone).
4. M4 verifikasi + manual + handoff (S7–S9).

## Tasks

- [x] S0 audit read-only state `7715a08`
- [x] S1 `setMusicIntensity` di `trainMusic.ts` + test
- [x] S2 wiring intensitas per ronde di `TrainScreen`
- [x] S3 rambu sinyal + papan info di `TrainScene`
- [x] S4 wiring signal + station board di `TrainScreen`
- [x] S5 variasi idle di `TrainScene` (hop, sapi, masinis)
- [x] S6 prop `tone` di `TrainCelebration` + test + wiring
- [x] S7 verifikasi otomatis (lint, typecheck, test, build, format, grep)
- [x] S8 checklist manual (preview, console, keyboard, restart, WebGL-off, reduced-motion, audio nyata)
- [x] S9 TODO tercatat + version bump + memory + handoff (tanpa commit)

## Risks

- R1: jsdom tanpa AudioContext/WebGL — mitigasi: test baru pure/DOM saja; `TrainScene` tidak di-import di test manapun.
- R2: Interval musik ganda/bocor — mitigasi: `setMusicIntensity` reuse pola restart `setChugRate`; `start` idempoten; `stop` di path existing (finish/quit/unmount/pause tidak diubah).
- R3: Cap mesh naik 78 → 82 — mitigasi: ledger komentar diperbarui; draw call <85; tanpa shadow/fisika/shader; keputusan dicatat eksplisit di Notes (bukan diam-diam).
- R4: Sinyal terasa menghukum — mitigasi: salah = kuning netral `#facc15`, bukan merah (lihat OQ-2).
- R5: Model kecil menyimpang API — mitigasi: signature + cuplikan exact tiap langkah; larangan improvisasi nama.

## Requirement Traceability Matrix

| ID | Finding / requirement | Langkah | Verifikasi |
|----|------------------------|---------|------------|
| F1 | Musik 8-langkah repetitif (poin 2) | S1, S2 | test + dengar manual S8 |
| F2 | Papan 3D minim (poin 3) | S3, S4 | visual manual S8 |
| F3 | Animasi dekor sederhana (poin 4) | S5, S6 | visual manual S8 + test confetti |
| F4 | Celah verifikasi manual (poin 7) | S8 | checklist S8 tuntas |
| F5 | TTS di-skip (TODO-1) | — (tanpa langkah kode) | S7 grep `speechSynthesis` hanya kode lama |
| F6 | Progres lokal (TODO-2) | — (dokumen saja) | S9 catat di Notes |
| F7 | Refresh reset ke home (TODO-3) | — (dokumen saja) | S9 catat di Notes |
| F8 | Version bump pending (TODO-4) | S9 | `package.json` = 1.7.0 |
| C1 | Budget ≤82 mesh, dpr≤1.5, shadow off, tanpa dep/biner/fisika/shader | S3 | S7 audit + build |
| C2 | Lifecycle bersih (interval + texture baru di-dispose) | S1, S3 | S7 + S8 restart |
| C3 | DOM satu-satunya antarmuka; tanpa kata "gagal" | S3, S4, S6 | S7 grep |
| C4 | Reduced-motion + fallback 2D penuh | S5, S6 | S8 manual |

---

## S0 — Audit read-only state `7715a08`

- Tujuan langkah: kunci pemahaman API existing agar langkah berikut deterministik; tanpa ubah file.
- Finding/requirement: fondasi F1–F4 + C1–C4.
- Dependency: tidak ada.
- File yang harus dibaca (6 file, baca penuh):
  1. `src/lib/trainMusic.ts` (state modul, `setChugRate` sebagai pola restart, `_trainMusicHelpers`).
  2. `src/components/train/TrainScene.ts` (komentar budget, `reset`, `drawSign`, `update` blok wave/hop/flag/butterfly, `dispose`).
  3. `src/screens/TrainScreen.tsx` (`handleStart`, `handleAnswer` benar/salah, `handleReachStation` lanjut ronde, keyboard `m`/`n`, render `TrainCanvas`/`TrainHUD`/`TrainCelebration`, cleanup unmount).
  4. `src/components/train/TrainCelebration.tsx` (array emoji, 24 span).
  5. `tests/trainMusic.test.ts` + `tests/trainCelebration.test.tsx` (pola case).
  6. `package.json` (field `version`, ekspektasi `1.6.0`).
- File yang harus diubah: tidak ada.
- Class/function/simbol terkait: `setChugRate`, `reset`, `drawSign`, `starsSoFar`, `celebrate`.
- Kondisi implementasi saat ini: commit `7715a08` = Fase 1+2; musik 1 level; sinyal belum ada; papan stasiun statis `STASIUN`; idle dasar (wave/hop/flag/kupu); confetti 1 set emoji; keyboard `n` musik sudah ada; versi `1.6.0`.
- Perubahan konkret: tidak ada.
- Urutan perubahan di dalam file: tidak ada.
- Behavior yang harus dipertahankan: seluruh app.
- Error handling/edge: tidak ada.
- Test yang harus ditambahkan/diperbarui: tidak ada.
- Input test dan expected result: tidak ada.
- Command verifikasi: tidak ada (dilarang menjalankan apa pun di S0).
- Hasil verifikasi yang diharapkan: pelaksana dapat menyebut tanpa melihat ulang: (a) restart interval = stop + start (pola `setChugRate`); (b) `reset()` memanggil `setSelectedGlow(null)` + `setCameraMode('fixed')`; (c) keyboard `n` sudah ada — jangan tambah duplikat di S2/S4.
- Completion criteria: 6 file dibaca; tidak ada file berubah.
- File/area yang tidak boleh diubah: semua file.

---

## S1 — `setMusicIntensity` di `trainMusic.ts` + test

- Tujuan langkah: tiga level intensitas musik tanpa ubah API existing.
- Finding/requirement: F1 (bagian lib).
- Dependency: S0.
- File yang harus dibaca: `src/lib/trainMusic.ts` (fungsi `setChugRate` baris pola restart; `musicTick` pola melody/bass/hat; `startTrainMusic` pola idempoten).
- File yang harus diubah (2 file):
  1. `src/lib/trainMusic.ts` — tambah 1 fungsi + 1 field.
  2. `tests/trainMusic.test.ts` — tambah 2 case.
- Class/function/simbol terkait (exact):
  ```ts
  export function setMusicIntensity(level: 1 | 2 | 3): void;
  ```
  Field privat baru: `let musicLevel: 1 | 2 | 3 = 1;`
- Kondisi implementasi saat ini: `musicTick` selalu: melody tiap langkah + bass tiap 2 langkah + hat tiap langkah ganjil; interval tetap `STEP_MS` (220).
- Perubahan konkret (urut dalam `trainMusic.ts`):
  1. Tambah field `let musicLevel: 1 | 2 | 3 = 1;` di dekat `let musicStep = 0;`.
  2. Ubah `musicTick`: bass dimainkan bila `step % 2 === 0 || musicLevel >= 2`; hat dimainkan bila `step % 2 === 1 || musicLevel >= 2`; setelah melody, bila `musicLevel >= 3`, jadwalkan oktaf atas `MELODY_FREQS[step]! * 2`, durasi `0.2`, sine, vol `0.03`.
  3. Tambah fungsi setelah `setMusicDucked` (sebelum `isMusicPlaying`):
     ```ts
     export function setMusicIntensity(level: 1 | 2 | 3): void {
       const clamped = level < 1 ? 1 : level > 3 ? 3 : level;
       musicLevel = clamped;
     }
     ```
     Catatan: tanpa restart interval (tempo tetap 220 di semua level — keputusan eksplisit agar tidak ada jeda musik; beda level hanya layering).
- Urutan perubahan di dalam file: field → `musicTick` (2 kondisi + 1 blok oktaf) → fungsi baru.
- Behavior yang harus dipertahankan: `startTrainMusic` idempoten; level default 1 (musik lama tidak berubah bila fungsi tak dipanggil); volume ≤0.06; tidak ada autoplay; `stop*` tak berubah.
- Error handling/edge: input `0`/`99`/`NaN` → clamp (NaN: `NaN < 1` false, `NaN > 3` false → `musicLevel = NaN as ...`; TAMBAHKAN guard exact: `if (!Number.isFinite(level)) { musicLevel = 1; return; }` sebagai baris pertama fungsi); jsdom tanpa AudioContext → no-op.
- Test yang harus ditambahkan (`tests/trainMusic.test.ts`, +2 case, jangan ubah 3 case existing):
  - Case "clamp level": `setMusicIntensity(0 as 1); setMusicIntensity(99 as 3); setMusicIntensity(NaN as 1);` expected tidak throw.
  - Case "start dengan level 3 lalu stop": `startTrainMusic(); setMusicIntensity(3); stopTrainMusic();` expected tidak throw + `isMusicPlaying() === false`.
- Input test dan expected result: jsdom tanpa AudioContext → no-op; `not.toThrow()` + `toBe(false)`.
- Command verifikasi: `npm test -- tests/trainMusic.test.ts` lalu `npm run typecheck`.
- Hasil verifikasi yang diharapkan: 5 case hijau; typecheck 0 error.
- Completion criteria: fungsi + field exact; tick lama identik saat level 1; test hijau.
- File/area yang tidak boleh diubah: signature fungsi existing; `sound.ts`; `trainSound.ts`; TTS; dependensi.

---

## S2 — Wiring intensitas per ronde di `TrainScreen`

- Tujuan langkah: musik naik level mengikuti ronde tanpa ubah alur/timer.
- Finding/requirement: F1 (bagian wiring).
- Dependency: S1.
- File yang harus dibaca: `src/screens/TrainScreen.tsx` (`handleStart`, `handleReachStation` blok ronde-lanjut).
- File yang harus diubah: `src/screens/TrainScreen.tsx` saja (2 lokasi).
- Simbol terkait: `setMusicIntensity` (S1), `round`, `TOTAL_QUESTIONS`.
- Kondisi implementasi saat ini: musik start level implisit 1; tidak ada perubahan level per ronde.
- Perubahan konkret (urut):
  1. Import: tambah `setMusicIntensity` ke import existing dari `'../lib/trainMusic'` (satu nama, abjad: setelah `setChugRate`, sebelum `setMusicDucked`? Urutan existing: `setChugRate, setMusicDucked, startChug, startTrainMusic, stopAllTrainAudio, stopChug, stopTrainMusic` — sisipkan `setMusicIntensity` setelah `setChugRate` agar abjad terjaga).
  2. `handleStart`: setelah blok `if (musicOn) { startTrainMusic(); startChug(); setChugRate(...); }` tambah 1 baris: `setMusicIntensity(1);` (reset tiap sesi baru).
  3. `handleReachStation` blok ronde-lanjut (setelah `setRound((r) => r + 1)`): tambah 1 baris exact:
     ```ts
     setMusicIntensity(round + 1 < 2 ? 1 : round + 1 < 4 ? 2 : 3);
     ```
     (`round` di sini 0-based ronde yang baru selesai; ronde berikutnya = `round + 1` 0-based → level: ronde 0–1 → 1, ronde 2–3 → 2, ronde 4 → 3.)
- Urutan perubahan di dalam file: import → `handleStart` → `handleReachStation`.
- Behavior yang harus dipertahankan: timer, guard, kamera, whistle, celebrate — tidak disentuh; musik mati tetap mati (`musicOn` false → tidak ada pemanggilan baru yang membunyikan; `setMusicIntensity` hanya set variabel, tanpa suara).
- Error handling/edge: `setMusicIntensity` aman dipanggil saat musik mati (hanya set field); tidak ada throw.
- Test yang harus ditambahkan: tidak ada (wiring React; tercakup test lib S1 + manual S8).
- Input test dan expected result: tidak ada.
- Command verifikasi: `npm run typecheck` + `npm run lint`.
- Hasil verifikasi yang diharapkan: 0 error keduanya.
- Completion criteria: 3 penambahan exact ada; tidak ada perubahan logika lain.
- File/area yang tidak boleh diubah: state machine, timer `later`, guard, `QuestionDialog`, keyboard (sudah ada).

---

## S3 — Rambu sinyal + papan info di `TrainScene`

- Tujuan langkah: umpan balik 3D (hijau konfirmasi / kuning netral) + papan stasiun dua baris; +4 mesh.
- Finding/requirement: F2; C1 (budget), C2 (dispose).
- Dependency: S0 (independen dari S1–S2).
- File yang harus dibaca: `src/components/train/TrainScene.ts` (`buildEnvironment` blok stasiun; `drawSign`; `reset`; `dispose`; komentar budget).
- File yang harus diubah: `src/components/train/TrainScene.ts` saja.
- Simbol exact (baru/diubah):
  ```ts
  setSignal(active: BranchIndex | null, ok: boolean): void;
  setStationBoard(label: string, sub: string): void;
  drawSign(label: string, sub?: string): void; // tambah param opsional, kompatibel
  ```
  Field privat baru: `signalMats: THREE.MeshLambertMaterial[] = []`.
- Kondisi implementasi saat ini: tanpa rambu; `drawSign(label)` 1 baris font 44/36px; `reset` memanggil `setSelectedGlow(null)` + kamera fixed.
- Perubahan konkret (urut):
  1. Komentar budget: ubah `Total 78` menjadi `Total 82` + tambah `+ rambu 4 (tiang 1 + bola 3)` pada rincian fase berikutnya. Satu-satunya perubahan budget; tanpa mesh lain.
  2. Field `signalMats` di dekat `lanternMats`.
  3. `buildEnvironment`, setelah blok penumpang: tiang `CylinderGeometry(0.06, 0.06, 2.4, 8)` abu `#94a3b8` di `(2.5, 1.2, -4)`; 3 bola `SphereGeometry(0.16, 8, 6)` di `(2.5, 2.5 - i * 0.45, -4)` untuk i 0..2 (0=kiri/atas, 1=tengah, 2=kanan/bawah — urutan visual atas→bawah memetakan kiri→kanan, catat di komentar); tiap bola material sendiri via `this.lambert('#475569')` + `emissive` hitam awal, push ke `signalMats`. 4 mesh.
  4. `drawSign(label, sub?)`: setelah `fillText(label, 128, 42)`, bila `sub` non-kosong tambah `ctx.font = 'bold 28px Nunito, sans-serif'; ctx.fillText(sub, 128, 68);` — canvas 256×80 muat (label y 42, sub y 68). Panggilan existing `drawSign('STASIUN')` tetap valid.
  5. Method baru setelah `setSelectedGlow`:
     ```ts
     setSignal(active: BranchIndex | null, ok: boolean): void {
       for (let i = 0; i < this.signalMats.length; i++) {
         const m = this.signalMats[i]!;
         if (active === i) {
           m.emissive.set(ok ? '#22c55e' : '#facc15');
           m.emissiveIntensity = 1.2;
         } else {
           m.emissive.set('#000000');
           m.emissiveIntensity = 0;
         }
       }
     }
     setStationBoard(label: string, sub: string): void {
       this.drawSign(label);
       if (this.signTexture) this.signTexture.needsUpdate = true;
       void sub;
     }
     ```
     KOREKSI agar `sub` benar dipakai (jangan `void sub`): `drawSign` sudah menerima `sub`, jadi badan yang benar:
     ```ts
     setStationBoard(label: string, sub: string): void {
       this.drawSign(label, sub);
       if (this.signTexture) this.signTexture.needsUpdate = true;
     }
     ```
     (Gunakan versi ini; abaikan versi `void sub` di atas — tertulis agar eksekutor tidak meniru pola salah.)
  6. `reset()`: tambah `this.setSignal(null, true);` setelah baris `setSelectedGlow(null)` (argumen `ok` diabaikan saat `null`).
- Urutan perubahan di dalam file: komentar budget → field → rambu di `buildEnvironment` → `drawSign` (+param) → 2 method → 1 baris `reset`.
- Behavior yang harus dipertahankan: semua gerak/tema/kamera existing; `document` undefined → rambu tetap dibangun (tanpa canvas, aman); papan tanpa sub identik dengan sekarang.
- Error handling/edge: `setSignal` dengan `signalMats` kosong (SSR tanpa build? tidak mungkin — build selalu jalan di konstruktor) → loop nol iterasi, aman; `sub` kosong → tidak digambar (guard `if (sub)` di `drawSign`).
- Test yang harus ditambahkan: tidak ada (WebGL).
- Input test dan expected result: tidak ada.
- Command verifikasi: `npm run typecheck`.
- Hasil verifikasi yang diharapkan: 0 error.
- Completion criteria: 2 method + 1 param opsional exact; 4 mesh sesuai ledger; dispose tertutup traverse (material bola ikut traverse).
- File/area yang tidak boleh diubah: kurva, tema, kamera, papan jawaban, Canvas/Screen (wiring S4), merah untuk salah (dilarang — kuning netral per OQ-2).

---

## S4 — Wiring signal + station board di `TrainScreen`

- Tujuan langkah: hubungkan rambu/papan ke peristiwa jawab dan progres bintang.
- Finding/requirement: F2 (bagian wiring).
- Dependency: S3.
- File yang harus dibaca: `src/screens/TrainScreen.tsx` (`handleAnswer` benar/salah, deklarasi `starsSoFar`, render `TrainCanvas`).
- File yang harus diubah: `src/screens/TrainScreen.tsx` saja (3 lokasi).
- Simbol terkait: `setSignal`, `setStationBoard`, `starsSoFar` (existing).
- Kondisi implementasi saat ini: `setSelectedGlow` + `waveDriver` + `playTrainSwitch` di jawaban benar; tanpa signal/board.
- Perubahan konkret (urut):
  1. `handleAnswer` benar: setelah baris `sceneRef.current?.setSelectedGlow(choiceIndex)` tambah `sceneRef.current?.setSignal(choiceIndex, true);`.
  2. `handleAnswer` salah: setelah baris `setFeedback({ kind: 'wrong', text: t('train.retry') })` tambah `sceneRef.current?.setSignal(choiceIndex, false);`. (Kuning netral; copy tetap "Hampir benar, coba lagi.".)
  3. Setelah deklarasi `starsSoFar` (atau dekat `announceText`), tambah effect exact:
     ```ts
     useEffect(() => {
       if (grade !== null && phase !== 'MENU') {
         sceneRef.current?.setStationBoard(t('train.stationShort'), `★ ${starsSoFar}`);
       }
     }, [starsSoFar, grade, phase, t]);
     ```
     `useEffect` sudah di-import.
- Urutan perubahan di dalam file: benar → salah → effect.
- Behavior yang harus dipertahankan: guard fase, timer, glow, wave, ducking, confetti — tidak disentuh; fallback 2D (`sceneRef` null) aman via `?.`.
- Error handling/edge: `question` null (menu) → effect guard `grade !== null`; `starsSoFar` 0 → papan `★ 0`, valid.
- Test yang harus ditambahkan: tidak ada.
- Input test dan expected result: tidak ada.
- Command verifikasi: `npm run typecheck` + `npm run lint`.
- Hasil verifikasi yang diharapkan: 0 error keduanya.
- Completion criteria: 3 penambahan exact; tidak ada perubahan lain.
- File/area yang tidak boleh diubah: state machine, timer, guard, `QuestionDialog`, signal merah (dilarang).

---

## S5 — Variasi idle di `TrainScene`

- Tujuan langkah: penumpang bergantian, sapi mengangguk, masinis menoleh — tanpa mesh/API publik baru.
- Finding/requirement: F3 (bagian scene).
- Dependency: S3 (menyentuh `update` yang sama; kerjakan setelah S3 agar tidak konflik).
- File yang harus dibaca: `src/components/train/TrainScene.ts` (`update` blok wave/hop/flag/butterfly; `buildTrain` masinis; `buildEnvironment` sapi/penumpang).
- File yang harus diubah: `src/components/train/TrainScene.ts` saja.
- Simbol terkait: field existing `driverArm`, `passengers`, `hopT`, `waveT`, `elapsed`, `rm`, `selected`; field privat baru `cowHead: THREE.Mesh | null = null`.
- Kondisi implementasi saat ini: hop serentak (`sin(elapsed*10)` sama semua); sapi statis; kepala masinis statis (tidak ada mesh kepala terpisah? ADA — `head` sphere di `buildTrain`, tapi tidak disimpan sebagai field).
- Perubahan konkret (urut):
  1. `buildTrain`: simpan `head` ke field baru `driverHead: THREE.Mesh | null = null` (tambah field di deklarasi kelas). Satu baris setelah `head.position.set(...)`: `this.driverHead = head;`.
  2. `buildEnvironment` sapi: setelah `cowHead.position.set(...)` tambah `this.cowHead = cowHead;` (field `cowHead` dideklarasikan di kelas).
  3. `update`, blok hop: ubah menjadi per-penumpang dengan offset fase:
     ```ts
     if (this.hopT < 1) {
       for (let pi = 0; pi < this.passengers.length; pi++) {
         this.passengers[pi]!.position.y = 0.8 + Math.abs(Math.sin(this.elapsed * 10 + pi * 1.5)) * 0.18;
       }
       this.hopT += dtc;
     }
     ```
     (Ganti loop existing; `dtc` adalah nama variabel clamp di `update` — verifikasi nama saat edit; bila bernama `dt`, pakai itu. Jangan rename variabel lain.)
  4. `update`, setelah blok bendera: tambah
     ```ts
     if (this.cowHead && !this.rm) {
       this.cowHead.rotation.x = Math.sin(this.elapsed * 0.8) * 0.15;
     }
     if (this.driverHead) {
       this.driverHead.rotation.y = (this.phase === 'branch' ? this.selected * 0.4 - 0.4 : 0);
     }
     ```
- Urutan perubahan di dalam file: 2 field → simpan `head` → simpan `cowHead` → hop offset → blok sapi+kepala.
- Behavior yang harus dipertahankan: durasi wave/hop (1 dtk via `< 1`); skip saat paused (guard existing); rm mematikan bendera/kupu (existing) + sapi (baru), tapi hop/wave tetap (peristiwa, bukan ambient).
- Error handling/edge: field null (tidak mungkin pasca-konstruktor, tapi guard `if` tetap); `selected` valid 0–2 selalu.
- Test yang harus ditambahkan: tidak ada (WebGL).
- Input test dan expected result: tidak ada.
- Command verifikasi: `npm run typecheck`.
- Hasil verifikasi yang diharapkan: 0 error.
- Completion criteria: hop bergantian, sapi mengangguk, kepala menoleh; tanpa mesh/metode publik baru.
- File/area yang tidak boleh diubah: kurva, tema, kamera, papan, Canvas/Screen (S6 untuk tone), audio.

---

## S6 — Prop `tone` di `TrainCelebration` + test + wiring

- Tujuan langkah: confetti berwarna sesuai tema grade tanpa ubah perilaku default.
- Finding/requirement: F3 (bagian confetti).
- Dependency: S0 (independen dari S1–S5).
- File yang harus dibaca: `src/components/train/TrainCelebration.tsx` (array emoji, 24 span), `tests/trainCelebration.test.tsx` (2 case), `src/screens/TrainScreen.tsx` (render `<TrainCelebration show={celebrate} />`, state `grade`).
- File yang harus diubah (3 file):
  1. `src/components/train/TrainCelebration.tsx` — prop opsional + map set.
  2. `tests/trainCelebration.test.tsx` — tambah 1 case.
  3. `src/screens/TrainScreen.tsx` — oper prop (1 baris).
- Simbol exact:
  ```tsx
  export type TrainCelebrationTone = 'flowers' | 'farm' | 'dusk';
  export interface TrainCelebrationProps { show: boolean; tone?: TrainCelebrationTone; }
  const TONE_EMOJIS: Record<TrainCelebrationTone, readonly string[]> = {
    flowers: ['🌸', '✨', '🎉', '⭐', '🎊', '💐'],
    farm: ['🍎', '⭐', '🎉', '✨', '🌾', '🎊'],
    dusk: ['🌟', '✨', '🎉', '⭐', '🌙', '🎊'],
  };
  ```
  Set default (tanpa `tone`) = array existing `['🎉','⭐','🎊','✨','🌟','🎈']` (jangan ubah default agar snapshot lama valid).
- Kondisi implementasi saat ini: 1 set emoji hardcode; caller tanpa prop.
- Perubahan konkret (urut):
  1. Celebration: tambah type + map + `tone` opsional; `const emojis = tone ? TONE_EMOJIS[tone] : EMOJIS;` lalu pakai `emojis[i % emojis.length]` (ganti `EMOJIS` hardcode di render; array `EMOJIS` existing dipertahankan untuk default).
  2. Test: tambah case "tone farm tetap 24 span": render `<TrainCelebration show tone="farm" />` → 24 span + `aria-hidden`.
  3. Screen: ubah `<TrainCelebration show={celebrate} />` menjadi
     ```tsx
     <TrainCelebration
       show={celebrate}
       tone={grade === 2 ? 'farm' : grade === 3 ? 'dusk' : 'flowers'}
     />
     ```
- Urutan perubahan di dalam file: komponen → test → caller.
- Behavior yang harus dipertahankan: `show=false` → null; `aria-hidden`; tanpa timer internal; CSS existing; reduced-motion via CSS global.
- Error handling/edge: `tone` undefined → default; tidak ada throw.
- Test yang harus ditambahkan: 1 case seperti di atas (jangan ubah 2 case existing).
- Input test dan expected result: `querySelectorAll('.train-confetti span')` length 24.
- Command verifikasi: `npm test -- tests/trainCelebration.test.tsx` lalu `npm run typecheck`.
- Hasil verifikasi yang diharapkan: 3 case hijau; typecheck 0 error.
- Completion criteria: prop opsional exact; 3 set exact; default tak berubah; test hijau.
- File/area yang tidak boleh diubah: CSS confetti, HUD, logika musik, timer celebrate.

---

## S7 — Verifikasi otomatis (tanpa kode baru)

- Tujuan langkah: buktikan semua constraint sebelum klaim selesai; perbaikan bug satu-baris diizinkan hanya bila verifikasi gagal, wajib dicatat di Progress Log.
- Finding/requirement: F1–F4 + C1–C4.
- Dependency: S1–S6 selesai.
- File yang harus dibaca: output tiap command; `vite.config.ts` (baca saja — chunks, JANGAN ubah).
- File yang harus diubah: tidak ada (kecuali perbaikan bug terpaksa + `npx prettier --write` hanya pada file tersentuh S1–S6 bila `format:check` gagal).
- Checklist exact (urut):
  1. `npm run lint` → 0 error.
  2. `npm run typecheck` → 0 error.
  3. `npm test -- tests/trainMusic.test.ts tests/trainCelebration.test.tsx` → hijau.
  4. `npm test` penuh → 0 failed (ekspektasi 51+ file; yang wajib: angka failed = 0).
  5. `npm run build` → sukses; `three` tetap chunk terpisah; tidak ada file audio (`.mp3/.wav/.ogg`) di `dist/assets`.
  6. `npm run format:check` → hijau.
  7. Grep (catat hasil): (a) `gagal` case-insensitive di `src/components/train src/screens/TrainScreen.tsx src/i18n/dicts` → kosong; (b) `from 'three'` di `src/lib` → kosong; (c) `speechSynthesis` di `src` → hanya `aquariumSound.ts`, `gardenSound.ts`, `trainSound.ts` (`stopTrainAudio` lama); (d) `shadowMap.enabled = true|ShaderMaterial|Physics` di `src/components/train` → kosong; (e) `TubeGeometry` segments ≤32 di `TrainScene.ts`.
  8. Audit budget: komentar ledger cocok (≤82 mesh + 3 sprite); `setPixelRatio(min(dpr,1.5))` ada.
- Behavior yang harus dipertahankan: tidak ada perubahan perilaku di langkah ini.
- Error handling/edge: bila 1–6 gagal → perbaiki minimal, ulangi command terkait, catat di Progress Log (file + baris + alasan).
- Test: tidak ada test baru.
- Command verifikasi: delapan di atas.
- Hasil verifikasi yang diharapkan: semua hijau/sesuai.
- Completion criteria: S7 selesai bila 8 checklist hijau/tercatat; penyimpangan → blocker, bukan improvisasi.
- File/area yang tidak boleh diubah: CI workflow, vite config, file non-train.

---

## S8 — Checklist manual (preview + browser)

- Tujuan langkah: verifikasi indrawi yang tidak bisa diuji vitest (visual, audio nyata, lifecycle).
- Finding/requirement: F1–F4 + C2–C4.
- Dependency: S7 hijau (build sukses).
- File yang harus dibaca: tidak ada (kerja browser). Prasyarat: `npm run build` S7 + `npm run preview -- --host 127.0.0.1 --port 4173`.
- File yang harus diubah: tidak ada.
- Langkah exact (catat tiap hasil di Progress Log: centang/gagal + bukti):
  1. Buka preview (mobile 390px + desktop): Home → kereta → K1/K2/K3 (3 tema beda: langit/dekor/lentera) → jawab 1 soal → confetti + whistle + glow + sinyal hijau + nada bintang; tanpa scroll horizontal; tombol ≥44px.
  2. Console: 0 error/warning selama 1 sesi penuh 5 soal.
  3. Keyboard: 1/2/3 jawab, M mute, N musik, Esc jeda, Enter/Space tombol.
  4. Restart 3× (quit → start): 1 kereta (tidak ganda), tanpa `Context Lost` berulang, musik/chug tidak tumpuk (dengar).
  5. WebGL-off (sensor devtools): fallback 2D playable sampai hasil; musik tetap jalan bila on.
  6. Reduced-motion on: tanpa confetti/asap/lerp kamera/bendera/kupu; kereta cepat; musik tetap.
  7. Audio nyata (HP/laptop bersuara): chug mengikuti gerak, ducking terdengar saat jawaban, bintang 1 vs 2 vs 3 nada berbeda, peluit saat berangkat + tiba stasiun.
- Behavior yang harus dipertahankan: tidak ada perubahan kode selama S8 kecuali bug (kembali ke S7 untuk verifikasi ulang).
- Error handling/edge: Service Worker dapat menyajikan build lama — bila versi/footer tidak cocok, rebuild + hard refresh + catat.
- Test: tidak ada.
- Command verifikasi: `npm run preview -- --host 127.0.0.1 --port 4173` (foreground; hentikan setelah selesai).
- Hasil verifikasi yang diharapkan: 7 langkah centang.
- Completion criteria: semua centang atau blocker tercatat.
- File/area yang tidak boleh diubah: semua file (kecuali bug fix terpaksa).

---

## S9 — TODO tercatat + version bump + memory + handoff (tanpa commit)

- Tujuan langkah: tutup plan dengan jejak lengkap; tanpa commit kecuali pengguna meminta eksplisit.
- Finding/requirement: F5–F8 (TODO-1..4).
- Dependency: S7–S8.
- File yang harus dibaca: `git status --short` (read-only) untuk daftar file; `.memory/README.md` (format index); `package.json` (field version).
- File yang harus diubah (hanya ini):
  1. `package.json`: `1.6.0` → `1.7.0` (SemVer feat; satu baris).
  2. `.memory/YYYY-MM-DD/HHmmss-kereta-fase-3.md` (satu entry: tugas, file diubah, keputusan, asumsi/risiko, blocker, verifikasi, commit proposal satu baris, relasi plan ini).
  3. `.memory/README.md` (timestamp, 1 baris current state, 1 entri recent ≤20 — jangan hapus histori, tanpa secret).
  4. File plan ini (centang Tasks S0–S9 + Progress Log).
- TODO yang wajib tertulis di memory entry (salin exact):
  - TODO-1 TTS: butuh keputusan pengguna; opsi voice `id` + toggle ketiga; risiko beda perilaku per browser.
  - TODO-2 sync progres: butuh backend/auth, bertentangan prinsip client-side; opsi ekspor/impor JSON manual.
  - TODO-3 resume sesi: butuh persist fase + rehidrasi kurva/kamera; desain terpisah.
- Dilarang: `git add/commit/push` dalam bentuk apa pun.
- Handoff checklist (wajib centang semua):
  - [ ] S0–S9 berurutan; API exact (`setMusicIntensity`, `setSignal`, `setStationBoard`, `tone` confetti, wiring S2/S4/S6).
  - [ ] `lint/typecheck/test/build/format:check` hijau; grep S7 sesuai.
  - [ ] Ledger ≤82 mesh cocok; tanpa dep/biner baru; `package.json` 1.7.0.
  - [ ] Manual S8 dicentang; TODO-1..3 + OQ-1/OQ-2 tercatat.
  - [ ] Memory + plan diperbarui; jawaban akhir berisi ringkasan file, keputusan, batasan.
- Completion criteria: 4 file di atas diperbarui; tidak ada commit.
- File/area yang tidak boleh diubah: semua kode dan test selain S9.1.

---

## Progress Log

- 2026-09-25 12:00:00 — Plan Fase 1+2 dibuat dan diimplementasikan (commit `7715a08`). Batasan tersisa: 7 poin.
- 2026-09-25 15:30:00 — Plan Fase 3 dibuat (S0–S9). Scope: poin 2, 3, 4, 7. TODO: poin 1, 5, 6 + bump versi. Belum ada implementasi.
- 2026-09-25 16:00:00 — S0–S9 selesai. lint/typecheck/test (51 file/376 test)/build/format hijau. Grep constraint lolos. Manual: 3 tema terverifikasi beda via preview 127.0.0.1:4174 (K1 hijau+kupu, K2 sawah+sapi, K3 ungu+lentera), tombol musik 🎵 + rambu sinyal tampil, tanpa scroll horizontal; versi 1.7.0. Keterbatasan: tab headless ter-throttle rAF sehingga gerak kereta/audio nyata tidak dapat diverifikasi di otomasi (TODO-4). Memory: `.memory/2026-09-25/160000-kereta-fase-3.md`. Tanpa commit (menunggu permintaan).

## Notes

- **Keputusan yang sudah dikunci:** poin 2/3/4/7 dikerjakan; poin 1/5/6 TODO; tanpa TTS; tanpa biner; tempo musik tetap 220 (beda level hanya layering — menghindari jeda restart interval); salah = kuning netral (bukan merah); tanpa lerp transisi tema; `setMusicIntensity` aman saat musik mati.
- **OQ-1 cap mesh 78 → 82:** opsi (a) naikkan ke 82 — REKOMENDASI dan dipakai plan ini (draw call <85, tetap ringan; ledger diperbarui); opsi (b) korbankan dekor Fase 2 — DITOLAK (mengurangi yang sudah disetujui). Perubahan dicatat eksplisit di sini + S3, bukan diam-diam.
- **OQ-2 sinyal salah kuning vs merah:** opsi kuning (netral, konsisten larangan kesan menghukum) — REKOMENDASI dan dipakai; opsi merah — DITOLAK kecuali pengguna meminta (ubah 1 baris `setSignal`).
- **Counter-pertimbangan yang ditolak:** restart interval saat ganti level (ditolak: jeda terdengar); lerp warna tema (ditolak: state paruh jalan); merah untuk salah (ditolak: kesan gagal); test WebGL (ditolak: kebijakan R1).
- **Batasan yang tetap ada setelah plan ini:** musik 8-langkah berlapis (bukan komposisi adaptif penuh); papan 3D hanya angka + label; progres lokal; refresh reset; TODO-1..3 terbuka.
- **Perintah yang tersedia (eksekutor):** `npm run lint`, `npm run typecheck`, `npm test`, `npm test -- <file>`, `npm run build`, `npm run format:check`, `npm run preview -- --host 127.0.0.1 --port 4173`, `git status --short`. Dilarang: `git add/commit/push`, perubahan di luar file listed.

---

## Handoff Checklist (untuk model eksekutor kecil)

- [ ] Kerjakan S0→S9 berurutan; S1 hijau sebelum scene (S3/S5).
- [ ] Setiap langkah: baca file listed → ubah hanya file listed → API + cuplikan exact → test listed → command listed → penuhi completion criteria.
- [ ] Setiap finding F1–F4 + constraint C1–C4 ditangani ≥1 langkah + verifikasi (F5–F8 via grep/catatan S7/S9).
- [ ] Jangan ubah area "Tidak boleh diubah"; bila harus, jadikan blocker + minta keputusan.
- [ ] Akhiri dengan S7–S9 + ringkasan file diubah, keputusan arsitektur, batasan tersisa.
