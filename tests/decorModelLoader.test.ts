import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as THREE from 'three'
import {
  DECOR_MODEL_PATHS,
  instantiateStationLantern,
  instantiateFlowerPatch,
  instantiateButterfly,
  isDecorModelCached,
  clearDecorModelCache,
  loadDecorModel,
  preloadDecorModels,
  type DecorModelKey,
} from '../src/lib/decorModelLoader'

describe('decorModelLoader', () => {
  beforeEach(() => {
    clearDecorModelCache()
    vi.restoreAllMocks()
  })

  it('memiliki path terdefinisi untuk seluruh key dekorasi sekunder', () => {
    const keys: DecorModelKey[] = ['station_lantern', 'flower_patch', 'butterfly']

    for (const key of keys) {
      expect(DECOR_MODEL_PATHS[key]).toBeDefined()
      expect(DECOR_MODEL_PATHS[key]).toMatch(/^\/models\/train\/.*\.glb$/)
    }
  })

  it('mengembalikan null jika model belum berada di cache (graceful fallback)', () => {
    expect(isDecorModelCached('station_lantern')).toBe(false)
    expect(isDecorModelCached('flower_patch')).toBe(false)
    expect(isDecorModelCached('butterfly')).toBe(false)

    expect(instantiateStationLantern()).toBeNull()
    expect(instantiateFlowerPatch()).toBeNull()
    expect(instantiateButterfly()).toBeNull()
  })

  it('menginstansiasi model lentera stasiun lengkap dengan kloning material kaca saat ada di cache', async () => {
    const masterScene = new THREE.Group()
    masterScene.name = 'LanternMaster'

    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.2),
      new THREE.MeshStandardMaterial({ color: '#fb923c' }),
    )
    glass.name = 'lantern_glass'
    masterScene.add(glass)

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

    await loadDecorModel('station_lantern')
    expect(isDecorModelCached('station_lantern')).toBe(true)

    const entity1 = instantiateStationLantern()
    const entity2 = instantiateStationLantern()

    expect(entity1).not.toBeNull()
    expect(entity2).not.toBeNull()
    expect(entity1?.glassMesh).not.toBeNull()
    expect(entity2?.glassMesh).not.toBeNull()

    // Verifikasi material dikloning independen
    expect(entity1?.glassMesh?.material).not.toBe(entity2?.glassMesh?.material)
  })

  it('menginstansiasi model rumpun bunga saat ada di cache', async () => {
    const masterScene = new THREE.Group()
    masterScene.name = 'FlowerMaster'

    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((_path, onLoad) => {
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({ scene: masterScene, animations: [] })
      }
    })

    await loadDecorModel('flower_patch')
    expect(isDecorModelCached('flower_patch')).toBe(true)

    const entity = instantiateFlowerPatch()
    expect(entity).not.toBeNull()
    expect(entity?.root.name).toBe('instanced_flower_patch')
  })

  it('menginstansiasi model kupu-kupu dengan engsel sayap kiri & kanan', async () => {
    const masterScene = new THREE.Group()
    masterScene.name = 'ButterflyMaster'

    const wingL = new THREE.Group()
    wingL.name = 'wing_left'
    const wingR = new THREE.Group()
    wingR.name = 'wing_right'
    masterScene.add(wingL, wingR)

    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((_path, onLoad) => {
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({ scene: masterScene, animations: [] })
      }
    })

    await loadDecorModel('butterfly')
    expect(isDecorModelCached('butterfly')).toBe(true)

    const entity = instantiateButterfly()
    expect(entity).not.toBeNull()
    expect(entity?.wingLeft).not.toBeNull()
    expect(entity?.wingRight).not.toBeNull()
  })

  it('preloadDecorModels memuat seluruh model dekorasi ke cache', async () => {
    const dummyScene = new THREE.Group()
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((_path, onLoad) => {
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({ scene: dummyScene, animations: [] })
      }
    })

    await preloadDecorModels()

    expect(isDecorModelCached('station_lantern')).toBe(true)
    expect(isDecorModelCached('flower_patch')).toBe(true)
    expect(isDecorModelCached('butterfly')).toBe(true)
  })
})
