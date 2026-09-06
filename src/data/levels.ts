import type { GeneratorSettings, LevelDefinition, PracticeRecord } from '../types'

export const LEVELS: readonly LevelDefinition[] = [
  // ---- Kelas 1: fondasi berhitung (selalu di depan) ----
  {
    id: 'k1-tambah-1-digit',
    number: 1,
    grade: 1,
    requires: null,
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
    number: 2,
    grade: 1,
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
    number: 3,
    grade: 1,
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
    number: 4,
    grade: 1,
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
    grade: 2,
    requires: 'level-1',
    number: 2,
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
    grade: 2,
    requires: 'level-2',
    number: 3,
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
    grade: 2,
    requires: 'level-3',
    number: 4,
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
    grade: 2,
    requires: 'level-4',
    number: 5,
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
    grade: 2,
    requires: 'level-5',
    number: 6,
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
    grade: 2,
    requires: 'level-6',
    number: 7,
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
    grade: 2,
    requires: 'level-7',
    number: 8,
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
    grade: 2,
    requires: 'level-8',
    number: 9,
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
    grade: 2,
    requires: 'level-9',
    number: 10,
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
    grade: 2,
    requires: 'level-10',
    number: 11,
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
    id: 'tantangan',
    grade: 2,
    requires: 'level-11',
    number: null,
    name: { id: 'Level Tantangan', en: 'Challenge Level' },
    goal: {
      id: 'Soal campuran 2 sampai 4 digit; kesulitan menyesuaikan performa',
      en: 'Mixed 2 to 4 digit questions; difficulty adapts to performance',
    },
    example: { id: 'kejutan!', en: 'surprise!' },
    questionCount: 10,
    settings: { operation: 'mixed', digitCount: 2, carryMode: 'any', questionCount: 10 },
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

export function isLevelUnlocked(levelId: string, completedLevelIds: readonly string[]): boolean {
  const level = LEVELS.find((entry) => entry.id === levelId)
  if (!level) return false
  if (level.requires === null) return true
  if (completedLevelIds.includes(level.requires)) return true
  // Migrasi veteran: pengguna yang sudah punya progres era lama (sebelum level
  // Kelas 1 ada) otomatis melewati prasyarat Kelas 1 — unlock, bukan auto-complete.
  if (level.grade === 1 && completedLevelIds.some((id) => LEGACY_LEVEL_IDS.includes(id))) {
    return true
  }
  return false
}

export function getNextLevelId(levelId: string | null): string | null {
  if (!levelId) return null
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
