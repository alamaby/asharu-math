import type * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export type TrainModelKey =
  | 'loco-classic'
  | 'loco-diesel'
  | 'wagon-box'
  | 'wagon-tank'
  | 'wagon-flatbed'
  | 'wagon-passenger'
  | 'connector'

export const TRAIN_MODEL_PATHS: Record<TrainModelKey, string> = {
  'loco-classic': '/models/train/train-locomotive-a.glb',
  'loco-diesel': '/models/train/train-diesel-a.glb',
  'wagon-box': '/models/train/train-carriage-box.glb',
  'wagon-tank': '/models/train/train-carriage-tank.glb',
  'wagon-flatbed': '/models/train/train-carriage-flatbed.glb',
  'wagon-passenger': '/models/train/train-locomotive-passenger-a.glb',
  connector: '/models/train/train-connector.glb',
}

/** Skala penyesuaian agar dimensi GLTF Kenney (±2.60m) tepat selaras dengan gauge rel Three.js (0.90) */
export const KENNEY_TRAIN_SCALE = 0.85

export interface LoadedTrainEntity {
  root: THREE.Group
  wheels: THREE.Object3D[]
}

const modelCache = new Map<TrainModelKey, THREE.Group>()
let sharedLoader: GLTFLoader | null = null

function getLoader(): GLTFLoader {
  if (!sharedLoader) {
    sharedLoader = new GLTFLoader()
  }
  return sharedLoader
}

/**
 * Memuat satu model GLTF dengan caching in-memory.
 */
export async function loadTrainModel(key: TrainModelKey): Promise<THREE.Group> {
  const cached = modelCache.get(key)
  if (cached) {
    return cached
  }

  const path = TRAIN_MODEL_PATHS[key]
  const loader = getLoader()

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        modelCache.set(key, gltf.scene)
        resolve(gltf.scene)
      },
      undefined,
      (err) => {
        reject(err)
      },
    )
  })
}

/**
 * Preload semua model GLTF kereta utama secara paralel.
 */
export async function preloadTrainModels(): Promise<void> {
  const keys = Object.keys(TRAIN_MODEL_PATHS) as TrainModelKey[]
  await Promise.allSettled(keys.map((k) => loadTrainModel(k)))
}

/**
 * Ambil salinan instans model secara sinkron jika sudah tersedia di cache.
 * Jika belum siap di-cache, mengembalikan null agar pemanggil dapat menggunakan fallback prosedural.
 */
export function instantiateTrainModel(
  key: TrainModelKey,
  scale = KENNEY_TRAIN_SCALE,
): LoadedTrainEntity | null {
  const master = modelCache.get(key)
  if (!master) return null

  const root = master.clone(true)
  root.scale.setScalar(scale)

  const wheels: THREE.Object3D[] = []
  root.traverse((node) => {
    if (node.name && node.name.toLowerCase().includes('wheel')) {
      wheels.push(node)
    }
  })

  return { root, wheels }
}

/**
 * Cek apakah model tertentu sudah siap di-cache.
 */
export function isTrainModelCached(key: TrainModelKey): boolean {
  return modelCache.has(key)
}

/**
 * Kosongkan cache (berguna untuk testing atau pembersihan memori).
 */
export function clearTrainModelCache(): void {
  modelCache.clear()
}
