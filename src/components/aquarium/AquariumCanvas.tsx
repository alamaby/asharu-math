import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

const AquariumScene3D = lazy(() => import('./AquariumScene3D'))

type AquariumCanvasProps = {
  tens: number
  ones: number
  highlight?: 'tens' | 'ones' | null
  animating?: boolean
  regroupProgress?: number
  splitProgress?: number
}

function hasWebGL(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

function CanvasFallback({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex min-h-64 items-center justify-center rounded-3xl border-2 border-amber-200 bg-amber-50 p-6 text-center"
    >
      <p className="text-sm font-bold text-amber-800">{message}</p>
    </div>
  )
}

export default function AquariumCanvas(props: AquariumCanvasProps) {
  const [hidden, setHidden] = useState(false)
  const webGL = useMemo(() => hasWebGL(), [])

  useEffect(() => {
    const onVis = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  if (!webGL) {
    return (
      <CanvasFallback message="Perangkat ini tidak mendukung tampilan 3D. Coba buka di browser yang mendukung WebGL ya." />
    )
  }

  return (
    <div
      className="overflow-hidden rounded-3xl border-2 border-sky-200 bg-sky-50 shadow-sm"
      style={{ height: 'min(58vw, 320px)', minHeight: 220 }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop={hidden ? 'never' : 'always'}
        gl={{
          antialias: true,
          powerPreference: 'low-power',
          alpha: true,
        }}
        camera={{ position: [0, 0, 7.2], fov: 52, near: 0.1, far: 30 }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#e0f7ff'), 1)
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.95} />
        <directionalLight position={[4, 6, 5]} intensity={0.85} />
        <directionalLight position={[-4, 3, 4]} intensity={0.35} />
        <fog attach="fog" args={['#e0f7ff', 9, 18]} />
        <Suspense fallback={null}>
          <AquariumScene3D {...props} />
        </Suspense>
      </Canvas>
    </div>
  )
}
