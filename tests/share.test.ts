import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyText, shareText } from '../src/lib/share'

describe('shareText — Web Share API tidak tersedia', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('jatuh ke clipboard ketika navigator.share tidak ada', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const outcome = await shareText('teks pencapaian')
    expect(outcome).toBe('copied')
    expect(writeText).toHaveBeenCalledWith('teks pencapaian')
  })

  it('mengembalikan shared saat Web Share API berhasil', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share })
    const outcome = await shareText('teks pencapaian')
    expect(outcome).toBe('shared')
  })

  it('mengembalikan failed saat semua jalur gagal', async () => {
    vi.stubGlobal('navigator', {})
    const outcome = await copyText('teks')
    expect(outcome).toBe('failed')
  })
})
