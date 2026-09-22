import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import StackedPlaceValueBoard from '../src/components/math/StackedPlaceValueBoard'
import { AllProviders } from './helpers/renderWithProviders'
import { buildProblem } from '../src/lib/problemGenerator'

afterEach(cleanup)

describe('StackedPlaceValueBoard — grid sejajar', () => {
  it('2-digit 23+22: operator di kolom 3, jawaban P=1 S=2', () => {
    const problem = buildProblem('addition', 23, 22)
    render(
      <AllProviders>
        <StackedPlaceValueBoard
          problem={problem}
          answers={[null, null]}
          activeColumn="ones"
          carryValues={[null, null]}
          borrowValues={[null, null]}
          highlightColumn="ones"
          wrongColumns={[false, false]}
          tone="sky"
          onSelectColumn={() => {}}
        />
      </AllProviders>,
    )
    expect(screen.getByTestId('stacked-operator')).not.toBeNull()
    expect(screen.getByTestId('stacked-answer-tens')).not.toBeNull()
    expect(screen.getByTestId('stacked-answer-ones')).not.toBeNull()
    const tens = screen.getByTestId('stacked-answer-tens')
    const ones = screen.getByTestId('stacked-answer-ones')
    const op = screen.getByTestId('stacked-operator')
    expect(tens.parentElement?.getAttribute('style')).toContain('grid-column: 1')
    expect(ones.parentElement?.getAttribute('style')).toContain('grid-column: 2')
    expect(op.parentElement?.getAttribute('style')).toContain('grid-column: 3')
  })

  it('3-digit 245+138: hundreds di kolom 1', () => {
    const problem = buildProblem('addition', 245, 138)
    render(
      <AllProviders>
        <StackedPlaceValueBoard
          problem={problem}
          answers={[null, null, null]}
          activeColumn="ones"
          carryValues={[null, null, null]}
          borrowValues={[null, null, null]}
          highlightColumn="ones"
          wrongColumns={[false, false, false]}
          tone="emerald"
          onSelectColumn={() => {}}
        />
      </AllProviders>,
    )
    const hundreds = screen.getByTestId('stacked-answer-hundreds')
    expect(hundreds.parentElement?.getAttribute('style')).toContain('grid-column: 1')
  })

  it('semua kotak jawaban h-11 w-11 tanpa min-w-11', () => {
    const problem = buildProblem('addition', 245, 138)
    const onSelect = vi.fn()
    render(
      <AllProviders>
        <StackedPlaceValueBoard
          problem={problem}
          answers={[null, null, null]}
          activeColumn="ones"
          carryValues={[null, null, null]}
          borrowValues={[null, null, null]}
          highlightColumn={null}
          wrongColumns={[false, false, false]}
          tone="sky"
          onSelectColumn={onSelect}
        />
      </AllProviders>,
    )
    for (const id of ['stacked-answer-hundreds', 'stacked-answer-tens', 'stacked-answer-ones']) {
      const el = screen.getByTestId(id)
      expect(el.className).toContain('h-11')
      expect(el.className).toContain('w-11')
      expect(el.className).not.toContain('min-w-11')
    }
  })
})
