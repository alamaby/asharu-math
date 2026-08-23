import { afterEach, describe, expect, it } from 'vitest'
import {
  STORAGE_KEY,
  defaultProgress,
  loadProgress,
  saveProgress,
  touchDayStreak,
  validateProgress,
} from '../src/lib/storage'
import type { UserProgress } from '../src/types'

function storageStub(initial: string | null = null) {
  let data = initial
  return {
    getItem: (_key: string) => (data === null ? null : data),
    setItem: (_key: string, value: string) => {
      data = value
    },
    removeItem: () => {
      data = null
    },
  }
}

describe('validateProgress', () => {
  it('menerima progres valid', () => {
    const progress = defaultProgress()
    expect(validateProgress(progress)).not.toBeNull()
  })

  it('menolak versi berbeda', () => {
    expect(validateProgress({ ...defaultProgress(), version: 99 })).toBeNull()
  })

  it('menolak bentuk rusak', () => {
    expect(validateProgress(null)).toBeNull()
    expect(validateProgress('bukan objek')).toBeNull()
    expect(validateProgress({ ...defaultProgress(), completedLevelIds: 'bukan array' })).toBeNull()
    expect(validateProgress({ ...defaultProgress(), totalCorrect: 'banyak' })).toBeNull()
    expect(validateProgress({ ...defaultProgress(), soundEnabled: 'ya' })).toBeNull()
    expect(validateProgress({ ...defaultProgress(), bestScores: [1, 2] })).toBeNull()
  })
})

describe('loadProgress — fallback data rusak', () => {
  afterEach(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // penyimpanan bawaan mungkin tidak lengkap di jsdom
    }
  })

  it('mengembalikan default saat localStorage kosong', () => {
    const progress = loadProgress(storageStub(null))
    expect(progress).toEqual(defaultProgress())
  })

  it('mengembalikan default saat JSON rusak', () => {
    const progress = loadProgress(storageStub('{json tidak valid!!'))
    expect(progress).toEqual(defaultProgress())
  })

  it('mengembalikan default saat struktur tidak sesuai', () => {
    const progress = loadProgress(storageStub(JSON.stringify({ version: 1, totalCorrect: 'banyak' })))
    expect(progress).toEqual(defaultProgress())
  })
})

describe('saveProgress dan loadProgress — roundtrip', () => {
  it('data tersimpan dan terbaca kembali', () => {
    const storage = storageStub()
    const progress = {
      ...defaultProgress(),
      childName: 'Budi',
      completedLevelIds: ['level-1'],
      totalCorrect: 12,
      bestStreak: 7,
      lastLevelId: 'level-2',
      unlockedAchievements: { 'langkah-pertama': '2026-08-22T00:00:00.000Z' },
    }
    expect(saveProgress(progress, storage)).toBe(true)
    expect(loadProgress(storage)).toEqual(progress)
  })

  it('data lama tanpa childName tetap valid dan dinormalisasi menjadi null', () => {
    const storage = storageStub()
    const legacy = defaultProgress()
    delete (legacy as Partial<UserProgress>).childName
    storage.setItem(STORAGE_KEY, JSON.stringify(legacy))
    const loaded = loadProgress(storage)
    expect(loaded.childName).toBeNull()
    expect(loaded.totalCorrect).toBe(legacy.totalCorrect)
  })

  it('childName dicoret spasi dan dibatasi 20 karakter', () => {
    expect(validateProgress({ ...defaultProgress(), childName: '  Budi  ' })?.childName).toBe('Budi')
    expect(validateProgress({ ...defaultProgress(), childName: 'a'.repeat(40) })?.childName).toHaveLength(20)
    expect(validateProgress({ ...defaultProgress(), childName: 123 })).toBeNull()
  })

  it('menyimpan lewat penyimpanan bawaan window', () => {
    const stub = storageStub(null)
    const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage')
    Object.defineProperty(window, 'localStorage', { value: stub, configurable: true, writable: true })
    try {
      const progress = { ...defaultProgress(), totalCorrect: 3 }
      expect(saveProgress(progress)).toBe(true)
      expect(loadProgress()).toEqual(progress)
    } finally {
      if (descriptor) {
        Object.defineProperty(window, 'localStorage', descriptor)
      }
    }
  })
})

describe('touchDayStreak', () => {
  // Implementasi memakai tanggal lokal (WIB), jadi pengujian juga harus lokal —
  // toISOString() akan meleset ketika tanggal UTC tertinggal dari tanggal lokal.
  const tanggalLokal = (date: Date): string => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  it('hari yang sama tidak menambah streak', () => {
    const progress = { ...defaultProgress(), lastActiveDate: tanggalLokal(new Date()), dayStreak: 3 }
    expect(touchDayStreak(progress).dayStreak).toBe(3)
  })

  it('besok menambah streak', () => {
    const kemarin = new Date()
    kemarin.setDate(kemarin.getDate() - 1)
    const progress = { ...defaultProgress(), lastActiveDate: tanggalLokal(kemarin), dayStreak: 2 }
    expect(touchDayStreak(progress).dayStreak).toBe(3)
  })
})
