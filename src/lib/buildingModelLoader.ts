import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export type BuildingModelKey = 'house' | 'barn'

export const BUILDING_MODEL_PATHS: Record<BuildingModelKey, string> = {
  house: '/models/train/house.glb',
  barn: '/models/train/barn.glb',
}

/**
 * Skala penyesuaian agar ukuran model GLTF selaras dengan proporsi dunia TrainScene:
 * - house: ~2.3 unit lebar & panjang (menggantikan balok 2.2 x 1.4 x 1.8)
 * - barn: ~2.1 unit lebar & panjang (menggantikan balok 1.4 x 1.0 x 1.2)
 */
export const BUILDING_SCALES: Record<BuildingModelKey, number> = {
  house: 3.5,
  barn: 0.35,
}

interface CachedBuildingGLTF {
  scene: THREE.Group
}

const modelCache = new Map<BuildingModelKey, CachedBuildingGLTF>()
let sharedLoader: GLTFLoader | null = null

function getLoader(): GLTFLoader {
  if (!sharedLoader) {
    sharedLoader = new GLTFLoader()
  }
  return sharedLoader
}

/**
 * Memuat model bangunan GLTF dengan caching in-memory.
 */
export async function loadBuildingModel(key: BuildingModelKey): Promise<CachedBuildingGLTF> {
  const cached = modelCache.get(key)
  if (cached) {
    return cached
  }

  const path = BUILDING_MODEL_PATHS[key]
  const loader = getLoader()

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const data: CachedBuildingGLTF = {
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
 * Preload semua model bangunan GLTF secara paralel saat modul kereta diinisialisasi.
 */
export async function preloadBuildingModels(): Promise<void> {
  const keys = Object.keys(BUILDING_MODEL_PATHS) as BuildingModelKey[]
  await Promise.allSettled(keys.map((k) => loadBuildingModel(k)))
}

/**
 * Ambil salinan instans model bangunan secara sinkron jika sudah tersedia di cache.
 * Jika belum siap di-cache, mengembalikan null agar pemanggil dapat menggunakan fallback geometri prosedural.
 */
export function instantiateBuildingModel(
  key: BuildingModelKey,
  scale = BUILDING_SCALES[key],
): THREE.Group | null {
  const master = modelCache.get(key)
  if (!master) return null

  const instance = master.scene.clone(true)
  const root = new THREE.Group()

  if (key === 'house') {
    // Geser mesh internal agar pivot (0,0,0) tepat di titik tengah dasar rumah
    instance.position.set(-0.309, 0, 0.456)
  }

  root.add(instance)
  root.scale.setScalar(scale)

  return root
}

export function isBuildingModelCached(key: BuildingModelKey): boolean {
  return modelCache.has(key)
}

export function clearBuildingModelCache(): void {
  modelCache.clear()
}
