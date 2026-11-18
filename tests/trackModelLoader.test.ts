import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as THREE from 'three'
import {
  TRACK_MODEL_PATHS,
  TRACK_SCALES,
  instantiateTrackModel,
  isTrackModelCached,
  clearTrackModelCache,
  loadTrackModel,
  type TrackModelKey,
} from '../src/lib/trackModelLoader'

describe('trackModelLoader', () => {
  beforeEach(() => {
    clearTrackModelCache()
    vi.restoreAllMocks()
  })

  it('memiliki path dan skala terdefinisi untuk seluruh key track kereta', () => {
    const keys: TrackModelKey[] = ['sleeper']

    for (const key of keys) {
      expect(TRACK_MODEL_PATHS[key]).toBeDefined()
      expect(TRACK_MODEL_PATHS[key]).toMatch(/^\/models\/train\/.*\.glb$/)
      expect(TRACK_SCALES[key]).toBeGreaterThan(0)
    }
  })

  it('mengembalikan null jika model belum berada di cache (graceful fallback)', () => {
    expect(isTrackModelCached('sleeper')).toBe(false)
    const entity = instantiateTrackModel('sleeper')
    expect(entity).toBeNull()
  })

  it('menginstansiasi model track lengkap dengan skala jika ada di cache', async () => {
    const masterScene = new THREE.Group()
    masterScene.name = 'SleeperMaster'
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 0.3))
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

    await loadTrackModel('sleeper')
    expect(isTrackModelCached('sleeper')).toBe(true)

    const entity = instantiateTrackModel('sleeper')
    expect(entity).not.toBeNull()
    expect(entity?.scale.x).toBeCloseTo(TRACK_SCALES.sleeper)
  })
})
