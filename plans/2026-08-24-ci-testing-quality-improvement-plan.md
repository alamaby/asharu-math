# Plan Peningkatan Kualitas: CI, Testing, dan Tooling Asharu Math

Created: 2026-08-24 22:38:00

## Objective
Menutup celah kualitas yang teridentifikasi pada analisa repo: menambahkan CI GitHub Actions, melengkapi unit test dan UI/component test, serta menambahkan ESLint + Prettier agar kualitas kode terjaga otomatis di setiap push/PR.

## Scope
- ESLint 9 (flat config) + Prettier dengan script `lint` / `format`
- Unit test untuk modul `lib` yang belum teruji (`scoring.ts`, `achievements.ts`)
- UI/component test: `NumericKeypad`, `ProgressContext`, `NavigationContext`
- Smoke test layar: Home, Settings, LevelSelect, Achievements, Result
- Workflow CI GitHub Actions (lint + typecheck + test + build)
- Update README (badge CI + dokumentasi script baru)

## Milestones
1. Phase 1 — Tooling kualitas (ESLint + Prettier)
2. Phase 2 — Unit test gap (`lib`)
3. Phase 3 — Component & context test
4. Phase 4 — Screen smoke test
5. Phase 5 — CI GitHub Actions
6. Phase 6 — Verifikasi penuh + dokumentasi

## Tasks

### Phase 1 — Tooling Kualitas
- [x] Install devDependencies: `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `prettier`, `eslint-config-prettier`
- [x] Buat `eslint.config.js` (flat config ESM): js recommended + ts recommended + react-hooks + browser globals, ignore `dist/`
- [x] Buat `.prettierrc.json` (no semi, single quote, trailing comma all, printWidth 100) dan `.prettierignore`
- [x] Tambah script `lint`, `lint:fix`, `format`, `format:check` di package.json
- [x] Jalankan lint + format seluruh repo, perbaiki semua pelanggaran (1 error `react-hooks/set-state-in-effect` di ShareAchievement diperbaiki dengan memindahkan reset state ke handler klik)

### Phase 2 — Unit Test Gap
- [x] `tests/scoring.test.ts`: batas rasio bintang (0.9 → 3, 0.65 → 2, <0.65 → 1, total ≤ 0 → 0)
- [x] `tests/achievements.test.ts`: id unik, `getAchievement`, `statsFromProgress`, `evaluateNewAchievements` (baru saja + tidak duplikat yang sudah terbuka), `achievementShareText` dengan/tanpa nama anak

### Phase 3 — Component & Context Test
- [x] `tests/NumericKeypad.test.tsx`: tombol 0–9 lengkap + ARIA label, callback digit/backspace/check terpanggil, state disabled, label custom tombol periksa
- [x] `tests/NavigationContext.test.tsx`: navigate mendorong stack, `back` menurunkan stack & `canBack`, `goToTab` mereset stack ke [home, tab], error di luar provider
- [x] `tests/ProgressContext.test.tsx`: `recordAnswer` (statistik/streak/achievement baru), `completeLevel` (level unik + skor terbaik + unlock bintang-2-digit), `setChildName` (trim + 20 karakter), persistensi localStorage, `resetProgress`
- [x] Tambahan: `tests/setup.ts` — shim localStorage in-memory untuk jsdom yang tidak lengkap; didaftarkan via `test.setupFiles` di vite.config.ts

### Phase 4 — Screen Smoke Test
- [x] `tests/screens/HomeScreen.test.tsx`: form nama saat kosong, kartu ringkasan, tombol lanjutkan nonaktif, navigasi tab & settings
- [x] `tests/screens/SettingsScreen.test.tsx`, `LevelSelectScreen.test.tsx`, `AchievementsScreen.test.tsx`, `ResultScreen.test.tsx`: render + elemen kunci + interaksi ringan

### Phase 5 — CI GitHub Actions
- [x] `.github/workflows/ci.yml`: trigger push `main` + semua PR; matrix Node 20 & 22; `format:check → lint → typecheck → test → build`
- [x] Badge CI di README + tabel script diperbarui

### Phase 6 — Verifikasi & Dokumentasi
- [x] `npm run lint` bersih
- [x] `npm run typecheck` bersih
- [x] `npm test` lulus semua — **142 test / 20 file** (naik dari 88 test / 10 file)
- [x] `npm run format:check` bersih
- [x] `npm run build` sukses (dist ~232 kB JS gzip ~70 kB)
- [x] Update `.memory/`

## Risks
- Menjalankan Prettier atas seluruh repo menghasilkan diff besar; mitigasi: satu commit khusus format jika diminta commit.
- Rule `react-refresh/only-export-components` konflik dengan pola Context (file mengekspor provider + hook); mitigasi: aturan dinonaktifkan.
- Smoke test layar bergantung bentuk data `levels.ts`; jika berubah, test ikut disesuaikan.

## Out of Scope / Pending Decision
- **PWA/offline support** (`vite-plugin-pwa`) — menambah dependency runtime baru; ditunda sampai ada keputusan eksplisit.
- Coverage report (`@vitest/coverage-v8`) — opsional, bisa menyusul.

## Progress Log
- 2026-08-24 22:36:00 — Review awal: working tree masih bersih di commit `9635fc4`, belum ada implementasi/plan/memory sebelumnya; plan ini dibuat sebagai basis eksekusi.
- 2026-08-24 23:02:00 — Seluruh fase selesai. ESLint 9 + Prettier terpasang (1 pelanggaran `react-hooks/set-state-in-effect` diperbaiki di ShareAchievement); 54 test baru (total 142/20 file, semuanya lulus); shim localStorage ditambahkan karena jsdom environment tidak lengkap; CI workflow Node 20/22 dibuat; README diperbarui dengan badge + seksi kualitas kode; verifikasi penuh lulus (format/lint/typecheck/test/build). Belum di-commit — menunggu instruksi.

## Notes
- Pola test komponen mengikuti `tests/verticalProblem.test.tsx` (testing-library + `data-testid`, cleanup per test).
- Semua layar memakai `useNavigation()` + `useProgress()` sehingga smoke test wajib dibungkus `NavigationProvider` + `ProgressProvider`.
- `sound.ts` aman di jsdom (tanpa `AudioContext` → no-op), tidak perlu mock.
