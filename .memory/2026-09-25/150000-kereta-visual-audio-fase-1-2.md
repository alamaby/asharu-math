# 2026-09-25 — Kereta Visual-Audio Fase 1+2

Waktu: 2026-09-25 15:00:00 (UTC+7, estimasi sesi)
Plan: `plans/2026-09-25-kereta-visual-audio-fase-1-2.md` (T0–T14)

## Tugas

Kembangkan mini game kereta agar lebih menarik untuk anak: scene hidup (roda, asap, awan/daun, lampu), papan 3D berangka + glow cabang, masinis Asya + stasiun hidup + hewan/dekor, 3 tema per kelas, 4 mode kamera, SFX identitas (peluit/wesel/bintang bertingkat/wrong netral), musik loop + chug + ducking prosedural, confetti DOM, toggle musik terpisah. Tanpa TTS, tanpa file audio biner, tanpa ubah gameplay.

## File yang diubah

Baru:
- `src/lib/trainMusic.ts` — musik pentatonik + chug + ducking (8 fungsi + helpers).
- `src/components/train/TrainCelebration.tsx` — confetti 24 span `aria-hidden`.
- `tests/trainMusic.test.ts`, `tests/trainTheme.test.ts`, `tests/trainCelebration.test.tsx`, `tests/trainSfx.test.ts`.

Diubah:
- `src/components/train/TrainScene.ts` — T5–T9 (roda/asap/awan/daun/lampu, papan berangka + glow, driver/penumpang/bendera/dekor 3 grup, `TRAIN_THEMES` + `applyTheme`, 4 mode kamera; budget ledger ≤78 mesh + 3 sprite).
- `src/lib/sound.ts` — tambah `playTone` (append saja).
- `src/lib/trainSound.ts` — whistle/switch/star + wrong netral-naik.
- `src/lib/trainStorage.ts` — field opsional `musicEnabled` (default true, backward-compatible).
- `src/i18n/dicts/id.ts`, `en.ts` — `train.musicMute/musicUnmute/stationShort`.
- `src/components/train/TrainHUD.tsx` — tombol musik kedua.
- `src/components/train/TrainCanvas.tsx` — props `themeGrade/cameraMode/boardAnswers/stationLabel` + 3 effect + init (cleanup tak tersentuh).
- `src/screens/TrainScreen.tsx` — wiring T12 (13 sub-langkah: whistle, star bertingkat, glow, wave, switch, ducking, confetti, kamera per fase, musik/chug lifecycle, toggle musik + key N, stop saat finish/quit/unmount).
- `src/index.css` — keyframes `train-confetti-fall` (append saja).
- `tests/trainStorage.test.ts` — 2 case musik.

## Keputusan arsitektur

- Satu scene tiga tema via `TRAIN_THEMES` + visibility grup (bukan tiga scene); konstruktor default tema 1.
- Chug lewat ctx musik sendiri (bukan `sound.ts`) agar tidak kena flag SFX global; flag SFX vs musik terpisah.
- Papan 3D cermin DOM saja (canvas redraw + `needsUpdate`, bukan antarmuka).
- Kamera snap saat reduced-motion; asap/confetti/daun-kupu mati saat reduced-motion.
- `CapsuleGeometry` dipakai untuk penumpang (tersedia di three 0.160).

## Asumsi / risiko

- Test WebGL tidak ada (jsdom); scene diverifikasi via typecheck + build + snapshot browser manual.
- `WARNING: Multiple instances of Three.js` di test adalah bawaan existing (akuarium), bukan dari train.

## Blocker

- Tidak ada. Satu penyimpangan kecil dari plan: T5 memakai 3 sprite asap (bukan 5) agar total pas 78 — sudah ditetapkan di plan T7 dan konsisten di ledger komentar.

## Verifikasi

- `npm run lint` hijau; `npm run typecheck` hijau; `npm test` 51 file / 373 test hijau; `npm run build` sukses (three tetap chunk terpisah, tanpa aset audio); `npm run format:check` hijau.
- Grep: `gagal` kosong di train; `from 'three'` kosong di `src/lib`; `speechSynthesis` hanya lama (aquarium/garden + `stopTrainAudio`); tanpa shadow/shader/fisika di train.
- Manual (preview + browser): Home → menu kereta → K2 start → soal tampil; mobile 390px tanpa scroll horizontal.

## Commit proposal

`feat: hidupkan kereta dengan tema per kelas, musik prosedural, dan selebrasi`

## Relasi

- Plan: `plans/2026-09-25-kereta-visual-audio-fase-1-2.md`
- Lanjutan dari: `.memory/2026-09-23/213500-petualangan-kereta-angka.md`
