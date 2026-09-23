# Buka Semua Level + Visual Bintang Per Level

Created: 2026-09-23 10:00:00

## Objective

Bebaskan anak mencoba level manapun: hapus penguncian berurutan (`requires`-gating) sehingga
semua kartu level selalu dapat dimulai. Bedakan secara visual 3 status per level:
(1) belum pernah dicoba, (2) sudah dicoba 1–2 bintang, (3) sempurna 3 bintang —
dengan warna kartu berbeda, border emas + bintang sedikit lebih besar untuk status sempurna.

## Scope

- Termasuk: `isLevelUnlocked`, `LevelCard`, `LevelSelectScreen`, `ResultScreen` (tombol next),
  kamus i18n ID+EN yang terkait, test `levels` / `LevelSelectScreen` / `ResultScreen` / `i18n`,
  bump versi minor.
- Tidak termasuk: perubahan progres/storage/skoring/achievement, perubahan soal/generator,
  perubahan layar Garden/Aquarium/Learn/Concept/Story, perubahan navigasi selain tombol next di Result.

## Milestones

1. Unlock logika (semua level terbuka) — tanpa mengubah tampilan dulu.
2. i18n ID+EN sinkron (syarat tipe `Dict` + test key-set).
3. Visual `LevelCard` 3 status.
4. Pengkabelan `LevelSelectScreen` + `ResultScreen`.
5. Test + verifikasi + bump versi.

## Tasks

- [ ] Langkah 1 — Buka kunci di `src/data/levels.ts` (+ komentar `src/types/index.ts`)
- [ ] Langkah 2 — Sinkron kamus `src/i18n/dicts/id.ts` + `src/i18n/dicts/en.ts`
- [ ] Langkah 3 — Visual 3 status di `src/components/LevelCard.tsx`
- [ ] Langkah 4 — `src/screens/LevelSelectScreen.tsx` selalu terbuka
- [ ] Langkah 5 — `src/screens/ResultScreen.tsx` tombol next selalu tampil
- [ ] Langkah 6 — Perbarui test (`levels`, `LevelSelectScreen`, `ResultScreen`)
- [ ] Langkah 7 — Verifikasi (`typecheck`, `lint`, `format:check`, `vitest run`)
- [ ] Langkah 8 — Bump versi minor (`package.json` 1.4.2 → 1.5.0)

---

### Langkah 1 — Buka kunci di `src/data/levels.ts`

- Tujuan langkah: semua level dikenal selalu terbuka; `isLevelUnlocked` menjadi no-op
  dokumentatif agar pemanggil tidak perlu diubah signature-nya.
- Finding / requirement yang diselesaikan: "level belum selesai terkunci → buka saja".
  Rantai saat ini: `k1-membilang → … → k1-jembatan-2-digit → level-1 → … → level-11 →
  cerita-1..4 → tantangan`, plus cabang `kebun-*` / `akuarium-*` via field `requires`.
- Dependency: tidak ada (langkah pertama; semua langkah lain bergantung padanya secara logika,
  tapi tidak ada dependency file).
- File yang harus dibaca: `src/data/levels.ts` (baris 570–625), `src/types/index.ts` (baris 205–219).
- File yang harus diubah:
  1. `src/data/levels.ts`
  2. `src/types/index.ts` (hanya komentar, 1 baris)
- Simbol terkait: `LEVELS`, `getLevel`, `LEGACY_LEVEL_IDS`, `K1_IDS`, `isLevelUnlocked`,
  `getNextLevelId`, type `LevelDefinition.requires`.
- Kondisi implementasi saat ini (`src/data/levels.ts:574-617`):
  ```ts
  const LEGACY_LEVEL_IDS: readonly string[] = [...]
  const K1_IDS: readonly string[] = [...]
  export function isLevelUnlocked(levelId: string, completedLevelIds: readonly string[]): boolean {
    const level = LEVELS.find((entry) => entry.id === levelId)
    if (!level) return false
    if (completedLevelIds.includes(levelId)) return true
    if (level.requires === null) return true
    if (completedLevelIds.includes(level.requires)) return true
    const isVeteran = completedLevelIds.some((id) => LEGACY_LEVEL_IDS.includes(id))
    if (isVeteran) { ... }
    return false
  }
  ```
- Perubahan konkret (urutan di dalam file):
  1. Hapus blok konstanta `LEGACY_LEVEL_IDS` (baris 574–588) dan `K1_IDS` (baris 590–599).
  2. Ganti badan `isLevelUnlocked` menjadi:
     ```ts
     export function isLevelUnlocked(levelId: string, _completedLevelIds: readonly string[]): boolean {
       return LEVELS.some((entry) => entry.id === levelId)
     }
     ```
     Parameter kedua dipertahankan (prefix underscore) agar signature tidak berubah dan
     pemanggil (`LevelSelectScreen`, `ResultScreen`, test) tidak perlu diubah signature.
     Tambahkan komentar tepat di atas fungsi:
     `// Semua level terbuka by design (bebas pilih mana saja); requires hanya metadata urutan.`
  3. Jangan ubah entri `LEVELS` (nilai `requires` tetap apa adanya sebagai metadata urutan
     untuk `getNextLevelId`).
  4. Jangan ubah `getLevel` dan `getNextLevelId`.
  5. Di `src/types/index.ts:210`, ubah komentar field `requires` dari
     `/** Level yang harus selesai dulu agar level ini terbuka; null = selalu terbuka */`
     menjadi
     `/** Metadata urutan belajar; TIDAK lagi mengunci (semua level terbuka by design). */`
- Behavior yang harus dipertahankan:
  - `isLevelUnlocked('tidak-ada', ...)` tetap `false` untuk id tak dikenal.
  - `getNextLevelId` linear tidak berubah (termasuk `level-11 → cerita-1 → … → tantangan`).
- Error handling / edge case:
  - `completedLevelIds` kosong → semua id dikenal `true` (bukan hanya `k1-membilang`).
  - Progres veteran / parsial / penuh → hasil sama (`true` untuk id dikenal).
  - Jangan throw untuk input apapun; fungsi murni tanpa I/O.
- Test: lihat Langkah 6 (bagian A).
- Command verifikasi: `npm run typecheck` (setelah semua langkah).
- Hasil verifikasi yang diharapkan: tidak ada error TS terkait `LEGACY_LEVEL_IDS`/`K1_IDS`
  (pastikan tidak ada referensi sisa via grep).
- Completion criteria: grep `LEGACY_LEVEL_IDS|K1_IDS` di `src/` nol hasil kecuali historis;
  `isLevelUnlocked` 5 baris sesuai snippet di atas.
- File yang tidak boleh diubah di langkah ini: semua file selain dua di atas
  (khususnya JANGAN ubah `LEVELS`, `ProgressContext`, `storage`, `scoring`).

### Langkah 2 — Sinkron kamus ID + EN

- Tujuan langkah: teks kunci dihapus/ditambah secara sinkron ID+EN agar tipe
  `Dict = typeof id` (`src/i18n/dicts/en.ts:1,7`) dan test key-set
  (`tests/i18n.test.tsx:20-24`, `enKeys toEqual idKeys`) tetap lolos.
- Finding yang diselesaikan: bubble "selesaikan berurutan" dan "supaya levelnya terbuka"
  tidak lagi benar; butuh label "Belum dicoba" dan "Sempurna!".
- Dependency: setelah Langkah 1 (logika), sebelum Langkah 3 (`LevelCard` memakai key baru).
- File yang harus dibaca: `src/i18n/dicts/id.ts` (baris 75–88, 136–140),
  `src/i18n/dicts/en.ts` (baris 76–89, 136–141), `src/i18n/core.ts` (tipe `TranslationKey`),
  `tests/i18n.test.tsx` (baris 19–31).
- File yang harus diubah: `src/i18n/dicts/id.ts` DAN `src/i18n/dicts/en.ts` (selalu berpasangan,
  dalam satu commit logis yang sama).
- Simbol terkait: key `levels.bubble`, `levelCard.notFinished`, `levelCard.lockedHint`,
  `learn.exitDesc`, key baru `levelCard.neverTried`, `levelCard.perfect`.
- Kondisi saat ini:
  - id: `levels.bubble` = "Pilih level ya! Selesaikan level berurutan untuk membuka level
    berikutnya. Kamu juga bisa mengulang level lama kapan saja."
  - id: `levelCard.notFinished` = "Belum selesai"; `levelCard.lockedHint` = "Selesaikan level
    sebelumnya dulu ya"; `learn.exitDesc` mengandung "…supaya levelnya terbuka!".
  - en padanannya di baris yang sejajar.
- Perubahan konkret (urutan di dalam tiap file dict; lakukan identik di id lalu en):
  1. Ubah `levels.bubble` menjadi:
     - id: "Pilih level mana saja ya! Kamu bebas mencoba level apapun. Mengulang level lama
       kapan saja juga boleh."
     - en: "Pick any level! You are free to try any level. You can replay old levels anytime."
  2. Ubah `learn.exitDesc` menjadi:
     - id: "Level ini belum selesai, jadi progresnya belum tersimpan. Yuk lanjut supaya
       bintangnya terkumpul!"
     - en: "This level isn't finished yet, so it won't be saved. Keep going to collect the stars!"
     (Key tetap `learn.exitDesc`; hanya value yang berubah.)
  3. Hapus key `levelCard.lockedHint` dari kedua file (karena tidak ada lagi kartu terkunci).
  4. Ubah arti `levelCard.notFinished` menjadi khusus "sudah dicoba tapi…" ATAU pertahankan
     sebagai fallback? Keputusan deterministik: PERTAHANKAN key `levelCard.notFinished`
     dengan value lama (jangan hapus) untuk menghindari churn; ia dipakai sebagai teks kecil
     di bawah bintang untuk status 1–2 bintang? TIDAK — lihat Langkah 3: teks kecil untuk
     1–2 bintang memakai `result.starsAria` saja. Jadi `levelCard.notFinished` dipertahankan
     tapi tidak lagi dirender oleh `LevelCard` (dead key sementara, dihapus di milestone
     berikutnya bila diinginkan). Alasan: meminimalkan risiko test snapshot teks.
     (Jika implementer memilih menghapusnya, WAJIB hapus dari kedua file sekaligus.)
  5. Tambah dua key baru di kedua file, tepat setelah `levelCard.notFinished`:
     - `levelCard.neverTried`: id "✨ Belum dicoba" / en "✨ Never tried"
     - `levelCard.perfect`: id "🏆 Sempurna!" / en "🏆 Perfect!"
     Keduanya berupa string statis (bukan fungsi) agar `typeof` di kedua bahasa sama
     (syarat `tests/i18n.test.tsx:26-31`).
- Behavior yang harus dipertahankan: semua key lama yang masih dirujuk file lain tidak boleh
  hilang dalam satu bahasa saja; `createT(lang)` tetap murni.
- Error handling / edge case: jika satu key lupa ditambah di salah satu bahasa → `tsc`
  gagal (en: Dict) dan test key-set gagal. Cara cegah: edit kedua file sebelum menjalankan test.
- Test: `tests/i18n.test.tsx` tidak perlu diubah (ia generik); ia menjadi verifier.
  Tambahan manual: `createT('id')('levelCard.neverTried')` → "✨ Belum dicoba".
- Input test & expected: `Object.keys(en).sort() toEqual Object.keys(idDict).sort()` tetap lolos.
- Command verifikasi: `npm run typecheck` + `npx vitest run tests/i18n.test.tsx`.
- Hasil yang diharapkan: typecheck bersih; test i18n 5/5 lolos.
- Completion criteria: grep `lockedHint` di `src/` nol hasil (kecuali langkah 3 sudah
  menghapus pemakaiannya); grep `neverTried` tepat 2 hasil (id+en); grep `levelCard.perfect`
  tepat 2 hasil.
- File yang tidak boleh diubah: `src/i18n/core.ts`, `src/i18n/LanguageContext.tsx`,
  `src/i18n/steps.ts`, file story/concept.

### Langkah 3 — Visual 3 status di `src/components/LevelCard.tsx`

- Tujuan langkah: kartu selalu dapat dimulai; status bintang jelas lewat warna kartu +
  ukuran bintang + chip, sesuai keputusan user: (1) warna kartu berbeda untuk belum dicoba,
  (2) border emas + bintang sedikit lebih besar untuk sempurna.
- Finding yang diselesaikan: bintang hanya muncul bila `completed`; teks "Belum selesai"
  tidak membedakan 0-bintang vs 1–2 bintang; kartu terkunci abu + `🔒`.
- Dependency: Langkah 1 (selalu unlocked) + Langkah 2 (key baru tersedia).
- File yang harus dibaca: `src/components/LevelCard.tsx` (seluruh 97 baris),
  `src/lib/scoring.ts` (`starsFor` mengembalikan 1–3 untuk sesi selesai; 0 hanya untuk
  belum pernah selesai), `src/types/index.ts:265-287` (`bestScores`, `completedLevelIds`).
- File yang harus diubah: `src/components/LevelCard.tsx` SAJA.
- Simbol terkait: `LevelCardProps { level, unlocked, completed, stars, onStart }`,
  komponen `StarRow`, `useI18n`, `LevelDefinition`.
- Kondisi implementasi saat ini (baris kunci):
  - `StarRow({ count })` me-render 3× `★` dengan `text-amber-400` bila `position <= count`
    else `text-slate-300`, ukuran `text-sm`.
  - `LevelCard` bercabang `unlocked ? ... : ...` untuk border/bg/ikon/judul/tombol
    (baris 38, 46, 49, 54, 67, 81–91); ikon terkunci `🔒`; tombol terkunci diganti
    `<span>lockedHint</span>`.
  - Bintang hanya bila `completed` (baris 76–80), else teks `notFinished`.
- Perubahan konkret (urutan di dalam file; lakukan berurutan 1→6):
  1. Ubah `StarRow` menjadi `StarRow({ count, large }: { count: number; large?: boolean })`:
     - `const clamped = Math.max(0, Math.min(3, count))`.
     - Jika `clamped === 0`: render 3× `☆` (outline U+2606) dengan class
       `text-slate-300`, ukuran `text-sm` (tanpa prop large).
     - Jika `clamped >= 1`: render 3× `★` (U+2605) dengan `text-amber-400` bila
       `position <= clamped` else `text-slate-300`; ukuran `large ? 'text-base' : 'text-sm'`.
     - Pertahankan `aria-label={t('result.starsAria', { stars: clamped })}` pada wrapper.
  2. Di `LevelCard`, hitung di awal fungsi (setelah `heading`):
     ```ts
     const clampedStars = Math.max(0, Math.min(3, stars))
     const isPerfect = completed && clampedStars === 3
     const isUntried = !completed
     ```
     (Catatan: `stars` 0 + `completed` true akibat data korup → diperlakukan sebagai
     bukan perfect, bukan untried; tampil sebagai 1–2 grup dengan `☆☆☆`? TIDAK —
     karena `StarRow` clamped 0 me-render outline; itu acceptable untuk data korup.)
  3. Ganti class `<article>` (baris 37–41) menjadi tiga cabang deterministik:
     - `isPerfect` → `"rounded-3xl border-2 p-4 shadow-sm border-amber-400 bg-amber-50"`
     - `isUntried` → `"rounded-3xl border-2 p-4 shadow-sm border-violet-200 bg-violet-50"`
     - else (1–2 bintang) → `"rounded-3xl border-2 p-4 shadow-sm border-sky-200 bg-white"`
     Hapus semua referensi `unlocked` untuk styling kartu (prop `unlocked` dipertahankan
     di interface agar pemanggil lama tidak rusak, tapi tidak lagi dipakai untuk cabang
     visual; tambahkan komentar `// unlocked selalu true by design — dipertahankan untuk
     kompatibilitas pemanggil`).
  4. Ganti ikon `<span>` (baris 43–50): selalu tampilkan `level.number ?? '⚡'`
     (hapus cabang `'🔒'`); warna mengikuti status:
     perfect → `bg-amber-100 text-amber-800`; untried → `bg-violet-100 text-violet-700`;
     else → `bg-sky-100 text-sky-700`.
  5. Ganti warna judul (baris 53–54) dan goal (baris 66–68): perfect → `text-amber-900` /
     `text-amber-800`; untried → `text-slate-800` / `text-slate-600` (sama seperti biasa,
     JANGAN abu terkunci `text-slate-500/400`); else tetap sky/slate normal.
     Pertahankan `level.goal[lang]`, `level.example[lang]`, `questionSuffix` apa adanya.
  6. Ganti blok bawah (baris 75–92) menjadi:
     ```tsx
     <div className="mt-2 flex items-center justify-between gap-2">
       <span className="flex flex-col gap-1">
         <StarRow count={clampedStars} large={isPerfect} />
         {isPerfect && (
           <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-black text-amber-800">
             {t('levelCard.perfect')}
           </span>
         )}
         {isUntried && (
           <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[0.65rem] font-black text-violet-700">
             {t('levelCard.neverTried')}
           </span>
         )}
       </span>
       <button type="button" onClick={onStart} className="min-h-11 rounded-2xl border-b-4 border-sky-600 bg-sky-500 px-4 text-sm font-bold text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300">
         {completed ? t('levelCard.repeat') : t('levelCard.start')}
       </button>
     </div>
     ```
     Hapus cabang `unlocked ? <button> : <span>lockedHint</span>` dan cabang
     `completed ? <StarRow/> : <span>notFinished</span>`.
- Behavior yang harus dipertahankan:
  - `onStart` routing per level (ditangani pemanggil) tidak berubah.
  - Grade chip (emerald/sky), contoh soal, jumlah soal tidak berubah.
  - Aksesibilitas: `aria-label` bintang tetap; kontras teks di atas `violet-50`/`amber-50`
    tetap gelap (slate-800/amber-900).
- Error handling / edge case:
  - `stars` di luar 0–3 (data korup) → clamp 0–3, tidak throw.
  - `level.number === null` (tantangan) → ikon `⚡` seperti sebelumnya.
  - `unlocked=false` dari pemanggil lama → abaikan untuk visual (tetap tampil terbuka);
    JANGAN throw/warn.
- Test: lihat Langkah 6 (bagian B).
- Command verifikasi: `npm run typecheck` + test LevelCard/LevelSelect.
- Hasil yang diharapkan: tidak ada referensi `lockedHint`/`notFinished`/`🔒` di file ini.
- Completion criteria: grep `🔒|lockedHint|notFinished` di `LevelCard.tsx` nol hasil;
  grep `neverTried|levelCard.perfect` masing-masing 1 hasil di file ini.
- File yang tidak boleh diubah: `LevelSelectScreen`, `ResultScreen` (di langkah lain),
  `ProgressContext`, `storage`, `scoring`.

### Langkah 4 — `src/screens/LevelSelectScreen.tsx` selalu terbuka

- Tujuan langkah: pengkabelan akhir agar semua kartu dapat diklik Mulai.
- Finding: `unlocked={isLevelUnlocked(...)}` kini selalu true, tapi import dan pesan bubble
  masih menyiratkan urutan.
- Dependency: Langkah 1–3 selesai.
- File yang harus dibaca: `src/screens/LevelSelectScreen.tsx` (61 baris).
- File yang harus diubah: `src/screens/LevelSelectScreen.tsx` SAJA.
- Simbol terkait: `LEVELS`, `isLevelUnlocked`, `useProgress`, `useNavigation`, `LevelCard`.
- Kondisi saat ini (baris 30–36): `unlocked={isLevelUnlocked(level.id, progress.completedLevelIds)}`,
  `completed={...includes}`, `stars={progress.bestScores[level.id] ?? 0}`.
- Perubahan konkret (urutan):
  1. Pertahankan import `isLevelUnlocked` (JANGAN hapus) dan teruskan
     `unlocked={isLevelUnlocked(level.id, progress.completedLevelIds)}` apa adanya.
     Alasan: fungsi kini selalu true untuk id dikenal; mempertahankan pemanggilan
     menghindari churn dan menjaga test probe. (Alternatif `unlocked={true}` DILARANG
     di plan ini agar diff minimal dan deterministik.)
  2. Jangan ubah logika `onStart` (cabang `kebun-` → garden, `akuarium-` → aquarium,
     `story` → story-learn, `concept` → concept-learn, else learn).
  3. Jangan ubah `GRADE_ORDER`, grouping, atau `AdSlot`.
  4. Bubble otomatis memakai teks baru dari Langkah 2 (tidak ada edit teks inline).
- Behavior yang harus dipertahankan: urutan tampil (Kelas 1 lalu Kelas 2, sesuai array
  `LEVELS`), routing per `levelKind`/prefix, replay via `completed`.
- Edge case: `progress.bestScores[level.id]` undefined → `?? 0` dipertahankan.
- Test: Langkah 6 (bagian B).
- Completion criteria: file hanya berbeda dari baseline di… TIDAK BERBEDA SAMA SEKALI
  (langkah ini adalah verifikasi tanpa edit; jika file sudah memanggil `isLevelUnlocked`,
  tidak ada perubahan yang diperlukan). Jika implementer menemukan file tidak memanggilnya,
  kembalikan ke pemanggilan di atas.
- File yang tidak boleh diubah: file lain di langkah ini.

### Langkah 5 — `src/screens/ResultScreen.tsx` tombol next selalu tampil

- Tujuan langkah: setelah sesi selesai, tombol "Level Berikutnya" selalu tersedia
  (tidak disembunyikan oleh penguncian lama).
- Finding: `nextLevelAvailable` menggabungkan `nextLevelId !== null && isLevelUnlocked(...)`.
- Dependency: Langkah 1 (fungsi kini true) — perubahan di sini adalah penyederhanaan eksplisit.
- File yang harus dibaca: `src/screens/ResultScreen.tsx` (baris 1–27, 112–126).
- File yang harus diubah: `src/screens/ResultScreen.tsx` SAJA.
- Simbol terkait: `getLevel`, `isLevelUnlocked`, `summary.nextLevelId`, `progress`.
- Kondisi saat ini (baris 5, 20–21):
  ```ts
  import { getLevel, isLevelUnlocked } from '../data/levels'
  const nextLevelAvailable =
    summary.nextLevelId !== null && isLevelUnlocked(summary.nextLevelId, progress.completedLevelIds)
  ```
- Perubahan konkret (urutan):
  1. Baris 5: ubah import menjadi `import { getLevel } from '../data/levels'`
     (hapus `isLevelUnlocked`).
  2. Baris 20–21: ganti menjadi:
     ```ts
     const nextLevelAvailable = summary.nextLevelId !== null
     ```
  3. Jangan ubah cabang navigasi next (baris 115–121: concept → concept-learn,
     story → story-learn, else learn) dan jangan ubah tombol retry/practice/home.
  4. `progress` tetap dipakai untuk `childName` dan achievement (jangan hapus hook).
- Behavior yang harus dipertahankan: level terakhir (`nextLevelId === null`, yaitu
  `akuarium-6`) tetap tidak menampilkan tombol next; `summary.settings === null`
  (concept) tetap menyembunyikan "Latihan Lagi".
- Edge case: `summary.nextLevelId` menunjuk id tak dikenal (data korup) → `getLevel`
  undefined; tombol tetap render (sesuai syarat "selalu tampil bila non-null") dan
  navigasi mengikuti cabang else → `learn`. Acceptable; JANGAN tambah guard baru.
- Test: Langkah 6 (bagian C).
- Completion criteria: grep `isLevelUnlocked` di `ResultScreen.tsx` nol hasil;
  grep `nextLevelAvailable` 2 hasil (definisi + pemakaian).
- File yang tidak boleh diubah: layar lain, `NavigationContext`, `achievements`.

### Langkah 6 — Perbarui test

- Tujuan langkah: test mencerminkan desain baru dan mengunci visual 3 status.
- Dependency: Langkah 1–5 selesai (test mengacu pada perilaku baru).
- File yang harus dibaca: `tests/levels.test.ts` (98 baris),
  `tests/screens/LevelSelectScreen.test.tsx` (27 baris),
  `tests/screens/ResultScreen.test.tsx` (110 baris),
  `tests/helpers/renderWithProviders.tsx`, `src/lib/storage.ts` (`defaultProgress`, `STORAGE_KEY`).

#### Bagian A — `tests/levels.test.ts` (ubah; JANGAN buat file baru)

- Simbol: `isLevelUnlocked`, `getNextLevelId`, `LEVELS`.
- Perubahan konkret:
  1. Ganti isi `describe('isLevelUnlocked')` menjadi 3 kasus:
     - `it('semua id dikenal selalu terbuka walau progres kosong', ...)`:
       input `[]`; loop `for (const l of LEVELS) expect(isLevelUnlocked(l.id, [])).toBe(true)`.
     - `it('tetap terbuka untuk progres parsial dan penuh', ...)`:
       input `['k1-membilang']`, `['level-5']`, dan semua id; expected `true` untuk
       `'k1-banding'`, `'level-1'`, `'level-2'`, `'cerita-1'`, `'tantangan'`, `'kebun-1'`,
       `'akuarium-1'` pada tiap input.
     - `it('id tidak dikenal selalu false', ...)`:
       `expect(isLevelUnlocked('tidak-ada', [])).toBe(false)` dan
       `expect(isLevelUnlocked('tidak-ada', ['level-1'])).toBe(false)`.
     Hapus semua kasus veteran/K1/rantai-terkunci (`user baru: hanya k1-membilang…`,
     `veteran dengan legacy…`, `rantai K1 berurutan…`, `rantai cerita…` versi lama).
  2. `describe('getNextLevelId linear')` PERTAHANKAN 100% tanpa perubahan.
- Expected: `npx vitest run tests/levels.test.ts` → 5 passed (3 unlock + 2 next).

#### Bagian B — `tests/screens/LevelSelectScreen.test.tsx` (ubah + tambah)

- Perubahan konkret:
  1. Pertahankan test pertama ("menampilkan seluruh kartu level") tanpa perubahan.
  2. Ganti test kedua menjadi: progres fresh → `queryByText('🔒')` null;
     `queryByText(/Selesaikan level sebelumnya/)` null; semua tombol bernama
     `Mulai` jumlahnya `LEVELS.length` (`screen.getAllByRole('button', { name: 'Mulai' })`
     length `toBe(LEVELS.length)`); tidak ada tombol `Mengulang`.
  3. Tambah test ketiga ("status belum dicoba vs sempurna"):
     - Render fresh → `getAllByText('✨ Belum dicoba')` length `toBe(LEVELS.length)`.
     - Seed: `window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...defaultProgress(),
       completedLevelIds: ['k1-membilang'], bestScores: { 'k1-membilang': 3 } }))`,
       cleanup + render ulang → `getByText('🏆 Sempurna!')` ada; tombol `Mengulang` ada 1;
       `getAllByText('✨ Belum dicoba')` length `toBe(LEVELS.length - 1)`.
       Akhiri dengan `window.localStorage.clear()`.
     - Untuk status 1–2 bintang (deterministik): seed kedua
       `completedLevelIds: ['level-1'], bestScores: { 'level-1': 2 }` → kartu itu
       tidak punya chip `Belum dicoba`/`Sempurna`, dan `aria-label` bintang
       `Kamu mendapat 2 dari 3 bintang` ada 1 (`screen.getByLabelText(...)`).
- Input & expected dirangkum di atas; gunakan `renderScreenWithProviders` + `cleanup`
  seperti file saat ini; JANGAN ubah helper.

#### Bagian C — `tests/screens/ResultScreen.test.tsx` (ubah)

- Perubahan konkret:
  1. Test "retry concept … next concept vs column bercabang" (baris 55–80): hapus komentar
     "terkunci untuk progres fresh" dan ubah dua asersi
     `expect(queryByRole next).toBeNull()` menjadi
     `expect(getByRole('button', { name: /Level Berikutnya/ })).not.toBeNull()`
     (fresh progress, `levelId: 'k1-membilang', nextLevelId: 'k1-banding'` dan
     `levelId: 'k1-jembatan-2-digit', nextLevelId: 'level-1'`).
  2. Test "tombol next tampil saat prasyarat terpenuhi" (baris 82–95): pertahankan (tetap
     lolos), ubah nama menjadi "tombol next tampil walau progres fresh maupun terisi".
  3. Test story (baris 97–109): pertahankan; tambahkan satu render fresh
     (`localStorage.clear()` + summary `cerita-1 → cerita-2`) dengan expected tombol next ada.
  4. Jangan ubah `makeSummary` dan test statistik/practice/retry.
- Expected: `npx vitest run tests/screens/ResultScreen.test.tsx` → 7 passed, 0 failed.
- File yang tidak boleh diubah di langkah ini: test lain (khususnya
  `PracticeScreenStory.test.tsx` yang punya flake pre-existing — JANGAN disentuh).

### Langkah 7 — Verifikasi

- Tujuan langkah: pastikan tidak ada regresi tipe/lint/format/test.
- Dependency: Langkah 1–6 selesai.
- Command (jalankan berurutan, dari root repo; JANGAN ubah repo selain yang direncanakan):
  1. `npm run typecheck` → expected: exit 0, tidak ada output error.
  2. `npm run lint` → expected: exit 0 (0 error; warning pre-existing bila ada dicatat).
  3. `npm run format:check` → expected: exit 0 untuk file yang diubah; jika gagal,
     jalankan `npx prettier --write` HANYA pada file yang diubah di langkah 1–6 lalu ulangi.
  4. `npx vitest run tests/levels.test.ts tests/i18n.test.tsx tests/screens/LevelSelectScreen.test.tsx tests/screens/ResultScreen.test.tsx` → expected: semua passed.
  5. `npm run test` (full suite) → expected: 304+ test lolos; SATU kegagalan yang
     diizinkan: `tests/screens/PracticeScreenStory.test.tsx` (flake pre-existing yang lolos
     terisolasi — catat di Progress Log, JANGAN diperbaiki di plan ini).
- Completion criteria: 4 command pertama hijau; full suite hijau kecuali flake yang
  diizinkan di atas.
- File yang tidak boleh diubah: apapun di luar langkah 1–6 + 8.

### Langkah 8 — Bump versi minor

- Tujuan langkah: menandai perubahan user-facing (`feat`) sesuai aturan memori
  (feat → minor + reset patch).
- Dependency: Langkah 7 hijau.
- File yang harus dibaca: `package.json` (baris 4: `"version": "1.4.2"`).
- File yang harus diubah: `package.json` SAJA (1 baris). `src/lib/version.ts` membaca dari
  `package.json` sehingga otomatis ikut; footer Home + Settings otomatis ikut.
- Perubahan konkret: `"version": "1.4.2"` → `"version": "1.5.0"`.
- Behavior yang harus dipertahankan: format SemVer `x.y.z`, tidak ada perubahan dependensi.
- Test: tidak ada test baru; verifier adalah footer `v1.5.0` tampil (manual) dan
  `npm run typecheck` tetap hijau.
- Completion criteria: `package.json:version` === `1.5.0`.
- File yang tidak boleh diubah: `package-lock.json` (jangan regenerate manual),
  changelog, file lain.

## Risks

- Anak melompat ke level sulit (4-digit/tantangan) tanpa fondasi → frustrasi.
  Mitigasi: urutan visual tetap (Kelas 1 → Kelas 2 + nomor), bubble menyarankan bebas tapi
  boleh berurutan; bukan kunci. Diterima sesuai permintaan user.
- `levelCard.notFinished` menjadi dead key sementara → risiko kecil kebingungan.
  Mitigasi: dipertahankan dengan value lama; penghapusan total ditunda ke milestone berikut
  dan WAJIB berpasangan ID+EN.
- Data korup (`bestScores` di luar 0–3, `nextLevelId` asing) → ditangani via clamp dan
  navigasi fallback (Langkah 3 & 5); tidak throw.
- Flake pre-existing `PracticeScreenStory` → dicatat, tidak diperbaiki di sini agar diff minimal.
- Counter-argument: menghapus gating menghilangkan "rasa progresi berurutan".
  Keputusan user tetap buka semua; progresi dipertahankan lewat bintang + achievement
  (`bintang-kelas-1`, `bintang-cerita`) yang tetap berbasis `completedLevelIds`.

## Progress Log

- 2026-09-23 10:00:00 — Plan dibuat (belum ada implementasi). Menunggu eksekusi Langkah 1–8.
- 2026-09-23 12:52:00 — Semua 8 langkah selesai.
  - Langkah 1: `LEGACY_LEVEL_IDS` dan `K1_IDS` dihapus; `isLevelUnlocked` disederhanakan jadi check keberadaan id. `requires` comment diperbarui.
  - Langkah 2: `levels.bubble` dan `learn.exitDesc` diubah (ID+EN); `levelCard.lockedHint` dihapus dari kedua dict; `levelCard.neverTried` + `levelCard.perfect` ditambah.
  - Langkah 3: `LevelCard` visual 3 status (amber perfect, violet untried, sky/white 1–2 bintang); `StarRow` suport `large`; `🔒` dihapus.
  - Langkah 4: `LevelSelectScreen` tidak perlu edit (sudah pakai `isLevelUnlocked`).
  - Langkah 5: `ResultScreen` — `nextLevelAvailable` disederhanakan, `isLevelUnlocked` import dihapus.
  - Langkah 6: Test `levels` (3 kasus unlock), `LevelSelectScreen` (tambah 2 test), `ResultScreen` (update asersi next + tambah story fresh).
  - Langkah 7: `typecheck` ✅, `lint` ✅, `format:check` ✅, 4 file test fokus 24/24 ✅, full suite 333/334 ✅ (flake `PracticeScreenStory` pre-existing, tidak disentuh).
  - Langkah 8: Versi bump 1.4.2 → 1.5.0.
  - Grep acceptance: `LEGACY_LEVEL_IDS|K1_IDS` nol di `src/`; `lockedHint` nol di `src/`; `🔒` nol di `LevelCard.tsx`; `isLevelUnlocked` nol di `ResultScreen.tsx`; `neverTried` dan `perfect` ada di kedua dict + `LevelCard.tsx`.

## Notes

- Standar arsitektur: tidak ada perubahan skema/database; TOGAF/ODA tidak relevan
  (aplikasi client-side localStorage). Tidak ada deviasi standar domain.
- Aturan memori yang dipakai: Prettier (no semi, single quote, printWidth 100);
  test wajib via `tests/setup.ts` + cleanup RTL; `Dict` ID+EN harus sinkron;
  unlock lama (`requires` + veteran bypass `K1_IDS`) digantikan desain terbuka.
- Warna yang diputuskan user: kartu belum-dicoba ungu (`violet-50/100/200`), sempurna
  emas (`amber-50/100/400`), 1–2 bintang putih-biru (`white`/`sky`), bintang sempurna
  `text-base` vs normal `text-sm`. Tailwind v4 sudah menyediakan palet ini.
- `requires` tetap di data sebagai metadata urutan untuk `getNextLevelId`; jangan dihapus
  nilainya per-level.

## Handoff Checklist (untuk model eksekutor)

- [ ] Baca sebelum mulai: `src/data/levels.ts:570-625`, `src/components/LevelCard.tsx` (penuh),
  `src/screens/LevelSelectScreen.tsx`, `src/screens/ResultScreen.tsx`,
  `src/i18n/dicts/id.ts:75-88,136-140`, `src/i18n/dicts/en.ts:76-89,136-141`,
  `tests/levels.test.ts`, `tests/screens/LevelSelectScreen.test.tsx`,
  `tests/screens/ResultScreen.test.tsx`, `tests/i18n.test.tsx:19-31`, `package.json:4`.
- [ ] Kerjakan berurutan Langkah 1 → 8; jangan melompat (test mengacu pada perilaku baru).
- [ ] Setiap key i18n selalu edit ID+EN berpasangan dalam satu batch.
- [ ] Jangan menyentuh: `src/state/ProgressContext.tsx`, `src/lib/storage.ts`,
  `src/lib/scoring.ts`, `src/lib/achievements.ts`, layar Garden/Aquarium/Learn/Concept/Story/
  Practice/Home, `NavigationContext`, `tests/screens/PracticeScreenStory.test.tsx`,
  `package-lock.json`.
- [ ] Kriteria selesai: `typecheck` + `lint` + `format:check` hijau; 4 file test fokus hijau;
  full suite hijau kecuali flake `PracticeScreenStory` yang dicatat; grep acceptance:
  `LEGACY_LEVEL_IDS|K1_IDS` nol di `src/`, `lockedHint` nol di `src/` (atau hanya dead key
  dict bila dipertahankan — nyatakan di log), `🔒` nol di `LevelCard.tsx`,
  `isLevelUnlocked` nol di `ResultScreen.tsx`, `neverTried`/`perfect` ada di kedua dict +
  `LevelCard.tsx`.
- [ ] Jangan staging/commit file selain file plan ini; perubahan kode dilakukan eksekutor
  dalam kerjaannya sendiri, bukan di sesi plan ini.
- [ ] Open questions: tidak ada yang memblokir (warna/ukuran sudah diputuskan user).
  Jika ragu antara menghapus vs mempertahankan `levelCard.notFinished`, pilih
  MEMPERTAHANKAN (opsi aman, zero-risk terhadap snapshot teks).
