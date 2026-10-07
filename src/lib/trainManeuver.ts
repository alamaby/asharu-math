/**
 * Timeline maneuver belok kereta — pure, bisa diuji tanpa WebGL.
 * Mundur (ambil ancang-ancang) → jeda → maju menyurut kembali ke junction.
 * Fase maju dianimasikan sampai t=1 (posisi junction) agar tidak ada teleport
 * saat serah terima ke kurva cabang (branch t=0 = main t=1).
 * Nilai konstanta di sini bisa disesuaikan pengguna (review terpisah).
 */

export const MANEUVER_BACK_MS = 400
export const MANEUVER_PAUSE_MS = 150
export const MANEUVER_FORWARD_MS = 250
export const MANEUVER_TOTAL_MS = MANEUVER_BACK_MS + MANEUVER_PAUSE_MS + MANEUVER_FORWARD_MS

/** Seberapa jauh mundur, fraksi panjang jalur utama (0.1 ≈ 1.8 unit). */
export const MANEUVER_BACK_DISTANCE = 0.1

export type ManeuverPhase = 'back' | 'pause' | 'forward'

function easeOut(x: number): number {
  const clamped = Math.min(1, Math.max(0, x))
  return 1 - (1 - clamped) ** 2
}

function easeIn(x: number): number {
  const clamped = Math.min(1, Math.max(0, x))
  return clamped ** 2
}

export function computeManeuver(elapsedMs: number): { phase: ManeuverPhase; t: number } {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) {
    return { phase: 'back', t: 1 }
  }
  if (elapsedMs < MANEUVER_BACK_MS) {
    const progress = elapsedMs / MANEUVER_BACK_MS
    return { phase: 'back', t: 1 - MANEUVER_BACK_DISTANCE * easeOut(progress) }
  }
  if (elapsedMs < MANEUVER_BACK_MS + MANEUVER_PAUSE_MS) {
    return { phase: 'pause', t: 1 - MANEUVER_BACK_DISTANCE }
  }
  const progress = (elapsedMs - MANEUVER_BACK_MS - MANEUVER_PAUSE_MS) / MANEUVER_FORWARD_MS
  return {
    phase: 'forward',
    t: 1 - MANEUVER_BACK_DISTANCE + MANEUVER_BACK_DISTANCE * easeIn(progress),
  }
}
