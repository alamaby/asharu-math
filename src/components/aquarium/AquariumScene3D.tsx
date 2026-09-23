import { useMemo } from 'react'
import Fish3D from './Fish3D'
import TensFishGroup3D from './TensFishGroup3D'
import AquariumEnvironment3D from './AquariumEnvironment3D'

type AquariumScene3DProps = {
  tens: number
  ones: number
  hundreds?: number
  highlight?: 'tens' | 'ones' | 'hundreds' | null
  animating?: boolean
  regroupProgress?: number
  splitProgress?: number
}

export const TENS_BOUNDS = { minX: -3.2, maxX: -0.6, minY: -1.0, maxY: 0.9 } as const
export const ONES_BOUNDS = { minX: 0.8, maxX: 3.9, minY: -1.0, maxY: 1.0 } as const
export const TENS_GROUP_RADIUS = 1.02

export function onesPositions(count: number, highlight: boolean): [number, number, number][] {
  // Grid in satuan area (right half: x +1 .. +4)
  const cols = count <= 6 ? 3 : 4
  const positions: [number, number, number][] = []
  const startX = 1.1
  const startY = 0.85
  const stepX = 0.95
  const stepY = 0.78
  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    let x = startX + col * stepX + (row % 2 === 1 ? 0.45 : 0)
    let y = startY - row * stepY
    // slight jitter so not rigid grid
    const jx = Math.sin(i * 1.9) * 0.12
    const jy = Math.cos(i * 2.3) * 0.1
    x += jx
    y += jy
    // clamp to ONES_BOUNDS to prevent overflow beyond frustum
    const cx = Math.min(ONES_BOUNDS.maxX, Math.max(ONES_BOUNDS.minX, x))
    const cy = Math.min(ONES_BOUNDS.maxY, Math.max(ONES_BOUNDS.minY, y))
    positions.push([cx, cy, 0.05 + (highlight ? 0.06 : 0)])
  }
  return positions
}

export function tensPositions(count: number): [number, number, number][] {
  // Left half: x -3.2 .. -0.6, staggered rows within TENS_BOUNDS
  if (count <= 0) return []
  const perRow = count <= 4 ? 2 : 3
  const positions: [number, number, number][] = []
  const startX = -2.9
  const stepX = 1.35
  const startY = 0.7
  const stepY = 1.05
  for (let i = 0; i < count; i++) {
    const col = i % perRow
    const row = Math.floor(i / perRow)
    const x = startX + col * stepX
    const y = startY - row * stepY
    const cx = Math.min(TENS_BOUNDS.maxX, Math.max(TENS_BOUNDS.minX, x))
    const cy = Math.min(TENS_BOUNDS.maxY, Math.max(TENS_BOUNDS.minY, y))
    positions.push([cx, cy, 0])
  }
  return positions
}

export default function AquariumScene3D({
  tens,
  ones,
  hundreds: _hundreds = 0,
  highlight = null,
  animating: _animating = false,
  regroupProgress: _regroupProgress = 1,
  splitProgress: _splitProgress = 1,
}: AquariumScene3DProps) {
  // S1: visibility selalu 1, animasi via animating guard di CheerfulAquarium (bukan scale)
  const visibleScale = 1
  // S5: overlay DOM peti ungu. Cap cegah overflow saat tambah 3-digit.
  const tPos = useMemo(() => tensPositions(Math.min(tens, 19)), [tens])
  const oPos = useMemo(
    () => onesPositions(Math.min(ones, 19), highlight === 'ones'),
    [ones, highlight],
  )

  return (
    <group dispose={null}>
      <AquariumEnvironment3D />
      {/* Tens groups — left zone */}
      {tPos.map((p, i) => (
        <TensFishGroup3D
          key={`g-${String(i)}`}
          position={p}
          highlight={highlight === 'tens'}
          animProgress={visibleScale}
          // S5: drift phase berbeda tiap grup
          swimPhase={i * 0.9}
        />
      ))}
      {/* Ones fish — right zone */}
      {oPos.map((p, i) => (
        <Fish3D
          key={`f-${String(i)}`}
          position={p}
          variant="ones"
          scale={0.58}
          wiggleOffset={i * 0.63}
          highlight={highlight === 'ones'}
          // S4: berenang dalam ONES_BOUNDS
          swimBounds={ONES_BOUNDS}
          swimSpeed={0.6 + (i % 5) * 0.12}
          swimPhase={i * 1.37}
        />
      ))}
    </group>
  )
}
