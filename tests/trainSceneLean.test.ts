import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'

// TrainScene membuat WebGLRenderer di konstruktor; jsdom tidak punya WebGL.
// Stub renderer saja, sisanya three asli agar math lookAt/quaternion tetap nyata.
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

import { TrainScene } from '../src/components/train/TrainScene'

// Regresi: tulis Euler (rotation.z) pada heading yaw>90° merekomposisi quaternion
// lewat cabang x=-pi dan menjungkirkan kereta sehingga bodi terkubur di tanah.
// Lean kini wajib lewat rotateZ (post-multiply quaternion).

function pumpBranchAndTrackHeadY(scene: TrainScene, frames: number): number {
  // Pilih kepala masinis: sphere dengan radius terbesar di trainGroup
  // (trainGroup kini juga berisi dome 0.16 dan mata 0.035)
  const spheres = scene.trainGroup.children.filter(
    (o) => (o as THREE.Mesh).geometry?.type === 'SphereGeometry',
  ) as THREE.Mesh[]
  spheres.sort(
    (a, b) =>
      (b.geometry as THREE.SphereGeometry).parameters.radius -
      (a.geometry as THREE.SphereGeometry).parameters.radius,
  )
  const head = spheres[0]
  expect(head).toBeDefined()
  const world = new THREE.Vector3()
  let minHeadY = Number.POSITIVE_INFINITY
  for (let i = 0; i < frames; i++) {
    scene.update(1 / 60)
    head!.getWorldPosition(world)
    minHeadY = Math.min(minHeadY, world.y)
  }
  return minHeadY
}

describe('TrainScene lean belok — kereta tetap tegak (regresi bodi hilang)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([0, 1, 2] as const)('cabang %i: kepala masinis tidak pernah di bawah tanah', (branch) => {
    const canvas = document.createElement('canvas')
    const scene = new TrainScene(canvas)
    scene.setReducedMotion(false)
    scene.setBranch(branch)

    // 600 frame @60fps: maneuver 600ms + perjalanan cabang penuh (t: 0 -> 1)
    const minHeadY = pumpBranchAndTrackHeadY(scene, 600)

    expect(scene.trainT).toBe(1)
    expect(minHeadY).toBeGreaterThan(0)
    scene.dispose()
  })
})
