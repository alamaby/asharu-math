import { describe, expect, it } from 'vitest'
import { generateTrainSession } from '../src/lib/trainQuestionGenerator'
import {
  TRAIN_SESSION_KEY,
  TRAIN_SESSION_TTL_MS,
  clearTrainSession,
  isValidTrainSession,
  loadTrainSession,
  saveTrainSession,
  type TrainSessionSnapshot,
} from '../src/lib/trainStorage'

function memoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem: (k: string) => (store.has(k) ? (store.get(k) as string) : null),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    removeItem: (k: string) => {
      store.delete(k)
    },
    setItem: (k: string, v: string) => {
      store.set(k, String(v))
    },
  }
}

function validSnapshot(overrides: Partial<TrainSessionSnapshot> = {}): TrainSessionSnapshot {
  return {
    version: 1,
    grade: 2,
    questions: generateTrainSession(2, 5),
    round: 3,
    attemptsLog: [1, 1, 2],
    savedAt: Date.now(),
    ...overrides,
  }
}

describe('train session snapshot', () => {
  it('roundtrip snapshot valid', () => {
    const s = memoryStorage()
    const snap = validSnapshot()
    expect(saveTrainSession(snap, s)).toBe(true)
    const loaded = loadTrainSession(s)
    expect(loaded).not.toBeNull()
    expect(loaded?.grade).toBe(2)
    expect(loaded?.round).toBe(3)
    expect(loaded?.attemptsLog).toEqual([1, 1, 2])
    expect(loaded?.questions).toHaveLength(5)
    expect(loaded?.questions[0]!.prompt).toBe(snap.questions[0]!.prompt)
  })

  it('round di luar rentang invalid', () => {
    expect(isValidTrainSession(validSnapshot({ round: 5, attemptsLog: [] }))).toBe(false)
    const s = memoryStorage()
    s.setItem(TRAIN_SESSION_KEY, JSON.stringify(validSnapshot({ round: 5, attemptsLog: [] })))
    expect(loadTrainSession(s)).toBeNull()
  })

  it('questions tidak valid ditolak', () => {
    const four = generateTrainSession(2, 4)
    expect(isValidTrainSession(validSnapshot({ questions: four }))).toBe(false)

    const badIndex = generateTrainSession(2, 5)
    badIndex[0] = { ...badIndex[0]!, correctIndex: 3 as 0 }
    expect(isValidTrainSession(validSnapshot({ questions: badIndex }))).toBe(false)

    const dup = generateTrainSession(2, 5)
    dup[1] = { ...dup[1]!, choices: ['5', '5', '6'] }
    expect(isValidTrainSession(validSnapshot({ questions: dup }))).toBe(false)
  })

  it('attemptsLog tidak konsisten dengan round ditolak', () => {
    expect(isValidTrainSession(validSnapshot({ round: 3, attemptsLog: [1] }))).toBe(false)
  })

  it('kedaluwarsa 14 hari dihapus dan null', () => {
    const s = memoryStorage()
    const expired = validSnapshot({ savedAt: Date.now() - TRAIN_SESSION_TTL_MS - 1 })
    s.setItem(TRAIN_SESSION_KEY, JSON.stringify(expired))
    expect(loadTrainSession(s)).toBeNull()
    expect(s.getItem(TRAIN_SESSION_KEY)).toBeNull()

    saveTrainSession(validSnapshot(), s)
    clearTrainSession(s)
    expect(loadTrainSession(s)).toBeNull()
  })
})
