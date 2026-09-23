/** Pure math renang+flee akuarium — deterministik, tanpa three/react. */

export interface SwimBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export function seeded01(i: number, s: number): number {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453
  return x - Math.floor(x)
}

export function clampToBounds(x: number, y: number, b: SwimBounds): [number, number] {
  // swap jika bounds terbalik
  const minX = Math.min(b.minX, b.maxX)
  const maxX = Math.max(b.minX, b.maxX)
  const minY = Math.min(b.minY, b.maxY)
  const maxY = Math.max(b.minY, b.maxY)
  if (!isFinite(x) || !isFinite(y) || Number.isNaN(x) || Number.isNaN(y)) {
    return [(minX + maxX) / 2, (minY + maxY) / 2]
  }
  return [Math.min(maxX, Math.max(minX, x)), Math.min(maxY, Math.max(minY, y))]
}

export function nextWanderPosition(
  px: number,
  py: number,
  time: number,
  speed: number,
  phase: number,
  bounds: SwimBounds,
): [number, number] {
  if (time < 0 || speed <= 0) {
    return clampToBounds(px, py, bounds)
  }
  const nx = px + Math.sin(time * speed + phase) * 0.35
  const ny = py + Math.cos(time * speed * 0.8 + phase * 1.7) * 0.25
  return clampToBounds(nx, ny, bounds)
}

export function fleeTarget(
  px: number,
  py: number,
  cx: number,
  cy: number,
  strength: number,
  bounds: SwimBounds,
): [number, number] {
  const clampedStrength = Math.min(1.5, Math.max(0.5, strength))
  const dx = px - cx
  const dy = py - cy
  const len = Math.hypot(dx, dy)
  if (len < 0.0001) {
    return clampToBounds(px + clampedStrength * 0.7, py + clampedStrength * 0.21, bounds)
  }
  const nx = px + (dx / len) * clampedStrength
  const ny = py + (dy / len) * clampedStrength * 0.8
  return clampToBounds(nx, ny, bounds)
}

export const ONES_SWIM = {
  speedMin: 0.5,
  speedMax: 1.1,
  ampX: 0.35,
  ampY: 0.25,
} as const

export const TENS_DRIFT = {
  ampX: 0.2,
  ampY: 0.15,
  speed: 0.35,
} as const
