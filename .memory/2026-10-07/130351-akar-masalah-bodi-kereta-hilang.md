# 2026-10-07 — Akar Masalah Bodi Kereta Hilang Saat Belok (Fix Diterapkan v1.9.2)

Waktu: 2026-10-07 13:03:51 (fix diterapkan ±13:25)
Lanjutan investigasi bug 1 dari `2026-09-26/095500-bugfix-kereta-mute-jawaban-ganda.md` (badan kereta hilang saat maneuver, roda terlihat — laporan produksi). Sesi ini **mereproduksi, mengukur akar masalah, dan memperbaikinya** (v1.9.2).

## Task / Masalah

Bodi kereta (loko, kabin, cerobong, gerbong) tidak dirender saat perjalanan cabang/belok setelah user menjawab benar; hanya ujung roda tampak. Tidak ada error console, tidak ada disposal, scene graph utuh.

## Akar Masalah (terbukti empiris langkah demi langkah)

1. Model kereta berdepan **+Z lokal**; arah jalan track utama adalah **−Z**, jadi heading normal = quaternion **yaw-180°** `(0,1,0,0)` — secara visual BENAR (kereta menghadap maju).
2. Three.js menyimpan quaternion yaw≈180° itu sebagai **Euler XYZ di cabang x=−π** (ekstraksi `atan2` memakai branch itu untuk |yaw| > 90°). Euler `rotation.x ≈ −3.1416` terbaca live.
3. Kode **lean Fase 5** di `TrainScene.update()` cabang `phase === 'branch'`:
   ```ts
   this.trainGroup.rotation.z = (this.selected - 1) * 0.08 * (1 - this.t / 0.3)
   ```
   Menulis SATU komponen Euler memicu `quaternion.setFromEuler(eulerPenuh)` — rekomposisi lewat cabang **x=−π** menghasilkan rotasi **terjungkir (pitch 180°)**: quaternion `(−0.98, 0, 0.20, 0)`.
4. Urutan update per frame di cabang: `placeTrainOnCurve` (lookAt → tegak) **lalu** lean (rekomposisi euler → terjungkir) — lean "menang" setiap frame → kereta terjungkir sepanjang perjalanan cabang (lean aktif sampai t=0.3, dan euler x=−π tetap basi hingga re-sync). Di track utama tidak ada tulisan euler → tidak terlihat.
5. Terjungkir = bagian ber-y lokal positif (bodi 0.7, kabin 1.4, cerobong 1.35, masinis 1.95, gerbong) jatuh **di bawah y=0 dunia** (kepala masinis terukur world y = −1.83) → **terkubur di bawah ground plane**; roda (r=0.28, pusat 0.28) ujungnya persis menyembul → cocok persis dengan laporan "badan hilang, roda terlihat".

## Bukti (browser live, dev server lokal, v1.9.1)

- Repro visual: 4 screenshot — bodi utuh di junction → hilang total ±500 ms setelah jawab benar → hanya roda sepanjang perjalanan cabang. `window.__errs` kosong, `disposeLog` kosong (patch `Material/BufferGeometry.dispose`).
- Dump scene live saat hilang: trainGroup 14 anak lengkap (bodi/kabin/cerobong/gerbong/roda), semua `visible=true`, opacity 1, tanpa NaN, tanpa dispose — HANYA orientasi yang salah.
- Trace `Object3D.lookAt` per frame: target selalu benar (mis. `(0, 0.1, −1)` dari pos `(0, 0.1, 0)`) dan quaternion pasca-lookAt selalu tegak `(0, 0.98, 0, −0.201)`; eulerX tetap −3.14 (representasi cabang −π dari yaw>90°).
- Sampling ulang `CatmullRomCurve3` (utama & cabang): tangen tidak pernah terbalik — kurva BUKAN penyebab.
- A/B simulasi in-page pada trainGroup live: pola sekarang (`rotation.z = -0.08` setelah lookAt) → kepala world y **−1.844** (terkubur); `rotateZ(-0.08)` setelah lookAt → **+2.044** (tegak).

## Catatan teknis investigasi

- `WebGLRenderer.prototype.render` TIDAK bisa dipatch (three r160 memasang `render` sebagai closure properti instance); gunakan `Object3D.prototype.lookAt` untuk intersepsi.
- rAF tab browser otomasi ter-throttle walau `visibilityState==='visible'` (window ter-oklusi) → loop render mati; solusi: shim `requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 16)` lalu remount TrainCanvas agar loop baru lahir lewat shim.
- Sesi investigasi sebelumnya gagal menemukan karena tes headless hanya memeriksa children count + posisi GROUP, bukan **world position tiap part setelah lean**.

## Rekomendasi perbaikan (DITERAPKAN di sesi ini)

Ganti tulisan Euler lean dengan rotasi quaternion langsung di `TrainScene.update()`:

```ts
// setelah placeTrainOnCurve(branchCurves[selected], this.t)
const lean = this.t < 0.3 ? (this.selected - 1) * 0.08 * (1 - this.t / 0.3) : 0
this.trainGroup.rotateZ(lean) // placeTrainOnCurve tiap frame sudah reset via lookAt, tak menumpuk
```

Hapus blok `if (this.t < 0.3) { rotation.z = ... } else if (rotation.z !== 0) { rotation.z = 0 }` dan `trainGroup.rotation.z = 0` di `reset()` (tidak lagi diperlukan; lookAt tiap frame sudah menegakkan).

## File yang diubah

- `src/components/train/TrainScene.ts` — lean cabang kini `trainGroup.rotateZ(...)` (komentar menjelaskan konstrain cabang Euler x=−π); `reset()` tidak lagi menulis `rotation.z`.
- `tests/trainSceneLean.test.ts` (baru, 3 test) — TrainScene asli headless via partial-mock `three` (stub `WebGLRenderer` saja); pump 600 frame `update(1/60)` pasca `setBranch(0/1/2)` dan asersi world-y kepala masinis > 0 sepanjang perjalanan. **Diverifikasi menangkap bug: dengan kode lama gagal 3/3 (`expected -1.87 to be greater than 0`), dengan fix lulus 3/3.**
- `package.json` — versi `1.9.1` → `1.9.2` (fix = patch).

## File terkait (tanpa perubahan kode di sesi ini)

- `src/components/train/TrainScene.ts` (update() lean, reset(), placeTrainOnCurve)
- `src/components/train/TrainCanvas.tsx` (rAF loop — terkait throttle saat pengujian)

## Asumsi / Risiko

- Bug ada sejak Fase 5 (`cf3d7a6`) dan masih ada di `be24bb4`/v1.9.1 — produksi butuh deploy setelah commit ini.
- `rotateZ` memutar pada sumbu lokal-z kereta (mengikuti heading) — secara visual lebih tepat untuk belokan; belum diverifikasi visual penuh di perangkat nyata (3 kelas, reduced-motion) — lanjutkan review manual.

## Verifikasi

- `npm test`: 58 file / 406 test hijau (403 lama + 3 regresi baru).
- `npm run lint` hijau; `npm run build` (termasuk `tsc --noEmit`) sukses, three tetap chunk terpisah; `npm run format:check` hijau.
- Test regresi dibuktikan gagal pada kode lama via `git stash` (3/3 fail, kepala masinis world y = −1.87) — bukan test yang selalu hijau.

## Bloker / Tindak lanjut

- Verifikasi versi produksi th.asharu.id tidak bisa dilakukan dari sandbox (DNS gagal); pastikan deploy terbaru setelah push.
- Verifikasi visual perangkat nyata: belok 3 cabang × 3 kelas, reduced-motion, drag kamera saat belok.

## Commit proposal (diajukan)

`fix: cegah kereta terjungkir saat lean belok dengan rotasi quaternion`
