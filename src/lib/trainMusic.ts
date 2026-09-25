/**
 * Musik + bunyi chug kereta — WebAudio prosedural, tanpa file audio.
 * Preferensi (musicEnabled) disimpan di call site, bukan di modul ini.
 * Semua fungsi no-op aman tanpa AudioContext (jsdom/test).
 */

const STEP_MS = 220
const MELODY_FREQS = [523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25, 587.33]
const BASS_FREQS = [130.81, 98, 110, 98]

let musicTimer: number | null = null
let chugTimer: number | null = null
let musicStep = 0
let musicLevel: 1 | 2 | 3 = 1
let chugHigh = false
let chugMs = 300
let ctx: AudioContext | null = null
let master: GainNode | null = null
let ducked = false

function ensureMusicCtx(): { ctx: AudioContext; master: GainNode } | null {
  if (typeof window === 'undefined') return null
  const Ctor: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  try {
    if (!ctx) ctx = new Ctor()
    if (ctx.state === 'suspended') void ctx.resume()
    if (!master) {
      master = ctx.createGain()
      master.gain.value = ducked ? 0.025 : 0.05
      master.connect(ctx.destination)
    }
    return { ctx, master }
  } catch {
    return null
  }
}

function scheduleTone(
  audio: AudioContext,
  out: GainNode,
  freq: number,
  duration: number,
  type: OscillatorType,
  volume: number,
): void {
  try {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = type
    osc.frequency.value = freq
    const start = audio.currentTime
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    osc.connect(gain)
    gain.connect(out)
    osc.start(start)
    osc.stop(start + duration + 0.05)
  } catch {
    // abaikan
  }
}

function musicTick(): void {
  try {
    const ensured = ensureMusicCtx()
    if (!ensured) return
    const step = musicStep % MELODY_FREQS.length
    scheduleTone(ensured.ctx, ensured.master, MELODY_FREQS[step]!, 0.2, 'sine', 0.05)
    if (musicLevel >= 3) {
      scheduleTone(ensured.ctx, ensured.master, MELODY_FREQS[step]! * 2, 0.2, 'sine', 0.03)
    }
    if (step % 2 === 0 || musicLevel >= 2) {
      const bass = BASS_FREQS[(step / 2) % BASS_FREQS.length]!
      scheduleTone(ensured.ctx, ensured.master, bass, 0.4, 'triangle', 0.06)
    }
    if (step % 2 === 1 || musicLevel >= 2) {
      scheduleTone(ensured.ctx, ensured.master, 6000, 0.03, 'square', 0.015)
    }
    musicStep += 1
  } catch {
    // abaikan
  }
}

function chugTick(): void {
  try {
    const ensured = ensureMusicCtx()
    if (!ensured) return
    chugHigh = !chugHigh
    scheduleTone(ensured.ctx, ensured.master, chugHigh ? 140 : 110, 0.06, 'square', 0.07)
  } catch {
    // abaikan
  }
}

export function startTrainMusic(): void {
  if (musicTimer !== null) return
  if (typeof window === 'undefined' || typeof window.setInterval !== 'function') return
  if (!ensureMusicCtx()) return
  musicStep = 0
  try {
    musicTimer = window.setInterval(musicTick, STEP_MS)
  } catch {
    musicTimer = null
  }
}

export function stopTrainMusic(): void {
  if (musicTimer !== null) {
    try {
      window.clearInterval(musicTimer)
    } catch {
      // abaikan
    }
    musicTimer = null
  }
}

export function setMusicDucked(d: boolean): void {
  ducked = d
  if (master) {
    try {
      master.gain.value = d ? 0.025 : 0.05
    } catch {
      // abaikan
    }
  }
}

export function setMusicIntensity(level: 1 | 2 | 3): void {
  if (!Number.isFinite(level)) {
    musicLevel = 1
    return
  }
  musicLevel = level < 1 ? 1 : level > 3 ? 3 : level
}

export function isMusicPlaying(): boolean {
  return musicTimer !== null
}

export function startChug(): void {
  if (chugTimer !== null) return
  if (typeof window === 'undefined' || typeof window.setInterval !== 'function') return
  if (!ensureMusicCtx()) return
  try {
    chugTimer = window.setInterval(chugTick, chugMs)
  } catch {
    chugTimer = null
  }
}

export function stopChug(): void {
  if (chugTimer !== null) {
    try {
      window.clearInterval(chugTimer)
    } catch {
      // abaikan
    }
    chugTimer = null
  }
}

export function setChugRate(intervalMs: number): void {
  const clamped = Number.isFinite(intervalMs)
    ? Math.min(600, Math.max(120, Math.floor(intervalMs)))
    : 300
  chugMs = clamped
  if (chugTimer !== null) {
    stopChug()
    startChug()
  }
}

export function stopAllTrainAudio(): void {
  stopTrainMusic()
  stopChug()
}

export const _trainMusicHelpers = {
  MELODY_FREQS,
  BASS_FREQS,
  STEP_MS,
}
