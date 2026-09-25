import { describe, expect, it } from 'vitest'
import { TRAIN_THEMES } from '../src/components/train/TrainScene'

describe('train themes', () => {
  it('dekor dan lampu tepat per grade', () => {
    expect(TRAIN_THEMES[1]!.decor).toBe('flowers')
    expect(TRAIN_THEMES[2]!.decor).toBe('farm')
    expect(TRAIN_THEMES[3]!.decor).toBe('dusk')
    expect(TRAIN_THEMES[1]!.stationLight).toBe(false)
    expect(TRAIN_THEMES[2]!.stationLight).toBe(false)
    expect(TRAIN_THEMES[3]!.stationLight).toBe(true)
  })

  it('langit berbeda dan fog valid', () => {
    const skies = [TRAIN_THEMES[1]!.sky, TRAIN_THEMES[2]!.sky, TRAIN_THEMES[3]!.sky]
    expect(new Set(skies).size).toBe(3)
    for (const g of [1, 2, 3] as const) {
      expect(TRAIN_THEMES[g]!.fogNear).toBeGreaterThan(0)
      expect(TRAIN_THEMES[g]!.fogFar).toBeGreaterThan(TRAIN_THEMES[g]!.fogNear)
      expect(TRAIN_THEMES[g]!.ground).toMatch(/^#[0-9a-f]{6}$/)
      expect(TRAIN_THEMES[g]!.hill).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('tepat tiga grade', () => {
    expect(Object.keys(TRAIN_THEMES).sort()).toEqual(['1', '2', '3'])
  })
})
