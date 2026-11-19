/**
 * Scene kereta low-poly — Three.js murni (tanpa fiber).
 * Budget mesh ±125: env 35 (tanah/bukit/pohon 11 + rumah 8 + awan 6 + stasiun 16)
 * + rel 30 (4 tube + 23 bantalan + 3 papan) + kereta 21 (loko 8 + roda 4 + rod 2
 * + gerbong 1-2 + roda gerbong 2 + coupling 1-2 + lampu 1) + asap 3 sprite
 * + fase2 28 (driver 8 + penumpang 8 + bunga 2 + kupu 6 + sapi 2 + lentera 2)
 * + rambu 4 + sapi detail 4. Ditambah ±16 InstancedMesh (pohon/pagar/burung/dll).
 * Geometri bawaan saja; tanpa shadow, fisika, post-processing, shader.
 * Teks WebGL bukan antarmuka — jawaban hanya di DOM (papan 3D cermin saja).
 */
import * as THREE from 'three'
import type { TrainGrade } from '../../lib/trainQuestionGenerator'
import { isValidTrainVariant, type LocoShape, type TrainVariant } from '../../lib/trainVariants'
import { MANEUVER_TOTAL_MS, computeManeuver } from '../../lib/trainManeuver'
import { instantiateTrainModel, type TrainModelKey } from '../../lib/trainModelLoader'
import { instantiateAnimalModel } from '../../lib/animalModelLoader'
import { instantiateBuildingModel } from '../../lib/buildingModelLoader'
import { instantiateTreeModel } from '../../lib/treeModelLoader'
import {
  instantiateCharacterModel,
  type LoadedCharacterEntity,
} from '../../lib/characterModelLoader'
import { instantiateTrackModel } from '../../lib/trackModelLoader'
import { instantiateStationModel } from '../../lib/stationModelLoader'
import {
  instantiateSignalPost,
  instantiateBranchSign,
  type LoadedSignalEntity,
  type LoadedBranchSignEntity,
} from '../../lib/signalModelLoader'

export type BranchIndex = 0 | 1 | 2

export interface TrainSceneCallbacks {
  onReachJunction?: () => void
  onReachStation?: () => void
}

export interface TrainSceneOptions extends TrainSceneCallbacks {
  useGltf?: boolean
}

const MAIN_POINTS = [
  new THREE.Vector3(0, 0, 18),
  new THREE.Vector3(0, 0, 6),
  new THREE.Vector3(0, 0, 0),
]

const BRANCH_ENDS: [number, number][] = [
  [-6, -14],
  [0, -14],
  [6, -14],
]

/** Bow titik tengah cabang (unit dunia) agar rel melengkung, bukan snap di junction. */
const BRANCH_BOW = 1.2

/**
 * Titik tengah cabang: titik tengah chord digeser tegak lurus ke arah sumbu
 * jalur utama (x=0) sehingga kereta meninggalkan junction dengan heading yang
 * hampir sama dengan jalur utama, lalu membengkok keluar menuju ujung cabang.
 * Cabang tengah tetap lurus (tidak ada belokan yang perlu dilalui).
 */
function branchMid(end: [number, number]): [number, number] {
  const mx = end[0] / 2
  const mz = end[1] / 2
  if (end[0] === 0) return [mx, mz]
  const len = Math.hypot(end[0], end[1])
  let px = end[1] / len
  let pz = -end[0] / len
  if (Math.abs(mx + BRANCH_BOW * px) > Math.abs(mx)) {
    px = -px
    pz = -pz
  }
  return [mx + BRANCH_BOW * px, mz + BRANCH_BOW * pz]
}

export type TrainCameraMode = 'fixed' | 'follow' | 'junction' | 'station'

export interface TrainThemeConfig {
  sky: string
  fogNear: number
  fogFar: number
  ground: string
  hill: string
  decor: 'flowers' | 'farm' | 'dusk'
  stationLight: boolean
}

export const TRAIN_THEMES: Record<TrainGrade, TrainThemeConfig> = {
  1: {
    sky: '#dff3ff',
    fogNear: 18,
    fogFar: 40,
    ground: '#a7d8a0',
    hill: '#8fce8f',
    decor: 'flowers',
    stationLight: false,
  },
  2: {
    sky: '#cdeffb',
    fogNear: 20,
    fogFar: 44,
    ground: '#9ed69a',
    hill: '#7fc87f',
    decor: 'farm',
    stationLight: false,
  },
  3: {
    sky: '#e8d5f5',
    fogNear: 16,
    fogFar: 36,
    ground: '#8fbf8a',
    hill: '#6fae7f',
    decor: 'dusk',
    stationLight: true,
  },
}

export class TrainScene {
  readonly mainCurve: THREE.CatmullRomCurve3
  readonly branchCurves: [THREE.CatmullRomCurve3, THREE.CatmullRomCurve3, THREE.CatmullRomCurve3]

  readonly trainGroup = new THREE.Group()

  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private cb: TrainSceneOptions
  private useGltf = false
  private currentLocoColor = '#e05555'
  private currentWagons: { kind: string; color: string }[] = [{ kind: 'boxcar', color: '#f5b942' }]
  private phase: 'main' | 'branch' = 'main'
  private t = 0
  private speed = 0.12
  private paused = false
  private rm = false
  private elapsed = 0
  private lastDir = new THREE.Vector3(0, 0, -1)
  private junctionFired = false
  private stationFired = false
  private selected: BranchIndex = 1
  private disposed = false
  private wheels: THREE.Object3D[] = []
  private proceduralWheels: THREE.Mesh[] = []
  private smokes: THREE.Sprite[] = []
  private smokeTex: THREE.CanvasTexture | null = null
  private clouds: THREE.Group[] = []
  private leaves: THREE.Mesh[] = []
  private branchMats: THREE.MeshLambertMaterial[] = []
  private boardCanvases: HTMLCanvasElement[] = []
  private boardTextures: THREE.CanvasTexture[] = []
  private driverArm: THREE.Mesh | null = null
  private driverHead: THREE.Mesh | null = null
  private waveT = 99
  private passengers: THREE.Mesh[] = []
  private hopT = 99
  private flag: THREE.Mesh | null = null
  private cowHead: THREE.Mesh | null = null
  private animalMixers: THREE.AnimationMixer[] = []
  private gltfCow: THREE.Group | null = null
  private proceduralCowGroup: THREE.Group | null = null
  private gltfSheep: THREE.Group[] = []
  private proceduralSheepGroup: THREE.Group | null = null
  private houseGroup = new THREE.Group()
  private proceduralHouseGroup: THREE.Group | null = null
  private gltfHouses: THREE.Group[] = []
  private barnGroup = new THREE.Group()
  private proceduralBarnGroup: THREE.Group | null = null
  private gltfBarn: THREE.Group | null = null
  private treeGroup = new THREE.Group()
  private proceduralTreeGroup: THREE.Group | null = null
  private gltfTrees: THREE.Group[] = []
  private proceduralLeaves: THREE.Mesh[] = []
  private instancedTreeGroup = new THREE.Group()
  private characterMixers: THREE.AnimationMixer[] = []
  private driverGroup = new THREE.Group()
  private proceduralDriverGroup: THREE.Group | null = null
  private gltfDriver: LoadedCharacterEntity | null = null
  private passengerGroup = new THREE.Group()
  private proceduralPassengerGroup: THREE.Group | null = null
  private gltfPassengers: LoadedCharacterEntity[] = []
  private trackGroup = new THREE.Group()
  private gltfSleepers: THREE.Group[] = []
  private proceduralSleepers: THREE.Mesh[] = []
  private stationGroup = new THREE.Group()
  private proceduralStationGroup: THREE.Group | null = null
  private gltfStationGroup: THREE.Group | null = null
  private gltfFlagCloth: THREE.Object3D | null = null
  private signalGroup = new THREE.Group()
  private proceduralSignalGroup: THREE.Group | null = null
  private gltfSignalEntity: LoadedSignalEntity | null = null
  private gltfBranchSigns: LoadedBranchSignEntity[] = []
  private proceduralBranchBoards: THREE.Mesh[] = []
  private butterflies: THREE.Group[] = []
  private butterflyBase: [number, number, number][] = []
  private flowersGroup = new THREE.Group()
  private farmGroup = new THREE.Group()
  private duskGroup = new THREE.Group()
  private lanternMats: THREE.MeshLambertMaterial[] = []
  private signalMats: THREE.MeshLambertMaterial[] = []
  private groundMat: THREE.MeshLambertMaterial | null = null
  private hillMat: THREE.MeshLambertMaterial | null = null
  private signCanvas: HTMLCanvasElement | null = null
  private signTexture: THREE.CanvasTexture | null = null
  private camMode: TrainCameraMode = 'fixed'
  private camPos = new THREE.Vector3(0, 7, 10)
  private camLook = new THREE.Vector3(0, 0, -4)
  private camSmooth = new THREE.Vector3(0, 0, -4)
  private locoParts: THREE.Object3D[] = []
  private wagonUnits: THREE.Group[] = []
  private rods: THREE.Mesh[] = []
  private locoShape: LocoShape = 'classic'
  private detailGroup = new THREE.Group()
  private birds: THREE.InstancedMesh | null = null
  private fireflyMats: THREE.MeshLambertMaterial[] = []
  private birdDummy = new THREE.Object3D()
  private maneuverActive = false
  private maneuverStart = -1
  private canvasEl: HTMLCanvasElement | null = null
  private yawOffset = 0
  private dragging = false
  private dragLastX = 0

  constructor(canvas: HTMLCanvasElement, cb: TrainSceneOptions = {}) {
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'low-power',
      })
    } catch {
      throw new Error('WebGL tidak tersedia')
    }
    this.cb = cb
    if (cb.useGltf) {
      this.useGltf = true
    }

    const w = canvas.clientWidth || 320
    const h = canvas.clientHeight || 220
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    this.renderer.shadowMap.enabled = false
    this.renderer.setClearColor(new THREE.Color('#dff3ff'), 1)
    this.renderer.setSize(w, h, false)

    this.scene.fog = new THREE.Fog('#dff3ff', 18, 40)
    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100)
    this.camera.position.set(0, 7, 10)
    this.camera.lookAt(0, 0, -4)

    this.mainCurve = new THREE.CatmullRomCurve3(MAIN_POINTS)
    this.branchCurves = [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(branchMid(BRANCH_ENDS[0])[0], 0, branchMid(BRANCH_ENDS[0])[1]),
        new THREE.Vector3(BRANCH_ENDS[0][0], 0, BRANCH_ENDS[0][1]),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(branchMid(BRANCH_ENDS[1])[0], 0, branchMid(BRANCH_ENDS[1])[1]),
        new THREE.Vector3(BRANCH_ENDS[1][0], 0, BRANCH_ENDS[1][1]),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(branchMid(BRANCH_ENDS[2])[0], 0, branchMid(BRANCH_ENDS[2])[1]),
        new THREE.Vector3(BRANCH_ENDS[2][0], 0, BRANCH_ENDS[2][1]),
      ]),
    ]

    this.buildEnvironment()
    this.buildTracks()
    this.buildTrain()
    this.buildSmoke()
    this.buildInstancedDetail()
    this.placeAllUnits(0)
    this.applyTheme(1, 'STASIUN')

    this.canvasEl = canvas
    canvas.addEventListener('pointerdown', this.onPointerDown)
    canvas.addEventListener('pointermove', this.onPointerMove)
    window.addEventListener('pointerup', this.onPointerUp)
    window.addEventListener('pointercancel', this.onPointerUp)
  }

  get trainT(): number {
    return this.t
  }

  get selectedBranch(): BranchIndex {
    return this.selected
  }

  setBranch(i: BranchIndex): void {
    this.selected = i
    this.stationFired = false
    if (this.rm) {
      this.phase = 'branch'
      this.t = 0
      return
    }
    this.maneuverActive = true
    this.maneuverStart = this.elapsed
    this.phase = 'main'
    this.t = 1
  }

  reset(): void {
    this.phase = 'main'
    this.t = 0
    this.junctionFired = false
    this.stationFired = false
    this.maneuverActive = false
    this.maneuverStart = -1
    this.placeAllUnits(0)
    this.setSelectedGlow(null)
    this.setSignal(null, true)
    this.setCameraMode('fixed')
  }

  setPaused(p: boolean): void {
    this.paused = p
  }

  setReducedMotion(r: boolean): void {
    this.speed = r ? 0.35 : 0.12
    this.rm = r
  }

  setCameraMode(mode: TrainCameraMode): void {
    this.camMode = mode
  }

  setAnswers(answers: [string, string, string]): void {
    if (!answers || answers.length !== 3) return
    if (this.boardTextures.length !== 3) return
    for (let i = 0; i < 3; i++) {
      this.drawBoard(i, answers[i]!)
      this.boardTextures[i]!.needsUpdate = true
    }
  }

  setSelectedGlow(index: BranchIndex | null): void {
    for (let i = 0; i < this.branchMats.length; i++) {
      const m = this.branchMats[i]!
      if (index === i) {
        m.emissive.set('#fbbf24')
        m.emissiveIntensity = 0.6
      } else {
        m.emissive.set('#000000')
        m.emissiveIntensity = 0
      }
    }
  }

  setSignal(active: BranchIndex | null, ok: boolean): void {
    for (let i = 0; i < this.signalMats.length; i++) {
      const m = this.signalMats[i]!
      if (active === i) {
        m.emissive.set(ok ? '#22c55e' : '#facc15')
        m.emissiveIntensity = 1.2
      } else {
        m.emissive.set('#000000')
        m.emissiveIntensity = 0
      }
    }
    if (this.gltfSignalEntity) {
      for (let i = 0; i < this.gltfSignalEntity.lamps.length; i++) {
        const lamp = this.gltfSignalEntity.lamps[i]!
        const mat = lamp.material as THREE.MeshStandardMaterial
        if (active === i) {
          mat.emissive.set(ok ? '#22c55e' : '#facc15')
          mat.emissiveIntensity = 1.2
        } else {
          mat.emissive.set('#000000')
          mat.emissiveIntensity = 0
        }
      }
    }
  }

  setStationBoard(label: string, sub: string): void {
    this.drawSign(label, sub)
    if (this.signTexture) this.signTexture.needsUpdate = true
  }

  applyTrainVariant(variant: TrainVariant): void {
    if (this.disposed) return
    if (!isValidTrainVariant(variant)) return
    this.currentLocoColor = variant.locoColor
    this.currentWagons = variant.wagons
    this.locoShape = variant.loco
    // Bangun dulu, buang yang lama belakangan: jika konstruksi gagal,
    // part lama tetap terpasang sehingga kereta tidak pernah tanpa badan.
    const freshLoco = this.makeLocoParts(variant.loco, variant.locoColor)
    this.trainGroup.add(...freshLoco)
    this.disposeParts(this.locoParts)
    this.locoParts = freshLoco
    this.buildWagonUnits(variant.wagons)
  }

  setGltfEnabled(enabled: boolean): void {
    if (this.disposed || this.useGltf === enabled) return
    this.useGltf = enabled
    this.refreshTrainMesh()
    this.refreshAnimalMeshes()
    this.refreshBuildingMeshes()
    this.refreshTreeMeshes()
    this.refreshCharacterMeshes()
    this.refreshTrackMeshes()
    this.refreshStationMeshes()
    this.refreshSignalMeshes()
  }

  isGltfEnabled(): boolean {
    return this.useGltf
  }

  isDisposed(): boolean {
    return this.disposed
  }

  private refreshTrainMesh(): void {
    if (this.disposed) return
    const freshLoco = this.makeLocoParts(this.locoShape, this.currentLocoColor)
    this.trainGroup.add(...freshLoco)
    this.disposeParts(this.locoParts)
    this.locoParts = freshLoco
    this.buildWagonUnits(this.currentWagons)
  }

  applyTheme(grade: TrainGrade, stationLabel: string): void {
    const g = grade === 1 || grade === 2 || grade === 3 ? grade : 1
    const theme = TRAIN_THEMES[g]!
    this.renderer.setClearColor(new THREE.Color(theme.sky), 1)
    this.scene.fog = new THREE.Fog(theme.sky, theme.fogNear, theme.fogFar)
    this.groundMat?.color.set(theme.ground)
    this.hillMat?.color.set(theme.hill)
    this.flowersGroup.visible = theme.decor === 'flowers'
    this.farmGroup.visible = theme.decor === 'farm'
    this.duskGroup.visible = true
    for (const m of this.lanternMats) {
      m.emissiveIntensity = theme.stationLight ? 1.4 : 0.15
    }
    this.drawSign(stationLabel)
    if (this.signTexture) this.signTexture.needsUpdate = true
  }

  waveDriver(): void {
    if (this.disposed) return
    this.waveT = 0
  }

  celebrateAtStation(): void {
    if (this.disposed) return
    this.hopT = 0
  }

  update(dt: number): void {
    if (this.disposed || this.paused) return
    if (!Number.isFinite(dt) || dt <= 0) return
    const dtc = Math.min(dt, 0.05)
    this.elapsed += dtc
    const wheelRate = this.rm ? 4 : 8
    const spin = dtc * wheelRate
    for (const w of this.wheels) w.rotation.x += spin
    for (const unit of this.wagonUnits) {
      for (const w of (unit.userData.wheels as THREE.Object3D[]) ?? []) w.rotation.x += spin
    }
    // Batang roda mengikuti pin crank (gerak melingkar penuh, radius 0.14 agar
    // jelas terlihat); kiri dan kanan 180° berlawanan fase
    if (!this.useGltf) {
      for (const rod of this.rods) {
        const side = rod.userData.side as number
        rod.position.y = 0.28 + 0.14 * Math.cos(this.elapsed * wheelRate) * side
        rod.position.z = 0.3 + 0.14 * Math.sin(this.elapsed * wheelRate) * side
      }
    }
    if (this.maneuverActive) {
      const elapsedMs = (this.elapsed - this.maneuverStart) * 1000
      const m = computeManeuver(elapsedMs)
      this.placeAllUnits(m.t * this.mainCurve.getLength())
      if (elapsedMs >= MANEUVER_TOTAL_MS) {
        this.maneuverActive = false
        this.phase = 'branch'
        this.t = 0
      }
      this.updateSmoke()
      this.updateCamera(dtc)
      return
    }
    const step = dtc * this.speed
    if (this.phase === 'main') {
      this.t = Math.min(1, this.t + step)
      this.placeAllUnits(this.t * this.mainCurve.getLength())
      if (this.t >= 1 && !this.junctionFired) {
        this.junctionFired = true
        this.cb.onReachJunction?.()
      }
    } else {
      this.t = Math.min(1, this.t + step)
      this.placeAllUnits(
        this.mainCurve.getLength() + this.t * this.branchCurves[this.selected].getLength(),
      )
      if (this.t >= 1 && !this.stationFired) {
        this.stationFired = true
        if (this.gltfDriver?.actions.has('Victory')) {
          this.gltfDriver.actions.get('Idle')?.fadeOut(0.3)
          this.gltfDriver.actions.get('Victory')?.reset().fadeIn(0.3).play()
        }
        for (const p of this.gltfPassengers) {
          if (p.actions.has('Victory')) {
            p.actions.get('Idle')?.fadeOut(0.3)
            p.actions.get('Victory')?.reset().fadeIn(0.3).play()
          }
        }
        this.cb.onReachStation?.()
      }
    }
    if (!this.rm) {
      this.trainGroup.position.y += Math.sin(this.elapsed * 10) * 0.02
    }
    this.updateSmoke()
    for (const c of this.clouds) {
      c.position.x += dtc * 0.3
      if (c.position.x > 16) c.position.x = -16
    }
    for (let i = 0; i < this.leaves.length; i++) {
      this.leaves[i]!.rotation.z = Math.sin(this.elapsed * 1.5 + i) * 0.06
    }
    if (this.driverArm) {
      if (this.waveT < 1) {
        this.driverArm.rotation.x = -0.6 - Math.abs(Math.sin(this.elapsed * 12)) * 0.9
        this.waveT += dtc
      } else {
        this.driverArm.rotation.x = 0
      }
    }
    if (this.hopT < 1) {
      for (let pi = 0; pi < this.passengers.length; pi++) {
        this.passengers[pi]!.position.y =
          0.8 + Math.abs(Math.sin(this.elapsed * 10 + pi * 1.5)) * 0.18
      }
      this.hopT += dtc
    } else {
      for (const p of this.passengers) {
        if (p.position.y !== 0.8) p.position.y = 0.8
      }
    }
    if (!this.rm) {
      const flagWave = Math.sin(this.elapsed * 3) * 0.35
      if (this.flag) {
        this.flag.rotation.y = flagWave
      }
      if (this.gltfFlagCloth) {
        this.gltfFlagCloth.rotation.y = flagWave
      }
    }
    if (this.cowHead && !this.rm && !this.gltfCow) {
      this.cowHead.rotation.x = Math.sin(this.elapsed * 0.8) * 0.15
    }
    if (!this.rm && this.farmGroup.visible) {
      for (const mixer of this.animalMixers) {
        mixer.update(dtc)
      }
    }
    if (!this.rm) {
      for (const mixer of this.characterMixers) {
        mixer.update(dtc)
      }
    }
    if (this.driverHead) {
      this.driverHead.rotation.y = this.phase === 'branch' ? this.selected * 0.4 - 0.4 : 0
    }
    if (!this.rm) {
      for (let i = 0; i < this.butterflies.length; i++) {
        const b = this.butterflies[i]!
        const base = this.butterflyBase[i]!
        b.position.x = base[0] + Math.sin(this.elapsed + i) * 0.8
        b.position.y = base[1] + Math.sin(this.elapsed * 2 + i) * 0.3
        b.rotation.y = Math.sin(this.elapsed * 8 + i) * 0.6
        // Kepakan: sayap kanan dan kiri berayun berlawanan di hinge badan
        const flap = Math.sin(this.elapsed * 12 + i * 2) * 0.7
        const wings = b.userData.wings as THREE.Mesh[]
        wings[0]!.rotation.z = flap
        wings[1]!.rotation.z = -flap
      }
      if (this.birds) {
        for (let i = 0; i < 3; i++) {
          this.birdDummy.position.set(
            -4 + i * 4 + Math.sin(this.elapsed * 0.4 + i) * 2.5,
            6 + Math.sin(this.elapsed * 0.8 + i * 1.3) * 0.5,
            -6 + Math.cos(this.elapsed * 0.4 + i) * 2,
          )
          this.birdDummy.rotation.set(0, this.elapsed * 0.6 + i, Math.PI / 2)
          this.birdDummy.scale.setScalar(1)
          this.birdDummy.updateMatrix()
          this.birds.setMatrixAt(i, this.birdDummy.matrix)
        }
        this.birds.instanceMatrix.needsUpdate = true
      }
      for (let i = 0; i < this.fireflyMats.length; i++) {
        this.fireflyMats[i]!.emissiveIntensity =
          0.6 + 0.6 * Math.abs(Math.sin(this.elapsed * 3 + i))
      }
    }
    this.updateCamera(dtc)
  }

  render(): void {
    if (this.disposed) return
    this.renderer.render(this.scene, this.camera)
  }

  resize(w: number, h: number): void {
    if (this.disposed || w <= 0 || h <= 0) return
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h, false)
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    for (const m of this.animalMixers) {
      m.stopAllAction()
    }
    this.animalMixers = []
    this.disposeParts(this.locoParts)
    if (this.canvasEl) {
      this.canvasEl.removeEventListener('pointerdown', this.onPointerDown)
      this.canvasEl.removeEventListener('pointermove', this.onPointerMove)
    }
    window.removeEventListener('pointerup', this.onPointerUp)
    window.removeEventListener('pointercancel', this.onPointerUp)
    const geos = new Set<THREE.BufferGeometry>()
    const mats = new Set<THREE.Material>()
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh && (mesh as THREE.Mesh).isMesh) {
        const g = (mesh as THREE.Mesh).geometry
        if (g) geos.add(g as THREE.BufferGeometry)
        const m = (mesh as THREE.Mesh).material
        if (Array.isArray(m)) {
          for (const mm of m) mats.add(mm)
        } else if (m) {
          mats.add(m as THREE.Material)
        }
        return
      }
      const sprite = obj as THREE.Sprite
      if (sprite && (sprite as THREE.Sprite).isSprite) {
        const m = sprite.material
        if (m) mats.add(m as THREE.Material)
      }
    })
    for (const g of geos) g.dispose()
    for (const m of mats) m.dispose()
    this.smokeTex?.dispose()
    for (const t of this.boardTextures) t.dispose()
    this.signTexture?.dispose()
    this.renderer.dispose()
  }

  private lambert(color: string): THREE.MeshLambertMaterial {
    return new THREE.MeshLambertMaterial({ color })
  }

  private phong(color: string): THREE.MeshPhongMaterial {
    return new THREE.MeshPhongMaterial({ color, shininess: 35, specular: '#555555' })
  }

  private disposeParts(parts: THREE.Object3D[]): void {
    for (const part of parts) {
      part.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh && mesh.isMesh) {
          mesh.geometry?.dispose()
          const m = mesh.material
          if (Array.isArray(m)) {
            for (const mm of m) mm.dispose()
          } else if (m) {
            m.dispose()
          }
        }
      })
      this.trainGroup.remove(part)
    }
    parts.length = 0
  }

  private makeLocoParts(shape: LocoShape, color: string): THREE.Object3D[] {
    if (this.useGltf) {
      const gltfKey: TrainModelKey = shape === 'diesel' ? 'loco-diesel' : 'loco-classic'
      const entity = instantiateTrainModel(gltfKey)
      if (entity) {
        entity.root.userData.part = 'gltf-loco'
        for (const w of this.proceduralWheels) w.visible = false
        this.wheels = [...entity.wheels]
        this.rods = []
        return [entity.root]
      }
    }

    for (const w of this.proceduralWheels) w.visible = true
    this.wheels = [...this.proceduralWheels]
    return this.makeProceduralLocoParts(shape, color)
  }

  private makeProceduralLocoParts(shape: LocoShape, color: string): THREE.Object3D[] {
    const parts: THREE.Object3D[] = []
    const bodyMat = this.phong(color)
    const cabinMat = this.lambert('#3b82f6')
    const darkMat = this.lambert('#1f2937')
    if (shape === 'classic') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 2.0), bodyMat)
      body.position.set(0, 0.7, 0.4)
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.8), cabinMat)
      cabin.position.set(0, 1.4, -0.3)
      const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.6, 10), darkMat)
      chimney.position.set(0, 1.35, 1.1)
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), this.lambert('#fcd34d'))
      dome.position.set(0, 1.16, 0.55)
      dome.userData.part = 'dome'
      const window = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.32), this.lambert('#bae6fd'))
      window.position.set(0, 1.48, 0.11)
      window.userData.part = 'cabin-window'
      // Smokebox: silinder gelap di ujung depan boiler + pintu bulat
      const smokebox = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.5, 12), darkMat)
      smokebox.rotation.x = Math.PI / 2
      smokebox.position.set(0, 0.7, 1.4)
      smokebox.userData.part = 'smokebox'
      const smokeboxDoor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.05, 12),
        this.lambert('#374151'),
      )
      smokeboxDoor.rotation.x = Math.PI / 2
      smokeboxDoor.position.set(0, 0.7, 1.66)
      smokeboxDoor.userData.part = 'smokebox-door'
      // Whistle kuning di atas boiler
      const whistle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 0.14, 8),
        this.lambert('#fbbf24'),
      )
      whistle.position.set(0, 1.22, 0.85)
      whistle.userData.part = 'whistle'
      parts.push(body, cabin, chimney, dome, window, smokebox, smokeboxDoor, whistle)
      // Handrail di kedua sisi boiler
      for (const side of [-1, 1] as const) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 1.7), darkMat)
        rail.position.set(0.62 * side, 0.98, 0.4)
        rail.userData.part = 'handrail'
        parts.push(rail)
      }
    } else if (shape === 'diesel') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 2.2), bodyMat)
      body.position.set(0, 0.75, 0.4)
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.7), cabinMat)
      cabin.position.set(0, 1.45, -0.4)
      const window = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), this.lambert('#bae6fd'))
      window.position.set(0, 1.5, -0.04)
      window.userData.part = 'cabin-window'
      parts.push(body, cabin, window)
    } else {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 1.5), bodyMat)
      body.position.set(0, 0.65, 0.4)
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 12), bodyMat)
      tank.rotation.z = Math.PI / 2
      tank.position.set(0, 1.35, 0.2)
      parts.push(body, tank)
    }
    // Cowcatcher: pelat miring di depan loko, posisi z mengikuti panjang bodi
    const cowZ = shape === 'diesel' ? 1.65 : shape === 'tank' ? 1.3 : 1.55
    const cowcatcher = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.55, 0.1), darkMat)
    cowcatcher.position.set(0, 0.33, cowZ)
    cowcatcher.rotation.x = 0.8
    cowcatcher.userData.part = 'cowcatcher'
    parts.push(cowcatcher)
    // Bogie: rangka sisi di luar roda (2 roda loko di z 1.0 dan -0.4)
    for (const side of [-1, 1] as const) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 1.7), darkMat)
      frame.position.set(0.74 * side, 0.28, 0.3)
      frame.userData.part = 'bogie'
      parts.push(frame)
    }
    // Batang roda kiri/kanan (classic & tank): tipis, warna baja terang, dan
    // dipasang DI LUAR rangka bogie (x ±0.86 > ±0.78) agar gerak crank terlihat
    // kontras — sebelumnya satu warna dengan roda/rangka dan tertutup rangka
    if (shape !== 'diesel') {
      for (const side of [-1, 1] as const) {
        const rod = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 1.55), this.lambert('#cbd5e1'))
        rod.position.set(0.86 * side, 0.28, 0.3)
        rod.userData.part = 'rod'
        rod.userData.side = side
        parts.push(rod)
      }
    }
    this.rods = parts.filter((p) => p.userData.part === 'rod') as THREE.Mesh[]
    return parts
  }

  private disposeOldWagons(): void {
    for (const old of this.wagonUnits) {
      old.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.isMesh) {
          mesh.geometry?.dispose()
          const m = mesh.material
          if (Array.isArray(m)) {
            for (const mm of m) mm.dispose()
          } else if (m) {
            m.dispose()
          }
        }
      })
      this.scene.remove(old)
    }
  }

  /**
   * Bangun ulang unit gerbong sebagai pivot terpisah (anak scene). Tiap unit
   * ditempatkan mengikuti rel pada jarak tetap di belakang lokomotif, sehingga
   * belokan terlihat articulated. Pola atomic: bangun baru dulu, buang lama.
   */
  private buildWagonUnits(wagons: { kind: string; color: string }[]): void {
    if (this.useGltf) {
      const gltfUnits: THREE.Group[] = []
      let allLoaded = true
      for (let i = 0; i < wagons.length; i++) {
        const w = wagons[i]!
        const gltfKey: TrainModelKey =
          w.kind === 'tanker' ? 'wagon-tank' : w.kind === 'flatbed' ? 'wagon-flatbed' : 'wagon-box'
        const entity = instantiateTrainModel(gltfKey)
        if (!entity) {
          allLoaded = false
          break
        }
        const unit = new THREE.Group()
        entity.root.userData.part = 'gltf-wagon'
        unit.add(entity.root)
        unit.userData.wheels = entity.wheels
        unit.userData.isGltf = true

        if (i < wagons.length - 1) {
          const coupling = new THREE.Mesh(
            new THREE.BoxGeometry(0.07, 0.07, 0.5),
            this.lambert('#1f2937'),
          )
          coupling.position.set(0, 0.42, -0.95)
          coupling.userData.part = 'coupling'
          unit.add(coupling)
        }
        this.scene.add(unit)
        gltfUnits.push(unit)
      }

      if (allLoaded && gltfUnits.length === wagons.length) {
        this.disposeOldWagons()
        this.wagonUnits = gltfUnits
        return
      }

      for (const u of gltfUnits) this.scene.remove(u)
    }

    this.buildProceduralWagonUnits(wagons)
  }

  private buildProceduralWagonUnits(wagons: { kind: string; color: string }[]): void {
    const darkMat = this.lambert('#1f2937')
    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 12)
    const wheelMat = this.lambert('#1f2937')
    const units: THREE.Group[] = []
    for (let i = 0; i < wagons.length; i++) {
      const w = wagons[i]!
      const unit = new THREE.Group()
      const mat = this.lambert(w.color)
      if (w.kind === 'tanker') {
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.4, 12), mat)
        tank.rotation.z = Math.PI / 2
        tank.position.set(0, 0.65, 0)
        unit.add(tank)
        // Ring pengikat tengah + manhole di atas tangki
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.035, 6, 16), darkMat)
        ring.rotation.y = Math.PI / 2
        ring.position.set(0, 0.65, 0)
        ring.userData.part = 'tanker-ring'
        const manhole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.09, 0.09, 0.09, 10),
          this.lambert('#64748b'),
        )
        manhole.position.set(0, 1.1, 0)
        manhole.userData.part = 'manhole'
        unit.add(ring, manhole)
      } else if (w.kind === 'flatbed') {
        const bed = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.25, 1.6), mat)
        bed.position.set(0, 0.5, 0)
        const cargo = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.9), this.lambert('#8a5a3b'))
        cargo.position.set(0, 0.78, 0)
        unit.add(bed, cargo)
        // Pasak di 4 sudut bak
        for (const [sx, sz] of [
          [-0.5, -0.7],
          [0.5, -0.7],
          [-0.5, 0.7],
          [0.5, 0.7],
        ] as [number, number][]) {
          const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 6), darkMat)
          stake.position.set(sx, 0.72, sz)
          stake.userData.part = 'stake'
          unit.add(stake)
        }
      } else {
        const box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 1.6), mat)
        box.position.set(0, 0.65, 0)
        unit.add(box)
        // Panel papan kayu bernomor unit di kedua sisi (canvas texture)
        const decalCanvas = document.createElement('canvas')
        decalCanvas.width = 128
        decalCanvas.height = 64
        const dctx = decalCanvas.getContext('2d')
        if (dctx) {
          dctx.fillStyle = w.color
          dctx.fillRect(0, 0, 128, 64)
          dctx.strokeStyle = 'rgba(0,0,0,0.25)'
          dctx.lineWidth = 2
          for (const py of [16, 32, 48]) {
            dctx.beginPath()
            dctx.moveTo(0, py)
            dctx.lineTo(128, py)
            dctx.stroke()
          }
          dctx.fillStyle = '#0f172a'
          dctx.font = 'bold 34px Nunito, sans-serif'
          dctx.textAlign = 'center'
          dctx.textBaseline = 'middle'
          dctx.fillText(String(i + 1), 64, 32)
        }
        const decalTex = new THREE.CanvasTexture(decalCanvas)
        const decalMat = new THREE.MeshLambertMaterial({
          map: decalTex,
          transparent: true,
          opacity: 0.85,
        })
        const decalGeo = new THREE.PlaneGeometry(1.4, 0.55)
        const decalR = new THREE.Mesh(decalGeo, decalMat)
        decalR.rotation.y = Math.PI / 2
        decalR.position.set(0.556, 0.65, 0)
        decalR.userData.part = 'wagon-decal'
        const decalL = new THREE.Mesh(decalGeo, decalMat)
        decalL.rotation.y = -Math.PI / 2
        decalL.position.set(-0.556, 0.65, 0)
        decalL.userData.part = 'wagon-decal'
        unit.add(decalR, decalL)
      }
      // Bogie: rangka sisi di luar roda gerbong (roda di z +0.4)
      for (const side of [-1, 1] as const) {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 1.35), darkMat)
        frame.position.set(0.72 * side, 0.28, 0.4)
        frame.userData.part = 'bogie'
        unit.add(frame)
      }
      const wheels: THREE.Mesh[] = []
      for (const side of [-1, 1] as const) {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat)
        wheel.rotation.z = Math.PI / 2
        wheel.position.set(0.6 * side, 0.28, 0.4)
        wheels.push(wheel)
        unit.add(wheel)
      }
      unit.userData.wheels = wheels
      // Coupling belakang hanya jika ada gerbong lagi di belakangnya
      if (i < wagons.length - 1) {
        const coupling = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.5), darkMat)
        coupling.position.set(0, 0.42, -0.95)
        coupling.userData.part = 'coupling'
        unit.add(coupling)
      }
      this.scene.add(unit)
      units.push(unit)
    }
    // Buang unit lama setelah yang baru terpasang
    this.disposeOldWagons()
    this.wagonUnits = units
  }

  private buildEnvironment(): void {
    const hemi = new THREE.HemisphereLight(0xbfe9ff, 0x9db98a, 0.95)
    this.scene.add(hemi)
    const dir = new THREE.DirectionalLight(0xffffff, 0.9)
    dir.position.set(5, 10, 6)
    this.scene.add(dir)

    this.groundMat = this.lambert('#a7d8a0')
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), this.groundMat)
    ground.rotation.x = -Math.PI / 2
    this.scene.add(ground)

    // Bukit ×2 (sphere pipih)
    const hillGeo = new THREE.SphereGeometry(4, 10, 8)
    this.hillMat = this.lambert('#8fce8f')
    const hillPositions: [number, number, number][] = [
      [-12, -1.2, -10],
      [12, -1.4, -12],
    ]
    for (const [x, y, z] of hillPositions) {
      const hill = new THREE.Mesh(hillGeo, this.hillMat)
      hill.position.set(x, y, z)
      hill.scale.y = 0.45
      this.scene.add(hill)
    }

    // Pohon (GLTF dengan fallback prosedural trunk + daun)
    this.scene.add(this.treeGroup)
    this.buildTrees()

    // Rumah ×2 (GLTF dengan fallback prosedural box + atap overhang + pintu + cerobong)
    this.scene.add(this.houseGroup)
    this.buildHouses()

    // Awan ×2 (klaster 3 sphere per awan)
    const cloudGeo = new THREE.SphereGeometry(1, 8, 6)
    const cloudMat = this.lambert('#ffffff')
    const cloudSpots: [number, number, number][] = [
      [-5, 8, -12],
      [6, 9, -10],
    ]
    const cloudPuffs: [number, number, number, number][] = [
      [-0.95, -0.05, 0.05, 0.85],
      [0.9, 0.05, -0.1, 0.6],
    ]
    for (const [x, y, z] of cloudSpots) {
      const cloud = new THREE.Group()
      cloud.position.set(x, y, z)
      const main = new THREE.Mesh(cloudGeo, cloudMat)
      main.scale.set(1.8, 0.7, 1)
      cloud.add(main)
      for (const [ox, oy, oz, s] of cloudPuffs) {
        const puff = new THREE.Mesh(cloudGeo, cloudMat)
        puff.position.set(ox, oy, oz)
        puff.scale.set(0.9 * s, 0.55 * s, 0.8 * s)
        cloud.add(puff)
      }
      this.clouds.push(cloud)
      this.scene.add(cloud)
    }

    // Stasiun: platform, kanopi, bangku, jam, bendera (GLTF dengan fallback prosedural) + papan nama
    this.scene.add(this.stationGroup)
    this.buildStation()

    // Penumpang ×2 menunggu di stasiun (GLTF dengan fallback prosedural capsule)
    this.scene.add(this.passengerGroup)
    this.buildPassengers()

    // Rambu sinyal junction (GLTF dengan fallback prosedural)
    this.scene.add(this.signalGroup)
    this.buildSignalPost()

    // Dekor tematik: bunga + kupu (K1)
    const petalColors = ['#f472b6', '#facc15']
    const flowerSpots: [number, number][] = [
      [4, 6],
      [-5, 8],
    ]
    for (let i = 0; i < 2; i++) {
      const [x, z] = flowerSpots[i]!
      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 8, 6),
        this.lambert(petalColors[i]!),
      )
      petal.position.set(x, 0.25, z)
      this.flowersGroup.add(petal)
    }
    const butterflySpots: [number, number, number][] = [
      [3, 2, 4],
      [-4, 2.2, 7],
    ]
    for (const [x, y, z] of butterflySpots) {
      // Grup kupu: tubuh + 2 sayap dengan hinge di badan (flap rotation.z)
      const butterfly = new THREE.Group()
      butterfly.position.set(x, y, z)
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.03, 0.1, 3, 6),
        this.lambert('#5b21b6'),
      )
      body.rotation.x = Math.PI / 2
      const wingMat = new THREE.MeshLambertMaterial({ color: '#c084fc', side: THREE.DoubleSide })
      const wingGeoR = new THREE.PlaneGeometry(0.17, 0.22)
      wingGeoR.rotateX(-Math.PI / 2)
      wingGeoR.translate(0.09, 0, 0)
      const wingGeoL = new THREE.PlaneGeometry(0.17, 0.22)
      wingGeoL.rotateX(-Math.PI / 2)
      wingGeoL.translate(-0.09, 0, 0)
      const wingR = new THREE.Mesh(wingGeoR, wingMat)
      const wingL = new THREE.Mesh(wingGeoL, wingMat)
      butterfly.add(body, wingR, wingL)
      butterfly.userData.wings = [wingR, wingL]
      this.butterflies.push(butterfly)
      this.butterflyBase.push([x, y, z])
      this.flowersGroup.add(butterfly)
    }
    this.scene.add(this.flowersGroup)

    // Dekor tematik: sapi (K2) — GLTF dengan fallback prosedural
    this.buildCow()
    this.scene.add(this.farmGroup)

    // Dekor tematik: lentera senja (K3)
    for (const x of [-4.4, 4.4]) {
      const mat = this.lambert('#fb923c')
      mat.emissive.set('#fb923c')
      mat.emissiveIntensity = 0.15
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), mat)
      lamp.position.set(x, 2.4, -16)
      this.lanternMats.push(mat)
      this.duskGroup.add(lamp)
    }
    this.scene.add(this.duskGroup)
  }

  private sleeperAt(curve: THREE.Curve<THREE.Vector3>, t: number): void {
    const pos = curve.getPointAt(t)
    const tan = curve.getTangentAt(t)
    const rotY = Math.atan2(tan.x, tan.z)

    if (this.useGltf) {
      const gltfSleeper = instantiateTrackModel('sleeper')
      if (gltfSleeper) {
        gltfSleeper.position.set(pos.x, 0.04, pos.z)
        gltfSleeper.rotation.y = rotY
        gltfSleeper.userData.part = 'gltf-sleeper'
        this.trackGroup.add(gltfSleeper)
        this.gltfSleepers.push(gltfSleeper)
        return
      }
    }

    const sleeper = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.28), this.lambert('#7c5a3a'))
    sleeper.position.set(pos.x, 0.06, pos.z)
    sleeper.rotation.y = rotY
    sleeper.userData.part = 'sleeper'
    this.trackGroup.add(sleeper)
    this.proceduralSleepers.push(sleeper)
  }

  private drawBoard(i: number, text: string): void {
    const canvas = this.boardCanvases[i]
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, 128, 64)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 128, 64)
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 8
    ctx.strokeRect(4, 4, 120, 56)
    ctx.fillStyle = '#0f172a'
    ctx.font = `bold ${text.length > 3 ? 32 : 40}px Nunito, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 64, 34)
  }

  private drawSign(label: string, sub?: string): void {
    const canvas = this.signCanvas
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, 256, 80)
    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(0, 0, 256, 80)
    ctx.fillStyle = '#0f172a'
    ctx.font = `bold ${label.length > 7 ? 36 : 44}px Nunito, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 128, 42)
    if (sub) {
      ctx.font = 'bold 28px Nunito, sans-serif'
      ctx.fillText(sub, 128, 68)
    }
  }

  private buildCow(): void {
    if (this.gltfCow) {
      this.farmGroup.remove(this.gltfCow)
      this.gltfCow = null
    }
    if (this.proceduralCowGroup) {
      this.farmGroup.remove(this.proceduralCowGroup)
      this.proceduralCowGroup.clear()
    } else {
      this.proceduralCowGroup = new THREE.Group()
    }

    const cowBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.7), this.lambert('#f8fafc'))
    cowBody.position.set(7, 0.55, -4)
    const cowHead = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), this.lambert('#8a5a3b'))
    cowHead.position.set(7.7, 0.75, -4)
    const hornGeo = new THREE.ConeGeometry(0.045, 0.16, 6)
    const hornMat = this.lambert('#e2e8f0')
    for (const side of [-1, 1] as const) {
      const horn = new THREE.Mesh(hornGeo, hornMat)
      horn.position.set(7.7, 1.02, -4 + 0.14 * side)
      horn.rotation.x = 0.5 * side
      this.proceduralCowGroup.add(horn)
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), this.lambert('#8a5a3b'))
      ear.scale.set(1, 0.6, 1)
      ear.position.set(7.62, 0.92, -4 + 0.24 * side)
      this.proceduralCowGroup.add(ear)
    }
    this.cowHead = cowHead
    this.proceduralCowGroup.add(cowBody, cowHead)
    this.farmGroup.add(this.proceduralCowGroup)

    if (this.useGltf) {
      const entity = instantiateAnimalModel('cow')
      if (entity) {
        this.gltfCow = entity.root
        this.gltfCow.position.set(7.2, 0, -4)
        this.gltfCow.rotation.y = -Math.PI / 2
        this.farmGroup.add(this.gltfCow)
        this.proceduralCowGroup.visible = false
        if (entity.mixer) {
          this.animalMixers.push(entity.mixer)
        }
      } else {
        this.proceduralCowGroup.visible = true
      }
    } else {
      this.proceduralCowGroup.visible = true
    }
  }

  private buildSheep(): void {
    for (const g of this.gltfSheep) {
      this.farmGroup.remove(g)
    }
    this.gltfSheep = []
    if (this.proceduralSheepGroup) {
      this.farmGroup.remove(this.proceduralSheepGroup)
      this.proceduralSheepGroup.clear()
    } else {
      this.proceduralSheepGroup = new THREE.Group()
    }

    const sheepSpots: [number, number, number][] = [
      [9, -14, -Math.PI / 2 + 0.2],
      [10.5, -15, -Math.PI / 2 - 0.3],
    ]

    for (const [x, z, rotY] of sheepSpots) {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), this.lambert('#f1f5f9'))
      body.position.set(x, 0.4, z)
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 5), this.lambert('#475569'))
      head.position.set(x + 0.35, 0.5, z)
      this.proceduralSheepGroup.add(body, head)

      if (this.useGltf) {
        const entity = instantiateAnimalModel('sheep')
        if (entity) {
          entity.root.position.set(x, 0, z)
          entity.root.rotation.y = rotY
          this.farmGroup.add(entity.root)
          this.gltfSheep.push(entity.root)
          if (entity.mixer) {
            this.animalMixers.push(entity.mixer)
          }
        }
      }
    }

    this.farmGroup.add(this.proceduralSheepGroup)
    if (this.useGltf && this.gltfSheep.length > 0) {
      this.proceduralSheepGroup.visible = false
    } else {
      this.proceduralSheepGroup.visible = true
    }
  }

  private refreshAnimalMeshes(): void {
    if (this.disposed) return
    for (const m of this.animalMixers) {
      m.stopAllAction()
    }
    this.animalMixers = []
    this.buildCow()
    this.buildSheep()
  }

  private buildHouses(): void {
    for (const h of this.gltfHouses) {
      this.houseGroup.remove(h)
    }
    this.gltfHouses = []

    if (!this.proceduralHouseGroup) {
      this.proceduralHouseGroup = new THREE.Group()
      const houseMat = this.lambert('#f5e6c8')
      const roofMat = this.lambert('#d95f5f')
      const doorMat = this.lambert('#8a5a3b')
      const chimneyMat = this.lambert('#94a3b8')
      const houseSpots: [number, number][] = [
        [-11, -2],
        [11, -3],
      ]
      for (const [x, z] of houseSpots) {
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 1.8), houseMat)
        body.position.set(x, 0.7, z)
        body.userData.part = 'house'
        const roof = new THREE.Mesh(new THREE.CylinderGeometry(0, 1.7, 1.1, 4), roofMat)
        roof.position.set(x, 1.95, z)
        roof.rotation.y = Math.PI / 4
        roof.userData.part = 'house'
        const door = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.06), doorMat)
        door.position.set(x + 0.5, 0.4, z + 0.93)
        door.userData.part = 'house'
        const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.55, 8), chimneyMat)
        chimney.position.set(x - 0.55, 2.2, z - 0.35)
        chimney.userData.part = 'house'
        this.proceduralHouseGroup.add(body, roof, door, chimney)
      }
      this.houseGroup.add(this.proceduralHouseGroup)
    }

    if (this.useGltf) {
      const house1 = instantiateBuildingModel('house')
      const house2 = instantiateBuildingModel('house')
      if (house1 && house2) {
        house1.position.set(-11, 0, -2)
        house1.rotation.y = Math.PI / 4
        house1.userData.part = 'gltf-house'

        house2.position.set(11, 0, -3)
        house2.rotation.y = -Math.PI / 4
        house2.userData.part = 'gltf-house'

        this.houseGroup.add(house1, house2)
        this.gltfHouses.push(house1, house2)
        this.proceduralHouseGroup.visible = false
      } else {
        this.proceduralHouseGroup.visible = true
      }
    } else {
      this.proceduralHouseGroup.visible = true
    }
  }

  private buildBarn(): void {
    if (this.gltfBarn) {
      this.barnGroup.remove(this.gltfBarn)
      this.gltfBarn = null
    }

    if (!this.proceduralBarnGroup) {
      this.proceduralBarnGroup = new THREE.Group()
      const barnBody = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 1.2), this.lambert('#b45309'))
      barnBody.position.set(-12, 0.5, -16)
      barnBody.userData.part = 'barn'
      const barnRoof = new THREE.Mesh(
        new THREE.CylinderGeometry(0, 0.9, 0.6, 4),
        this.lambert('#7f1d1d'),
      )
      barnRoof.position.set(-12, 1.3, -16)
      barnRoof.rotation.y = Math.PI / 4
      barnRoof.userData.part = 'barn'
      this.proceduralBarnGroup.add(barnBody, barnRoof)
      this.barnGroup.add(this.proceduralBarnGroup)
    }

    if (this.useGltf) {
      const barn = instantiateBuildingModel('barn')
      if (barn) {
        barn.position.set(-12, 0, -16)
        barn.rotation.y = Math.PI / 4
        barn.userData.part = 'gltf-barn'
        this.barnGroup.add(barn)
        this.gltfBarn = barn
        this.proceduralBarnGroup.visible = false
      } else {
        this.proceduralBarnGroup.visible = true
      }
    } else {
      this.proceduralBarnGroup.visible = true
    }
  }

  private refreshBuildingMeshes(): void {
    if (this.disposed) return
    this.buildHouses()
    this.buildBarn()
  }

  private buildTrees(): void {
    for (const t of this.gltfTrees) {
      this.treeGroup.remove(t)
    }
    this.gltfTrees = []
    this.leaves = []

    const treeSpots: [number, number, number][] = [
      [-8, 4, 0],
      [8, 2, Math.PI * 0.5],
      [-9, -8, Math.PI * 1.2],
      [9, -6, -Math.PI * 0.4],
    ]

    const pineSpots: [number, number, number][] = [
      [-13, 2, 0.2],
      [13, 0, 1.4],
      [-12, -6, 2.5],
      [12, -8, 0.8],
      [-11, 10, 1.9],
      [11, 12, 3.1],
    ]

    const roundSpots: [number, number, number][] = [
      [-6, 12, 0.4],
      [6, 14, 1.8],
      [-14, -12, 2.6],
      [14, -14, 0.9],
    ]

    if (!this.proceduralTreeGroup) {
      this.proceduralTreeGroup = new THREE.Group()
      const trunkGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.8, 7)
      const leafGeo = new THREE.ConeGeometry(0.7, 1.4, 7)
      const trunkMat = this.lambert('#8a5a3b')
      const leafMat = this.lambert('#3e9e4f')

      for (const [x, z] of treeSpots) {
        const trunk = new THREE.Mesh(trunkGeo, trunkMat)
        trunk.position.set(x, 0.4, z)
        trunk.userData.part = 'tree-trunk'
        const leaf = new THREE.Mesh(leafGeo, leafMat)
        leaf.position.set(x, 1.4, z)
        leaf.userData.part = 'tree-leaf'
        this.proceduralLeaves.push(leaf)
        this.proceduralTreeGroup.add(trunk, leaf)
      }

      this.treeGroup.add(this.proceduralTreeGroup)
    }

    if (this.useGltf) {
      const gltfTreeEntities = treeSpots.map(() => instantiateTreeModel('tree_default'))
      const allDefaultLoaded = gltfTreeEntities.every((t) => t !== null)

      if (allDefaultLoaded) {
        for (let i = 0; i < treeSpots.length; i++) {
          const entity = gltfTreeEntities[i]!
          const [x, z, rotY] = treeSpots[i]!
          entity.root.position.set(x, 0, z)
          entity.root.rotation.y = rotY
          entity.root.userData.part = 'gltf-tree'
          if (entity.leafMesh) {
            this.leaves.push(entity.leafMesh)
          }
          this.treeGroup.add(entity.root)
          this.gltfTrees.push(entity.root)
        }

        for (let i = 0; i < pineSpots.length; i++) {
          const entity = instantiateTreeModel('tree_pine')
          if (entity) {
            const [x, z, rotY] = pineSpots[i]!
            entity.root.position.set(x, 0, z)
            entity.root.rotation.y = rotY
            entity.root.userData.part = 'gltf-pine'
            this.treeGroup.add(entity.root)
            this.gltfTrees.push(entity.root)
          }
        }

        for (let i = 0; i < roundSpots.length; i++) {
          const entity = instantiateTreeModel('tree_oak')
          if (entity) {
            const [x, z, rotY] = roundSpots[i]!
            entity.root.position.set(x, 0, z)
            entity.root.rotation.y = rotY
            entity.root.userData.part = 'gltf-oak'
            this.treeGroup.add(entity.root)
            this.gltfTrees.push(entity.root)
          }
        }

        this.proceduralTreeGroup.visible = false
        this.instancedTreeGroup.visible = false
      } else {
        this.proceduralTreeGroup.visible = true
        this.instancedTreeGroup.visible = true
        this.leaves = [...this.proceduralLeaves]
      }
    } else {
      this.proceduralTreeGroup.visible = true
      this.instancedTreeGroup.visible = true
      this.leaves = [...this.proceduralLeaves]
    }
  }

  private refreshTreeMeshes(): void {
    if (this.disposed) return
    this.buildTrees()
  }

  private buildStation(): void {
    if (this.proceduralStationGroup) {
      this.stationGroup.remove(this.proceduralStationGroup)
      this.proceduralStationGroup.clear()
    }
    this.proceduralStationGroup = new THREE.Group()

    // 1. Platform peron semen prosedural
    const plat = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 4), this.lambert('#cbd5e1'))
    plat.position.set(0, 0.2, -16)
    plat.userData.part = 'station-platform'
    this.proceduralStationGroup.add(plat)

    // 2. Kanopi stasiun: 4 tiang + atap
    const postMat = this.lambert('#94a3b8')
    const canopyRoof = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.12, 2.0),
      this.lambert('#d95f5f'),
    )
    canopyRoof.position.set(0, 2.05, -17)
    canopyRoof.userData.part = 'station-canopy'
    this.proceduralStationGroup.add(canopyRoof)

    for (const [px, pz] of [
      [-1.7, -16.2],
      [1.7, -16.2],
      [-1.7, -17.8],
      [1.7, -17.8],
    ] as [number, number][]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8), postMat)
      post.position.set(px, 1.2, pz)
      post.userData.part = 'station-canopy'
      this.proceduralStationGroup.add(post)
    }

    // 3. Bangku ×2
    const benchMat = this.lambert('#8a5a3b')
    for (const bx of [-2.6, 2.6]) {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.35), benchMat)
      seat.position.set(bx, 0.55, -16.6)
      seat.userData.part = 'station-bench'
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.07), benchMat)
      back.position.set(bx, 0.75, -16.8)
      back.userData.part = 'station-bench'
      this.proceduralStationGroup.add(seat, back)
    }

    // 4. Jam stasiun
    const clockDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.26, 0.05, 16),
      this.lambert('#ffffff'),
    )
    clockDisc.rotation.x = Math.PI / 2
    clockDisc.position.set(1.15, 1.85, -15.86)
    clockDisc.userData.part = 'station-clock'
    const handMat = this.lambert('#0f172a')
    const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.14, 0.02), handMat)
    hourHand.position.set(1.15, 1.87, -15.82)
    hourHand.rotation.z = -Math.PI / 5
    hourHand.userData.part = 'station-clock'
    const minuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.2, 0.02), handMat)
    minuteHand.position.set(1.15, 1.9, -15.81)
    minuteHand.rotation.z = Math.PI / 3
    minuteHand.userData.part = 'station-clock'
    this.proceduralStationGroup.add(clockDisc, hourHand, minuteHand)

    // 5. Tiang bendera + kain
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8),
      this.lambert('#94a3b8'),
    )
    pole.position.set(-4.4, 1.3, -16)
    pole.userData.part = 'station-flag'
    const clothMat = new THREE.MeshLambertMaterial({ color: '#ef4444', side: THREE.DoubleSide })
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.55), clothMat)
    cloth.position.set(-3.9, 2.1, -16)
    cloth.userData.part = 'station-flag'
    this.flag = cloth
    this.proceduralStationGroup.add(pole, cloth)

    this.stationGroup.add(this.proceduralStationGroup)

    // 6. Papan nama stasiun bertekstur
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 80
      const tex = new THREE.CanvasTexture(canvas)
      const mat = new THREE.MeshLambertMaterial({ map: tex })
      const sign = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1, 0.2), mat)
      sign.position.set(0, 1.8, -16)
      sign.userData.part = 'station-sign'
      this.signCanvas = canvas
      this.signTexture = tex
      this.drawSign('STASIUN')
      this.stationGroup.add(sign)
    } else {
      const sign = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1, 0.2), this.lambert('#fbbf24'))
      sign.position.set(0, 1.8, -16)
      sign.userData.part = 'station-sign'
      this.stationGroup.add(sign)
    }

    this.refreshStationMeshes()
  }

  private buildSignalPost(): void {
    this.proceduralSignalGroup = new THREE.Group()

    const signalPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8),
      this.lambert('#94a3b8'),
    )
    signalPole.position.set(2.5, 1.2, -4)
    signalPole.userData.part = 'signal-post'
    this.proceduralSignalGroup.add(signalPole)

    const signalGeo = new THREE.SphereGeometry(0.16, 8, 6)
    for (let i = 0; i < 3; i++) {
      const mat = this.lambert('#475569')
      mat.emissive.set('#000000')
      mat.emissiveIntensity = 0
      const lamp = new THREE.Mesh(signalGeo, mat)
      lamp.position.set(2.5, 2.5 - i * 0.45, -4)
      lamp.userData.part = 'signal-lamp'
      this.signalMats.push(mat)
      this.proceduralSignalGroup.add(lamp)
    }

    this.signalGroup.add(this.proceduralSignalGroup)
    this.refreshSignalMeshes()
  }

  private refreshSignalMeshes(): void {
    if (this.disposed) return

    if (this.gltfSignalEntity) {
      this.signalGroup.remove(this.gltfSignalEntity.root)
      this.gltfSignalEntity = null
    }

    if (this.useGltf) {
      const gltfSignal = instantiateSignalPost()
      if (gltfSignal) {
        gltfSignal.root.position.set(2.5, 0, -4)
        gltfSignal.root.userData.part = 'gltf-signal-post'
        this.gltfSignalEntity = gltfSignal
        this.signalGroup.add(gltfSignal.root)

        if (this.proceduralSignalGroup) {
          this.proceduralSignalGroup.visible = false
        }
        return
      }
    }

    if (this.proceduralSignalGroup) {
      this.proceduralSignalGroup.visible = true
    }
  }

  private refreshStationMeshes(): void {
    if (this.disposed) return

    if (this.gltfStationGroup) {
      this.stationGroup.remove(this.gltfStationGroup)
      this.gltfStationGroup = null
      this.gltfFlagCloth = null
    }

    if (this.useGltf) {
      const platform = instantiateStationModel('platform')
      const canopy = instantiateStationModel('canopy')
      const benchL = instantiateStationModel('bench')
      const benchR = instantiateStationModel('bench')
      const clock = instantiateStationModel('clock')
      const flag = instantiateStationModel('flag')

      if (platform && canopy && benchL && benchR && clock && flag) {
        this.gltfStationGroup = new THREE.Group()

        platform.position.set(0, 0, -16)
        platform.userData.part = 'gltf-station-platform'

        canopy.position.set(0, 0.38, -17)
        canopy.userData.part = 'gltf-station-canopy'

        benchL.position.set(-2.6, 0.38, -16.7)
        benchL.rotation.y = Math.PI
        benchL.userData.part = 'gltf-station-bench'

        benchR.position.set(2.6, 0.38, -16.7)
        benchR.rotation.y = Math.PI
        benchR.userData.part = 'gltf-station-bench'

        clock.position.set(1.15, 1.85, -15.86)
        clock.userData.part = 'gltf-station-clock'

        flag.position.set(-4.4, 0.38, -16)
        flag.userData.part = 'gltf-station-flag'
        const flagCloth = flag.getObjectByName('flag_cloth')
        if (flagCloth) {
          this.gltfFlagCloth = flagCloth
        }

        this.gltfStationGroup.add(platform, canopy, benchL, benchR, clock, flag)
        this.stationGroup.add(this.gltfStationGroup)

        if (this.proceduralStationGroup) {
          this.proceduralStationGroup.visible = false
        }
        return
      }
    }

    if (this.proceduralStationGroup) {
      this.proceduralStationGroup.visible = true
    }
  }

  private createParallelCurves(
    centerCurve: THREE.Curve<THREE.Vector3>,
    offset: number,
    samples = 32,
  ): [THREE.Curve<THREE.Vector3>, THREE.Curve<THREE.Vector3>] {
    const leftPoints: THREE.Vector3[] = []
    const rightPoints: THREE.Vector3[] = []

    for (let i = 0; i <= samples; i++) {
      const t = i / samples
      const p = centerCurve.getPointAt(t)
      const tan = centerCurve.getTangentAt(t)
      // Normal horizontal tegak lurus terhadap arah tangen di bidang XZ
      const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize()

      leftPoints.push(new THREE.Vector3(p.x - norm.x * offset, p.y + 0.04, p.z - norm.z * offset))
      rightPoints.push(new THREE.Vector3(p.x + norm.x * offset, p.y + 0.04, p.z + norm.z * offset))
    }

    const leftCurve = new THREE.CatmullRomCurve3(leftPoints)
    const rightCurve = new THREE.CatmullRomCurve3(rightPoints)
    return [leftCurve, rightCurve]
  }

  private buildTracks(): void {
    this.scene.add(this.trackGroup)
    const railMatSteel = this.lambert('#94a3b8')
    const railMatMain = this.lambert('#8a8f98')

    const mainTube = new THREE.Mesh(
      new THREE.TubeGeometry(this.mainCurve, 32, 0.06, 6),
      railMatMain,
    )
    this.trackGroup.add(mainTube)

    // Dual parallel rails untuk kurva utama
    const [mainLeft, mainRight] = this.createParallelCurves(this.mainCurve, 0.36)
    const leftMainMesh = new THREE.Mesh(
      new THREE.TubeGeometry(mainLeft, 32, 0.035, 6),
      railMatSteel,
    )
    const rightMainMesh = new THREE.Mesh(
      new THREE.TubeGeometry(mainRight, 32, 0.035, 6),
      railMatSteel,
    )
    leftMainMesh.userData.part = 'dual-rail'
    rightMainMesh.userData.part = 'dual-rail'
    this.trackGroup.add(leftMainMesh, rightMainMesh)

    for (const branch of this.branchCurves) {
      const m = this.lambert('#8a8f98')
      this.branchMats.push(m)
      const tube = new THREE.Mesh(new THREE.TubeGeometry(branch, 32, 0.06, 6), m)
      this.trackGroup.add(tube)

      // Dual parallel rails untuk kurva cabang
      const [bLeft, bRight] = this.createParallelCurves(branch, 0.36)
      const bLeftMesh = new THREE.Mesh(new THREE.TubeGeometry(bLeft, 32, 0.035, 6), railMatSteel)
      const bRightMesh = new THREE.Mesh(new THREE.TubeGeometry(bRight, 32, 0.035, 6), railMatSteel)
      bLeftMesh.userData.part = 'dual-rail'
      bRightMesh.userData.part = 'dual-rail'
      this.trackGroup.add(bLeftMesh, bRightMesh)
    }
    // Bantalan: main 8, tiap cabang 5 → total 23
    for (let i = 0; i < 8; i++) {
      this.sleeperAt(this.mainCurve, (i + 0.5) / 8)
    }
    for (const branch of this.branchCurves) {
      for (let i = 0; i < 5; i++) {
        this.sleeperAt(branch, (i + 0.5) / 5)
      }
    }
    this.buildBranchSigns()
    this.refreshTrackMeshes()
  }

  private buildBranchSigns(): void {
    // Papan jawaban 3D ×3 (cermin DOM saja, bukan antarmuka) — diletakkan di
    // atas kurva cabangnya masing-masing (t=0.85) agar menempel rel melengkung
    for (let i = 0; i < 3; i++) {
      let mat: THREE.MeshLambertMaterial
      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas')
        canvas.width = 128
        canvas.height = 64
        const tex = new THREE.CanvasTexture(canvas)
        this.boardCanvases.push(canvas)
        this.boardTextures.push(tex)
        mat = new THREE.MeshLambertMaterial({ map: tex })
        this.drawBoard(this.boardCanvases.length - 1, '?')
      } else {
        mat = this.lambert('#ffffff')
      }
      const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.15), mat)
      const p = this.branchCurves[i]!.getPointAt(0.85)
      board.position.set(p.x, 1.6, p.z)
      board.userData.part = 'branch-board'
      this.proceduralBranchBoards.push(board)
      this.trackGroup.add(board)
    }
  }

  private refreshTrackMeshes(): void {
    if (this.disposed) return
    for (const s of this.gltfSleepers) {
      this.trackGroup.remove(s)
    }
    this.gltfSleepers = []

    for (const b of this.gltfBranchSigns) {
      this.trackGroup.remove(b.root)
    }
    this.gltfBranchSigns = []

    if (this.useGltf) {
      for (let i = 0; i < 8; i++) {
        const pos = this.mainCurve.getPointAt((i + 0.5) / 8)
        const tan = this.mainCurve.getTangentAt((i + 0.5) / 8)
        const gltfSleeper = instantiateTrackModel('sleeper')
        if (gltfSleeper) {
          gltfSleeper.position.set(pos.x, 0.04, pos.z)
          gltfSleeper.rotation.y = Math.atan2(tan.x, tan.z)
          gltfSleeper.userData.part = 'gltf-sleeper'
          this.trackGroup.add(gltfSleeper)
          this.gltfSleepers.push(gltfSleeper)
        }
      }
      for (const branch of this.branchCurves) {
        for (let i = 0; i < 5; i++) {
          const pos = branch.getPointAt((i + 0.5) / 5)
          const tan = branch.getTangentAt((i + 0.5) / 5)
          const gltfSleeper = instantiateTrackModel('sleeper')
          if (gltfSleeper) {
            gltfSleeper.position.set(pos.x, 0.04, pos.z)
            gltfSleeper.rotation.y = Math.atan2(tan.x, tan.z)
            gltfSleeper.userData.part = 'gltf-sleeper'
            this.trackGroup.add(gltfSleeper)
            this.gltfSleepers.push(gltfSleeper)
          }
        }
      }
      for (const s of this.proceduralSleepers) {
        s.visible = this.gltfSleepers.length === 0
      }

      for (let i = 0; i < 3; i++) {
        const gltfSign = instantiateBranchSign()
        if (gltfSign) {
          const p = this.branchCurves[i]!.getPointAt(0.85)
          gltfSign.root.position.set(p.x, 0, p.z)
          gltfSign.root.userData.part = 'gltf-branch-sign'
          if (this.boardTextures[i]) {
            gltfSign.displayMesh.material = new THREE.MeshLambertMaterial({
              map: this.boardTextures[i],
            })
          }
          this.trackGroup.add(gltfSign.root)
          this.gltfBranchSigns.push(gltfSign)
        }
      }
      for (const b of this.proceduralBranchBoards) {
        b.visible = this.gltfBranchSigns.length === 0
      }
    } else {
      for (const s of this.proceduralSleepers) {
        s.visible = true
      }
      for (const b of this.proceduralBranchBoards) {
        b.visible = true
      }
    }
  }

  private buildTrain(): void {
    // Kereta default = variant classic; detail (dome, jendela, cowcatcher, rod)
    // dibangun lewat makeLocoParts agar identik dengan hasil ganti variant.
    const loco = this.makeLocoParts('classic', '#e05555')
    this.trainGroup.add(...loco)
    this.locoParts.push(...loco)

    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 12)
    const wheelMat = this.lambert('#1f2937')
    const wheelPositions: [number, number, number][] = [
      [-0.65, 0.28, 1.0],
      [0.65, 0.28, 1.0],
      [-0.65, 0.28, -0.4],
      [0.65, 0.28, -0.4],
    ]
    for (const [x, y, z] of wheelPositions) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(x, y, z)
      if (this.useGltf) {
        wheel.visible = false
      } else {
        this.wheels.push(wheel)
      }
      this.proceduralWheels.push(wheel)
      this.trainGroup.add(wheel)
    }

    // Gerbong: unit pivot terpisah (anak scene, bukan trainGroup) agar tiap
    // gerbong mengikuti rel dengan orientasi sendiri — terlihat articulated
    // saat belok, bukan satu blok kaku
    this.buildWagonUnits([{ kind: 'boxcar', color: '#f5b942' }])
    // Coupling depan: loko ↔ gerbong pertama (anak loko)
    const coupling = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.7), this.lambert('#1f2937'))
    coupling.position.set(0, 0.42, -0.9)
    coupling.userData.part = 'coupling'
    this.trainGroup.add(coupling)

    // Lampu depan
    const headlight = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 1.2, 10),
      new THREE.MeshBasicMaterial({ color: '#fef08a', transparent: true, opacity: 0.55 }),
    )
    headlight.position.set(0, 0.9, 1.9)
    headlight.rotation.x = -Math.PI / 2
    this.trainGroup.add(headlight)

    // Masinis Asya (GLTF dengan fallback prosedural torso, kepala, topi, lengan)
    this.trainGroup.add(this.driverGroup)
    this.buildDriver()
    this.scene.add(this.trainGroup)
  }

  private buildDriver(): void {
    if (this.gltfDriver) {
      this.driverGroup.remove(this.gltfDriver.root)
      this.gltfDriver = null
    }

    if (!this.proceduralDriverGroup) {
      this.proceduralDriverGroup = new THREE.Group()
      const skinMat = this.lambert('#ffd9b3')
      const torso = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.15, 0.22, 4, 8),
        this.lambert('#2563eb'),
      )
      torso.position.set(0, 1.6, -0.3)
      torso.userData.part = 'driver-torso'
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), skinMat)
      head.position.set(0, 1.95, -0.3)
      this.driverHead = head
      const hat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.18, 10),
        this.lambert('#2563eb'),
      )
      hat.position.set(0, 2.2, -0.3)
      const brim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.44, 0.44, 0.04, 12),
        this.lambert('#1d4ed8'),
      )
      brim.position.set(0, 2.12, -0.3)
      brim.userData.part = 'driver-brim'
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.6), this.lambert('#e05555'))
      arm.position.set(0.55, 1.8, -0.3)
      arm.userData.part = 'driver-arm'
      this.driverArm = arm
      const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.6), this.lambert('#e05555'))
      arm2.position.set(-0.55, 1.8, -0.3)
      arm2.userData.part = 'driver-arm'
      const eyeGeo = new THREE.SphereGeometry(0.035, 6, 5)
      const eyeMat = this.lambert('#0f172a')
      for (const side of [-1, 1] as const) {
        const eye = new THREE.Mesh(eyeGeo, eyeMat)
        eye.position.set(0.09 * side, 2.0, -0.05)
        eye.userData.part = 'driver-eye'
        head.add(eye)
      }
      this.proceduralDriverGroup.add(torso, head, hat, brim, arm, arm2)
      this.driverGroup.add(this.proceduralDriverGroup)
    }

    if (this.useGltf) {
      const driverEntity = instantiateCharacterModel('driver')
      if (driverEntity) {
        driverEntity.root.position.set(0, 1.35, -0.3)
        driverEntity.root.rotation.y = 0
        driverEntity.root.userData.part = 'gltf-driver'
        this.driverGroup.add(driverEntity.root)
        this.gltfDriver = driverEntity
        if (driverEntity.mixer) {
          this.characterMixers.push(driverEntity.mixer)
        }
        this.proceduralDriverGroup.visible = false
      } else {
        this.proceduralDriverGroup.visible = true
      }
    } else {
      this.proceduralDriverGroup.visible = true
    }
  }

  private buildPassengers(): void {
    for (const p of this.gltfPassengers) {
      this.passengerGroup.remove(p.root)
    }
    this.gltfPassengers = []

    const passengerPositions: [number, number, number][] = [
      [-1.5, 0.4, -15],
      [-0.5, 0.4, -15],
    ]

    if (!this.proceduralPassengerGroup) {
      this.proceduralPassengerGroup = new THREE.Group()
      const passengerColors = ['#38bdf8', '#fb7185']
      const passengerX = [-1.5, -0.5]
      const eyeGeo = new THREE.SphereGeometry(0.035, 6, 5)
      const eyeMat = this.lambert('#0f172a')

      for (let i = 0; i < 2; i++) {
        const p = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.25, 0.6, 4, 8),
          this.lambert(passengerColors[i]!),
        )
        p.position.set(passengerX[i]!, 0.8, -15)
        p.userData.part = 'passenger-capsule'
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), this.lambert('#ffd9b3'))
        head.position.set(0, 0.68, 0)
        head.userData.part = 'passenger-head'
        for (const side of [-1, 1] as const) {
          const eye = new THREE.Mesh(eyeGeo, eyeMat)
          eye.position.set(0.06 * side, 0.03, 0.15)
          eye.userData.part = 'passenger-eye'
          head.add(eye)
        }
        p.add(head)
        this.passengers.push(p)
        this.proceduralPassengerGroup.add(p)
      }

      this.passengerGroup.add(this.proceduralPassengerGroup)
    }

    if (this.useGltf) {
      const p1 = instantiateCharacterModel('passenger')
      const p2 = instantiateCharacterModel('passenger')
      if (p1 && p2) {
        const entities = [p1, p2]
        for (let i = 0; i < 2; i++) {
          const entity = entities[i]!
          const [x, y, z] = passengerPositions[i]!
          entity.root.position.set(x, y, z)
          entity.root.rotation.y = 0
          entity.root.userData.part = 'gltf-passenger'
          this.passengerGroup.add(entity.root)
          this.gltfPassengers.push(entity)
          if (entity.mixer) {
            this.characterMixers.push(entity.mixer)
          }
        }
        this.proceduralPassengerGroup.visible = false
      } else {
        this.proceduralPassengerGroup.visible = true
      }
    } else {
      this.proceduralPassengerGroup.visible = true
    }
  }

  private refreshCharacterMeshes(): void {
    if (this.disposed) return
    this.buildDriver()
    this.buildPassengers()
  }

  private buildSmoke(): void {
    if (typeof document === 'undefined') return
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30)
    grad.addColorStop(0, 'rgba(255,255,255,0.9)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)
    this.smokeTex = new THREE.CanvasTexture(canvas)
    for (let i = 0; i < 3; i++) {
      const mat = new THREE.SpriteMaterial({
        map: this.smokeTex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
      const sprite = new THREE.Sprite(mat)
      sprite.scale.setScalar(0.4 + i * 0.3)
      this.smokes.push(sprite)
      this.scene.add(sprite)
    }
  }

  private addInstanced(
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    transforms: { pos: [number, number, number]; rotY?: number; scale?: number }[],
    parent: THREE.Group = this.detailGroup,
  ): THREE.InstancedMesh {
    const mesh = new THREE.InstancedMesh(geo, mat, transforms.length)
    const dummy = new THREE.Object3D()
    for (let i = 0; i < transforms.length; i++) {
      const tr = transforms[i]!
      dummy.position.set(tr.pos[0], tr.pos[1], tr.pos[2])
      dummy.rotation.set(0, tr.rotY ?? 0, 0)
      dummy.scale.setScalar(tr.scale ?? 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    parent.add(mesh)
    return mesh
  }

  private buildInstancedDetail(): void {
    this.detailGroup.add(this.instancedTreeGroup)
    const tint = new THREE.Color()
    // Pohon pinus ×6 (daun 2 lapis bertumpuk + batang), warna sedikit bervariasi
    const pineSpots: [number, number][] = [
      [-13, 2],
      [13, 0],
      [-12, -6],
      [12, -8],
      [-11, 10],
      [11, 12],
    ]
    const pineLower = this.addInstanced(
      new THREE.ConeGeometry(0.7, 1.6, 6),
      this.lambert('#2f8f4a'),
      pineSpots.map(([x, z]) => ({ pos: [x, 1.3, z] as [number, number, number] })),
      this.instancedTreeGroup,
    )
    this.addInstanced(
      new THREE.ConeGeometry(0.48, 1.1, 6),
      this.lambert('#2f8f4a'),
      pineSpots.map(([x, z]) => ({ pos: [x, 2.05, z] as [number, number, number] })),
      this.instancedTreeGroup,
    )
    this.addInstanced(
      new THREE.CylinderGeometry(0.1, 0.14, 0.5, 6),
      this.lambert('#8a5a3b'),
      pineSpots.map(([x, z]) => ({ pos: [x, 0.25, z] as [number, number, number] })),
      this.instancedTreeGroup,
    )
    for (let i = 0; i < pineSpots.length; i++) {
      pineLower.setColorAt(i, tint.set('#2f8f4a').offsetHSL(0, 0, (i % 3) * 0.05 - 0.05))
    }
    if (pineLower.instanceColor) pineLower.instanceColor.needsUpdate = true
    // Pohon bulat ×4 (kanopi 2 sphere + batang), warna sedikit bervariasi
    const roundSpots: [number, number][] = [
      [-6, 12],
      [6, 14],
      [-14, -12],
      [14, -14],
    ]
    const canopy = this.addInstanced(
      new THREE.SphereGeometry(0.75, 8, 6),
      this.lambert('#4caf50'),
      roundSpots.map(([x, z]) => ({ pos: [x, 1.35, z] as [number, number, number] })),
      this.instancedTreeGroup,
    )
    this.addInstanced(
      new THREE.SphereGeometry(0.5, 8, 6),
      this.lambert('#4caf50'),
      roundSpots.map(([x, z], i) => ({
        pos: [x + (i % 2 === 0 ? 0.35 : -0.35), 1.8, z + 0.15] as [number, number, number],
      })),
      this.instancedTreeGroup,
    )
    this.addInstanced(
      new THREE.CylinderGeometry(0.1, 0.14, 0.6, 6),
      this.lambert('#8a5a3b'),
      roundSpots.map(([x, z]) => ({ pos: [x, 0.3, z] as [number, number, number] })),
      this.instancedTreeGroup,
    )
    for (let i = 0; i < roundSpots.length; i++) {
      canopy.setColorAt(i, tint.set('#4caf50').offsetHSL(0.01, 0, (i % 3) * 0.045 - 0.045))
    }
    if (canopy.instanceColor) canopy.instanceColor.needsUpdate = true
    // Apel merah ×12 (3 per pohon bulat) di permukaan kanopi
    const appleSpots: [number, number, number][] = []
    for (const [x, z] of roundSpots) {
      appleSpots.push(
        [x + 0.55, 1.65, z + 0.2],
        [x - 0.45, 1.5, z + 0.35],
        [x + 0.1, 1.95, z - 0.3],
      )
    }
    this.addInstanced(
      new THREE.SphereGeometry(0.07, 6, 5),
      this.lambert('#dc2626'),
      appleSpots.map(([x, y, z]) => ({ pos: [x, y, z] as [number, number, number] })),
    )
    // Batu ×6
    const rockSpots: [number, number, number][] = [
      [-7, 0.2, 2],
      [7, 0.2, 6],
      [-5, 0.2, -10],
      [8, 0.2, -12],
      [-10, 0.2, 14],
      [10, 0.2, 16],
    ]
    this.addInstanced(
      new THREE.DodecahedronGeometry(0.3, 0),
      this.lambert('#94a3b8'),
      rockSpots.map(([x, y, z], i) => ({
        pos: [x, y, z] as [number, number, number],
        rotY: i * 0.7,
        scale: 0.7 + (i % 3) * 0.3,
      })),
    )
    // Pagar rel ×8 (tiang) + rel horizontal pengikat ×4 (2 sisi × 2 tinggi)
    const fence: { pos: [number, number, number] }[] = []
    for (let i = 0; i < 8; i++) {
      const z = 2 + i * 1.8
      fence.push({ pos: [-2.2, 0.25, z] })
      fence.push({ pos: [2.2, 0.25, z] })
    }
    this.addInstanced(new THREE.BoxGeometry(0.12, 0.5, 0.12), this.lambert('#a16207'), fence)
    const fenceRails: { pos: [number, number, number] }[] = []
    for (const side of [-2.2, 2.2] as const) {
      for (const y of [0.42, 0.22]) {
        fenceRails.push({ pos: [side, y, 8.3] })
      }
    }
    this.addInstanced(new THREE.BoxGeometry(0.06, 0.05, 12.8), this.lambert('#a16207'), fenceRails)
    // Semak ×4
    const bushSpots: [number, number][] = [
      [-4, -2],
      [4, -4],
      [-6, 8],
      [6, 10],
    ]
    this.addInstanced(
      new THREE.SphereGeometry(0.4, 6, 4),
      this.lambert('#5a9e4f'),
      bushSpots.map(([x, z]) => ({ pos: [x, 0.3, z] as [number, number, number] })),
    )
    // Burung ×3 (orbit dianimasikan di update)
    this.birds = this.addInstanced(new THREE.ConeGeometry(0.18, 0.4, 4), this.lambert('#334155'), [
      { pos: [-4, 6, -6], rotY: 0 },
      { pos: [0, 6.5, -8], rotY: 0 },
      { pos: [4, 6.2, -5], rotY: 0 },
    ])
    this.scene.add(this.detailGroup)

    // Dekor tematik tambahan
    // K1: rumpun bunga instanced
    const flowerRng: [number, number][] = [
      [5, 3],
      [-6, 5],
      [3, 9],
      [-7, 11],
      [6, 13],
      [-4, 14],
    ]
    this.addInstanced(
      new THREE.SphereGeometry(0.14, 6, 5),
      this.lambert('#f472b6'),
      flowerRng.map(([x, z]) => ({ pos: [x, 0.2, z] as [number, number, number] })),
    )
    // K2: petak padi + lumbung + domba
    const padiRows: { pos: [number, number, number] }[] = []
    for (let i = 0; i < 12; i++) {
      const x = -9 + (i % 4) * 1.4
      const z = -18 + Math.floor(i / 4) * 1.4
      padiRows.push({ pos: [x, 0.15, z] })
    }
    this.addInstanced(new THREE.BoxGeometry(0.9, 0.25, 0.9), this.lambert('#c2d94f'), padiRows)
    // Lumbung (K2) — GLTF dengan fallback prosedural
    this.farmGroup.add(this.barnGroup)
    this.buildBarn()
    // Domba (K2) — GLTF dengan fallback prosedural
    this.buildSheep()
    // K3: kunang-kunang (sprite) + jendela menyala
    if (typeof document !== 'undefined') {
      const fireflyGeo = new THREE.SphereGeometry(0.08, 5, 4)
      const fireflyMat = this.lambert('#fde68a')
      fireflyMat.emissive.set('#fde68a')
      fireflyMat.emissiveIntensity = 1.2
      this.fireflyMats.push(fireflyMat)
      const fireflies: { pos: [number, number, number] }[] = []
      for (let i = 0; i < 6; i++) {
        const x = -8 + i * 3.2
        const z = -10 - (i % 3) * 2
        fireflies.push({ pos: [x, 1.2 + (i % 2) * 0.6, z] })
      }
      this.addInstanced(fireflyGeo, fireflyMat, fireflies)
    }
    const windowMat = this.lambert('#fde68a')
    windowMat.emissive.set('#fde68a')
    windowMat.emissiveIntensity = 0.9
    for (const [hx, hz] of [
      [-11, -2],
      [11, -3],
    ] as [number, number][]) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), windowMat)
      win.position.set(hx, 0.9, hz + 0.95)
      this.duskGroup.add(win)
    }
  }

  private updateSmoke(): void {
    if (this.smokes.length === 0) return
    if (this.locoShape !== 'classic' || this.rm) {
      for (const s of this.smokes) {
        ;(s.material as THREE.SpriteMaterial).opacity = 0
      }
      return
    }
    this.trainGroup.updateMatrixWorld()
    const chimney = new THREE.Vector3(0, 1.7, 1.1)
    this.trainGroup.localToWorld(chimney)
    // Chuff: 2 ledakan uap per putaran roda, tersinkron laju roda. 3 sprite
    // bergilir fase sehingga selalu ada puff yang naik dan memudar.
    const rate = this.rm ? 4 : 8
    for (let i = 0; i < this.smokes.length; i++) {
      const s = this.smokes[i]!
      const phase = ((this.elapsed * rate) / Math.PI + i / this.smokes.length) % 1
      s.position.set(chimney.x, chimney.y + phase * 1.3, chimney.z)
      s.scale.setScalar(0.35 + phase * 0.95)
      ;(s.material as THREE.SpriteMaterial).opacity = 0.55 * (1 - phase)
    }
  }

  private updateCamera(dt: number): void {
    const trainPos = this.trainGroup.position
    const dir = this.lastDir
    if (this.maneuverActive) {
      // Bingkai tetap saat ancang-ancang: gerakan mundur-maju terlihat jelas
      // dari sudut pandang stabil sebelum kamera follow mengambil alih.
      this.camPos.set(0, 5.5, 7.5)
      this.camLook.set(0, 0.6, -0.5)
    } else if (this.camMode === 'follow') {
      this.camPos.set(trainPos.x - dir.x * 6, trainPos.y + 4, trainPos.z - dir.z * 6)
      this.camLook.set(trainPos.x + dir.x * 3, trainPos.y + 1, trainPos.z + dir.z * 3)
    } else if (this.camMode === 'junction') {
      this.camPos.set(0, 6, 6)
      this.camLook.set(0, 0, -6)
    } else if (this.camMode === 'station') {
      this.camPos.set(0, 5, -8)
      this.camLook.set(0, 1, -16)
    } else {
      this.camPos.set(0, 7, 10)
      this.camLook.set(0, 0, -4)
    }
    // Auto-return yaw saat kereta bergerak (opsi B)
    if (!this.dragging && this.yawOffset !== 0) {
      const moving = this.maneuverActive || this.t > 0
      if (moving) {
        this.yawOffset *= Math.max(0, 1 - dt * 2)
        if (Math.abs(this.yawOffset) < 0.001) this.yawOffset = 0
      }
    }
    // Terapkan yaw offset (orbit di sekitar titik pandang)
    if (this.yawOffset !== 0) {
      const pivot = this.camLook
      const dx = this.camPos.x - pivot.x
      const dz = this.camPos.z - pivot.z
      const cos = Math.cos(this.yawOffset)
      const sin = Math.sin(this.yawOffset)
      this.camPos.set(pivot.x + dx * cos - dz * sin, this.camPos.y, pivot.z + dx * sin + dz * cos)
    }
    if (this.rm) {
      this.camera.position.copy(this.camPos)
      this.camSmooth.copy(this.camLook)
      this.camera.lookAt(this.camSmooth)
    } else {
      const k = 1 - Math.exp(-3 * dt)
      this.camera.position.lerp(this.camPos, k)
      this.camSmooth.lerp(this.camLook, k)
      this.camera.lookAt(this.camSmooth)
    }
  }

  private onPointerDown = (e: PointerEvent): void => {
    this.dragging = true
    this.dragLastX = e.clientX
    try {
      this.canvasEl?.setPointerCapture?.(e.pointerId)
    } catch {
      // abaikan
    }
  }

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.dragging) return
    const dx = e.clientX - this.dragLastX
    this.dragLastX = e.clientX
    const next = this.yawOffset + dx * 0.005
    const limit = Math.PI / 3
    this.yawOffset = Math.min(limit, Math.max(-limit, next))
  }

  private onPointerUp = (): void => {
    this.dragging = false
  }

  /**
   * Tempatkan satu unit kereta pada jarak tempuh s sepanjang rute gabungan
   * (jalur utama lalu cabang terpilih). Mengembalikan tangent di posisi itu.
   * s < 0 diekstrapolasi lurus ke belakang titik awal (posisi kereta saat start).
   */
  private placeUnitOnJourney(s: number, obj: THREE.Object3D): THREE.Vector3 {
    const main = this.mainCurve
    const branch = this.branchCurves[this.selected]
    const lMain = main.getLength()
    const lBranch = branch.getLength()
    const pos = new THREE.Vector3()
    const tan = new THREE.Vector3()
    if (s >= lMain) {
      const u = Math.min(1, (s - lMain) / lBranch)
      pos.copy(branch.getPointAt(u))
      tan.copy(branch.getTangentAt(u))
    } else if (s >= 0) {
      pos.copy(main.getPointAt(s / lMain))
      tan.copy(main.getTangentAt(s / lMain))
    } else {
      pos.copy(main.getPointAt(0))
      tan.copy(main.getTangentAt(0))
      pos.sub(tan.clone().multiplyScalar(-s))
    }
    obj.position.set(pos.x, pos.y + 0.1, pos.z)
    obj.lookAt(pos.x + tan.x, pos.y + 0.1, pos.z + tan.z)
    return tan
  }

  /**
   * Tempatkan loko + semua unit gerbong pada jarak masing-masing. Gerbong
   * tertinggal di belakang loko dengan jarak tetap dan mengikuti rel dengan
   * orientasi sendiri — belokan terlihat articulated, bukan satu blok kaku.
   */
  private placeAllUnits(locoS: number): void {
    const tan = this.placeUnitOnJourney(locoS, this.trainGroup)
    this.lastDir.copy(tan)
    // Lean kecil hanya di awal cabang. Wajib rotateZ, bukan tulis Euler:
    // heading kereta selalu yaw>90° (model depan +Z, jalur −Z), Euler-nya
    // tersimpan di cabang x=−π, dan penulisan rotation.z akan merekomposisi
    // quaternion menjadi terjungkir (bodi terkubur di tanah).
    const lean =
      this.phase === 'branch' && this.t < 0.3 ? (this.selected - 1) * 0.08 * (1 - this.t / 0.3) : 0
    // Sway halus per unit dengan fase independen (dilewati saat reduced-motion)
    const sway = this.rm ? 0 : Math.sin(this.elapsed * 6) * 0.008
    this.trainGroup.rotateZ(lean + sway)
    // Flex coupling: jarak antar unit berdenyut tipis mengikuti waktu
    const flex = this.rm ? 1 : 1 + 0.02 * Math.sin(this.elapsed * 2.5)
    let back = 2.0
    for (let i = 0; i < this.wagonUnits.length; i++) {
      const unit = this.wagonUnits[i]!
      this.placeUnitOnJourney(locoS - back * flex, unit)
      const unitSway = this.rm ? 0 : Math.sin(this.elapsed * 6 + (i + 1) * 2.1) * 0.014
      unit.rotateZ(lean + unitSway)
      back += 1.9
    }
  }
}
