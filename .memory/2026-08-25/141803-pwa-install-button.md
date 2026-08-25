# PWA Install Button

Date: 2026-08-25 14:18:03 (+0700)

## Task / Problem
Menambah kemampuan pasang aplikasi dari browser smartphone (pertanyaan user: "apakah bisa ditambahkan tombol install"). Analisa: sangat layak — aplikasi full client-side, HTTPS sudah ada di Vercel; yang kurang hanya manifest, service worker, ikon PWA, dan UI.

## Key Files Changed
- `vite.config.ts` — plugin `VitePWA`: registerType autoUpdate, manifest lengkap (id '/', lang id, standalone, portrait, theme #0ea5e9, bg #f0f9ff, 3 ikon), workbox cleanupOutdatedCaches + navigateFallback.
- `public/icons/pwa-{192,512,maskable-512}.png` — hasil generate (dimensi diverifikasi).
- `scripts/generate-icons.mjs` (+ script npm `icons`, devDep `sharp`) — render favicon.svg; maskable = kanvas sky + karya diskalakan 80%.
- `src/hooks/useInstallPrompt.ts` — tangkap beforeinstallprompt/appinstalled, deteksi standalone (matchMedia + navigator.standalone), deteksi iOS, dismiss petunjuk persist.
- `src/components/common/InstallButton.tsx` — tombol violet "📲 Pasang Aplikasi" / banner petunjuk iOS dismissible / null bila sudah terpasang.
- `src/screens/HomeScreen.tsx` — InstallButton di section tindakan utama.
- `tests/setup.ts` — stub window.matchMedia untuk jsdom.
- `tests/useInstallPrompt.test.tsx` — 9 kasus (state awal, event prompt/installed, install() accepted/null, tombol muncul/memicu dialog/hilang, iOS hint dismiss).
- README: seksi "📲 Pasang di Smartphone" + baris tech stack PWA.

## Technical / Business Decisions
- Auto-update senyap (tanpa toast) sesuai keputusan user — cocok untuk aplikasi anak.
- iOS: tidak ada API programatik → UI petunjuk A2HS, dismiss tersimpan localStorage (`asharu-math:ios-install-hint-dismissed`).
- Ikon digenerate dari favicon.svg agar brand konsisten dan reproducible via `npm run icons`.

## Assumptions / Risks
- Chrome butuh SW fetch handler + ikon valid agar prompt muncul — terverifikasi lewat artefak build (precache 11 entri ~264 KiB) dan dimensi PNG = deklarasi manifest.
- Uji manual perangkat nyata belum bisa dilakukan di lingkungan ini (checklist ada di plan).

## Blockers / Unresolved
- Belum di-commit (menunggu instruksi user).

## Verification Performed
- format ✅ · lint ✅ · typecheck ✅ · **161/161 test (22 file)** ✅ · build ✅
- dist/: manifest.webmanifest terinjeksi index.html, sw.js, workbox, registerSW.js, icons/ ✓

## Commit Proposal
- `feat: pwa installable dengan tombol pasang aplikasi, offline support, dan petunjuk ios`
