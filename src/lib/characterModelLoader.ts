import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'

export type CharacterModelKey = 'driver' | 'passenger'

export const CHARACTER_MODEL_PATHS: Record<CharacterModelKey, string> = {
  driver: '/models/train/driver.glb',
  passenger: '/models/train/passenger.glb',
}

/**
 * Skala penyesuaian agar ukuran model GLTF karakter selaras dengan proporsi dunia TrainScene:
 * - driver: ~0.85 unit tinggi (menggantikan kapsul tubuh masinis 0.6 + kepala 0.28)
 * - passenger: ~0.9 unit tinggi (menggantikan kapsul tubuh penumpang 0.85 unit di peron stasiun)
 */
export const CHARACTER_SCALES: Record<CharacterModelKey, number> = {
  driver: 0.48,
  passenger: 0.5,
}

export interface LoadedCharacterEntity {
  root: THREE.Group
  animations: THREE.AnimationClip[]
  mixer: THREE.AnimationMixer | null
  actions: Map<string, THREE.AnimationAction>
}

interface CachedCharacterGLTF {
  scene: THREE.Group
  animations: THREE.AnimationClip[]
}

const modelCache = new Map<CharacterModelKey, CachedCharacterGLTF>()
let sharedLoader: GLTFLoader | null = null

function getLoader(): GLTFLoader {
  if (!sharedLoader) {
    sharedLoader = new GLTFLoader()
  }
  return sharedLoader
}

/**
 * Memuat model karakter GLTF dengan caching in-memory.
 */
export async function loadCharacterModel(key: CharacterModelKey): Promise<CachedCharacterGLTF> {
  const cached = modelCache.get(key)
  if (cached) {
    return cached
  }

  const path = CHARACTER_MODEL_PATHS[key]
  const loader = getLoader()

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const data: CachedCharacterGLTF = {
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
 * Preload seluruh model karakter GLTF secara paralel saat modul kereta diinisialisasi.
 */
export async function preloadCharacterModels(): Promise<void> {
  const keys = Object.keys(CHARACTER_MODEL_PATHS) as CharacterModelKey[]
  await Promise.allSettled(keys.map((k) => loadCharacterModel(k)))
}

/**
 * Ambil salinan instans model karakter secara sinkron jika sudah tersedia di cache.
 * Jika belum siap di-cache, mengembalikan null agar pemanggil dapat menggunakan fallback geometri prosedural.
 */
export function instantiateCharacterModel(
  key: CharacterModelKey,
  scale = CHARACTER_SCALES[key],
  initialAnimation = 'Idle',
): LoadedCharacterEntity | null {
  const master = modelCache.get(key)
  if (!master) return null

  // Gunakan SkeletonUtils.clone agar SkinnedMesh dan bones terikat dengan benar ke instans baru
  const root = SkeletonUtils.clone(master.scene) as THREE.Group
  root.scale.setScalar(scale)

  let mixer: THREE.AnimationMixer | null = null
  const actions = new Map<string, THREE.AnimationAction>()

  if (master.animations.length > 0) {
    mixer = new THREE.AnimationMixer(root)
    for (const clip of master.animations) {
      actions.set(clip.name, mixer.clipAction(clip))
    }

    const defaultAction =
      actions.get(initialAnimation) ?? actions.get('Idle') ?? actions.values().next().value
    if (defaultAction) {
      defaultAction.play()
    }
  }

  return {
    root,
    animations: master.animations,
    mixer,
    actions,
  }
}

export function isCharacterModelCached(key: CharacterModelKey): boolean {
  return modelCache.has(key)
}

export function clearCharacterModelCache(): void {
  modelCache.clear()
}
