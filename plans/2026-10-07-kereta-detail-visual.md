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

### Fase 3 — Vegetasi (belum dikerjakan)
- [ ] Pinus: 2 cone bertumpuk (instanced, +1 draw call).
- [ ] Pohon bulat: kanopi 2 sphere (instanced, +1 draw call).
- [ ] Variasi warna daun per-instance via `setColorAt` (+0 draw call).
- [ ] Apel merah instanced di pohon tema kebun (+1 draw call).
- [ ] Goyangan tajuk halus (rotasi kecil bergelombang, 0 mesh).

### Fase 4 — Bangunan & stasiun (belum dikerjakan)
- [ ] Rumah: pintu (box), cerobong (cylinder), atap overhang (ubah dimensi, 0 mesh).
- [ ] Jendela semua bangunan via 1 InstancedMesh berbingkai.
- [ ] Stasiun: kanopi (4 tiang + atap box), 2 bangku, jam bundar di papan.

### Fase 5 — Bonus lingkungan (belum dikerjakan)
- [ ] Awan: 2 sphere gepeng → klaster 3 sphere per awan (+4 mesh).
- [ ] Pagar: rel horizontal instanced menghubungkan tiang (+1 instanced).
- [ ] Sapi: tanduk + telinga kecil (+4 mesh).
- [ ] Review akhir budget mesh/draw call + update komentar header.

## Risks

- Tambah mesh menaikkan draw call; target tetap ≤ ±105 — diukur ulang tiap fase (review browser bila perlu).
- Batang roda beranimasi harus sinkon dengan laju roda (`rate = rm ? 4 : 8`) agar tidak terlihat slip.
- Part baru masuk `locoParts`/`wagonParts` → ikut di-dispose saat ganti variant; jangan bagikan material/geometri antar part lama-baru (pola `makeLocoParts` atomic sudah menangani).
- Test pemilihan kepala masinis (SphereGeometry) bisa salah sasaran setelah ada dome/mata → selector diganti berdasar radius.
- Verifikasi visual manual perangkat nyata tetap terbuka (akumulasi dari Fase 5 lama).

## Progress Log

- 2026-10-07 14:25:00 — Plan dibuat; Fase 1 & 2 mulai diimplementasi.
- 2026-10-07 14:50:00 — Fase 1 & 2 SELESAI + diverifikasi: 410 test hijau (4 test baru `tests/trainSceneDetail.test.ts` + selector lean test diperbarui per radius), lint/build/format hijau, visual poke-frame browser (torso & detail masinis dari belakang, rel melengkung, papan mengikuti kurva, alur ronde normal sampai ronde 3). Commit `feat: detail visual kereta - batang roda, cowcatcher, kupu flapping, karakter` (v1.11.0). Fase 3–5 menunggu tinjauan user.
- Fase 3–5: menunggu persetujuan/tinjauan user setelah Fase 1–2 dirilis.

## Notes

- Koridor visual tetap: geometri bawaan Three.js, tanpa shadow/shader/post-processing; tekstur canvas diperbolehkan (pola papan stasiun).
- Budget mesh setelah Fase 2: ±104 mesh + instanced, ±105 draw call (update komentar header `TrainScene.ts`).
- Konstanta animasi rod memakai `rate = rm ? 4 : 8` agar konsisten dengan laju roda di reduced-motion.
- Versi: setiap fase yang mengubah tampilan = bump minor (1.10.0 → 1.11.0 untuk Fase 1–2).
