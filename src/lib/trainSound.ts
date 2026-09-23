/**
 * SFX kereta — delegasi ke sound.ts. Mute diatur di call site
 * (TrainProgress.soundEnabled / ProgressContext), bukan di modul ini.
 */
import { playCelebrate, playCorrect, playTap, playWrong } from './sound'

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
    playWrong()
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
