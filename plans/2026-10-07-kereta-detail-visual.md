# Plan: Detail Visual Objek 3D Game Kereta (5 Fase)

Created: 2026-10-07 14:25:00

## Objective

Menambah detail visual objek 3D di game Petualangan Kereta Angka agar lebih hidup dan berkarakter, tanpa melanggar koridor scene: geometri bawaan Three.js, tanpa shadow/post-processing/shader, tetap ringan untuk perangkat anak-anak (target ±120 mesh / ±105 draw call setelah semua fase).

## Scope

- `src/components/train/TrainScene.ts` (utama), `src/lib/trainManeuver.ts` (tidur di fase ini), test scene.
- Tidak mengubah gameplay/state machine/storage — murni visual + animasi kecil.
- Setiap fase dirilis terpisah dan bisa ditinjau user sebelum lanjut.

## Milestones

1. **Fase 1 — Identitas kereta**: batang roda (connecting rod, animasi), cowcatcher, coupling antar gerbong, jendela kabin, dome uap.
2. **Fase 2 — Karakter hidup**: kupu-kupu bersayap flapping, masinis bertorso + mata + brim topi + tangan kedua, penumpang berkepala + mata.
3. **Fase 3 — Vegetasi**: pinus bertumpuk, pohon bulat berklaster, variasi warna per-instance (`setColorAt`), apel tema kebun, goyangan tajuk halus.
4. **Fase 4 — Bangunan & stasiun**: pintu/cerobong rumah, atap overhang, jendela instanced semua bangunan, kanopi + bangku + jam stasiun.
5. **Fase 5 — Bonus lingkungan**: awan berklaster, pagar berpengikat horizontal, detail sapi (tanduk/telinga), apel merah jatuh opsional.

## Tasks

### Fase 1 — Identitas kereta
- [x] Tambah `userData.part` tag pada part baru agar bisa diuji/dianimasikan.
- [x] Batang roda ×2 (classic & tank): box tipis di luar roda kiri/kanan, bob vertikal mengikuti putaran roda (`sin(elapsed·rate)`, fase berlawanan kiri/kanan); ref `this.rods` dari filter `makeLocoParts`.
- [x] Cowcatcher: box miring `rotation.x=0.8` di depan loko (posisi z per-bentuk: classic 1.55, diesel 1.65, tank 1.3).
- [x] Coupling: box penghubung loko↔gerbong pertama dan antar gerbong (jumlah = jumlah gerbong) di `makeWagonParts`.
- [x] Jendela kabin (classic & diesel): plane biru muda di muka depan kabin.
- [x] Dome uap (classic): sphere kecil di atas boiler.
- [x] `buildTrain` memakai `makeLocoParts('classic')` agar kereta default punya detail yang sama.
- [x] Test: `tests/trainSceneDetail.test.ts` — kehadiran rod/cowcatcher/dome/window/coupling per variant + rod beranimasi.

### Fase 2 — Karakter hidup
- [x] Kupu-kupu: 1 plane → grup (tubuh capsule + 2 sayap plane hinge di badan, flap `rotation.z` berlawanan); wander & heading lama dipertahankan.
- [x] Masinis: torso capsule, tangan kedua (mirror, statis), brim topi, 2 mata sphere kecil di muka depan kepala.
- [x] Penumpang: kepala sphere sebagai anak capsule (ikut animasi lompat) + 2 mata; wajah menghadap rel datang.
- [x] Test: kehadiran part baru via `userData.part` (driver-torso/driver-brim/driver-eye/driver-arm) + regresi lean dipilih per radius kepala (>= 0.25).

### Fase 3 — Vegetasi (selesai)
- [x] Pinus: 2 cone bertumpuk (instanced, +1 draw call).
- [x] Pohon bulat: kanopi 2 sphere (instanced, +1 draw call).
- [x] Variasi warna daun per-instance via `setColorAt` (+0 draw call).
- [x] Apel merah instanced di pohon bulat, 3 per pohon (+1 draw call).
- [x] Goyangan tajuk: pohon klasik sudah bergoyang sejak fase awal; kanopi instanced sengaja statis (hemat update loop).

### Fase 4 — Bangunan & stasiun (selesai)
- [x] Rumah: pintu (box), cerobong (cylinder), atap overhang (radius 1.6 → 1.7).
- [x] Jendela/penerangan bangunan: tetap memakai jendela emissive dusk yang ada; bingkai instanced dihentikan agar tidak dobel dengan jendela emissive.
- [x] Stasiun: kanopi (4 tiang + atap box), 2 bangku (dudukan + sandaran), jam bundar berjarum di sisi papan nama.

### Fase 5 — Bonus lingkungan (selesai)
- [x] Awan: klaster 3 sphere per awan (2 awan, +4 mesh).
- [x] Pagar: rel horizontal pengikat instanced 2 sisi × 2 tinggi (+1 instanced).
- [x] Sapi: tanduk + telinga kecil (+4 mesh, farmGroup K2).
- [x] Review akhir budget mesh/draw call + update komentar header (±125 mesh, ±16 instanced).

### Fase 6 — Articulasi gerbong (selesai, permintaan user)
- [x] Gerbong dipindah dari anak trainGroup menjadi unit pivot terpisah (anak scene): `buildWagonUnits(wagons)` menggantikan `makeWagonParts`; tiap unit berisi bodi + 2 roda sendiri + coupling belakang (kecuali gerbong terakhir).
- [x] Placement berbasis jarak tempuh gabungan (`placeUnitOnJourney(s)` + `placeAllUnits(locoS)`): loko di s, gerbong i di s−(2.0+i·1.9); s<0 diekstrapolasi lurus ke belakang titik awal; jalur = main lalu cabang terpilih (branch t=0 ≡ main t=1, kontinuitas terjaga).
- [x] Lean banking diterapkan per unit (rotateZ — aman dari cabang Euler x=−π).
- [x] Roda gerbong berputar via `unit.userData.wheels`.
- [x] Verifikasi visual: loko membelok ke cabang kiri sementara gerbong masih lurus di jalur utama — dua unit terlihat terpisah dengan sudut berbeda (screenshot).

## Risks

- Tambah mesh menaikkan draw call; target tetap ≤ ±105 — diukur ulang tiap fase (review browser bila perlu).
- Batang roda beranimasi harus sinkon dengan laju roda (`rate = rm ? 4 : 8`) agar tidak terlihat slip.
- Part baru masuk `locoParts`/`wagonParts` → ikut di-dispose saat ganti variant; jangan bagikan material/geometri antar part lama-baru (pola `makeLocoParts` atomic sudah menangani).
- Test pemilihan kepala masinis (SphereGeometry) bisa salah sasaran setelah ada dome/mata → selector diganti berdasar radius.
- Verifikasi visual manual perangkat nyata tetap terbuka (akumulasi dari Fase 5 lama).

## Progress Log

- 2026-10-07 14:25:00 — Plan dibuat; Fase 1 & 2 mulai diimplementasi.
- 2026-10-07 14:50:00 — Fase 1 & 2 SELESAI + diverifikasi: 410 test hijau (4 test baru `tests/trainSceneDetail.test.ts` + selector lean test diperbarui per radius), lint/build/format hijau, visual poke-frame browser (torso & detail masinis dari belakang, rel melengkung, papan mengikuti kurva, alur ronde normal sampai ronde 3). Commit `feat: detail visual kereta - batang roda, cowcatcher, kupu flapping, karakter` (v1.11.0).
- 2026-10-07 15:20:00 — Fase 3, 4, 5 SELESAI + diverifikasi: 410 test hijau, lint/build/format hijau, visual browser (pinus bertumpuk, kanopi cluster, pagar berpengikat, rumah berpintu + atap overhang, kanopi/bangku/jam stasiun, penumpang berkepala bermata, kereta tiba cabang kanan). Keputusan: jendela instanced berbingkai dihentikan (sudah ada jendela emissive dusk — hindari dobel); goyangan kanopi instanced sengaja statis. Commit `feat: detail lingkungan kereta - vegetasi, stasiun, awan, sapi` (v1.12.0). SEMUA FASE SELESAI.
- 2026-10-07 16:05:00 — Fase 6 (permintaan user): articulasi gerbong — gerbong jadi unit pivot terpisah dengan placement berbasis jarak tempuh (`placeUnitOnJourney`/`placeAllUnits`), lean banking per unit, roda gerbong berputar via `userData.wheels`, coupling dirombak per-unit. Diverifikasi visual: loko membelok duluan, gerbong menyusul di jalur utama dengan sudut berbeda. Commit `feat: articulasi gerbong - loko dan gerbong pivot terpisah saat belok` (v1.13.0).

## Notes

- Koridor visual tetap: geometri bawaan Three.js, tanpa shadow/shader/post-processing; tekstur canvas diperbolehkan (pola papan stasiun).
- Budget mesh setelah Fase 2: ±104 mesh + instanced, ±105 draw call (update komentar header `TrainScene.ts`).
- Konstanta animasi rod memakai `rate = rm ? 4 : 8` agar konsisten dengan laju roda di reduced-motion.
- Versi: setiap fase yang mengubah tampilan = bump minor (1.10.0 → 1.11.0 untuk Fase 1–2).
