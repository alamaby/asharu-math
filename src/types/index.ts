import type { LocalizedText } from '../i18n/types'

export type OperationType = 'addition' | 'subtraction'
export type OperationChoice = OperationType | 'mixed'
export type PlaceValue = 'thousands' | 'hundreds' | 'tens' | 'units'
export type CarryMode = 'none' | 'required' | 'any'
export type DigitCount = 2 | 3 | 4

export interface DigitColumn {
  /** 0 = kolom paling kiri pada tampilan */
  index: number
  place: PlaceValue
  firstDigit: string | null
  secondDigit: string | null
  resultDigit: string | null
  /** Kolom dipakai oleh operand atau hasil */
  used: boolean
}

export interface BorrowChange {
  columnIndex: number
  before: number
  after: number
}

export type LearningStep =
  | { kind: 'intro'; operation: OperationType; first: number; second: number }
  | {
      kind: 'interim-sum'
      columnIndex: number
      place: PlaceValue
      addendA: number
      addendB: number
      carryIn: number
      expected: number
    }
  | {
      kind: 'answer-digit'
      columnIndex: number
      place: PlaceValue
      expectedDigit: number
      /** Konteks pengurangan untuk instruksi render-time */
      sub?: {
        mode: 'afterBorrow' | 'chainMid' | 'plain'
        topAfter: number
        bottom: number
        topOriginal: number
        effective: number
      }
    }
  | {
      kind: 'carry-digit'
      columnIndex: number
      place: PlaceValue
      expectedDigit: number
    }
  | {
      kind: 'borrow-question'
      columnIndex: number
      place: PlaceValue
      top: number
      bottom: number
      canSubtract: boolean
    }
  | {
      kind: 'borrow-explain'
      columnIndex: number
      place: PlaceValue
      /** Angka efektif kolom sebelum dipinjamkan */
      top: number
      bottom: number
      changes: BorrowChange[]
    }
  | { kind: 'review'; operation: OperationType; first: number; second: number; result: number }

export interface MathProblem {
  id: string
  operation: OperationType
  firstOperand: number
  secondOperand: number
  /** Urutan digit asli, mis. "26" — tidak pernah dibalik */
  firstOperandText: string
  secondOperandText: string
  expectedResult: number
  expectedResultText: string
  digitCount: number
  requiresCarry: boolean
  requiresBorrow: boolean
  columns: DigitColumn[]
  learningSteps: LearningStep[]
}

export interface GeneratorSettings {
  operation: OperationChoice
  digitCount: DigitCount
  carryMode: CarryMode
  questionCount: number
}

export interface LevelDefinition {
  id: string
  number: number | null
  name: LocalizedText
  goal: LocalizedText
  example: LocalizedText
  questionCount: number
  settings: GeneratorSettings
}

export interface SessionStats {
  correctFirstTry: number
  wrongAttempts: number
  recovered: number
  /** Jumlah soal yang sudah dikerjakan sebelum sesi ini (mis. pindah dari latihan ke belajar) */
  totalDone: number
}

export interface SessionSummary {
  title: string
  totalQuestions: number
  correctFirstTry: number
  wrongAttempts: number
  recovered: number
  stars: number
  levelId: string | null
  settings: GeneratorSettings | null
  nextLevelId: string | null
  newAchievementIds: string[]
}

export interface AchievementStats {
  totalCorrect: number
  bestStreak: number
  carryCorrect: number
  borrowCorrect: number
  recoveredCount: number
  completedLevelIds: string[]
}

export interface AchievementDefinition {
  id: string
  name: LocalizedText
  description: LocalizedText
  icon: string
  check: (stats: AchievementStats) => boolean
}

export interface PracticeRecord {
  date: string
  correct: number
  total: number
}

export interface UserProgress {
  version: 1
  /** Nama panggilan anak (opsional); hanya tersimpan di perangkat ini */
  childName: string | null
  /** Bahasa antarmuka; default 'id' untuk data lama tanpa field ini */
  language?: 'id' | 'en'
  completedLevelIds: string[]
  bestScores: Record<string, number>
  totalCorrect: number
  totalWrong: number
  bestStreak: number
  currentStreak: number
  carryCorrect: number
  borrowCorrect: number
  recoveredCount: number
  unlockedAchievements: Record<string, string>
  lastLevelId: string | null
  soundEnabled: boolean
  animationsEnabled: boolean
  practiceHistory: PracticeRecord[]
  lastActiveDate: string | null
  dayStreak: number
}

export interface CellRef {
  kind: 'answer' | 'carry'
  columnIndex: number
}
