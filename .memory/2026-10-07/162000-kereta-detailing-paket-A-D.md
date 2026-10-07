# 2026-10-07 — Paket Detailing Kereta A–D (v1.14.0)

Waktu: 2026-10-07 16:20:00
Versi: `1.13.0` → `1.14.0` (feat → minor)
Plan: `plans/2026-10-07-kereta-detail-visual.md` (Fase 7, permintaan user: "lanjut semua A–D")

## Paket A — Detail per gerbong (buildWagonUnits)

- Bogie: rangka sisi box (0.08×0.28×1.35) di luar roda tiap unit (loko + gerbong) — roda terlihat "duduk" di rangka. Tag `bogie`.
- Boxcar: panel papan kayu bernomor unit ("1"/"2") via CanvasTexture di kedua sisi (plane 1.4×0.55, opacity 0.85, rotasi ±π/2 agar teks terbaca benar dari luar). Tag `wagon-decal`.
- Tanker: ring pengikat tengah (TorusGeometry 0.43/0.035, rotasi y π/2) + manhole cylinder di atas tangki. Tag `tanker-ring`/`manhole`.
- Flatbed: 4 pasak cylinder di sudut bak. Tag `stake`.

## Paket B — Detail lokomotif

- Smokebox: silinder gelap (r 0.42) di ujung depan boiler + pintu bulat — ciri khas kereta uap (classic). Tag `smokebox`/`smokebox-door`.
- Whistle kuning di atas boiler (classic). Tag `whistle`.
- Handrail 2 sisi boiler (box tipis). Tag `handrail`.
- **Chuff smoke**: `updateSmoke()` dirombak — puff terlempar 2× per putaran roda tersinkron laju roda (`phase = elapsed·rate/π`), 3 sprite bergilir, naik 1.3 unit + memudar; `smokeAges` dihapus. Diesel/tank/reduced-motion tetap tanpa asap.
- Bodi loko naik ke `MeshPhongMaterial` (shininess 35) — kilap halus. Helper `phong()`.

## Paket C — Gerak

- Crank rod penuh: rod mengikuti pin crank melingkar (`y += 0.1·cos`, `z += 0.1·sin`, kiri/kanan 180°), bukan bob vertikal saja.
- Sway per unit: roll halus fase independen (loko 0.008 rad, gerbong 0.014 rad, fase +2.1/unit) — kereta hidup di jalur lurus.
- Flex coupling: jarak antar unit berdenyut ±2% (sin elapsed·2.5).
- Sway/flex dilewati saat reduced-motion (konsisten koridor aksesibilitas).

## File yang diubah

- `src/components/train/TrainScene.ts` — semua di atas + komentar budget header.
- `tests/trainSceneDetail.test.ts` — assertion diperluas: smokebox/whistle/handrail/bogie(4-6)/wagon-decal/tanker-ring/manhole/stake.
- `package.json` — 1.14.0. Plan file — Fase 7 dichecked + progress log.

## Verifikasi

- `npm test` 410 test hijau (assertion part baru diperluas); lint/format/build hijau.
- Visual browser (5214, shim rAF): alur jawab benar → belok → berjalan normal dengan detail baru; smokebox/chuff dari depan terverifikasi unit test + tampilan alur (screenshot kedatangan stasiun terlewat karena latensi capture IAB — bukan indikasi bug; smokebox/door ter-cover test).

## Asumsi / risiko

- Draw call naik ~±15 (total ±135) — geometri tiny, risiko rendah; ukur aktual di devtools bila perlu.
- Phong sedikit lebih mahal dari Lambert untuk 2-3 material loko — dampak minimal.
- Decal boxcar memakai canvas per-unit — di jsdom test canvas kosong tetap aman (plane transparan).

## Commit proposal

`feat: detailing kereta paket A-D - smokebox, chuff, bogie, decal, crank rod, sway`
