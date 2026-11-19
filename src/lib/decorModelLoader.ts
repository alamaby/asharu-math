/**
 * Loader in-memory untuk aset 3D GLTF dekorasi sekunder kereta (CC0):
 * - station_lantern.glb: Tiang lentera stasiun senja (K3)
 * - flower_patch.glb: Rumpun bunga padang rumput (K1)
 * - butterfly.glb: Kupu-kupu manis berengsel sayap (K1)
 */
import type * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export type DecorModelKey = 'station_lantern' | 'flower_patch' | 'butterfly'

export const DECOR_MODEL_PATHS: Record<DecorModelKey, string> = {
  station_lantern: '/models/train/station_lantern.glb',
  flower_patch: '/models/train/flower_patch.glb',
  butterfly: '/models/train/butterfly.glb',
}

export interface LoadedLanternEntity {
  root: THREE.Group
  glassMesh: THREE.Mesh | null
}

export interface LoadedButterflyEntity {
  root: THREE.Group
  wingLeft: THREE.Object3D | null
  wingRight: THREE.Object3D | null
}

export interface LoadedFlowerEntity {
  root: THREE.Group
}

const decorCache = new Map<DecorModelKey, THREE.Group>()
const decorPending = new Map<DecorModelKey, Promise<THREE.Group>>()

function getLoader(): GLTFLoader {
  return new GLTFLoader()
}

export async function loadDecorModel(key: DecorModelKey): Promise<THREE.Group> {
  const cached = decorCache.get(key)
  if (cached) return cached

  const pending = decorPending.get(key)
  if (pending) return pending

  const p = new Promise<THREE.Group>((resolve, reject) => {
    const loader = getLoader()
    const url = DECOR_MODEL_PATHS[key]
    loader.load(
      url,
      (gltf) => {
        const root = gltf.scene || (gltf.scenes && gltf.scenes[0])
        if (!root) {
          reject(new Error(`Root scene tidak ditemukan pada model GLTF: ${key}`))
          return
        }
        root.name = `gltf_template_${key}`
        decorCache.set(key, root)
        decorPending.delete(key)
        resolve(root)
      },
      undefined,
      (err) => {
        decorPending.delete(key)
        reject(err)
      },
    )
  })

  decorPending.set(key, p)
  return p
}

export async function preloadDecorModels(): Promise<void> {
  const keys: DecorModelKey[] = ['station_lantern', 'flower_patch', 'butterfly']
  await Promise.allSettled(keys.map((k) => loadDecorModel(k)))
}

export function instantiateStationLantern(): LoadedLanternEntity | null {
  const template = decorCache.get('station_lantern')
  if (!template) return null

  const root = template.clone(true)
  root.name = 'instanced_station_lantern'

  let glassMesh: THREE.Mesh | null = null
  root.traverse((obj) => {
    if (obj.name === 'lantern_glass' && (obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh
      // Clone material agar emissive intensity per lentera independen
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((m) => m.clone())
      } else if (mesh.material) {
        mesh.material = mesh.material.clone()
      }
      glassMesh = mesh
    }
  })

  return { root, glassMesh }
}

export function instantiateFlowerPatch(): LoadedFlowerEntity | null {
  const template = decorCache.get('flower_patch')
  if (!template) return null

  const root = template.clone(true)
  root.name = 'instanced_flower_patch'

  return { root }
}

export function instantiateButterfly(): LoadedButterflyEntity | null {
  const template = decorCache.get('butterfly')
  if (!template) return null

  const root = template.clone(true)
  root.name = 'instanced_butterfly'

  const wingLeft = root.getObjectByName('wing_left') || null
  const wingRight = root.getObjectByName('wing_right') || null

  return { root, wingLeft, wingRight }
}

export function isDecorModelCached(key: DecorModelKey): boolean {
  return decorCache.has(key)
}

export function clearDecorModelCache(): void {
  decorCache.clear()
  decorPending.clear()
}
