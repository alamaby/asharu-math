/**
 * State machine eksplisit kereta — pure, tanpa react/three.
 *
 * Mengelola siklus navigasi, perjalanan gerbong, persimpangan rel (junction),
 * dialog kuis 3D, petunjuk (hint), dan stasiun perhentian.
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
  | 'READY_FOR_ANSWER'
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

// Bisnis: Tabel matriks transisi yang diizinkan untuk mencegah transisi ilegal,
// seperti menjawab saat kereta belum mendekati percabangan atau berpindah ronde saat dialog aktif.
export const TRAIN_TRANSITIONS: Record<TrainState, readonly TrainState[]> = {
  LOADING: ['MENU', 'ERROR'],
  MENU: ['INTRO'],
  INTRO: ['TRAIN_MOVING'],
  TRAIN_MOVING: ['APPROACHING_JUNCTION', 'PAUSED', 'ERROR'],
  APPROACHING_JUNCTION: ['WAITING_FOR_ANSWER', 'PAUSED'],
  WAITING_FOR_ANSWER: ['CHECKING_ANSWER', 'PAUSED', 'ERROR'],
  CHECKING_ANSWER: ['SWITCHING_TRACK', 'WAITING_FOR_ANSWER', 'SHOWING_HINT'],
  SHOWING_HINT: ['WAITING_FOR_ANSWER'],
  SWITCHING_TRACK: ['TRAVELLING_TO_STATION'],
  TRAVELLING_TO_STATION: ['ROUND_COMPLETE'],
  ROUND_COMPLETE: ['TRAIN_MOVING', 'SESSION_COMPLETE'],
  SESSION_COMPLETE: ['MENU', 'INTRO'],
  PAUSED: ['TRAIN_MOVING', 'WAITING_FOR_ANSWER', 'APPROACHING_JUNCTION', 'MENU', 'INTRO'],
  ERROR: ['MENU', 'LOADING'],
}

export function canTransition(from: TrainState, to: TrainState): boolean {
  return TRAIN_TRANSITIONS[from]?.includes(to) ?? false
}

// Bisnis: Pemetaan event ke status berikutnya. Menjamin bahwa transisi fase dipicu oleh peristiwa nyata
// (misal: waktu intro selesai, kereta sampai di wesel rel, anak memilih jalur, sinyal wesel beralih).
const EVENT_TARGET: Record<string, TrainState> = {
  'LOADING:LOAD_OK': 'MENU',
  'LOADING:LOAD_FAIL': 'ERROR',
  'MENU:START': 'INTRO',
  'INTRO:INTRO_DONE': 'TRAIN_MOVING',
  'TRAIN_MOVING:ARRIVE_JUNCTION': 'APPROACHING_JUNCTION',
  'APPROACHING_JUNCTION:ANSWER': 'WAITING_FOR_ANSWER',
  'APPROACHING_JUNCTION:READY_FOR_ANSWER': 'WAITING_FOR_ANSWER',
  'WAITING_FOR_ANSWER:ANSWER': 'CHECKING_ANSWER',
  'WAITING_FOR_ANSWER:LOAD_FAIL': 'ERROR',
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
  'PAUSED:QUIT_TO_MENU': 'MENU',
  'PAUSED:RETRY': 'INTRO',
  'PAUSED:START': 'INTRO',
}

/**
 * Transisi status kereta berdasarkan event.
 * Melempar error bila event tidak valid atau transisi dilarang oleh matriks keamanan.
 */
export function transitionTrain(from: TrainState, event: TrainEvent): TrainState {
  if (from === 'PAUSED' && event === 'RESUME') {
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

// Bisnis: Resume hanya diizinkan untuk status gerak/interaksi aktif saat anak menjeda game.
export function resumeTrain(pausedFrom: TrainState): TrainState {
  if (!RESUMABLE.includes(pausedFrom)) {
    throw new Error(`Transisi train tidak valid: resume dari ${pausedFrom}`)
  }
  return pausedFrom
}

export function initialTrainState(): TrainState {
  return 'LOADING'
}
