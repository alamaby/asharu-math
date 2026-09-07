import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

import { useProgress } from '../../state/ProgressContext'

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
}

export default function Fish3D({
  position = [0, 0, 0],
  variant = 'ones',
  scale = 1,
  wiggleOffset = 0,
  highlight = false,
}: Fish3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const posRef = useRef<[number, number, number]>(position)
  const { progress } = useProgress()
  const bodyMat = variant === 'ones' ? matOnesBody : matTensBody
  const tailMat = variant === 'ones' ? matTailOnes : matTailTens
  const dotMat = variant === 'ones' ? matOnesDot : matTensDot

  useEffect(() => {
    posRef.current = position
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2])
      groupRef.current.scale.set(scale, scale, scale)
    }
  }, [position, scale])

  // floating wiggle — skip when animations disabled or reduced-motion
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    if (!progress.animationsEnabled) return
    const target = posRef.current
    // keep x/z in sync with prop even if position changed
    if (Math.abs(groupRef.current.position.x - target[0]) > 0.001) groupRef.current.position.x = target[0]
    if (Math.abs(groupRef.current.position.z - target[2]) > 0.001) groupRef.current.position.z = target[2]
    const t = clock.getElapsedTime() + wiggleOffset
    groupRef.current.position.y = target[1] + Math.sin(t * 1.2) * 0.06
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
    >
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
