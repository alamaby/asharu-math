import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { LanguageProvider } from '../../src/i18n/LanguageContext'
import { NavigationProvider, useNavigation } from '../../src/state/NavigationContext'
import { ProgressProvider } from '../../src/state/ProgressContext'

/** Menampilkan nama layar aktif agar navigasi bisa diaudit dari luar layar */
function ScreenProbe() {
  const { screen, canBack } = useNavigation()
  return (
    <div>
      <span data-testid="probe-screen">{screen.name}</span>
      <span data-testid="probe-can-back">{String(canBack)}</span>
    </div>
  )
}

export function AllProviders({ children }: { children: ReactElement | ReactElement[] }) {
  return (
    <NavigationProvider>
      <ProgressProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </ProgressProvider>
    </NavigationProvider>
  )
}

export function renderScreenWithProviders(ui: ReactElement) {
  return render(
    <AllProviders>
      {ui}
      <ScreenProbe />
    </AllProviders>,
  )
}
