import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export type TreeModelKey = 'tree_default' | 'tree_pine' | 'tree_oak'

export const TREE_MODEL_PATHS: Record<TreeModelKey, string> = {
  tree_default: '/models/train/tree_default.glb',
  tree_pine: '/models/train/tree_pine.glb',
  tree_oak: '/models/train/tree_oak.glb',
}

/**
 * Skala penyesuaian agar ukuran model GLTF selaras dengan proporsi dunia TrainScene:
 * - tree_default: ~2.4 unit tinggi (menggantikan pohon utama batang 0.8 + daun 1.4 = 2.2 unit)
 * - tree_pine: ~2.0 unit tinggi (menggantikan kerucut pinus bukit 1.6 unit)
 * - tree_oak: ~1.85 unit tinggi (menggantikan kanopi bulat bola 1.5 unit)
 */
export const TREE_SCALES: Record<TreeModelKey, number> = {
  tree_default: 1.4,
  tree_pine: 1.3,
  tree_oak: 1.5,
}

export interface LoadedTreeEntity {
  root: THREE.Group
  leafMesh: THREE.Mesh | null
}

interface CachedTreeGLTF {
  scene: THREE.Group
}

const modelCache = new Map<TreeModelKey, CachedTreeGLTF>()
let sharedLoader: GLTFLoader | null = null

function getLoader(): GLTFLoader {
  if (!sharedLoader) {
    sharedLoader = new GLTFLoader()
  }
  return sharedLoader
}

/**
 * Memuat model pohon GLTF dengan caching in-memory.
 */
export async function loadTreeModel(key: TreeModelKey): Promise<CachedTreeGLTF> {
  const cached = modelCache.get(key)
  if (cached) {
    return cached
  }

  const path = TREE_MODEL_PATHS[key]
  const loader = getLoader()

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const data: CachedTreeGLTF = {
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
 * Preload seluruh model pohon GLTF secara paralel saat modul kereta diinisialisasi.
 */
export async function preloadTreeModels(): Promise<void> {
  const keys = Object.keys(TREE_MODEL_PATHS) as TreeModelKey[]
  await Promise.allSettled(keys.map((k) => loadTreeModel(k)))
}

/**
 * Ambil salinan instans model pohon secara sinkron jika sudah tersedia di cache.
 * Jika belum siap di-cache, mengembalikan null agar pemanggil dapat menggunakan fallback geometri prosedural.
 */
export function instantiateTreeModel(
  key: TreeModelKey,
  scale = TREE_SCALES[key],
): LoadedTreeEntity | null {
  const master = modelCache.get(key)
  if (!master) return null

  const instance = master.scene.clone(true)
  const root = new THREE.Group()
  root.add(instance)
  root.scale.setScalar(scale)

  let leafMesh: THREE.Mesh | null = null
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      const mat = obj.material
      const matName = Array.isArray(mat) ? mat[0]?.name : mat?.name
      if (/leaf/i.test(obj.name) || (matName && /leaf/i.test(matName))) {
        leafMesh = obj
      }
    }
  })

  return { root, leafMesh }
}

export function isTreeModelCached(key: TreeModelKey): boolean {
  return modelCache.has(key)
}

export function clearTreeModelCache(): void {
  modelCache.clear()
}
