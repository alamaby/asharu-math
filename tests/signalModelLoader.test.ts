import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as THREE from 'three'
import {
  SIGNAL_MODEL_PATHS,
  SIGNAL_SCALES,
  instantiateSignalPost,
  instantiateBranchSign,
  isSignalModelCached,
  clearSignalModelCache,
  loadSignalModel,
  preloadSignalModels,
  type SignalModelKey,
} from '../src/lib/signalModelLoader'

describe('signalModelLoader', () => {
  beforeEach(() => {
    clearSignalModelCache()
    vi.restoreAllMocks()
  })

  it('memiliki path dan skala terdefinisi untuk seluruh key sinyal & rambu', () => {
    const keys: SignalModelKey[] = ['signal_post', 'branch_sign']

    for (const key of keys) {
      expect(SIGNAL_MODEL_PATHS[key]).toBeDefined()
      expect(SIGNAL_MODEL_PATHS[key]).toMatch(/^\/models\/train\/.*\.glb$/)
      expect(SIGNAL_SCALES[key]).toBeGreaterThan(0)
    }
  })

  it('mengembalikan null jika model belum berada di cache (graceful fallback)', () => {
    expect(isSignalModelCached('signal_post')).toBe(false)
    expect(isSignalModelCached('branch_sign')).toBe(false)

    expect(instantiateSignalPost()).toBeNull()
    expect(instantiateBranchSign()).toBeNull()
  })

  it('menginstansiasi model tiang sinyal lengkap dengan 3 lampu saat ada di cache', async () => {
    const masterScene = new THREE.Group()
    masterScene.name = 'SignalPostMaster'

    for (let i = 0; i < 3; i++) {
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshStandardMaterial({ color: 0x475569 }),
      )
      lamp.name = `signal_lamp_${i}`
      masterScene.add(lamp)
    }

    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((_path, onLoad) => {
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({
          scene: masterScene,
          scenes: [masterScene],
          animations: [],
          cameras: [],
          asset: {},
        })
      }
    })

    await loadSignalModel('signal_post')
    expect(isSignalModelCached('signal_post')).toBe(true)

    const entity = instantiateSignalPost()
    expect(entity).not.toBeNull()
    expect(entity?.root.scale.x).toBe(SIGNAL_SCALES.signal_post)
    expect(entity?.lamps.length).toBe(3)
  })

  it('menginstansiasi model plang rambu jawaban lengkap dengan display mesh saat ada di cache', async () => {
    const masterScene = new THREE.Group()
    masterScene.name = 'BranchSignMaster'
    const display = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9))
    display.name = 'sign_display'
    masterScene.add(display)

    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((_path, onLoad) => {
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({
          scene: masterScene,
          scenes: [masterScene],
          animations: [],
          cameras: [],
          asset: {},
        })
      }
    })

    await loadSignalModel('branch_sign')
    expect(isSignalModelCached('branch_sign')).toBe(true)

    const entity = instantiateBranchSign()
    expect(entity).not.toBeNull()
    expect(entity?.root.scale.x).toBe(SIGNAL_SCALES.branch_sign)
    expect(entity?.displayMesh).toBeDefined()
  })

  it('preloadSignalModels memuat seluruh aset sinyal tanpa error', async () => {
    const master = new THREE.Group()
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((_path, onLoad) => {
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({ scene: master, scenes: [master], animations: [], cameras: [], asset: {} })
      }
    })

    await expect(preloadSignalModels()).resolves.toBeUndefined()
    expect(isSignalModelCached('signal_post')).toBe(true)
    expect(isSignalModelCached('branch_sign')).toBe(true)
  })
})
