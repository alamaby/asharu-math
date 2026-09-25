import { describe, expect, it } from 'vitest'
import {
  playTrainCelebrate,
  playTrainClick,
  playTrainCorrect,
  playTrainHint,
  playTrainStar,
  playTrainSwitch,
  playTrainWhistle,
  playTrainWrong,
  stopTrainAudio,
} from '../src/lib/trainSound'

describe('train SFX identitas', () => {
  it('semua SFX tidak melempar tanpa AudioContext', () => {
    expect(() => {
      playTrainClick()
      playTrainCorrect()
      playTrainWrong()
      playTrainHint()
      playTrainCelebrate()
      playTrainWhistle()
      playTrainSwitch()
      playTrainStar(1)
      playTrainStar(2)
      playTrainStar(3)
      stopTrainAudio()
    }).not.toThrow()
  })

  it('star clamp deterministik di luar rentang', () => {
    expect(() => {
      playTrainStar(0 as 1)
      playTrainStar(99 as 3)
    }).not.toThrow()
  })
})
