# Plan: Dukungan Dua Bahasa (Indonesia Default + English)

Created: 2026-08-25 15:00:00

## Objective
Seluruh antarmuka (termasuk instruksi langkah belajar, data level/pencapaian, dan kartu bagikan) tersedia dalam Bahasa Indonesia (default) dan Bahasa Inggris; pengguna dapat mengganti bahasa kapan pun dari Pengaturan dan perubahan berlaku instan.

## Keputusan Desain (user)
- Pendekatan: custom `t()` ringan tanpa dependensi baru — kamus TS bertipe.
- Switch bahasa: **instan seluruh UI** (render-time translation; `LearningStep` diubah jadi data terstruktur).
- Bahasa awal: **selalu Indonesia**; preferensi tersimpan di `UserProgress`.

## Arsitektur
```
src/i18n/
  types.ts            → Language = 'id'|'en'
  dicts/id.ts         → sumber kebenaran (string + fungsi berparameter bertipe)
  dicts/en.ts         → satisfies Dict (= typeof id) → wajib lengkap
  LanguageContext.tsx → Provider + useI18n() { lang, t, setLanguage }
```
- Interpolasi via fungsi bertipe (`(p: {name}) => string`) — tanpa parser placeholder.
- `language` disimpan di `UserProgress` (opsional default 'id', pola normalisasi childName); LanguageProvider dalam ProgressProvider; setLanguage → setPreferences({language}).
- Effect sinkron `<html lang>` + document.title.

## Milestones & Tasks

### Phase 1 — Infrastruktur
- [x] Skeleton src/i18n + UserProgress.language + validasi storage + setPreferences
- [x] Toggle bahasa di SettingsScreen

### Phase 2 — Migrasi UI murni
- [x] 7 screens + ~20 components ke t()

### Phase 3 — Render-time translation
- [x] LearningStep.instruction → field terstruktur; stepInstruction(step,t)
- [x] validation.ts hint → key via t; PLACE_LABELS ke kamus

### Phase 4 — Data & turunan
- [x] levels.ts & achievements.ts LocalizedText; achievementShareText/shareImage pakai t()

### Phase 5 — Tests
- [x] Runtime test en≡id key-set; switch instan; update tests lama; smoke EN (stepInstruction)

### Phase 6 — Verifikasi & dokumentasi
- [x] format/lint/typecheck/test/build lulus — **167 test / 23 file**
- [x] README seksi Dua Bahasa
- [ ] Commit & push (menunggu instruksi)

## Risks
- Diff terbesar repo (~35-40 file) → fase terpisah; default id menjaga test lama stabil.
- Key yatim/typo → type-safety + runtime key-set test.
- Refactor LearningStep menyentuh reducer → data murni menyederhanakan replay; 11 test reducer pagar.

## Progress Log
- 2026-08-25 15:00:00 — Plan dibuat setelah analisa dan keputusan user (custom t(), switch instan, default ID).

## Notes
- Out of scope: bahasa ketiga, deteksi locale browser, RTL.
