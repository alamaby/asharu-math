# 2026-10-07 — Articulasi Gerbong Kereta (v1.13.0)

Waktu: 2026-10-07 16:05:00
Versi: `1.12.0` → `1.13.0` (feat → minor)
Plan: `plans/2026-10-07-kereta-detail-visual.md` (Fase 6, permintaan user)
Laporan user: animasi belok masih kaku — loko + gerbong bergerak sebagai 1 blok; harusnya terlihat terpisah saat belok.

## Akar masalah

Semua part (loko + gerbong) adalah anak `trainGroup` yang rigid — satu transform untuk semuanya, jadi tidak mungkin terlihat articulated.

## Solusi

1. **Unit pivot per gerbong**: `buildWagonUnits(wagons)` menggantikan `makeWagonParts` — tiap gerbong jadi `THREE.Group` anak **scene** (bukan trainGroup), berisi bodi (boxcar/tanker/flatbed + cargo), 2 roda sendiri (`userData.wheels`), dan coupling belakang hanya bila ada gerbong di belakangnya. Pola atomic build-dulu-dispose-kemudian dipertahankan.
2. **Placement berbasis jarak tempuh**: `placeUnitOnJourney(s, obj)` menempatkan objek pada jarak s sepanjang rute gabungan (main → cabang terpilih; branch t=0 ≡ main t=1). `s < 0` diekstrapolasi lurus ke belakang titik awal (posisi start). `placeAllUnits(locoS)` menempatkan loko di s dan gerbong i di s−(2.0+i·1.9), lalu `rotateZ(lean)` per unit (lean banking hanya fase branch t<0.3 — tetap rotateZ, aman dari cabang Euler x=−π).
3. **Efek**: saat loko memasuki cabang, gerbong masih di jalur utama dengan heading berbeda — pivot di coupling terlihat; gerbong menyusul satu per satu melewati junction.
4. Roda gerbong berputar via `unit.userData.wheels`; `wagonParts` field dihapus; `dispose()` cukup via scene.traverse.

## File yang diubah

- `src/components/train/TrainScene.ts` — buildWagonUnits, placeUnitOnJourney/placeAllUnits, update() memakai journey placement, applyTrainVariant/dispose disesuaikan, buildTrain memanggil buildWagonUnits + coupling depan.
- `tests/trainSceneDetail.test.ts` — countPart traverse dari scene (coupling gerbong kini anak scene).
- `package.json` — 1.13.0. Plan file — Fase 6 dichecked.

## Verifikasi

- `npm test` 410 test hijau; lint/format/build hijau.
- Visual browser (5213, shim rAF): screenshot menangkap momen loko membelok ke cabang kiri sementara gerbong masih lurus di jalur utama — dua unit terlihat terpisah dengan sudut berbeda ✓.

## Asumsi / risiko

- Jarak antar unit tetap konstan (2.0 / 1.9 unit) — pivot visual di area coupling; coupling loko rigid ke loko (gap mikro saat belok tajam, tak terlihat pada skala low-poly).
- Ekstrapolasi belakang saat start menempatkan gerbong di perpanjangan lurus (sama seperti tampilan lama).

## Commit proposal

`feat: articulasi gerbong - loko dan gerbong pivot terpisah saat belok`
