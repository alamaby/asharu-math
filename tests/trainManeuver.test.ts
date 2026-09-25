import { describe, expect, it } from 'vitest'
import { MANEUVER_TOTAL_MS, computeManeuver } from '../src/lib/trainManeuver'

describe('maneuver belok kereta', () => {
  it('batas fase sesuai timeline', () => {
    expect(computeManeuver(0)).toEqual({ phase: 'back', t: 1 })
    expect(computeManeuver(350).phase).toBe('pause')
    expect(computeManeuver(350).t).toBeCloseTo(0.93, 2)
    expect(computeManeuver(600)).toEqual({ phase: 'forward', t: 0.93 })
  })

  it('nilai t pada fase back tidak pernah naik', () => {
    let prev = 1
    for (let ms = 0; ms < 350; ms += 25) {
      const { t } = computeManeuver(ms)
      expect(t).toBeLessThanOrEqual(prev + 1e-9)
      prev = t
    }
  })

  it('total durasi 600ms', () => {
    expect(MANEUVER_TOTAL_MS).toBe(600)
  })

  it('input tidak valid diperlakukan sebagai awal maneuver', () => {
    expect(computeManeuver(NaN)).toEqual({ phase: 'back', t: 1 })
    expect(computeManeuver(-5)).toEqual({ phase: 'back', t: 1 })
  })
})
