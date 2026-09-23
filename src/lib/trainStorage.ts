/**
 * Progres kereta — key terpisah agar tidak migrasi UserProgress.
 */

export const TRAIN_STORAGE_KEY = 'asharu-train:v1'

export interface TrainProgress {
  version: 1
  bestStarsByGrade: Record<string, number>
  sessionsCompleted: number
  lastGrade: 1 | 2 | 3 | null
  soundEnabled: boolean
}

export function defaultTrainProgress(): TrainProgress {
  return {
    version: 1,
    bestStarsByGrade: {},
    sessionsCompleted: 0,
    lastGrade: null,
    soundEnabled: true,
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
