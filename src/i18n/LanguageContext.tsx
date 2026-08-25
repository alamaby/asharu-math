import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useProgress } from '../state/ProgressContext'
import { createT } from './core'
import type { Language } from './types'

type LanguageContextValue = {
  lang: Language
  setLanguage: (language: Language) => void
  t: ReturnType<typeof createT>
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

/**
 * Sumber kebenaran bahasa adalah `progress.language` (tersimpan di localStorage).
 * Mengganti bahasa lewat setPreferences sehingga langsung berlaku di seluruh UI
 * dan tersimpan permanen.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { progress, setPreferences } = useProgress()
  const lang: Language = progress.language ?? 'id'

  useEffect(() => {
    document.documentElement.lang = lang === 'id' ? 'id' : 'en'
  }, [lang])

  const setLanguage = useCallback(
    (language: Language) => {
      setPreferences({ language })
    },
    [setPreferences],
  )

  const value = useMemo(() => ({ lang, setLanguage, t: createT(lang) }), [lang, setLanguage])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useI18n(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useI18n harus dipakai di dalam LanguageProvider')
  }
  return context
}
