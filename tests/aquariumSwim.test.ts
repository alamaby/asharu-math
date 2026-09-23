import { describe, it, expect } from 'vitest'
import {
  seeded01,
  clampToBounds,
  nextWanderPosition,
  fleeTarget,
  type SwimBounds,
} from '../src/lib/aquariumSwim'

const ONES_BOUNDS: SwimBounds = { minX: 0.8, maxX: 3.9, minY: -1, maxY: 1 }
const TENS_BOUNDS: SwimBounds = { minX: -3.2, maxX: -0.6, minY: -1, maxY: 0.9 }

describe('aquariumSwim — seeded01 deterministik', () => {
  it('(3, 0.11) dua panggil → sama', () => {
    const a = seeded01(3, 0.11)
    const b = seeded01(3, 0.11)
    expect(a).toBe(b)
  })

  it('range selalu 0..1 (excl 1)', () => {
    for (let i = 0; i < 100; i++) {
      const v = seeded01(i, 0.5)
      expect(v >= 0 && v < 1).toBe(true)
    }
  })

  it('phase berbeda → hasil berbeda', () => {
    expect(seeded01(3, 0.11)).not.toBe(seeded01(3, 0.23))
  })
})

describe('aquariumSwim — clampToBounds', () => {
  it('nilai dalam bounds tetap', () => {
    const [x, y] = clampToBounds(2, 0.5, ONES_BOUNDS)
    expect(x).toBe(2)
    expect(y).toBe(0.5)
  })

  it('NaN → return center bounds', () => {
    const [x, y] = clampToBounds(NaN, NaN, ONES_BOUNDS)
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(y)).toBe(true)
    expect(x).toBeCloseTo((ONES_BOUNDS.minX + ONES_BOUNDS.maxX) / 2)
    expect(y).toBeCloseTo((ONES_BOUNDS.minY + ONES_BOUNDS.maxY) / 2)
  })

  it('bounds terbalik di-swap otomatis', () => {
    const bad: SwimBounds = { minX: 5, maxX: 1, minY: 5, maxY: 1 }
    const [x, y] = clampToBounds(3, 3, bad)
    expect(x).toBe(3)
    expect(y).toBe(3)
  })
})

describe('aquariumSwim — nextWanderPosition', () => {
  it('hasil selalu dalam ONES_BOUNDS', () => {
    for (let t = 0; t < 50; t++) {
      const [x, y] = nextWanderPosition(2, 0, t * 0.1, 0.8, 1.37, ONES_BOUNDS)
      expect(x >= ONES_BOUNDS.minX).toBe(true)
      expect(x <= ONES_BOUNDS.maxX).toBe(true)
      expect(y >= ONES_BOUNDS.minY).toBe(true)
      expect(y <= ONES_BOUNDS.maxY).toBe(true)
    }
  })

  it('time < 0 → return clamped input', () => {
    const [x, y] = nextWanderPosition(2, 0, -1, 0.8, 1.37, ONES_BOUNDS)
    expect(x).toBe(2)
    expect(y).toBe(0)
  })

  it('speed <= 0 → return clamped input', () => {
    const [x, y] = nextWanderPosition(2, 0, 5, 0, 1.37, ONES_BOUNDS)
    expect(x).toBe(2)
    expect(y).toBe(0)
  })
})

describe('aquariumSwim — fleeTarget menjauh dari klik', () => {
  it('px > cx → tx > px (menjauh)', () => {
    const [tx] = fleeTarget(2, 0, 1.5, 0, 1.2, ONES_BOUNDS)
    expect(tx).toBeGreaterThan(2)
    expect(tx <= ONES_BOUNDS.maxX).toBe(true)
  })

  it('px == cx (len ~ 0) → tidak NaN, tetap positif', () => {
    const [tx, ty] = fleeTarget(2, 0, 2, 0, 1.2, ONES_BOUNDS)
    expect(Number.isFinite(tx)).toBe(true)
    expect(Number.isFinite(ty)).toBe(true)
    expect(tx).toBeGreaterThan(2)
  })

  it('strength besar (99) di-clamp, tetap dalam bounds', () => {
    const [tx, ty] = fleeTarget(2, 0, 1.5, 0, 99, ONES_BOUNDS)
    expect(tx >= ONES_BOUNDS.minX).toBe(true)
    expect(tx <= ONES_BOUNDS.maxX).toBe(true)
    expect(ty >= ONES_BOUNDS.minY).toBe(true)
    expect(ty <= ONES_BOUNDS.maxY).toBe(true)
  })

  it('arah berlawanan (klik di kanan ikan) → ikan lari ke kiri', () => {
    const [tx] = fleeTarget(2, 0, 3, 0, 1.2, ONES_BOUNDS)
    expect(tx).toBeLessThan(2)
    expect(tx >= ONES_BOUNDS.minX).toBe(true)
  })
})

describe('aquariumSwim — determinisme pure math', () => {
  it('panggil ulang dengan params sama → hasil sama', () => {
    const a = nextWanderPosition(1, 0.5, 10, 0.8, 1.37, ONES_BOUNDS)
    const b = nextWanderPosition(1, 0.5, 10, 0.8, 1.37, ONES_BOUNDS)
    expect(a[0]).toBe(b[0])
    expect(a[1]).toBe(b[1])
  })

  it('fleeTarget vs TENS_BOUNDS tetap dalam bounds', () => {
    const [tx] = fleeTarget(-2, 0, -2.5, 0, 1.2, TENS_BOUNDS)
    expect(tx >= TENS_BOUNDS.minX).toBe(true)
    expect(tx <= TENS_BOUNDS.maxX).toBe(true)
  })
})
