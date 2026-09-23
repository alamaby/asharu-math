# Buka Semua Level + Visual Bintang Per Level

Date: 2026-09-23 12:52:00

## Ringkasan

Membuka semua level agar anak bisa memilih mana saja, menghapus gating berurutan (`requires` + veteran bypass). Menambahkan visual 3 status per kartu level: belum dicoba (violet), 1–2 bintang (sky/white), sempurna 3 bintang (amber emas).

## File Diubah

- `src/data/levels.ts` — hapus `LEGACY_LEVEL_IDS`, `K1_IDS`; sederhanakan `isLevelUnlocked` jadi check keberadaan id.
- `src/types/index.ts:210` — update komentar field `requires`.
- `src/i18n/dicts/id.ts` — ubah `levels.bubble`, `learn.exitDesc`; hapus `levelCard.lockedHint`; tambah `levelCard.neverTried`, `levelCard.perfect`.
- `src/i18n/dicts/en.ts` — sinkron ID+EN.
- `src/components/LevelCard.tsx` — `StarRow` suport `large`; 3 cabang visual (perfect/untried/else); hapus `🔒` dan branch `unlocked`.
- `src/screens/ResultScreen.tsx` — `nextLevelAvailable` hanya cek `summary.nextLevelId !== null`; hapus import `isLevelUnlocked`.
- `tests/levels.test.ts` — ganti 7 kasus lama jadi 3 kasus baru.
- `tests/screens/LevelSelectScreen.test.tsx` — tambah 2 test (buka kunci + status chip).
- `tests/screens/ResultScreen.test.tsx` — update asersi next button selalu tampil + tambah test story fresh.
- `package.json` — bump 1.4.2 → 1.5.0.

## Keputusan Teknis

- `requires` tetap di data sebagai metadata urutan untuk `getNextLevelId`; tidak dihapus nilainya.
- `unlocked` prop di `LevelCardProps` dipertahankan (signature tidak berubah) tapi di-prefix `_` di destructuring agar tidak warning TS unused.
- `levelCard.notFinished` dipertahankan sebagai dead key (aman untuk snapshot teks) — penghapusan total ditunda milestone berikutnya.

## Verifikasi

- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run format:check` ✅
- Targeted tests (levels, i18n, LevelSelectScreen, ResultScreen): 24/24 ✅
- Full suite: 333/334 ✅ — 1 kegagalan diizinkan: `PracticeScreenStory.test.tsx` (flake pre-existing, tidak disentuh sesuai plan)

## Catatan Plan

Plan file: `plans/2026-09-23-buka-semua-level-dan-visual-bintang.md`
