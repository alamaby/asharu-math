# Plan: AdSense TFAT Child + Slot Produksi

Created: 2026-09-03

## Objective
Sinkron 4 slot produksi (`9803844531/9602815350/8289733684/3182595864`) dan migrasi kepatuhan Families AdSense dari TFUA/TFCD deprecated ke TFAT=1 child hardcode di setiap permintaan iklan.

## Scope
- `src/components/common/AdSlot.tsx` — `data-tag-for-age-treatment="1"` hardcode
- `README.md` — TFUA → TFAT=1 + link 3248194/9007197 + tabel slot produksi
- `src/content/legal.ts` — privat/terms ID+EN TFAT wording + bump UPDATED 28 September 2026
- Env Vercel — `VITE_ADSENSE_*` produksi

## Tasks
- [x] T1 — Env: `.env.local` sudah 9803844531/9602815350/8289733684/3182595864; Vercel env perlu set yang sama
- [x] T2 — `AdSlot.tsx:11-16,84` tambah `data-tag-for-age-treatment="1"` (hardcode, TFUA/TFCD deprecated → TFAT)
- [x] T3 — `README.md:132-167` update TFAT=1 Child, site-level vs ad-request precedence, tabel slot + nilai produksi
- [x] T4 — `legal.ts:21-22,34,47,89,102,166,225` update 6 paragraf ID/EN TFAT + bump tanggal
- [x] T5 — Verifikasi `typecheck && lint && test && build` + `dist` cek `tag-for-age-treatment` — typecheck ✅ lint ✅ 188/188 test ✅ build ✅ `dist/assets` `data-tag-for-age-treatment="1"` 1 hit + head script ✅
- [ ] T6 — Manual QA 4 halaman + Learn/Practice bebas iklan + deploy `vercel --prod` + Ads dashboard Active

## Risks
- TFAT=0/unspecified akan aktifkan personalized — jangan.
- Satu script global `index.html:33-37` cukup; snippet console duplikat `script async` tidak perlu.
- Site-level TFAT di Search Console opsional — ad-request TFAT=1 precedence.

## Progress Log
- 2026-09-03 — Plan dibuat setelah TFUA deprecated notice + slot produksi dari console. T1-T4 selesai.
- 2026-09-03 — Hardcode disetujui, `AdSlot.tsx:84` `data-tag-for-age-treatment="1"` + fix test env leak `AdSlot.test.tsx` & `AdSlotOffline.test.tsx` agar tidak bocor slot produksi.
- 2026-09-03 — T5 selesai: typecheck ✅ lint ✅ 188/188 ✅ build ✅ `dist/assets/index-C65B4-Es.js` hit `tag-for-age-treatment`.
- 2026-09-03 — Sisa T6 deploy manual + QA 4 halaman.

## Notes
- Hardcode TFAT=1 dipilih karena situs 100% anak (6-8 th). Jika perlu teen/adult segmen, baru pertimbangkan env toggle.
