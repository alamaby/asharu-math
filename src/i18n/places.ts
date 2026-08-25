import { useI18n } from './LanguageContext'
import type { Language } from './types'
import type { PlaceValue } from '../types'

const PLACE_KEYS = {
  units: 'place.units',
  tens: 'place.tens',
  hundreds: 'place.hundreds',
  thousands: 'place.thousands',
} as const

const SHORT_LABELS: Record<Language, Record<PlaceValue, string>> = {
  id: { units: 'S', tens: 'P', hundreds: 'R', thousands: 'Rb' },
  en: { units: 'O', tens: 'T', hundreds: 'H', thousands: 'Th' },
}

/** Label nilai tempat terlokalkan untuk komponen grid soal. */
export function usePlaceLabels() {
  const { lang, t } = useI18n()
  return {
    long: (place: PlaceValue): string => t(PLACE_KEYS[place]),
    short: (place: PlaceValue): string => SHORT_LABELS[lang][place],
  }
}
