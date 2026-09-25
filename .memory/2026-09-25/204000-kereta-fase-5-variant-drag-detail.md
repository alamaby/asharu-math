# 2026-09-25 — Kereta Fase 5 (Variant Kereta, Drag Kamera, Detail Objek, Maneuver Belok)

Waktu: 2026-09-25 20:40:00
Plan: `plans/2026-09-25-kereta-fase-5-variant-drag-detail.md` (S0–S10)
Versi: `1.8.0` → `1.9.0` (feat)

## Tugas

Tingkatkan daya tarik visual kereta dengan 4 peningkatan: detail objek lebih kaya (InstancedMesh), drag kamera kiri-kanan (yaw + auto-return), randomisasi bentuk & warna lokomotif + gerbong (tersimpan di snapshot), maneuver belok lebih halus (mundur → jeda → maju + lean).

Keputusan pengguna: budget baru ≤82 mesh + instanced (≤90 draw call); drag auto-return (opsi B); variant disimpan di snapshot; timing maneuver default untuk direview nanti.

## File yang diubah

Baru:
- `src/lib/trainVariants.ts` — `pickTrainVariant(seed?)` (PRNG mulberry32), `isValidTrainVariant`, `_variantHelpers`; 3 bentuk loko × 5 warna, 3 jenis gerbong × 5 warna, 1–2 gerbong (jenis berbeda).
- `src/lib/trainManeuver.ts` — `computeManeuver(elapsedMs)`, `MANEUVER_BACK_MS = 350`, `MANEUVER_PAUSE_MS = 250`, `MANEUVER_TOTAL_MS = 600`.
- `tests/trainVariants.test.ts` (5), `tests/trainManeuver.test.ts` (4).

Diubah:
- `src/lib/trainStorage.ts` — `TrainSessionSnapshot.variant?: TrainVariant` + validasi kondisional.
- `src/components/train/TrainScene.ts` — `applyTrainVariant` + `buildLoco`/`buildWagons`/`disposeParts`; maneuver timeline + lean; drag kamera (`pointerdown/move/up/cancel`, yaw clamp ±60°, auto-return); `buildInstancedDetail` (pinus ×6, pohon bulat ×4, batu ×6, pagar ×16, semak ×4, burung ×3, bunga ×6, padi ×12, lumbung, domba ×2, kunang-kunang ×6, jendela menyala ×2); animasi burung + kedip kunang-kunang; asap hanya varian `classic`.
- `src/components/train/TrainCanvas.tsx` — prop `trainVariant` + effect + init; `touchAction: 'none'`.
- `src/screens/TrainScreen.tsx` — state `variant`, `pickTrainVariant` di start, `resumable.variant ?? pickTrainVariant()` saat resume, snapshot menyimpan variant, timer `SWITCHING_TRACK` 500→900ms.
- `package.json` — `1.9.0`.
- Test: `tests/trainSessionStorage.test.ts` (+2 case).

## Keputusan arsitektur

- `InstancedMesh` (bawaan Three.js) untuk objek berulang → draw call tetap rendah walau objek banyak.
- Variant disimpan di snapshot (`variant?` opsional) → konsisten setelah refresh; snapshot lama tetap valid.
- Drag memakai pointer events + auto-return saat kereta bergerak; yaw-only (tanpa pitch) untuk menghindari framing rusak.
- Maneuver memakai timeline pure (`trainManeuver.ts`) agar bisa diuji tanpa WebGL; konstanta terpisah untuk tuning.
- Asap hanya untuk loko `classic` (diesel/tank tidak berasap) — detail kecil yang menambah karakter.

## Asumsi / risiko

- Ledger mesh diperbarui ke "≤82 mesh + instanced, ≤90 draw call"; belum diukur draw call aktual di browser (perlu review manual pengguna).
- Drag tidak aktif saat paused (update early-return) — dicatat sebagai batasan.
- Timing maneuver (350+250ms) menunggu review pengguna; konstanta mudah diubah di `trainManeuver.ts`.

## Blocker

- Verifikasi manual interaktif penuh (drag di layar sentuh, maneuver terlihat, FPS dengan detail baru, restart 3×) belum dapat dijalankan di otomasi — tab headless ter-throttle rAF sehingga kereta tidak bergerak. Screenshot berhasil memverifikasi detail objek baru di K2 & K3.

## Verifikasi

- `npm run lint` hijau (setelah menambah `variant` ke deps `useCallback`); `npm run typecheck` hijau; `npm test` 56 file / 400 test hijau; `npm run build` sukses (`TrainScreen` 54.96 kB, three tetap chunk terpisah); `npm run format:check` hijau.
- Grep: tanpa `gagal`, tanpa `shadowMap.enabled = true`/`ShaderMaterial`/`Physics` di train, tanpa `three` di `src/lib`.
- Manual (preview 127.0.0.1:4177, mobile 390px): detail objek baru terlihat jelas (pagar rel, batu, semak, pohon pinus + bulat, lumbung, domba, jendela menyala di K3); HUD 6 tombol utuh; tanpa scroll horizontal.

## TODO (belum dikerjakan)

- TODO-2 sync progres (backend/privacy) — tetap TODO.
- TODO verifikasi manual interaktif penuh (drag, maneuver, FPS, restart 3×, WebGL-off, reduced-motion) di perangkat nyata.
- TODO review timing maneuver oleh pengguna (konstanta di `trainManeuver.ts`).
- TODO commit + push (menunggu permintaan eksplisit).

## Commit proposal

`feat: variant kereta acak, drag kamera, detail lingkungan, dan maneuver belok`

## Relasi

- Plan: `plans/2026-09-25-kereta-fase-5-variant-drag-detail.md`
- Lanjutan: `.memory/2026-09-25/171500-kereta-fase-4-tts-resume.md`
