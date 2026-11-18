import { describe, expect, it } from 'vitest'
import { getNextLevelId, isLevelUnlocked, LEVELS, resolveScreenForLevel } from '../src/data/levels'

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

describe('resolveScreenForLevel kanonikal', () => {
  it('memetakan level kebun ke screen garden', () => {
    expect(resolveScreenForLevel('kebun-1')).toEqual({ name: 'garden', levelId: 'kebun-1' })
    expect(resolveScreenForLevel('kebun-6')).toEqual({ name: 'garden', levelId: 'kebun-6' })
  })

  it('memetakan level akuarium ke screen aquarium', () => {
    expect(resolveScreenForLevel('akuarium-1')).toEqual({ name: 'aquarium', levelId: 'akuarium-1' })
    expect(resolveScreenForLevel('akuarium-6')).toEqual({ name: 'aquarium', levelId: 'akuarium-6' })
  })

  it('memetakan level konsep ke screen concept-learn', () => {
    expect(resolveScreenForLevel('k1-membilang')).toEqual({
      name: 'concept-learn',
      levelId: 'k1-membilang',
    })
    expect(resolveScreenForLevel('k1-banding')).toEqual({
      name: 'concept-learn',
      levelId: 'k1-banding',
    })
    expect(resolveScreenForLevel('k1-nilai-tempat')).toEqual({
      name: 'concept-learn',
      levelId: 'k1-nilai-tempat',
    })
  })

  it('memetakan level cerita ke screen story-learn', () => {
    expect(resolveScreenForLevel('cerita-1')).toEqual({
      name: 'story-learn',
      levelId: 'cerita-1',
    })
    expect(resolveScreenForLevel('cerita-4')).toEqual({
      name: 'story-learn',
      levelId: 'cerita-4',
    })
  })

  it('memetakan level kolom bersusun dan fallback ke screen learn', () => {
    expect(resolveScreenForLevel('level-1')).toEqual({ name: 'learn', levelId: 'level-1' })
    expect(resolveScreenForLevel('level-11')).toEqual({ name: 'learn', levelId: 'level-11' })
    expect(resolveScreenForLevel('tantangan')).toEqual({ name: 'learn', levelId: 'tantangan' })
    expect(resolveScreenForLevel('level-tidak-dikenal')).toEqual({
      name: 'learn',
      levelId: 'level-tidak-dikenal',
    })
  })
})
