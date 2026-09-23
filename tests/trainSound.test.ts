import { describe, expect, it } from 'vitest'
import {
  playTrainCelebrate,
  playTrainClick,
  playTrainCorrect,
  playTrainHint,
  playTrainWrong,
  stopTrainAudio,
} from '../src/lib/trainSound'

describe('train sound smoke', () => {
  it('semua fungsi tidak melempar', () => {
    expect(() => {
      playTrainClick()
      playTrainCorrect()
      playTrainWrong()
      playTrainHint()
      playTrainCelebrate()
      stopTrainAudio()
    }).not.toThrow()
  })
})
