import { useNavigation } from '../../state/NavigationContext'

const TABS = [
  { tab: 'home', label: 'Beranda', icon: '🏠' },
  { tab: 'levels', label: 'Belajar', icon: '📚' },
  { tab: 'practice', label: 'Latihan', icon: '✏️' },
  { tab: 'achievements', label: 'Pencapaian', icon: '🏆' },
] as const

export default function BottomNavigation() {
  const { screen, goToTab } = useNavigation()

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

  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-sky-100 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {TABS.map((item) => (
        <button
          key={item.tab}
          type="button"
          onClick={() => goToTab(item.tab)}
          aria-current={currentTab === item.tab ? 'page' : undefined}
          className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-bold ${
            currentTab === item.tab ? 'text-sky-600' : 'text-slate-500'
          } focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-300`}
        >
          <span aria-hidden="true" className="text-xl leading-none">
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </nav>
  )
}
