/**
 * SFX kereta — delegasi ke sound.ts. Mute diatur di call site
 * (TrainProgress.soundEnabled / ProgressContext), bukan di modul ini.
 */
import { playCelebrate, playCorrect, playTap, playTone } from './sound'

export function playTrainClick(): void {
  try {
    playTap()
  } catch {
    // audio opsional
  }
}

export function playTrainCorrect(): void {
  try {
    playCorrect()
  } catch {
    // abaikan
  }
}

export function playTrainWrong(): void {
  try {
    // Netral-naik yang lembut (bukan nada rendah menghukum); copy tetap positif di DOM.
    playTone(392, 0, 0.12, 'triangle', 0.08)
    playTone(523.25, 0.1, 0.15, 'triangle', 0.08)
  } catch {
    // abaikan
  }
}

export function playTrainHint(): void {
  try {
    playTap()
  } catch {
    // abaikan
  }
}

export function playTrainWhistle(): void {
  try {
    playTone(660, 0, 0.15, 'sine', 0.1)
    playTone(880, 0.15, 0.35, 'sine', 0.1)
  } catch {
    // abaikan
  }
}

export function playTrainSwitch(): void {
  try {
    playTone(180, 0, 0.05, 'square', 0.07)
    playTone(320, 0.06, 0.05, 'square', 0.07)
  } catch {
    // abaikan
  }
}

const STAR_FREQS = [523.25, 659.25, 783.99]

export function playTrainStar(stars: 1 | 2 | 3): void {
  try {
    const count = Math.min(3, Math.max(1, Math.floor(stars) || 1))
    for (let i = 0; i < count; i++) {
      playTone(STAR_FREQS[i]!, i * 0.1, 0.12, 'sine', 0.12)
    }
  } catch {
    // abaikan
  }
}

export function playTrainCelebrate(): void {
  try {
    playCelebrate()
  } catch {
    // abaikan
  }
}

export function stopTrainAudio(): void {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  } catch {
    // abaikan
  }
}
