import type { GeneratorSettings, LevelDefinition, PracticeRecord } from '../types'

export const LEVELS: readonly LevelDefinition[] = [
  {
    id: 'level-1',
    number: 1,
    name: 'Penjumlahan 2 Digit Tanpa Menyimpan',
    goal: 'Menjumlahkan dua bilangan 2 digit tanpa perlu menyimpan',
    example: '23 + 14',
    questionCount: 5,
    settings: { operation: 'addition', digitCount: 2, carryMode: 'none', questionCount: 5 },
  },
  {
    id: 'level-2',
    number: 2,
    name: 'Penjumlahan 2 Digit dengan Menyimpan',
    goal: 'Menjumlahkan dua bilangan 2 digit dengan menyimpan satu kali',
    example: '26 + 87',
    questionCount: 5,
    settings: { operation: 'addition', digitCount: 2, carryMode: 'required', questionCount: 5 },
  },
  {
    id: 'level-3',
    number: 3,
    name: 'Pengurangan 2 Digit Tanpa Meminjam',
    goal: 'Mengurangkan dua bilangan 2 digit tanpa perlu meminjam',
    example: '76 - 24',
    questionCount: 5,
    settings: { operation: 'subtraction', digitCount: 2, carryMode: 'none', questionCount: 5 },
  },
  {
    id: 'level-4',
    number: 4,
    name: 'Pengurangan 2 Digit dengan Meminjam',
    goal: 'Mengurangkan dua bilangan 2 digit dengan meminjam satu kali',
    example: '52 - 28',
    questionCount: 5,
    settings: { operation: 'subtraction', digitCount: 2, carryMode: 'required', questionCount: 5 },
  },
  {
    id: 'level-5',
    number: 5,
    name: 'Campuran 3 Digit Tanpa Menyimpan/Meminjam',
    goal: 'Berlatih penjumlahan dan pengurangan 3 digit tanpa menyimpan atau meminjam',
    example: '345 + 231',
    questionCount: 5,
    settings: { operation: 'mixed', digitCount: 3, carryMode: 'none', questionCount: 5 },
  },
  {
    id: 'level-6',
    number: 6,
    name: 'Penjumlahan 3 Digit dengan Menyimpan',
    goal: 'Menjumlahkan 3 digit dengan menyimpan di satu atau beberapa kolom',
    example: '468 + 387',
    questionCount: 5,
    settings: { operation: 'addition', digitCount: 3, carryMode: 'required', questionCount: 5 },
  },
  {
    id: 'level-7',
    number: 7,
    name: 'Pengurangan 3 Digit dengan Meminjam',
    goal: 'Mengurangkan 3 digit dengan meminjam di satu atau beberapa kolom',
    example: '523 - 268',
    questionCount: 5,
    settings: { operation: 'subtraction', digitCount: 3, carryMode: 'required', questionCount: 5 },
  },
  {
    id: 'level-8',
    number: 8,
    name: 'Campuran 3 Digit',
    goal: 'Berlatih penjumlahan dan pengurangan 3 digit bervariasi',
    example: 'campuran',
    questionCount: 5,
    settings: { operation: 'mixed', digitCount: 3, carryMode: 'any', questionCount: 5 },
  },
  {
    id: 'level-9',
    number: 9,
    name: 'Penjumlahan 4 Digit',
    goal: 'Menjumlahkan 4 digit dengan atau tanpa menyimpan',
    example: '2345 + 1876',
    questionCount: 5,
    settings: { operation: 'addition', digitCount: 4, carryMode: 'any', questionCount: 5 },
  },
  {
    id: 'level-10',
    number: 10,
    name: 'Pengurangan 4 Digit',
    goal: 'Mengurangkan 4 digit dengan atau tanpa meminjam',
    example: '5231 - 2867',
    questionCount: 5,
    settings: { operation: 'subtraction', digitCount: 4, carryMode: 'any', questionCount: 5 },
  },
  {
    id: 'level-11',
    number: 11,
    name: 'Campuran 4 Digit',
    goal: 'Berlatih penjumlahan dan pengurangan 4 digit bervariasi',
    example: 'campuran',
    questionCount: 5,
    settings: { operation: 'mixed', digitCount: 4, carryMode: 'any', questionCount: 5 },
  },
  {
    id: 'tantangan',
    number: null,
    name: 'Level Tantangan',
    goal: 'Soal campuran 2 sampai 4 digit; kesulitan menyesuaikan performa',
    example: 'kejutan!',
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
