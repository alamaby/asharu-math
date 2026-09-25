# 2026-09-25 — Kereta Fase 3 (musik adaptif, rambu, animasi, verifikasi)

Waktu: 2026-09-25 16:00:00
Plan: `plans/2026-09-25-kereta-fase-3-musik-rambu-verifikasi.md` (S0–S9)
Versi: `1.6.0` → `1.7.0` (feat)

## Tugas

Tutup 4 batasan tersisa kereta: musik adaptif per ronde, rambu sinyal + papan info stasiun, variasi animasi idle + confetti per tema, dan eksekusi checklist verifikasi manual.

## File yang diubah

- `src/lib/trainMusic.ts` — `setMusicIntensity(1|2|3)` + field `musicLevel`; tick: oktaf atas saat level 3, bass+hat tiap langkah saat level ≥2 (tempo tetap 220).
- `src/components/train/TrainScene.ts` — rambu sinyal +4 mesh (tiang + 3 bola, `signalMats`), `setSignal(active, ok)` (hijau konfirmasi / kuning netral), `setStationBoard(label, sub)`, `drawSign(label, sub?)`, hop penumpang bergantian, sapi mengangguk (`cowHead`), masinis menoleh (`driverHead`), budget 78 → 82.
- `src/components/train/TrainCelebration.tsx` — `tone?: 'flowers'|'farm'|'dusk'` + 3 set emoji; default lama dipertahankan.
- `src/screens/TrainScreen.tsx` — import + `setMusicIntensity(1)` di start, `setMusicIntensity(...)` per ronde, `setSignal` benar/salah, effect `setStationBoard`, prop `tone` confetti.
- `package.json` — version `1.7.0`.
- Test: `tests/trainMusic.test.ts` (+2), `tests/trainCelebration.test.tsx` (+1).

## Keputusan arsitektur

- Tempo musik tetap 220ms di semua level (beda level hanya layering) — menghindari jeda saat restart interval.
- Sinyal salah = kuning netral (bukan merah) agar tidak terasa menghukum.
- Budget mesh 78 → 82 (satu-satunya perubahan cap, dicatat di ledger komentar file).

## Asumsi / risiko

- Tanpa TTS, tanpa file audio biner, tanpa dependensi baru (sesuai keputusan pengguna).
- Tab headless preview ter-throttle rAF sehingga kereta tidak bergerak di otomasi; verifikasi gerak/audio harus di browser nyata.

## Blocker

- Tidak ada blocker teknis. Catatan: verifikasi manual interaktif penuh (audio nyata, restart 3×, WebGL-off, reduced-motion) belum dapat dieksekusi di lingkungan otomasi ini — tercatat sebagai TODO verifikasi manual.

## Verifikasi

- `npm run lint` hijau; `npm run typecheck` hijau; `npm test` 51 file / 376 test hijau; `npm run build` sukses (three tetap chunk terpisah, tanpa aset audio di dist); `npm run format:check` hijau.
- Grep: tanpa `gagal` di train; tanpa `three` di `src/lib`; `speechSynthesis` hanya kode lama; tanpa shadow/shader/fisika di train; `TubeGeometry` segments 32.
- Manual (preview 127.0.0.1:4174, mobile 390px): 3 tema terverifikasi beda (K1 hijau+kupu, K2 sawah+sapi, K3 ungu+lentera), tombol musik 🎵 di HUD, rambu sinyal tampil, kereta + masinis terlihat, tanpa scroll horizontal.

## TODO (belum dikerjakan)

- TODO-1 TTS: butuh keputusan pengguna; opsi voice `id` + toggle ketiga; risiko beda perilaku per browser.
- TODO-2 sync progres: butuh backend/auth, bertentangan prinsip client-side; opsi ekspor/impor JSON manual.
- TODO-3 resume sesi setelah refresh: butuh persist fase + rehidrasi kurva/kamera; desain terpisah.
- TODO-4 verifikasi manual interaktif penuh (audio nyata, restart 3×, WebGL-off, reduced-motion) di browser nyata.
- TODO-5 commit + push (menunggu permintaan eksplisit pengguna).

## Commit proposal

`feat: musik adaptif per ronde, rambu sinyal, dan animasi idle kereta`

## Relasi

- Plan: `plans/2026-09-25-kereta-fase-3-musik-rambu-verifikasi.md`
- Lanjutan: `.memory/2026-09-25/150000-kereta-visual-audio-fase-1-2.md`
