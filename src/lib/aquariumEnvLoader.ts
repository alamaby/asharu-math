import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export type AquariumEnvKey = 'coral' | 'seaweed' | 'rock'

export const AQUARIUM_ENV_PATHS: Record<AquariumEnvKey, string> = {
  coral: '/models/aquarium/coral.glb',
  seaweed: '/models/aquarium/seaweed.glb',
  rock: '/models/aquarium/rock.glb',
}

/**
 * Skala penyesuaian agar ukuran model GLTF selaras dengan proporsi dunia Cheerful Aquarium:
 * - coral: ~7 unit panjang membentang di dasar pasir (menggantikan batuan acak di tengah)
 * - seaweed: ~0.9 unit tinggi (menggantikan silinder tanaman hijau berukuran 0.85-1.1 unit)
 * - rock: ~1.0 unit lebar (menggantikan kotak balok batu 0.9-1.0 unit)
 */
export const AQUARIUM_ENV_SCALES: Record<AquariumEnvKey, number> = {
  coral: 1.0,
  seaweed: 3.2,
  rock: 2.8,
}

interface CachedAquariumEnvGLTF {
  scene: THREE.Group
}

const modelCache = new Map<AquariumEnvKey, CachedAquariumEnvGLTF>()
let sharedLoader: GLTFLoader | null = null

function getLoader(): GLTFLoader {
  if (!sharedLoader) {
    sharedLoader = new GLTFLoader()
  }
  return sharedLoader
}

/**
 * Memuat model lingkungan akuarium GLTF dengan caching in-memory.
 */
export async function loadAquariumEnvModel(key: AquariumEnvKey): Promise<CachedAquariumEnvGLTF> {
  const cached = modelCache.get(key)
  if (cached) {
    return cached
  }

  const path = AQUARIUM_ENV_PATHS[key]
  const loader = getLoader()

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const data: CachedAquariumEnvGLTF = {
          scene: gltf.scene,
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
 * Preload seluruh model lingkungan akuarium GLTF secara paralel saat modul akuarium diinisialisasi.
 */
export async function preloadAquariumEnvModels(): Promise<void> {
  const keys = Object.keys(AQUARIUM_ENV_PATHS) as AquariumEnvKey[]
  await Promise.allSettled(keys.map((k) => loadAquariumEnvModel(k)))
}

/**
 * Ambil salinan instans model lingkungan secara sinkron jika sudah tersedia di cache.
 * Jika belum siap di-cache, mengembalikan null agar pemanggil dapat menggunakan fallback geometri prosedural.
 */
export function instantiateAquariumEnvModel(
  key: AquariumEnvKey,
  scale = AQUARIUM_ENV_SCALES[key],
): THREE.Group | null {
  const master = modelCache.get(key)
  if (!master) return null

  const instance = master.scene.clone(true)
  const root = new THREE.Group()
  root.add(instance)
  root.scale.setScalar(scale)

  return root
}

export function isAquariumEnvModelCached(key: AquariumEnvKey): boolean {
  return modelCache.has(key)
}

export function clearAquariumEnvCache(): void {
  modelCache.clear()
}
