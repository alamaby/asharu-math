import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as THREE from 'three'
import {
  FISH_MODEL_PATHS,
  FISH_SCALES,
  instantiateFishModel,
  isFishModelCached,
  clearFishModelCache,
  loadFishModel,
  findSwimClip,
  type FishModelKey,
} from '../src/lib/fishModelLoader'

describe('fishModelLoader', () => {
  beforeEach(() => {
    clearFishModelCache()
    vi.restoreAllMocks()
  })

  it('memiliki path dan skala terdefinisi untuk seluruh key model ikan', () => {
    const keys: FishModelKey[] = ['clownfish', 'bluefish']

    for (const key of keys) {
      expect(FISH_MODEL_PATHS[key]).toBeDefined()
      expect(FISH_MODEL_PATHS[key]).toMatch(/^\/models\/aquarium\/.*\.glb$/)
      expect(FISH_SCALES[key]).toBeGreaterThan(0)
    }
  })

  it('mengembalikan null jika model ikan belum berada di cache (graceful fallback)', () => {
    expect(isFishModelCached('clownfish')).toBe(false)
    const entity = instantiateFishModel('clownfish')
    expect(entity).toBeNull()
  })

  it('mendeteksi klip animasi renang dengan benar', () => {
    const attackClip = new THREE.AnimationClip('Attack', 1, [])
    const swimClip = new THREE.AnimationClip('Armature|Swim', 1.5, [])
    const idleClip = new THREE.AnimationClip('Idle', 2, [])

    expect(findSwimClip([attackClip, swimClip, idleClip])?.name).toBe('Armature|Swim')
    expect(findSwimClip([attackClip, idleClip])?.name).toBe('Attack')
    expect(findSwimClip([])).toBeNull()
  })

  it('menginstansiasi model ikan lengkap dengan skala, rotasi Y orientasi arah renang, dan mixer', async () => {
    const masterScene = new THREE.Group()
    masterScene.name = 'ClownfishRoot'
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10))
    masterScene.add(mesh)

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
    expect(isFishModelCached('clownfish')).toBe(true)

    const entity = instantiateFishModel('clownfish')
    expect(entity).not.toBeNull()
    expect(entity?.root).toBeDefined()
    expect(entity?.root.scale.x).toBeCloseTo(FISH_SCALES.clownfish)
    expect(entity?.root.rotation.y).toBeCloseTo(Math.PI / 2)
    expect(entity?.mixer).toBeDefined()
    expect(entity?.action).toBeDefined()
  })
})
