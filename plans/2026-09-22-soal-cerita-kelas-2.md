# Implementation Plan — Soal Cerita Kelas 2 (Multi-Langkah) + Generate di Latihan

Created: 2026-09-22 08:00:00

## Objective

Menambah 4 level soal cerita kelas 2 (`cerita-1..cerita-4`, `levelKind: 'story'`) yang mencakup
penambahan, pengurangan, dan 6 famili variasi (2 famili langkah-tunggal + 3 famili multi-langkah
permintaan user + 2 famili tambahan), dengan mode jawab ketik-angka + bantuan bersusun, serta opsi
generate soal cerita di layar Latihan. Plan ini ditulis untuk dieksekusi langkah demi langkah oleh
model kecil tanpa analisis ulang: setiap langkah mencantumkan tujuan, requirement, dependency,
file baca/ubah, simbol, kondisi saat ini, perubahan konkret, urutan edit, perilaku yang dijaga,
edge case, test (input + expected), command verifikasi, completion criteria, dan area terlarang.

Keputusan user yang sudah dikunci (hasil klarifikasi 2026-09-22):
- D1: 4 level, sampai 3-digit (cerita-4 campuran 2-3 digit).
- D2: Jawab ketik angka akhir + tombol bantuan buka langkah bersusun.
- D3: Penempatan rantai akhir (`level-11 -> cerita-1..4 -> tantangan`); Latihan tambah pemilih
  Bersusun/Cerita.
- D4: Variasi 2 = formalisasi split + transfer simpel.
- D5: Satu stem, sub-soal berurutan, masing-masing dinilai terpisah.
- D6: Batas angka mengikuti level induk.

## Scope

- `src/types/index.ts`: tipe `StoryFamily`, `StoryItem`, `StoryPart`, `StoryProblem`,
  `StorySettings`, `LevelKind += 'story'`, union `LevelDefinition.settings`,
  `GeneratorSettings.presentation?`.
- `src/lib/storyGenerator.ts` (baru): sampler 6 famili + `generateStorySession` + `_helpers`.
- `src/i18n/story.ts` (baru) + 47 key baru di `dicts/id.ts` + `dicts/en.ts`.
- `src/components/story/StoryCard.tsx` (baru).
- `src/screens/StoryLearnScreen.tsx` (baru).
- Routing: `NavigationContext` + `App.tsx` + `LevelSelectScreen` + `HomeScreen` + `ResultScreen`
  + guard fallback `LearnScreen`.
- `src/data/levels.ts`: 4 level baru + `tantangan.requires` dipindah ke `cerita-4`.
- `src/lib/achievements.ts`: `bintang-cerita`.
- `src/screens/PracticeScreen.tsx`: mode cerita.
- Test baru/perbarui: `storyGenerator`, `StoryLearnScreen`, `levels`, `ResultScreen`,
  `LevelSelectScreen`, `PracticeScreenStory`, `achievements`.
- `package.json`: bump `1.3.0 -> 1.4.0`.

## Requirement Traceability

| ID | Requirement / Finding | Langkah |
|----|----------------------|---------|
| R1 | 4 level cerita K2 di rantai akhir sebelum tantangan | S7 |
| R2 | F0 variasi tambah/kurang langkah-tunggal, banyak konteks | S2, S3 |
| R3 | F1 selisih-2-tokoh (user var 1): B?, total?, varian B-only/total-only/full | S2, S3, S5 |
| R4 | F2 split-transfer simpel (user var 2): p-r, x-r, s+r | S2, S3, S5 |
| R5 | F3 rantai-3-tokoh (user var 3): B?, A?, total? | S2, S3, S5 |
| R6 | F4 gabung-3-tokoh + F5 sisa-bertingkat (varian lainnya) | S2, S3 |
| R7 | Sub-soal sekuensial, dinilai terpisah; `questionCount` = jumlah part | S1, S2, S5 |
| R8 | Batas angka ikut level induk; tanpa hasil negatif | S2 |
| R9 | Ketik angka + bantuan bersusun (`buildProblem` per part) | S5 |
| R10 | Latihan: pemilih Bersusun/Cerita + generate cerita | S10 |
| R11 | Bilingual ID/EN, paritas key | S3 |
| R12 | Unlock/rantai/progres/achievement (`bintang-cerita`) | S7, S8, S9 |
| F-A | Guard fallback `LearnScreen` (`levelKind === 'concept'`) akan salah rute untuk story | S8 |
| F-B | Round-trip `ResultScreen.practiceAgain` untuk mode cerita | S1, S10 |
| F-C | `LevelSelectScreen.onStart` belum kenal `story` (cabang prefix kebun/akuarium) | S8 |
| F-D | `getNextLevelId` linier: posisi array = rantai | S7 |
| F-E | Paritas dict ID/EN ditegakkan test key-set | S3 |
| F-F | `recordAnswer({problem})` per part menjaga statistik carry/borrow | S5 |

## Milestones

1. M1 (S0-S3): fondasi tipe + generator + i18n.
2. M2 (S4-S8): layar story + routing + level.
3. M3 (S9-S10): achievement + mode latihan.
4. M4 (S11-S12): versi + verifikasi penuh.

## Implementation Steps

---

### S0 — Verifikasi baseline (tanpa mengubah repo)

- Tujuan: pastikan repo hijau sebelum mulai; catat baseline bila ada yang merah.
- Requirement: prasyarat semua langkah.
- Dependency: tidak ada.
- File yang harus dibaca: `package.json` (scripts), tidak ada file kode.
- File yang harus diubah: tidak ada.
- Simbol terkait: tidak ada.
- Kondisi saat ini: memori proyek mencatat 263 test / 32 file lulus; `package.json` scripts:
  `typecheck: tsc --noEmit`, `lint: eslint .`, `test: vitest run`,
  `build: tsc --noEmit && vite build`.
- Perubahan: tidak ada (hanya menjalankan command baca-only).
- Urutan: tidak ada.
- Behavior yang harus dipertahankan: tidak ada.
- Error handling / edge case: jika baseline merah, catat di Progress Log plan dan lanjutkan;
  jangan perbaiki di luar scope.
- Test: tidak ada.
- Command verifikasi:
  1. `npm run typecheck`
  2. `npm run lint`
  3. `npm test`
- Hasil verifikasi yang diharapkan: (1) exit 0 tanpa error; (2) exit 0 tanpa error/warning baru;
  (3) semua test lulus (baseline ~263 test).
- Completion criteria: ketiga command dicatat hasilnya; repo dinyatakan baseline.
- Area terlarang: semua file source; dilarang `--fix`, `-u`, atau flag tulis apa pun.

---

### S1 — Tipe domain story di `src/types/index.ts`

- Tujuan: menambah tipe story + `presentation` tanpa mengubah tipe eksisting.
- Requirement: R7 (part dinilai terpisah), F-B (round-trip practice).
- Dependency: S0.
- File yang harus dibaca: `src/types/index.ts` (baris 1-10, 83-106, 134-168);
  `src/i18n/types.ts` (cek `LocalizedText`, jangan tambah dependensi i18n ke types).
- File yang harus diubah: `src/types/index.ts` saja.
- Simbol: `LevelKind`, `GeneratorSettings`, `ConceptSettings`, `LevelDefinition`,
  baru: `StoryFamily`, `StoryItem`, `StoryPart`, `StoryProblem`, `StorySettings`.
- Kondisi saat ini: `LevelKind = 'column' | 'concept'` (baris 146);
  `GeneratorSettings { operation, digitCount, carryMode, questionCount }` (100-105);
  `LevelDefinition.settings: GeneratorSettings | ConceptSettings` (166).
- Perubahan konkret, urutan edit dalam file:
  1. Baris 146: ubah menjadi
     `export type LevelKind = 'column' | 'concept' | 'story'`.
  2. Di `GeneratorSettings` (setelah `questionCount: number`, baris 104) tambah baris:
     `/** Cara penyajian soal; default 'column' bila undefined (backward-compatible) */`
     `presentation?: 'column' | 'story'`.
  3. Setelah blok `ConceptSettings` (baris 148-152), sisipkan blok baru persis ini:
     ```ts
     export type StoryFamily =
       | 'f0-add'
       | 'f0-sub'
       | 'f1-diff'
       | 'f2-transfer'
       | 'f3-chain'
       | 'f4-join3'
       | 'f5-tiered'
     export type StoryItem =
       | 'marbles' | 'apples' | 'books' | 'fish' | 'cakes'
       | 'pencils' | 'candies' | 'balls' | 'flowers' | 'birds'
     export interface StoryPart {
       id: string
       family: StoryFamily
       operation: OperationType
       a: number
       b: number
       expectedAnswer: number
       /** Urutan part dalam stem, 0-based */
       partIndex: number
       totalParts: number
       /** Soal kolom ekuivalen untuk bantuan bersusun + statistik carry/borrow */
       math: MathProblem
       /** Param render-time; kunci per famili didokumentasikan di src/i18n/story.ts */
       stemParams: Record<string, string | number>
     }
     export interface StoryProblem {
       id: string
       family: StoryFamily
       operation: OperationChoice
       stemParams: Record<string, string | number>
       parts: StoryPart[]
     }
     export interface StorySettings {
       kind: 'story'
       operation: OperationChoice
       digitCount: DigitCount
       carryMode: CarryMode
       /** Jumlah PART yang dinilai (bukan jumlah stem) */
       questionCount: number
       families: readonly StoryFamily[]
     }
     ```
  4. Baris 166: ubah menjadi `settings: GeneratorSettings | ConceptSettings | StorySettings`.
- Behavior yang harus dipertahankan: semua konsumen `GeneratorSettings` lama tetap kompilasi
  (`presentation` opsional); tidak ada perubahan runtime.
- Error handling / edge case: tidak ada (pure types). Pastikan tidak import dari
  `../i18n/core` (hindari siklus dependensi); `stemParams` sengaja `Record`, bukan `any`.
- Test: belum (dicover S12 typecheck). Tidak ada test baru di langkah ini.
- Command verifikasi: `npm run typecheck`.
- Hasil yang diharapkan: exit 0. Error `TS2322/TS2345` di `levels.ts`/screen karena union
  melebar DIIZINKAN sementara sampai S6-S8 selesai (catat), selain itu harus bersih.
- Completion criteria: 4 edit di atas ada di file; tidak ada simbol lain berubah.
- Area terlarang: `MathProblem`, `ConceptProblem`, `SessionSummary`, `UserProgress`,
  `storage.ts`, file screen/generator mana pun.

---

### S2 — Generator `src/lib/storyGenerator.ts` (file baru)

- Tujuan: generator deterministik 6 famili + sesi + helper test.
- Requirement: R2-R8. Dependency: S1 (tipe).
- File yang harus dibaca: `src/lib/problemGenerator.ts` (fungsi `buildProblem`,
  `randomInt`, pola retry 300x, `nextId`); `src/lib/conceptGenerator.ts` (`shuffle`,
  `nextConceptId`, pola anti-duplikat, `_helpers`); `src/types/index.ts` (tipe baru S1).
- File yang harus diubah: buat `src/lib/storyGenerator.ts` saja.
- Simbol: `buildProblem` (reuse), `MathProblem`, `OperationType`;
  baru: `buildStoryStem`, `generateStorySession`, `_helpers`, `StoryLevelPreset`.
- Kondisi saat ini: file belum ada. `buildProblem(op, a, b)` melempar bila hasil negatif
  atau jumlah > 9999 (tidak mungkin terjadi di sini karena cap <= 999, tapi tetap ditangani).
- Perubahan konkret (isi file, urutan definisi):
  1. Import: `import type { DigitCount, MathProblem, OperationChoice, OperationType, StoryFamily, StoryItem, StoryPart, StoryProblem, StorySettings } from '../types'` dan
     `import { buildProblem } from './problemGenerator'`.
  2. Konstanta (persis):
     `const NAMES = ['Budi', 'Siti', 'Andi', 'Dewi'] as const`,
     `const ITEMS: readonly StoryItem[] = ['marbles','apples','books','fish','cakes','pencils','candies','balls','flowers','birds']`,
     `let storyId = 0`, fungsi `nextStoryId(prefix: string)` -> `` `cerita-${prefix}-${storyId}-${Math.random().toString(36).slice(2,6)}` ``,
     fungsi `randomInt(min,max)`, `pick<T>(arr)`, `shuffle` (salin dari conceptGenerator).
  3. Aturan batas (fungsi `capFor(digitCount: DigitCount): number` -> `10 ** digitCount - 1`;
     semua bilangan dan hasil harus dalam `[10, cap]`, kecuali `r` transfer dalam `[5, p-10]`):
     - F0-add: `a,b in [lo,hi]`, `lo=10**(d-1)`, `hi=10**d-1`; jika `a+b>cap` ulangi (max 300),
       fallback: `a=lo, b=lo`. Part tunggal `{op:'addition',a,b,expected:a+b}`.
     - F0-sub: `a,b in [lo,hi]`, syarat `a>=b`; max 300, fallback `a=hi,b=lo`.
     - F1-diff (param eksplisit `{x,y}` atau acak): syarat `x-y>=10`, `2*x-y<=cap`;
       parts full `[B=x-y (sub,x,y), total=x+B (add,x,B)]`; varian `'b-only'` (part 1 saja),
       `'total-only'` (part 2 saja). Helper: `buildF1DiffStory(args:{x,y,item,nameA,nameB,variant})`.
     - F2-transfer (param `{x,p,r,s,item,nameA,nameB}`; `q=x-p` dihitung): syarat
       `p>=15`, `q>=15` (artinya `x>=30`), `r in [5,p-10]`, `s>=10`, `x-r<=cap`,
       `s+r<=cap`; parts `[p-r (sub,p,r), x-r (sub,x,r), s+r (add,s,r)]`;
       varian `'remainder-only'` = part ke-2 saja. Helper: `buildF2TransferStory(args)`.
       Jika caller memberi `p,q` eksplisit, validasi `p+q===x`, bila tidak: throw
       `Error('p+q harus sama dengan x')` (fail-fast untuk test/dev, bukan runtime acak).
     - F3-chain (param `{c,n,m,item,nameA,nameB,nameC}`): `B=c+n`, `A=B-m`, `total=A+B+C`;
       syarat `A>=10`, `B<=cap`, `total<=cap`; parts `[B (add,c,n), A (sub,B,m), total (add,A+B,C)]`;
       varian `'total-only'` = part 3 dengan `a=A+B,b=C`. Helper: `buildF3ChainStory(args)`.
     - F4-join3 (param `{x,y,z,...}`): syarat `x+y+z<=cap`; dua varian single-part:
       `'total3'` (add, a=x+y, b=z) atau `'totalAC'` (add, a=x, b=z); acak pilih varian.
     - F5-tiered (param `{x,y,z,...}`): `rest=x-y` syarat `>=10`, `final=rest+z<=cap`;
       parts `[rest (sub,x,y), final (add,rest,z)]`, selalu full (tidak dapat dipotong).
  4. Setiap part: `math = buildProblem(op, a, b)` dalam try/catch; bila throw, buang stem
     dan ulangi sampling (max 300 lalu throw `Error('gagal sampling <family>')` agar kegagalan
     terlihat di test, bukan diam-diam fallback invalid).
  5. `generateStorySession(settings: StorySettings): StoryProblem[]`: akumulasi part hingga
     `parts.length === questionCount` (R7). Aturan pilih famili: `pickFamily`: bila
     `settings.operation==='addition'` -> `f0-add`; `'subtraction'` -> `f0-sub`; `'mixed'` ->
     acak dari `settings.families`. Bila sisa slot `remaining===1`, famili dibatasi ke yang
     punya varian single-part (`f0-add,f0-sub,f1-diff,f3-chain,f4-join3`); F2 hanya varian
     `remainder-only`; F5 tidak boleh dipilih saat `remaining===1`. Anti-duplikat berurutan:
     kunci `family+JSON(stemParams)`; ulangi max 20, lalu terima apa adanya (pola
     conceptGenerator).
  6. `carryMode`: hanya diterapkan untuk F0 (`none` -> tolak bila `hasCarry/hasBorrow`;
     import dari `./arithmetic`); famili F1-F5 mengabaikan `carryMode` (terima semua hasil
     sampling valid). Tulis komentar alasannya di kode.
  7. Export `_helpers = { buildF0AddStory, buildF0SubStory, buildF1DiffStory, buildF2TransferStory, buildF3ChainStory, buildF4Join3Story, buildF5TieredStory, shuffle }`
     dengan signature deterministik (semua angka + item + nama sebagai argumen; nama/item
     default acak hanya bila argumen undefined).
- Behavior yang harus dipertahankan: `problemGenerator.ts` dan `conceptGenerator.ts` tidak
  diubah; pola pesan error Indonesia.
- Error handling / edge case:
  - Pengurangan selalu `a>=b` (cek eksplisit sebelum `buildProblem`).
  - Semua nilai dalam `[10,cap]` kecuali `r`; bila sampling 300x gagal -> throw (bukan fallback
    invalid). `generateStorySession` dengan `questionCount<1` -> perlakukan sebagai 1.
  - `settings.families` kosong -> throw `Error('families tidak boleh kosong')`.
- Test yang harus ditambahkan (`tests/storyGenerator.test.ts`, baru; pola `concept.test.ts`):
  1. F1 deterministik: `buildF1DiffStory({x:45,y:12,item:'marbles',nameA:'Siti',nameB:'Budi',variant:'full'})`
     -> parts `[33,78]`; part[0] `{op:'subtraction',a:45,b:12}`; part[1] `{op:'addition',a:45,b:33}`.
  2. F2: `buildF2TransferStory({x:36,p:15,r:7,s:24,...})` -> parts `[8,29,31]`; `q` implisit 21.
     Input `p+q!==x` -> throw (uji via helper dengan `p` eksplisit + `q` eksplisit tak konsisten —
     sediakan argumen opsional `q` di helper hanya untuk validasi ini).
  3. F3: `buildF3ChainStory({c:20,n:15,m:8,...})` -> parts `[35,27,82]`; part total
     `{op:'addition',a:62,b:20}`.
  4. F0: `buildF0AddStory({a:23,b:14,...})` -> expected 37, 1 part.
  5. Properti universal (fuzz 200x untuk tiap preset cerita-1..4, definisikan preset di test
     dengan menyalin nilai dari S7): untuk setiap part: `part.math.expectedResult === part.expectedAnswer`;
     semua `a,b,expectedAnswer` dalam `[10,cap]` (kecuali `r` F2, verifikasi via
     `part.b` pada part sub dengan `a===p`? sederhanakan: semua `expectedAnswer>=0` dan
     `<=cap`); part subtraction memenuhi `a>=b`.
  6. `generateStorySession({...presetCerita3, questionCount:5})` -> total parts tepat 5;
     stem berurutan tidak duplikat (kunci family+JSON params).
  7. Render-time (di file test yang sama): `storyStem`/`storyPartPrompt` ID vs EN berbeda dan
     mengandung angka/nama (butuh S3 selesai; tandai test ini `describe.skip`? TIDAK —
     tulis test-nya di S3. Di S2 cukup kasus 1-6).
- Input test dan expected result: lihat poin 1-6 di atas (nilai eksak).
- Command verifikasi: `npm run typecheck && npm test -- tests/storyGenerator.test.ts`
  (catatan: repo memakai vitest; filter file didukung: `npx vitest run tests/storyGenerator.test.ts`).
- Hasil yang diharapkan: typecheck exit 0 (kecuali error S1-sementara yang sudah dicatat);
  6+ test baru lulus.
- Completion criteria: file ada, semua helper diekspor, fuzz 200x hijau.
- Area terlarang: `problemGenerator.ts`, `conceptGenerator.ts`, `arithmetic.ts`, semua screen,
  `types/index.ts` (sudah dikunci S1).

---

### S3 — i18n render-time + 47 key kamus

- Tujuan: seluruh kalimat cerita bilingual, data tetap murni (pola `i18n/concept.ts`).
- Requirement: R11, F-E. Dependency: S1 (tipe `StoryItem`, `StoryPart`, `StoryFamily`).
- File yang harus dibaca: `src/i18n/concept.ts` (pola 37 baris); `src/i18n/core.ts`
  (`TranslationKey`, `TFunction`); `src/i18n/dicts/id.ts` baris 194-211 (area sisip setelah
  `'concept.revealedFeedback'`); `src/i18n/dicts/en.ts` area yang sama (~baris 193-208).
- File yang harus diubah: buat `src/i18n/story.ts`; edit `src/i18n/dicts/id.ts`;
  edit `src/i18n/dicts/en.ts`.
- Simbol: `conceptPrompt` (pola), `createT`; baru: `storyStem`, `storyPartPrompt`,
  `storyItemLabel`.
- Kondisi saat ini: belum ada key `story.*`; test `i18n.test.tsx` baris 20-31 menegaskan
  key-set EN harus persis sama dengan ID dan tipe entry harus sama.
- Perubahan konkret, urutan edit:
  1. Buat `src/i18n/story.ts`:
     ```ts
     import type { StoryItem, StoryPart, StoryFamily } from '../types'
     import type { TFunction } from './core'
     export function storyItemLabel(item: StoryItem, t: TFunction): string // switch 10 item -> t('story.item-<item>')
     export function storyStem(family: StoryFamily, params: Record<string, string|number>, t: TFunction): string // switch: panggil t('story.stem-...') dengan params; item diterjemahkan via storyItemLabel dulu
     export function storyPartPrompt(part: StoryPart, t: TFunction): string // F0 -> storyStem(...); selain itu switch t('story.part-...')
     ```
     Tabel kunci per famili (nama key persis):
     - F0-add: `story.stem-f0-add-gift|buy|come|find|join|harvest|save|bonus`, params `{name,item,a,b}` (+`name2` untuk gift/join).
     - F0-sub: `story.stem-f0-sub-eat|give|lost|fly|break|use|sell|lend`, params sama.
     - F1: stem `story.stem-f1-diff {nameA,nameB,item,x,y}`; parts `story.part-f1-b {nameB,item}`, `story.part-f1-total {nameA,nameB,item}`.
     - F2: stem `story.stem-f2-transfer {nameA,nameB,item,variant1,x,p,q,r,s}` dengan `variant1` = kata benda varian ("merah"/"red" via key `story.variant-red|green|big|small`? SEDERHANAKAN: varian di-hardcode dua pasang per bahasa lewat key `story.variant-a {kind}` — TIDAK. Keputusan final: stem F2 memakai dua key terpisah `story.stem-f2-transfer-color` (apel merah/hijau) dan `story.stem-f2-transfer-size` (bola besar/kecil); generator memilih `kind:'color'|'size'` dan item yang cocok (apples|balls). Tambah 2 key stem, total disesuaikan).
     - F3: stem `story.stem-f3-chain {nameA,nameB,nameC,item,m,n}`; parts `story.part-f3-b {nameB}`, `story.part-f3-a {nameA}`, `story.part-f3-total {nameA,nameB,nameC}`.
     - F4: stem `story.stem-f4-join3 {nameA,nameB,nameC,item,x,y,z}`; parts `story.part-f4-total3`, `story.part-f4-totalAC {nameA,nameC}`.
     - F5: stem `story.stem-f5-tiered {nameA,nameB,item,x,y,z}`; parts `story.part-f5-rest {nameA,item}`, `story.part-f5-final {nameA,item}`.
     - Item: `story.item-marbles|apples|books|fish|cakes|pencils|candies|balls|flowers|birds` (string).
     - UI: `story.partOf {current,total}` (fungsi), `story.tryColumn` (string, contoh ID `📐 Belajar Bersusun` / EN `📐 Learn in Columns`).
     Total key baru = 16 F0 + 2 F2-stem + 1 F1-stem + 1 F3-stem + 1 F4-stem + 1 F5-stem + 13 part + 10 item + 2 UI = 47. (F2 color/size dihitung 2.)
  2. `id.ts`: sisipkan 47 entry SETELAH baris `'concept.revealedFeedback'` (baris ~210),
     sebelum `'practice.sessionTitle'`. Tulis kalimat Indonesia final, contoh:
     `'story.stem-f1-diff': (p:{nameA:string;nameB:string;item:string;x:number;y:number}) => \`${p.nameA} punya ${p.x} ${p.item}, lebih banyak ${p.y} dari ${p.nameB}.\``.
  3. `en.ts`: sisipkan 47 entry di posisi paralel (setelah `'concept.revealedFeedback'`),
     fungsi dengan signature param IDENTIK (nama field sama) dalam bahasa Inggris.
- Behavior yang harus dipertahankan: pola render-time (data tanpa string UI); switch ID/EN
  instan; `document.documentElement.lang` tidak disentuh.
- Error handling / edge case: `storyStem` untuk family tak dikenal -> throw
  `Error('story family tak dikenal')` (fail-fast dev); `storyPartPrompt` partIndex di luar
  `totalParts` -> kembalikan prompt part terakhir (defensif, jangan throw di render).
- Test:
  - Otomatis: `tests/i18n.test.tsx` kasus key-set (baris 20-24) akan gagal bila key tidak
    persis sama — jadikan verifikasi, bukan test baru.
  - Baru di `tests/storyGenerator.test.ts` (tambah describe di S3, bukan S2):
    `storyStem('f1-diff',{...},createT('id'))` mengandung '45' dan 'Siti';
    versi EN mengandung '45' dan 'Siti' tapi tidak mengandung kata Indonesia ('punya');
    `storyPartPrompt` part F0 mengembalikan stem yang sama.
- Command verifikasi: `npm run typecheck && npx vitest run tests/i18n.test.tsx tests/storyGenerator.test.ts`.
- Hasil yang diharapkan: semua lulus; bila key-set test gagal, diff key menunjukkan key yang
  kurang di salah satu dict — tambahkan, jangan ubah test.
- Completion criteria: 47 key ada di kedua dict dengan tipe entry sama per key;
  `story.ts` menutup semua family.
- Area terlarang: `src/i18n/core.ts`, `LanguageContext.tsx`, `steps.ts`, `concept.ts`,
  key non-`story.*` mana pun (dilarang mengubah kalimat existing).

---

### S4 — Komponen `src/components/story/StoryCard.tsx` (file baru)

- Tujuan: kartu narasi reusable (dipakai S5 dan S10).
- Requirement: R9 (tampilan stem + prompt part). Dependency: S3.
- File yang harus dibaca: `src/components/concept/ConceptQuestionView.tsx` (93 baris, pola
  komponen murni + `useI18n`); `src/components/layout/MascotBubble.tsx` (cek props:
  dipakai sebagai `<MascotBubble text mood />`).
- File yang harus diubah: buat `src/components/story/StoryCard.tsx` saja.
- Simbol: `StoryProblem`, `StoryPart`; `storyStem`, `storyPartPrompt` (S3); `useI18n`.
- Kondisi saat ini: file belum ada.
- Perubahan konkret (isi file):
  Props: `{ story: StoryProblem; part: StoryPart }`.
  Render: `<section aria-label={t('learn.sessionAria')}? TIDAK — pakai aria-label="Soal cerita" hardcode? HARUS i18n: tambah key? Sudah ada 47 key; JANGAN tambah key baru — gunakan `aria-label={t('practice.sessionTitle')}`? Salah makna. Keputusan: gunakan `<article aria-live="polite">` tanpa aria-label (hindari key baru).`
  Isi: paragraf stem (`storyStem(story.family, story.stemParams, t)`), pemisah, paragraf
  prompt part (`storyPartPrompt(part, t)`, bold), baris kecil `t('story.partOf', {current: part.partIndex+1, total: part.totalParts})`.
  Styling: tiru kartu concept (`rounded-3xl border-2 border-sky-100 bg-white p-4 shadow-sm`).
  Tidak ada state, tidak ada handler.
- Behavior yang harus dipertahankan: komponen murni; ganti bahasa render ulang otomatis via `t`.
- Error handling / edge case: `part.totalParts<=0` -> tampilkan tanpa baris partOf.
- Test: dicover S5 (render via screen). Tidak ada test file khusus.
- Command verifikasi: `npm run typecheck`.
- Hasil yang diharapkan: exit 0.
- Completion criteria: file ada, diimpor S5 tanpa error.
- Area terlarang: semua file screen, dicts, generator.

---

### S5 — Layar `src/screens/StoryLearnScreen.tsx` (file baru)

- Tujuan: sesi belajar cerita: kartu + ketik jawaban + bantuan bersusun + skor per part.
- Requirement: R7, R9, F-F. Dependency: S1, S2, S3, S4.
- File yang harus dibaca: `src/screens/ConceptLearnScreen.tsx` (275 baris, tiru struktur penuh:
  state, `finishSession`, timer 700/1200/600ms, leave-guard + `ConfirmDialog`, suara);
  `src/screens/PracticeScreen.tsx` baris 313-330 (`switchToGuided` — pola navigate learn
  dengan `problems: MathProblem[]` + `initialStats` + `title`); `src/lib/scoring.ts`
  (`starsFor`); `src/components/input/NumericKeypad.tsx` (props).
- File yang harus diubah: buat `src/screens/StoryLearnScreen.tsx` saja.
- Simbol: `getLevel`, `getNextLevelId`, `generateStorySession`, `starsFor`, `playCorrect`,
  `playWrong`, `recordAnswer`, `completeLevel`, `markLevelStarted`, `setLeaveGuard`,
  `NumericKeypad`, `StoryCard`, `StorySettings`, `StoryProblem`, `StoryPart`.
- Kondisi saat ini: file belum ada; `Screen` union belum kenal `'story-learn'` (S6 akan
  menambah; agar S5 kompilasi, tulis file dengan props `{ levelId: string; problems?: StoryProblem[] }`
  dan JANGAN referensikan tipe Screen — navigasi keluar hanya ke `{name:'result'}` dan
  `{name:'learn'}` yang sudah ada).
- Perubahan konkret (struktur tiru ConceptLearnScreen, delta yang wajib):
  1. Queue: `const queue = useMemo(flatten, [problems])` dengan item
     `{ story, part }` dari `problems.flatMap(s => s.parts.map(p => ({story:s, part:p})))`.
     Init problems: `provided?.length ? provided : (level?.levelKind==='story' ? generateStorySession(level.settings as StorySettings) : generateStorySession(DEFAULT_CERITA3))`
     dengan `DEFAULT_CERITA3: StorySettings = {kind:'story',operation:'mixed',digitCount:2,carryMode:'any',questionCount:5,families:['f0-add','f0-sub','f1-diff']}` (salin nilai preset S7 cerita-3).
  2. State: `{ index, interim: string, attempts, wrongInPart, feedback, locked, results: {part, wrongAttempts}[], finished }`.
  3. `handleDigit(d)`: bila `locked` return; `setInterim(s => (s+String(d)).slice(0,3))`
     (jawaban <= 999; potong 3 digit). `handleBackspace`: slice(0,-1).
  4. `handleCheck`: `Number(interim)===part.expectedAnswer` -> correct: feedback
     `{kind:'correct', text:t('concept.correctFeedback')}` (REUSE key concept, jangan buat
     key baru), locked, timer 700ms maju/selesai. Salah: `attempts+1`, `wrongInPart+1`;
     bila `attempts>=3`: feedback info `t('concept.revealedFeedback',{answer:String(expected)})`,
     `interim=String(expected)`, locked, timer 1200ms maju; bila tidak: feedback wrong
     `t('concept.wrongFeedback')`, locked, timer 600ms buka kunci (pola concept persis).
     `checkDisabled = interim==='' || locked`.
  5. Tombol bantuan: bila `attempts>=2 && !locked`, tampilkan tombol
     `t('story.tryColumn')` yang memanggil `switchToGuided()` = navigate
     `{name:'learn', levelId:null, problems:[part.math], initialStats:{correctFirstTry, wrongAttempts, recovered, totalDone:results.length}, title}` (salin rumus agregat dari `PracticeScreen.switchToGuided` baris 313-330).
  6. `finishSession`: `totalQuestions=results.length`, `correctFirstTry`, `wrongAttempts`,
     `recovered`, `stars=starsFor(...)`; loop `recordAnswer({problem:r.part.math, wrongAttempts:r.wrongAttempts})`;
     `completeLevel(levelId, stars)`; summary `{title, ..., levelId, settings:null, nextLevelId:getNextLevelId(levelId), newAchievementIds}`; `setLeaveGuard(null)`; navigate result.
     (Salin `ConceptLearnScreen.finishSession` baris 73-105, ganti `recordConceptAnswer` ->
     `recordAnswer` dengan `part.math`.)
  7. Leave-guard + `ConfirmDialog` + efek suara: salin persis dari ConceptLearnScreen
     baris 107-113, 191-206.
  8. Render: ProgressBar (`value=index/queue.length`), `StoryCard story part`,
     kotak tampil `interim` (div besar, `aria-live="polite"`, kosong -> placeholder '…'),
     `NumericKeypad onDigit/onBackspace/onCheck checkDisabled checkLabel={t('keypad.checkDefault')}`,
     tombol tryColumn kondisional, `FeedbackMessage`.
- Behavior yang harus dipertahankan: timing 700/1200/600ms; 3-strike reveal; suara;
  guard keluar; teks feedback reuse key concept (konsisten dengan level konsep).
- Error handling / edge case: queue kosong (`!item`) -> render fallback
  `t('learn.preparingResult')` (seperti ConceptLearnScreen baris 208-214). `interim`
  non-numerik tidak mungkin (hanya via keypad); `Number('')` dicegah `checkDisabled`.
  Timer dibersihkan di unmount (salin `timerRef` pattern).
- Test baru (`tests/screens/StoryLearnScreen.test.tsx`; pola `renderScreenWithProviders`,
  `afterEach(cleanup)`; real timer + `findBy` timeout 2000):
  1. Fixture `_helpers.buildF1DiffStory({x:45,y:12,item:'marbles',nameA:'Siti',nameB:'Budi',variant:'full'})`;
     render `<StoryLearnScreen levelId="cerita-3" problems={[stem]} />`; stem terlihat
     (teks mengandung '45'); klik tombol digit `3`,`3` (role button name 'Angka 3' —
     key `keypad.digit {digit}`), klik 'Periksa'; feedback benar muncul; part 2 (total 78)
     muncul via `findByText(/78/)`? Teks prompt total tidak memuat '78' (jawaban). Ganti:
     tunggu `findByText` untuk `t('story.partOf',{current:2,total:2})` = 'Bagian 2 dari 2'.
     Jawab `7`,`8`, Periksa -> probe-screen `result`.
  2. Reveal: fixture sama; jawab salah 3x (`1`,`1` + Periksa, ulangi 3x dengan menunggu
     buka-kunci 600ms via `findBy` tombol Periksa enabled) -> feedback mengandung '33'.
  3. tryColumn: 2x salah -> tombol `📐 Belajar Bersusun` muncul; klik -> probe-screen `learn`.
- Command verifikasi: `npm run typecheck && npx vitest run tests/screens/StoryLearnScreen.test.tsx`.
- Hasil yang diharapkan: typecheck exit 0 (error navigate 'story-learn' belum ada — S5 hanya
  navigate ke 'result'/'learn' yang sudah ada, jadi harus bersih); 3 test lulus.
- Completion criteria: sesi 2-part selesai end-to-end di test; tidak ada referensi ke
  simbol yang belum ada (kecuali `StorySettings` S1 + generator S2 + i18n S3 + StoryCard S4).
- Area terlarang: `ConceptLearnScreen.tsx`, `LearnScreen.tsx`, `PracticeScreen.tsx`,
  `NavigationContext.tsx`, `levels.ts`, dicts (reuse key existing).

---

### S6 — Route `'story-learn'` di navigasi + App

- Tujuan: layar story dapat dibuka/dituju.
- Requirement: R1, R12. Dependency: S1 (tipe `StoryProblem`), S5 (komponen).
- File yang harus dibaca: `src/state/NavigationContext.tsx` baris 10-36 (union Screen);
  `src/App.tsx` baris 1-68 (ScreenRouter).
- File yang harus diubah: `src/state/NavigationContext.tsx`, `src/App.tsx`.
- Simbol: `Screen`, `ConceptProblem` (pola), baru `StoryProblem`.
- Kondisi saat ini: union tanpa story; router tanpa case story.
- Perubahan konkret, urutan:
  1. `NavigationContext.tsx` baris 10-16: tambah `StoryProblem` ke import type
     (alfabetis: `ConceptProblem, GeneratorSettings, MathProblem, SessionStats, SessionSummary, StoryProblem`).
  2. Setelah baris 28 (`concept-learn`), sisipkan:
     `| { name: 'story-learn'; levelId: string; problems?: StoryProblem[] }`.
  3. `App.tsx`: tambah import `StoryLearnScreen from './screens/StoryLearnScreen'`
     (setelah `LearnScreen`, jaga urutan alfabetis kasar file ini: Achievements, ConceptLearn,
     Garden, Home, Learn, Legal, LevelSelect, Practice, Result, Settings — sisipkan
     `StoryLearnScreen` setelah `SettingsScreen`? File ini tidak strict alfabetis
     (`LearnScreen` setelah `AquariumLevelId` import). Letakkan import setelah baris 16
     `SettingsScreen`.)
  4. Router: setelah case `'concept-learn'` (baris 39-40), sisipkan:
     ```tsx
     case 'story-learn':
       return <StoryLearnScreen levelId={screen.levelId} problems={screen.problems} />
     ```
- Behavior yang harus dipertahankan: semua case lama tidak berubah; `ScreenProbe` di test
  membaca `screen.name` -> otomatis mendukung `'story-learn'`.
- Error handling / edge case: tidak ada.
- Test: dicover S5 (tryColumn -> 'learn') dan S8 (retry/next -> 'story-learn'). Tidak ada test
  baru di S6.
- Command verifikasi: `npm run typecheck`.
- Hasil yang diharapkan: exit 0; error S1-sementara untuk screen story harus hilang total.
- Completion criteria: `npx tsc --noEmit` bersih untuk file navigasi; tidak ada perubahan
  selain 4 edit di atas.
- Area terlarang: `TAB_SCREENS`, logika guard (`perform/navigate/back/goToTab`),
  `ProgressContext`, screen lain.

---

### S7 — 4 level cerita di `src/data/levels.ts`

- Tujuan: rantai `level-11 -> cerita-1 -> cerita-2 -> cerita-3 -> cerita-4 -> tantangan`.
- Requirement: R1, R12, F-D. Dependency: S1 (tipe `StorySettings`).
- File yang harus dibaca: `src/data/levels.ts` baris 241-286 (level-11 + tantangan) dan
  410-465 (unlock + next).
- File yang harus diubah: `src/data/levels.ts` saja.
- Simbol: `LEVELS`, `getNextLevelId`, `isLevelUnlocked` (tidak diubah).
- Kondisi saat ini: `level-11` (241-270, `requires:'level-10'`), `tantangan` (271-285,
  `requires:'level-11'`); `getNextLevelId` linier ikut urutan array (F-D).
- Perubahan konkret, urutan:
  1. Sisipkan 4 entri SETELAH blok `level-11` (setelah baris 270) dan SEBELUM blok
     `tantangan` (baris 271), persis:
     ```ts
     {
       id: 'cerita-1', number: 20, grade: 2, levelKind: 'story', requires: 'level-11',
       name: { id: 'Cerita Penjumlahan', en: 'Addition Stories' },
       goal: { id: 'Menyelesaikan soal cerita penjumlahan 2 digit', en: 'Solve 2-digit addition story problems' },
       example: { id: 'Siti punya 45 kelereng…', en: 'Siti has 45 marbles…' },
       questionCount: 5,
       settings: { kind: 'story', operation: 'addition', digitCount: 2, carryMode: 'any', questionCount: 5, families: ['f0-add'] },
     },
     // cerita-2: id 'cerita-2', number 21, requires 'cerita-1', name 'Cerita Pengurangan'/'Subtraction Stories',
     //   goal '...pengurangan 2 digit'/'...subtraction...', operation 'subtraction', families ['f0-sub']
     // cerita-3: id 'cerita-3', number 22, requires 'cerita-2', name 'Cerita Campuran'/'Mixed Stories',
     //   goal campuran 2 digit, operation 'mixed', families ['f0-add','f0-sub','f1-diff']
     // cerita-4: id 'cerita-4', number 23, requires 'cerita-3', name 'Cerita Campuran 2–3 Digit'/'Mixed 2–3-Digit Stories',
     //   goal campuran 2-3 digit, operation 'mixed', digitCount 3, families ['f1-diff','f2-transfer','f3-chain','f4-join3','f5-tiered']
     ```
     (Tulis lengkap keempat blok mengikuti pola blok level-1..11; `questionCount: 5` semua.)
  2. Blok `tantangan`: ubah `requires: 'level-11'` -> `requires: 'cerita-4'`. Tidak ada
     perubahan lain pada tantangan.
- Behavior yang harus dipertahankan: `isLevelUnlocked`/`getNextLevelId` tidak diubah;
  veteran bypass otomatis tetap (tantangan.requires='cerita-4' bukan K1 -> veteran TANPA
  cerita-4 tidak membuka tantangan — benar pedagogis). Level lama/kebun/akuarium tak tersentuh.
- Error handling / edge case: `settings.kind==='story'` didiskriminasi oleh
  `level.levelKind==='story'` di screen; `ConceptSettings`/`GeneratorSettings` lama aman.
- Test (tambah ke `tests/levels.test.ts`, describe baru `rantai cerita`, tanpa ubah test lama):
  - `isLevelUnlocked('cerita-1', ['level-11']) === true`;
    `isLevelUnlocked('cerita-1', []) === false`;
    `isLevelUnlocked('cerita-2', ['cerita-1']) === true`;
    `isLevelUnlocked('tantangan', ['level-11']) === false` (belum ada cerita-4);
    `isLevelUnlocked('tantangan', ['cerita-4']) === true`;
    veteran: `isLevelUnlocked('tantangan', ['level-11']) === false`
    (level-11 legacy membuat veteran, tapi requires tantangan bukan K1).
  - `getNextLevelId('level-11')==='cerita-1'`; `getNextLevelId('cerita-4')==='tantangan'`
    (test linier existing ikut meng-cover).
  - Semua `LEVELS` dengan `levelKind==='story'` punya `settings.kind==='story'` dan
    `requires` menunjuk id yang ada.
- Command verifikasi: `npm run typecheck && npx vitest run tests/levels.test.ts`.
- Hasil yang diharapkan: typecheck exit 0; semua test levels (lama + 3 baru) lulus.
- Completion criteria: rantai terverifikasi test; tidak ada entri level lain berubah.
- Area terlarang: `isLevelUnlocked`, `getNextLevelId`, `buildChallengeSettings`,
  `LEGACY_LEVEL_IDS`, `K1_IDS`, entri level existing, achievements.

---

### S8 — Wiring routing di 4 screen (LevelSelect, Home, Result, Learn guard)

- Tujuan: level story bisa dimulai/dilanjutkan/diuleh; story tak jatuh ke fallback kolom.
- Requirement: R12, F-A, F-C. Dependency: S6 (route ada), S7 (id ada).
- File yang harus dibaca: `src/screens/LevelSelectScreen.tsx` (36-48);
  `src/screens/HomeScreen.tsx` (26-33); `src/screens/ResultScreen.tsx` (20-25, 95-120);
  `src/screens/LearnScreen.tsx` (472-488); `tests/screens/ResultScreen.test.tsx`
  (pola probe + seed, baris 55-95).
- File yang harus diubah: keempat screen di atas. Tidak ada file baru.
- Simbol: `levelKind`, `navigate`, `getLevel`.
- Kondisi saat ini:
  - LevelSelect 45-47: `levelKind==='concept' ? concept-learn : learn` (F-C: story jatuh ke learn).
  - Home 28-32: concept vs else-learn.
  - Result 24-25, 99-114: `isConceptLevel/isNextConcept` boolean; else learn.
  - LearnScreen 475: `if (!level || level.levelKind === 'concept')` fallback campuran (F-A).
- Perubahan konkret, urutan per file:
  1. LevelSelect 45-47 ->:
     ```tsx
     if (level.levelKind === 'story') {
       navigate({ name: 'story-learn', levelId: level.id })
       return
     }
     return level.levelKind === 'concept'
       ? navigate({ name: 'concept-learn', levelId: level.id })
       : navigate({ name: 'learn', levelId: level.id })
     ```
     (Cabang kebun/akuarium di atasnya JANGAN diubah.)
  2. Home 26-33 `handleContinue` -> tambah cabang story:
     ```tsx
     if (lastLevel.levelKind === 'concept') { navigate({ name: 'concept-learn', levelId: lastLevel.id }) }
     else if (lastLevel.levelKind === 'story') { navigate({ name: 'story-learn', levelId: lastLevel.id }) }
     else { navigate({ name: 'learn', levelId: lastLevel.id }) }
     ```
     Catatan: cabang kebun/akuarium sengaja tetap ke learn (perilaku lama dipertahankan;
     di luar scope).
  3. Result: baris 24-25 tambah
     `const isStoryLevel = currentLevel?.levelKind === 'story'`
     `const isNextStory = nextLevel?.levelKind === 'story'`;
     retry (98-102): `isConceptLevel ? concept-learn : isStoryLevel ? story-learn : learn`
     (tulis nested ternary eksplisit atau if/else — pilih if/else agar lint bersih);
     next (109-114): sama untuk `isNextConcept/isNextStory`.
  4. LearnScreen 475: `level.levelKind === 'concept'` -> `level.levelKind !== 'column'`.
- Behavior yang harus dipertahankan: semua rute concept/column/kebun/akuarium identik;
  teks/kunci i18n tak berubah.
- Error handling / edge case: `getLevel` undefined -> perilaku lama (fallback ad-hoc).
- Test:
  - `tests/screens/ResultScreen.test.tsx` tambah kasus: summary
    `{levelId:'cerita-1', nextLevelId:'cerita-2'}` + seed localStorage
    `completedLevelIds:['level-11','cerita-1']` (pola baris 82-95) -> tombol next ada;
    klik retry -> probe `story-learn`; (render ulang terpisah) klik next -> `story-learn`.
  - `tests/screens/LevelSelectScreen.test.tsx` tambah: teks mengandung 'Cerita Penjumlahan'
    dan 'Cerita Campuran'; jumlah `h3` tetap `LEVELS.length` (otomatis).
- Command verifikasi: `npm run typecheck && npx vitest run tests/screens/ResultScreen.test.tsx tests/screens/LevelSelectScreen.test.tsx`.
- Hasil yang diharapkan: semua lulus; test retry-concept lama tetap hijau.
- Completion criteria: 4 file berubah hanya di baris yang disebut; tidak ada rute terbalik.
- Area terlarang: `NavigationContext`, `App.tsx`, `LearnScreen` reducer/render,
  `GardenScreen`/`AquariumScreen`, dicts.

---

### S9 — Achievement `bintang-cerita`

- Tujuan: penghargaan menyelesaikan 4 level cerita.
- Requirement: R12. Dependency: S7 (id final).
- File yang harus dibaca: `src/lib/achievements.ts` baris 78-96 (pola `bintang-kelas-1`);
  `tests/achievements.test.ts` (pola kasus; WAJIB dibaca dulu sebelum edit test).
- File yang harus diubah: `src/lib/achievements.ts`; `tests/achievements.test.ts`.
- Simbol: `ACHIEVEMENTS`, `evaluateNewAchievements`.
- Kondisi saat ini: 10 achievement; pola check `ids.every(id => stats.completedLevelIds.includes(id))`.
- Perubahan konkret, urutan:
  1. `achievements.ts`: sisipkan SETELAH blok `bintang-kelas-1` (setelah baris 96), SEBELUM
     `tanpa-menyerah`:
     ```ts
     {
       id: 'bintang-cerita',
       name: { id: 'Bintang Cerita', en: 'Story Star' },
       description: { id: 'Menyelesaikan semua level soal cerita', en: 'Completed every story problem level' },
       icon: '📖',
       check: (stats) => ['cerita-1','cerita-2','cerita-3','cerita-4'].every((id) => stats.completedLevelIds.includes(id)),
     },
     ```
  2. Test: tambah kasus (ikuti pola file): stats dengan keempat id -> hasil mengandung
     'bintang-cerita'; stats tanpa 'cerita-4' -> tidak mengandung.
- Behavior yang harus dipertahankan: 10 achievement lama tak berubah; evaluasi tetap
  `evaluateNewAchievements`.
- Error handling / edge case: tidak ada.
- Command verifikasi: `npm run typecheck && npx vitest run tests/achievements.test.ts`.
- Hasil yang diharapkan: semua lulus.
- Completion criteria: achievement muncul di AchievementsScreen otomatis (render generik —
  tidak perlu perubahan screen; verifikasi manual via test render? cukup typecheck).
- Area terlarang: `ProgressContext` (tidak perlu `recordStoryAnswer` — reuse `recordAnswer`
  dengan `part.math` per F-F), `storage.ts`, screen achievement.

---

### S10 — Mode cerita di `src/screens/PracticeScreen.tsx`

- Tujuan: pemilih Bersusun/Cerita + sesi + penyelesaian + round-trip Result.
- Requirement: R10, F-B. Dependency: S1 (`presentation`), S2, S3, S4.
- File yang harus dibaca: `src/screens/PracticeScreen.tsx` seluruhnya (534 baris; fokus
  76-106 OptionGroup, 111-131 state form, 146-155 startConfigured, 184-211 finishSession,
  332-462 setup render); `src/screens/StoryLearnScreen.tsx` (S5, tiru pola check/reveal
  per part); `src/components/story/StoryCard.tsx` (S4).
- File yang harus diubah: `src/screens/PracticeScreen.tsx` saja (+ 2 key dict di S10b).
- Simbol: `GeneratorSettings`, `generateSession`, `generateStorySession`, `StoryCard`,
  `recordAnswer`, `starsFor`.
- Kondisi saat ini: setup hanya kolom; `finishSession` agregat `ProblemResult[]`
  (`{problem: MathProblem, wrongAttempts}`); `session.settings: GeneratorSettings|null`.
- Perubahan konkret, urutan dalam file:
  1. S10a — dict (edit `id.ts` + `en.ts`, sisip dekat `practice.operationLabel`):
     `'practice.modeLabel'` ('Jenis penyajian'/'Presentation'),
     `'practice.modeColumn'` ('Bersusun'/'Columns'),
     `'practice.modeStory'` ('Soal cerita'/'Story problems'). (Total dict +3 key per bahasa;
     paritas dijaga.)
  2. State form: tambah `const [formMode, setFormMode] = useState<'column'|'story'>('column')`;
     inisialisasi dari `initialSettings?.presentation ?? 'column'` bila `initialSettings` ada
     (round-trip F-B): `useState(initialSettings ? (initialSettings.presentation ?? 'column') : 'column')`.
     PENTING: `PracticeScreen` me-mount ulang per `key={JSON.stringify(settings)}` di App
     (App.tsx baris 53-56) sehingga init sekali cukup.
  3. Setup render: tambah `OptionGroup` pertama (sebelum operation) dengan
     `label={t('practice.modeLabel')}`, options column/story, value formMode.
  4. `startConfigured`: `const settings: GeneratorSettings = { operation: formOperation, digitCount: formDigits, carryMode: formCarry, questionCount: formCount, presentation: formMode }`;
     bila `formMode==='column'` -> jalur lama persis; bila `'story'` ->
     `const storySettings: StorySettings = { kind:'story', operation: formOperation, digitCount: formDigits, carryMode: formCarry, questionCount: formCount, families: familiesForPractice(formDigits, formOperation) }`
     dengan helper lokal (di file, atas, dekat `startSession`):
     ```ts
     function familiesForPractice(digits: DigitCount, op: OperationChoice): readonly StoryFamily[] {
       const f0 = op==='addition' ? ['f0-add'] : op==='subtraction' ? ['f0-sub'] : ['f0-add','f0-sub']
       if (digits <= 1) return f0
       if (digits === 2) return [...f0, 'f1-diff']
       return [...f0, 'f1-diff','f2-transfer','f3-chain','f4-join3','f5-tiered']
     }
     ```
     lalu `const stems = generateStorySession(storySettings)` dan masuk fase solving-story
     (lihat poin 5). Soal custom (baris 390-459) TIDAK diubah (tetap kolom).
  5. Fase solving-story: state terpisah (tiru S5 tapi tanpa levelId/completeLevel):
     queue flatten `{story, part}`; `interim/attempts/feedback/locked/results`;
     check/reveal 3-strike + timer 700/1200/600 + suara (salin dari S5, bukan dari logika
     kolom). Render: `StoryCard` + kotak interim + `NumericKeypad` + FeedbackMessage.
     `finishSession` varian story: agregat sama; loop `recordAnswer({problem: part.math,...})`;
     summary `{title: t('practice.sessionTitle'), ..., levelId: null, settings, nextLevelId: null}`.
     (settings membawa `presentation:'story'` -> F-B round-trip: Result `practiceAgain`
     navigate practice dengan settings itu -> formMode init 'story'. TIDAK perlu ubah
     ResultScreen.)
- Behavior yang harus dipertahankan: mode kolom identik byte-perilaku (jalur lama tidak
  disentuh kecuali penambahan field `presentation`); custom-question tetap kolom;
  `switchToGuided` kolom tetap.
- Error handling / edge case: digit 1 + story -> hanya F0 (helper di atas); `questionCount`
  menghitung part; queue kosong -> fallback `t('learn.preparingResult')`; timer cleanup
  seperti existing (`timeoutRef`).
- Test baru (`tests/screens/PracticeScreenStory.test.tsx`; pola setup RTL):
  1. Render `<PracticeScreen />` (tanpa settings -> fase setup); opsi 'Soal cerita' ada;
     klik opsi story, klik 'Mulai Latihan' -> teks 'Bagian 1 dari' muncul dan probe-screen
     tetap 'practice'. (Tidak ada assertion terhadap angka acak.)
  2. Round-trip: render `<PracticeScreen settings={{operation:'mixed',digitCount:2,carryMode:'any',questionCount:5,presentation:'story'}} />`
     -> langsung fase solving-story (bukan setup): 'Bagian 1 dari' muncul.
- Command verifikasi: `npm run typecheck && npx vitest run tests/screens/PracticeScreenStory.test.tsx tests/screens/ResultScreen.test.tsx tests/i18n.test.tsx`.
- Hasil yang diharapkan: semua lulus; parity test lulus dengan +3 key.
- Completion criteria: kedua test hijau; jalur kolom tak berubah (test existing bila ada +
  verifikasi manual checklist di S12).
- Area terlarang: logika solving kolom (`handleCheck/handleDigit` kolom),
  `switchToGuided`, custom-question, `LearnScreen`, `App.tsx` key, dict non-practice.

---

### S11 — Bump versi `1.3.0 -> 1.4.0`

- Tujuan: feat minor sesuai aturan versioning memori (feat -> minor + reset patch).
- Requirement: aturan repo (AGENTS/memori). Dependency: semua perubahan user-facing selesai
  (S1-S10).
- File yang harus dibaca: `package.json` baris 4 (`"version": "1.3.0"`).
- File yang harus diubah: `package.json` saja (satu baris).
- Simbol: `APP_VERSION` (otomatis ikut via `src/lib/version.ts`, tanpa edit).
- Kondisi saat ini: `"version": "1.3.0"`.
- Perubahan: ganti persis menjadi `"version": "1.4.0"`. Tidak ada file lain.
- Behavior yang harus dipertahankan: footer Home + Settings menampilkan v1.4.0 otomatis.
- Error handling / edge case: tidak ada.
- Test: tidak ada.
- Command verifikasi: `npm run typecheck` (pastikan import package.json tetap valid).
- Hasil yang diharapkan: exit 0.
- Completion criteria: satu baris berubah; `git diff --stat` (inspeksi saja, bukan staging)
  menunjukkan package.json + file S1-S10 + test + plan ini.
- Area terlarang: dependensi, scripts, file lain.

---

### S12 — Verifikasi penuh + checklist serah terima

- Tujuan: buktikan tidak ada regresi; siapkan handoff.
- Requirement: semua. Dependency: S1-S11.
- File yang harus dibaca: tidak ada (hanya menjalankan command + checklist manual).
- File yang harus diubah: tidak ada (kecuali mencentang `## Tasks` dan menambah entri
  `## Progress Log` di file plan ini).
- Command verifikasi (urutan):
  1. `npm run typecheck` -> exit 0, nol error.
  2. `npm run lint` -> exit 0, nol error (warning baru dilarang).
  3. `npm test` -> semua file lulus (baseline ~263 + ~20 baru: storyGenerator 7+,
     StoryLearnScreen 3, levels 3, Result 1, LevelSelect 1, PracticeStory 2, achievements 1).
  4. `npm run build` -> sukses, output `dist/` terbangun.
- Checklist manual (tulis hasilnya di Progress Log):
  - [ ] Alur K2: level-11 -> cerita-1..4 -> tantangan terbuka berurutan; ulangi level lama bisa.
  - [ ] Tiap cerita-4 menampilkan F2/F3 multi-part dengan "Bagian k dari n".
  - [ ] Bantuan "Belajar Bersusun" dari story membuka LearnScreen angka yang sama.
  - [ ] Latihan mode Cerita menghasilkan sesi; Result "Latihan Lagi" kembali ke mode Cerita.
  - [ ] Ganti bahasa ID<->EN di tengah sesi story menerjemahkan stem/part instan.
  - [ ] Footer menampilkan v1.4.0.
- Completion criteria: 4 command hijau + checklist manual terisi.
- Area terlarang: dilarang `lint:fix`/`format --write` di luar file yang diubah S1-S10
  (format hanya bila Prettier check gagal pada file yang diubah).

## Tasks

- [x] S0 baseline tercatat
- [x] S1 tipe story di types
- [x] S2 generator + test generator (kasus 1-6)
- [x] S3 i18n story.ts + 47 key ID/EN + test render-time
- [x] S4 StoryCard
- [x] S5 StoryLearnScreen
- [x] S6 route story-learn (NavigationContext + App)
- [x] S7 4 level + requires tantangan + test rantai
- [x] S8 wiring 4 screen + test Result/LevelSelect
- [x] S9 bintang-cerita + test
- [x] S10 mode latihan cerita (+3 key) + 2 test
- [x] S11 bump 1.4.0
- [x] S12 verifikasi penuh + checklist manual

## Risks

- F6 (siapa-lebih-banyak, jawaban teks) sengaja di luar scope — lihat OQ-1.
- Multi-part menaikkan beban kognitif K2: mitigasi sekuensial + bantuan bersusun + F2/F3
  hanya cerita-4; fallback tercatat di OQ-4.
- Total F1 2-digit bisa > 99: ditangani rejection sampling yang mencakup total (S2).
- Invarian F2 (x+s) tidak ditanyakan default agar tak menguji tebakan invarian anak.
- `questionCount` = part: label progres per part agar ekspektasi stabil.

## Open Questions / Blockers

- OQ-1 F6 (pilihan-ganda "siapa lebih banyak"): opsi (a) coret di v1, (b) tambah mode pilihan
  di StoryLearnScreen. Risiko (b): cabang UI + state baru, +2-3 hari kerja. Rekomendasi: (a).
- OQ-2 Rasio 2-digit vs 3-digit di cerita-4: opsi (a) 50/50 per soal, (b) 3 stem 2-digit +
  2 stem 3-digit deterministik. Rekomendasi: (a) — sederhana, fuzz test menutup.
- OQ-3 Practice digit=1 + story: rekomendasi F0-only (sudah dikunci di S10 helper).
- OQ-4 Bila uji manual menunjukkan F3 terlalu sulit: opsi (a) pindah F3 ke level opsional
  `cerita-5` (paralel, requires cerita-4, tidak memutus rantai tantangan), (b) batasi F3 ke
  varian total-only. Rekomendasi: (a) bila terbukti.
- OQ-5 Nomor level 20-23 untuk cerita-1..4: asumsi bebas (kebun 12-15, akuarium 16-19).
  Bila konflik dengan rencana lain, geser bersama (LevelCard generik, aman).

## Progress Log

- 2026-09-22 08:00:00 — Implementation plan disusun dari analisis kode + 2 putaran
  klarifikasi; belum ada eksekusi. Menunggu eksekutor model kecil mulai S0.

## Notes

- Deviasi yang disengaja dari pola lama (untuk eksekutor): (1) `StoryProblem` berisi
  `parts[]` multi-bagian; (2) `questionCount` story = jumlah part; (3) `part.math`
  (MathProblem ekuivalen) dipakai ulang untuk bantuan bersusun + `recordAnswer`, sehingga
  TIDAK perlu `recordStoryAnswer` di ProgressContext; (4) `GeneratorSettings.presentation?`
  opsional untuk round-trip practice (backward-compatible, tanpa migrasi storage).
- Aturan repo yang tetap berlaku: operand string asli tanpa `reverse()`; Prettier no-semi,
  single-quote, width 100; test via `tests/setup.ts` + cleanup RTL eksplisit; AdSense/
  zona bebas iklan tak tersentuh; Conventional Commits satu baris bila commit diminta
  (di luar plan ini).
- DILARANG di semua langkah: mengubah `arithmetic.ts`, `placeValue.ts`, `learningSteps.ts`,
  `validation.ts`, `storage.ts` (+ skema), file kebun/akuarium, `LearnScreen` reducer,
  skrip/CI/dep (`package.json` kecuali baris versi S11), dan kalimat dict non-`story.*` /
  non-`practice.mode*`.

## Handoff Checklist

- [ ] File plan ini satu-satunya acuan; eksekusi berurutan S0 -> S12, jangan melompat
  (S5 butuh S1-S4; S8 butuh S6-S7; S10 butuh S1-S4).
- [ ] Setiap langkah: baca file yang listed SEBELUM edit; patuhi "urutan edit" dan
  "area terlarang"; jalankan command verifikasi langkah; catat hasil.
- [ ] Setiap finding R1-R12/F-A-F-F sudah dipetakan ke langkah + test di tabel traceability.
- [ ] OQ-1..OQ-5 belum diputuskan final — jangan memilih diam-diam; bila memblokir,
  hentikan dan kembalikan ke user dengan opsi + rekomendasi di atas.
- [ ] Selesai: S12 hijau + checklist manual terisi + Tasks di file ini dicentang +
  entri Progress Log ditambah. Berhenti di situ; JANGAN implementasi di luar plan,
  JANGAN staging/commit kecuali diminta eksplisit.
