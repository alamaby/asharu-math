import type { GeneratorSettings, LevelDefinition, PracticeRecord } from '../types'

export const LEVELS: readonly LevelDefinition[] = [
  // ---- Kelas 1: konsep (pilihan ganda) ----
  {
    id: 'k1-membilang',
    number: 1,
    grade: 1,
    levelKind: 'concept',
    requires: null,
    name: { id: 'Membilang 1–20', en: 'Counting 1–20' },
    goal: { id: 'Menghitung banyak benda 1 sampai 20', en: 'Count objects from 1 to 20' },
    example: { id: '🍎🍎🍎 = 3', en: '🍎🍎🍎 = 3' },
    questionCount: 5,
    settings: { kind: 'concept', conceptKind: 'counting', questionCount: 5 },
  },
  {
    id: 'k1-banding',
    number: 2,
    grade: 1,
    levelKind: 'concept',
    requires: 'k1-membilang',
    name: { id: 'Banding Bilangan', en: 'Compare Numbers' },
    goal: { id: 'Membandingkan dua bilangan 1–20', en: 'Compare two numbers 1–20' },
    example: { id: '7 vs 12', en: '7 vs 12' },
    questionCount: 5,
    settings: { kind: 'concept', conceptKind: 'compare', questionCount: 5 },
  },
  {
    id: 'k1-nilai-tempat',
    number: 3,
    grade: 1,
    levelKind: 'concept',
    requires: 'k1-banding',
    name: { id: 'Nilai Tempat', en: 'Place Value' },
    goal: { id: 'Menentukan angka satuan dan puluhan', en: 'Identify ones and tens digits' },
    example: { id: '47 → puluhan 4', en: '47 → tens 4' },
    questionCount: 5,
    settings: { kind: 'concept', conceptKind: 'place-value', questionCount: 5 },
  },
  // ---- Kelas 1: hitungan kolom 1–2 digit ----
  {
    id: 'k1-tambah-1-digit',
    number: 4,
    grade: 1,
    levelKind: 'column',
    requires: 'k1-nilai-tempat',
    name: { id: 'Penjumlahan 1 Digit', en: '1-Digit Addition' },
    goal: {
      id: 'Menjumlahkan dua bilangan 1 digit',
      en: 'Add two 1-digit numbers',
    },
    example: { id: '4 + 3', en: '4 + 3' },
    questionCount: 5,
    settings: { operation: 'addition', digitCount: 1, carryMode: 'none', questionCount: 5 },
  },
  {
    id: 'k1-kurang-1-digit',
    number: 5,
    grade: 1,
    levelKind: 'column',
    requires: 'k1-tambah-1-digit',
    name: { id: 'Pengurangan 1 Digit', en: '1-Digit Subtraction' },
    goal: {
      id: 'Mengurangkan dua bilangan 1 digit',
      en: 'Subtract two 1-digit numbers',
    },
    example: { id: '9 - 5', en: '9 - 5' },
    questionCount: 5,
    settings: { operation: 'subtraction', digitCount: 1, carryMode: 'none', questionCount: 5 },
  },
  {
    id: 'k1-campur-1-digit',
    number: 6,
    grade: 1,
    levelKind: 'column',
    requires: 'k1-kurang-1-digit',
    name: { id: 'Campuran 1 Digit', en: 'Mixed 1 Digit' },
    goal: {
      id: 'Berlatih penjumlahan dan pengurangan 1 digit',
      en: 'Practice 1-digit addition and subtraction',
    },
    example: { id: 'campuran', en: 'mixed' },
    questionCount: 5,
    settings: { operation: 'mixed', digitCount: 1, carryMode: 'none', questionCount: 5 },
  },
  {
    id: 'k1-jembatan-2-digit',
    number: 7,
    grade: 1,
    levelKind: 'column',
    requires: 'k1-campur-1-digit',
    name: { id: 'Jembatan 2 Digit', en: '2-Digit Bridge' },
    goal: {
      id: 'Menjumlahkan dan mengurangkan 2 digit tanpa menyimpan atau meminjam',
      en: 'Add and subtract 2-digit numbers without carrying or borrowing',
    },
    example: { id: 'campuran', en: 'mixed' },
    questionCount: 5,
    settings: { operation: 'mixed', digitCount: 2, carryMode: 'none', questionCount: 5 },
  },
  // ---- Kelas 2: bersusun pendek (ID lama dipertahankan) ----
  {
    id: 'level-1',
    number: 1,
    grade: 2,
    levelKind: 'column',
    requires: 'k1-jembatan-2-digit',
    name: { id: 'Penjumlahan 2 Digit Tanpa Menyimpan', en: '2-Digit Addition Without Carrying' },
    goal: {
      id: 'Menjumlahkan dua bilangan 2 digit tanpa perlu menyimpan',
      en: 'Add two 2-digit numbers without carrying',
    },
    example: { id: '23 + 14', en: '23 + 14' },
    questionCount: 5,
    settings: { operation: 'addition', digitCount: 2, carryMode: 'none', questionCount: 5 },
  },
  {
    id: 'level-2',
    number: 2,
    grade: 2,
    levelKind: 'column',
    requires: 'level-1',
    name: { id: 'Penjumlahan 2 Digit dengan Menyimpan', en: '2-Digit Addition With Carrying' },
    goal: {
      id: 'Menjumlahkan dua bilangan 2 digit dengan menyimpan satu kali',
      en: 'Add two 2-digit numbers carrying once',
    },
    example: { id: '26 + 87', en: '26 + 87' },
    questionCount: 5,
    settings: { operation: 'addition', digitCount: 2, carryMode: 'required', questionCount: 5 },
  },
  {
    id: 'level-3',
    number: 3,
    grade: 2,
    levelKind: 'column',
    requires: 'level-2',
    name: { id: 'Pengurangan 2 Digit Tanpa Meminjam', en: '2-Digit Subtraction Without Borrowing' },
    goal: {
      id: 'Mengurangkan dua bilangan 2 digit tanpa perlu meminjam',
      en: 'Subtract two 2-digit numbers without borrowing',
    },
    example: { id: '76 - 24', en: '76 - 24' },
    questionCount: 5,
    settings: { operation: 'subtraction', digitCount: 2, carryMode: 'none', questionCount: 5 },
  },
  {
    id: 'level-4',
    number: 4,
    grade: 2,
    levelKind: 'column',
    requires: 'level-3',
    name: { id: 'Pengurangan 2 Digit dengan Meminjam', en: '2-Digit Subtraction With Borrowing' },
    goal: {
      id: 'Mengurangkan dua bilangan 2 digit dengan meminjam satu kali',
      en: 'Subtract two 2-digit numbers borrowing once',
    },
    example: { id: '52 - 28', en: '52 - 28' },
    questionCount: 5,
    settings: { operation: 'subtraction', digitCount: 2, carryMode: 'required', questionCount: 5 },
  },
  {
    id: 'level-5',
    number: 5,
    grade: 2,
    levelKind: 'column',
    requires: 'level-4',
    name: {
      id: 'Campuran 3 Digit Tanpa Menyimpan/Meminjam',
      en: 'Mixed 3 Digits Without Carrying/Borrowing',
    },
    goal: {
      id: 'Berlatih penjumlahan dan pengurangan 3 digit tanpa menyimpan atau meminjam',
      en: 'Practice 3-digit addition and subtraction without carrying or borrowing',
    },
    example: { id: '345 + 231', en: '345 + 231' },
    questionCount: 5,
    settings: { operation: 'mixed', digitCount: 3, carryMode: 'none', questionCount: 5 },
  },
  {
    id: 'level-6',
    number: 6,
    grade: 2,
    levelKind: 'column',
    requires: 'level-5',
    name: { id: 'Penjumlahan 3 Digit dengan Menyimpan', en: '3-Digit Addition With Carrying' },
    goal: {
      id: 'Menjumlahkan 3 digit dengan menyimpan di satu atau beberapa kolom',
      en: 'Add 3-digit numbers carrying in one or more columns',
    },
    example: { id: '468 + 387', en: '468 + 387' },
    questionCount: 5,
    settings: { operation: 'addition', digitCount: 3, carryMode: 'required', questionCount: 5 },
  },
  {
    id: 'level-7',
    number: 7,
    grade: 2,
    levelKind: 'column',
    requires: 'level-6',
    name: { id: 'Pengurangan 3 Digit dengan Meminjam', en: '3-Digit Subtraction With Borrowing' },
    goal: {
      id: 'Mengurangkan 3 digit dengan meminjam di satu atau beberapa kolom',
      en: 'Subtract 3-digit numbers borrowing in one or more columns',
    },
    example: { id: '523 - 268', en: '523 - 268' },
    questionCount: 5,
    settings: { operation: 'subtraction', digitCount: 3, carryMode: 'required', questionCount: 5 },
  },
  {
    id: 'level-8',
    number: 8,
    grade: 2,
    levelKind: 'column',
    requires: 'level-7',
    name: { id: 'Campuran 3 Digit', en: 'Mixed 3 Digits' },
    goal: {
      id: 'Berlatih penjumlahan dan pengurangan 3 digit bervariasi',
      en: 'Practice varied 3-digit addition and subtraction',
    },
    example: { id: 'campuran', en: 'mixed' },
    questionCount: 5,
    settings: { operation: 'mixed', digitCount: 3, carryMode: 'any', questionCount: 5 },
  },
  {
    id: 'level-9',
    number: 9,
    grade: 2,
    levelKind: 'column',
    requires: 'level-8',
    name: { id: 'Penjumlahan 4 Digit', en: '4-Digit Addition' },
    goal: {
      id: 'Menjumlahkan 4 digit dengan atau tanpa menyimpan',
      en: 'Add 4-digit numbers with or without carrying',
    },
    example: { id: '2345 + 1876', en: '2345 + 1876' },
    questionCount: 5,
    settings: { operation: 'addition', digitCount: 4, carryMode: 'any', questionCount: 5 },
  },
  {
    id: 'level-10',
    number: 10,
    grade: 2,
    levelKind: 'column',
    requires: 'level-9',
    name: { id: 'Pengurangan 4 Digit', en: '4-Digit Subtraction' },
    goal: {
      id: 'Mengurangkan 4 digit dengan atau tanpa meminjam',
      en: 'Subtract 4-digit numbers with or without borrowing',
    },
    example: { id: '5231 - 2867', en: '5231 - 2867' },
    questionCount: 5,
    settings: { operation: 'subtraction', digitCount: 4, carryMode: 'any', questionCount: 5 },
  },
  {
    id: 'level-11',
    number: 11,
    grade: 2,
    levelKind: 'column',
    requires: 'level-10',
    name: { id: 'Campuran 4 Digit', en: 'Mixed 4 Digits' },
    goal: {
      id: 'Berlatih penjumlahan dan pengurangan 4 digit bervariasi',
      en: 'Practice varied 4-digit addition and subtraction',
    },
    example: { id: 'campuran', en: 'mixed' },
    questionCount: 5,
    settings: { operation: 'mixed', digitCount: 4, carryMode: 'any', questionCount: 5 },
  },
  {
    id: 'cerita-1',
    number: 20,
    grade: 2,
    levelKind: 'story',
    requires: 'level-11',
    name: { id: 'Cerita Penjumlahan', en: 'Addition Stories' },
    goal: {
      id: 'Menyelesaikan soal cerita penjumlahan 2 digit',
      en: 'Solve 2-digit addition story problems',
    },
    example: { id: 'Siti punya 45 kelereng...', en: 'Siti has 45 marbles...' },
    questionCount: 5,
    settings: {
      kind: 'story',
      operation: 'addition',
      digitCount: 2,
      carryMode: 'any',
      questionCount: 5,
      families: ['f0-add'],
    },
  },
  {
    id: 'cerita-2',
    number: 21,
    grade: 2,
    levelKind: 'story',
    requires: 'cerita-1',
    name: { id: 'Cerita Pengurangan', en: 'Subtraction Stories' },
    goal: {
      id: 'Menyelesaikan soal cerita pengurangan 2 digit',
      en: 'Solve 2-digit subtraction story problems',
    },
    example: { id: 'Budi punya 56 buku...', en: 'Budi has 56 books...' },
    questionCount: 5,
    settings: {
      kind: 'story',
      operation: 'subtraction',
      digitCount: 2,
      carryMode: 'any',
      questionCount: 5,
      families: ['f0-sub'],
    },
  },
  {
    id: 'cerita-3',
    number: 22,
    grade: 2,
    levelKind: 'story',
    requires: 'cerita-2',
    name: { id: 'Cerita Campuran', en: 'Mixed Stories' },
    goal: {
      id: 'Menyelesaikan soal cerita campuran 2 digit',
      en: 'Solve mixed 2-digit story problems',
    },
    example: { id: 'campuran', en: 'mixed' },
    questionCount: 5,
    settings: {
      kind: 'story',
      operation: 'mixed',
      digitCount: 2,
      carryMode: 'any',
      questionCount: 5,
      families: ['f0-add', 'f0-sub', 'f1-diff'],
    },
  },
  {
    id: 'cerita-4',
    number: 23,
    grade: 2,
    levelKind: 'story',
    requires: 'cerita-3',
    name: { id: 'Cerita Campuran 2–3 Digit', en: 'Mixed 2–3-Digit Stories' },
    goal: {
      id: 'Menyelesaikan soal cerita campuran 2 dan 3 digit',
      en: 'Solve mixed 2 and 3-digit story problems',
    },
    example: { id: 'campuran', en: 'mixed' },
    questionCount: 5,
    settings: {
      kind: 'story',
      operation: 'mixed',
      digitCount: 3,
      carryMode: 'any',
      questionCount: 5,
      families: ['f1-diff', 'f2-transfer', 'f3-chain', 'f4-join3', 'f5-tiered'],
    },
  },
  {
    id: 'tantangan',
    number: null,
    grade: 2,
    levelKind: 'column',
    requires: 'cerita-4',
    name: { id: 'Level Tantangan', en: 'Challenge Level' },
    goal: {
      id: 'Soal campuran 2 sampai 4 digit; kesulitan menyesuaikan performa',
      en: 'Mixed 2 to 4 digit questions; difficulty adapts to performance',
    },
    example: { id: 'kejutan!', en: 'surprise!' },
    questionCount: 10,
    settings: { operation: 'mixed', digitCount: 2, carryMode: 'any', questionCount: 10 },
  },
  // ---- Kebun Apel Ajaib (paralel, tidak memutus rantai bersusun) ----
  {
    id: 'kebun-1',
    number: 12,
    grade: 2,
    levelKind: 'column',
    requires: 'k1-jembatan-2-digit',
    name: { id: 'Kebun: Tambah Tanpa Simpan 🍎', en: 'Garden: Add Without Carrying 🍎' },
    goal: {
      id: 'Menjumlahkan 2 digit tanpa menyimpan lewat kebun apel',
      en: 'Add 2-digit numbers without carrying via the garden',
    },
    example: { id: 'kebun apel', en: 'apple garden' },
    questionCount: 5,
    settings: { operation: 'addition', digitCount: 2, carryMode: 'none', questionCount: 5 },
  },
  {
    id: 'kebun-2',
    number: 13,
    grade: 2,
    levelKind: 'column',
    requires: 'kebun-1',
    name: { id: 'Kebun: Tambah Dengan Simpan 🍎', en: 'Garden: Add With Carrying 🍎' },
    goal: {
      id: 'Menjumlahkan 2 digit dengan menyimpan lewat kebun apel',
      en: 'Add 2-digit numbers with carrying via the garden',
    },
    example: { id: 'kebun apel', en: 'apple garden' },
    questionCount: 5,
    settings: { operation: 'addition', digitCount: 2, carryMode: 'required', questionCount: 5 },
  },
  {
    id: 'kebun-3',
    number: 14,
    grade: 2,
    levelKind: 'column',
    requires: 'kebun-2',
    name: { id: 'Kebun: Kurang Tanpa Tukar 🍎', en: 'Garden: Subtract Without Trading 🍎' },
    goal: {
      id: 'Mengurangkan 2 digit tanpa menukar lewat kebun apel',
      en: 'Subtract 2-digit numbers without trading via the garden',
    },
    example: { id: 'kebun apel', en: 'apple garden' },
    questionCount: 5,
    settings: { operation: 'subtraction', digitCount: 2, carryMode: 'none', questionCount: 5 },
  },
  {
    id: 'kebun-4',
    number: 15,
    grade: 2,
    levelKind: 'column',
    requires: 'kebun-3',
    name: { id: 'Kebun: Kurang Dengan Tukar 🍎', en: 'Garden: Subtract With Trading 🍎' },
    goal: {
      id: 'Mengurangkan 2 digit dengan menukar lewat kebun apel',
      en: 'Subtract 2-digit numbers with trading via the garden',
    },
    example: { id: 'kebun apel', en: 'apple garden' },
    questionCount: 5,
    settings: { operation: 'subtraction', digitCount: 2, carryMode: 'required', questionCount: 5 },
  },
  // ---- Akuarium Ikan Ceria (paralel, 2-digit 4 level, canvas Three.js) ----
  {
    id: 'akuarium-1',
    number: 16,
    grade: 2,
    levelKind: 'column',
    requires: 'k1-jembatan-2-digit',
    name: { id: 'Akuarium: Tambah Tanpa Simpan 🐠', en: 'Aquarium: Add Without Carrying 🐠' },
    goal: {
      id: 'Menjumlahkan 2 digit tanpa menyimpan lewat akuarium',
      en: 'Add 2-digit numbers without carrying via the aquarium',
    },
    example: { id: 'akuarium ikan', en: 'fish aquarium' },
    questionCount: 5,
    settings: { operation: 'addition', digitCount: 2, carryMode: 'none', questionCount: 5 },
  },
  {
    id: 'akuarium-2',
    number: 17,
    grade: 2,
    levelKind: 'column',
    requires: 'akuarium-1',
    name: { id: 'Akuarium: Tambah Dengan Simpan 🐠', en: 'Aquarium: Add With Carrying 🐠' },
    goal: {
      id: 'Menjumlahkan 2 digit dengan menyimpan lewat akuarium',
      en: 'Add 2-digit numbers with carrying via the aquarium',
    },
    example: { id: 'akuarium ikan', en: 'fish aquarium' },
    questionCount: 5,
    settings: { operation: 'addition', digitCount: 2, carryMode: 'required', questionCount: 5 },
  },
  {
    id: 'akuarium-3',
    number: 18,
    grade: 2,
    levelKind: 'column',
    requires: 'akuarium-2',
    name: { id: 'Akuarium: Kurang Tanpa Tukar 🐠', en: 'Aquarium: Subtract Without Trading 🐠' },
    goal: {
      id: 'Mengurangkan 2 digit tanpa menukar lewat akuarium',
      en: 'Subtract 2-digit numbers without trading via the aquarium',
    },
    example: { id: 'akuarium ikan', en: 'fish aquarium' },
    questionCount: 5,
    settings: { operation: 'subtraction', digitCount: 2, carryMode: 'none', questionCount: 5 },
  },
  {
    id: 'akuarium-4',
    number: 19,
    grade: 2,
    levelKind: 'column',
    requires: 'akuarium-3',
    name: { id: 'Akuarium: Kurang Dengan Tukar 🐠', en: 'Aquarium: Subtract With Trading 🐠' },
    goal: {
      id: 'Mengurangkan 2 digit dengan menukar lewat akuarium',
      en: 'Subtract 2-digit numbers with trading via the aquarium',
    },
    example: { id: 'akuarium ikan', en: 'fish aquarium' },
    questionCount: 5,
    settings: { operation: 'subtraction', digitCount: 2, carryMode: 'required', questionCount: 5 },
  },
]

export function getLevel(id: string): LevelDefinition | undefined {
  return LEVELS.find((level) => level.id === id)
}

/** ID level era sebelum Kelas 1 ada (level berantai lama level-1 → tantangan). */
const LEGACY_LEVEL_IDS: readonly string[] = [
  'level-1',
  'level-2',
  'level-3',
  'level-4',
  'level-5',
  'level-6',
  'level-7',
  'level-8',
  'level-9',
  'level-10',
  'level-11',
  'tantangan',
]

/** Rantai Kelas 1 — dipakai untuk bypass migrasi veteran. */
const K1_IDS: readonly string[] = [
  'k1-membilang',
  'k1-banding',
  'k1-nilai-tempat',
  'k1-tambah-1-digit',
  'k1-kurang-1-digit',
  'k1-campur-1-digit',
  'k1-jembatan-2-digit',
]

export function isLevelUnlocked(levelId: string, completedLevelIds: readonly string[]): boolean {
  const level = LEVELS.find((entry) => entry.id === levelId)
  if (!level) return false
  // Level yang sudah selesai selalu bisa diulang — jangan dikunci oleh requires baru.
  if (completedLevelIds.includes(levelId)) return true
  if (level.requires === null) return true
  if (completedLevelIds.includes(level.requires)) return true
  // Migrasi veteran: progres era lama dianggap telah melewati rantai Kelas 1.
  // Ini unlock (bukan auto-complete) agar pengguna lama tidak terkunci di level-1
  // maupun di seluruh Kelas 1; batasi bypass hanya pada prasyarat K1, bukan semua.
  const isVeteran = completedLevelIds.some((id) => LEGACY_LEVEL_IDS.includes(id))
  if (isVeteran) {
    if (level.grade === 1) return true
    if (level.requires !== null && K1_IDS.includes(level.requires)) return true
  }
  return false
}

export function getNextLevelId(levelId: string | null): string | null {
  if (!levelId) return null
  // Rantai linear — posisi array identik dengan rantai requires.
  const index = LEVELS.findIndex((level) => level.id === levelId)
  if (index < 0 || index + 1 >= LEVELS.length) return null
  return LEVELS[index + 1].id
}

/**
 * Kesulitan Level Tantangan menyesuaikan performa terbaru anak
 * agar tidak ada lonjakan kesulitan yang terlalu besar.
 */
export function buildChallengeSettings(history: readonly PracticeRecord[]): GeneratorSettings {
  const recent = history.slice(-5)
  if (recent.length === 0) {
    return { operation: 'mixed', digitCount: 2, carryMode: 'any', questionCount: 10 }
  }
  const total = recent.reduce((sum, record) => sum + record.total, 0)
  const correct = recent.reduce((sum, record) => sum + record.correct, 0)
  const accuracy = total === 0 ? 0 : correct / total
  if (accuracy >= 0.85) {
    return { operation: 'mixed', digitCount: 4, carryMode: 'any', questionCount: 10 }
  }
  if (accuracy >= 0.6) {
    return { operation: 'mixed', digitCount: 3, carryMode: 'any', questionCount: 10 }
  }
  return { operation: 'mixed', digitCount: 2, carryMode: 'any', questionCount: 10 }
}
