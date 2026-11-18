import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

import { useProgress } from '../../state/ProgressContext'
import {
  AQUARIUM_ENV_SCALES,
  instantiateAquariumEnvModel,
  preloadAquariumEnvModels,
} from '../../lib/aquariumEnvLoader'

const sandMat = new THREE.MeshLambertMaterial({ color: '#fef3c7' })
const rockMat = new THREE.MeshLambertMaterial({ color: '#a8a29e' })
const plantMat = new THREE.MeshLambertMaterial({ color: '#34d399' })
const plantDarkMat = new THREE.MeshLambertMaterial({ color: '#059669' })

interface RockConfig {
  pos: [number, number, number]
  rotY: number
  scaleMultiplier: number
  fallbackScale: [number, number, number]
  fallbackArgs: [number, number, number]
}

const ROCKS: RockConfig[] = [
  {
    pos: [-3.6, -1.85, 0.2],
    rotY: 0.1,
    scaleMultiplier: 1.0,
    fallbackScale: [0.9, 0.55, 0.6],
    fallbackArgs: [1, 0.7, 0.7],
  },
  {
    pos: [3.4, -1.9, -0.1],
    rotY: 1.2,
    scaleMultiplier: 0.8,
    fallbackScale: [0.7, 0.45, 0.55],
    fallbackArgs: [1, 0.7, 0.7],
  },
  {
    pos: [1.2, -1.95, -0.2],
    rotY: 2.5,
    scaleMultiplier: 0.65,
    fallbackScale: [0.5, 0.35, 0.4],
    fallbackArgs: [0.9, 0.6, 0.6],
  },
]

interface PlantConfig {
  pos: [number, number, number]
  rotY: number
  scaleMultiplier: number
  fallbackCylinderArgs: [number, number, number, number]
  fallbackMat: THREE.Material
}

const PLANTS: PlantConfig[] = [
  {
    pos: [-4.2, -1.7, -0.15],
    rotY: 0.2,
    scaleMultiplier: 1.1,
    fallbackCylinderArgs: [0.06, 0.08, 1.1, 6],
    fallbackMat: plantMat,
  },
  {
    pos: [-3.95, -1.65, -0.05],
    rotY: 1.4,
    scaleMultiplier: 0.95,
    fallbackCylinderArgs: [0.05, 0.07, 0.85, 6],
    fallbackMat: plantDarkMat,
  },
  {
    pos: [4.0, -1.68, 0.05],
    rotY: 0.8,
    scaleMultiplier: 1.05,
    fallbackCylinderArgs: [0.05, 0.07, 0.95, 6],
    fallbackMat: plantMat,
  },
  {
    pos: [3.75, -1.62, -0.1],
    rotY: 2.1,
    scaleMultiplier: 0.8,
    fallbackCylinderArgs: [0.04, 0.06, 0.7, 6],
    fallbackMat: plantDarkMat,
  },
]

// Karang laut membentang di dasar pasir tengah latar belakang (z = -0.35, y = -2.18)
const CORAL_POS: [number, number, number] = [0, -2.18, -0.35]

export default function AquariumEnvironment3D() {
  const bubbleRefs = useRef<THREE.Mesh[]>([])
  const { progress } = useProgress()

  const [coralInstance, setCoralInstance] = useState<THREE.Group | null>(() =>
    instantiateAquariumEnvModel('coral'),
  )
  const [rockInstances, setRockInstances] = useState<(THREE.Group | null)[]>(() =>
    ROCKS.map((r) =>
      instantiateAquariumEnvModel('rock', AQUARIUM_ENV_SCALES.rock * r.scaleMultiplier),
    ),
  )
  const [seaweedInstances, setSeaweedInstances] = useState<(THREE.Group | null)[]>(() =>
    PLANTS.map((p) =>
      instantiateAquariumEnvModel('seaweed', AQUARIUM_ENV_SCALES.seaweed * p.scaleMultiplier),
    ),
  )

  useEffect(() => {
    let active = true
    preloadAquariumEnvModels()
      .then(() => {
        if (!active) return
        setCoralInstance(instantiateAquariumEnvModel('coral'))
        setRockInstances(
          ROCKS.map((r) =>
            instantiateAquariumEnvModel('rock', AQUARIUM_ENV_SCALES.rock * r.scaleMultiplier),
          ),
        )
        setSeaweedInstances(
          PLANTS.map((p) =>
            instantiateAquariumEnvModel('seaweed', AQUARIUM_ENV_SCALES.seaweed * p.scaleMultiplier),
          ),
        )
      })
      .catch(() => {
        // Fallback otomatis ke geometri prosedural jika pemuatan model GLTF gagal
      })
    return () => {
      active = false
    }
  }, [])

  // bubbles rising — max 10, deterministic seeds (avoid Math.random purity lint)
  const bubbleData = useMemo(() => {
    const seeded = (i: number, s: number): number => {
      // simple deterministic pseudo-random 0..1 dari index
      const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453
      return x - Math.floor(x)
    }
    return Array.from({ length: 10 }, (_, i) => ({
      x: (seeded(i, 0.11) - 0.5) * 8,
      y0: -1.2 - seeded(i, 0.23) * 0.6,
      speed: 0.22 + seeded(i, 0.37) * 0.28,
      offset: i * 0.7,
      size: 0.04 + seeded(i, 0.53) * 0.05,
      opacity: 0.18 + seeded(i, 0.71) * 0.18,
    }))
  }, [])

  useFrame(({ clock }) => {
    if (!progress.animationsEnabled) return
    const t = clock.getElapsedTime()
    for (let i = 0; i < bubbleRefs.current.length; i++) {
      const m = bubbleRefs.current[i]
      if (!m) continue
      const d = bubbleData[i]
      const y = d.y0 + ((t * d.speed + d.offset) % 3.2)
      m.position.y = y
      m.position.x = d.x + Math.sin(t * 0.6 + d.offset) * 0.18
    }
  })

  return (
    <group dispose={null}>
      {/* Sand bottom plane */}
      <mesh position={[0, -2.2, -0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={false}>
        <planeGeometry args={[14, 3]} />
        <primitive object={sandMat} attach="material" />
      </mesh>

      {/* Terumbu Karang GLTF (Bioluminescent Coral) di dasar akuarium */}
      {coralInstance && (
        <group position={CORAL_POS}>
          <primitive object={coralInstance} />
        </group>
      )}

      {/* Rocks — Model GLTF karang alami dengan graceful fallback ke balok abu-abu */}
      {ROCKS.map((rock, idx) => {
        const inst = rockInstances[idx]
        if (inst) {
          return (
            <group key={`rock-gltf-${idx}`} position={rock.pos} rotation={[0, rock.rotY, 0]}>
              <primitive object={inst} />
            </group>
          )
        }
        return (
          <mesh key={`rock-proc-${idx}`} position={rock.pos} scale={rock.fallbackScale}>
            <boxGeometry args={rock.fallbackArgs} />
            <primitive object={rockMat} attach="material" />
          </mesh>
        )
      })}

      {/* Plants / Seaweed — Model GLTF rumput laut dengan graceful fallback ke silinder hijau */}
      {PLANTS.map((plant, idx) => {
        const inst = seaweedInstances[idx]
        if (inst) {
          return (
            <group key={`seaweed-gltf-${idx}`} position={plant.pos} rotation={[0, plant.rotY, 0]}>
              <primitive object={inst} />
            </group>
          )
        }
        return (
          <mesh key={`seaweed-proc-${idx}`} position={plant.pos} scale={[1, 1, 1]}>
            <cylinderGeometry args={plant.fallbackCylinderArgs} />
            <primitive object={plant.fallbackMat} attach="material" />
          </mesh>
        )
      })}

      {/* Rising bubbles — air biru lembut particles */}
      {bubbleData.map((d, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) bubbleRefs.current[i] = el
          }}
          position={[d.x, d.y0, 0.4]}
        >
          <sphereGeometry args={[d.size, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={d.opacity} />
        </mesh>
      ))}
    </group>
  )
}
