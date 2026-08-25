import en from './dicts/en'
import id, { type Dict } from './dicts/id'
import type { Language } from './types'

export type TranslationKey = keyof Dict

type RestParams<K extends TranslationKey> = Dict[K] extends string
  ? []
  : Dict[K] extends (params: infer P) => string
    ? [params: P]
    : []

export interface TFunction {
  <K extends TranslationKey>(key: K, ...rest: RestParams<K>): string
}

const DICTIONARIES: Record<Language, Dict> = { id, en }

/** Membuat fungsi terjemahan murni untuk satu bahasa (dipakai juga oleh lib & test). */
export function createT(lang: Language): TFunction {
  const dict = DICTIONARIES[lang]
  return ((key: TranslationKey, params?: Record<string, unknown>): string => {
    const entry = dict[key] as string | ((p: Record<string, unknown>) => string)
    return typeof entry === 'function' ? entry(params ?? {}) : (entry as string)
  }) as TFunction
}
