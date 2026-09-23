import { describe, it, expect } from 'vitest'
import {
  tensPositions,
  onesPositions,
  TENS_BOUNDS,
  ONES_BOUNDS,
} from '../src/components/aquarium/AquariumScene3D'

describe('aquariumSceneLayout — tensPositions dalam frustum', () => {
  it('count=5 → 5 posisi, semua dalam TENS_BOUNDS', () => {
    const pos = tensPositions(5)
    expect(pos.length).toBe(5)
    for (const [x, y] of pos) {
      expect(x >= TENS_BOUNDS.minX).toBe(true)
      expect(x <= TENS_BOUNDS.maxX).toBe(true)
      expect(y >= TENS_BOUNDS.minY).toBe(true)
      expect(y <= TENS_BOUNDS.maxY).toBe(true)
    }
  })

  it('count=0 → array kosong', () => {
    expect(tensPositions(0)).toEqual([])
  })

  it('count=-1 → array kosong (guard)', () => {
    expect(tensPositions(-1)).toEqual([])
  })

  it('count=1 deterministik (dua panggil sama)', () => {
    const a = tensPositions(1)
    const b = tensPositions(1)
    expect(a).toEqual(b)
    expect(a.length).toBe(1)
  })

  it('count=19 semua dalam bounds (clamp, bukan y=-2.35)', () => {
    const pos = tensPositions(19)
    expect(pos.length).toBe(19)
    for (const [x, y] of pos) {
      expect(x >= TENS_BOUNDS.minX).toBe(true)
      expect(x <= TENS_BOUNDS.maxX).toBe(true)
      // y harus di atas pasir (TENS_BOUNDS.minY = -1.0, pasir di -2.2)
      expect(y >= TENS_BOUNDS.minY).toBe(true)
      expect(y <= TENS_BOUNDS.maxY).toBe(true)
    }
  })

  it('F1 regression: tensPositions(5) untuk soal 34+25 menghasilkan 5 grup', () => {
    // F1: scale always 1, diverifikasi manual S9 + test ini + logic visibleScale=1
    expect(tensPositions(5).length).toBe(5)
  })
})

describe('aquariumSceneLayout — onesPositions dalam frustum', () => {
  it('count=9 → 9 posisi, semua dalam ONES_BOUNDS', () => {
    const pos = onesPositions(9, false)
    expect(pos.length).toBe(9)
    for (const [x, y] of pos) {
      expect(x >= ONES_BOUNDS.minX).toBe(true)
      expect(x <= ONES_BOUNDS.maxX).toBe(true)
      expect(y >= ONES_BOUNDS.minY).toBe(true)
      expect(y <= ONES_BOUNDS.maxY).toBe(true)
    }
  })

  it('count=0 → array kosong', () => {
    expect(onesPositions(0, false)).toEqual([])
  })

  it('count=1 deterministik', () => {
    const a = onesPositions(1, false)
    const b = onesPositions(1, false)
    expect(a).toEqual(b)
    expect(a.length).toBe(1)
  })

  it('highlightGeser z +0.06 (bukan x/y)', () => {
    const plain = onesPositions(3, false)
    const hl = onesPositions(3, true)
    expect(hl[0][2] - plain[0][2]).toBeCloseTo(0.06)
  })

  it('F2 regression: count=19 ones juga dalam bounds', () => {
    const pos = onesPositions(19, false)
    expect(pos.length).toBe(19)
    for (const [x, y] of pos) {
      expect(x >= ONES_BOUNDS.minX).toBe(true)
      expect(x <= ONES_BOUNDS.maxX).toBe(true)
      expect(y >= ONES_BOUNDS.minY).toBe(true)
      expect(y <= ONES_BOUNDS.maxY).toBe(true)
    }
  })
})
