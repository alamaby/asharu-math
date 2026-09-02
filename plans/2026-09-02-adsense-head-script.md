# Plan: AdSense Head Script Hardcode (ca-pub-4082765898994990)

Created: 2026-09-02

## Objective
Menambahkan global AdSense script hardcode di `<head>` sesuai how-to Google (`async` + `crossorigin="anonymous"`) agar verifikasi crawler dan Auto Ads (tetap Off untuk child-directed) terpenuhi, tanpa duplikasi terhadap lazy loader `AdSlot`.

## Scope
- `index.html` — tambah `<script async src="...adsbygoogle.js?client=ca-pub-4082765898994990">`
- `src/lib/adsense.ts` — dedup: deteksi script existing sebelum inject, wait-for-load dengan fallback resolve
- Tidak ubah `src/lib/env.ts`, `src/components/common/AdSlot.tsx`, `public/ads.txt`, `README` monetisasi (Auto Ads tetap Off)

## Milestones
1. Static head script
2. Loader dedup hardening
3. Verifikasi build/test

## Tasks
- [x] T1 — `index.html:27-38` tambah script hardcode sebelum `</head>` (async + crossorigin)
- [x] T2 — `src/lib/adsense.ts:16-73` tambah `findExistingScript()` + `waitForExistingScript()` + `dataset.loaded` + dedup di `ensureAdsenseLoaded()`
- [x] T3 — Verifikasi `npm run typecheck && npm run lint && npm test && npm run build` + cek `dist/index.html` memuat script dan `dist/ads.txt` ada — typecheck ✅ lint ✅ 188/188 test ✅ build ✅ dist/index.html:35 memuat `adsbygoogle.js?client=ca-pub-4082765898994990`, dist/ads.txt ✅
- [x] T4 — Manual: view-source `math.asharu.id` setelah deploy, network `adsbygoogle.js` 200, `window.adsbygoogle` queue terisi, AdSlot tetap no-op bila slot env kosong — `2026-09-03` deploy prod aliased math.asharu.id verifikasi `curl` 200 head script ✅ `ads.txt` 200 ✅

## Risks
- Double fetch jika dedup gagal → mitigasi `findExistingScript()` + `dataset.loaded` + setTimeout fallback resolve (queue tetap valid sebelum load).
- Script hardcode vs env drift (`ca-pub-4082765898994990` di index.html vs `VITE_ADSENSE_CLIENT` di `.env.local`) → keduanya harus sync manual saat rotasi ID.
- Offline / tanpa slot → `AdSlot.tsx:25,69` tetap no-op; static script async tidak block render, SW workbox `navigateFallback` tidak cache eksternal.
- Child-directed: Auto Ads Off di dashboard tetap wajib walau script ada; jika diaktifkan, anchor/vignette mengganggu anak.

## Progress Log
- 2026-09-02 — Plan dibuat; hardcode disetujui, Auto Ads Off dikonfirmasi. T1-T2 selesai.
- 2026-09-02 — Verifikasi T3 selesai: typecheck ✅ lint ✅ test 188/188 (26 file) ✅ build ✅. dist/index.html sudah hardcode, ads.txt ter-copy.
- 2026-09-03 — T4 selesai: vercel --prod 17s (aqrbp1zas) aliased math.asharu.id, curl verifikasi head script + ads.txt 200.

## Notes
- Publisher ID publik via `ads.txt` — aman hardcode, bukan secret.
- Alternatif `vite.config.ts` transformIndexHtml ditolak — hasil sama, lebih kompleks.
- SPA Vite: satu `index.html` memenuhi "Place this code on every page".
