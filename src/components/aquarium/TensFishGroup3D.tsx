import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import Fish3D from './Fish3D'

type TensFishGroup3DProps = {
  position?: [number, number, number]
  highlight?: boolean
  label?: string
  animProgress?: number
}

export default function TensFishGroup3D({
  position = [0, 0, 0],
  highlight = false,
  label = '10',
  animProgress = 1,
}: TensFishGroup3DProps) {
  const ringRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  // 10 ikan in circle formation
  const fishPositions = useMemo(() => {
    const r = 0.85
    return Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2
      return [Math.cos(a) * r, Math.sin(a) * r * 0.55, 0] as [number, number, number]
    })
  }, [])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime()
      // slow rotation of entire group
      groupRef.current.rotation.z = Math.sin(t * 0.35) * 0.06
    }
    if (ringRef.current) {
      const t = clock.getElapsedTime()
      const s = 1 + Math.sin(t * 1.6) * 0.04
      ringRef.current.scale.set(s, s, 1)
    }
  })

  const s = Math.min(1, animProgress)

  return (
    <group position={position} scale={s} ref={groupRef} dispose={null}>
      {/* Transparent bubble boundary */}
      <mesh ref={ringRef} position={[0, 0, -0.05]}>
        <ringGeometry args={[0.95, 1.02, 32]} />
        <meshBasicMaterial
          color={highlight ? '#0ea5e9' : '#7dd3fc'}
          transparent
          opacity={highlight ? 0.55 : 0.32}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, -0.12]}>
        <circleGeometry args={[1.02, 32]} />
        <meshBasicMaterial color="#e0f2fe" transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>
      {fishPositions.map((p, i) => (
        <Fish3D
          key={i}
          position={[p[0], p[1], 0.06]}
          variant="tens"
          scale={0.52}
          wiggleOffset={i * 0.45}
          highlight={highlight}
        />
      ))}
      {/* Center label 10 */}
      <Text
        position={[0, 0, 0.18]}
        fontSize={0.42}
        color={highlight ? '#0369a1' : '#0c4a6e'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        {label}
      </Text>
    </group>
  )
}
