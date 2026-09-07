import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const sandMat = new THREE.MeshLambertMaterial({ color: '#fef3c7' })
const rockMat = new THREE.MeshLambertMaterial({ color: '#a8a29e' })
const plantMat = new THREE.MeshLambertMaterial({ color: '#34d399' })
const plantDarkMat = new THREE.MeshLambertMaterial({ color: '#059669' })

export default function AquariumEnvironment3D() {
  const bubbleRefs = useRef<THREE.Mesh[]>([])

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

      {/* Rocks — low poly boxes */}
      <mesh position={[-3.6, -1.85, 0.2]} scale={[0.9, 0.55, 0.6]}>
        <boxGeometry args={[1, 0.7, 0.7]} />
        <primitive object={rockMat} attach="material" />
      </mesh>
      <mesh position={[3.4, -1.9, -0.1]} scale={[0.7, 0.45, 0.55]}>
        <boxGeometry args={[1, 0.7, 0.7]} />
        <primitive object={rockMat} attach="material" />
      </mesh>
      <mesh position={[1.2, -1.95, -0.2]} scale={[0.5, 0.35, 0.4]}>
        <boxGeometry args={[0.9, 0.6, 0.6]} />
        <primitive object={rockMat} attach="material" />
      </mesh>

      {/* Plants — cylinders */}
      <mesh position={[-4.2, -1.7, -0.15]} scale={[1, 1, 1]}>
        <cylinderGeometry args={[0.06, 0.08, 1.1, 6]} />
        <primitive object={plantMat} attach="material" />
      </mesh>
      <mesh position={[-3.95, -1.65, -0.05]} scale={[1, 1, 1]}>
        <cylinderGeometry args={[0.05, 0.07, 0.85, 6]} />
        <primitive object={plantDarkMat} attach="material" />
      </mesh>
      <mesh position={[4.0, -1.68, 0.05]}>
        <cylinderGeometry args={[0.05, 0.07, 0.95, 6]} />
        <primitive object={plantMat} attach="material" />
      </mesh>
      <mesh position={[3.75, -1.62, -0.1]}>
        <cylinderGeometry args={[0.04, 0.06, 0.7, 6]} />
        <primitive object={plantDarkMat} attach="material" />
      </mesh>

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
