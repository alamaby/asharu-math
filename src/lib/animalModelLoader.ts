import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'

export type AnimalModelKey = 'cow' | 'sheep'

export const ANIMAL_MODEL_PATHS: Record<AnimalModelKey, string> = {
  cow: '/models/animals/cow.glb',
  sheep: '/models/animals/sheep.glb',
}

/** Skala penyesuaian agar ukuran model GLTF Quaternius selaras dengan dunia TrainScene */
export const ANIMAL_SCALES: Record<AnimalModelKey, number> = {
  cow: 0.0045,
  sheep: 0.0042,
}

export interface LoadedAnimalEntity {
  root: THREE.Group
  animations: THREE.AnimationClip[]
  mixer: THREE.AnimationMixer | null
  action: THREE.AnimationAction | null
}

interface CachedAnimalGLTF {
  scene: THREE.Group
  animations: THREE.AnimationClip[]
}

const modelCache = new Map<AnimalModelKey, CachedAnimalGLTF>()
let sharedLoader: GLTFLoader | null = null

function getLoader(): GLTFLoader {
  if (!sharedLoader) {
    sharedLoader = new GLTFLoader()
  }
  return sharedLoader
}

/**
 * Memuat model fauna GLTF dengan caching in-memory.
 */
export async function loadAnimalModel(key: AnimalModelKey): Promise<CachedAnimalGLTF> {
  const cached = modelCache.get(key)
  if (cached) {
    return cached
  }

  const path = ANIMAL_MODEL_PATHS[key]
  const loader = getLoader()

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const data: CachedAnimalGLTF = {
          scene: gltf.scene,
          animations: gltf.animations ?? [],
        }
        modelCache.set(key, data)
        resolve(data)
      },
      undefined,
      (err) => {
        reject(err)
      },
    )
  })
}

/**
 * Preload semua model fauna GLTF secara paralel.
 */
export async function preloadAnimalModels(): Promise<void> {
  const keys = Object.keys(ANIMAL_MODEL_PATHS) as AnimalModelKey[]
  await Promise.allSettled(keys.map((k) => loadAnimalModel(k)))
}

/**
 * Mencari clip animasi idle / eating yang ramah anak.
 */
export function findIdleClip(clips: THREE.AnimationClip[]): THREE.AnimationClip | null {
  if (!clips.length) return null
  const idle = clips.find((c) => /idle/i.test(c.name))
  if (idle) return idle
  const eating = clips.find((c) => /eat/i.test(c.name))
  if (eating) return eating
  return clips[0] ?? null
}

/**
 * Ambil salinan instans model secara sinkron jika sudah tersedia di cache.
 * Jika belum siap di-cache, mengembalikan null agar pemanggil dapat menggunakan fallback prosedural.
 */
export function instantiateAnimalModel(
  key: AnimalModelKey,
  scale = ANIMAL_SCALES[key],
  enableAnimation = true,
): LoadedAnimalEntity | null {
  const master = modelCache.get(key)
  if (!master) return null

  // Gunakan SkeletonUtils.clone agar SkinnedMesh dan bones terikat dengan benar ke instans baru
  const root = SkeletonUtils.clone(master.scene) as THREE.Group
  root.scale.setScalar(scale)

  let mixer: THREE.AnimationMixer | null = null
  let action: THREE.AnimationAction | null = null

  if (enableAnimation && master.animations.length > 0) {
    mixer = new THREE.AnimationMixer(root)
    const clip = findIdleClip(master.animations)
    if (clip) {
      action = mixer.clipAction(clip)
      action.play()
    }
  }

  return { root, animations: master.animations, mixer, action }
}

export function isAnimalModelCached(key: AnimalModelKey): boolean {
  return modelCache.has(key)
}

export function clearAnimalModelCache(): void {
  modelCache.clear()
}
