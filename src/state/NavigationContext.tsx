import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
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

/** Navigasi tertahan karena leave-guard sedang aktif */
type PendingNavigation =
  { type: 'navigate'; screen: Screen } | { type: 'back' } | { type: 'tab'; tab: TabName }

interface NavigationContextValue {
  screen: Screen
  canBack: boolean
  navigate: (screen: Screen) => void
  back: () => void
  goToTab: (tab: TabName) => void
  /**
   * Pasang/hapus guard navigasi. Saat guard terpasang, setiap usaha navigasi
   * (navigate/back/goToTab) dibatalkan dan guard dipanggil — mis. untuk
   * menampilkan dialog konfirmasi keluar dari sesi yang belum selesai.
   * Navigasi tertahan bisa dilanjutkan via confirmPendingNavigation().
   */
  setLeaveGuard: (guard: (() => void) | null) => void
  /** Menjalankan navigasi yang tertahan dan melepas guard */
  confirmPendingNavigation: () => void
  /** Membuang navigasi tertahan tanpa berpindah layar */
  cancelPendingNavigation: () => void
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
  const leaveGuardRef = useRef<(() => void) | null>(null)
  const pendingRef = useRef<PendingNavigation | null>(null)

  const setLeaveGuard = useCallback((guard: (() => void) | null) => {
    leaveGuardRef.current = guard
    if (guard === null) pendingRef.current = null
  }, [])

  const perform = useCallback((pending: PendingNavigation) => {
    switch (pending.type) {
      case 'navigate':
        setStack((current) => [...current, pending.screen])
        break
      case 'back':
        setStack((current) => (current.length > 1 ? current.slice(0, -1) : current))
        break
      case 'tab':
        setStack((current) => {
          const target = TAB_SCREENS[pending.tab]
          const currentTabScreen = current[0]
          if (currentTabScreen.name === pending.tab) {
            return current.length > 1 ? [currentTabScreen] : current
          }
          return [TAB_SCREENS.home, target]
        })
        break
    }
  }, [])

  const navigate = useCallback((screen: Screen) => {
    const guard = leaveGuardRef.current
    if (guard) {
      pendingRef.current = { type: 'navigate', screen }
      guard()
      return
    }
    setStack((current) => [...current, screen])
  }, [])

  const back = useCallback(() => {
    const guard = leaveGuardRef.current
    if (guard) {
      pendingRef.current = { type: 'back' }
      guard()
      return
    }
    setStack((current) => (current.length > 1 ? current.slice(0, -1) : current))
  }, [])

  const goToTab = useCallback((tab: TabName) => {
    const guard = leaveGuardRef.current
    if (guard) {
      pendingRef.current = { type: 'tab', tab }
      guard()
      return
    }
    setStack((current) => {
      const target = TAB_SCREENS[tab]
      const currentTabScreen = current[0]
      if (currentTabScreen.name === tab) {
        return current.length > 1 ? [currentTabScreen] : current
      }
      return [TAB_SCREENS.home, target]
    })
  }, [])

  const confirmPendingNavigation = useCallback(() => {
    const pending = pendingRef.current
    leaveGuardRef.current = null
    pendingRef.current = null
    if (pending) perform(pending)
  }, [perform])

  const cancelPendingNavigation = useCallback(() => {
    pendingRef.current = null
  }, [])

  const value = useMemo<NavigationContextValue>(() => {
    const screen = stack[stack.length - 1]
    return {
      screen,
      canBack: stack.length > 1,
      navigate,
      back,
      goToTab,
      setLeaveGuard,
      confirmPendingNavigation,
      cancelPendingNavigation,
    }
  }, [
    stack,
    navigate,
    back,
    goToTab,
    setLeaveGuard,
    confirmPendingNavigation,
    cancelPendingNavigation,
  ])

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation harus dipakai di dalam NavigationProvider')
  }
  return context
}
