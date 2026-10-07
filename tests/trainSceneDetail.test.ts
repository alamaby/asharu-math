import { describe, expect, it, vi } from 'vitest'
import type * as THREE from 'three'

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

function makeScene(): TrainScene {
  return new TrainScene(document.createElement('canvas'))
}

function countPart(scene: TrainScene, part: string): number {
  let n = 0
  // Gerbong kini unit terpisah (anak scene) — traverse dari scene, bukan trainGroup
  const root = scene.trainGroup.parent ?? scene.trainGroup
  root!.traverse((o) => {
    if (o.userData?.part === part) n += 1
  })
  return n
}

describe('detail visual kereta (fase 1-2)', () => {
  it('variant classic: rod ×2, cowcatcher, dome, jendela kabin, coupling ×1, smokebox+whistle+handrail+bogie', () => {
    const scene = makeScene()
    scene.applyTrainVariant({
      loco: 'classic',
      locoColor: '#e05555',
      wagons: [{ kind: 'boxcar', color: '#f5b942' }],
    })
    expect(countPart(scene, 'rod')).toBe(2)
    expect(countPart(scene, 'cowcatcher')).toBe(1)
    expect(countPart(scene, 'dome')).toBe(1)
    expect(countPart(scene, 'cabin-window')).toBe(1)
    expect(countPart(scene, 'coupling')).toBe(1)
    expect(countPart(scene, 'smokebox')).toBe(1)
    expect(countPart(scene, 'whistle')).toBe(1)
    expect(countPart(scene, 'handrail')).toBe(2)
    // bogie: 2 di loko + 2 di gerbong
    expect(countPart(scene, 'bogie')).toBe(4)
    // panel papan kayu bernomor di kedua sisi boxcar
    expect(countPart(scene, 'wagon-decal')).toBe(2)
    scene.dispose()
  })

  it('dua gerbong: coupling ×2; diesel: tanpa rod/dome/smokebox; tanker ring+manhole; flatbed pasak', () => {
    const scene = makeScene()
    scene.applyTrainVariant({
      loco: 'diesel',
      locoColor: '#3f9e5a',
      wagons: [
        { kind: 'tanker', color: '#e2e8f0' },
        { kind: 'flatbed', color: '#a3e635' },
      ],
    })
    expect(countPart(scene, 'coupling')).toBe(2)
    expect(countPart(scene, 'rod')).toBe(0)
    expect(countPart(scene, 'dome')).toBe(0)
    expect(countPart(scene, 'smokebox')).toBe(0)
    expect(countPart(scene, 'tanker-ring')).toBe(1)
    expect(countPart(scene, 'manhole')).toBe(1)
    expect(countPart(scene, 'stake')).toBe(4)
    // bogie: 2 di loko + 2 per gerbong = 6
    expect(countPart(scene, 'bogie')).toBe(6)
    scene.dispose()
  })

  it('masinis: torso, brim, 2 mata, 2 lengan', () => {
    const scene = makeScene()
    expect(countPart(scene, 'driver-torso')).toBe(1)
    expect(countPart(scene, 'driver-brim')).toBe(1)
    expect(countPart(scene, 'driver-eye')).toBe(2)
    expect(countPart(scene, 'driver-arm')).toBe(2)
    scene.dispose()
  })

  it('batang roda beranimasi mengikuti putaran roda', () => {
    const scene = makeScene()
    scene.setReducedMotion(false)
    scene.setBranch(1)
    const rod = scene.trainGroup.children.find((o) => o.userData?.part === 'rod') as THREE.Mesh
    const ys = new Set<number>()
    for (let i = 0; i < 40; i++) {
      scene.update(1 / 60)
      ys.add(+rod.position.y.toFixed(3))
    }
    expect(ys.size).toBeGreaterThan(2)
    scene.dispose()
  })
})
