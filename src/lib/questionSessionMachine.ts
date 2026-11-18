import type { Feedback } from '../components/guide/FeedbackMessage'

/**
 * Fase interaksi sesi kuis:
 * - 'answering': Anak bebas mengetik atau memilih jawaban.
 * - 'showing_correct': Jawaban benar, feedback pujian tampil, transisi otomatis ke soal berikutnya.
 * - 'showing_wrong': Jawaban belum tepat (< 3 kali salah), tombol terkunci sementara agar anak membaca feedback.
 * - 'showing_reveal': Anak telah mencoba 3 kali namun belum berhasil; sistem mengungkap jawaban yang benar
 *   dengan feedback informatif agar anak belajar dari kunci jawaban sebelum melanjutkan.
 * - 'completed': Seluruh soal dalam antrean selesai; hasil siap dilaporkan ke ResultScreen.
 */
export type QuestionSessionPhase =
  'answering' | 'showing_correct' | 'showing_wrong' | 'showing_reveal' | 'completed'

export interface QuestionResult<TItem> {
  item: TItem
  wrongAttempts: number
}

export interface QuestionSessionState<TItem> {
  items: TItem[]
  index: number
  interim: string
  attempts: number
  wrongInCurrent: number
  feedback: Feedback | null
  phase: QuestionSessionPhase
  results: QuestionResult<TItem>[]
}

export type QuestionSessionAction =
  | { type: 'digit'; digit: number; maxLen?: number }
  | { type: 'backspace' }
  | { type: 'set_interim'; value: string }
  | {
      type: 'submit'
      isCorrect: boolean
      feedback: Feedback
      revealedInput?: string
    }
  | { type: 'unlock' }
  | { type: 'advance' }

/**
 * Inisialisasi state kuis murni tanpa efek samping.
 */
export function initQuestionSessionState<TItem>(items: TItem[]): QuestionSessionState<TItem> {
  return {
    items,
    index: 0,
    interim: '',
    attempts: 0,
    wrongInCurrent: 0,
    feedback: null,
    phase: items.length === 0 ? 'completed' : 'answering',
    results: [],
  }
}

/**
 * Alasan Bisnis:
 * 1. Pencegahan Race Condition & Double-Submission:
 *    Saat status bukan 'answering' (sedang menampilkan feedback benar, salah, atau buka kunci),
 *    seluruh aksi input (digit, backspace, set_interim, submit) diblokir secara mutlak.
 * 2. Ambang Batas Pedagogis 3 Kali Percobaan:
 *    Anak SD tidak boleh dibiarkan frustrasi mencoba tanpa henti. Jika salah mencapai 3 kali
 *    (attempts + 1 >= 3), sistem beralih ke 'showing_reveal' untuk menunjukkan jawaban yang benar,
 *    dan mencatat wrongAttempts kumulatif untuk evaluasi skor bintang.
 * 3. Pemulihan Otomatis vs Lanjut Soal:
 *    Salah biasa (< 3) memicu 'unlock' kembali ke 'answering' untuk memberi kesempatan anak mencoba lagi.
 *    Sedangkan jawaban benar atau reveal memicu 'advance' ke soal berikutnya atau menuntaskan sesi.
 */
export function questionSessionReducer<TItem>(
  state: QuestionSessionState<TItem>,
  action: QuestionSessionAction,
): QuestionSessionState<TItem> {
  switch (action.type) {
    case 'digit': {
      if (state.phase !== 'answering') return state
      const maxLen = action.maxLen ?? 3
      return {
        ...state,
        interim: (state.interim + String(action.digit)).slice(0, maxLen),
        feedback: null,
      }
    }

    case 'backspace': {
      if (state.phase !== 'answering') return state
      return {
        ...state,
        interim: state.interim.slice(0, -1),
      }
    }

    case 'set_interim': {
      if (state.phase !== 'answering') return state
      return {
        ...state,
        interim: action.value,
        feedback: null,
      }
    }

    case 'submit': {
      if (state.phase !== 'answering') return state

      if (action.isCorrect) {
        return {
          ...state,
          phase: 'showing_correct',
          feedback: action.feedback,
        }
      }

      const nextAttempts = state.attempts + 1
      const nextWrong = state.wrongInCurrent + 1

      if (nextAttempts >= 3) {
        return {
          ...state,
          attempts: 0,
          wrongInCurrent: nextWrong,
          interim: action.revealedInput ?? state.interim,
          phase: 'showing_reveal',
          feedback: action.feedback,
        }
      }

      return {
        ...state,
        attempts: nextAttempts,
        wrongInCurrent: nextWrong,
        phase: 'showing_wrong',
        feedback: action.feedback,
      }
    }

    case 'unlock': {
      if (state.phase !== 'showing_wrong') return state
      return {
        ...state,
        phase: 'answering',
      }
    }

    case 'advance': {
      if (state.phase !== 'showing_correct' && state.phase !== 'showing_reveal') {
        return state
      }

      const currentItem = state.items[state.index]
      const results: QuestionResult<TItem>[] = currentItem
        ? [...state.results, { item: currentItem, wrongAttempts: state.wrongInCurrent }]
        : state.results

      if (state.index + 1 < state.items.length) {
        return {
          ...state,
          index: state.index + 1,
          interim: '',
          attempts: 0,
          wrongInCurrent: 0,
          feedback: null,
          phase: 'answering',
          results,
        }
      }

      return {
        ...state,
        phase: 'completed',
        results,
      }
    }

    default:
      return state
  }
}
