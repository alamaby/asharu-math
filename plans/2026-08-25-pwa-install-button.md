# Plan: Tombol Install PWA untuk Smartphone

Created: 2026-08-25 12:30:00

## Objective
Aplikasi dapat dipasang dari browser smartphone (Android/iOS) via tombol "📲 Pasang Aplikasi", berjalan offline, dan auto-update senyap.

## Root Analysis
- Android/Chrome butuh: manifest + service worker + HTTPS → `beforeinstallprompt` → tombol custom `prompt()`.
- iOS Safari tidak punya API programatik → UI berupa petunjuk A2HS (Add to Home Screen).
- HTTPS sudah terpenuhi (Vercel); belum ada manifest, SW, ikon 192/512/maskable, dan UI.

## Keputusan Desain (user)
- Tombol utama di HomeScreen.
- Pembaruan: auto-update senyap (`registerType: 'autoUpdate'`).
- Ikon digenerate dari `favicon.svg` bintang via `sharp`.

## Milestones & Tasks

### Phase 1 — Foundation PWA
- [x] Install `vite-plugin-pwa`
- [x] Konfigurasi `vite.config.ts`: autoUpdate, cleanupOutdatedCaches, navigateFallback
- [x] Manifest lengkap (id, lang id, standalone, theme sky, icons)

### Phase 2 — Ikon PWA
- [x] `scripts/generate-icons.mjs` dengan `sharp` → pwa-192/pwa-512/pwa-maskable-512
- [x] Jalankan sekali & commit PNG hasil (dimensi terverifikasi via sharp metadata)

### Phase 3 — Hook & UI
- [x] `src/hooks/useInstallPrompt.ts`
- [x] `src/components/common/InstallButton.tsx` (+ petunjuk iOS dismissible)
- [x] Integrasi di HomeScreen

### Phase 4 — Tests
- [x] Stub matchMedia di tests/setup.ts
- [x] tests/useInstallPrompt.test.tsx — 9 kasus lulus

### Phase 5 — Verifikasi & dokumentasi
- [x] format/lint/typecheck/test/build lulus — **161 test / 22 file**
- [x] Artefak dist terverifikasi: manifest.webmanifest (injeksi index.html), sw.js, workbox, registerSW.js, icons/, precache 11 entri (~264 KiB)
- [x] README seksi "📲 Pasang di Smartphone" + baris tech stack
- [ ] Commit & push (menunggu instruksi)
- [ ] Uji manual perangkat nyata (Android Chrome dialog; iOS A2HS; reload offline)

## Risks
- Chrome menolak prompt bila ikon manifest invalid → mitgasi terlaksana: dimensi PNG diverifikasi = deklarasi.
- Cache basi → autoUpdate + cleanupOutdatedCaches.
- iOS tanpa prompt programatik → UI petunjuk (terimplementasi).
- sharp dev-dep berat; hanya untuk generate sekali-jalur.

## Progress Log
- 2026-08-25 12:30:00 — Plan dibuat setelah analisa kelayakan dan keputusan user.
- 2026-08-25 14:30:00 — Seluruh fase implementasi selesai. Catatan: dispatchEvent di test wajib dibungkus act() agar setState listener ter-flush; ESLint perlu globals.node untuk scripts/*.mjs.

## Risks
- Chrome menolak prompt bila ikon manifest invalid → verifikasi dimensi aktual = deklarasi.
- Cache basi → autoUpdate + cleanupOutdatedCaches.
- iOS tanpa prompt programatik → UI petunjuk.
- sharp dev-dep berat; hanya untuk generate sekali-jalur.

## Progress Log
- 2026-08-25 12:30:00 — Plan dibuat setelah analisa kelayakan dan keputusan user.

## Notes
- Out of scope: toast update, push notification, packaging TWA/Play Store.
