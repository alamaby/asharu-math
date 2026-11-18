/**
 * State machine murni untuk simulasi nilai tempat (Place Value World: Garden & Aquarium).
 *
 * Mengelola siklus fase, kuantitas visual (satuan, puluhan, ratusan), flag pertukaran (exchange)
 * dan pembukaan/peminjaman (regroup/borrow), navigasi kolom aktif, dan status periksa jawaban.
 */

export type PlaceValueColumn = 'ones' | 'tens' | 'hundreds'

export type PlaceValueWorldPhase =
  | 'intro'
  | 'showQuestion'
  | 'countOnes'
  | 'exchangeOrRegroup'
  | 'exchangeOrGroup'
  | 'enterOnesAnswer'
  | 'countTens'
  | 'enterTensAnswer'
  | 'enterHundredsAnswer'
  | 'checkAnswer'
  | 'feedback'
  | 'completed'

export interface PlaceValueWorldFeedback {
  kind: 'correct' | 'wrong' | 'info'
  text: string
}

export interface PlaceValueWorldState {
  phase: PlaceValueWorldPhase
  visualOnes: number
  visualTens: number
  visualHundreds: number
  exchanged: boolean
  exchangedHundred: boolean
  opened: boolean
  openedHundred: boolean
  onesAnswer: number | null
  tensAnswer: number | null
  hundredsAnswer: number | null
  activeColumn: PlaceValueColumn | null
  highlight: PlaceValueColumn | null
  feedback: PlaceValueWorldFeedback | null
  subtitle: string | null
  animating: boolean
  wrongAttempts: number
  wrongOnes: boolean
  wrongTens: boolean
  wrongHundreds: boolean
  hasCheckedOnce: boolean
  tutorialStep: number
  tutorialOpen: boolean
}

export interface CreateInitialPlaceValueWorldStateOptions {
  initialTens: number
  initialOnes: number
  initialHundreds: number
  phase?: PlaceValueWorldPhase
  tutorialOpen?: boolean
  tutorialStep?: number
}

export function createInitialPlaceValueWorldState(
  options: CreateInitialPlaceValueWorldStateOptions,
): PlaceValueWorldState {
  return {
    phase: options.phase ?? 'intro',
    visualOnes: options.initialOnes,
    visualTens: options.initialTens,
    visualHundreds: options.initialHundreds,
    exchanged: false,
    exchangedHundred: false,
    opened: false,
    openedHundred: false,
    onesAnswer: null,
    tensAnswer: null,
    hundredsAnswer: null,
    activeColumn: 'ones',
    highlight: 'ones',
    feedback: null,
    subtitle: null,
    animating: false,
    wrongAttempts: 0,
    wrongOnes: false,
    wrongTens: false,
    wrongHundreds: false,
    hasCheckedOnce: false,
    tutorialStep: options.tutorialStep ?? 0,
    tutorialOpen: options.tutorialOpen ?? false,
  }
}

export type PlaceValueWorldAction =
  | {
      type: 'RESET'
      initialTens: number
      initialOnes: number
      initialHundreds: number
      phase?: PlaceValueWorldPhase
      tutorialOpen?: boolean
      tutorialStep?: number
    }
  | { type: 'SET_PHASE'; phase: PlaceValueWorldPhase }
  | { type: 'SET_FEEDBACK'; feedback: PlaceValueWorldFeedback | null }
  | { type: 'SET_SUBTITLE'; subtitle: string | null }
  | { type: 'SET_HIGHLIGHT'; highlight: PlaceValueColumn | null }
  | { type: 'SET_ACTIVE_COLUMN'; column: PlaceValueColumn | null }
  | { type: 'SELECT_COLUMN'; column: PlaceValueColumn }
  | { type: 'SET_ANIMATING'; animating: boolean }
  | {
      type: 'START_ANIMATION'
      feedback?: PlaceValueWorldFeedback | null
      subtitle?: string | null
    }
  | {
      type: 'FINISH_EXCHANGE_ONES'
      visualOnes: number
      visualTens: number
      visualHundreds?: number
      nextPhase: PlaceValueWorldPhase
      highlight: PlaceValueColumn
      feedback?: PlaceValueWorldFeedback | null
    }
  | {
      type: 'FINISH_OPEN_ONES'
      visualOnes: number
      visualTens: number
      visualHundreds?: number
      nextPhase: PlaceValueWorldPhase
      highlight: PlaceValueColumn
      feedback?: PlaceValueWorldFeedback | null
    }
  | {
      type: 'FINISH_EXCHANGE_HUNDRED'
      visualTens: number
      visualHundreds: number
      nextPhase: PlaceValueWorldPhase
      highlight: PlaceValueColumn
      feedback?: PlaceValueWorldFeedback | null
    }
  | {
      type: 'FINISH_OPEN_HUNDRED'
      visualTens: number
      visualHundreds: number
      nextPhase: PlaceValueWorldPhase
      highlight: PlaceValueColumn
      feedback?: PlaceValueWorldFeedback | null
    }
  | { type: 'INPUT_DIGIT'; digit: number; isThree: boolean }
  | { type: 'BACKSPACE' }
  | { type: 'CHECK_SUCCESS'; feedbackText: string }
  | {
      type: 'CHECK_FAILURE'
      wrongOnes: boolean
      wrongTens: boolean
      wrongHundreds: boolean
      feedbackText: string
      highlight: PlaceValueColumn
    }
  | { type: 'TUTORIAL_OPEN'; step?: number; subtitle?: string | null }
  | { type: 'TUTORIAL_NEXT_STEP' }
  | { type: 'TUTORIAL_CLOSE'; feedbackText?: string; nextPhase?: PlaceValueWorldPhase }

export function placeValueWorldReducer(
  state: PlaceValueWorldState,
  action: PlaceValueWorldAction,
): PlaceValueWorldState {
  switch (action.type) {
    // Bisnis: Reset mengembalikan seluruh kuantitas visual, jawaban, dan sorotan ke kondisi awal
    // agar anak dapat memulai ulang soal tanpa residu visual atau status gagal sebelumnya.
    case 'RESET':
      return {
        phase: action.phase ?? 'intro',
        visualOnes: action.initialOnes,
        visualTens: action.initialTens,
        visualHundreds: action.initialHundreds,
        exchanged: false,
        exchangedHundred: false,
        opened: false,
        openedHundred: false,
        onesAnswer: null,
        tensAnswer: null,
        hundredsAnswer: null,
        activeColumn: 'ones',
        highlight: 'ones',
        feedback: null,
        subtitle: null,
        animating: false,
        wrongAttempts: 0,
        wrongOnes: false,
        wrongTens: false,
        wrongHundreds: false,
        hasCheckedOnce: false,
        tutorialStep: action.tutorialStep ?? 0,
        tutorialOpen: action.tutorialOpen ?? false,
      }

    case 'SET_PHASE':
      return { ...state, phase: action.phase }

    case 'SET_FEEDBACK':
      return { ...state, feedback: action.feedback }

    case 'SET_SUBTITLE':
      return { ...state, subtitle: action.subtitle }

    case 'SET_HIGHLIGHT':
      return { ...state, highlight: action.highlight }

    case 'SET_ACTIVE_COLUMN':
      return { ...state, activeColumn: action.column }

    case 'SELECT_COLUMN':
      return { ...state, activeColumn: action.column, highlight: action.column }

    case 'SET_ANIMATING':
      return { ...state, animating: action.animating }

    // Bisnis: Selama animasi pengelompokan atau pembongkaran berjalan, status animasi dikunci
    // agar anak tidak memicu interaksi ganda yang dapat merusak sinkronisasi kuantitas visual.
    case 'START_ANIMATION':
      return {
        ...state,
        animating: true,
        feedback: action.feedback !== undefined ? action.feedback : state.feedback,
        subtitle: action.subtitle !== undefined ? action.subtitle : state.subtitle,
      }

    // Bisnis: Menyelesaikan pertukaran 10 satuan menjadi 1 puluhan (simpan), memperbarui
    // representasi apel/ikan visual dan mengarahkan fokus anak ke kolom target berikutnya.
    case 'FINISH_EXCHANGE_ONES':
      return {
        ...state,
        visualOnes: action.visualOnes,
        visualTens: action.visualTens,
        visualHundreds: action.visualHundreds ?? state.visualHundreds,
        exchanged: true,
        animating: false,
        phase: action.nextPhase,
        highlight: action.highlight,
        feedback: action.feedback !== undefined ? action.feedback : state.feedback,
      }

    // Bisnis: Menyelesaikan peminjaman 1 puluhan menjadi 10 satuan, memperbarui jumlah
    // visual sehingga anak melihat cukup apel/ikan untuk menyelesaikan operasi pengurangan.
    case 'FINISH_OPEN_ONES':
      return {
        ...state,
        visualOnes: action.visualOnes,
        visualTens: action.visualTens,
        visualHundreds: action.visualHundreds ?? state.visualHundreds,
        opened: true,
        animating: false,
        phase: action.nextPhase,
        highlight: action.highlight,
        feedback: action.feedback !== undefined ? action.feedback : state.feedback,
      }

    // Bisnis: Menyelesaikan pertukaran 10 puluhan menjadi 1 ratusan untuk soal 3-digit.
    case 'FINISH_EXCHANGE_HUNDRED':
      return {
        ...state,
        visualTens: action.visualTens,
        visualHundreds: action.visualHundreds,
        exchangedHundred: true,
        animating: false,
        phase: action.nextPhase,
        highlight: action.highlight,
        feedback: action.feedback !== undefined ? action.feedback : state.feedback,
      }

    // Bisnis: Menyelesaikan pembongkaran 1 ratusan menjadi 10 puluhan untuk pengurangan 3-digit.
    case 'FINISH_OPEN_HUNDRED':
      return {
        ...state,
        visualTens: action.visualTens,
        visualHundreds: action.visualHundreds,
        openedHundred: true,
        animating: false,
        phase: action.nextPhase,
        highlight: action.highlight,
        feedback: action.feedback !== undefined ? action.feedback : state.feedback,
      }

    // Bisnis: Input digit mengikuti pedagogi berhitung bersusun dari kanan ke kiri:
    // setelah mengisi satuan, kursor otomatis berpindah ke puluhan; dari puluhan ke ratusan (bila 3 digit).
    case 'INPUT_DIGIT': {
      if (state.activeColumn === 'ones') {
        return {
          ...state,
          onesAnswer: action.digit,
          wrongOnes: false,
          activeColumn: 'tens',
          highlight: 'tens',
          phase: state.phase === 'enterOnesAnswer' ? 'enterTensAnswer' : state.phase,
        }
      }
      if (state.activeColumn === 'tens') {
        if (action.isThree) {
          return {
            ...state,
            tensAnswer: action.digit,
            wrongTens: false,
            activeColumn: 'hundreds',
            highlight: 'hundreds',
            phase: state.phase === 'enterTensAnswer' ? 'enterHundredsAnswer' : state.phase,
          }
        }
        return {
          ...state,
          tensAnswer: action.digit,
          wrongTens: false,
        }
      }
      if (state.activeColumn === 'hundreds') {
        return {
          ...state,
          hundredsAnswer: action.digit,
          wrongHundreds: false,
        }
      }
      return state
    }

    // Bisnis: Backspace menghapus digit kolom aktif terlebih dahulu; jika kolom sudah kosong,
    // kursor mundur ke kolom sebelumnya agar revisi anak alami dan tidak frustatif.
    case 'BACKSPACE': {
      if (state.activeColumn === 'hundreds' && state.hundredsAnswer !== null) {
        return { ...state, hundredsAnswer: null }
      }
      if (state.activeColumn === 'hundreds' && state.hundredsAnswer === null) {
        return { ...state, activeColumn: 'tens' }
      }
      if (state.activeColumn === 'tens' && state.tensAnswer !== null) {
        return { ...state, tensAnswer: null }
      }
      if (state.activeColumn === 'ones' && state.onesAnswer !== null) {
        return { ...state, onesAnswer: null }
      }
      if (state.activeColumn === 'tens' && state.tensAnswer === null) {
        return { ...state, activeColumn: 'ones', onesAnswer: null }
      }
      return state
    }

    // Bisnis: Jawaban benar mengunci aksi berulang (idempoten) dan menampilkan selebrasi penyelesaian.
    case 'CHECK_SUCCESS':
      if (state.hasCheckedOnce) return state
      return {
        ...state,
        hasCheckedOnce: true,
        wrongOnes: false,
        wrongTens: false,
        wrongHundreds: false,
        phase: 'completed',
        feedback: { kind: 'correct', text: action.feedbackText },
      }

    // Bisnis: Jawaban belum tepat mencatat percobaan salah dan mengarahkan sorotan ke kolom yang salah,
    // tanpa mereset visual objek manipulatif agar anak dapat menghitung ulang dengan tenang.
    case 'CHECK_FAILURE':
      return {
        ...state,
        wrongOnes: action.wrongOnes,
        wrongTens: action.wrongTens,
        wrongHundreds: action.wrongHundreds,
        wrongAttempts: state.wrongAttempts + 1,
        feedback: { kind: 'wrong', text: action.feedbackText },
        highlight: action.highlight,
      }

    case 'TUTORIAL_OPEN':
      return {
        ...state,
        tutorialOpen: true,
        tutorialStep: action.step ?? 0,
        subtitle: action.subtitle !== undefined ? action.subtitle : state.subtitle,
      }

    case 'TUTORIAL_NEXT_STEP':
      return {
        ...state,
        tutorialStep: state.tutorialStep + 1,
      }

    case 'TUTORIAL_CLOSE':
      return {
        ...state,
        tutorialOpen: false,
        phase: action.nextPhase ?? state.phase,
        feedback: action.feedbackText
          ? { kind: 'info', text: action.feedbackText }
          : state.feedback,
      }

    default:
      return state
  }
}
