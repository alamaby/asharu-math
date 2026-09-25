import { describe, expect, it } from 'vitest'
import { _variantHelpers, isValidTrainVariant, pickTrainVariant } from '../src/lib/trainVariants'

describe('train variants', () => {
  it('seed sama menghasilkan variant sama', () => {
    const a = pickTrainVariant(12345)
    const b = pickTrainVariant(12345)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('50 seed menghasilkan variasi lokomotif', () => {
    const shapes = new Set<string>()
    for (let i = 0; i < 50; i++) {
      shapes.add(pickTrainVariant(i).loco)
    }
    expect(shapes.size).toBeGreaterThanOrEqual(2)
  })

  it('semua hasil memakai shape/kind/color dari daftar', () => {
    for (let i = 0; i < 100; i++) {
      const v = pickTrainVariant(i * 7919)
      expect(_variantHelpers.LOCO_SHAPES).toContain(v.loco)
      expect(_variantHelpers.LOCO_COLORS).toContain(v.locoColor)
      expect(v.wagons.length).toBeGreaterThanOrEqual(1)
      expect(v.wagons.length).toBeLessThanOrEqual(2)
      for (const w of v.wagons) {
        expect(_variantHelpers.WAGON_KINDS).toContain(w.kind)
        expect(_variantHelpers.WAGON_COLORS).toContain(w.color)
      }
    }
  })

  it('dua gerbong selalu berbeda jenis', () => {
    for (let i = 0; i < 200; i++) {
      const v = pickTrainVariant(i)
      if (v.wagons.length === 2) {
        expect(v.wagons[0]!.kind).not.toBe(v.wagons[1]!.kind)
      }
    }
  })

  it('isValidTrainVariant menolak input rusak', () => {
    expect(isValidTrainVariant(null)).toBe(false)
    expect(isValidTrainVariant({ loco: 'x' })).toBe(false)
    expect(isValidTrainVariant({ loco: 'classic', locoColor: '#fff', wagons: [] })).toBe(false)
    expect(isValidTrainVariant({ loco: 'classic', locoColor: '#fff', wagons: [3] })).toBe(false)
    expect(
      isValidTrainVariant({
        loco: 'classic',
        locoColor: 'red',
        wagons: [{ kind: 'boxcar', color: '#f5b942' }],
      }),
    ).toBe(false)
    expect(
      isValidTrainVariant({
        loco: 'classic',
        locoColor: '#e05555',
        wagons: [{ kind: 'boxcar', color: '#f5b942' }],
      }),
    ).toBe(true)
  })
})
