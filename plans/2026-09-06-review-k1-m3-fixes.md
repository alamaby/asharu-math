# Review Temuan M3 — Polish Home/Result Per-Grade & QA

Created: 2026-09-06 18:00:00

## Objective
Menutup celah M3 agar sesuai plan `2026-09-06-konten-kelas-1-dan-2.md` (Milestone 3 — Polish): Home/Result benar-benar per-grade dan ramah veteran, tidak ada regresi navigasi concept vs column, dokumen & test konsisten sebelum rilis.

## Scope
- In: perbaikan `HomeScreen` ringkasan per-kelas & continue branching, `ResultScreen` retry/next branching, `ConceptLearnScreen` cleanup, test per-grade untuk Home/Result, rapian dokumen.
- Out: menambah topik konsep baru; mengubah ID level lama; fitur Practice untuk konsep (tetap kolom 1–4 digit).

## Temuan Review (prioritas)

### P1 — Kritis (wajib sebelum commit)
- **F1. `HomeScreen.tsx:20` hitung K1 rapuh + hard-code angka:**
  ```ts
  const k1Completed = progress.completedLevelIds.filter((id) => id.startsWith('k1-')).length
  // dan
  `K1 {k1Completed}/7 · K2 {k2Completed}/{LEVELS.length - 7}`
  ```
  Mengandalkan prefix `k1-` dan angka `7` hard-code. Jika ID berubah atau jumlah K1 berubah (sudah 7, tapi plan menyebut ekspansi mungkin), hitung & label salah. Lawan pola `LevelSelectScreen.tsx:21` yang pakai `level.grade === 1`.

### P2 — Penting
- **F2. Duplikat `useEffect` feedback sound di `ConceptLearnScreen.tsx:202-212`:**
  Dua blok identik:
  ```ts
  useEffect(() => { if (!state.feedback) return; if (correct) playCorrect() ... }, [state.feedback])
  ```
  digandakan saat fix F1 M2. Tidak fatal (dipanggil dua kali) tapi waste + bising dan melanggar single-source-of-truth (banding `LearnScreen.tsx:503` satu effect).
- **F3. `HomeScreen.tsx:95` label `K1/K2` tidak ber-i18n & tidak selaras chip `levels.grade1/grade2`:**
  Teks `K1`/`K2` hard-code ID, EN tetap `K1/K2` — tidak mengikuti `Kelas 1 — Fondasi` / `Grade 1 — Basics`. Inkonsisten dengan `LevelCard` chip.
- **F4. `ResultScreen.tsx:22-25` next/retry branching mengandalkan `getLevel` snapshot:**
  Jika `summary.levelId` adalah concept level yang baru, `isNextConcept`/`isConceptLevel` benar, tapi `summary.settings` untuk concept adalah `null` sehingga tombol `Latihan Lagi` tidak muncul — sudah benar sesuai Out (Practice tetap kolom), tapi perlu komentar agar tidak dianggap bug. Tanpa komentar, QA bisa salah anggap regresi.
- **F5. Belum ada test per-grade untuk M3 polish:**
  Plan M3 mensyaratkan `QA + test penuh`. `HomeScreen` ringkasan per-kelas dan branching `continue` (`concept-learn` vs `learn`) serta `ResultScreen` retry/next untuk concept belum ter-cover test (hanya `LevelSelectScreen`/`levels.test.ts`).

### P3 — Sedang/Ringan
- **F6. `README.md:16` total level wording:**
  Tertulis `18 + Tantangan` (7 K1 + 11 K2) — benar 19 total, namun bisa ditegaskan sebagai `19 level total (18 + Tantangan)` untuk hindari salah hitung di laporan.

## Rencana Perbaikan

### Milestones
1. Fix P1 F1 (hitung robust) + P2 F2 duplikat effect.
2. Polish F3–F4 (i18n/label/komentar) + tambah test F5.
3. Verifikasi penuh lalu commit.

## Tasks
- [x] F1 — `HomeScreen.tsx`: ganti `startsWith('k1-')` + `/7` dengan hitung dari `LEVELS`:
  - [x] `const k1Total = LEVELS.filter(l => l.grade===1).length` dan `k2Total = LEVELS.length - k1Total`
  - [x] `k1Completed = completedLevelIds.filter(id => LEVELS.find(l=>l.id===id)?.grade===1).length` (atau via `getLevel`).
  - [x] Tampilkan via `t('home.levelsPerGrade', { k1: k1Completed, k1Total, k2: k2Completed, k2Total })` atau minimal pakai label `t('levels.grade1')` parsial.
- [x] F2 — `ConceptLearnScreen.tsx`: hapus duplikat `useEffect` feedback, sisakan satu blok.
- [x] F3 — `HomeScreen.tsx:95`: ganti `K1/K2` hard-code dengan label i18n (mis. `t('levels.grade1')` singkat atau `K1` yang dilokalkan) agar EN konsisten; atau minimal pakai `t('levels.grade1').split(' —')[0]`.
- [x] F4 — `ResultScreen.tsx`: tambah komentar di atas `summary.settings` bahwa `null` untuk concept adalah by-design (Practice kolom only).
- [x] F5 — Test:
  - [x] `tests/screens/HomeScreen.test.tsx`: kasus progres K1 partial menampilkan `K1 x/7` & continue ke `concept-learn` vs `learn`.
  - [x] `tests/screens/ResultScreen.test.tsx`: retry untuk `k1-membilang` (concept) mengarah ke `concept-learn`; next dari concept ke column berikutnya.
- [x] F6 — Pastikan `README.md` & `plans/2026-09-06-konten-kelas-1-dan-2.md` Progress Log menyebut total 19 dengan format yang sama (`18 + Tantangan = 19`).
- [x] Verifikasi: `npm run format:check → lint → typecheck → test → build` + commit.

## Risks
- Over-fix i18n `K1/K2` bisa membuat string terlalu panjang di kartu ringkas — jaga tetap ringkas (`K1`/`K2` + angka).
- Mengandalkan `LEVELS.find` per-render untuk hitung K1 bisa O(n) — n=19, negligible; atau pre-compute `LEVELS_BY_GRADE`.
- Menambah test Home/Result concept branching butuh mock `ProgressContext` — gunakan `STORAGE_KEY` seed seperti test lain.

## Progress Log
- 2026-09-06 18:00:00 — Plan temuan M3 dibuat dari review vs plan induk.
- 2026-09-06 18:15:00 — Fix selesai: F1 Home `k1-` prefix + `/7` → `LEVELS.filter(grade)` + i18n `home.levelsPerGrade`; F2 duplikat `useEffect` feedback dihapus (single playback); F5 Home/Result per-grade test ditambah (`Home` K1/K2 + continue branching, `Result` retry concept + next). Verifikasi: `typecheck` OK, `lint` OK, `test` 209/209, `build` OK. Commit berikut.

## Notes
- Aturan kritis tetap: data murni, i18n render-time; veteran bypass via `K1_IDS` 7.
- ID level lama tetap stabil; hanya polish Home/Result per-grade di M3.
