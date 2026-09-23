/**
 * Scene kereta low-poly — Three.js murni (tanpa fiber).
 * Budget mesh ≈59: env 19 + rel 30 (4 tube + 23 bantalan + 3 papan) + kereta 10.
 * Geometri bawaan saja; tanpa shadow, fisika, post-processing, shader.
 * Teks WebGL bukan antarmuka — jawaban hanya di DOM.
 */
import * as THREE from 'three'

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
  private junctionFired = false
  private stationFired = false
  private selected: BranchIndex = 1
  private disposed = false

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
    this.placeTrainOnCurve(this.mainCurve, 0)
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
  }

  setPaused(p: boolean): void {
    this.paused = p
  }

  setReducedMotion(r: boolean): void {
    this.speed = r ? 0.35 : 0.12
  }

  update(dt: number): void {
    if (this.disposed || this.paused) return
    if (!Number.isFinite(dt) || dt <= 0) return
    const step = Math.min(dt, 0.05) * this.speed
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
      }
    })
    for (const g of geos) g.dispose()
    for (const m of mats) m.dispose()
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

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), this.lambert('#a7d8a0'))
    ground.rotation.x = -Math.PI / 2
    this.scene.add(ground)

    // Bukit ×2 (sphere pipih)
    const hillGeo = new THREE.SphereGeometry(4, 10, 8)
    const hillMat = this.lambert('#8fce8f')
    const hillPositions: [number, number, number][] = [
      [-12, -1.2, -10],
      [12, -1.4, -12],
    ]
    for (const [x, y, z] of hillPositions) {
      const hill = new THREE.Mesh(hillGeo, hillMat)
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
      this.scene.add(cloud)
    }

    // Stasiun: platform + papan (2 mesh)
    const plat = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 4), this.lambert('#cbd5e1'))
    plat.position.set(0, 0.2, -16)
    const sign = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1, 0.2), this.lambert('#fbbf24'))
    sign.position.set(0, 1.8, -16)
    this.scene.add(plat, sign)
  }

  private sleeperAt(curve: THREE.Curve<THREE.Vector3>, t: number): void {
    const pos = curve.getPointAt(t)
    const tan = curve.getTangentAt(t)
    const sleeper = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.28), this.lambert('#7c5a3a'))
    sleeper.position.set(pos.x, 0.06, pos.z)
    sleeper.rotation.y = Math.atan2(tan.x, tan.z)
    this.scene.add(sleeper)
  }

  private buildTracks(): void {
    const railMat = this.lambert('#8a8f98')
    const curves: THREE.Curve<THREE.Vector3>[] = [this.mainCurve, ...this.branchCurves]
    for (const curve of curves) {
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.07, 6), railMat)
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
    // Papan jawaban 3D ×3 (cermin DOM, tanpa teks)
    const boardMat = this.lambert('#ffffff')
    for (const [ex] of BRANCH_ENDS) {
      const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.15), boardMat)
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
      this.trainGroup.add(wheel)
    }
    this.scene.add(this.trainGroup)
  }

  private placeTrainOnCurve(curve: THREE.Curve<THREE.Vector3>, t: number): void {
    const pos = curve.getPointAt(Math.min(1, Math.max(0, t)))
    const tan = curve.getTangentAt(Math.min(1, Math.max(0, t)))
    this.trainGroup.position.set(pos.x, pos.y + 0.1, pos.z)
    const ahead = new THREE.Vector3(pos.x + tan.x, pos.y + 0.1, pos.z + tan.z)
    this.trainGroup.lookAt(ahead)
  }
}
