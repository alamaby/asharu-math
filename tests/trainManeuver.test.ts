import { describe, expect, it } from 'vitest'
import {
  MANEUVER_BACK_DISTANCE,
  MANEUVER_TOTAL_MS,
  computeManeuver,
} from '../src/lib/trainManeuver'

describe('maneuver belok kereta', () => {
  it('batas fase sesuai timeline', () => {
    expect(computeManeuver(0)).toEqual({ phase: 'back', t: 1 })
    expect(computeManeuver(400).phase).toBe('pause')
    expect(computeManeuver(400).t).toBeCloseTo(1 - MANEUVER_BACK_DISTANCE, 2)
    expect(computeManeuver(550).phase).toBe('forward')
    expect(computeManeuver(800).t).toBeCloseTo(1, 5)
  })

  it('fase back mundur lalu fase forward kembali ke t=1 tanpa teleport', () => {
    let prev = 1
    let minT = 1
    for (let ms = 0; ms <= MANEUVER_TOTAL_MS; ms += 10) {
      const { t } = computeManeuver(ms)
      minT = Math.min(minT, t)
      // Tanpa teleport: perubahan antar sampel 10ms selalu halus
      expect(Math.abs(t - prev)).toBeLessThanOrEqual(0.05)
      prev = t
    }
    expect(minT).toBeCloseTo(1 - MANEUVER_BACK_DISTANCE, 2)
    expect(prev).toBeCloseTo(1, 5)
  })

  it('total durasi 800ms (back 400 + pause 150 + forward 250)', () => {
    expect(MANEUVER_TOTAL_MS).toBe(800)
  })

  it('input tidak valid diperlakukan sebagai awal maneuver', () => {
    expect(computeManeuver(NaN)).toEqual({ phase: 'back', t: 1 })
    expect(computeManeuver(-5)).toEqual({ phase: 'back', t: 1 })
  })
})
