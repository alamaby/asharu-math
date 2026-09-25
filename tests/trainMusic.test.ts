import { describe, expect, it } from 'vitest'
import {
  _trainMusicHelpers,
  isMusicPlaying,
  setChugRate,
  setMusicDucked,
  setMusicIntensity,
  startChug,
  startTrainMusic,
  stopAllTrainAudio,
  stopChug,
  stopTrainMusic,
} from '../src/lib/trainMusic'

describe('train music', () => {
  it('konstanta exact pentatonik', () => {
    expect(_trainMusicHelpers.MELODY_FREQS).toEqual([
      523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25, 587.33,
    ])
    expect(_trainMusicHelpers.BASS_FREQS).toEqual([130.81, 98, 110, 98])
    expect(_trainMusicHelpers.STEP_MS).toBe(220)
  })

  it('no-op tanpa AudioContext', () => {
    expect(() => {
      startTrainMusic()
      setMusicDucked(true)
      startChug()
      setChugRate(180)
      stopAllTrainAudio()
    }).not.toThrow()
    expect(isMusicPlaying()).toBe(false)
  })

  it('stop ganda idempoten', () => {
    expect(() => {
      stopTrainMusic()
      stopChug()
      stopAllTrainAudio()
    }).not.toThrow()
  })

  it('clamp level intensitas di luar rentang', () => {
    expect(() => {
      setMusicIntensity(0 as 1)
      setMusicIntensity(99 as 3)
      setMusicIntensity(NaN as 1)
    }).not.toThrow()
  })

  it('start dengan level 3 lalu stop tetap bersih', () => {
    expect(() => {
      startTrainMusic()
      setMusicIntensity(3)
      stopTrainMusic()
    }).not.toThrow()
    expect(isMusicPlaying()).toBe(false)
  })
})
