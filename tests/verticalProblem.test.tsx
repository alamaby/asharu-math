import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import VerticalMathProblem from '../src/components/math/VerticalMathProblem'
import { buildProblem } from '../src/lib/problemGenerator'

afterEach(cleanup)

function rowText(prefix: string): string {
  const cells = Array.from(document.querySelectorAll(`[data-testid^="${prefix}-"]`))
    .filter((cell) => cell.textContent && cell.textContent.trim() !== '')
    .sort((a, b) => {
      const ai = Number((a as HTMLElement).dataset.testid?.split('-').pop())
      const bi = Number((b as HTMLElement).dataset.testid?.split('-').pop())
      return ai - bi
    })
  return cells.map((cell) => cell.textContent?.trim()).join('')
}

describe('VerticalMathProblem — 26 + 87', () => {
  const problem = buildProblem('addition', 26, 87)
  const answers = new Array<number | null>(problem.columns.length).fill(null)

  it('baris pertama tampil 26 (bukan 62)', () => {
    render(<VerticalMathProblem problem={problem} answers={answers} />)
    expect(rowText('first-digit')).toBe('26')
  })

  it('baris kedua tampil 87 (bukan 78)', () => {
    render(<VerticalMathProblem problem={problem} answers={answers} />)
    expect(rowText('second-digit')).toBe('87')
  })

  it('operator + berada di kolom paling kanan baris kedua', () => {
    render(<VerticalMathProblem problem={problem} answers={answers} />)
    const operator = screen.getByTestId('operator-cell')
    expect(operator.textContent?.trim()).toBe('+')
    expect(operator.parentElement?.getAttribute('style')).toContain(`grid-column: ${problem.columns.length + 1}`)
    expect(operator.parentElement?.getAttribute('style')).toContain('grid-row: 4')
  })

  it('kotak simpan tersedia di atas puluhan dan ratusan, bukan satuan', () => {
    render(<VerticalMathProblem problem={problem} answers={answers} />)
    expect(screen.queryByTestId('carry-cell-1')).not.toBeNull()
    expect(screen.queryByTestId('carry-cell-0')).not.toBeNull()
    expect(screen.queryByTestId('carry-cell-2')).toBeNull()
  })

  it('label nilai tempat menampilkan P dan S untuk kolom aktif', () => {
    render(<VerticalMathProblem problem={problem} answers={answers} />)
    expect(screen.getByTitle('puluhan')).not.toBeNull()
    expect(screen.getByTitle('satuan')).not.toBeNull()
    expect(screen.getByTitle('ratusan')).not.toBeNull()
  })
})

describe('VerticalMathProblem — 52 - 28', () => {
  const problem = buildProblem('subtraction', 52, 28)
  const answers = new Array<number | null>(problem.columns.length).fill(null)

  it('operator − di sebelah kanan baris kedua', () => {
    render(<VerticalMathProblem problem={problem} answers={answers} />)
    const operator = screen.getByTestId('operator-cell')
    expect(operator.textContent?.trim()).toBe('−')
    expect(operator.parentElement?.getAttribute('style')).toContain(`grid-column: ${problem.columns.length + 1}`)
  })

  it('anotasi pinjam muncul hanya setelah dijelaskan', () => {
    const { rerender } = render(<VerticalMathProblem problem={problem} answers={answers} borrowValues={[null, null]} />)
    expect(screen.queryByTestId('borrow-cell-0')).toBeNull()
    rerender(<VerticalMathProblem problem={problem} answers={answers} borrowValues={[4, 12]} />)
    expect(screen.getByTestId('borrow-cell-1').textContent).toBe('12')
    expect(screen.getByTestId('borrow-cell-0').textContent).toBe('4')
  })
})

describe('VerticalMathProblem — 1000 - 1 (borrow berantai)', () => {
  const problem = buildProblem('subtraction', 1000, 1)
  const answers = new Array<number | null>(problem.columns.length).fill(null)

  it('anotasi rantai pinjam lengkap: 10, 9, 9, 0', () => {
    render(<VerticalMathProblem problem={problem} answers={answers} borrowValues={[0, 9, 9, 10]} />)
    expect(screen.getByTestId('borrow-cell-3').textContent).toBe('10')
    expect(screen.getByTestId('borrow-cell-2').textContent).toBe('9')
    expect(screen.getByTestId('borrow-cell-1').textContent).toBe('9')
    expect(screen.getByTestId('borrow-cell-0').textContent).toBe('0')
    // Baris soal tetap utuh
    expect(rowText('first-digit')).toBe('1000')
    expect(rowText('second-digit')).toBe('1')
  })
})

describe('VerticalMathProblem — 999 + 1 (carry berantai)', () => {
  const problem = buildProblem('addition', 999, 1)
  const answers = new Array<number | null>(problem.columns.length).fill(null)

  it('empat kolom tetap sejajar dan kotak simpan tersedia di tiga kolom kiri', () => {
    render(<VerticalMathProblem problem={problem} answers={answers} />)
    expect(rowText('first-digit')).toBe('999')
    expect(rowText('second-digit')).toBe('1')
    expect(screen.queryByTestId('carry-cell-0')).not.toBeNull()
    expect(screen.queryByTestId('carry-cell-1')).not.toBeNull()
    expect(screen.queryByTestId('carry-cell-2')).not.toBeNull()
    expect(screen.queryByTestId('carry-cell-3')).toBeNull()
  })
})
