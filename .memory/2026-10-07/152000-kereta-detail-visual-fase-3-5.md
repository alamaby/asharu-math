# 2026-10-07 — Detail Visual Objek 3D Kereta Fase 3–5 (v1.12.0)

Waktu: 2026-10-07 15:20:00
Versi: `1.11.0` → `1.12.0` (feat → minor)
Plan: `plans/2026-10-07-kereta-detail-visual.md` — **SEMUA 5 FASE SELESAI.**
Lanjutan `2026-10-07/145000-kereta-detail-visual-fase-1-2.md`.

## Fase 3 — Vegetasi (TrainScene.buildInstancedDetail)

- Pinus: lapis cone kedua (0.48, 1.1) di y 2.05 bertumpuk di atas cone utama — instanced (+1 draw call).
- Pohon bulat: kanopi kedua sphere 0.5 dengan offset x bergantian — instanced (+1 draw call).
- Variasi warna: `setColorAt` + `offsetHSL` pada cone pinus & kanopi bulat (0 warna netral per kelas i%3) — 0 draw call tambahan.
- Apel: 12 sphere merah 0.07 (3 per pohon bulat) di permukaan kanopi — instanced (+1 draw call).
- Goyangan tajuk: pohon klasik sudah bergoyang; kanopi instanced sengaja statis (hindari update matrix per frame).

## Fase 4 — Bangunan & stasiun (buildEnvironment)

- Rumah ×2: pintu box (0.5×0.8) + cerobong cylinder di atap; atap radius 1.6 → 1.7 (overhang lebih jelas).
- Stasiun: kanopi (atap box 4.2×0.12×2.0 `#d95f5f` + 4 tiang cylinder di peron belakang), 2 bangku (dudukan + sandaran, `#8a5a3b`, menghadap rel), jam stasiun (piringan putih + 2 jarum, statis 10:10-ish, di sisi kanan papan nama).
- Keputusan: jendela instanced berbingkai DIHENTIKAN — rumah sudah punya jendela emissive dusk; menambah bingkai justru dobel visual.

## Fase 5 — Bonus lingkungan

- Awan ×2: kini Group 3 sphere (utama gepeng + 2 puff) — drift `position.x` tetap bekerja pada Group; field `clouds` → `THREE.Group[]`.
- Pagar: rel horizontal pengikat 4 instance (2 sisi × 2 tinggi, box 0.06×0.05×12.8) menghubungkan 16 tiang — instanced (+1 draw call).
- Sapi (K2): 2 tanduk cone + 2 telinga sphere pipih di kepala sapi — farmGroup.

## File yang diubah

- `src/components/train/TrainScene.ts` — semua di atas + komentar budget header (±125 mesh + ±16 instanced).
- `package.json` — 1.12.0.
- `plans/2026-10-07-kereta-detail-visual.md` — semua fase dichecked + progress log.

## Verifikasi

- `npm test` 410 test hijau; `lint`, `format:check`, `build` hijau.
- Visual browser (5212, shim rAF): pinus bertumpuk + kanopi cluster + apel + pagar berpengikat di area start; rumah berpintu & atap overhang; stasiun tampil lengkap (kanopi merah, bangku, jam, penumpang berkepala bermata) saat kereta tiba cabang kanan; alur jawab benar → maneuver → stasiun → ronde berikutnya normal.

## Asumsi / risiko

- Draw call ±120 — belum diukur aktual (devtools); geometri semuanya tiny, risiko rendah.
- Jam stasiun statis — kalau mau jarum berjalan, tambahkan ref + animasi kecil di update().

## Commit proposal

`feat: detail lingkungan kereta - vegetasi, stasiun, awan, sapi`
