import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'

import { useProgress } from '../../state/ProgressContext'
import {
  clampToBounds,
  nextWanderPosition,
  fleeTarget,
  type SwimBounds,
} from '../../lib/aquariumSwim'
import { playPickFish } from '../../lib/aquariumSound'

// Shared low-poly geometries/materials — disposed on unmount via effect not needed as reused
const bodyGeo = new THREE.BoxGeometry(0.55, 0.32, 0.22)
const tailGeo = new THREE.ConeGeometry(0.18, 0.32, 6)
const eyeWhiteGeo = new THREE.SphereGeometry(0.07, 8, 8)
const eyePupilGeo = new THREE.SphereGeometry(0.035, 6, 6)
const dotGeo = new THREE.SphereGeometry(0.06, 6, 6)

const matOnesBody = new THREE.MeshLambertMaterial({ color: '#f59e0b' })
const matTensBody = new THREE.MeshLambertMaterial({ color: '#0ea5e9' })
const matTailOnes = new THREE.MeshLambertMaterial({ color: '#fbbf24' })
const matTailTens = new THREE.MeshLambertMaterial({ color: '#38bdf8' })
const matWhite = new THREE.MeshLambertMaterial({ color: '#ffffff' })
const matBlack = new THREE.MeshLambertMaterial({ color: '#1e293b' })
const matOnesDot = new THREE.MeshLambertMaterial({ color: '#b45309' })
const matTensDot = new THREE.MeshLambertMaterial({ color: '#075985' })

type Fish3DProps = {
  position?: [number, number, number]
  variant?: 'ones' | 'tens'
  scale?: number
  wiggleOffset?: number
  highlight?: boolean
  swimBounds?: SwimBounds
  swimSpeed?: number
  swimPhase?: number
}

export default function Fish3D({
  position = [0, 0, 0],
  variant = 'ones',
  scale = 1,
  wiggleOffset = 0,
  highlight = false,
  swimBounds = undefined,
  swimSpeed = 0.8,
  swimPhase = wiggleOffset,
}: Fish3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const posRef = useRef<[number, number, number]>(position)
  const fleeRef = useRef<[number, number]>([0, 0])
  const fleeTimeoutRef = useRef<number | null>(null)
  const [flee, setFlee] = useState<[number, number]>([0, 0])
  const reducedRef = useRef(false)
  const { progress } = useProgress()
  const bodyMat = variant === 'ones' ? matOnesBody : matTensBody
  const tailMat = variant === 'ones' ? matTailOnes : matTailTens
  const dotMat = variant === 'ones' ? matOnesDot : matTensDot

  // S7: detect prefers-reduced-motion once at mount
  useEffect(() => {
    try {
      reducedRef.current = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    } catch {
      reducedRef.current = false
    }
  }, [])

  useEffect(() => {
    posRef.current = position
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2])
      groupRef.current.scale.set(scale, scale, scale)
    }
  }, [position, scale])

  // S6: sync internal flee state to ref
  useEffect(() => {
    fleeRef.current = flee
  }, [flee])

  // S6: cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fleeTimeoutRef.current !== null) {
        window.clearTimeout(fleeTimeoutRef.current)
        fleeTimeoutRef.current = null
      }
    }
  }, [])

  // S6: klik menghindar — visual only, tidak ubah hitungan
  const handleFlee = (e: ThreeEvent<PointerEvent>) => {
    if (!progress.animationsEnabled) return
    if (reducedRef.current) return
    const curX = groupRef.current?.position.x ?? posRef.current[0]
    const curY = groupRef.current?.position.y ?? posRef.current[1]
    // throttle: abaikan jika flee masih aktif
    if (Math.hypot(flee[0], flee[1]) > 0.05) return
    const bounds = swimBounds ?? { minX: curX - 1, maxX: curX + 1, minY: curY - 1, maxY: curY + 1 }
    const [tx, ty] = fleeTarget(curX, curY, e.point.x, e.point.y, 1.2, bounds)
    // simpan sebagai offset dari base target agar swim tetap jalan
    setFlee([tx - posRef.current[0], ty - posRef.current[1]])
    try {
      playPickFish()
    } catch {
      /* abaikan audio gagal */
    }
    if (fleeTimeoutRef.current !== null) window.clearTimeout(fleeTimeoutRef.current)
    fleeTimeoutRef.current = window.setTimeout(() => {
      fleeTimeoutRef.current = null
      setFlee([0, 0])
    }, 2500)
    e.stopPropagation()
  }

  // S4/S7: floating wiggle + swim wander in bounds — skip when animations disabled or reduced-motion
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    if (!progress.animationsEnabled) return
    const target = posRef.current
    const hasSwim = !!swimBounds
    const reduced = reducedRef.current
    let baseX: number
    let baseY: number
    if (reduced) {
      // S7: reduced-motion → hanya wiggle mini, skip wander/flee/flip
      const t = clock.getElapsedTime() + wiggleOffset
      baseX = target[0]
      baseY = target[1] + Math.sin(t * 1.2) * 0.02
      groupRef.current.position.x += (baseX - groupRef.current.position.x) * 0.08
      groupRef.current.position.y += (baseY - groupRef.current.position.y) * 0.08
      groupRef.current.position.z = target[2]
      groupRef.current.rotation.z = Math.sin(t * 0.9) * 0.04
      if (highlight) {
        const s = 1 + Math.sin(t * 2.5) * 0.03
        groupRef.current.scale.set(s * scale, s * scale, s * scale)
      }
      return
    }
    if (hasSwim) {
      const t = clock.getElapsedTime() + wiggleOffset
      const [wx, wy] = nextWanderPosition(target[0], target[1], t, swimSpeed, swimPhase, swimBounds)
      baseX = wx
      baseY = wy
    } else {
      const t = clock.getElapsedTime() + wiggleOffset
      baseX = target[0]
      baseY = target[1] + Math.sin(t * 1.2) * 0.06
    }
    const fx = fleeRef.current[0]
    const fy = fleeRef.current[1]
    const wantX = baseX + fx
    const wantY = baseY + fy
    const clamped = hasSwim ? clampToBounds(wantX, wantY, swimBounds) : ([wantX, wantY] as const)
    // gerak halus: lerp 8%/frame agar tidak teleport
    groupRef.current.position.x += (clamped[0] - groupRef.current.position.x) * 0.08
    groupRef.current.position.y += (clamped[1] - groupRef.current.position.y) * 0.08
    groupRef.current.position.z = target[2]
    // flip arah berdasarkan velocity
    const vx = clamped[0] - groupRef.current.position.x
    const desiredY = vx < -0.002 ? Math.PI : 0
    let dy = desiredY - groupRef.current.rotation.y
    if (dy > Math.PI) dy -= Math.PI * 2
    if (dy < -Math.PI) dy += Math.PI * 2
    groupRef.current.rotation.y += dy * 0.1
    const t = clock.getElapsedTime() + wiggleOffset
    groupRef.current.rotation.z = Math.sin(t * 0.9) * 0.08
    if (highlight) {
      const s = 1 + Math.sin(t * 2.5) * 0.06
      groupRef.current.scale.set(s * scale, s * scale, s * scale)
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      dispose={null}
      onPointerDown={(e) => {
        // S6: klik pada fish memicu flee; stopPropagation agar tidak tembus ke parent
        handleFlee(e as unknown as ThreeEvent<PointerEvent>)
      }}
    >
      {/* Hit-area invisible sphere untuk memperluas area klik */}
      <mesh visible={false} position={[0, 0, 0]}>
        <sphereGeometry args={[0.55, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* Body */}
      <mesh geometry={bodyGeo} material={bodyMat} castShadow={false} receiveShadow={false} />
      {/* Tail */}
      <mesh
        geometry={tailGeo}
        material={tailMat}
        position={[-0.42, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      />
      {/* Eyes */}
      <mesh geometry={eyeWhiteGeo} material={matWhite} position={[0.18, 0.08, 0.12]} />
      <mesh geometry={eyeWhiteGeo} material={matWhite} position={[0.18, 0.08, -0.12]} />
      <mesh geometry={eyePupilGeo} material={matBlack} position={[0.22, 0.08, 0.12]} />
      <mesh geometry={eyePupilGeo} material={matBlack} position={[0.22, 0.08, -0.12]} />
      {/* Pattern dot for not relying only on color (spec D) */}
      <mesh geometry={dotGeo} material={dotMat} position={[0, 0.12, 0.13]} scale={0.7} />
      {variant === 'tens' && (
        <mesh geometry={dotGeo} material={dotMat} position={[-0.08, 0.1, -0.12]} scale={0.6} />
      )}
      {/* Highlight ring */}
      {highlight && (
        <mesh position={[0, -0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.28, 0.34, 16]} />
          <meshBasicMaterial
            color={variant === 'ones' ? '#f59e0b' : '#0ea5e9'}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}
