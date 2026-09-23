# Petualangan Kereta Angka — implementasi MVP

Tanggal: 2026-09-23 21:35:00

## Tugas

Implementasikan mini game "Petualangan Kereta Angka" (Three.js) sesuai `plans/2026-09-23-petualangan-kereta-angka.md`: pilih kelas 1–3 → 5 soal per sesi → pilih rel kiri/tengah/kanan → bintang 3/2/1 → layar hasil. Tanpa backend/login/analytics/multiplayer/leaderboard/payment/iklan/toko.

## File yang diubah

Baru (sumber):
- `src/lib/trainQuestionGenerator.ts` — generator pure (K1 tambah/kurang/banding; K2 +kali; K3 +bagi bulat/banding ≤500); 3 pilihan unik; correctIndex diacak.
- `src/lib/trainStars.ts` — `starsForTrainAttempt`/`sumTrainStars`.
- `src/lib/trainStateMachine.ts` — 14 state + `TRAIN_TRANSITIONS` + `transitionTrain`/`resumeTrain`.
- `src/lib/trainStorage.ts` — key `asharu-train:v1`, terpisah dari `UserProgress`.
- `src/lib/trainSound.ts` — delegasi ke `sound.ts`.
- `src/components/train/TrainScene.ts` — Three murni: countryside, kereta+gerbong, main + 3 branch `CatmullRomCurve3`, gerak delta-time, budget ±59 mesh, dpr ≤1.5, shadow off, `dispose()` penuh + `reset()`.
- `src/components/train/TrainCanvas.tsx` — 1 rAF loop, ResizeObserver, visibility pause, cleanup StrictMode-aman.
- `src/components/train/TrainFallback2D.tsx` — mode 2D playable + `role="alert"`.
- `src/components/train/TrainMenu.tsx`, `TrainHUD.tsx`, `QuestionDialog.tsx` — DOM penuh + hint visual setelah 2 salah.
- `src/screens/TrainScreen.tsx` — orkestrasi + hasil via `ResultScreen` (`levelId/settings/nextLevelId=null`).

Diubah:
- `src/state/NavigationContext.tsx` (+ varian `{name:'train'}`), `src/App.tsx` (lazy + case), `src/screens/HomeScreen.tsx` (tombol 🚂), `src/i18n/dicts/id.ts` + `en.ts` (20 key `train.*`).

Test baru (8 file, 27 test): `trainQuestionGenerator`, `trainStars`, `trainStateMachine`, `trainStorage`, `trainSound`, `trainDialog`, `trainFallback`, `trainSession`.

## Keputusan

- Three murni (bukan fiber) untuk loop/dispose eksplisit; `three` chunk existing dipakai ulang.
- Storage key terpisah (hindari migrasi `UserProgress` v1); `GradeLevel` global tetap 1|2; grade 3 hanya internal train.
- Fungsi bintang baru (bukan `starsFor` rasio); tanpa TTS (sfx saja); kereta reset ke awal main tiap ronde.
- Copy exact: benar "Hebat! Jawabanmu benar.", salah "Hampir benar, coba lagi."; tidak ada kata "gagal" di UI train.

## Asumsi & risiko

- Refresh reset ke home (stack in-memory) — diterima MVP.
- Papan 3D tanpa teks jawaban (teks hanya DOM) — disengaja agar DOM satu-satunya antarmuka.
- Risiko: flake distribusi `correctIndex` di test — threshold longgar 15% + 500 iterasi.

## Blocker / belum diverifikasi manual

- Restart 3× tanpa leak dicek via review kode (belum profiling heap).
- Screenshot `browser.capture` timeout di lingkungan uji (snapshot DOM + build lolos sebagai ganti).

## Verifikasi

- `npm run lint` hijau; `npm run typecheck` hijau; `npm test` 47 file/361 test hijau (39/334 sebelumnya + 8/27 train); `npm run format:check` hijau; `npm run build` sukses (`TrainScreen-*.js` 27 kB, tanpa chunk warning baru).
- Browser preview: mobile 390px (Home → menu kereta → soal → jawab benar → ★3 + feedback exact), desktop 1440px tanpa overflow; snapshot tanpa page error.
- Grep: `gagal` kosong di train UI; `from 'three'` kosong di `src/lib/train*`.

## Commit proposal

`feat: tambah mini game Petualangan Kereta Angka`

## Relasi

- Plan: `plans/2026-09-23-petualangan-kereta-angka.md`
