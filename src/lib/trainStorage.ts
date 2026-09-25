/**
 * Progres kereta — key terpisah agar tidak migrasi UserProgress.
 */
import type { TrainQuestion } from './trainQuestionGenerator'
import { isValidTrainVariant, type TrainVariant } from './trainVariants'

export const TRAIN_STORAGE_KEY = 'asharu-train:v1'
export const TRAIN_SESSION_KEY = 'asharu-train-session:v1'
export const TRAIN_SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000

export interface TrainProgress {
  version: 1
  bestStarsByGrade: Record<string, number>
  sessionsCompleted: number
  lastGrade: 1 | 2 | 3 | null
  soundEnabled: boolean
  musicEnabled?: boolean
  voiceEnabled?: boolean
}

export interface TrainSessionSnapshot {
  version: 1
  grade: 1 | 2 | 3
  questions: TrainQuestion[]
  round: number
  attemptsLog: number[]
  savedAt: number
  variant?: TrainVariant
}

export function defaultTrainProgress(): TrainProgress {
  return {
    version: 1,
    bestStarsByGrade: {},
    sessionsCompleted: 0,
    lastGrade: null,
    soundEnabled: true,
    musicEnabled: true,
    voiceEnabled: true,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function validateTrainProgress(value: unknown): TrainProgress | null {
  if (!isRecord(value)) return null
  if (value.version !== 1) return null
  if (!isRecord(value.bestStarsByGrade)) return null
  for (const [k, v] of Object.entries(value.bestStarsByGrade)) {
    if (k !== '1' && k !== '2' && k !== '3') continue
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 15) return null
  }
  if (
    typeof value.sessionsCompleted !== 'number' ||
    !Number.isInteger(value.sessionsCompleted) ||
    value.sessionsCompleted < 0
  ) {
    return null
  }
  if (
    value.lastGrade !== null &&
    value.lastGrade !== 1 &&
    value.lastGrade !== 2 &&
    value.lastGrade !== 3
  ) {
    return null
  }
  if (typeof value.soundEnabled !== 'boolean') return null
  if (value.musicEnabled !== undefined && typeof value.musicEnabled !== 'boolean') return null
  if (value.voiceEnabled !== undefined && typeof value.voiceEnabled !== 'boolean') return null
  const cleaned: Record<string, number> = {}
  for (const [k, v] of Object.entries(value.bestStarsByGrade)) {
    if ((k === '1' || k === '2' || k === '3') && typeof v === 'number') cleaned[k] = v
  }
  return {
    version: 1,
    bestStarsByGrade: cleaned,
    sessionsCompleted: value.sessionsCompleted as number,
    lastGrade: value.lastGrade as 1 | 2 | 3 | null,
    soundEnabled: value.soundEnabled as boolean,
    musicEnabled: (value.musicEnabled as boolean | undefined) ?? true,
    voiceEnabled: (value.voiceEnabled as boolean | undefined) ?? true,
  }
}

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

function getTrainStorage(explicit?: StorageLike | null): StorageLike | null {
  if (explicit !== undefined) return explicit
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    return window.localStorage
  } catch {
    return null
  }
}

export function loadTrainProgress(storage?: StorageLike | null): TrainProgress {
  const s = getTrainStorage(storage)
  if (!s) return defaultTrainProgress()
  try {
    const raw = s.getItem(TRAIN_STORAGE_KEY)
    if (raw === null) return defaultTrainProgress()
    const parsed: unknown = JSON.parse(raw)
    return validateTrainProgress(parsed) ?? defaultTrainProgress()
  } catch {
    return defaultTrainProgress()
  }
}

export function saveTrainProgress(progress: TrainProgress, storage?: StorageLike | null): boolean {
  const s = getTrainStorage(storage)
  if (!s) return false
  try {
    s.setItem(TRAIN_STORAGE_KEY, JSON.stringify(progress))
    return true
  } catch {
    return false
  }
}

export function recordTrainSession(
  progress: TrainProgress,
  grade: 1 | 2 | 3,
  stars: number,
): TrainProgress {
  const key = String(grade)
  const prev = progress.bestStarsByGrade[key] ?? 0
  return {
    ...progress,
    sessionsCompleted: progress.sessionsCompleted + 1,
    lastGrade: grade,
    bestStarsByGrade: { ...progress.bestStarsByGrade, [key]: Math.max(prev, stars) },
  }
}

const TRAIN_TOPICS: readonly string[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'comparison',
]

function isValidQuestion(v: unknown): boolean {
  if (!isRecord(v)) return false
  if (typeof v.id !== 'string') return false
  if (v.grade !== 1 && v.grade !== 2 && v.grade !== 3) return false
  if (typeof v.topic !== 'string' || !TRAIN_TOPICS.includes(v.topic)) return false
  if (typeof v.prompt !== 'string') return false
  if (!Array.isArray(v.choices) || v.choices.length !== 3) return false
  if (!v.choices.every((c) => typeof c === 'string')) return false
  if (new Set(v.choices as string[]).size !== 3) return false
  if (v.correctIndex !== 0 && v.correctIndex !== 1 && v.correctIndex !== 2) return false
  if (typeof v.correctValue !== 'string') return false
  if (typeof v.hintText !== 'string') return false
  if ((v.choices as string[])[v.correctIndex as number] !== v.correctValue) return false
  return true
}

export function isValidTrainSession(value: unknown): value is TrainSessionSnapshot {
  if (!isRecord(value)) return false
  if (value.version !== 1) return false
  if (value.grade !== 1 && value.grade !== 2 && value.grade !== 3) return false
  if (!Array.isArray(value.questions) || value.questions.length !== 5) return false
  if (!value.questions.every((q) => isValidQuestion(q))) return false
  if (
    typeof value.round !== 'number' ||
    !Number.isInteger(value.round) ||
    value.round < 0 ||
    value.round > 4
  ) {
    return false
  }
  if (!Array.isArray(value.attemptsLog) || value.attemptsLog.length !== value.round) return false
  if (!value.attemptsLog.every((n) => typeof n === 'number' && Number.isInteger(n) && n >= 1)) {
    return false
  }
  if (typeof value.savedAt !== 'number' || !Number.isFinite(value.savedAt)) return false
  if (value.variant !== undefined && !isValidTrainVariant(value.variant)) return false
  return true
}

export function saveTrainSession(
  snapshot: TrainSessionSnapshot,
  storage?: StorageLike | null,
): boolean {
  const s = getTrainStorage(storage)
  if (!s) return false
  try {
    s.setItem(TRAIN_SESSION_KEY, JSON.stringify(snapshot))
    return true
  } catch {
    return false
  }
}

export function loadTrainSession(storage?: StorageLike | null): TrainSessionSnapshot | null {
  const s = getTrainStorage(storage)
  if (!s) return null
  try {
    const raw = s.getItem(TRAIN_SESSION_KEY)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isValidTrainSession(parsed)) return null
    if (Date.now() - parsed.savedAt > TRAIN_SESSION_TTL_MS) {
      clearTrainSession(storage)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearTrainSession(storage?: StorageLike | null): void {
  const s = getTrainStorage(storage)
  if (!s) return
  try {
    s.removeItem(TRAIN_SESSION_KEY)
  } catch {
    // abaikan: penyimpanan tidak tersedia
  }
}
