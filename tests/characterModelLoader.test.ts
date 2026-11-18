import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as THREE from 'three'
import {
  CHARACTER_MODEL_PATHS,
  CHARACTER_SCALES,
  instantiateCharacterModel,
  isCharacterModelCached,
  clearCharacterModelCache,
  loadCharacterModel,
  type CharacterModelKey,
} from '../src/lib/characterModelLoader'

describe('characterModelLoader', () => {
  beforeEach(() => {
    clearCharacterModelCache()
    vi.restoreAllMocks()
  })

  it('memiliki path dan skala terdefinisi untuk seluruh key karakter kereta', () => {
    const keys: CharacterModelKey[] = ['driver', 'passenger']

    for (const key of keys) {
      expect(CHARACTER_MODEL_PATHS[key]).toBeDefined()
      expect(CHARACTER_MODEL_PATHS[key]).toMatch(/^\/models\/train\/.*\.glb$/)
      expect(CHARACTER_SCALES[key]).toBeGreaterThan(0)
    }
  })

  it('mengembalikan null jika model belum berada di cache (graceful fallback)', () => {
    expect(isCharacterModelCached('driver')).toBe(false)
    const entity = instantiateCharacterModel('driver')
    expect(entity).toBeNull()
  })

  it('menginstansiasi model karakter lengkap dengan animasi jika ada di cache', async () => {
    const masterScene = new THREE.Group()
    masterScene.name = 'DriverMaster'
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    masterScene.add(mesh)

    const clipIdle = new THREE.AnimationClip('Idle', 1.0, [])
    const clipVictory = new THREE.AnimationClip('Victory', 1.5, [])

    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((_path, onLoad) => {
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({
          scene: masterScene,
          scenes: [masterScene],
          animations: [clipIdle, clipVictory],
          cameras: [],
          asset: {},
          userData: {},
        })
      }
    })

    await loadCharacterModel('driver')
    expect(isCharacterModelCached('driver')).toBe(true)

    const entity = instantiateCharacterModel('driver')
    expect(entity).not.toBeNull()
    expect(entity?.root.scale.x).toBeCloseTo(CHARACTER_SCALES.driver)
    expect(entity?.mixer).not.toBeNull()
    expect(entity?.actions.has('Idle')).toBe(true)
    expect(entity?.actions.has('Victory')).toBe(true)
  })
})
