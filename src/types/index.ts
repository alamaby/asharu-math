import type { LocalizedText } from '../i18n/types'

export type OperationType = 'addition' | 'subtraction'
export type OperationChoice = OperationType | 'mixed'
export type PlaceValue = 'thousands' | 'hundreds' | 'tens' | 'units'
export type CarryMode = 'none' | 'required' | 'any'
export type DigitCount = 1 | 2 | 3 | 4
/** Jenjang kelas: 1 = fondasi berhitung, 2 = bersusun pendek */
export type GradeLevel = 1 | 2

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
      /** Digit jawaban yang terisi otomatis saat jumlah benar */
      expectedDigit: number
      /** Kotak simpan yang ikut terisi otomatis saat jumlah >= 10 */
      carry?: { digit: number; columnIndex: number; place: PlaceValue }
    }
  | {
      /** Kolom hasil carry terakhir: terisi otomatis, tanpa input anak */
      kind: 'carry-down'
      columnIndex: number
      place: PlaceValue
      digit: number
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
  /** Cara penyajian soal; default 'column' bila undefined (backward-compatible) */
  presentation?: 'column' | 'story'
}

export type ConceptKind = 'counting' | 'compare' | 'place-value'
export type CompareAnswer = 'greater' | 'less' | 'equal'

export interface CountingQuestion {
  kind: 'counting'
  /** Angka yang harus dihitung anak (1..20 untuk M2) */
  target: number
  /** Tampilkan sebagai deret ikon, mis. apel; renderer yang memutuskan layout */
  icon: 'apple' | 'star' | 'dot'
}

export interface CompareQuestion {
  kind: 'compare'
  left: number
  right: number
  expected: CompareAnswer
}

export interface PlaceValueQuestion {
  kind: 'place-value'
  /** 10..99 untuk M2 */
  number: number
  /** Posisi yang ditanyakan: puluhan atau satuan */
  askedPlace: 'tens' | 'units'
  expectedDigit: number
}

export type ConceptQuestion = CountingQuestion | CompareQuestion | PlaceValueQuestion

export interface ConceptProblem {
  id: string
  kind: ConceptKind
  question: ConceptQuestion
  /** Kunci evaluasi ter-normalisasi: '7' untuk counting, 'greater/less/equal' untuk compare, '4' untuk place-value */
  expectedAnswer: string
  /** Pilihan jawaban untuk render; counting -> ['5','6','7','8'] dsb. */
  choices: string[]
}

export type LevelKind = 'column' | 'concept' | 'story'

export interface ConceptSettings {
  kind: 'concept'
  conceptKind: ConceptKind
  questionCount: number
}

export type StoryFamily =
  | 'f0-add'
  | 'f0-sub'
  | 'f1-diff'
  | 'f2-transfer'
  | 'f3-chain'
  | 'f4-join3'
  | 'f5-tiered'

export type StoryItem =
  | 'marbles'
  | 'apples'
  | 'books'
  | 'fish'
  | 'cakes'
  | 'pencils'
  | 'candies'
  | 'balls'
  | 'flowers'
  | 'birds'

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

export interface LevelDefinition {
  id: string
  /** Nomor urut dalam jenjangnya (per-grade); null untuk level lintas-akhir seperti Tantangan */
  number: number | null
  grade: GradeLevel
  /** Level yang harus selesai dulu agar level ini terbuka; null = selalu terbuka */
  requires: string | null
  /** Bentuk soal level ini: kolom bersusun vs konsep pilihan ganda */
  levelKind: LevelKind
  name: LocalizedText
  goal: LocalizedText
  example: LocalizedText
  questionCount: number
  settings: GeneratorSettings | ConceptSettings | StorySettings
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
