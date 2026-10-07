# 2026-10-07 — Ancang-Ancang Maneuver Kereta Terlihat (Kamera Stabil + Maju Teranimasi + Rel Melengkung)

Waktu: 2026-10-07 14:10:24
Versi: `1.9.2` → `1.10.0` (feat → minor)
Lanjutan dari `2026-10-07/130351-akar-masalah-bodi-kereta-hilang.md` (fix terjungkir). Setelah fix, user meninjau: ancang-ancang (mundur sedikit) setelah jawab benar tidak terasa. Analisa: maneuver ada tapi (1) fase "maju" tidak dianimasikan — kereta teleport 1,26 unit balik ke junction saat masuk cabang, (2) terjadi bersamaan transisi kamera junction→follow + confetti, (3) belokan cabang snap 23° karena titik kontrol cabang kolinear, (4) dilewati total saat reduced-motion. User memilih gabungan 3 opsi perbaikan.

## Perubahan

1. **Fase maju dianimasikan** (`src/lib/trainManeuver.ts`) — timeline baru: mundur 400ms (jarak 0,07 → 0,10 ≈ 1,8 unit) → jeda 150ms → **maju 250ms easeIn sampai t=1,0** (sebelumnya konstan 0,93 = mati). Total 600 → 800ms; kontinuitas sempurna ke cabang karena branch t=0 ≡ main t=1 (junction). Konstanta baru: `MANEUVER_FORWARD_MS`, `MANEUVER_BACK_DISTANCE`. Timer `SWITCHING_TRACK` 900ms di TrainScreen tetap cukup (sisa 100ms perjalanan cabang).
2. **Kamera stabil saat maneuver** (`TrainScene.updateCamera`) — bingkai tetap `(0, 5.5, 7.5)` menembak `(0, 0.6, -0.5)` selama `maneuverActive`, mengembalikan kamera mode (follow) setelahnya. Mundur-maju terlihat jelas dari sudut stabil; kamera junction lama membuat kereta nyaris keluar frame saat mundur dalam.
3. **Rel cabang melengkung** (`TrainScene`) — `BRANCH_MIDS` kolinear diganti `branchMid(end)`: titik tengah chord digeser tegak lurus 1,2 unit ke arah sumbu jalur utama (x=0) → kereta meninggalkan junction dengan heading ±14° (sebelumnya snap 23°) lalu membengkok keluar (tiba ±32°). Cabang tengah tetap lurus. Papan jawaban kini diposisikan dari `branchCurves[i].getPointAt(0.85)` agar menempel rel melengkung (sebelumnya x tetap BRANCH_ENDS).

## File yang diubah

- `src/lib/trainManeuver.ts` — timeline baru + `easeIn` + konstanta jarak mundur.
- `src/components/train/TrainScene.ts` — `branchMid()` + konstruksi kurva cabang; papan jawaban dari titik kurva; framing kamera maneuver.
- `tests/trainManeuver.test.ts` — update timeline (batas fase 400/550/800, tanpa-teleport via cek lompatan per sampel ≤0,05, total 800ms).
- `tests/trainSceneLean.test.ts` — tetap lulus tanpa perubahan (regresi terjungkir mencakup kurva baru).
- `package.json` — 1.10.0.

## Keputusan arsitektur

- Fase `forward` kini benar-benar bergerak; serah terima main→branch tanpa teleport (invarian: branch t=0 ≡ main t=1 posisi).
- Kamera maneuver adalah override di scene (bukan mode baru di API) — TrainScreen tidak berubah.
- Bow cabang diarahkan ke sumbu jalur utama (bukan menjauh) agar heading awal kereta mendekati heading jalur utama — snap junction mengecil 23°→14°.

## Verifikasi

- `npm test` 58 file / 406 test hijau (timeline maneuver diupdate; regresi lean tetap hijau di atas kurva baru).
- `npm run lint`, `npm run format:check`, `npm run build` (tsc + vite) hijau; three tetap chunk terpisah.
- Visual (browser + shim rAF + mode poke manual dt-sintetis 16,67ms): mundur terlihat jelas dari kamera stabil, maju menyurut teranimasi ke junction (z terukur 1,51→0,43→junction, tanpa lompatan), follow cam + bodi utuh di cabang, rel samping terlihat melengkung. Rute cabang tengah diuji end-to-end; cabang samping terverifikasi via geometri kurva + test lean (bukan video).

## Asumsi / risiko

- Total maneuver 800ms vs timer SWITCHING_TRACK 900ms — margin 100ms; kalau konstanta diubah lagi, cek keseimbangan timer di TrainScreen.
- Papan jawaban kini mengikuti kurva (posisi ±beda dari sebelumnya) — perlu konfirmasi visual user.
- Verifikasi manual perangkat nyata (3 kelas, reduced-motion, sentuh) tetap terbuka dari Fase 5.

## Commit proposal

`feat: ancang-ancang belok kereta terlihat — maju teranimasi, kamera stabil, rel melengkung`
