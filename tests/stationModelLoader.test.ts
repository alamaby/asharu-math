import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as THREE from 'three'
import {
  STATION_MODEL_PATHS,
  STATION_SCALES,
  instantiateStationModel,
  isStationModelCached,
  clearStationModelCache,
  loadStationModel,
  preloadStationModels,
  type StationModelKey,
} from '../src/lib/stationModelLoader'

describe('stationModelLoader', () => {
  beforeEach(() => {
    clearStationModelCache()
    vi.restoreAllMocks()
  })

  it('memiliki path dan skala terdefinisi untuk seluruh key stasiun kereta', () => {
    const keys: StationModelKey[] = ['bench', 'canopy', 'flag', 'clock', 'platform']

    for (const key of keys) {
      expect(STATION_MODEL_PATHS[key]).toBeDefined()
      expect(STATION_MODEL_PATHS[key]).toMatch(/^\/models\/train\/.*\.glb$/)
      expect(STATION_SCALES[key]).toBeGreaterThan(0)
    }
  })

  it('mengembalikan null jika model belum berada di cache (graceful fallback)', () => {
    expect(isStationModelCached('bench')).toBe(false)
    expect(isStationModelCached('canopy')).toBe(false)
    expect(isStationModelCached('flag')).toBe(false)
    expect(isStationModelCached('clock')).toBe(false)
    expect(isStationModelCached('platform')).toBe(false)

    expect(instantiateStationModel('bench')).toBeNull()
    expect(instantiateStationModel('canopy')).toBeNull()
  })

  it('menginstansiasi model stasiun lengkap dengan skala jika ada di cache', async () => {
    const masterScene = new THREE.Group()
    masterScene.name = 'BenchMaster'
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.3))
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
        })
      }
    })

    await loadStationModel('bench')
    expect(isStationModelCached('bench')).toBe(true)

    const entity = instantiateStationModel('bench')
    expect(entity).not.toBeNull()
    expect(entity?.scale.x).toBe(STATION_SCALES.bench)
    expect(entity?.children.length).toBeGreaterThan(0)
  })

  it('preloadStationModels memuat seluruh aset stasiun tanpa melempar unhandled error', async () => {
    const master = new THREE.Group()
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((_path, onLoad) => {
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({ scene: master, scenes: [master], animations: [], cameras: [], asset: {} })
      }
    })

    await expect(preloadStationModels()).resolves.toBeUndefined()
    expect(isStationModelCached('bench')).toBe(true)
    expect(isStationModelCached('canopy')).toBe(true)
    expect(isStationModelCached('flag')).toBe(true)
    expect(isStationModelCached('clock')).toBe(true)
    expect(isStationModelCached('platform')).toBe(true)
  })
})
