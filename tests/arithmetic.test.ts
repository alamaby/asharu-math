import { describe, expect, it } from 'vitest'
import { hasBorrow, hasCarry, planAddition, planSubtraction } from '../src/lib/arithmetic'

describe('planAddition', () => {
  it('26 + 87 = 113 dengan carry dari satuan ke puluhan', () => {
    const plan = planAddition(26, 87)
    expect(plan.result).toBe(113)
    expect(plan.carryCount).toBe(2)
    const units = plan.columns[0]
    expect(units.a).toBe(6)
    expect(units.b).toBe(7)
    expect(units.rawSum).toBe(13)
    expect(units.resultDigit).toBe(3)
    expect(units.carryOut).toBe(1)
    const tens = plan.columns[1]
    expect(tens.carryIn).toBe(1)
    expect(tens.rawSum).toBe(11)
    expect(tens.resultDigit).toBe(1)
    expect(tens.carryOut).toBe(1)
    const hundreds = plan.columns[2]
    expect(hundreds.carryIn).toBe(1)
    expect(hundreds.resultDigit).toBe(1)
  })

  it('23 + 14 = 37 tanpa carry', () => {
    const plan = planAddition(23, 14)
    expect(plan.result).toBe(37)
    expect(plan.carryCount).toBe(0)
    expect(plan.columns).toHaveLength(2)
  })

  it('999 + 1 = 1000 dengan carry berantai', () => {
    const plan = planAddition(999, 1)
    expect(plan.result).toBe(1000)
    expect(plan.carryCount).toBe(3)
    expect(plan.columns[0]).toMatchObject({ rawSum: 10, resultDigit: 0, carryOut: 1 })
    expect(plan.columns[1]).toMatchObject({ carryIn: 1, rawSum: 10, resultDigit: 0, carryOut: 1 })
    expect(plan.columns[2]).toMatchObject({ carryIn: 1, rawSum: 10, resultDigit: 0, carryOut: 1 })
    expect(plan.columns[3]).toMatchObject({ carryIn: 1, resultDigit: 1 })
    // Semua kolom tetap sejajar: satuan di indexFromRight 0
    expect(plan.columns[0].place).toBe('units')
    expect(plan.columns[3].place).toBe('thousands')
  })

  it('1234 + 4321 = 5555 tanpa carry', () => {
    const plan = planAddition(1234, 4321)
    expect(plan.result).toBe(5555)
    expect(plan.carryCount).toBe(0)
  })
})

describe('planSubtraction', () => {
  it('52 - 28 = 24 dengan borrow dari puluhan ke satuan', () => {
    const plan = planSubtraction(52, 28)
    expect(plan.result).toBe(24)
    expect(plan.borrowCount).toBe(1)
    const units = plan.columns[0]
    expect(units.topOriginal).toBe(2)
    expect(units.bottom).toBe(8)
    expect(units.borrowedFromLeft).toBe(true)
    expect(units.topAfter).toBe(12)
    expect(units.resultDigit).toBe(4)
    const tens = plan.columns[1]
    expect(tens.lentToRight).toBe(true)
    expect(tens.topAfter).toBe(4)
    expect(tens.resultDigit).toBe(2)
  })

  it('76 - 24 = 52 tanpa borrow', () => {
    const plan = planSubtraction(76, 24)
    expect(plan.result).toBe(52)
    expect(plan.borrowCount).toBe(0)
  })

  it('1000 - 1 = 999 dengan borrow berantai dan visual tidak rusak', () => {
    const plan = planSubtraction(1000, 1)
    expect(plan.result).toBe(999)
    expect(plan.borrowCount).toBe(3)
    expect(plan.columns[0]).toMatchObject({ topAfter: 10, resultDigit: 9 })
    expect(plan.columns[1]).toMatchObject({
      topAfter: 9,
      resultDigit: 9,
      lentToRight: true,
      borrowedFromLeft: true,
    })
    expect(plan.columns[2]).toMatchObject({
      topAfter: 9,
      resultDigit: 9,
      lentToRight: true,
      borrowedFromLeft: true,
    })
    expect(plan.columns[3]).toMatchObject({ topAfter: 0, resultDigit: 0, lentToRight: true })
  })

  it('4000 - 1756 = 2244 dengan borrow berantai', () => {
    const plan = planSubtraction(4000, 1756)
    expect(plan.result).toBe(2244)
    expect(plan.borrowCount).toBe(3)
    expect(plan.columns.map((c) => c.resultDigit)).toEqual([4, 4, 2, 2])
  })

  it('menolak hasil negatif', () => {
    expect(() => planSubtraction(12, 25)).toThrow()
  })
})

describe('deteksi carry/borrow', () => {
  it('hasCarry', () => {
    expect(hasCarry(26, 87)).toBe(true)
    expect(hasCarry(23, 14)).toBe(false)
    expect(hasCarry(999, 1)).toBe(true)
  })

  it('hasBorrow', () => {
    expect(hasBorrow(52, 28)).toBe(true)
    expect(hasBorrow(76, 24)).toBe(false)
    expect(hasBorrow(1000, 1)).toBe(true)
    expect(hasBorrow(12, 25)).toBe(false)
  })
})
