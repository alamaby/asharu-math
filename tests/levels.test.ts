import { describe, expect, it } from 'vitest'
import { getNextLevelId, isLevelUnlocked, LEVELS } from '../src/data/levels'

describe('isLevelUnlocked', () => {
  it('semua id dikenal selalu terbuka walau progres kosong', () => {
    for (const level of LEVELS) {
      expect(isLevelUnlocked(level.id, [])).toBe(true)
    }
  })

  it('tetap terbuka untuk progres parsial dan penuh', () => {
    const inputs: string[][] = [['k1-membilang'], ['level-5'], LEVELS.map((l) => l.id)]
    const targets = [
      'k1-banding',
      'level-1',
      'level-2',
      'cerita-1',
      'tantangan',
      'kebun-1',
      'akuarium-1',
    ]
    for (const completed of inputs) {
      for (const target of targets) {
        expect(isLevelUnlocked(target, completed)).toBe(true)
      }
    }
  })

  it('id tidak dikenal selalu false', () => {
    expect(isLevelUnlocked('tidak-ada', [])).toBe(false)
    expect(isLevelUnlocked('tidak-ada', ['level-1'])).toBe(false)
  })
})

describe('getNextLevelId linear', () => {
  it('mengembalikan id berikutnya dalam LEVELS', () => {
    for (let i = 0; i < LEVELS.length - 1; i++) {
      expect(getNextLevelId(LEVELS[i].id)).toBe(LEVELS[i + 1].id)
    }
    expect(getNextLevelId(LEVELS[LEVELS.length - 1].id)).toBeNull()
    expect(getNextLevelId('tidak-ada')).toBeNull()
    expect(getNextLevelId(null)).toBeNull()
  })

  it('rantai cerita linier: level-11 -> cerita-1 ... -> tantangan', () => {
    expect(getNextLevelId('level-11')).toBe('cerita-1')
    expect(getNextLevelId('cerita-1')).toBe('cerita-2')
    expect(getNextLevelId('cerita-2')).toBe('cerita-3')
    expect(getNextLevelId('cerita-3')).toBe('cerita-4')
    expect(getNextLevelId('cerita-4')).toBe('tantangan')
  })
})
