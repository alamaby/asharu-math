/**
 * Audio edukatif Akuarium Ikan Ceria — Web Audio sfx + Web Speech id-ID fallback.
 * Anti-tumpuk narasi, hormati toggle suara, simpan narasi terakhir.
 */
import { playCorrect, playTap, playWrong, playCelebrate } from './sound'

let lastNarration: string | null = null
let speaking = false

function supportsSpeech(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function cancelSpeech(): void {
  if (supportsSpeech()) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      // ignore
    }
  }
  speaking = false
}

export function getLastNarration(): string | null {
  return lastNarration
}

export function isSpeaking(): boolean {
  return speaking
}

export function speak(text: string, enabled: boolean): void {
  lastNarration = text
  if (!enabled) return
  if (typeof window === 'undefined') return
  cancelSpeech()
  if (!supportsSpeech()) return
  try {
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'id-ID'
    utter.rate = 0.9
    utter.onstart = () => {
      speaking = true
    }
    const done = () => {
      speaking = false
    }
    utter.onend = done
    utter.onerror = done
    const voices = window.speechSynthesis.getVoices()
    const idVoice = voices.find((v) => v.lang.toLowerCase().startsWith('id'))
    if (idVoice) utter.voice = idVoice
    window.speechSynthesis.speak(utter)
  } catch {
    speaking = false
  }
}

export function repeatLastNarration(enabled: boolean): void {
  if (lastNarration) speak(lastNarration, enabled)
}

export function stopAllAudio(): void {
  cancelSpeech()
}

export function playPickFish(): void {
  playTap()
}

export function playFormGroup(): void {
  playCorrect()
}

export function playSplitGroup(): void {
  playTap()
  setTimeout(() => playTap(), 120)
}

export function playReward(): void {
  playCelebrate()
}

export function playTryAgain(): void {
  playWrong()
}
