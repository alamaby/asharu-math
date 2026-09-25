/**
 * Scene kereta low-poly — Three.js murni (tanpa fiber).
 * Budget mesh ≤78: env 19 + rel 30 (4 tube + 23 bantalan + 3 papan) + kereta 11
 * (loko 3 + roda 4 + gerbong 1 + roda gerbong 2 + lampu 1) + asap 3 sprite
 * + fase2 15 (driver 3 + tiang 1 + kain 1 + penumpang 2 + bunga 2 + kupu 2 + sapi 2 + lentera 2).
 * Total 78. Geometri bawaan saja; tanpa shadow, fisika, post-processing, shader.
 * Teks WebGL bukan antarmuka — jawaban hanya di DOM (papan 3D cermin saja).
 */
import * as THREE from 'three'
import type { TrainGrade } from '../../lib/trainQuestionGenerator'

export type BranchIndex = 0 | 1 | 2

export interface TrainSceneCallbacks {
  onReachJunction?: () => void
  onReachStation?: () => void
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

const BRANCH_MIDS: [number, number][] = [
  [-3, -7],
  [0, -7],
  [3, -7],
]

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
  private cb: TrainSceneCallbacks
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
  private wheels: THREE.Mesh[] = []
  private smokes: THREE.Sprite[] = []
  private smokeTex: THREE.CanvasTexture | null = null
  private smokeAges: number[] = []
  private clouds: THREE.Mesh[] = []
  private leaves: THREE.Mesh[] = []
  private branchMats: THREE.MeshLambertMaterial[] = []
  private boardCanvases: HTMLCanvasElement[] = []
  private boardTextures: THREE.CanvasTexture[] = []
  private driverArm: THREE.Mesh | null = null
  private waveT = 99
  private passengers: THREE.Mesh[] = []
  private hopT = 99
  private flag: THREE.Mesh | null = null
  private butterflies: THREE.Mesh[] = []
  private butterflyBase: [number, number, number][] = []
  private flowersGroup = new THREE.Group()
  private farmGroup = new THREE.Group()
  private duskGroup = new THREE.Group()
  private lanternMats: THREE.MeshLambertMaterial[] = []
  private groundMat: THREE.MeshLambertMaterial | null = null
  private hillMat: THREE.MeshLambertMaterial | null = null
  private signCanvas: HTMLCanvasElement | null = null
  private signTexture: THREE.CanvasTexture | null = null
  private camMode: TrainCameraMode = 'fixed'
  private camPos = new THREE.Vector3(0, 7, 10)
  private camLook = new THREE.Vector3(0, 0, -4)
  private camSmooth = new THREE.Vector3(0, 0, -4)

  constructor(canvas: HTMLCanvasElement, cb: TrainSceneCallbacks = {}) {
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
        new THREE.Vector3(BRANCH_MIDS[0]![0], 0, BRANCH_MIDS[0]![1]),
        new THREE.Vector3(BRANCH_ENDS[0]![0], 0, BRANCH_ENDS[0]![1]),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(BRANCH_MIDS[1]![0], 0, BRANCH_MIDS[1]![1]),
        new THREE.Vector3(BRANCH_ENDS[1]![0], 0, BRANCH_ENDS[1]![1]),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(BRANCH_MIDS[2]![0], 0, BRANCH_MIDS[2]![1]),
        new THREE.Vector3(BRANCH_ENDS[2]![0], 0, BRANCH_ENDS[2]![1]),
      ]),
    ]

    this.buildEnvironment()
    this.buildTracks()
    this.buildTrain()
    this.buildSmoke()
    this.placeTrainOnCurve(this.mainCurve, 0)
    this.applyTheme(1, 'STASIUN')
  }

  get trainT(): number {
    return this.t
  }

  get selectedBranch(): BranchIndex {
    return this.selected
  }

  setBranch(i: BranchIndex): void {
    this.selected = i
    this.phase = 'branch'
    this.t = 0
    this.stationFired = false
  }

  reset(): void {
    this.phase = 'main'
    this.t = 0
    this.junctionFired = false
    this.stationFired = false
    this.placeTrainOnCurve(this.mainCurve, 0)
    this.setSelectedGlow(null)
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
    const step = dtc * this.speed
    if (this.phase === 'main') {
      this.t = Math.min(1, this.t + step)
      this.placeTrainOnCurve(this.mainCurve, this.t)
      if (this.t >= 1 && !this.junctionFired) {
        this.junctionFired = true
        this.cb.onReachJunction?.()
      }
    } else {
      this.t = Math.min(1, this.t + step)
      this.placeTrainOnCurve(this.branchCurves[this.selected], this.t)
      if (this.t >= 1 && !this.stationFired) {
        this.stationFired = true
        this.cb.onReachStation?.()
      }
    }
    if (!this.rm) {
      this.trainGroup.position.y += Math.sin(this.elapsed * 10) * 0.02
    }
    const spin = dtc * (this.rm ? 4 : 8)
    for (const w of this.wheels) w.rotation.x += spin
    this.updateSmoke(dtc)
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
      for (const p of this.passengers) {
        p.position.y = 0.8 + Math.abs(Math.sin(this.elapsed * 10)) * 0.18
      }
      this.hopT += dtc
    } else {
      for (const p of this.passengers) {
        if (p.position.y !== 0.8) p.position.y = 0.8
      }
    }
    if (this.flag && !this.rm) {
      this.flag.rotation.y = Math.sin(this.elapsed * 3) * 0.35
    }
    if (!this.rm) {
      for (let i = 0; i < this.butterflies.length; i++) {
        const b = this.butterflies[i]!
        const base = this.butterflyBase[i]!
        b.position.x = base[0] + Math.sin(this.elapsed + i) * 0.8
        b.position.y = base[1] + Math.sin(this.elapsed * 2 + i) * 0.3
        b.rotation.y = Math.sin(this.elapsed * 8 + i) * 0.6
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

    // Pohon ×4 (trunk + daun), geometry/material dipakai ulang dalam instance
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.8, 7)
    const leafGeo = new THREE.ConeGeometry(0.7, 1.4, 7)
    const trunkMat = this.lambert('#8a5a3b')
    const leafMat = this.lambert('#3e9e4f')
    const treeSpots: [number, number][] = [
      [-8, 4],
      [8, 2],
      [-9, -8],
      [9, -6],
    ]
    for (const [x, z] of treeSpots) {
      const trunk = new THREE.Mesh(trunkGeo, trunkMat)
      trunk.position.set(x, 0.4, z)
      const leaf = new THREE.Mesh(leafGeo, leafMat)
      leaf.position.set(x, 1.4, z)
      this.leaves.push(leaf)
      this.scene.add(trunk, leaf)
    }

    // Rumah ×2 (box + atap)
    const houseMat = this.lambert('#f5e6c8')
    const roofMat = this.lambert('#d95f5f')
    const houseSpots: [number, number][] = [
      [-11, -2],
      [11, -3],
    ]
    for (const [x, z] of houseSpots) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 1.8), houseMat)
      body.position.set(x, 0.7, z)
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(0, 1.6, 1.1, 4), roofMat)
      roof.position.set(x, 1.95, z)
      roof.rotation.y = Math.PI / 4
      this.scene.add(body, roof)
    }

    // Awan ×2 (satu mesh pipih tiap awan agar hemat)
    const cloudGeo = new THREE.SphereGeometry(1, 8, 6)
    const cloudMat = this.lambert('#ffffff')
    const cloudSpots: [number, number, number][] = [
      [-5, 8, -12],
      [6, 9, -10],
    ]
    for (const [x, y, z] of cloudSpots) {
      const cloud = new THREE.Mesh(cloudGeo, cloudMat)
      cloud.position.set(x, y, z)
      cloud.scale.set(1.8, 0.7, 1)
      this.clouds.push(cloud)
      this.scene.add(cloud)
    }

    // Stasiun: platform + papan nama bertekstur
    const plat = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 4), this.lambert('#cbd5e1'))
    plat.position.set(0, 0.2, -16)
    this.scene.add(plat)
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 80
      const tex = new THREE.CanvasTexture(canvas)
      const mat = new THREE.MeshLambertMaterial({ map: tex })
      const sign = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1, 0.2), mat)
      sign.position.set(0, 1.8, -16)
      this.signCanvas = canvas
      this.signTexture = tex
      this.drawSign('STASIUN')
      this.scene.add(sign)
    } else {
      const sign = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1, 0.2), this.lambert('#fbbf24'))
      sign.position.set(0, 1.8, -16)
      this.scene.add(sign)
    }

    // Tiang bendera + kain
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8),
      this.lambert('#94a3b8'),
    )
    pole.position.set(-4.4, 1.3, -16)
    const clothMat = new THREE.MeshLambertMaterial({ color: '#ef4444', side: THREE.DoubleSide })
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.55), clothMat)
    cloth.position.set(-3.9, 2.1, -16)
    this.flag = cloth
    this.scene.add(pole, cloth)

    // Penumpang ×2 menunggu di stasiun
    const passengerColors = ['#38bdf8', '#fb7185']
    const passengerX = [-1.5, -0.5]
    for (let i = 0; i < 2; i++) {
      const p = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.25, 0.6, 4, 8),
        this.lambert(passengerColors[i]!),
      )
      p.position.set(passengerX[i]!, 0.8, -15)
      this.passengers.push(p)
      this.scene.add(p)
    }

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
      const wing = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, 0.2),
        new THREE.MeshLambertMaterial({ color: '#c084fc', side: THREE.DoubleSide }),
      )
      wing.position.set(x, y, z)
      this.butterflies.push(wing)
      this.butterflyBase.push([x, y, z])
      this.flowersGroup.add(wing)
    }
    this.scene.add(this.flowersGroup)

    // Dekor tematik: sapi (K2)
    const cowBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.7), this.lambert('#f8fafc'))
    cowBody.position.set(7, 0.55, -4)
    const cowHead = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), this.lambert('#8a5a3b'))
    cowHead.position.set(7.7, 0.75, -4)
    this.farmGroup.add(cowBody, cowHead)
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
    const sleeper = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.28), this.lambert('#7c5a3a'))
    sleeper.position.set(pos.x, 0.06, pos.z)
    sleeper.rotation.y = Math.atan2(tan.x, tan.z)
    this.scene.add(sleeper)
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

  private drawSign(label: string): void {
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
  }

  private buildTracks(): void {
    const railMatMain = this.lambert('#8a8f98')
    const mainTube = new THREE.Mesh(
      new THREE.TubeGeometry(this.mainCurve, 32, 0.07, 6),
      railMatMain,
    )
    this.scene.add(mainTube)
    for (const branch of this.branchCurves) {
      const m = this.lambert('#8a8f98')
      this.branchMats.push(m)
      const tube = new THREE.Mesh(new THREE.TubeGeometry(branch, 32, 0.07, 6), m)
      this.scene.add(tube)
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
    // Papan jawaban 3D ×3 (cermin DOM saja, bukan antarmuka)
    for (const [ex] of BRANCH_ENDS) {
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
      board.position.set(ex, 1.6, -12)
      this.scene.add(board)
    }
  }

  private buildTrain(): void {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 2.0), this.lambert('#e05555'))
    body.position.set(0, 0.7, 0.4)
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.8), this.lambert('#3b82f6'))
    cabin.position.set(0, 1.4, -0.3)
    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.2, 0.6, 10),
      this.lambert('#1f2937'),
    )
    chimney.position.set(0, 1.35, 1.1)
    this.trainGroup.add(body, cabin, chimney)

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
      this.wheels.push(wheel)
      this.trainGroup.add(wheel)
    }

    // Gerbong ×1
    const wagon = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 1.6), this.lambert('#f5b942'))
    wagon.position.set(0, 0.65, -2.0)
    this.trainGroup.add(wagon)
    const wagonWheels: [number, number, number][] = [
      [-0.6, 0.28, -1.6],
      [0.6, 0.28, -1.6],
    ]
    for (const [x, y, z] of wagonWheels) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(x, y, z)
      this.wheels.push(wheel)
      this.trainGroup.add(wheel)
    }

    // Lampu depan
    const headlight = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 1.2, 10),
      new THREE.MeshBasicMaterial({ color: '#fef08a', transparent: true, opacity: 0.55 }),
    )
    headlight.position.set(0, 0.9, 1.9)
    headlight.rotation.x = -Math.PI / 2
    this.trainGroup.add(headlight)

    // Masinis Asya
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), this.lambert('#ffd9b3'))
    head.position.set(0, 1.95, -0.3)
    const hat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.18, 10),
      this.lambert('#2563eb'),
    )
    hat.position.set(0, 2.2, -0.3)
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.6), this.lambert('#e05555'))
    arm.position.set(0.55, 1.8, -0.3)
    this.driverArm = arm
    this.trainGroup.add(head, hat, arm)
    this.scene.add(this.trainGroup)
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
    this.smokeAges = [0, 0.7, 1.4]
    for (const age of this.smokeAges) {
      const mat = new THREE.SpriteMaterial({
        map: this.smokeTex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
      const sprite = new THREE.Sprite(mat)
      sprite.scale.setScalar(0.4 + age * 0.8)
      this.smokes.push(sprite)
      this.scene.add(sprite)
    }
  }

  private updateSmoke(dt: number): void {
    if (this.smokes.length === 0) return
    if (this.rm) {
      for (const s of this.smokes) {
        ;(s.material as THREE.SpriteMaterial).opacity = 0
      }
      return
    }
    this.trainGroup.updateMatrixWorld()
    const chimney = new THREE.Vector3(0, 1.7, 1.1)
    this.trainGroup.localToWorld(chimney)
    for (let i = 0; i < this.smokes.length; i++) {
      this.smokeAges[i] = (this.smokeAges[i]! + dt) % 2
      const age = this.smokeAges[i]!
      const s = this.smokes[i]!
      s.position.set(chimney.x, chimney.y + age * 1.2, chimney.z)
      s.scale.setScalar(0.4 + age * 0.8)
      ;(s.material as THREE.SpriteMaterial).opacity = 0.5 * (1 - age / 2)
    }
  }

  private updateCamera(dt: number): void {
    const trainPos = this.trainGroup.position
    const dir = this.lastDir
    if (this.camMode === 'follow') {
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

  private placeTrainOnCurve(curve: THREE.Curve<THREE.Vector3>, t: number): void {
    const pos = curve.getPointAt(Math.min(1, Math.max(0, t)))
    const tan = curve.getTangentAt(Math.min(1, Math.max(0, t)))
    this.lastDir.copy(tan)
    this.trainGroup.position.set(pos.x, pos.y + 0.1, pos.z)
    const ahead = new THREE.Vector3(pos.x + tan.x, pos.y + 0.1, pos.z + tan.z)
    this.trainGroup.lookAt(ahead)
  }
}
