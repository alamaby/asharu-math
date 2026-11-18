import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'

export type FishModelKey = 'clownfish' | 'bluefish'

export const FISH_MODEL_PATHS: Record<FishModelKey, string> = {
  clownfish: '/models/aquarium/clownfish.glb',
  bluefish: '/models/aquarium/bluefish.glb',
}

/**
 * Skala penyesuaian agar ukuran model GLTF Quaternius selaras dengan dunia akuarium Fish3D (~0.8 unit panjang).
 */
export const FISH_SCALES: Record<FishModelKey, number> = {
  clownfish: 0.1,
  bluefish: 0.08,
}

export interface LoadedFishEntity {
  root: THREE.Group
  animations: THREE.AnimationClip[]
  mixer: THREE.AnimationMixer | null
  action: THREE.AnimationAction | null
}

interface CachedFishGLTF {
  scene: THREE.Group
  animations: THREE.AnimationClip[]
}

const modelCache = new Map<FishModelKey, CachedFishGLTF>()
let sharedLoader: GLTFLoader | null = null

function getLoader(): GLTFLoader {
  if (!sharedLoader) {
    sharedLoader = new GLTFLoader()
  }
  return sharedLoader
}

/**
 * Memuat model ikan GLTF dengan caching in-memory.
 */
export async function loadFishModel(key: FishModelKey): Promise<CachedFishGLTF> {
  const cached = modelCache.get(key)
  if (cached) {
    return cached
  }

  const path = FISH_MODEL_PATHS[key]
  const loader = getLoader()

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const data: CachedFishGLTF = {
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
 * Preload semua model ikan GLTF secara paralel saat modul akuarium diinisialisasi.
 */
export async function preloadFishModels(): Promise<void> {
  const keys = Object.keys(FISH_MODEL_PATHS) as FishModelKey[]
  await Promise.allSettled(keys.map((k) => loadFishModel(k)))
}

/**
 * Mencari klip animasi renang dari daftar animasi GLTF.
 */
export function findSwimClip(clips: THREE.AnimationClip[]): THREE.AnimationClip | null {
  if (!clips.length) return null
  const swim = clips.find((c) => /swim/i.test(c.name))
  if (swim) return swim
  return clips[0] ?? null
}

/**
 * Ambil salinan instans model secara sinkron jika sudah tersedia di cache.
 * Jika belum siap di-cache, mengembalikan null agar pemanggil dapat menggunakan fallback geometri prosedural.
 */
export function instantiateFishModel(
  key: FishModelKey,
  scale = FISH_SCALES[key],
  enableAnimation = true,
): LoadedFishEntity | null {
  const master = modelCache.get(key)
  if (!master) return null

  // Gunakan SkeletonUtils.clone agar SkinnedMesh dan bones terikat dengan benar ke instans baru
  const root = SkeletonUtils.clone(master.scene) as THREE.Group
  root.scale.setScalar(scale)

  // Putar orientasi awal Y sebesar +PI/2 (90 derajat)
  // karena model GLTF aslinya menghadap +Z, sedangkan koordinat Fish3D menghadap +X saat rotation.y = 0
  root.rotation.y = Math.PI / 2

  let mixer: THREE.AnimationMixer | null = null
  let action: THREE.AnimationAction | null = null

  if (enableAnimation && master.animations.length > 0) {
    mixer = new THREE.AnimationMixer(root)
    const clip = findSwimClip(master.animations)
    if (clip) {
      action = mixer.clipAction(clip)
      action.play()
    }
  }

  return { root, animations: master.animations, mixer, action }
}

export function isFishModelCached(key: FishModelKey): boolean {
  return modelCache.has(key)
}

export function clearFishModelCache(): void {
  modelCache.clear()
}
