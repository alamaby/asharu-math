import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as THREE from 'three'
import {
  AQUARIUM_ENV_PATHS,
  AQUARIUM_ENV_SCALES,
  instantiateAquariumEnvModel,
  isAquariumEnvModelCached,
  clearAquariumEnvCache,
  loadAquariumEnvModel,
  type AquariumEnvKey,
} from '../src/lib/aquariumEnvLoader'

describe('aquariumEnvLoader', () => {
  beforeEach(() => {
    clearAquariumEnvCache()
    vi.restoreAllMocks()
  })

  it('memiliki path dan skala terdefinisi untuk seluruh key lingkungan akuarium', () => {
    const keys: AquariumEnvKey[] = ['coral', 'seaweed', 'rock']

    for (const key of keys) {
      expect(AQUARIUM_ENV_PATHS[key]).toBeDefined()
      expect(AQUARIUM_ENV_PATHS[key]).toMatch(/^\/models\/aquarium\/.*\.glb$/)
      expect(AQUARIUM_ENV_SCALES[key]).toBeGreaterThan(0)
    }
  })

  it('mengembalikan null jika model belum berada di cache (graceful fallback)', () => {
    expect(isAquariumEnvModelCached('coral')).toBe(false)
    const entity = instantiateAquariumEnvModel('coral')
    expect(entity).toBeNull()
  })

  it('menginstansiasi model lingkungan lengkap dengan skala jika ada di cache', async () => {
    const masterScene = new THREE.Group()
    masterScene.name = 'CoralMaster'
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

    await loadAquariumEnvModel('coral')
    expect(isAquariumEnvModelCached('coral')).toBe(true)

    const entity = instantiateAquariumEnvModel('coral')
    expect(entity).not.toBeNull()
    expect(entity?.scale.x).toBeCloseTo(AQUARIUM_ENV_SCALES.coral)
  })
})
