import { useNavigation } from '../../state/NavigationContext'
import { useProgress } from '../../state/ProgressContext'
import { setSoundEnabled } from '../../lib/sound'
import Logo from './Logo'

const NAV_ITEMS = [
  { tab: 'home', label: 'Beranda', icon: '🏠' },
  { tab: 'levels', label: 'Belajar', icon: '📚' },
  { tab: 'practice', label: 'Latihan', icon: '✏️' },
  { tab: 'achievements', label: 'Pencapaian', icon: '🏆' },
] as const

export default function AppHeader() {
  const { screen, canBack, back, goToTab } = useNavigation()
  const { progress, setPreferences } = useProgress()

  const currentTab =
    screen.name === 'home'
      ? 'home'
      : screen.name === 'levels' || screen.name === 'learn'
        ? 'levels'
        : screen.name === 'practice' || screen.name === 'result'
          ? 'practice'
          : screen.name === 'achievements'
            ? 'achievements'
            : null

  const toggleSound = () => {
    const next = !progress.soundEnabled
    setSoundEnabled(next)
    setPreferences({ soundEnabled: next })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-3">
        {canBack ? (
          <button
            type="button"
            onClick={back}
            aria-label="Kembali"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-bold text-slate-600 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            ←
          </button>
        ) : (
          <span className="w-2" aria-hidden="true" />
        )}
        <p className="flex items-center gap-1.5 text-lg font-black tracking-tight text-sky-700">
          <Logo size={26} className="drop-shadow-sm" />
          Asharu Math
        </p>
        <nav aria-label="Navigasi utama" className="ml-auto hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.tab}
              type="button"
              onClick={() => goToTab(item.tab)}
              aria-current={currentTab === item.tab ? 'page' : undefined}
              className={`flex h-11 items-center gap-1 rounded-full px-3 text-sm font-bold ${
                currentTab === item.tab
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-slate-600 hover:bg-sky-50'
              } focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300`}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={progress.soundEnabled}
            aria-label={progress.soundEnabled ? 'Matikan suara' : 'Nyalakan suara'}
            className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-slate-600 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            {progress.soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    </header>
  )
}
