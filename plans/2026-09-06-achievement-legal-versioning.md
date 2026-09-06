# Achievement, Legal & Semantic Versioning

Created: 2026-09-06 19:05:00

## Objective
Menjawab apakah achievement/privacy/terms perlu di-update pasca M1-M3 Kelas 1, lalu mulai semantic versioning yang di-bump tiap commit dan ditampilkan di aplikasi.

## Scope
- In: audit `achievements.ts` vs 7 K1, `legal.ts` vs localStorage; bump `package.json`; instruksi agen; tampilkan versi di Settings + Home footer; sinkron `vite.config.ts`.
- Out: menambah topik konsep baru di luar membilang/banding/nilai-tempat; mengubah ID level lama; migrasi storage major.

## Milestones
1. Audit achievement & legal: putusan tidak wajib, opsi date bump.
2. Versioning: bump + instruksi agen.
3. UI version: footer + Settings + header.

## Tasks
- [x] Achievement: verifikasi `bintang-kelas-1` mencakup 7 ID `k1-*` + sudah sync storage; putuskan tidak menambah achievement konsep baru.
- [x] Legal: jika tanpa perubahan material, opsi bump `UPDATED_ID/EN` ke tanggal M3; tambah catatan `README.md`.
- [x] Versioning bump: `package.json` 1.0.0 → 1.1.0; definisikan export versi untuk UI.
- [x] Instruksi agen: tambah `## Web Versioning` di `AGENTS.md`/`.memory/README.md` — feat→minor, fix→patch, breaking→major; wajib bump sebelum commit.
- [x] UI: tampilkan `v1.1.0` di `HomeScreen` footer + `SettingsScreen` + opsional `AppHeader`.
- [x] Verifikasi: `npm run format:check → lint → typecheck → test → build` + commit + push.

## Risks
- Bump manual lupa → tambah cek CI versi.
- Footer clutter → kecil `text-[0.6rem]`.
- Legal date bump tanpa material membingungkan.

## Progress Log
- 2026-09-06 19:05:00 — Draft plan.
- 2026-09-06 21:30:00 — Audit: achievements `bintang-kelas-1` sudah 7/7 sinkron `K1_IDS`; legal `localStorage`-only + TFAT child tetap valid tanpa bump material. Bump `1.0.0→1.1.0`, `APP_VERSION` tampil di Home footer (`home.footerRights · v1.1.0`) & Settings (`settings.version`). `typecheck`/`lint`/`test` 209/209/`build` OK.

## Notes
- Achievement sudah 10; privacy tetap lokal, TFAT child.
