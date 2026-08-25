# Bilingual ID/EN

Date: 2026-08-25 19:01:13 (+0700) — selesai 19:46:54

## Task / Problem
Menambah dukungan dua bahasa: Indonesia (default) dan Inggris, switch instan seluruh UI dari Pengaturan. Plan: `plans/2026-08-25-bilingual-id-en.md`.

## Key Files Changed
- Infra: `src/i18n/{types.ts, core.ts, LanguageContext.tsx, steps.ts}`, `src/i18n/dicts/{id.ts,en.ts}` (±200 key; interpolasi via fungsi bertipe; en `satisfies`-style typed = typeof id).
- State: `types/index.ts` (UserProgress.language opsional; LearningStep terstruktur tanpa instruction; LevelDefinition/AchievementDefinition pakai LocalizedText), `lib/storage.ts` (normalisasi language), `state/ProgressContext.tsx` (setPreferences +language).
- Migrasi penuh ke t(): HomeScreen, SettingsScreen (+toggle bahasa), PracticeScreen, LearnScreen, ResultScreen, LevelSelectScreen, AchievementsScreen, ChildNameForm, InstallButton, NumericKeypad, StepGuide, LevelCard, AchievementCard, ShareAchievement, AppHeader, BottomNavigation.
- Lib: `learningSteps.ts` (builder data murni, result number), `validation.ts` (getHint menerima t), `problemGenerator.ts`, `achievements.ts` (LocalizedText + share template dict), `shareImage.ts` (labels/locale param).
- Tests: `tests/i18n.test.tsx` baru (6 kasus: key-set en≡id, tipe entry konsisten, createT id/en, stepInstruction bilingual, switch instan + html.lang + persist localStorage); update learningSteps/validation/achievements/LearnScreen/NumericKeypad/screens tests.
- README: seksi "🌐 Dua Bahasa".

## Technical / Business Decisions
- Custom t() ringan tanpa dependensi; rest-tuple typing `t(key, ...params?)` memberi type-safety key & parameter tanpa overload eksplisit.
- Dua mekanisme terdokumentasi: dict untuk UI chrome; LocalizedText pairs untuk data domain (level/achievement).
- LearningStep kini data murni — instruksi diterjemahkan render-time (`stepInstruction`) sehingga ganti bahasa instan termasuk sesi berjalan. borrow-explain menyimpan top/bottom; answer-digit punya konteks `sub` (afterBorrow/chainMid/plain).
- Hint latihan bersifat transient → diterjemahkan saat event dengan t bahasa aktif.

## Assumptions / Risks
- SessionSummary.title tetap string dibuat saat mulai sesi (batas dokumentasi: judul hasil tidak ikut berubah jika bahasa diganti setelah sesi dimulai).

## Blockers / Unresolved
- Tidak ada. Commit `e27cfd4` sudah dipush ke origin/main.

## Verification Performed
- format ✅ · lint ✅ · typecheck ✅ · **167/167 test (23 file)** ✅ · build ✅

## Commit Proposal
- `feat: dukungan dua bahasa indonesia-inggris dengan switch instan`
