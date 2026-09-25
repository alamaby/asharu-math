import { useEffect, useMemo, useRef } from 'react'
import { TrainScene } from './TrainScene'
import type { BranchIndex, TrainCameraMode } from './TrainScene'
import type { TrainGrade } from '../../lib/trainQuestionGenerator'
import TrainFallback2D from './TrainFallback2D'

export interface TrainCanvasProps {
  paused: boolean
  reducedMotion: boolean
  onReachJunction: () => void
  onReachStation: () => void
  sceneRef: React.MutableRefObject<TrainScene | null>
  onReady?: (scene: TrainScene) => void
  themeGrade: TrainGrade | null
  cameraMode: TrainCameraMode
  boardAnswers: [string, string, string] | null
  stationLabel: string
}

export function hasTrainWebGL(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export type { BranchIndex }

export default function TrainCanvas({
  paused,
  reducedMotion,
  onReachJunction,
  onReachStation,
  sceneRef,
  onReady,
  themeGrade,
  cameraMode,
  boardAnswers,
  stationLabel,
}: TrainCanvasProps) {
  const webGL = useMemo(() => hasTrainWebGL(), [])
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const pausedRef = useRef(paused)
  const cbRef = useRef({ onReachJunction, onReachStation, onReady })

  useEffect(() => {
    cbRef.current = { onReachJunction, onReachStation, onReady }
  })

  useEffect(() => {
    pausedRef.current = paused
    sceneRef.current?.setPaused(paused)
  }, [paused, sceneRef])

  useEffect(() => {
    sceneRef.current?.setReducedMotion(reducedMotion)
  }, [reducedMotion, sceneRef])

  useEffect(() => {
    if (sceneRef.current && themeGrade !== null) {
      sceneRef.current.applyTheme(themeGrade, stationLabel)
    }
  }, [themeGrade, stationLabel, sceneRef])

  useEffect(() => {
    sceneRef.current?.setCameraMode(cameraMode)
  }, [cameraMode, sceneRef])

  useEffect(() => {
    if (sceneRef.current && boardAnswers) {
      sceneRef.current.setAnswers(boardAnswers)
    }
  }, [boardAnswers, sceneRef])

  useEffect(() => {
    if (!webGL) return
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    let scene: TrainScene
    try {
      scene = new TrainScene(canvas, {
        onReachJunction: () => cbRef.current.onReachJunction(),
        onReachStation: () => cbRef.current.onReachStation(),
      })
    } catch {
      return
    }
    sceneRef.current = scene
    scene.setPaused(pausedRef.current)
    if (themeGrade !== null) scene.applyTheme(themeGrade, stationLabel)
    scene.setCameraMode(cameraMode)
    if (boardAnswers) scene.setAnswers(boardAnswers)
    cbRef.current.onReady?.(scene)
    const captured = scene

    const doResize = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (w > 0 && h > 0) captured.resize(w, h)
    }
    doResize()

    let ro: ResizeObserver | null = null
    const onWindowResize = () => doResize()
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => doResize())
      ro.observe(wrap)
    } else {
      window.addEventListener('resize', onWindowResize)
    }
    const onVis = () => {
      captured.setPaused(document.hidden || pausedRef.current)
    }
    document.addEventListener('visibilitychange', onVis)
    const onContextLost = (e: Event) => e.preventDefault()
    canvas.addEventListener('webglcontextlost', onContextLost)

    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      captured.update(dt)
      captured.render()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
      window.removeEventListener('resize', onWindowResize)
      document.removeEventListener('visibilitychange', onVis)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      captured.dispose()
      if (sceneRef.current === captured) sceneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webGL])

  if (!webGL) {
    return (
      <TrainFallback2D
        paused={paused}
        onReachJunction={onReachJunction}
        onReachStation={onReachStation}
      />
    )
  }

  return (
    <div
      ref={wrapRef}
      className="overflow-hidden rounded-3xl border-2 border-amber-200 bg-sky-50 shadow-sm"
      style={{ height: 'min(58vw, 320px)', minHeight: 220 }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
