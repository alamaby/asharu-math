import { describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import TrainFallback2D from '../src/components/train/TrainFallback2D'
import { LanguageProvider } from '../src/i18n/LanguageContext'
import { ProgressProvider } from '../src/state/ProgressContext'
import { NavigationProvider } from '../src/state/NavigationContext'

function renderFallback(props: {
  paused: boolean
  onReachJunction: () => void
  onReachStation: () => void
}) {
  return render(
    <NavigationProvider>
      <ProgressProvider>
        <LanguageProvider>
          <TrainFallback2D {...props} />
        </LanguageProvider>
      </ProgressProvider>
    </NavigationProvider>,
  )
}

describe('train fallback 2D', () => {
  it('tombol memanggil callback percabangan dan stasiun', () => {
    const onJunction = vi.fn()
    const onStation = vi.fn()
    try {
      renderFallback({ paused: false, onReachJunction: onJunction, onReachStation: onStation })
      expect(screen.getByRole('alert')).toBeTruthy()
      fireEvent.click(screen.getByRole('button', { name: /percabangan/i }))
      expect(onJunction).toHaveBeenCalledTimes(1)
      fireEvent.click(screen.getByRole('button', { name: /stasiun/i }))
      expect(onStation).toHaveBeenCalledTimes(1)
    } finally {
      cleanup()
    }
  })
})
