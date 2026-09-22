# Implementation Plan — Papan R/P/S Sejajar + Ratusan 3-Digit + Fix Periksa (Akuarium & Kebun)

Created: 2026-09-22 20:30:00

## Objective

1. Bilangan bersusun di Akuarium Ikan Ceria dan Kebun Apel Ajaib sejajar vertikal untuk Ratusan (R) – Puluhan (P) – Satuan (S) di semua lebar layar.
2. Dukung soal 3-digit ujung-ke-ujung (generator → papan → visual → input S→P→R → validator → i18n/audio/tutorial) tanpa merusak 8 level 2-digit existing.
3. Perbaiki bug "anak isi nilai lalu klik Periksa tidak terjadi apa-apa" di akuarium (dan cegah duplikatnya di kebun).
4. Unifikasi papan bersusun duplikat menjadi satu komponen bersama. Visual ratusan = **Visual A: peti/rak ungu baru** (dipilih user 2026-09-22).

## Scope

Masuk (hanya file ini yang boleh diubah selama implementasi):
- `src/lib/placeValueMath.ts`, `src/lib/aquariumPlaceValueMath.ts`
- `src/components/math/StackedPlaceValueBoard.tsx` (BARU), `src/components/aquarium/StackedOperationBoard.tsx`, `src/components/garden/StackedOperation.tsx`
- `src/components/aquarium/PlaceValueZones.tsx`, `src/components/garden/PlaceValueBoard.tsx`, `src/components/garden/GardenScene.tsx`, `src/components/garden/HundredsCrate.tsx` (BARU), `src/components/aquarium/AquariumCanvas.tsx`, `src/components/aquarium/AquariumScene3D.tsx`
- `src/components/aquarium/CheerfulAquarium.tsx`, `src/components/garden/MagicAppleGarden.tsx`
- `src/lib/gardenQuestionGenerator.ts`, `src/lib/aquariumQuestionGenerator.ts`, `src/data/levels.ts`
- `src/i18n/dicts/id.ts`, `src/i18n/dicts/en.ts`, `src/components/aquarium/AquariumTutorial.tsx`
- `tests/garden.test.ts`, `tests/aquarium.test.ts`, `tests/verticalProblem.test.tsx` (hanya tambah case, jangan ubah case lama), file test BARU `tests/stackedBoard.test.tsx`, `tests/aquariumCheck.test.tsx`
- `package.json` (hanya field `version`, langkah S9)

Tidak masuk / dilarang diubah:
- `src/components/math/VerticalMathProblem.tsx`, `DigitCell.tsx`, `AnswerCell.tsx`, `CarryCell.tsx`, `BorrowCell.tsx`, `OperatorCell.tsx`, `src/index.css`, `src/lib/problemGenerator.ts`, `src/lib/placeValue.ts`, `src/lib/arithmetic.ts`, `src/lib/learningSteps.ts`, `src/types/index.ts`, `src/i18n/places.ts`, `src/screens/*`, `src/state/*`, `src/lib/*Sound.ts` (hanya boleh dipanggil dengan string baru, tidak boleh ubah API), 8 level existing `kebun-1..4` / `akuarium-1..4`, rantai K1/K2 lain, `vite.config.ts`, workflow CI.

## Findings (semua harus ditangani minimal satu langkah + verifikasi)

| ID | Temuan | Lokasi bukti |
|---|---|---|
| F1 | Papan akuarium tidak sejajar: baris operand-2 punya 3 item (`w-11+w-11+w-8` operator) vs baris lain 2 item; outer `items-center` me-center baris pendek → kolom P geser ±18px | `StackedOperationBoard.tsx:54-105` |
| F2 | Bug identik di papan kebun (duplikat) | `StackedOperation.tsx:54-142` |
| F3 | Papan hardcode 2 kolom (`firstOperandText[0]/slice(-1)`), header `px-2` bukan lebar kolom, jawaban `min-w-11` vs digit `h-11 w-11` | `StackedOperationBoard.tsx:17-28,44-47,60-71,107-132` |
| F4 | Lib matematika throw bila `>99`, validator hanya ones/tens | `placeValueMath.ts:10-15,67-100`, `aquariumPlaceValueMath.ts:10-15,63-95` |
| F5 | State machine hanya `ones\|tens`, fase hanya `enterOnesAnswer/enterTensAnswer`, input 2 kotak | `CheerfulAquarium.tsx:34-41,87-89,365-397`, `MagicAppleGarden.tsx:31-41,87-89,326-360` |
| F6 | Visual hanya 2 zona; `tensPositions`/`onesPositions` tak terbatas (overflow bila puluhan >19 / satuan >19 saat tambah 3-digit) | `PlaceValueZones.tsx:1-41`, `PlaceValueBoard.tsx:1-30`, `GardenScene.tsx:15-88`, `AquariumScene3D.tsx:15-52`, `AquariumCanvas.tsx:7-14` |
| F7 | Generator + level hanya `digitCount: 2`, tidak ada level 3-digit | `gardenQuestionGenerator.ts:5-23`, `aquariumQuestionGenerator.ts:4-22`, `levels.ts:380-495` |
| F8 | i18n tidak punya kunci ratusan (enter/hint/area/warna/aksi/level5-6) | `dicts/id.ts:355-444`, `dicts/en.ts:353-440` (`en` bertipe `Dict` → tiap kunci ID wajib ada di EN) |
| F9 | Tutorial 4 langkah, tidak menyebut ratusan/peti ungu | `AquariumTutorial.tsx:9-30` |
| F10 | Periksa mati: (H1) `canCheck` blokir `phase==='intro'` tapi `digitsDisabled` hanya `animating\|\|isCompleted` → bisa isi saat intro tapi tombol disabled; (H2) `handleCheck` early-return `if (animating)`; (H3) guard `hasCheckedOnce` benar by-design tapi butuh test | `CheerfulAquarium.tsx:300-341,396-397,494-510`, `MagicAppleGarden.tsx:258-303,355-360,468-475`, `NumericKeypad.tsx:124-136`, `AquariumControls.tsx:49-56`, `GardenControls.tsx:53-60`, `AquariumScreen.tsx:125` (`key={problem.id}` → remount → `phase='intro'`) |
| F11 | Duplikasi papan 2 file (slop) | F1+F2 |

## Konvensi verifikasi (berlaku semua langkah)

- Command yang tersedia (read-only, tidak mengubah repo): `npm run typecheck` (harapkan: 0 error), `npm run lint` (harapkan: 0 error/warning), `npm test` (harapkan: semua file lulus; baseline memori 283 test/34 file — setelah S8 jumlah bertambah, yang penting 0 gagal), `npm run format:check` (harapkan: semua file lulus; bila gagal jalankan `npm run format` lalu ulangi — catat: `format` menulis file, hanya boleh di S9).
- Jangan jalankan `vite dev/build/preview`, `icons`, `lint:fix` di luar S9. Jangan commit apa pun kecuali file plan ini (rencana ini hanya menyusun plan; implementasi oleh model berikutnya dan ia pun dilarang commit kecuali diminta eksplisit).
- Prettier: no semi, single quote, printWidth 100.

---

## S0 — Rekon baseline (read-only, tanpa ubah file apa pun)

- Tujuan: catat kondisi awal agar regresi terdeteksi.
- Menyelesaikan: bukan finding; prasyarat semua langkah.
- Dependency: tidak ada.
- File dibaca: `package.json:1-19`, `src/components/aquarium/StackedOperationBoard.tsx`, `src/components/garden/StackedOperation.tsx`, `src/components/math/VerticalMathProblem.tsx:178-212`, `src/lib/placeValueMath.ts`, `src/lib/aquariumPlaceValueMath.ts`, `src/components/aquarium/CheerfulAquarium.tsx:300-341,396-397`, `src/components/garden/MagicAppleGarden.tsx:258-303,355-360`, `tests/garden.test.ts`, `tests/aquarium.test.ts`.
- File diubah: tidak ada.
- Kondisi saat ini: 8 level 2-digit; papan flex 2-kolom; lib throw `>99`; test hijau (baseline).
- Perubahan: tidak ada. Hanya catat output.
- Behavior dipertahankan: N/A.
- Edge: N/A.
- Test: tidak tambah; jalankan `npm run typecheck`, `npm run lint`, `npm test`; catat angka (diharapkan typecheck/lint bersih, test 0 gagal).
- Completion: tiga output tercatat di log implementasi (boleh di Hrandoff, bukan file repo).

## S1 — Lib kebun generik 3-digit (`placeValueMath.ts`)

- Tujuan: dukung 0..999 + validator per kolom generik tanpa merusak API lama.
- Finding: F4 (kebun).
- Dependency: S0.
- File dibaca: `src/lib/placeValueMath.ts` (seluruhnya, 100 baris), `src/lib/arithmetic.ts` (fungsi `hasCarry/hasBorrow` — hanya dibaca), `tests/garden.test.ts:1-62`.
- File diubah: `src/lib/placeValueMath.ts` saja.
- Simbol: `APPLES_PER_BASKET`, `PlaceSplit`, `splitTensOnes`, `exchangeTenOnesToBasket`, `openBasketToTenApples`, `needsCarry`, `needsBorrow`, `isCorrectOnesAnswer`, `isCorrectTensAnswer`; BARU: `HundredsSplit` (`{hundreds,tens,ones}`), `splitPlaces(value:number):HundredsSplit`, `totalFromHundreds(split):number`, `exchangeTenTensToHundred(tens,hundreds)`, `openHundredToTenTens(hundreds,tens)`, `isCorrectAt(top,bottom,operation,columnIndex,width,given):boolean`.
- Kondisi saat ini: `splitTensOnes` throw jika `!Number.isInteger || <0 || >99`; validator ones/tens pakai rumus satuan/puluhan.
- Perubahan konkret (urutan di file):
  1. Setelah `PlaceSplit`, tambah `export interface HundredsSplit { hundreds:number; tens:number; ones:number }`.
  2. Setelah `splitTensOnes`, tambah `splitPlaces`: throw `Nilai harus 0..999` jika di luar; kembalikan `{hundreds:Math.floor(v/100), tens:Math.floor((v%100)/10), ones:v%10}`.
  3. Setelah `totalFromSplit`, tambah `totalFromHundreds = s.hundreds*100+s.tens*10+s.ones`.
  4. Setelah `openBasketToTenApples`, tambah `exchangeTenTensToHundred` (throw jika `tens<10`; return `{hundreds:hundreds+1,tens:tens-10}`) dan `openHundredToTenTens` (throw jika `hundreds<1`; return `{hundreds:hundreds-1,tens:tens+10}`).
  5. Setelah `isCorrectTensAnswer`, tambah `isCorrectAt`: hitung `expected = Number(String(expectedResult)[columnIndex])` dengan `expectedResult` dari `operation==='addition'? top+bottom : top-bottom`; validasi `width===String(expectedResult).length` tidak wajib (gunakan `padStart` bila perlu); return `given===expected`. Jangan ubah 6 fungsi lama sedikit pun (mereka jadi wrapper konseptual; biarkan implementasinya).
- Pertahankan: semua export lama, pesan error lama persis, `APPLES_PER_BASKET===10`.
- Error/edge: `splitPlaces(0)→{0,0,0}`, `(999)→{9,9,9}`, `(-1)/(1000)/(1.5)` throw; `exchangeTenTensToHundred(9,0)` throw; `openHundredToTenTens(0,5)` throw; `isCorrectAt` untuk soal hasil 4-digit tidak dipakai akuarium/kebun (abaikan; validator papan hanya 2-3 kolom).
- Test: ditambah di S8 (jangan tambah di sini agar langkah atomik; verifikasi langkah ini via typecheck+lint saja + test lama harus tetap hijau).
- Verifikasi: `npm run typecheck` → 0 error; `npm run lint` → bersih; `npm test` → 0 gagal (test lama tidak boleh merah).
- Completion: file berubah hanya tambah (tidak ada baris lama teredit kecuali penambahan setelahnya); `git diff --stat` menunjukkan 1 file.
- Jangan ubah: `aquariumPlaceValueMath.ts`, komponen, generator, i18n.

## S2 — Lib akuarium generik 3-digit (`aquariumPlaceValueMath.ts`)

- Tujuan: cermin S1 untuk akuarium (konstanta `FISH_PER_GROUP`).
- Finding: F4 (akuarium).
- Dependency: S1 (pola sama, file berbeda; boleh paralel setelah S0, tapi disarankan setelah S1 agar konsisten nama).
- File dibaca: `src/lib/aquariumPlaceValueMath.ts` (103 baris), `tests/aquarium.test.ts:1-77`.
- File diubah: `src/lib/aquariumPlaceValueMath.ts` saja.
- Simbol: `FISH_PER_GROUP`, `AquariumSplit`, `splitTensOnes`, `formGroup`, `splitGroup`, `needsCarry`, `needsBorrow`, `isCorrectOnesAnswer`, `isCorrectTensAnswer`, `totalInvariant`, `totalFromSplit`; BARU: `AquariumHundredsSplit`, `splitPlaces`, `totalFromHundreds`, `formHundred(tens,groups)`, `splitHundred(groups,tens)`, `isCorrectAt` (spesifikasi identik S1, hanya pesan error `Nilai harus 0..999` sama).
- Kondisi/perubahan/urutan: identik S1 dengan pemetaan nama (`exchangeTenOnesToBasket→formGroup` sudah ada; yang baru `formHundred(tens,groups)`: throw jika `tens<10`, return `{groups:hundreds+1...}` — PENTING: gunakan shape `{hundreds,tens}` konsisten S1, bukan shape baru; `splitHundred` kebalikannya; `totalFromHundreds` sama rumus).
- Pertahankan: `FISH_PER_GROUP===10`, semua fungsi lama tak tersentuh.
- Edge: sama S1.
- Verifikasi: typecheck 0, lint bersih, test lama hijau.
- Completion: 1 file bertambah-tambah saja.
- Jangan ubah: `placeValueMath.ts` (sudah selesai), komponen, generator.

## S3 — Komponen papan bersama + wrapper (fix F1/F2/F3/F11)

- Tujuan: satu grid N-kolom sejajar; hapus duplikasi logika layout.
- Finding: F1, F2, F3, F11.
- Dependency: S0 (pola dari `VerticalMathProblem.tsx:178-212` + `usePlaceLabels` di `places.ts:17-24`). Tidak tergantung S1/S2.
- File dibaca: `src/components/math/VerticalMathProblem.tsx:42-67,178-212`, `src/components/math/CarryCell.tsx:17-39`, `src/i18n/places.ts`, `src/components/aquarium/StackedOperationBoard.tsx` (135 baris), `src/components/garden/StackedOperation.tsx` (142 baris), `src/index.css:23-26` (`--cell-w`).
- File diubah: BARU `src/components/math/StackedPlaceValueBoard.tsx`; EDIT `src/components/aquarium/StackedOperationBoard.tsx` (jadi wrapper); EDIT `src/components/garden/StackedOperation.tsx` (jadi wrapper).
- Simbol BARU (`StackedPlaceValueBoard.tsx`): `export type StackedColumnId='ones'|'tens'|'hundreds'` (catatan: `PlaceValue` repo memakai `'units'` bukan `'ones'` — komponen ini khusus papan kebun/akuarium sehingga pakai `'ones'`; dokumentasikan di komentar), `export interface StackedBoardProps { problem:MathProblem; answers:(number|null)[]; activeColumn:StackedColumnId|null; carryValues:(number|null)[]; borrowValues:(number|null)[]; highlightColumn:StackedColumnId|null; wrongColumns:boolean[]; tone:'sky'|'emerald'; onSelectColumn:(c:StackedColumnId)=>void }`, `export function columnIdForIndex(index:number,width:number):StackedColumnId` (width2: 0→tens,1→ones; width3: 0→hundreds,1→tens,2→ones; throw di luar itu).
- Kondisi saat ini: flex `items-center`, header `px-2`, jawaban `min-w-11`.
- Perubahan konkret:
  1. Buat `StackedPlaceValueBoard.tsx`: root `role="group"` `aria-label` sama persis pola lama (`Soal ${first} ${op} ${second}, bersusun`, op `+`/`−`); class `math-grid inline-grid gap-x-1` + `style={{gridTemplateColumns:'repeat('+width+', 2.75rem) auto'}}` (pakai `2.75rem` tetap, JANGAN `var(--cell-w)`, agar sel papan kebun/akuarium identik 44px dan tidak terpengaruh perubahan global `--cell-w`); helper `place(col,row)` kembalikan `{gridColumn:String(col+1),gridRow:String(row)}` (wajib string).
     - Row1 label: untuk tiap `problem.columns` render `div` di `place(i,1)` berisi `span` `w-11 text-center text-[0.65rem] font-black uppercase` + warna tone (tens sky-700/emerald-700 sesuai tone; ones amber-700; hundreds violet-700) + highlight `rounded-full ring-2` bila `highlightColumn` cocok; teks label `Puluhan · P` / `Satuan · S` / `Ratusan · R` (hardcode ID sesuai file lama; i18n label panjang tidak dipakai di papan).
     - Row2 carry/borrow: tiap kolom `div place(i,2)` `flex h-6 w-11 items-center justify-center`; jika `carryValues[i]!=null` tampilkan pil violet `h-6 w-6 rounded-full bg-violet-100 ring-2 ring-violet-200 text-xs font-black text-violet-700` berisi digit; else jika `borrowValues[i]!=null` tampilkan pil amber `h-6 w-11 text-[0.65rem]` berisi nilai; else kosong. Kolom satuan (index width-1) untuk addition selalu kosong.
     - Row3/Row4 digit: tiap kolom `div place(i,3|4)` berisi kotak `flex h-11 w-11 items-center justify-center rounded-2xl border-2 text-xl font-black tabular-nums` (tens: sky/emerald-100 bg + text-700 sesuai tone; ones: amber; hundreds: violet-100/violet-700); digit null → `·` slate-300.
     - Operator: `div` di `gridColumn width+1, gridRow 4` berisi `OperatorCell`-inline (jangan import; tulis `div flex h-11 w-8 items-center justify-center text-2xl font-black text-slate-700` + `aria-hidden` + `data-testid="stacked-operator"`).
     - Garis: `div place-span {gridColumn:'1 / span '+width,gridRow:'5'}` class `mb-1 h-1 rounded-full bg-slate-500` (salin VerticalMathProblem, bukan `bg-slate-400` lama — ini perubahan visual disengaja agar konsisten).
     - Row6 jawaban: tiap kolom `button type="button"` di `place(i,6)` class `flex h-11 w-11 items-center justify-center rounded-2xl border-2 text-xl font-black tabular-nums` + state (active `border-sky-500 bg-sky-50 ring-4 ring-sky-200`; wrong `border-amber-400 bg-amber-50`; highlight `border-sky-300 bg-sky-50 ring-2 ring-sky-200`; default `border-slate-200 bg-white`) + `aria-label` pola lama (`Kotak jawaban ${puluhan|satuan|ratusan}, ${value??'kosong'}`) + `data-testid={'stacked-answer-'+columnId}` + `onClick={()=>onSelectColumn(columnId)}`. WAJIB `h-11 w-11` tetap (bukan `min-*`).
     - Kolom operator rows 1,2,3,6: `div aria-hidden` kosong di `gridColumn width+1`.
     - `width = problem.columns.length`; throw jika `<2 || >3` (papan ini hanya 2-3 digit).
  2. `StackedOperationBoard.tsx`: ganti SELURUH isi render menjadi wrapper yang memetakan props lama (`onesAnswer,tensAnswer,activeColumn,carryShown,borrowShown,highlightColumn,onSelectOnes,onSelectTens,wrongOnes,wrongTens`) ke `StackedBoardProps` width-2 (`answers=[tensAnswer,onesAnswer]`, `carryValues=[carryShown?1:null,null]`, `borrowValues=[borrowShown? Number(problem.firstOperandText[0])-1 : null ...]` — salin rumus borrow lama `Number(firstOperandText[0])-1` hanya bila `borrowShown`; hundreds tidak ada → wrapper ini hanya untuk soal 2-digit; bila `problem.columns.length!==2` throw dengan pesan `StackedOperationBoard hanya untuk 2-digit, gunakan StackedPlaceValueBoard`), `tone='sky'`; hapus `answerClass` lama; pertahankan nama props + `export default` agar import lama tidak pecah.
  3. `StackedOperation.tsx`: sama dengan tone `'emerald'`.
- Pertahankan: `role/aria-label` teks, urutan digit asli kiri-ke-kanan (jangan `reverse`), `tabular-nums`, warna per tone, teks `·` untuk kosong.
- Edge: `firstOperandText.length===1` (kolom P null → `·`); `answers.length!==width` → throw; `onSelectColumn` wajib ada (selalu button, bukan div).
- Test: S8 (`tests/stackedBoard.test.tsx`): render `buildProblem('addition',23,22)` → assert `data-testid stacked-answer-ones/tens` ada; assert `parentElement.style grid-column` jawaban-tens `1`, jawaban-ones `2`, operator `3`; assert lingkup 3-digit `buildProblem('addition',245,138)` kolom hundreds di `grid-column: 1`.
- Verifikasi langkah: typecheck 0, lint bersih, test lama hijau.
- Completion: tidak ada lagi `flex-col items-center` + `min-w-11` di kedua wrapper; satu-satunya layout grid ada di file baru.
- Jangan ubah: `VerticalMathProblem.tsx`, `index.css`, lib, screens.

## S4 — Visual 3 zona + cap (fix F6, fondasi Visual A)

- Tujuan: zona R ungu + cegah overflow render ratusan/puluhan besar; API backward-compatible (props baru opsional).
- Finding: F6.
- Dependency: S3 (tidak langsung, tapi kerjakan setelah S3 agar kontrak papan stabil). Tidak tergantung S1/S2.
- File dibaca: `PlaceValueZones.tsx` (41 baris), `PlaceValueBoard.tsx` (30 baris), `GardenScene.tsx` (88 baris), `TensBasket.tsx` (38 baris), `AppleUnit.tsx`, `AquariumCanvas.tsx`, `AquariumScene3D.tsx:15-52`, `TensFishGroup3D.tsx:8-20,52-61`.
- File diubah: `src/components/garden/HundredsCrate.tsx` (BARU); EDIT `PlaceValueZones.tsx`, `PlaceValueBoard.tsx`, `GardenScene.tsx`, `AquariumCanvas.tsx`, `AquariumScene3D.tsx`.
- Kondisi: zona 2 (`grid md:grid-cols-2`), props `{tens,ones,highlight:'tens'|'ones'|null}`; scene render `Array.from({length:tens/ones})` tanpa cap; canvas props tanpa hundreds.
- Perubahan konkret:
  1. `HundredsCrate.tsx` (salin struktur `TensBasket.tsx`): props `{index,onClick,disabled,label,pulse}` sama; class ganti emerald→violet (`border-violet-200 bg-violet-50 hover:bg-violet-100`, pulse `border-violet-500 ring-2 ring-violet-300`, badge `bg-violet-600`, garis `bg-violet-200`); emoji `📦`; badge teks `100`; default aria-label `` `Peti ratusan ${index+1}, berisi 100 apel` ``.
  2. `PlaceValueBoard.tsx`: props tambah `hundreds?:number` (default 0), `highlight` tambah `'hundreds'`; root `flex gap-2` tetap; tambah kartu ketiga di URUTAN PERTAMA (R,P,S kiri-ke-kanan): border violet-100, highlight `border-violet-400 bg-violet-50 ring-4 ring-violet-200`; judul `Ratusan · R` violet-700; nilai `text-2xl font-black tabular-nums`; sub `{hundreds} peti`; bila `hundreds===0 &&` soal 2-digit, kartu tetap dirender tapi dengan `aria-hidden` + `opacity-40`? TIDAK — keputusan: kartu R hanya dirender bila `hundreds>0 || forceHundreds` — tambah prop `showHundreds?:boolean` (default `hundreds>0`); ini menjaga layout 2-digit tidak berubah.
  3. `PlaceValueZones.tsx`: sama dengan Board, tone sky untuk P; kartu R violet; `aria-label` grup tetap; tambah `showHundreds?:boolean`, `hundreds?:number` default 0.
  4. `GardenScene.tsx`: props tambah `hundreds?:number` (0), `showHundreds?:boolean` (0), `highlight` + `'hundreds'`, `onCrateClick?`; root `grid gap-3 md:grid-cols-2` → bila `showHundreds` jadi `md:grid-cols-3`; tambah section ketiga PALING KIRI: `aria-label={t('garden.hundredsArea')}` (key baru, S7; sementara fallback string `'Area Ratusan'` bila key belum ada — gunakan `t('garden.hundredsArea')` langsung dan biarkan typecheck gagal sampai S7? TIDAK BOLEH — agar build hijau antar-langkah, gunakan pola `t('garden.hundredsArea')` HANYA setelah S7; di S4 gunakan literal `'Area Ratusan'` + TODO comment `// S7: ganti ke t('garden.hundredsArea')`; hal sama untuk EN). Isi: header badge `R` violet-600 + `<h3>Area Ratusan</h3>`; kanan `{hundreds} × 100 = {hundreds*100}`; grid `Array.from({length:Math.min(hundreds,9)})` → `HundredsCrate`; bila `hundreds>9` tampilkan `<p>+{hundreds-9} lagi</p>`; `hundreds===0` → `— kosong —`; footer `Ratusan: ungu violet · peti + badge 100`.
  5. `AquariumCanvas.tsx` + `AquariumScene3D.tsx`: props tambah `hundreds?:number` (0), `highlight` + `'hundreds'`; `tensPositions`/`onesPositions` cap: `tens` render `Math.min(tens,19)` (perRow 2 tetap) + bila `tens>19` overlay DOM bukan 3D (3D tidak render teks `+n`; overlay ditangani pemanggil di S5/S6 — di S4 cukup cap + komentar); `ones` render `Math.min(ones,19)`; `hundreds` TIDAK render ikan baru — teruskan ke `TensFishGroup3D` sebagai `label='100'` sebanyak `Math.min(hundreds,4)` di zona kiri atas dengan offset `startX+...`? KEPUTUSAN DETERMINISTIK: render `Math.min(hundreds,4)` buah `TensFishGroup3D` dengan `label="100"` dan ring violet — caranya tambah prop `tone?:'sky'|'violet'` ke `TensFishGroup3D`? DILARANG ubah file itu di langkah ini (tidak ada di daftar). Jadi: di S4, `AquariumScene3D` hanya menerima + mengabaikan `hundreds` untuk render 3D (simpan untuk S5 overlay DOM), tapi TETAP pass-through props agar API stabil + komentar `// S5: overlay DOM peti ungu`. Cap tens/ones wajib di S4.
- Pertahankan: 2-digit render piksel-identik (kartu R tidak muncul bila `showHundreds` false; cap tidak memengaruhi soal 2-digit karena tens/ones ≤18).
- Edge: `hundreds=0 & showHundreds=true` → kartu/section kosong `— kosong —`; `hundreds=12` → 9 crate + `+3 lagi`; `highlight='hundreds'` tanpa show → tidak crash.
- Test: S8 (cap + kartu R). Verifikasi langkah: typecheck, lint, test lama hijau.
- Jangan ubah: `TensFishGroup3D.tsx`, `Fish3D.tsx`, papan (S3), logika jawab (S5/S6).

## S5 — Logika akuarium: ratusan + fix Periksa (F5-aquarium, F10-aquarium)

- Tujuan: input S→P→R 3-digit + Periksa tidak pernah diam.
- Finding: F5 (akuarium), F10 (akuarium H1/H2/H3).
- Dependency: S1? (boleh pakai `isCorrectAt` baru ATAU rumus lama untuk 2-digit — keputusan: gunakan `isCorrectAt` dari `aquariumPlaceValueMath.ts` untuk semua kolom agar 1 jalur; jadi tergantung S2), S3 (papan baru via wrapper? wrapper S3 hanya 2-digit — KEPUTUSAN: di S5 ganti `CheerfulAquarium.tsx` untuk memakai `StackedPlaceValueBoard` langsung, bukan wrapper; wrapper tetap ada untuk kompatibilitas test lama), S4 (props `hundreds/showHundreds`).
- File dibaca: `CheerfulAquarium.tsx` (531 baris, fokus `:34-48,80-99,231-267,300-341,365-439,494-510`), `aquariumPlaceValueMath.ts` (hasil S2), `StackedPlaceValueBoard.tsx` (hasil S3), `PlaceValueZones.tsx` (hasil S4), `AquariumCanvas.tsx` (hasil S4), `NumericKeypad.tsx:69-139`, `AquariumControls.tsx`, `AquariumFeedbackPanel.tsx:1-9` (props `highlightColumn` bertipe `'tens'|'ones'|null` — HARUS diperluas di langkah ini).
- File diubah: `CheerfulAquarium.tsx`, `AquariumFeedbackPanel.tsx` (hanya tipe `highlightColumn` + `'hundreds'`).
- Simbol: `Phase` tambah `'enterHundredsAnswer'`; `activeColumn: 'ones'|'tens'|'hundreds'|null`; state BARU `hundredsAnswer:number|null`, `wrongHundreds:boolean`; helper `width = problem.columns.length` (2|3; throw bila lain), `isThree = width===3`.
- Kondisi: `onesAnswer/tensAnswer`, `activeColumn` ones→tens, `handleDigit` pindah otomatis, `canCheck = ones&&tens&&!animating&&phase!=='completed'&&phase!=='intro'`, `digitsDisabled=animating||isCompleted`, `handleCheck` diam saat intro/disabled.
- Perubahan konkret (urutan dalam `CheerfulAquarium.tsx`):
  1. Type `Phase`: tambah `'enterHundredsAnswer'` setelah `'enterTensAnswer'`.
  2. State: tambah `hundredsAnswer/wrongHundreds`; reset effect (`:120-144`) tambah reset keduanya; `handleReset` (`:343-363`) tambah reset keduanya.
  3. `visual` (opsional, pertahankan 2-variabel bila 2-digit): hitung `topSplit/botSplit` via `splitPlaces` (S2) → `initialHundreds/afterHundreds` dengan rumus carry/borrow berantai sederhana: addition `carry1 = (ones sum>=10)?1:0`, `tensSum = topTens+botTens+carry1`, `carry2 = tensSum>=10?1:0`, `afterHundreds = topHund+botHund+carry2`; subtraction dengan borrow berantai cermin. `visualHundreds` state + reset. (Jika 2-digit, `hundreds` selalu 0 dan `showHundreds=false`.)
  4. `handleDigit`: ones→ (isi, pindah tens, phase `enterTensAnswer` bila dari `enterOnesAnswer`); tens→ (isi, bila `isThree` pindah hundreds + phase `enterHundredsAnswer`, else tetap); hundreds→ isi saja. Selalu `playTap`, clear wrong kolom tsb.
  5. `handleBackspace`: cermin berantai: hundreds terisi → kosongkan; else tens terisi → kosongkan + active tens; else ones → kosongkan + active ones. Bila active hundreds tapi kosong → active tens (jangan hapus tens).
  6. `canCheck = onesAnswer!==null && tensAnswer!==null && (!isThree || hundredsAnswer!==null) && !animating && phase!=='completed' && phase!=='intro' && !tutorialOpen`.
  7. `digitsDisabled = animating || isCompleted || phase==='intro' || tutorialOpen`.
  8. `handleCheck`: (a) `if (animating) return` tetap; (b) BARU: `if (phase==='intro'||tutorialOpen){ setFeedback({kind:'info',text:t('aquarium.startUnit')}); narrate(...); return; }` — tidak boleh diam; (c) bila ada kolom null → feedback `enterOnes/enterTens/enterHundreds` (urutan prioritas ones→tens→hundreds) + highlight kolom itu + return; (d) validasi via `isCorrectAt(top,bottom,op,columnIndex,width,given)` per kolom (kolom index kiri-ke-kanan; ones=width-1); (e) sukses → sama seperti lama + `setPhase('completed')` + `onComplete` 800ms; gagal → set wrong per kolom + `wrongAttempts+1` + feedback `tryAgain + hint kolom pertama yang salah (prioritas ones→tens→hundreds)` + highlight itu. `hasCheckedOnce` tetap (idempoten by-design).
  9. Render: ganti `<StackedOperationBoard .../>` → `<StackedPlaceValueBoard problem answers={[isThree?hundredsAnswer:tensAnswer...]} .../>` — pemetaan eksak: width2 `answers=[tensAnswer,onesAnswer]`, `carryValues=[carryShown?1:null,null]` (carry di atas P saja), `borrowValues=[borrowShown? afterTensValue : null, borrowShown? afterOnesValue : null]`? SEDERHANAKAN deterministik: `carryValues = width2 ? [carryShown?1:null, null] : [carry2?1:null, carry1?1:null, null]`; `borrowValues` tampilkan hanya bila `borrowShown` dengan nilai `after` per kolom (hitung dari langkah 3); `wrongColumns` boolean per kolom; `tone='sky'`; `onSelectColumn` map hundreds→setActive hundreds dst + `playTap`.
  10. `PlaceValueZones` tambah `hundreds={visualHundreds} showHundreds={isThree}`; `AquariumCanvas` tambah `hundreds` sama; overlay DOM peti ungu untuk akuarium: render di bawah canvas `<div data-testid="aquarium-hundreds-overlay">` berisi `{visualHundreds} peti · {visualHundreds*100}` bila `isThree` (violet card, bukan 3D baru).
  11. Teks keypad `activeColumn==='hundreds' ? t('aquarium.enterHundreds') : ...` (key baru S7; agar build hijau bila S7 belum jalan, gunakan pola `(t('aquarium.enterHundreds') as string) || 'Masukkan jawaban ratusan'`? TIDAK — kunci S7 dikerjakan SEBELUM S5? Dependency bilang S5 tidak tergantung S7. RESOLUSI: S5 memakai literal fallback via `const enterHundredsText = 'Masukkan jawaban ratusan'` + TODO `// S7: ganti ke t('aquarium.enterHundreds')`; S7 menggantinya. Hal sama untuk hint/feedback ratusan.)
- Pertahankan: fase/intro/tutorial/timer/narasi/audio (`speak`, `play*`) urutan lama; `onComplete(correctFirstTry,wrongAttempts)` signature; `sr-only` live region (tambah hundreds di teks).
- Edge: soal 2-digit perilaku identik lama (kecuali tidak bisa isi saat intro + ada info saat Periksa-intro); jawaban ratusan single-digit 0-9 (cukup karena per kolom 1 digit); `expectedTens>=10` tidak perlu 2 digit (per kolom sudah 1 digit).
- Test: S8 (`aquariumCheck.test.tsx` + board test). Verifikasi langkah: typecheck, lint, test lama hijau.
- Jangan ubah: file kebun, generator, levels, tutorial, `AquariumScene3D` render 3D.

## S6 — Logika kebun: ratusan + samakan fix Periksa (F5-kebun, F10-kebun)

- Tujuan: cermin S5 untuk kebun (tone emerald, istilah keranjang/apel/peti).
- Finding: F5 (kebun), F10 (kebun).
- Dependency: S1 (wajib, `isCorrectAt` kebun), S3, S4. Kerjakan setelah S5 (pola sama, file berbeda; dilarang copy-paste buta — sesuaikan tone/istilah).
- File dibaca: `MagicAppleGarden.tsx` (`:31-49,82-99,189-226,258-303,326-394,462-497`), `GardenFeedbackPanel` (cek props highlight — bila bertipe `'tens'|'ones'|null`, perluas sama seperti S5 langkah 10), `GardenControls.tsx:53-60`.
- File diubah: `MagicAppleGarden.tsx`, `GardenFeedbackPanel.tsx` (hanya tipe highlight bila perlu).
- Perubahan: identik S5 dengan pemetaan: `tone` papan tidak di sini (papan di S3 wrapper/tone emerald; di S6 ganti ke `StackedPlaceValueBoard tone='emerald'` langsung), visual `visualHundreds` + `PlaceValueBoard hundreds/showHundreds` + `GardenScene hundreds/showHundreds/onCrateClick` (klik peti = info, bukan wajib), fase `GardenPhase` tambah `'enterHundredsAnswer'` (sisipkan di dekat `'enterTensAnswer'`), `handleDigit/Backspace/canCheck/digitsDisabled/handleCheck` rumus sama, istilah `keranjang/peti/apel`, fallback literal `'Masukkan jawaban ratusan'` + TODO S7.
- Pertahankan: `doExchange/doOpen` + durasi 700/50ms, `onComplete` 800ms, guard `hasCheckedOnce`.
- Edge/test/verifikasi: sama S5; test kebun di S8.
- Jangan ubah: file akuarium, generator, levels.

## S7 — Generator + level + i18n + tutorial (F7/F8/F9 + ganti TODO S4-S6)

- Tujuan: 4 level 3-digit baru + semua string baru ID+EN + tutorial R + selesaikan TODO literal.
- Finding: F7, F8, F9 (plus TODO dari S4/S5/S6).
- Dependency: S4/S5/S6 (tahu kunci apa yang dipakai). File independen sehingga bisa disiapkan paralel, tapi COMMIt/terapkan setelah S4-S6 agar tidak ada key yatim.
- File dibaca: `gardenQuestionGenerator.ts`, `aquariumQuestionGenerator.ts`, `levels.ts:375-496,547-553`, `dicts/id.ts:355-444`, `dicts/en.ts:353-440`, `AquariumTutorial.tsx:9-30`, TODO yang ditandai `// S7` di S4/S5/S6.
- File diubah: `gardenQuestionGenerator.ts`, `aquariumQuestionGenerator.ts`, `levels.ts`, `dicts/id.ts`, `dicts/en.ts`, `AquariumTutorial.tsx`, + file S4/S5/S6 HANYA untuk mengganti literal→`t()` (tidak boleh ubah logika lain).
- Perubahan konkret:
  1. `gardenQuestionGenerator.ts`: `GardenLevelId` tambah `'kebun-5'|'kebun-6'`; `gardenSettingsFor` tambah `kebun-5: {operation:'addition',digitCount:3,carryMode:'required',questionCount:1}`, `kebun-6: {operation:'subtraction',digitCount:3,carryMode:'required',questionCount:1}`. (Hanya required-3-digit dulu untuk batasi scope; tanpa-simpan 3-digit dicakup mode latihan umum bila perlu.)
  2. `aquariumQuestionGenerator.ts`: sama untuk `'akuarium-5'/'akuarium-6'`.
  3. `levels.ts`: tambah 4 entry SETELAH `akuarium-4` (jaga `getNextLevelId` linear): `kebun-5 number 20 requires 'akuarium-4'`? KEPUTUSAN: rantai `akuarium-4 → kebun-5 → kebun-6 → akuarium-5 → akuarium-6`, number 20,21,22,23, grade 2, levelKind 'column', questionCount 5, settings cermin generator (digitCount 3). Nama/goal ID+EN memakai key i18n? `levels.ts` memakai literal LocalizedText (bukan `t()`), jadi tulis literal: `kebun-5: {id:'Kebun: Tambah 3-Digit Dengan Simpan 📦', en:'Garden: 3-Digit Add With Carrying 📦'}` goal `{id:'Menjumlahkan 3 digit dengan menyimpan lewat peti ratusan', en:'Add 3-digit numbers with carrying via hundred crates'}`; `kebun-6` kurang-tukar; `akuarium-5/6` analog (`🐠`, `tangki ratusan`). `requires` berantai seperti di atas. JANGAN ubah 8 level lama; JANGAN ubah `LevelSelectScreen.tsx` (prefix `kebun-/akuarium-` sudah generik); JANGAN ubah `HomeScreen.tsx`.
  4. `dicts/id.ts` tambah (setelah blok kebun/akuarium terkait, urutan alfabet tidak wajib — taruh berdekatan): `garden.hundredsArea:'Area Ratusan'`, `garden.hundredsColor:'Ratusan: ungu violet'`, `garden.crateLabel:'Peti ratusan'`, `garden.enterHundreds:'Masukkan jawaban ratusan'`, `garden.hintHundreds:'Periksa lagi jumlah peti di kolom ratusan.'`, `garden.exchangeHundredAction:'Tukarkan 10 keranjang menjadi 1 peti'`, `garden.openHundredAction:'Buka 1 peti menjadi 10 keranjang'`, `garden.tenTensToHundred:'Sepuluh keranjang puluhan dapat ditukar menjadi satu peti ratusan.'`, `garden.countHundreds:'Sekarang hitung kolom ratusan.'`, `garden.successCarryHundred:'Hebat! Sepuluh keranjang sudah menjadi satu peti ratusan.'`; analog `aquarium.*` (`groupLabel→'Kelompok puluhan'` tetap; tambah `hundredsArea/hundredsColor/tankLabel/enterHundreds/hintHundreds/formHundredAction/splitHundredAction/tenGroupsToHundred/countHundreds/successCarryHundred` dengan istilah ikan/kelompok/tangki). `dicts/en.ts` tambah CERMIn 1:1 (tipe `Dict` memaksa; bila kurang 1 key → typecheck merah).
  5. `AquariumTutorial.tsx`: tambah langkah ke-5 `{title:'Seratus = sepuluh puluhan', body:'Sepuluh kelompok puluhan dapat ditukar menjadi satu peti/tangki ratusan ungu bernilai 100.', emoji:'📦'}`; `TUTORIAL_STEPS_COUNT` otomatis ikut (dari `STEPS.length`).
  6. Ganti semua TODO `// S7`: literal → `t('...')` di `GardenScene`, `CheerfulAquarium`, `MagicAppleGarden` (hanya baris itu).
- Pertahankan: `questionCount:5` level; `LevelSelectScreen` tanpa ubah; veteran-bypass `isLevelUnlocked` tanpa ubah.
- Edge: `digitCount:3` generator bisa hasilkan `100..999`; pastikan `firstOperand>=secondOperand` untuk subtraction (sudah dijamin `generateProblem`); hasil ≤9999 (jaminan `buildProblem`).
- Test: S8 (generator 3-digit). Verifikasi: typecheck (pastikan EN lengkap), lint, test lama hijau.
- Jangan ubah: angka/number level lama, `getNextLevelId`, screens, sound API.

## S8 — Test baru + update (verifikasi semua finding)

- Tujuan: setiap finding punya test deterministik; model kecil hanya menjalankan, bukan mendesain.
- Dependency: S1-S7 selesai.
- File dibaca: `tests/garden.test.ts`, `tests/aquarium.test.ts`, `tests/verticalProblem.test.tsx:1-65`, `tests/helpers/renderWithProviders.tsx`, `tests/aquariumLifecycle.test.tsx:59-103`.
- File diubah: EDIT `tests/garden.test.ts` (tambah describe, jangan ubah case lama); EDIT `tests/aquarium.test.ts` (sama); BARU `tests/stackedBoard.test.tsx`; BARU `tests/aquariumCheck.test.tsx`.
- Perubahan konkret:
  1. `tests/garden.test.ts` tambah: `splitPlaces(0)→{0,0,0}`; `(245)→{2,4,5}`; `(999)→{9,9,9}`; throw `(-1),(1000),(1.5)`; `exchangeTenTensToHundred(10,2)→{hundreds:3,tens:0}`; throw bila tens 9; `openHundredToTenTens(2,3)→{1,13}`; throw bila hundreds 0; `isCorrectAt(245,138,'addition',2,3,3)===true` (ones 5+8=13→3), `(…,1,3,8)===true` (tens 4+3+1=8), `(…,0,3,3)===true` (hund 2+1=3); salah satu digit → false. Generator: `generateGardenProblem({levelId:'kebun-5'})` ×20 → `operation addition`, `digitCount 3`, `hasCarry true`, `100..999`; `kebun-6` ×20 → subtraction, `first>=second`, `hasBorrow true`.
  2. `tests/aquarium.test.ts` tambah: cermin no.1 dengan `FISH_PER_GROUP`, `splitPlaces(245)`, `formHundred/splitHundred`, `isCorrectAt(245,138,…)`, generator `akuarium-5/6` ×20 (sama), fixture `buildAquariumFixture('addition',245,138).expectedResult===383`, `('subtraction',432,176)===256`.
  3. `tests/stackedBoard.test.tsx` (BARU): render `<AllProviders><StackedPlaceValueBoard problem={buildProblem('addition',23,22)} answers={[null,null]} .../></AllProviders>` → `getByTestId('stacked-operator')` ada; `parentElement.style` jawaban-tens mengandung `grid-column: 1`, jawaban-ones `grid-column: 2`, operator `grid-column: 3`; render `buildProblem('addition',245,138)` → `stacked-answer-hundreds` `grid-column: 1`; semua kotak jawaban `h-11 w-11` (cek class berisi `h-11` dan `w-11`, tidak ada `min-w-11`).
  4. `tests/aquariumCheck.test.tsx` (BARU, pola `aquariumLifecycle.test.tsx` + `renderScreenWithProviders`): (a) render `CheerfulAquarium` dengan `buildAquariumFixture('addition',23,14)` (tanpa carry) + `currentIndex={1}` (lewati tutorial) → klik digit ones lalu tens via `getByLabelText('Angka X')` → kedua tombol Periksa enabled → klik `getByRole('button',{name:/Periksa/})` (keypad) → harapkan `role="status"` berisi benar ATAU `onComplete` terpanggil (mock fn; gunakan fake timer 800ms bila perlu — deterministik: `vi.useFakeTimers`, `fireEvent.click`, `vi.advanceTimersByTime(900)`); (b) render `currentIndex={0}` (tutorial terbuka) → tanpa klik tutorial, isi digit → tombol Periksa disabled (`toBeDisabled`) — ini regresi H1; (c) klik Periksa saat intro (paksa via prop? bila disabled tidak bisa diklik — uji (b) cukup + uji `handleCheck` intro-info dilakukan manual S9).
- Pertahankan: semua case lama tidak diedit; `tests/setup.ts` tetap dipakai (jangan ubah setup); cleanup RTL eksplisit per file (`afterEach(cleanup)`).
- Verifikasi: `npm test` → 0 gagal; catat jumlah file/test baru.
- Completion: 4 file test berubah/bertambah; tidak ada test lama merah.
- Jangan ubah: file src apa pun di langkah ini.

## S9 — Version bump + format + verifikasi akhir

- Tujuan: patuhi SemVer + pastikan repo bersih.
- Dependency: S1-S8.
- File dibaca: `package.json:1-6`.
- File diubah: `package.json` (hanya `"version": "1.4.0"` → `"1.4.1"`; alasan: `fix` user-facing, bukan feat), file yang diformat ulang oleh `npm run format` bila `format:check` gagal (hanya hasil formatter, tidak boleh ada edit manual lain).
- Perubahan: (1) bump version; (2) `npm run format:check` → bila gagal, `npm run format` sekali lalu `git diff --stat` pastikan hanya file yang disentuh S1-S8 + version; (3) `npm run typecheck`, `npm run lint`, `npm test` final.
- Verifikasi manual (wajib, catat di handoff): buka akuarium soal `23+22` → kolom P/S segaris di 360px + desktop; soal 3-digit `245+138` → R/P/S segaris, isi S→P→R, Periksa benar → reward + lanjut; isi salah → sorot kolom pertama salah; Periksa saat tutorial → muncul info (tidak diam); kebun analog dengan peti ungu.
- Completion: typecheck 0, lint 0, test 0 gagal, `format:check` lulus, diff hanya file scope + version.
- Jangan: commit, staging, push (dilarang; handoff saja).

## Handoff Checklist (untuk model eksekutor)

- [ ] Urutan: S0 → S1 → S2 → S3 → S4 → S5 → S6 → S7 → S8 → S9. Jangan paralelkan langkah yang menyentuh file sama.
- [ ] Setiap langkah: baca file listed SEBELUM edit; edit hanya file listed; simpan pola `aria-label`, `tabular-nums`, `single-quote/no-semi/100`.
- [ ] Setiap langkah berakhir dengan 3 command (typecheck/lint/test) hijau sebelum lanjut.
- [ ] Bila menemukan kontradiksi (mis. `GardenFeedbackPanel` tidak punya prop highlight), STOP, catat sebagai blocker di jawaban (jangan menebak): sertakan file:baris, opsi A/B, risiko, rekomendasi.
- [ ] Open question tersisa (sudah diputuskan default; jangan ubah diam-diam bila ragu): nomor level 20-23 + rantai `akuarium-4→kebun-5→kebun-6→akuarium-5→akuarium-6` (asumsi bebas; alternatif: selipkan 3-digit langsung setelah tiap `-2/-4` — risiko: rantai ganda membingungkan; rekomendasi: pertahankan default).
- [ ] Hasil akhir yang diharapkan: `git status` hanya menunjukkan file scope + `tests/*` baru + `package.json` version; tidak ada file lain.

## Progress Log

- 2026-09-22 20:30:00 — Plan disusun dari analisis + jawaban user (keduanya, perlu ratusan, unifikasi boleh, visual A peti ungu, opsi B langsung 3-digit). Belum ada implementasi.
- 2026-09-22 23:20:00 — S0-S9 selesai. S0: typecheck/lint bersih, test baseline 281 lulus/2 gagal (aquariumLifecycle timeout + PracticeScreenStory getByText ambigu — pre-existing). S1/S2: lib 3-digit + isCorrectAt. S3: StackedPlaceValueBoard grid N-kolom + wrapper 2-digit. S4: HundredsCrate + zona R + cap render 19/9/4. S5/S6: logika S→P→R + fix Periksa (canCheck/digits blokir intro, handleCheck info saat intro, bukan diam). S7: kebun-5/6 + akuarium-5/6 (rantai akuarium-4→kebun-5→kebun-6→akuarium-5→akuarium-6, number 20-23) + 10 kunci i18n ID+EN + tutorial langkah 5. S8: 21 test baru (garden 7, aquarium 8, stackedBoard 3, aquariumCheck 3). S9: version 1.4.1 + prettier file scope. Final: typecheck 0, lint 0, test 303 lulus/1 gagal (PracticeScreenStory pre-existing, sama seperti baseline), format scope lulus. Verifikasi manual browser (360px/desktop, 23+22, 245+138, Periksa saat tutorial) BELUM dilakukan — butuh browser interaktif.

## Notes

- Proporsionalitas standar: aplikasi edukasi kecil — TOGAF/C2M/ODA tidak diberlakukan sebagai ceremony enterprise; hanya dicatat di sini sesuai aturan repo. Tidak ada deviasi skema DB (tidak ada perubahan database).
- Visual Aplicate: ungu/violet konsisten dengan warna carry existing (`CarryCell` violet) sehingga anak mengasosiasikan R dengan "simpanan besar".
