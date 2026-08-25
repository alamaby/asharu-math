let audioContext: AudioContext | null = null
let soundEnabled = true

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled
}

type ToneType = 'sine' | 'triangle' | 'square'

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!audioContext) {
    try {
      audioContext = new Ctor()
    } catch {
      return null
    }
  }
  return audioContext
}

function tone(
  freq: number,
  startDelay: number,
  duration: number,
  type: ToneType = 'sine',
  volume = 0.12,
): void {
  if (!soundEnabled) return
  const ctx = ensureContext()
  if (!ctx) return
  try {
    if (ctx.state === 'suspended') void ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    const start = ctx.currentTime + startDelay
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + duration + 0.05)
  } catch {
    // bunyi bersifat opsional; jangan ganggu aplikasi
  }
}

export function playTap(): void {
  tone(660, 0, 0.06, 'triangle', 0.06)
}

export function playCorrect(): void {
  tone(523.25, 0, 0.12)
  tone(783.99, 0.1, 0.18)
}

export function playWrong(): void {
  tone(220, 0, 0.18, 'triangle', 0.08)
}

export function playCelebrate(): void {
  tone(523.25, 0, 0.12)
  tone(659.25, 0.12, 0.12)
  tone(783.99, 0.24, 0.12)
  tone(1046.5, 0.36, 0.24)
}
