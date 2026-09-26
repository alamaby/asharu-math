# 2026-09-26 — Bugfix Kereta: Mute Header &race Jawaban

Waktu: 2026-09-26 09:55:00
Laporan pengguna + screenshot produksi (th.asharu.id): (1) badan kereta hilang saat maneuver, roda terlihat; (2) tombol mute header kanan-atas tidak berfungsi. Bonus observasi: HUD menunjukkan ★6 pada "Soal 2 dari 5" (attemptsLog ganda).

## Investigasi

- Bug 2 TERKONFIRMASI via inspeksi kode: `AppHeader.toggleSound` hanya menulis `progress.soundEnabled` + flag `sound.ts`, tetapi `TrainScreen` memegang state lokal `muted/musicOn/voiceOn` yang diinisialisasi sekali (stale), dan `trainMusic.ts` + `speakTrain` tidak membaca flag global sama sekali → musik & narasi terus berbunyi walau header menunjukkan 🔇.
- Bug 1 (badan hilang): hierarki scene TERBUKTI utuh via tes headless `TrainScene` asli (konstruksi + `applyTrainVariant` 9 kombinasi + double-apply + maneuver + travel 2800 frame `update()`): children stabil, 0 dispose pada part aktif, posisi finite. `update()` tidak pernah throw (4800 call). Artinya mekanisme hapus-body di level logika TIDAK ada; sisa kemungkinan di path render/GPU atau wiring React — belum tereproduksi (rAF headless ter-throttle).
- Anomali ★6 dijelaskan: `handleAnswer` bisa lolos guard dua kali bila tap kedua tiba setelah commit render tetapi sebelum flush passive effect (`phaseRef` masih basi) — `attemptsLog` jadi `[1,1]`.

## File yang diubah

- `src/components/train/TrainScene.ts` — `buildLoco`/`buildWagons` dipecah menjadi `makeLocoParts`/`makeWagonParts`; `applyTrainVariant` membangun dulu baru membuang yang lama (atomic: kereta tidak pernah tanpa badan walau konstruksi gagal; `locoShape` di-set setelah build sukses).
- `src/screens/TrainScreen.tsx`:
  - `answeringRef` guard sinkron di `handleAnswer`; reset di start/resume/round-lanjut/wrong-retry/finish/quit.
  - Flag efektif `sfxOn/musicActive/voiceActive` = pref lokal AND `progress.soundEnabled`; semua pemanggilan audio memakainya.
  - Effect sinkron global: saat mati → stop musik/chug/narasi; saat menyala lagi → mulai ulang bila sesi berjalan.
  - `handleToggleMute` men-toggle state EFEKTIF (bekerja benar dari kondisi bisu manapun).
  - Dialog jawaban tetap tampil selama `SWITCHING_TRACK` (sebelumnya feedback "Hebat!" tidak pernah ter-paint karena batching CHECKING→SWITCHING dalam satu commit).
  - Props HUD memakai nilai efektif agar ikon jujur.
- `tests/trainScreenMute.test.tsx` (baru, 3 test): sinkron label HUD ikut global; satu jawaban benar = tepat ★3 (klik ganda); unmount bersih.

## Keputusan arsitektur

- Global `progress.soundEnabled` adalah master override; pref lokal kereta (`muted/musicOn/voiceOn`) tetap dipertahankan terpisah (AND semantics).
- Atomic rebuild > dispose-dulu-build-kemudian untuk semua penggantian part kereta.
- Guard ref sinkron untuk event-handler race (bukan hanya andalkan state/effect timing).

## Verifikasi

- `npm run typecheck` hijau; `npm run lint` hijau; `npm test` 57 file / 403 test hijau; `npm run build` sukses (three tetap chunk terpisah); `npm run format:check` hijau.
- Browser (preview + snapshot): klik mute header → ketiga tombol HUD flip ke "Nyalakan suara/musik/narasi suara"; klik lagi → kembali; console kosong.
- Tes headless `TrainScene` (sementara, dihapus setelah verifikasi): lifecycle penuh stabil.

## TODO / butuh dari pengguna (bug 1 belum tertutup penuh)

- Apakah badan kereta hilang SEJAK ronde 1, atau hanya setelah maneuver? (Mempersempit ke apply-time vs maneuver-time.)
- Screenshot console browser (F12 → Console) saat maneuver — error merah akan menunjuk baris persis.
- Verifikasi manual di perangkat nyata: audio (nada bintang, ducking, whistle), restart 3×, WebGL-off, reduced-motion.

## Commit proposal

`fix: sinkron mute global kereta dan cegah jawaban ganda`
