/**
 * State machine eksplisit kereta — pure, tanpa react/three.
 * Daftar state wajib 14 sesuai brief.
 */

export type TrainState =
  | 'LOADING'
  | 'MENU'
  | 'INTRO'
  | 'TRAIN_MOVING'
  | 'APPROACHING_JUNCTION'
  | 'WAITING_FOR_ANSWER'
  | 'CHECKING_ANSWER'
  | 'SHOWING_HINT'
  | 'SWITCHING_TRACK'
  | 'TRAVELLING_TO_STATION'
  | 'ROUND_COMPLETE'
  | 'SESSION_COMPLETE'
  | 'PAUSED'
  | 'ERROR'

export type TrainEvent =
  | 'LOAD_OK'
  | 'LOAD_FAIL'
  | 'START'
  | 'INTRO_DONE'
  | 'ARRIVE_JUNCTION'
  | 'ANSWER'
  | 'CHECK_OK'
  | 'CHECK_WRONG_FIRST'
  | 'CHECK_WRONG_HINT'
  | 'HINT_DONE'
  | 'SWITCH_DONE'
  | 'ARRIVE_STATION'
  | 'NEXT_ROUND'
  | 'FINISH'
  | 'PAUSE'
  | 'RESUME'
  | 'RETRY'
  | 'QUIT_TO_MENU'

export const TRAIN_TRANSITIONS: Record<TrainState, readonly TrainState[]> = {
  LOADING: ['MENU', 'ERROR'],
  MENU: ['INTRO'],
  INTRO: ['TRAIN_MOVING'],
  TRAIN_MOVING: ['APPROACHING_JUNCTION', 'PAUSED', 'ERROR'],
  APPROACHING_JUNCTION: ['WAITING_FOR_ANSWER', 'PAUSED'],
  WAITING_FOR_ANSWER: ['CHECKING_ANSWER', 'PAUSED'],
  CHECKING_ANSWER: ['SWITCHING_TRACK', 'WAITING_FOR_ANSWER', 'SHOWING_HINT'],
  SHOWING_HINT: ['WAITING_FOR_ANSWER'],
  SWITCHING_TRACK: ['TRAVELLING_TO_STATION'],
  TRAVELLING_TO_STATION: ['ROUND_COMPLETE'],
  ROUND_COMPLETE: ['TRAIN_MOVING', 'SESSION_COMPLETE'],
  SESSION_COMPLETE: ['MENU', 'INTRO'],
  PAUSED: ['TRAIN_MOVING', 'WAITING_FOR_ANSWER', 'APPROACHING_JUNCTION', 'MENU'],
  ERROR: ['MENU', 'LOADING'],
}

export function canTransition(from: TrainState, to: TrainState): boolean {
  return TRAIN_TRANSITIONS[from]?.includes(to) ?? false
}

const EVENT_TARGET: Record<string, TrainState> = {
  'LOADING:LOAD_OK': 'MENU',
  'LOADING:LOAD_FAIL': 'ERROR',
  'MENU:START': 'INTRO',
  'INTRO:INTRO_DONE': 'TRAIN_MOVING',
  'TRAIN_MOVING:ARRIVE_JUNCTION': 'APPROACHING_JUNCTION',
  'APPROACHING_JUNCTION:ANSWER': 'WAITING_FOR_ANSWER',
  'WAITING_FOR_ANSWER:ANSWER': 'CHECKING_ANSWER',
  'CHECKING_ANSWER:CHECK_OK': 'SWITCHING_TRACK',
  'CHECKING_ANSWER:CHECK_WRONG_FIRST': 'WAITING_FOR_ANSWER',
  'CHECKING_ANSWER:CHECK_WRONG_HINT': 'SHOWING_HINT',
  'SHOWING_HINT:HINT_DONE': 'WAITING_FOR_ANSWER',
  'SHOWING_HINT:HINT_SHOWN': 'WAITING_FOR_ANSWER',
  'SWITCHING_TRACK:SWITCH_DONE': 'TRAVELLING_TO_STATION',
  'TRAVELLING_TO_STATION:ARRIVE_STATION': 'ROUND_COMPLETE',
  'ROUND_COMPLETE:NEXT_ROUND': 'TRAIN_MOVING',
  'ROUND_COMPLETE:FINISH': 'SESSION_COMPLETE',
  'SESSION_COMPLETE:QUIT_TO_MENU': 'MENU',
  'SESSION_COMPLETE:RETRY': 'INTRO',
  'ERROR:QUIT_TO_MENU': 'MENU',
  'ERROR:RETRY': 'LOADING',
  'TRAIN_MOVING:PAUSE': 'PAUSED',
  'APPROACHING_JUNCTION:PAUSE': 'PAUSED',
  'WAITING_FOR_ANSWER:PAUSE': 'PAUSED',
}

export function transitionTrain(from: TrainState, event: TrainEvent): TrainState {
  if (from === 'PAUSED') {
    throw new Error('Transisi train tidak valid: PAUSED + RESUME pakai resumeTrain')
  }
  const key = `${from}:${event}`
  const target = EVENT_TARGET[key]
  if (!target) {
    throw new Error(`Transisi train tidak valid: ${from} + ${event}`)
  }
  if (!canTransition(from, target)) {
    throw new Error(`Transisi train tidak valid: ${from} + ${event}`)
  }
  return target
}

const RESUMABLE: readonly TrainState[] = [
  'TRAIN_MOVING',
  'WAITING_FOR_ANSWER',
  'APPROACHING_JUNCTION',
]

export function resumeTrain(pausedFrom: TrainState): TrainState {
  if (!RESUMABLE.includes(pausedFrom)) {
    throw new Error(`Transisi train tidak valid: resume dari ${pausedFrom}`)
  }
  return pausedFrom
}

export function initialTrainState(): TrainState {
  return 'LOADING'
}
