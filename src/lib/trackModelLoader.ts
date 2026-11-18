import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export type TrackModelKey = 'sleeper'

export const TRACK_MODEL_PATHS: Record<TrackModelKey, string> = {
  sleeper: '/models/train/sleeper.glb',
}

/**
 * Skala penyesuaian agar ukuran bantalan rel GLTF selaras dengan proporsi dunia TrainScene:
 * - sleeper: lebar 1.0 unit (menggantikan balok kayu prosedural 1.0 x 0.08 x 0.28 unit)
 */
export const TRACK_SCALES: Record<TrackModelKey, number> = {
  sleeper: 1.0,
}

interface CachedTrackGLTF {
  scene: THREE.Group
}

const modelCache = new Map<TrackModelKey, CachedTrackGLTF>()
let sharedLoader: GLTFLoader | null = null

function getLoader(): GLTFLoader {
  if (!sharedLoader) {
    sharedLoader = new GLTFLoader()
  }
  return sharedLoader
}

/**
 * Memuat model rel / bantalan GLTF dengan caching in-memory.
 */
export async function loadTrackModel(key: TrackModelKey): Promise<CachedTrackGLTF> {
  const cached = modelCache.get(key)
  if (cached) {
    return cached
  }

  const path = TRACK_MODEL_PATHS[key]
  const loader = getLoader()

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const data: CachedTrackGLTF = {
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
 * Preload seluruh model track GLTF secara paralel saat modul kereta diinisialisasi.
 */
export async function preloadTrackModels(): Promise<void> {
  const keys = Object.keys(TRACK_MODEL_PATHS) as TrackModelKey[]
  await Promise.allSettled(keys.map((k) => loadTrackModel(k)))
}

/**
 * Ambil salinan instans model bantalan rel secara sinkron jika sudah tersedia di cache.
 * Jika belum siap di-cache, mengembalikan null agar pemanggil dapat menggunakan fallback geometri prosedural.
 */
export function instantiateTrackModel(
  key: TrackModelKey,
  scale = TRACK_SCALES[key],
): THREE.Group | null {
  const master = modelCache.get(key)
  if (!master) return null

  const instance = master.scene.clone(true)
  const root = new THREE.Group()
  root.add(instance)
  root.scale.setScalar(scale)

  return root
}

export function isTrackModelCached(key: TrackModelKey): boolean {
  return modelCache.has(key)
}

export function clearTrackModelCache(): void {
  modelCache.clear()
}
