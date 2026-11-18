import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as THREE from 'three'
import {
  BUILDING_MODEL_PATHS,
  BUILDING_SCALES,
  instantiateBuildingModel,
  isBuildingModelCached,
  clearBuildingModelCache,
  loadBuildingModel,
  type BuildingModelKey,
} from '../src/lib/buildingModelLoader'

describe('buildingModelLoader', () => {
  beforeEach(() => {
    clearBuildingModelCache()
    vi.restoreAllMocks()
  })

  it('memiliki path dan skala terdefinisi untuk seluruh key model bangunan', () => {
    const keys: BuildingModelKey[] = ['house', 'barn']

    for (const key of keys) {
      expect(BUILDING_MODEL_PATHS[key]).toBeDefined()
      expect(BUILDING_MODEL_PATHS[key]).toMatch(/^\/models\/train\/.*\.glb$/)
      expect(BUILDING_SCALES[key]).toBeGreaterThan(0)
    }
  })

  it('mengembalikan null jika model bangunan belum berada di cache (graceful fallback)', () => {
    expect(isBuildingModelCached('house')).toBe(false)
    const entity = instantiateBuildingModel('house')
    expect(entity).toBeNull()
  })

  it('menginstansiasi model bangunan lengkap dengan skala jika ada di cache', async () => {
    const masterScene = new THREE.Group()
    masterScene.name = 'HouseMaster'
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    masterScene.add(mesh)

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
          userData: {},
        })
      }
    })

    await loadBuildingModel('house')
    expect(isBuildingModelCached('house')).toBe(true)

    const entity = instantiateBuildingModel('house')
    expect(entity).not.toBeNull()
    expect(entity?.scale.x).toBeCloseTo(BUILDING_SCALES.house)
  })
})
