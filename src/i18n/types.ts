export type Language = 'id' | 'en'

/** Pasangan teks untuk data domain (level, pencapaian) yang hidup berdampingan dengan entitasnya */
export interface LocalizedText {
  id: string
  en: string
}

export const LANGUAGES: readonly { value: Language; label: string }[] = [
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'en', label: 'English' },
]
