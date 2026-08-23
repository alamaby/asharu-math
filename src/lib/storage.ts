import type { PracticeRecord, UserProgress } from '../types'

export const STORAGE_KEY = 'asharu-math:v1'
export const CURRENT_VERSION = 1

export function defaultProgress(): UserProgress {
  return {
    version: CURRENT_VERSION,
    childName: null,
    completedLevelIds: [],
    bestScores: {},
    totalCorrect: 0,
    totalWrong: 0,
    bestStreak: 0,
    currentStreak: 0,
    carryCorrect: 0,
    borrowCorrect: 0,
    recoveredCount: 0,
    unlockedAchievements: {},
    lastLevelId: null,
    soundEnabled: true,
    animationsEnabled: true,
    practiceHistory: [],
    lastActiveDate: null,
    dayStreak: 0,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isNumberMap(value: unknown): value is Record<string, number> {
  if (!isRecord(value)) return false
  return Object.values(value).every((item) => typeof item === 'number' && Number.isFinite(item))
}

function isStringMap(value: unknown): value is Record<string, string> {
  if (!isRecord(value)) return false
  return Object.values(value).every((item) => typeof item === 'string')
}

function isValidPracticeHistory(value: unknown): value is PracticeRecord[] {
  if (!Array.isArray(value)) return false
  return value.every(
    (item) =>
      isRecord(item) &&
      typeof item.date === 'string' &&
      typeof item.correct === 'number' &&
      typeof item.total === 'number',
  )
}

/**
 * Validasi bentuk data yang dibaca dari localStorage.
 * Mengembalikan null jika struktur rusak agar pemanggil memakai default.
 */
export function validateProgress(value: unknown): UserProgress | null {
  if (!isRecord(value)) return null
  if (value.version !== CURRENT_VERSION) return null
  if (!isStringArray(value.completedLevelIds)) return null
  if (!isNumberMap(value.bestScores)) return null
  if (!isStringMap(value.unlockedAchievements)) return null
  if (!isValidPracticeHistory(value.practiceHistory)) return null
  const numbers = [
    value.totalCorrect,
    value.totalWrong,
    value.bestStreak,
    value.currentStreak,
    value.carryCorrect,
    value.borrowCorrect,
    value.recoveredCount,
    value.dayStreak,
  ] as unknown[]
  if (numbers.some((n) => typeof n !== 'number' || !Number.isFinite(n) || n < 0)) return null
  if (typeof value.soundEnabled !== 'boolean') return null
  if (typeof value.animationsEnabled !== 'boolean') return null
  if (value.lastLevelId !== null && typeof value.lastLevelId !== 'string') return null
  if (value.lastActiveDate !== null && typeof value.lastActiveDate !== 'string') return null
  // childName bersifat opsional agar data lama tanpa field ini tetap valid
  if (value.childName !== undefined && value.childName !== null && typeof value.childName !== 'string') {
    return null
  }

  const normalized: UserProgress = value as unknown as UserProgress
  if (typeof normalized.childName === 'string') {
    const trimmed = normalized.childName.trim().slice(0, 20)
    normalized.childName = trimmed.length > 0 ? trimmed : null
  } else {
    normalized.childName = null
  }
  return normalized
}

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

function getStorage(): StorageLike | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    return window.localStorage
  } catch {
    return null
  }
}

export function loadProgress(storage: StorageLike | null = getStorage()): UserProgress {
  if (!storage) return defaultProgress()
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw === null) return defaultProgress()
    const parsed: unknown = JSON.parse(raw)
    const validated = validateProgress(parsed)
    return validated ?? defaultProgress()
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(progress: UserProgress, storage: StorageLike | null = getStorage()): boolean {
  if (!storage) return false
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress))
    return true
  } catch {
    return false
  }
}

export function clearProgress(storage: StorageLike | null = getStorage()): void {
  try {
    storage?.removeItem(STORAGE_KEY)
  } catch {
    // abaikan: penyimpanan tidak tersedia
  }
}

export function todayString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function yesterdayString(): string {
  const now = new Date()
  now.setDate(now.getDate() - 1)
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Memperbarui streak harian; dipanggil saat anak aktif menjawab/menyelesaikan level. */
export function touchDayStreak(progress: UserProgress): UserProgress {
  const today = todayString()
  if (progress.lastActiveDate === today) return progress
  const dayStreak = progress.lastActiveDate === yesterdayString() ? progress.dayStreak + 1 : 1
  return { ...progress, lastActiveDate: today, dayStreak }
}
