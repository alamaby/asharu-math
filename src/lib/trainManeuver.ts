/**
 * Timeline maneuver belok kereta — pure, bisa diuji tanpa WebGL.
 * Nilai konstanta di sini bisa disesuaikan pengguna (review terpisah).
 */

export const MANEUVER_BACK_MS = 350
export const MANEUVER_PAUSE_MS = 250
export const MANEUVER_TOTAL_MS = MANEUVER_BACK_MS + MANEUVER_PAUSE_MS

export type ManeuverPhase = 'back' | 'pause' | 'forward'

function easeOut(x: number): number {
  const clamped = Math.min(1, Math.max(0, x))
  return 1 - (1 - clamped) ** 2
}

export function computeManeuver(elapsedMs: number): { phase: ManeuverPhase; t: number } {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) {
    return { phase: 'back', t: 1 }
  }
  if (elapsedMs < MANEUVER_BACK_MS) {
    const progress = elapsedMs / MANEUVER_BACK_MS
    return { phase: 'back', t: 1 - 0.07 * easeOut(progress) }
  }
  if (elapsedMs < MANEUVER_TOTAL_MS) {
    return { phase: 'pause', t: 0.93 }
  }
  return { phase: 'forward', t: 0.93 }
}
