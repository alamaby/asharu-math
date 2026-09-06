# Review Temuan M2 — Jalur Konsep Kelas 1 & Perbaikan

Created: 2026-09-06 16:40:00

## Objective
Menutup celah M2 agar sesuai plan `2026-09-06-konten-kelas-1-dan-2.md`: 3 level konsep (membilang/banding/nilai-tempat) berjalan aman untuk pengguna baru & veteran, i18n parity ID↔EN, tidak ada regresi kolom bersusun, dan dokumen/test konsisten sebelum rilis.

## Scope
- In: perbaikan `conceptGenerator` determinisme, `ConceptQuestionView` i18n, `ConceptLearnScreen` sound/stale-closure/timer, test konsep & bintang-kelas-1 7-level, rapian rantai K1.
- Out: menambah topik konsep baru di luar 3 yang disepakati; mengubah ID level lama; fitur Practice untuk konsep (tetap latihan kolom 1–4 digit).

## Temuan Review (prioritas)

### P1 — Kritis (wajib sebelum commit)
- **F1. Double sound di `ConceptLearnScreen.tsx:109,132,191`:** `handleChoice` memanggil `playCorrect()/playWrong()` langsung, lalu `useEffect` pada `state.feedback` memanggil lagi — suara ganda. Lawan pola `LearnScreen.tsx` yang hanya via feedback effect.
- **F2. `conceptGenerator.ts:60` nondeterminisme helper:** `buildCompareProblem(left?, right?)` selalu menerapkan 20% pemaksaan `equal` bahkan saat argumen eksplisit diberikan (dipakai `_helpers` di test). Akibat `tests/concept.test.ts:15` harus dilonggarkan ke `toContain` — test deterministik jadi flaky.
- **F3. `ConceptQuestionView.tsx:52,65` label hard-code ID:** `PlaceVisual` menampilkan teks `puluhan`/`satuan` statis, tidak via `t('place.tens'/'place.units')`. EN tetap tampil ID, melanggar parity EN/ID dan a11y.
- **F4. Stale closure & timer leak di `ConceptLearnScreen.tsx:114,148,174`:** `window.setTimeout` tanpa `useRef` + cleanup, callback menangkap snapshot `state` (mis. `state.index`, `state.results`). Jika pengguna keluar cepat atau `locked` race, indeks bisa salah, timer bocor, atau `finishSession` menerima `...state` usang.

### P2 — Penting
- **F5. Rentang `buildCountingProblem` 3–12 vs janji level `k1-membilang` 1–20 (`levels.ts:11`):** cakupan terlalu sempit, tidak sesuai goal; perlu 1–20 (atau 1–15) agar materi membilang variatif.
- **F6. Dead-end distraktor tepi:** `buildCountingProblem` membuat 4 pilihan ±2 dalam `1..20`. Untuk `target=1` atau `20`, himpunan valid hanya 3 nilai (mis. 1→{1,2,3}) sehingga `while (candidates.size < 4)` loop tak berujung jika rentang diperluas ke tepi. Saat ini aman karena 3–12, tapi akan hang saat F5 diterapkan tanpa perbaikan.
- **F7. Konsistensi `Dots` aria & `CompareVisual` SR:** `ConceptQuestionView.tsx:19` aria-label hard-code `Gambar hitung: ${count} ${icon.icon}` (mix ID+EN key), tidak via i18n; `CompareVisual` `sr-only` sebelumnya dihapus — FX untuk pembaca layar berkurang.
- **F8. Dialog keluar custom vs `ConfirmDialog`:** `ConceptLearnScreen.tsx:246` memakai div fixed manual, tidak memakai `ConfirmDialog` seperti `LearnScreen.tsx:731` — inkonsisten focus-ring, aria `dialog`, dan perilaku `danger`.

### P3 — Sedang/Ringan
- **F9. `tests/levels.test.ts` belum mencakup rantai konsep 7 K1 secara eksplisit per `levelKind`:** sudah ada `k1-membilang→k1-banding` tetapi belum untuk `levelKind==='concept'` guard di `LearnScreen`.
- **F10. `README.md:16` angka level:** tertulis `18 + Tantangan` (7 K1 + 11 K2) — sudah benar, tapi perlu penegasan total 19 untuk hindari salah hitung.

## Rencana Perbaikan

### Milestones
1. Fix P1 F1–F4 (sound, determinisme, i18n, timer).
2. Fix P2 F5–F8 (rentang & distraktor tepi, a11y, dialog).
3. Update test & docs, lalu verifikasi penuh.

## Tasks
- [x] F1 — Hapus `playCorrect/playWrong` langsung di `handleChoice`; biarkan hanya `useEffect` feedback (atau sebaliknya) agar single playback — samakan dengan `LearnScreen`.
- [x] F2 — `buildCompareProblem(a?, b?)`: jika `a!==undefined && b!==undefined` (dipanggil via `_helpers` dengan argumen eksplisit), jangan terapkan 20% equal-random; hanya saat `a,b` keduanya acak. Atau tambah param `forceRandomEqual=false` untuk helper.
- [x] F3 — `PlaceVisual`: pakai `useI18n` + `t('place.tens')`/`t('place.units')` untuk label; tetap `aria-hidden` visual tapi teks ikut bahasa aktif.
- [x] F4 — Timer & closure:
  - [x] Simpan `timeoutRef = useRef<number|null>` + `useEffect` cleanup `clearTimeout`.
  - [x] Gunakan functional `setState` atau capture `nextIndex` dari snapshot terbaru sebelum `setTimeout`; `finishSession` terima `nextResults` yang sudah final, jangan spread `...state` usang.
- [x] F5 — Ubah `buildCountingProblem` default `randomInt(1, 20)` (atau `1..15` jika ingin hindari 17–20 terlalu padat) agar sesuai level goal 1–20.
- [x] F6 — Perbaiki distraktor counting agar tidak deadlock di tepi: kumpulkan pool `1..20 \ {count}` lalu `shuffle` + `slice` untuk 3 distraktor, bukan `±2` loop.
- [x] F7 — `Dots` aria-label via `t('concept.countingAria', { count })` atau `t('concept.countPrompt')` SR; `CompareVisual` tambah `aria-label` atau `sr-only` via i18n.
- [x] F8 — Ganti div exit custom dengan `ConfirmDialog` (sudah ada `danger`, `confirmLabel` dll.) agar konsisten dengan `LearnScreen`.
- [x] F9 — Tambah/rapikan test: counting tepi (1 & 20) tetap 4 choices; place-value EN/ID label; veteran bypass tetap 7 K1.
- [x] F10 — Pastikan `README.md` & `plans/2026-09-06-konten-kelas-1-dan-2.md` Progress Log menyebut total 19 (18 + Tantangan).
- [x] Verifikasi: `npm run format:check → lint → typecheck → test → build` + commit.

## Risks
- Over-fix distraktor counting bisa mengubah kesulitan (terlalu jauh dari jawaban) — batasi distraktor dekat (±3..5) tetap dekat.
- Mengubah `buildCompareProblem` equal-rate mempengaruhi distribusi soal — pertahankan 20% untuk jalur acak, hanya helper eksplisit yang deterministik.
- Timer ref cleanup harus kompatibel dengan `jsdom` (pakai `window.setTimeout` + `clearTimeout`).

## Progress Log
- 2026-09-06 16:40:00 — Plan temuan M2 dibuat dari review vs plan induk.
- 2026-09-06 16:50:00 — Fix selesai: F1 double sound → single via feedback effect; F2 compare helper deterministik; F3 place label i18n; F4 timerRef + snapshot + ConfirmDialog; F5 counting 1–20 sesuai goal; F6 counting tepi 1/20 pool distraktor aman; F7 counting aria count+icon & compare aria-label; test counting tepi + compare deterministik ditambah. Verifikasi: `typecheck` OK, `lint` OK, `test` 205/205, `build` OK.

## Notes
- Aturan kritis tetap: data soal murni, i18n render-time; konsep terpisah dari `learnReducer`.
- ID level lama tetap stabil; hanya `K1_IDS` & `bintang-kelas-1` yang diperluas ke 7.
