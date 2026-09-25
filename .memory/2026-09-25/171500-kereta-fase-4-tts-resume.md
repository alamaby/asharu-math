# 2026-09-25 — Kereta Fase 4 (TTS Narasi + Resume Sesi)

Waktu: 2026-09-25 17:15:00
Plan: `plans/2026-09-25-kereta-fase-4-tts-resume.md` (S0–S9)
Versi: `1.7.0` → `1.8.0` (feat)

## Tugas

Tutup TODO-1 (TTS browser tanpa file audio) dan TODO-3 (resume sesi setelah refresh, per-batas-ronde) pada mini game kereta.

Keputusan pengguna yang diimplementasikan: repeat button ada; feedback diucapkan; attempts reset saat resume; kedaluwarsa snapshot 14 hari.

## File yang diubah

- `src/lib/trainStorage.ts` — `voiceEnabled` opsional + `TrainSessionSnapshot` + `TRAIN_SESSION_KEY`/`TRAIN_SESSION_TTL_MS` (14 hari) + `isValidQuestion`/`isValidTrainSession`/`save`/`load`/`clear` (kedaluwarsa dihapus otomatis saat load).
- `src/lib/trainNarration.ts` (baru) — `speakablePrompt(question, lang)`: `"7 + 5"` → `"7 tambah 5"`, fallback prompt apa adanya.
- `src/lib/trainSound.ts` — `speakTrain`/`repeatTrainNarration`/`stopTrainSpeech` + `isTrainSpeaking` (getter kecil, penyimpangan minor dari plan karena `speaking` harus terbaca agar lolos typecheck); `stopTrainAudio` tidak diubah.
- `src/i18n/dicts/id.ts` + `en.ts` — 5 key: `train.repeatNarration`, `train.resumeSession`, `train.startNewHint`, `train.voiceMute`, `train.voiceUnmute`.
- `src/components/train/TrainHUD.tsx` — props `voiceOn`/`onToggleVoice`/`onRepeatNarration` + 2 tombol (🗣️ toggle, 🔁 repeat).
- `src/components/train/TrainMenu.tsx` — props `resumeInfo`/`onResume` + tombol "▶ Lanjutkan perjalanan" + hint mulai-baru.
- `src/screens/TrainScreen.tsx` — narasi soal (delay 400ms anti-tabrakan peluit), feedback benar/salah (300ms), hint (900ms), toggle voice + repeat, snapshot save (start + tiap ronde) & clear (finish + quit), `handleResumeSession` (attempts reset), keyboard `r`, cleanup `stopTrainSpeech`.
- `package.json` — version `1.8.0`.
- Test: `tests/trainSessionStorage.test.ts` (5), `tests/trainNarration.test.ts` (3), `tests/trainMenu.test.tsx` (2), `tests/trainStorage.test.ts` (+2), `tests/trainSfx.test.ts` (+1).

## Keputusan arsitektur

- TTS memakai `speechSynthesis` browser (voice `id-ID` bila ada, fallback tetap bicara); tanpa file audio/dependensi baru.
- Snapshot sesi per-batas-ronde di key terpisah `asharu-train-session:v1`; refresh mid-round mengulang ronde dengan attempts reset (bintang bisa 3 lagi).
- Anti-tumpuk narasi via `cancelSpeech()` sebelum bicara; `lastNarration` tetap disimpan meski voice off agar repeat bisa saat diaktifkan.

## Asumsi / risiko

- Kualitas voice `id-ID` bergantung perangkat (belum diuji di HP nyata).
- Konflik screen reader (TalkBack/VoiceOver) tidak terdeteksi otomatis — toggle manual tersedia.
- `hintText` generator hanya berbahasa Indonesia (narasi EN memakai teks ID untuk hint).

## Blocker

- Verifikasi manual interaktif penuh (dengar narasi di perangkat bersuara, restart 3×, WebGL-off, reduced-motion) belum dapat dieksekusi di lingkungan otomasi — tab headless ter-throttle rAF. Tercatat sebagai TODO verifikasi manual.

## Verifikasi

- `npm run lint` hijau; `npm run typecheck` hijau; `npm test` 54 file / 389 test hijau; `npm run build` sukses (three tetap chunk terpisah, tanpa aset audio di dist); `npm run format:check` hijau.
- Grep: tanpa `gagal` di train; tanpa `three` di `src/lib`; `speechSynthesis`/`SpeechSynthesisUtterance` hanya di `aquariumSound.ts`, `gardenSound.ts`, `trainSound.ts`.
- Manual (preview 127.0.0.1:4176, mobile 390px): HUD 6 tombol (mute/musik/voice/repeat/jeda/keluar) tampil; resume terverifikasi end-to-end — mulai Kelas 2 → refresh → menu menampilkan "▶ Lanjutkan perjalanan (Kelas 2, soal 1/5)" + hint → klik → soal yang sama (`42 ? 98`) dipulihkan dari snapshot, bukan di-generate ulang.

## TODO (belum dikerjakan)

- TODO-2 sync progres: butuh backend/auth + revisi privacy policy (bertentangan prinsip client-side) — tetap TODO.
- TODO verifikasi manual interaktif penuh di perangkat nyata (audio narasi, restart 3×, WebGL-off, reduced-motion).
- TODO commit + push (menunggu permintaan eksplisit).

## Commit proposal

`feat: narasi suara kereta dan lanjutkan sesi setelah refresh`

## Relasi

- Plan: `plans/2026-09-25-kereta-fase-4-tts-resume.md`
- Lanjutan: `.memory/2026-09-25/160000-kereta-fase-3.md`
