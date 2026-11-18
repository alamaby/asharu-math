import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as THREE from 'three'
import {
  TRAIN_MODEL_PATHS,
  KENNEY_TRAIN_SCALE,
  instantiateTrainModel,
  isTrainModelCached,
  clearTrainModelCache,
  loadTrainModel,
  type TrainModelKey,
} from '../src/lib/trainModelLoader'

describe('trainModelLoader', () => {
  beforeEach(() => {
    clearTrainModelCache()
    vi.restoreAllMocks()
  })

  it('memiliki path terdefinisi untuk seluruh key model', () => {
    const keys: TrainModelKey[] = [
      'loco-classic',
      'loco-diesel',
      'wagon-box',
      'wagon-tank',
      'wagon-flatbed',
      'wagon-passenger',
      'connector',
    ]

    for (const key of keys) {
      expect(TRAIN_MODEL_PATHS[key]).toBeDefined()
      expect(TRAIN_MODEL_PATHS[key]).toMatch(/^\/models\/train\/.*\.glb$/)
    }
  })

  it('mengembalikan null jika model belum berada di cache (graceful fallback)', () => {
    expect(isTrainModelCached('loco-classic')).toBe(false)
    const entity = instantiateTrainModel('loco-classic')
    expect(entity).toBeNull()
  })

  it('mengkoleksi node roda dan menerapkan skala jika master model ada di cache', async () => {
    // Siapkan mock master group dengan bodi dan roda
    const master = new THREE.Group()
    master.name = 'train-locomotive-a'

    const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    body.name = 'body'

    const frontWheels = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5))
    frontWheels.name = 'wheels-front'

    const backWheel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5))
    backWheel.name = 'wheel'

    master.add(body, frontWheels, backWheel)

    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((_path, onLoad) => {
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({ scene: master })
      }
    })

    await loadTrainModel('loco-classic')
    const entity = instantiateTrainModel('loco-classic')

    expect(entity).not.toBeNull()
    expect(entity?.root.scale.x).toBeCloseTo(KENNEY_TRAIN_SCALE)
    expect(entity?.wheels.length).toBe(2)
    expect(entity?.wheels.map((w) => w.name)).toContain('wheels-front')
    expect(entity?.wheels.map((w) => w.name)).toContain('wheel')
  })

  it('loadTrainModel memanfaatkan cache jika model sudah dimuat sebelumnya', async () => {
    const master = new THREE.Group()
    master.name = 'cached-test'

    // Mocking GLTFLoader prototype load
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    const loadSpy = vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((_path, onLoad) => {
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({ scene: master })
      }
    })

    const firstResult = await loadTrainModel('loco-classic')
    expect(firstResult).toBe(master)
    expect(loadSpy).toHaveBeenCalledTimes(1)
    expect(isTrainModelCached('loco-classic')).toBe(true)

    // Pemanggilan kedua harus mengambil dari cache tanpa memanggil loader.load lagi
    const secondResult = await loadTrainModel('loco-classic')
    expect(secondResult).toBe(master)
    expect(loadSpy).toHaveBeenCalledTimes(1)

    // instantiateTrainModel sekarang menghasilkan klon beroda
    const inst = instantiateTrainModel('loco-classic')
    expect(inst).not.toBeNull()
    expect(inst?.root.scale.x).toBeCloseTo(KENNEY_TRAIN_SCALE)
  })
})
