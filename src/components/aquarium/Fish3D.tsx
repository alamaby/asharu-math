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
import {
  instantiateFishModel,
  loadFishModel,
  type LoadedFishEntity,
} from '../../lib/fishModelLoader'

// Shared low-poly geometries/materials — dipertahankan sebagai graceful fallback saat GLTF belum/gagal dimuat
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

  const modelKey = variant === 'ones' ? 'clownfish' : 'bluefish'
  const [gltfEntity, setGltfEntity] = useState<LoadedFishEntity | null>(() => {
    return instantiateFishModel(modelKey)
  })

  const bodyMat = variant === 'ones' ? matOnesBody : matTensBody
  const tailMat = variant === 'ones' ? matTailOnes : matTailTens
  const dotMat = variant === 'ones' ? matOnesDot : matTensDot

  // Deteksi prefers-reduced-motion untuk aksesibilitas anak yang sensitif gerakan
  useEffect(() => {
    try {
      reducedRef.current = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    } catch {
      reducedRef.current = false
    }
  }, [])

  // Muat model GLTF jika belum ada di cache in-memory, lalu instansiasikan salinan independen
  useEffect(() => {
    let active = true
    loadFishModel(modelKey)
      .then(() => {
        if (active) {
          const inst = instantiateFishModel(modelKey)
          if (inst?.action) {
            inst.action.time = wiggleOffset % (inst.action.getClip().duration || 1.2)
          }
          setGltfEntity(inst)
        }
      })
      .catch(() => {
        // Tetap gunakan fallback geometri balok prosedural jika pemuatan gagal
      })
    return () => {
      active = false
    }
  }, [modelKey, wiggleOffset])

  // Bersihkan mixer animasi saat unmount
  useEffect(() => {
    return () => {
      if (gltfEntity?.mixer) {
        gltfEntity.mixer.stopAllAction()
      }
    }
  }, [gltfEntity])

  useEffect(() => {
    posRef.current = position
    if (groupRef.current?.position?.set) {
      groupRef.current.position.set(position[0], position[1], position[2])
      groupRef.current.scale?.set(scale, scale, scale)
    }
  }, [position, scale])

  // Sinkronisasi flee offset ke ref untuk frame loop
  useEffect(() => {
    fleeRef.current = flee
  }, [flee])

  // Pembersihan timeout flee saat unmount
  useEffect(() => {
    return () => {
      if (fleeTimeoutRef.current !== null) {
        window.clearTimeout(fleeTimeoutRef.current)
        fleeTimeoutRef.current = null
      }
    }
  }, [])

  /**
   * Alasan Bisnis: Interaksi menghindar (fleeing) memberikan umpan balik visual menyenangkan
   * saat anak menyentuh ikan, memperkuat keterikatan anak pada materi visual tanpa mengubah nilai hitungan matematika.
   */
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

  // Wiggle mengapung + renang berkelana di dalam batas akuarium
  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return
    if (!progress.animationsEnabled) return

    // Kibaskan ekor GLTF dengan mixer bawaan jika animasi diizinkan
    if (gltfEntity?.mixer && !reducedRef.current) {
      gltfEntity.mixer.update(delta)
    }

    const target = posRef.current
    const hasSwim = !!swimBounds
    const reduced = reducedRef.current
    let baseX: number
    let baseY: number
    if (reduced) {
      // Reduced-motion: gerakan minimal tanpa wander/flee/flip
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
        // Klik pada fish memicu flee; stopPropagation agar tidak tembus ke parent
        handleFlee(e as unknown as ThreeEvent<PointerEvent>)
      }}
    >
      {/* Hit-area invisible sphere untuk memperluas area klik pada layar sentuh */}
      <mesh visible={false} position={[0, 0, 0]}>
        <sphereGeometry args={[0.55, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Tampilkan model 3D GLTF jika siap, atau fallback geometri prosedural jika belum/gagal */}
      {gltfEntity ? (
        <primitive object={gltfEntity.root} />
      ) : (
        <>
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
        </>
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
