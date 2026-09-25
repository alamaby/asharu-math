/**
 * Variant kereta — generator deterministik (seed) untuk bentuk & warna
 * lokomotif dan gerbong. Pure, tanpa react/three.
 */

export type LocoShape = 'classic' | 'diesel' | 'tank'
export type WagonKind = 'boxcar' | 'tanker' | 'flatbed'

export interface TrainVariantWagon {
  kind: WagonKind
  color: string
}

export interface TrainVariant {
  loco: LocoShape
  locoColor: string
  wagons: TrainVariantWagon[]
}

const LOCO_SHAPES: readonly LocoShape[] = ['classic', 'diesel', 'tank']
const WAGON_KINDS: readonly WagonKind[] = ['boxcar', 'tanker', 'flatbed']
const LOCO_COLORS: readonly string[] = ['#e05555', '#3f9e5a', '#3b82f6', '#8b5cf6', '#f59e0b']
const WAGON_COLORS: readonly string[] = ['#f5b942', '#e2e8f0', '#a3e635', '#f472b6', '#60a5fa']

/** PRNG deterministik (mulberry32) — seed sama selalu menghasilkan urutan sama. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randInt(rng: () => number, maxExclusive: number): number {
  return Math.floor(rng() * maxExclusive)
}

export function pickTrainVariant(seed?: number): TrainVariant {
  const effectiveSeed = seed === undefined ? Math.floor(Math.random() * 2 ** 32) : seed
  const rng = mulberry32(effectiveSeed)
  const loco = LOCO_SHAPES[randInt(rng, LOCO_SHAPES.length)]!
  const locoColor = LOCO_COLORS[randInt(rng, LOCO_COLORS.length)]!
  const wagonCount = 1 + randInt(rng, 2)
  const wagons: TrainVariantWagon[] = []
  for (let i = 0; i < wagonCount; i++) {
    let kind = WAGON_KINDS[randInt(rng, WAGON_KINDS.length)]!
    if (i === 1 && kind === wagons[0]!.kind) {
      kind = WAGON_KINDS[(WAGON_KINDS.indexOf(kind) + 1) % WAGON_KINDS.length]!
    }
    const color = WAGON_COLORS[randInt(rng, WAGON_COLORS.length)]!
    wagons.push({ kind, color })
  }
  return { loco, locoColor, wagons }
}

function isHexColor(value: unknown): boolean {
  return typeof value === 'string' && value.startsWith('#') && value.length >= 4
}

export function isValidTrainVariant(v: unknown): boolean {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false
  const rec = v as Record<string, unknown>
  if (typeof rec.loco !== 'string' || !LOCO_SHAPES.includes(rec.loco as LocoShape)) return false
  if (!isHexColor(rec.locoColor)) return false
  if (!Array.isArray(rec.wagons) || rec.wagons.length < 1 || rec.wagons.length > 2) return false
  for (const w of rec.wagons) {
    if (typeof w !== 'object' || w === null) return false
    const wr = w as Record<string, unknown>
    if (typeof wr.kind !== 'string' || !WAGON_KINDS.includes(wr.kind as WagonKind)) return false
    if (!isHexColor(wr.color)) return false
  }
  return true
}

export const _variantHelpers = {
  LOCO_SHAPES,
  WAGON_KINDS,
  LOCO_COLORS,
  WAGON_COLORS,
}
