import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export type SignalModelKey = 'signal_post' | 'branch_sign'

export const SIGNAL_MODEL_PATHS: Record<SignalModelKey, string> = {
  signal_post: '/models/train/signal_post.glb',
  branch_sign: '/models/train/branch_sign.glb',
}

export const SIGNAL_SCALES: Record<SignalModelKey, number> = {
  signal_post: 1.0,
  branch_sign: 1.0,
}

export interface LoadedSignalEntity {
  root: THREE.Group
  lamps: THREE.Mesh[]
}

export interface LoadedBranchSignEntity {
  root: THREE.Group
  displayMesh: THREE.Mesh
}

interface CachedSignalGLTF {
  scene: THREE.Group
}

const modelCache = new Map<SignalModelKey, CachedSignalGLTF>()
let sharedLoader: GLTFLoader | null = null

function getLoader(): GLTFLoader {
  if (!sharedLoader) {
    sharedLoader = new GLTFLoader()
  }
  return sharedLoader
}

/**
 * Memuat model sinyal/rambu GLTF dengan caching in-memory.
 */
export async function loadSignalModel(key: SignalModelKey): Promise<CachedSignalGLTF> {
  const cached = modelCache.get(key)
  if (cached) {
    return cached
  }

  const path = SIGNAL_MODEL_PATHS[key]
  const loader = getLoader()

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const data: CachedSignalGLTF = {
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
 * Preload seluruh model sinyal & rambu GLTF secara paralel saat modul kereta diinisialisasi.
 */
export async function preloadSignalModels(): Promise<void> {
  const keys = Object.keys(SIGNAL_MODEL_PATHS) as SignalModelKey[]
  await Promise.allSettled(keys.map((k) => loadSignalModel(k)))
}

/**
 * Ambil salinan instans model tiang sinyal lengkap dengan referensi ke ketiga lensa lampunya.
 */
export function instantiateSignalPost(
  scale = SIGNAL_SCALES.signal_post,
): LoadedSignalEntity | null {
  const master = modelCache.get('signal_post')
  if (!master) return null

  const instance = master.scene.clone(true)
  const root = new THREE.Group()
  root.add(instance)
  root.scale.setScalar(scale)

  const lamps: THREE.Mesh[] = []
  for (let i = 0; i < 3; i++) {
    const lamp = root.getObjectByName(`signal_lamp_${i}`) as THREE.Mesh | undefined
    if (lamp) {
      // Pastikan material lampu diklon mandiri agar emissive terisolasi per scene
      if (Array.isArray(lamp.material)) {
        lamp.material = lamp.material.map((m) => m.clone())
      } else if (lamp.material) {
        lamp.material = lamp.material.clone()
      }
      lamps.push(lamp)
    }
  }

  return { root, lamps }
}

/**
 * Ambil salinan instans model plang rambu jawaban lengkap dengan referensi ke display mesh untuk kanvas tekstur.
 */
export function instantiateBranchSign(
  scale = SIGNAL_SCALES.branch_sign,
): LoadedBranchSignEntity | null {
  const master = modelCache.get('branch_sign')
  if (!master) return null

  const instance = master.scene.clone(true)
  const root = new THREE.Group()
  root.add(instance)
  root.scale.setScalar(scale)

  let displayMesh = root.getObjectByName('sign_display') as THREE.Mesh | undefined
  if (!displayMesh) {
    displayMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9))
    root.add(displayMesh)
  }

  return { root, displayMesh }
}

export function isSignalModelCached(key: SignalModelKey): boolean {
  return modelCache.has(key)
}

export function clearSignalModelCache(): void {
  modelCache.clear()
}
