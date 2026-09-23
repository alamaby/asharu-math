import { describe, expect, it } from 'vitest'
import {
  canTransition,
  initialTrainState,
  resumeTrain,
  TRAIN_TRANSITIONS,
  transitionTrain,
} from '../src/lib/trainStateMachine'

describe('train state machine', () => {
  it('memiliki tepat 14 state', () => {
    expect(Object.keys(TRAIN_TRANSITIONS)).toHaveLength(14)
    expect(initialTrainState()).toBe('LOADING')
  })

  it('alur bahagia satu ronde', () => {
    expect(transitionTrain('LOADING', 'LOAD_OK')).toBe('MENU')
    expect(transitionTrain('MENU', 'START')).toBe('INTRO')
    expect(transitionTrain('INTRO', 'INTRO_DONE')).toBe('TRAIN_MOVING')
    expect(transitionTrain('TRAIN_MOVING', 'ARRIVE_JUNCTION')).toBe('APPROACHING_JUNCTION')
    expect(transitionTrain('APPROACHING_JUNCTION', 'ANSWER')).toBe('WAITING_FOR_ANSWER')
    expect(transitionTrain('WAITING_FOR_ANSWER', 'ANSWER')).toBe('CHECKING_ANSWER')
    expect(transitionTrain('CHECKING_ANSWER', 'CHECK_OK')).toBe('SWITCHING_TRACK')
    expect(transitionTrain('SWITCHING_TRACK', 'SWITCH_DONE')).toBe('TRAVELLING_TO_STATION')
    expect(transitionTrain('TRAVELLING_TO_STATION', 'ARRIVE_STATION')).toBe('ROUND_COMPLETE')
    expect(transitionTrain('ROUND_COMPLETE', 'NEXT_ROUND')).toBe('TRAIN_MOVING')
    expect(transitionTrain('ROUND_COMPLETE', 'FINISH')).toBe('SESSION_COMPLETE')
  })

  it('salah pertama kembali menunggu, salah kedua tampilkan hint', () => {
    expect(transitionTrain('CHECKING_ANSWER', 'CHECK_WRONG_FIRST')).toBe('WAITING_FOR_ANSWER')
    expect(transitionTrain('CHECKING_ANSWER', 'CHECK_WRONG_HINT')).toBe('SHOWING_HINT')
    expect(transitionTrain('SHOWING_HINT', 'HINT_DONE')).toBe('WAITING_FOR_ANSWER')
    expect(canTransition('CHECKING_ANSWER', 'WAITING_FOR_ANSWER')).toBe(true)
    expect(canTransition('CHECKING_ANSWER', 'SHOWING_HINT')).toBe(true)
  })

  it('pause dan resume', () => {
    expect(transitionTrain('TRAIN_MOVING', 'PAUSE')).toBe('PAUSED')
    expect(resumeTrain('TRAIN_MOVING')).toBe('TRAIN_MOVING')
    expect(resumeTrain('WAITING_FOR_ANSWER')).toBe('WAITING_FOR_ANSWER')
    expect(() => resumeTrain('MENU')).toThrow()
  })

  it('transisi tidak valid melempar', () => {
    expect(() => transitionTrain('MENU', 'CHECK_OK')).toThrow()
    expect(canTransition('MENU', 'TRAIN_MOVING')).toBe(false)
    expect(() => transitionTrain('PAUSED', 'RESUME')).toThrow()
  })
})
