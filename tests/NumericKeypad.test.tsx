import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import NumericKeypad from '../src/components/input/NumericKeypad'
import { AllProviders } from './helpers/renderWithProviders'

afterEach(cleanup)

function setup(overrides: Partial<Parameters<typeof NumericKeypad>[0]> = {}) {
  const onDigit = vi.fn()
  const onBackspace = vi.fn()
  const onCheck = vi.fn()
  render(
    <AllProviders>
      <NumericKeypad onDigit={onDigit} onBackspace={onBackspace} onCheck={onCheck} {...overrides} />
    </AllProviders>,
  )
  return { onDigit, onBackspace, onCheck }
}

describe('NumericKeypad', () => {
  it('menampilkan tombol angka 0-9 dengan label ARIA', () => {
    setup()
    for (let digit = 0; digit <= 9; digit++) {
      const button = screen.getByRole('button', { name: `Angka ${digit}` })
      expect(button.textContent?.trim()).toBe(String(digit))
    }
  })

  it('memanggil onDigit sesuai angka yang ditekan', () => {
    const { onDigit } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Angka 7' }))
    fireEvent.click(screen.getByRole('button', { name: 'Angka 0' }))
    expect(onDigit).toHaveBeenNthCalledWith(1, 7)
    expect(onDigit).toHaveBeenNthCalledWith(2, 0)
    expect(onDigit).toHaveBeenCalledTimes(2)
  })

  it('tombol hapus memanggil onBackspace', () => {
    const { onBackspace } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Hapus satu angka' }))
    expect(onBackspace).toHaveBeenCalledTimes(1)
  })

  it('tombol periksa default "Periksa" memanggil onCheck', () => {
    const { onCheck } = setup()
    const checkButton = screen.getByRole('button', { name: 'Periksa' })
    expect(checkButton.textContent).toContain('Periksa')
    fireEvent.click(checkButton)
    expect(onCheck).toHaveBeenCalledTimes(1)
  })

  it('label tombol periksa dapat diganti', () => {
    const { onCheck } = setup({ checkLabel: 'Lanjut' })
    const checkButton = screen.getByRole('button', { name: 'Lanjut' })
    expect(checkButton.textContent).toContain('Lanjut')
    fireEvent.click(checkButton)
    expect(onCheck).toHaveBeenCalledTimes(1)
  })

  it('digitsDisabled menonaktifkan angka dan hapus, tetapi periksa tetap aktif', () => {
    const { onDigit, onCheck } = setup({ digitsDisabled: true })
    expect((screen.getByRole('button', { name: 'Angka 3' }) as HTMLButtonElement).disabled).toBe(
      true,
    )
    expect(
      (screen.getByRole('button', { name: 'Hapus satu angka' }) as HTMLButtonElement).disabled,
    ).toBe(true)
    expect((screen.getByRole('button', { name: 'Periksa' }) as HTMLButtonElement).disabled).toBe(
      false,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Angka 3' }))
    expect(onDigit).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }))
    expect(onCheck).toHaveBeenCalledTimes(1)
  })

  it('checkDisabled menonaktifkan hanya tombol periksa', () => {
    const { onCheck, onDigit } = setup({ checkDisabled: true })
    expect((screen.getByRole('button', { name: 'Periksa' }) as HTMLButtonElement).disabled).toBe(
      true,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }))
    expect(onCheck).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Angka 1' }))
    expect(onDigit).toHaveBeenCalledWith(1)
  })

  it('kelompok tombol memiliki role group berlabel', () => {
    setup()
    expect(screen.getByRole('group', { name: 'Keyboard angka' })).not.toBeNull()
  })
})
