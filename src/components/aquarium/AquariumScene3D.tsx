import { useMemo } from 'react'
import Fish3D from './Fish3D'
import TensFishGroup3D from './TensFishGroup3D'
import AquariumEnvironment3D from './AquariumEnvironment3D'

type AquariumScene3DProps = {
  tens: number
  ones: number
  highlight?: 'tens' | 'ones' | null
  animating?: boolean
  regroupProgress?: number
  splitProgress?: number
}

function onesPositions(count: number, highlight: boolean): [number, number, number][] {
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
    const x = startX + col * stepX + (row % 2 === 1 ? 0.45 : 0)
    const y = startY - row * stepY
    // slight jitter so not rigid grid
    const jx = (Math.sin(i * 1.9) * 0.12)
    const jy = (Math.cos(i * 2.3) * 0.1)
    positions.push([x + jx, y + jy, 0.05 + (highlight ? 0.06 : 0)])
  }
  return positions
}

function tensPositions(count: number): [number, number, number][] {
  // Left half: x -4 .. -0.5, staggered rows
  const perRow = 2
  const positions: [number, number, number][] = []
  const startX = -3.8
  const stepX = 2.45
  const startY = 0.75
  const stepY = 1.55
  for (let i = 0; i < count; i++) {
    const col = i % perRow
    const row = Math.floor(i / perRow)
    const x = startX + col * stepX
    const y = startY - row * stepY
    positions.push([x, y, 0])
  }
  return positions
}

export default function AquariumScene3D({
  tens,
  ones,
  highlight = null,
  animating: _animating = false,
  regroupProgress = 1,
  splitProgress = 1,
}: AquariumScene3DProps) {
  const tPos = useMemo(() => tensPositions(tens), [tens])
  const oPos = useMemo(() => onesPositions(ones, highlight === 'ones'), [ones, highlight])

  const rg = Math.min(1, regroupProgress)
  const sp = Math.min(1, splitProgress)

  return (
    <group dispose={null}>
      <AquariumEnvironment3D />
      {/* Tens groups — left zone */}
      {tPos.map((p, i) => (
        <TensFishGroup3D
          key={`g-${String(i)}`}
          position={p}
          highlight={highlight === 'tens'}
          animProgress={rg * sp}
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
        />
      ))}
    </group>
  )
}
