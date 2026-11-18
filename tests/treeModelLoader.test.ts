import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as THREE from 'three'
import {
  TREE_MODEL_PATHS,
  TREE_SCALES,
  instantiateTreeModel,
  isTreeModelCached,
  clearTreeModelCache,
  loadTreeModel,
  type TreeModelKey,
} from '../src/lib/treeModelLoader'

describe('treeModelLoader', () => {
  beforeEach(() => {
    clearTreeModelCache()
    vi.restoreAllMocks()
  })

  it('memiliki path dan skala terdefinisi untuk seluruh key pohon kereta', () => {
    const keys: TreeModelKey[] = ['tree_default', 'tree_pine', 'tree_oak']

    for (const key of keys) {
      expect(TREE_MODEL_PATHS[key]).toBeDefined()
      expect(TREE_MODEL_PATHS[key]).toMatch(/^\/models\/train\/.*\.glb$/)
      expect(TREE_SCALES[key]).toBeGreaterThan(0)
    }
  })

  it('mengembalikan null jika model belum berada di cache (graceful fallback)', () => {
    expect(isTreeModelCached('tree_default')).toBe(false)
    const entity = instantiateTreeModel('tree_default')
    expect(entity).toBeNull()
  })

  it('menginstansiasi model pohon lengkap dengan skala dan pendeteksian leafMesh jika ada di cache', async () => {
    const masterScene = new THREE.Group()
    masterScene.name = 'TreeMaster'
    const trunkMesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1))
    trunkMesh.name = 'trunk'
    const leafMesh = new THREE.Mesh(
      new THREE.ConeGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ name: 'leafsGreen' }),
    )
    leafMesh.name = 'leaf'
    masterScene.add(trunkMesh, leafMesh)

    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((_path, onLoad) => {
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({
          scene: masterScene,
          scenes: [masterScene],
          animations: [],
          cameras: [],
          asset: {},
          userData: {},
        })
      }
    })

    await loadTreeModel('tree_default')
    expect(isTreeModelCached('tree_default')).toBe(true)

    const entity = instantiateTreeModel('tree_default')
    expect(entity).not.toBeNull()
    expect(entity?.root.scale.x).toBeCloseTo(TREE_SCALES.tree_default)
    expect(entity?.leafMesh).not.toBeNull()
    expect(entity?.leafMesh?.name).toBe('leaf')
  })
})
