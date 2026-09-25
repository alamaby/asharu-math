import { describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import TrainMenu from '../src/components/train/TrainMenu'
import { LanguageProvider } from '../src/i18n/LanguageContext'
import { ProgressProvider } from '../src/state/ProgressContext'
import { NavigationProvider } from '../src/state/NavigationContext'

function renderMenu(props: Partial<React.ComponentProps<typeof TrainMenu>> = {}) {
  return render(
    <NavigationProvider>
      <ProgressProvider>
        <LanguageProvider>
          <TrainMenu onStart={() => {}} bestStarsByGrade={{}} {...props} />
        </LanguageProvider>
      </ProgressProvider>
    </NavigationProvider>,
  )
}

describe('train menu resume', () => {
  it('tombol lanjutkan tampil saat resumeInfo ada', () => {
    try {
      renderMenu({
        resumeInfo: { grade: 2, round: 2, total: 5 },
        onResume: () => {},
      })
      expect(screen.getByRole('button', { name: /Lanjutkan perjalanan/ })).toBeTruthy()
      expect(screen.getByText(/menghapus sesi tersimpan/)).toBeTruthy()
    } finally {
      cleanup()
    }
  })

  it('tanpa resumeInfo tidak ada tombol lanjutkan', () => {
    try {
      renderMenu()
      expect(screen.queryByRole('button', { name: /Lanjutkan perjalanan/ })).toBeNull()
    } finally {
      cleanup()
    }
  })
})
