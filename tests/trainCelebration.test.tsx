import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import TrainCelebration from '../src/components/train/TrainCelebration'

describe('train celebration', () => {
  it('null saat show false', () => {
    const { container } = render(<TrainCelebration show={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('24 span dengan aria-hidden saat show', () => {
    const { container } = render(<TrainCelebration show />)
    const wrap = container.querySelector('.train-confetti')
    expect(wrap?.getAttribute('aria-hidden')).toBe('true')
    expect(container.querySelectorAll('.train-confetti span')).toHaveLength(24)
  })

  it('tone farm tetap 24 span', () => {
    const { container } = render(<TrainCelebration show tone="farm" />)
    const wrap = container.querySelector('.train-confetti')
    expect(wrap?.getAttribute('aria-hidden')).toBe('true')
    expect(container.querySelectorAll('.train-confetti span')).toHaveLength(24)
  })
})
