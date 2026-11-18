import { describe, it, expect } from 'vitest'
import {
  createInitialPlaceValueWorldState,
  placeValueWorldReducer,
} from '../src/lib/placeValueWorldMachine'

describe('placeValueWorldMachine', () => {
  it('membuat state awal dengan opsi yang ditentukan', () => {
    const state = createInitialPlaceValueWorldState({
      initialTens: 3,
      initialOnes: 12,
      initialHundreds: 0,
    })

    expect(state.phase).toBe('intro')
    expect(state.visualTens).toBe(3)
    expect(state.visualOnes).toBe(12)
    expect(state.visualHundreds).toBe(0)
    expect(state.exchanged).toBe(false)
    expect(state.opened).toBe(false)
    expect(state.activeColumn).toBe('ones')
    expect(state.highlight).toBe('ones')
    expect(state.onesAnswer).toBeNull()
    expect(state.tensAnswer).toBeNull()
    expect(state.hundredsAnswer).toBeNull()
    expect(state.wrongAttempts).toBe(0)
    expect(state.tutorialOpen).toBe(false)
  })

  it('RESET mengembalikan seluruh nilai visual dan jawaban ke kondisi awal', () => {
    let state = createInitialPlaceValueWorldState({
      initialTens: 3,
      initialOnes: 12,
      initialHundreds: 0,
    })

    state = placeValueWorldReducer(state, {
      type: 'INPUT_DIGIT',
      digit: 2,
      isThree: false,
    })
    state = placeValueWorldReducer(state, {
      type: 'INPUT_DIGIT',
      digit: 4,
      isThree: false,
    })
    state = placeValueWorldReducer(state, {
      type: 'CHECK_FAILURE',
      wrongOnes: false,
      wrongTens: true,
      wrongHundreds: false,
      feedbackText: 'Coba lagi ya',
      highlight: 'tens',
    })

    expect(state.onesAnswer).toBe(2)
    expect(state.tensAnswer).toBe(4)
    expect(state.wrongAttempts).toBe(1)
    expect(state.wrongTens).toBe(true)

    const resetState = placeValueWorldReducer(state, {
      type: 'RESET',
      initialTens: 3,
      initialOnes: 12,
      initialHundreds: 0,
      phase: 'showQuestion',
    })

    expect(resetState.phase).toBe('showQuestion')
    expect(resetState.onesAnswer).toBeNull()
    expect(resetState.tensAnswer).toBeNull()
    expect(resetState.wrongAttempts).toBe(0)
    expect(resetState.wrongTens).toBe(false)
    expect(resetState.activeColumn).toBe('ones')
  })

  it('INPUT_DIGIT berurutan: satuan -> puluhan -> ratusan (3 digit)', () => {
    let state = createInitialPlaceValueWorldState({
      initialTens: 2,
      initialOnes: 5,
      initialHundreds: 1,
      phase: 'enterOnesAnswer',
    })

    // Isi satuan: 5
    state = placeValueWorldReducer(state, {
      type: 'INPUT_DIGIT',
      digit: 5,
      isThree: true,
    })
    expect(state.onesAnswer).toBe(5)
    expect(state.activeColumn).toBe('tens')
    expect(state.highlight).toBe('tens')
    expect(state.phase).toBe('enterTensAnswer')

    // Isi puluhan: 4
    state = placeValueWorldReducer(state, {
      type: 'INPUT_DIGIT',
      digit: 4,
      isThree: true,
    })
    expect(state.tensAnswer).toBe(4)
    expect(state.activeColumn).toBe('hundreds')
    expect(state.highlight).toBe('hundreds')
    expect(state.phase).toBe('enterHundredsAnswer')

    // Isi ratusan: 1
    state = placeValueWorldReducer(state, {
      type: 'INPUT_DIGIT',
      digit: 1,
      isThree: true,
    })
    expect(state.hundredsAnswer).toBe(1)
    expect(state.activeColumn).toBe('hundreds')
  })

  it('BACKSPACE menghapus digit kolom aktif lalu mundur bila kolom sudah kosong', () => {
    let state = createInitialPlaceValueWorldState({
      initialTens: 0,
      initialOnes: 0,
      initialHundreds: 0,
    })

    state = placeValueWorldReducer(state, {
      type: 'INPUT_DIGIT',
      digit: 8,
      isThree: false,
    }) // ones=8, active=tens
    state = placeValueWorldReducer(state, {
      type: 'INPUT_DIGIT',
      digit: 3,
      isThree: false,
    }) // tens=3, active=tens

    // Backspace saat active=tens dan tensAnswer=3 -> tensAnswer jadi null
    state = placeValueWorldReducer(state, { type: 'BACKSPACE' })
    expect(state.tensAnswer).toBeNull()
    expect(state.activeColumn).toBe('tens')

    // Backspace saat active=tens dan tensAnswer=null -> active pindah ke ones dan onesAnswer jadi null
    state = placeValueWorldReducer(state, { type: 'BACKSPACE' })
    expect(state.activeColumn).toBe('ones')
    expect(state.onesAnswer).toBeNull()
  })

  it('pertukaran dan peminjaman visual satuan & ratusan memperbarui kuantitas dan flag', () => {
    let state = createInitialPlaceValueWorldState({
      initialTens: 3,
      initialOnes: 12,
      initialHundreds: 0,
    })

    // Start animation
    state = placeValueWorldReducer(state, {
      type: 'START_ANIMATION',
      feedback: { kind: 'info', text: '10 apel dimasukkan ke keranjang' },
    })
    expect(state.animating).toBe(true)
    expect(state.feedback?.text).toBe('10 apel dimasukkan ke keranjang')

    // Finish exchange ones
    state = placeValueWorldReducer(state, {
      type: 'FINISH_EXCHANGE_ONES',
      visualOnes: 2,
      visualTens: 4,
      nextPhase: 'enterOnesAnswer',
      highlight: 'ones',
      feedback: { kind: 'info', text: 'Berapa sisa apel?' },
    })
    expect(state.animating).toBe(false)
    expect(state.exchanged).toBe(true)
    expect(state.visualOnes).toBe(2)
    expect(state.visualTens).toBe(4)
    expect(state.phase).toBe('enterOnesAnswer')
    expect(state.highlight).toBe('ones')

    // Test finish open hundred
    state = placeValueWorldReducer(state, {
      type: 'FINISH_OPEN_HUNDRED',
      visualTens: 14,
      visualHundreds: 0,
      nextPhase: 'exchangeOrRegroup',
      highlight: 'ones',
    })
    expect(state.openedHundred).toBe(true)
    expect(state.visualTens).toBe(14)
    expect(state.visualHundreds).toBe(0)
  })

  it('CHECK_SUCCESS idempoten dan mengunci fase ke completed', () => {
    let state = createInitialPlaceValueWorldState({
      initialTens: 4,
      initialOnes: 2,
      initialHundreds: 0,
    })

    state = placeValueWorldReducer(state, {
      type: 'CHECK_SUCCESS',
      feedbackText: 'Hebat, benar semua!',
    })
    expect(state.phase).toBe('completed')
    expect(state.hasCheckedOnce).toBe(true)
    expect(state.feedback?.kind).toBe('correct')

    // Dispatch ulang tidak mengubah apa-apa
    const secondCall = placeValueWorldReducer(state, {
      type: 'CHECK_SUCCESS',
      feedbackText: 'Berbeda',
    })
    expect(secondCall).toBe(state)
  })

  it('CHECK_FAILURE menaikkan wrongAttempts dan menyorot kolom bermasalah', () => {
    let state = createInitialPlaceValueWorldState({
      initialTens: 4,
      initialOnes: 2,
      initialHundreds: 0,
    })

    state = placeValueWorldReducer(state, {
      type: 'CHECK_FAILURE',
      wrongOnes: true,
      wrongTens: false,
      wrongHundreds: false,
      feedbackText: 'Periksa satuanmu lagi',
      highlight: 'ones',
    })
    expect(state.wrongAttempts).toBe(1)
    expect(state.wrongOnes).toBe(true)
    expect(state.wrongTens).toBe(false)
    expect(state.highlight).toBe('ones')
  })

  it('transisi tutorial: open, next step, close', () => {
    let state = createInitialPlaceValueWorldState({
      initialTens: 2,
      initialOnes: 5,
      initialHundreds: 0,
    })

    state = placeValueWorldReducer(state, {
      type: 'TUTORIAL_OPEN',
      step: 0,
      subtitle: 'Selamat datang',
    })
    expect(state.tutorialOpen).toBe(true)
    expect(state.tutorialStep).toBe(0)
    expect(state.subtitle).toBe('Selamat datang')

    state = placeValueWorldReducer(state, { type: 'TUTORIAL_NEXT_STEP' })
    expect(state.tutorialStep).toBe(1)

    state = placeValueWorldReducer(state, {
      type: 'TUTORIAL_CLOSE',
      feedbackText: 'Ayo mulai!',
      nextPhase: 'showQuestion',
    })
    expect(state.tutorialOpen).toBe(false)
    expect(state.phase).toBe('showQuestion')
    expect(state.feedback?.text).toBe('Ayo mulai!')
  })
})
