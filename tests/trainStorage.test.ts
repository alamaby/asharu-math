import { describe, expect, it } from 'vitest'
import {
  defaultTrainProgress,
  loadTrainProgress,
  recordTrainSession,
  saveTrainProgress,
  validateTrainProgress,
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

describe('train storage', () => {
  it('default shape valid', () => {
    const d = defaultTrainProgress()
    expect(d.version).toBe(1)
    expect(d.sessionsCompleted).toBe(0)
    expect(d.lastGrade).toBeNull()
    expect(d.soundEnabled).toBe(true)
    expect(validateTrainProgress(d)).not.toBeNull()
  })

  it('roundtrip 15 bintang', () => {
    const s = memoryStorage()
    const p = { ...defaultTrainProgress(), sessionsCompleted: 1, lastGrade: 1 as const }
    const recorded = recordTrainSession(p, 1, 15)
    expect(saveTrainProgress(recorded, s)).toBe(true)
    expect(loadTrainProgress(s).bestStarsByGrade['1']).toBe(15)
  })

  it('best tidak turun', () => {
    const p = recordTrainSession(defaultTrainProgress(), 1, 10)
    const p2 = recordTrainSession(p, 1, 8)
    expect(p2.bestStarsByGrade['1']).toBe(10)
    expect(p2.sessionsCompleted).toBe(2)
  })

  it('invalid kembali default atau null', () => {
    expect(validateTrainProgress({ version: 2 })).toBeNull()
    expect(validateTrainProgress({ ...defaultTrainProgress(), lastGrade: 9 })).toBeNull()
    expect(
      validateTrainProgress({ ...defaultTrainProgress(), bestStarsByGrade: { '1': -1 } }),
    ).toBeNull()
    const s = memoryStorage()
    s.setItem('asharu-train:v1', 'rusak{')
    expect(loadTrainProgress(s).sessionsCompleted).toBe(0)
  })

  it('storage null aman', () => {
    expect(loadTrainProgress(null).sessionsCompleted).toBe(0)
    expect(saveTrainProgress(defaultTrainProgress(), null)).toBe(false)
  })

  it('musik default true dan roundtrip', () => {
    expect(defaultTrainProgress().musicEnabled).toBe(true)
    const s = memoryStorage()
    const off = { ...defaultTrainProgress(), musicEnabled: false as boolean }
    expect(saveTrainProgress(off, s)).toBe(true)
    expect(loadTrainProgress(s).musicEnabled).toBe(false)
  })

  it('backward compatible tanpa musicEnabled', () => {
    const legacy = { ...defaultTrainProgress() }
    delete legacy.musicEnabled
    const validated = validateTrainProgress(legacy)
    expect(validated).not.toBeNull()
    expect(validated?.musicEnabled).toBe(true)
    expect(validateTrainProgress({ ...defaultTrainProgress(), musicEnabled: 'ya' })).toBeNull()
  })

  it('voice default true dan roundtrip', () => {
    expect(defaultTrainProgress().voiceEnabled).toBe(true)
    const s = memoryStorage()
    const off = { ...defaultTrainProgress(), voiceEnabled: false as boolean }
    expect(saveTrainProgress(off, s)).toBe(true)
    expect(loadTrainProgress(s).voiceEnabled).toBe(false)
  })

  it('backward compatible tanpa voiceEnabled', () => {
    const legacy = { ...defaultTrainProgress() }
    delete legacy.voiceEnabled
    const validated = validateTrainProgress(legacy)
    expect(validated).not.toBeNull()
    expect(validated?.voiceEnabled).toBe(true)
    expect(validateTrainProgress({ ...defaultTrainProgress(), voiceEnabled: 'ya' })).toBeNull()
  })
})
