import { describe, expect, it, vi, beforeEach } from 'vitest'
import * as THREE from 'three'
import { TrainScene } from '../src/components/train/TrainScene'
import { clearTrainModelCache, loadTrainModel } from '../src/lib/trainModelLoader'

vi.mock('three', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('three')>()
  class WebGLRendererStub {
    readonly shadowMap = { enabled: false }
    setPixelRatio(): void {}
    setSize(): void {}
    setClearColor(): void {}
    render(): void {}
    dispose(): void {}
  }
  return {
    ...actual,
    WebGLRenderer: WebGLRendererStub as unknown as typeof actual.WebGLRenderer,
  }
})

function createMockGltfModel(name: string, wheelCount = 2): THREE.Group {
  const root = new THREE.Group()
  root.name = name

  const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
  body.name = 'body'
  root.add(body)

  for (let i = 0; i < wheelCount; i++) {
    const wheel = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4))
    wheel.name = `wheel-${i}`
    root.add(wheel)
  }

  return root
}

describe('TrainScene GLTF integration (Fase 3 & 4)', () => {
  beforeEach(() => {
    clearTrainModelCache()
    vi.restoreAllMocks()
  })

  it('fallback ke prosedural secara otomatis jika cache GLTF belum siap', () => {
    const scene = new TrainScene(document.createElement('canvas'), { useGltf: true })
    // Karena cache kosong, scene secara anggun merender bodi prosedural
    let gltfCount = 0
    let proceduralDome = 0
    scene.trainGroup.traverse((o) => {
      if (o.userData?.part === 'gltf-loco') gltfCount++
      if (o.userData?.part === 'dome') proceduralDome++
    })
    expect(gltfCount).toBe(0)
    expect(proceduralDome).toBe(1)
    scene.dispose()
  })

  it('memasang model GLTF lokomotif & gerbong saat cache tersedia', async () => {
    const locoClassic = createMockGltfModel('train-locomotive-a', 4)
    const wagonBox = createMockGltfModel('train-carriage-box', 2)

    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((path, onLoad) => {
      const p = String(path)
      let sceneModel = locoClassic
      if (p.includes('carriage-box')) sceneModel = wagonBox
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({ scene: sceneModel })
      }
    })

    // Isi cache
    await loadTrainModel('loco-classic')
    await loadTrainModel('wagon-box')

    const scene = new TrainScene(document.createElement('canvas'), { useGltf: true })
    scene.applyTrainVariant({
      loco: 'classic',
      locoColor: '#e05555',
      wagons: [{ kind: 'boxcar', color: '#f5b942' }],
    })

    let hasGltfLoco = false
    let hasGltfWagon = false

    scene.trainGroup.traverse((o) => {
      if (o.userData?.part === 'gltf-loco') hasGltfLoco = true
    })

    const root = scene.trainGroup.parent ?? scene.trainGroup
    root.traverse((o) => {
      if (o.userData?.part === 'gltf-wagon') hasGltfWagon = true
    })

    expect(hasGltfLoco).toBe(true)
    expect(hasGltfWagon).toBe(true)
    expect(scene.isGltfEnabled()).toBe(true)

    scene.dispose()
  })

  it('memutar roda GLTF lokomotif dan gerbong saat update loop berjalan', async () => {
    const locoClassic = createMockGltfModel('train-locomotive-a', 2)
    const wagonBox = createMockGltfModel('train-carriage-box', 2)

    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((path, onLoad) => {
      const p = String(path)
      let sceneModel = locoClassic
      if (p.includes('carriage-box')) sceneModel = wagonBox
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({ scene: sceneModel })
      }
    })

    await loadTrainModel('loco-classic')
    await loadTrainModel('wagon-box')

    const scene = new TrainScene(document.createElement('canvas'), { useGltf: true })
    scene.applyTrainVariant({
      loco: 'classic',
      locoColor: '#e05555',
      wagons: [{ kind: 'boxcar', color: '#f5b942' }],
    })

    // Temukan node roda di dalam GLTF loco
    let locoWheelNode: THREE.Object3D | null = null
    scene.trainGroup.traverse((o) => {
      if (o.name && o.name.includes('wheel')) locoWheelNode = o
    })
    expect(locoWheelNode).not.toBeNull()

    const initialRot = locoWheelNode!.rotation.x
    // Jalankan beberapa frame update
    scene.update(0.016)
    scene.update(0.016)

    expect(locoWheelNode!.rotation.x).toBeGreaterThan(initialRot)
    scene.dispose()
  })

  it('mendukung toggle setGltfEnabled dinamis dan refresh mesh secara mulus', async () => {
    const locoClassic = createMockGltfModel('train-locomotive-a', 2)
    const wagonBox = createMockGltfModel('train-carriage-box', 2)

    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((path, onLoad) => {
      const p = String(path)
      let sceneModel = locoClassic
      if (p.includes('carriage-box')) sceneModel = wagonBox
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({ scene: sceneModel })
      }
    })

    // Mulai dengan mode prosedural default
    const scene = new TrainScene(document.createElement('canvas'))
    expect(scene.isGltfEnabled()).toBe(false)

    // Muat cache di latar belakang
    await loadTrainModel('loco-classic')
    await loadTrainModel('wagon-box')

    // Aktifkan GLTF secara dinamis
    scene.setGltfEnabled(true)
    expect(scene.isGltfEnabled()).toBe(true)

    let hasGltfLoco = false
    scene.trainGroup.traverse((o) => {
      if (o.userData?.part === 'gltf-loco') hasGltfLoco = true
    })
    expect(hasGltfLoco).toBe(true)

    // Kembalikan ke prosedural
    scene.setGltfEnabled(false)
    expect(scene.isGltfEnabled()).toBe(false)

    let hasDome = false
    scene.trainGroup.traverse((o) => {
      if (o.userData?.part === 'dome') hasDome = true
    })
    expect(hasDome).toBe(true)

    scene.dispose()
  })

  it('menggunakan model GLTF sapi dan domba saat cache fauna tersedia', async () => {
    const mockCow = new THREE.Group()
    mockCow.name = 'MockCow'
    const mockSheep = new THREE.Group()
    mockSheep.name = 'MockSheep'

    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((path, onLoad) => {
      const p = String(path)
      let sceneModel = mockCow
      if (p.includes('sheep')) sceneModel = mockSheep
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({ scene: sceneModel, animations: [] })
      }
    })

    const { loadAnimalModel, clearAnimalModelCache } = await import('../src/lib/animalModelLoader')
    clearAnimalModelCache()
    await loadAnimalModel('cow')
    await loadAnimalModel('sheep')

    const scene = new TrainScene(document.createElement('canvas'), { useGltf: true })
    scene.applyTheme(2, 'DESA')

    let foundCow = false
    let foundSheepCount = 0
    // @ts-expect-error test inspection
    scene.farmGroup.traverse((o: THREE.Object3D) => {
      if (o.name === 'MockCow') foundCow = true
      if (o.name === 'MockSheep') foundSheepCount++
    })

    expect(foundCow).toBe(true)
    expect(foundSheepCount).toBe(2)
    scene.dispose()
  })

  it('menggunakan model GLTF rumah dan lumbung saat cache bangunan tersedia', async () => {
    const mockHouse = new THREE.Group()
    mockHouse.name = 'MockHouse'
    const mockBarn = new THREE.Group()
    mockBarn.name = 'MockBarn'

    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((path, onLoad) => {
      const p = String(path)
      let sceneModel = mockHouse
      if (p.includes('barn')) sceneModel = mockBarn
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({ scene: sceneModel, animations: [] })
      }
    })

    const { loadBuildingModel, clearBuildingModelCache } =
      await import('../src/lib/buildingModelLoader')
    clearBuildingModelCache()
    await loadBuildingModel('house')
    await loadBuildingModel('barn')

    const scene = new TrainScene(document.createElement('canvas'), { useGltf: true })
    scene.applyTheme(2, 'DESA')

    let foundHouseCount = 0
    let foundBarn = false

    // @ts-expect-error test inspection
    scene.houseGroup.traverse((o: THREE.Object3D) => {
      if (o.userData?.part === 'gltf-house') foundHouseCount++
    })

    // @ts-expect-error test inspection
    scene.farmGroup.traverse((o: THREE.Object3D) => {
      if (o.userData?.part === 'gltf-barn') foundBarn = true
    })

    expect(foundHouseCount).toBe(2)
    expect(foundBarn).toBe(true)
    scene.dispose()
  })

  it('menggunakan model GLTF pohon saat cache pohon tersedia', async () => {
    const mockTreeDefault = new THREE.Group()
    mockTreeDefault.name = 'MockTreeDefault'
    const leaf = new THREE.Mesh(
      new THREE.ConeGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ name: 'leafsGreen' }),
    )
    leaf.name = 'leaf'
    mockTreeDefault.add(leaf)

    const mockTreePine = new THREE.Group()
    mockTreePine.name = 'MockTreePine'
    const mockTreeOak = new THREE.Group()
    mockTreeOak.name = 'MockTreeOak'

    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    vi.spyOn(GLTFLoader.prototype, 'load').mockImplementation((path, onLoad) => {
      const p = String(path)
      let sceneModel = mockTreeDefault
      if (p.includes('pine')) sceneModel = mockTreePine
      if (p.includes('oak')) sceneModel = mockTreeOak
      if (onLoad) {
        // @ts-expect-error test stub
        onLoad({ scene: sceneModel, animations: [] })
      }
    })

    const { loadTreeModel, clearTreeModelCache } = await import('../src/lib/treeModelLoader')
    clearTreeModelCache()
    await loadTreeModel('tree_default')
    await loadTreeModel('tree_pine')
    await loadTreeModel('tree_oak')

    const scene = new TrainScene(document.createElement('canvas'), { useGltf: true })

    let foundTrees = 0
    let foundPines = 0
    let foundOaks = 0

    // @ts-expect-error test inspection
    scene.treeGroup.traverse((o: THREE.Object3D) => {
      if (o.userData?.part === 'gltf-tree') foundTrees++
      if (o.userData?.part === 'gltf-pine') foundPines++
      if (o.userData?.part === 'gltf-oak') foundOaks++
    })

    expect(foundTrees).toBe(4)
    expect(foundPines).toBe(6)
    expect(foundOaks).toBe(4)
    scene.dispose()
  })
})
