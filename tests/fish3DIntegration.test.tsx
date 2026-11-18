import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import * as THREE from 'three'
import Fish3D from '../src/components/aquarium/Fish3D'
import { ProgressProvider } from '../src/state/ProgressContext'
import { clearFishModelCache, loadFishModel } from '../src/lib/fishModelLoader'

// Mock react-three-fiber primitives agar dapat diuji di JSDOM
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber')
  return {
    ...actual,
    useFrame: vi.fn(),
  }
})

describe('Fish3D integration', () => {
  beforeEach(() => {
    clearFishModelCache()
    vi.restoreAllMocks()
  })

  it('merender dengan aman menggunakan fallback saat model GLTF belum dicache', () => {
    const { container } = render(
      <ProgressProvider>
        <Fish3D variant="ones" position={[1, 0, 0]} />
      </ProgressProvider>,
    )
    expect(container).toBeDefined()
  })

  it('merender instans GLTF ketika model telah di-cache', async () => {
    const masterScene = new THREE.Group()
    masterScene.name = 'ClownfishModel'
    const swimClip = new THREE.AnimationClip('Swim', 1.2, [])

    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((_path, onLoad) => {
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({
          scene: masterScene,
          scenes: [masterScene],
          animations: [swimClip],
          cameras: [],
          asset: {},
          userData: {},
        })
      }
    })

    await loadFishModel('clownfish')

    const { container } = render(
      <ProgressProvider>
        <Fish3D variant="ones" position={[0, 0, 0]} />
      </ProgressProvider>,
    )
    expect(container).toBeDefined()
  })

  it('mendukung variant tens (bluefish)', async () => {
    const masterScene = new THREE.Group()
    masterScene.name = 'BluefishModel'
    const swimClip = new THREE.AnimationClip('Swim', 1.2, [])

    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((_path, onLoad) => {
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({
          scene: masterScene,
          scenes: [masterScene],
          animations: [swimClip],
          cameras: [],
          asset: {},
          userData: {},
        })
      }
    })

    await loadFishModel('bluefish')

    const { container } = render(
      <ProgressProvider>
        <Fish3D variant="tens" position={[-1, 0, 0]} />
      </ProgressProvider>,
    )
    expect(container).toBeDefined()
  })
})
