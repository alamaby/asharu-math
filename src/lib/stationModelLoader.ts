import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export type StationModelKey = 'bench' | 'canopy' | 'flag' | 'clock' | 'platform'

export const STATION_MODEL_PATHS: Record<StationModelKey, string> = {
  bench: '/models/train/station_bench.glb',
  canopy: '/models/train/station_canopy.glb',
  flag: '/models/train/station_flag.glb',
  clock: '/models/train/station_clock.glb',
  platform: '/models/train/station_platform.glb',
}

/**
 * Skala penyesuaian agar proporsi model stasiun GLTF selaras dengan dimensi dunia TrainScene:
 * - bench: skala 2.0 menghasilkan bangku taman/peron dengan lebar ~0.8 unit dan tinggi ~0.94 unit
 * - canopy: skala 1.0 menghasilkan peneduh beratap lebar 4.4 unit dan tinggi 2.2 unit
 * - flag: skala 1.0 menghasilkan tiang bendera setinggi 2.44 unit
 * - clock: skala 1.0 menghasilkan jam stasiun bundar berdiameter 0.64 unit
 * - platform: skala 1.0 menghasilkan peron berdimensi 10 x 0.4 x 4 unit
 */
export const STATION_SCALES: Record<StationModelKey, number> = {
  bench: 2.0,
  canopy: 1.0,
  flag: 1.0,
  clock: 1.0,
  platform: 1.0,
}

interface CachedStationGLTF {
  scene: THREE.Group
}

const modelCache = new Map<StationModelKey, CachedStationGLTF>()
let sharedLoader: GLTFLoader | null = null

function getLoader(): GLTFLoader {
  if (!sharedLoader) {
    sharedLoader = new GLTFLoader()
  }
  return sharedLoader
}

/**
 * Memuat model stasiun GLTF dengan caching in-memory.
 */
export async function loadStationModel(key: StationModelKey): Promise<CachedStationGLTF> {
  const cached = modelCache.get(key)
  if (cached) {
    return cached
  }

  const path = STATION_MODEL_PATHS[key]
  const loader = getLoader()

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const data: CachedStationGLTF = {
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
 * Preload seluruh model stasiun GLTF secara paralel saat modul kereta diinisialisasi.
 */
export async function preloadStationModels(): Promise<void> {
  const keys = Object.keys(STATION_MODEL_PATHS) as StationModelKey[]
  await Promise.allSettled(keys.map((k) => loadStationModel(k)))
}

/**
 * Ambil salinan instans model stasiun secara sinkron jika sudah tersedia di cache.
 * Jika belum siap di-cache, mengembalikan null agar pemanggil dapat menggunakan fallback geometri prosedural.
 */
export function instantiateStationModel(
  key: StationModelKey,
  scale = STATION_SCALES[key],
): THREE.Group | null {
  const master = modelCache.get(key)
  if (!master) return null

  const instance = master.scene.clone(true)
  const root = new THREE.Group()
  root.add(instance)
  root.scale.setScalar(scale)

  return root
}

export function isStationModelCached(key: StationModelKey): boolean {
  return modelCache.has(key)
}

export function clearStationModelCache(): void {
  modelCache.clear()
}
