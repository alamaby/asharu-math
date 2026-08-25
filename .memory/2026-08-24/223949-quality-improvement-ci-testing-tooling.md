# Quality Improvement: CI, Testing, Tooling

Date: 2026-08-24 22:39:49 (+0700) — selesai 23:01:59

## Task / Problem
Menutup celah kualitas hasil analisa repo: tidak ada CI, tidak ada lint/format, cakupan test hanya logika inti (88 test / 10 file). Eksekusi penuh plan `plans/2026-08-24-ci-testing-quality-improvement-plan.md`.

## Key Files Changed
- Tooling: `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `package.json` (script `lint`/`lint:fix`/`format`/`format:check`), `vite.config.ts` (`test.setupFiles`)
- Setup test: `tests/setup.ts` — shim localStorage in-memory (jsdom environment ini menyediakan localStorage tidak lengkap: tanpa `clear`)
- Test baru (54): `tests/scoring.test.ts`, `tests/achievements.test.ts`, `tests/NumericKeypad.test.tsx`, `tests/NavigationContext.test.tsx`, `tests/ProgressContext.test.tsx`, `tests/helpers/renderWithProviders.tsx`, `tests/screens/{Home,Settings,LevelSelect,Achievements,Result}Screen.test.tsx`
- CI: `.github/workflows/ci.yml` (push main + PR; matrix Node 20 & 22; format:check → lint → typecheck → test → build)
- Perbaikan kode: `src/components/achievement/ShareAchievement.tsx` — reset state gambar dipindah dari body efek ke handler klik (`react-hooks/set-state-in-effect`)
- Format menyeluruh oleh Prettier: mayoritas file src/ + tests/ lama tersentuh (diff besar tapi murni gaya)
- Dokumentasi: README.md (badge CI, baris tech stack "Kualitas", seksi "Kualitas Kode")

## Technical / Business Decisions
- ESLint flat config ESM; aturan `react-refresh/only-export-components` off (pola Context mengekspor provider + hook).
- Prettier: no semi, single quote, printWidth 100.
- Aturan `@typescript-eslint/consistent-type-imports` inline-style aktif.
- Smoke test layar dibungkus NavigationProvider + ProgressProvider dengan probe `data-testid="probe-screen"` untuk mengaudit navigasi dari luar layar.
- Cleanup RTL eksplisit per file test (mengikuti konvensi `verticalProblem.test.tsx`).

## Assumptions / Risks
- Diff besar akibat format awal Prettier — diterima sebagai bagian perbaikan kualitas; commit terpisah disarankan bila diminta commit.

## Blockers / Unresolved
- PWA/offline (`vite-plugin-pwa`) dan coverage report ditunda menunggu keputusan eksplisit.

## Verification Performed
- `npm run format:check` ✅ · `npm run lint` ✅ · `npm run typecheck` ✅ · `npm test` 142/142 ✅ · `npm run build` ✅
- Commit `f909662` sudah dipush ke `origin/main`.

## Commit Proposal
- `chore: tambah eslint/prettier, lengkapi unit & ui test hingga 142 kasus, dan ci github actions`
