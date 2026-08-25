import { useI18n } from '../../i18n/LanguageContext'
import { useNavigation, type TabName } from '../../state/NavigationContext'

const TABS: readonly {
  tab: TabName
  labelKey: 'tab.home' | 'tab.levels' | 'tab.practice' | 'tab.achievements'
  icon: string
}[] = [
  { tab: 'home', labelKey: 'tab.home', icon: '🏠' },
  { tab: 'levels', labelKey: 'tab.levels', icon: '📚' },
  { tab: 'practice', labelKey: 'tab.practice', icon: '✏️' },
  { tab: 'achievements', labelKey: 'tab.achievements', icon: '🏆' },
]

export default function BottomNavigation() {
  const { screen, goToTab } = useNavigation()
  const { t } = useI18n()

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
      aria-label={t('nav.bottomAria')}
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
          {t(item.labelKey)}
        </button>
      ))}
    </nav>
  )
}
