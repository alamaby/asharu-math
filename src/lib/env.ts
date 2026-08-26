/** Validasi environment variable — prinsip: gagal senyap ke "tidak aktif", bukan crash.
 *  Pembacaan dilakukan lazy (per pemanggilan) agar mudah diuji dan tetap benar saat HMR. */

const CLIENT_PATTERN = /^ca-pub-\d{10,}$/
const SLOT_PATTERN = /^\d{8,12}$/

export type AdPlacement = 'home' | 'levels' | 'achievements' | 'result'

export interface AdsenseConfig {
  client: string
  slots: Partial<Record<AdPlacement, string>>
}

function readEnv(key: string): string | undefined {
  const raw = import.meta.env[key]
  return typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : undefined
}

function readAdsenseConfig(): AdsenseConfig | null {
  const client = readEnv('VITE_ADSENSE_CLIENT')
  if (!client || !CLIENT_PATTERN.test(client)) return null

  const slots: AdsenseConfig['slots'] = {}
  for (const placement of ['home', 'levels', 'achievements', 'result'] as const) {
    const slot = readEnv(`VITE_ADSENSE_SLOT_${placement.toUpperCase()}`)
    if (slot && SLOT_PATTERN.test(slot)) {
      slots[placement] = slot
    }
  }
  return { client, slots }
}

/** true bila VITE_ADSENSE_CLIENT valid; tanpa ini semua slot iklan no-op. */
export function isAdsenseEnabled(): boolean {
  return readAdsenseConfig() !== null
}

/** ID slot per penempatan; penempatan tanpa slot env tidak dirender. */
export function getSlotId(placement: AdPlacement): string | null {
  return readAdsenseConfig()?.slots[placement] ?? null
}

export function getClientId(): string | null {
  return readAdsenseConfig()?.client ?? null
}

/** Diekspor untuk test unit pola validasi. */
export function isValidClient(value: unknown): boolean {
  return typeof value === 'string' && CLIENT_PATTERN.test(value)
}
