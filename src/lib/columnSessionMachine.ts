import type { Feedback } from '../components/guide/FeedbackMessage'
import { requiredAnswerColumnIndexes } from './validation'
import type { GeneratorSettings, MathProblem } from '../types'

export interface ProblemResult {
  problem: MathProblem
  wrongAttempts: number
}

export interface ColumnSessionState {
  problems: MathProblem[]
  index: number
  title: string
  settings: GeneratorSettings | null
  given: (number | null)[]
  activeCol: number
  wrongCols: number[]
  attempts: number
  wrongInProblem: number
  feedback: Feedback | null
  hint: string | null
  offerHelp: boolean
  locked: boolean
  results: ProblemResult[]
  finished: boolean
}

export type ColumnSessionAction =
  | { type: 'digit'; digit: number }
  | { type: 'backspace' }
  | { type: 'select_col'; columnIndex: number }
  | { type: 'check_correct'; praise: string }
  | {
      type: 'check_wrong'
      wrongCols: number[]
      feedbackText: string
      hint: string | null
      offerHelp: boolean
    }
  | { type: 'unlock' }
  | { type: 'advance'; nextProblemFeedbackText: string }
  | { type: 'dismiss_help' }

/**
 * Menghitung kolom aktif berikutnya setelah input angka.
 * Berpindah otomatis ke kolom wajib yang masih kosong di sebelah kiri,
 * atau mencari kolom kosong pertama dari paling kanan bila semua kiri sudah terisi.
 */
export function advanceActiveCol(
  problem: MathProblem,
  given: (number | null)[],
  currentActiveCol: number,
): number {
  const required = requiredAnswerColumnIndexes(problem)
  const orderedDescending = [...required].sort((a, b) => b - a)
  const currentPos = orderedDescending.indexOf(currentActiveCol)
  let nextCol = currentActiveCol
  for (let i = currentPos - 1; i >= 0; i--) {
    if (given[orderedDescending[i]] === null) {
      nextCol = orderedDescending[i]
      break
    }
  }
  if (nextCol === currentActiveCol) {
    for (const columnIndex of orderedDescending) {
      if (given[columnIndex] === null) {
        nextCol = columnIndex
        break
      }
    }
  }
  return nextCol
}

export function initColumnSessionState(
  problems: MathProblem[],
  settings: GeneratorSettings | null,
  title: string,
): ColumnSessionState {
  const firstProblem = problems[0]
  const required = firstProblem ? requiredAnswerColumnIndexes(firstProblem) : []
  return {
    problems,
    index: 0,
    title,
    settings,
    given: firstProblem ? new Array<number | null>(firstProblem.columns.length).fill(null) : [],
    activeCol: required.length > 0 ? required[required.length - 1] : 0,
    wrongCols: [],
    attempts: 0,
    wrongInProblem: 0,
    feedback: null,
    hint: null,
    offerHelp: false,
    locked: false,
    results: [],
    finished: false,
  }
}

/**
 * Pure reducer untuk mengelola siklus hidup sesi hitung bersusun.
 */
export function columnSessionReducer(
  state: ColumnSessionState,
  action: ColumnSessionAction,
): ColumnSessionState {
  switch (action.type) {
    case 'digit': {
      if (state.locked || state.finished) return state
      const problem = state.problems[state.index]
      if (!problem) return state
      const given = [...state.given]
      given[state.activeCol] = action.digit
      const nextCol = advanceActiveCol(problem, given, state.activeCol)
      return {
        ...state,
        given,
        activeCol: nextCol,
        feedback: null,
        hint: null,
      }
    }

    case 'backspace': {
      if (state.locked || state.finished) return state
      const given = [...state.given]
      given[state.activeCol] = null
      return {
        ...state,
        given,
      }
    }

    case 'select_col': {
      if (state.locked || state.finished) return state
      return {
        ...state,
        activeCol: action.columnIndex,
      }
    }

    case 'check_correct': {
      return {
        ...state,
        locked: true,
        feedback: { kind: 'correct', text: action.praise },
        hint: null,
        wrongCols: [],
      }
    }

    case 'check_wrong': {
      return {
        ...state,
        locked: true,
        attempts: state.attempts + 1,
        wrongInProblem: state.wrongInProblem + 1,
        wrongCols: action.wrongCols,
        feedback: { kind: 'wrong', text: action.feedbackText },
        hint: action.hint,
        offerHelp: action.offerHelp,
      }
    }

    case 'unlock': {
      return {
        ...state,
        locked: false,
      }
    }

    case 'advance': {
      const currentProblem = state.problems[state.index]
      if (!currentProblem) return { ...state, finished: true }
      const nextResults = [
        ...state.results,
        { problem: currentProblem, wrongAttempts: state.wrongInProblem },
      ]
      if (state.index + 1 < state.problems.length) {
        const nextProblem = state.problems[state.index + 1]
        const required = requiredAnswerColumnIndexes(nextProblem)
        return {
          ...state,
          index: state.index + 1,
          results: nextResults,
          given: new Array<number | null>(nextProblem.columns.length).fill(null),
          activeCol: required[required.length - 1],
          wrongCols: [],
          attempts: 0,
          wrongInProblem: 0,
          feedback: { kind: 'info', text: action.nextProblemFeedbackText },
          hint: null,
          offerHelp: false,
          locked: false,
        }
      }
      return {
        ...state,
        results: nextResults,
        finished: true,
        locked: true,
      }
    }

    case 'dismiss_help': {
      return {
        ...state,
        offerHelp: false,
      }
    }

    default:
      return state
  }
}
