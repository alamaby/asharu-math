import { useMemo, useRef, useEffect, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import Fish3D from './Fish3D'
import { useProgress } from '../../state/ProgressContext'
import { nextWanderPosition, fleeTarget } from '../../lib/aquariumSwim'
import { TENS_BOUNDS } from './AquariumScene3D'
import { playPickFish } from '../../lib/aquariumSound'

type TensFishGroup3DProps = {
  position?: [number, number, number]
  highlight?: boolean
  label?: string
  animProgress?: number
  swimPhase?: number
}

export default function TensFishGroup3D({
  position = [0, 0, 0],
  highlight = false,
  label = '10',
  animProgress = 1,
  swimPhase = 0,
}: TensFishGroup3DProps) {
  const ringRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const baseRef = useRef<[number, number, number]>(position)
  const fleeGTimeoutRef = useRef<number | null>(null)
  const [fleeG, setFleeG] = useState<[number, number]>([0, 0])
  const reducedRef = useRef(false)
  const { progress } = useProgress()

  // S7: detect prefers-reduced-motion once at mount
  useEffect(() => {
    try {
      reducedRef.current = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    } catch {
      reducedRef.current = false
    }
  }, [])

  // S5: sync base position when prop changes (new soal)
  useEffect(() => {
    baseRef.current = position
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2])
    }
  }, [position])

  // S6: sync flee state + cleanup timeout
  useEffect(() => {
    return () => {
      if (fleeGTimeoutRef.current !== null) {
        window.clearTimeout(fleeGTimeoutRef.current)
        fleeGTimeoutRef.current = null
      }
    }
  }, [])

  // S6: klik grup puluhan — fleeing visual only
  const handleGroupFlee = (e: ThreeEvent<PointerEvent>) => {
    if (!progress.animationsEnabled) return
    if (reducedRef.current) return
    if (Math.hypot(fleeG[0], fleeG[1]) > 0.05) return
    const curX = groupRef.current?.position.x ?? baseRef.current[0]
    const curY = groupRef.current?.position.y ?? baseRef.current[1]
    const [tx, ty] = fleeTarget(curX, curY, e.point.x, e.point.y, 1.0, TENS_BOUNDS)
    setFleeG([tx - baseRef.current[0], ty - baseRef.current[1]])
    try {
      playPickFish()
    } catch {
      /* abaikan audio gagal */
    }
    if (fleeGTimeoutRef.current !== null) window.clearTimeout(fleeGTimeoutRef.current)
    fleeGTimeoutRef.current = window.setTimeout(() => {
      fleeGTimeoutRef.current = null
      setFleeG([0, 0])
    }, 2200)
    e.stopPropagation()
  }

  // 10 ikan in circle formation
  const fishPositions = useMemo(() => {
    const r = 0.85
    return Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2
      return [Math.cos(a) * r, Math.sin(a) * r * 0.55, 0] as [number, number, number]
    })
  }, [])

  // S5: drift grup puluhan dalam TENS_BOUNDS
  useFrame(({ clock }) => {
    if (!progress.animationsEnabled) return
    const t = clock.getElapsedTime() + swimPhase
    if (groupRef.current) {
      // S7: reduced-motion → skip drift, hanya pulse ring
      if (reducedRef.current) {
        groupRef.current.position.set(baseRef.current[0], baseRef.current[1], baseRef.current[2])
        groupRef.current.rotation.z = Math.sin(t * 0.35) * 0.02
        if (ringRef.current) {
          const s = 1 + Math.sin(t * 1.6) * 0.02
          ringRef.current.scale.set(s, s, 1)
        }
        return
      }
      const [dx, dy] = nextWanderPosition(
        baseRef.current[0],
        baseRef.current[1],
        t,
        0.35,
        swimPhase,
        TENS_BOUNDS,
      )
      // S6: tambah offset flee ke drift target sebelum lerp
      const wantX = dx + fleeG[0]
      const wantY = dy + fleeG[1]
      const clampedX = Math.min(TENS_BOUNDS.maxX, Math.max(TENS_BOUNDS.minX, wantX))
      const clampedY = Math.min(TENS_BOUNDS.maxY, Math.max(TENS_BOUNDS.minY, wantY))
      groupRef.current.position.x += (clampedX - groupRef.current.position.x) * 0.05
      groupRef.current.position.y += (clampedY - groupRef.current.position.y) * 0.05
      groupRef.current.position.z = baseRef.current[2]
      // slow rotation of entire group
      groupRef.current.rotation.z = Math.sin(t * 0.35) * 0.06
    }
    if (ringRef.current) {
      const s = 1 + Math.sin(t * 1.6) * 0.04
      ringRef.current.scale.set(s, s, 1)
    }
  })

  const s = Math.max(0.0001, Math.min(1, animProgress))

  return (
    <group
      position={position}
      scale={s}
      ref={groupRef}
      dispose={null}
      onPointerDown={(e) => handleGroupFlee(e as unknown as ThreeEvent<PointerEvent>)}
    >
      {/* Hit-area invisible sphere untuk memperluas area klik grup */}
      <mesh visible={false} position={[0, 0, 0]}>
        <sphereGeometry args={[1.25, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
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
      {/* S5: inner fish wiggle-only, drift handled by group — tidak double-swim */}
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
