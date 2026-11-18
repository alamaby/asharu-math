import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as THREE from 'three'
import {
  ANIMAL_MODEL_PATHS,
  ANIMAL_SCALES,
  instantiateAnimalModel,
  isAnimalModelCached,
  clearAnimalModelCache,
  loadAnimalModel,
  findIdleClip,
  type AnimalModelKey,
} from '../src/lib/animalModelLoader'

describe('animalModelLoader', () => {
  beforeEach(() => {
    clearAnimalModelCache()
    vi.restoreAllMocks()
  })

  it('memiliki path terdefinisi untuk seluruh key model fauna', () => {
    const keys: AnimalModelKey[] = ['cow', 'sheep']

    for (const key of keys) {
      expect(ANIMAL_MODEL_PATHS[key]).toBeDefined()
      expect(ANIMAL_MODEL_PATHS[key]).toMatch(/^\/models\/animals\/.*\.glb$/)
      expect(ANIMAL_SCALES[key]).toBeGreaterThan(0)
    }
  })

  it('mengembalikan null jika model fauna belum berada di cache (graceful fallback)', () => {
    expect(isAnimalModelCached('cow')).toBe(false)
    const entity = instantiateAnimalModel('cow')
    expect(entity).toBeNull()
  })

  it('mendeteksi clip animasi idle / eating dengan benar', () => {
    const walkClip = new THREE.AnimationClip('Walk', 1, [])
    const eatClip = new THREE.AnimationClip('Eating', 1.5, [])
    const idleClip = new THREE.AnimationClip('AnimalArmature|Idle', 2, [])

    expect(findIdleClip([walkClip, eatClip, idleClip])?.name).toBe('AnimalArmature|Idle')
    expect(findIdleClip([walkClip, eatClip])?.name).toBe('Eating')
    expect(findIdleClip([walkClip])?.name).toBe('Walk')
    expect(findIdleClip([])).toBeNull()
  })

  it('menginstansiasi model fauna lengkap dengan skala dan mixer jika ada di cache', async () => {
    const masterScene = new THREE.Group()
    masterScene.name = 'CowRoot'
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100))
    masterScene.add(mesh)

    const idleClip = new THREE.AnimationClip('Idle', 2, [])

    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((_path, onLoad) => {
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({
          scene: masterScene,
          scenes: [masterScene],
          animations: [idleClip],
          cameras: [],
          asset: {},
          userData: {},
        })
      }
    })

    await loadAnimalModel('cow')
    expect(isAnimalModelCached('cow')).toBe(true)

    const entity = instantiateAnimalModel('cow')
    expect(entity).not.toBeNull()
    expect(entity?.root).toBeDefined()
    expect(entity?.root.scale.x).toBeCloseTo(ANIMAL_SCALES.cow)
    expect(entity?.mixer).toBeDefined()
    expect(entity?.action).toBeDefined()
  })
})
