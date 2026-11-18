import { describe, expect, it } from 'vitest'
import {
  initialShareDialogState,
  shareDialogReducer,
  type ShareDialogState,
} from '../src/lib/shareDialogMachine'

describe('shareDialogMachine', () => {
  it('kondisi awal adalah phase closed', () => {
    expect(initialShareDialogState.phase).toBe('closed')
  })

  it('OPEN berpindah ke phase rendering', () => {
    const next = shareDialogReducer(initialShareDialogState, { type: 'OPEN' })
    expect(next.phase).toBe('rendering')
    if (next.phase === 'rendering') {
      expect(next.feedback).toBeNull()
    }
  })

  it('IMAGE_READY dari rendering berpindah ke ready dengan blob dan url', () => {
    const renderingState: ShareDialogState = { phase: 'rendering', feedback: null }
    const fakeBlob = new Blob(['image'], { type: 'image/png' })
    const next = shareDialogReducer(renderingState, {
      type: 'IMAGE_READY',
      blob: fakeBlob,
      url: 'blob:test-url',
    })

    expect(next.phase).toBe('ready')
    if (next.phase === 'ready') {
      expect(next.imageBlob).toBe(fakeBlob)
      expect(next.imageUrl).toBe('blob:test-url')
      expect(next.busy).toBe(false)
      expect(next.feedback).toBeNull()
    }
  })

  it('IMAGE_READY diabaikan jika tidak dalam phase rendering', () => {
    const closedState = initialShareDialogState
    const fakeBlob = new Blob(['image'], { type: 'image/png' })
    const next = shareDialogReducer(closedState, {
      type: 'IMAGE_READY',
      blob: fakeBlob,
      url: 'blob:test-url',
    })
    expect(next.phase).toBe('closed')
  })

  it('IMAGE_FAILED dari rendering berpindah ke phase error', () => {
    const renderingState: ShareDialogState = { phase: 'rendering', feedback: null }
    const next = shareDialogReducer(renderingState, {
      type: 'IMAGE_FAILED',
      feedback: 'Canvas tidak didukung',
    })

    expect(next.phase).toBe('error')
    if (next.phase === 'error') {
      expect(next.feedback).toBe('Canvas tidak didukung')
    }
  })

  it('SET_BUSY memperbarui busy hanya pada phase ready', () => {
    const fakeBlob = new Blob(['image'], { type: 'image/png' })
    const readyState: ShareDialogState = {
      phase: 'ready',
      imageBlob: fakeBlob,
      imageUrl: 'blob:test',
      busy: false,
      feedback: null,
    }

    const busyNext = shareDialogReducer(readyState, { type: 'SET_BUSY', busy: true })
    expect(busyNext.phase).toBe('ready')
    if (busyNext.phase === 'ready') {
      expect(busyNext.busy).toBe(true)
    }

    const unbusyNext = shareDialogReducer(busyNext, { type: 'SET_BUSY', busy: false })
    if (unbusyNext.phase === 'ready') {
      expect(unbusyNext.busy).toBe(false)
    }
  })

  it('SET_FEEDBACK memperbarui pesan pada phase ready dan error, tapi mengabaikan closed', () => {
    const errorState: ShareDialogState = { phase: 'error', feedback: null }
    const next = shareDialogReducer(errorState, { type: 'SET_FEEDBACK', message: 'Berhasil disalin' })
    expect(next.phase).toBe('error')
    if (next.phase === 'error') {
      expect(next.feedback).toBe('Berhasil disalin')
    }

    const closedNext = shareDialogReducer(initialShareDialogState, {
      type: 'SET_FEEDBACK',
      message: 'Abaikan',
    })
    expect(closedNext.phase).toBe('closed')
  })

  it('CLOSE mengembalikan phase ke closed dari phase manapun', () => {
    const renderingState: ShareDialogState = { phase: 'rendering', feedback: null }
    expect(shareDialogReducer(renderingState, { type: 'CLOSE' }).phase).toBe('closed')

    const errorState: ShareDialogState = { phase: 'error', feedback: 'error' }
    expect(shareDialogReducer(errorState, { type: 'CLOSE' }).phase).toBe('closed')
  })
})
