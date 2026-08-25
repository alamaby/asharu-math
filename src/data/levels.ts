import type { GeneratorSettings, LevelDefinition, PracticeRecord } from '../types'

export const LEVELS: readonly LevelDefinition[] = [
  {
    id: 'level-1',
    number: 1,
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

export function isLevelUnlocked(levelId: string, completedLevelIds: readonly string[]): boolean {
  const index = LEVELS.findIndex((level) => level.id === levelId)
  if (index <= 0) return true
  return completedLevelIds.includes(LEVELS[index - 1].id)
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
