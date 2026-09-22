# Implementasi Soal Cerita Kelas 2 (Multi-Langkah)

Tanggal: 2026-09-22 19:38:00

## Ringkasan

Mengeksekusi `plans/2026-09-22-soal-cerita-kelas-2.md` sepenuhnya (S0–S12).
Menambahkan 4 level soal cerita kelas 2 (`cerita-1..cerita-4`, `levelKind: 'story'`)
yang mencakup 6 famili variasi (F0-F5), mode jawab ketik angka + bantuan bersusun,
serta opsi generate di layar Latihan.

## File Baru

- `src/lib/storyGenerator.ts` — generator deterministik 6 famili + session
- `src/i18n/story.ts` — render-time i18n (stem + part prompt bilingual)
- `src/components/story/StoryCard.tsx` — kartu narasi reusable
- `src/screens/StoryLearnScreen.tsx` — layar belajar cerita (ketik + bantuan)
- `tests/storyGenerator.test.ts` — 13 test (deterministik + fuzz + session)
- `tests/screens/PracticeScreenStory.test.tsx` — 2 test (setup + round-trip)

## File Diubah

- `src/types/index.ts` — tambah `LevelKind = 'story'`, `StoryFamily/Item/Part/Problem/Settings`, `presentation?`
- `src/data/levels.ts` — 4 level cerita (number 20-23) + tantangan requires `cerita-4`
- `src/state/NavigationContext.tsx` — route `story-learn`
- `src/App.tsx` — case `story-learn`
- `src/screens/LevelSelectScreen.tsx` — cabang story → story-learn
- `src/screens/HomeScreen.tsx` — handleContinue cabang story
- `src/screens/ResultScreen.tsx` — retry/next story branching
- `src/screens/LearnScreen.tsx` — guard fallback `levelKind !== 'column'`
- `src/screens/PracticeScreen.tsx` — mode cerita + solving-story phase
- `src/lib/achievements.ts` — achievement `bintang-cerita`
- `src/i18n/dicts/id.ts` + `en.ts` — 47 key story + 3 key practice.mode
- `package.json` — bump `1.3.0 → 1.4.0`
- `tests/levels.test.ts` — 3 test rantai cerita
- `tests/achievements.test.ts` — 1 test bintang-cerita
- `tests/screens/ResultScreen.test.tsx` — 1 test retry story

## Hasil Verifikasi

- `npm run typecheck`: exit 0
- `npm run lint`: exit 0
- `npm test`: 283 passed (34 file), baseline 263 → +20 baru
- `npm run build`: sukses, output dist/ terbangun
- Versi: `1.4.0`

## Checklist Manual (belum diverifikasi)

- [ ] Alur K2: level-11 → cerita-1..4 → tantangan terbuka berurutan
- [ ] Tiap cerita-4 menampilkan F2/F3 multi-part dengan "Bagian k dari n"
- [ ] Bantuan "Belajar Bersusun" dari story membuka LearnScreen angka yang sama
- [ ] Latihan mode Cerita menghasilkan sesi; Result "Latihan Lagi" kembali ke mode Cerita
- [ ] Ganti bahasa ID↔EN di tengah sesi story menerjemahkan stem/part instan
- [ ] Footer menampilkan v1.4.0

## Catatan

- Terdapat perubahan pre-existing pada `src/i18n/steps.ts`, `src/lib/learningSteps.ts`,
  `tests/learnReducer.test.ts`, `tests/learningSteps.test.ts` yang bukan bagian scope plan
  ini (berkaitan fitur "input angka sekali per kolom" yang belum ter-commit sebelumnya).
  Semua test tetap hijau.
