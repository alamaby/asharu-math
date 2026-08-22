import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { GeneratorSettings, MathProblem, SessionStats, SessionSummary } from '../types'

export type Screen =
  | { name: 'home' }
  | { name: 'levels' }
  | {
      name: 'learn'
      levelId: string | null
      problems?: MathProblem[]
      initialStats?: SessionStats
      title?: string
    }
  | { name: 'practice'; settings?: GeneratorSettings }
  | { name: 'result'; summary: SessionSummary }
  | { name: 'achievements' }
  | { name: 'settings' }

export type TabName = 'home' | 'levels' | 'practice' | 'achievements'

interface NavigationContextValue {
  screen: Screen
  canBack: boolean
  navigate: (screen: Screen) => void
  back: () => void
  goToTab: (tab: TabName) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

const TAB_SCREENS: Record<TabName, Screen> = {
  home: { name: 'home' },
  levels: { name: 'levels' },
  practice: { name: 'practice' },
  achievements: { name: 'achievements' },
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Screen[]>([{ name: 'home' }])

  const navigate = useCallback((screen: Screen) => {
    setStack((current) => [...current, screen])
  }, [])

  const back = useCallback(() => {
    setStack((current) => (current.length > 1 ? current.slice(0, -1) : current))
  }, [])

  const goToTab = useCallback((tab: TabName) => {
    setStack((current) => {
      const target = TAB_SCREENS[tab]
      const currentTabScreen = current[0]
      if (currentTabScreen.name === tab) {
        return current.length > 1 ? [currentTabScreen] : current
      }
      return [TAB_SCREENS.home, target]
    })
  }, [])

  const value = useMemo<NavigationContextValue>(() => {
    const screen = stack[stack.length - 1]
    return { screen, canBack: stack.length > 1, navigate, back, goToTab }
  }, [stack, navigate, back, goToTab])

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation harus dipakai di dalam NavigationProvider')
  }
  return context
}
