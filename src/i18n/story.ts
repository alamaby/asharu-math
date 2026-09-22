/**
 * Render-time i18n untuk soal cerita — sejalan dengan `i18n/concept.ts`.
 * Data stem tetap murni; kalimat narasi + prompt part dihasilkan saat render.
 */
import type { StoryFamily, StoryItem, StoryPart } from '../types'
import type { TFunction } from './core'

export function storyItemLabel(item: StoryItem, t: TFunction): string {
  return t(`story.item-${item}` as never)
}

export function storyStem(
  family: StoryFamily,
  params: Record<string, string | number>,
  t: TFunction,
): string {
  const p = params as Record<string, unknown>
  switch (family) {
    case 'f0-add':
      return t('story.stem-f0-add', {
        name: String(p.name ?? ''),
        item: storyItemLabel((p.item ?? 'marbles') as StoryItem, t),
        a: Number(p.a ?? 0),
        b: Number(p.b ?? 0),
      })
    case 'f0-sub':
      return t('story.stem-f0-sub', {
        name: String(p.name ?? ''),
        item: storyItemLabel((p.item ?? 'marbles') as StoryItem, t),
        a: Number(p.a ?? 0),
        b: Number(p.b ?? 0),
      })
    case 'f1-diff':
      return t('story.stem-f1-diff', {
        nameA: String(p.nameA ?? ''),
        nameB: String(p.nameB ?? ''),
        item: storyItemLabel((p.item ?? 'marbles') as StoryItem, t),
        x: Number(p.x ?? 0),
        y: Number(p.y ?? 0),
      })
    case 'f2-transfer': {
      const kind = String(p.kind ?? 'color') as 'color' | 'size'
      const base = {
        nameA: String(p.nameA ?? ''),
        nameB: String(p.nameB ?? ''),
        item: storyItemLabel((p.item ?? 'apples') as StoryItem, t),
        x: Number(p.x ?? 0),
        p: Number(p.p ?? 0),
        q: Number(p.q ?? 0),
        r: Number(p.r ?? 0),
        s: Number(p.s ?? 0),
      }
      return kind === 'size' ? t('story.stem-f2-transfer-size', base) : t('story.stem-f2-transfer-color', base)
    }
    case 'f3-chain':
      return t('story.stem-f3-chain', {
        nameA: String(p.nameA ?? ''),
        nameB: String(p.nameB ?? ''),
        nameC: String(p.nameC ?? ''),
        item: storyItemLabel((p.item ?? 'books') as StoryItem, t),
        m: Number(p.m ?? 0),
        n: Number(p.n ?? 0),
      })
    case 'f4-join3':
      return t('story.stem-f4-join3', {
        nameA: String(p.nameA ?? ''),
        nameB: String(p.nameB ?? ''),
        nameC: String(p.nameC ?? ''),
        item: storyItemLabel((p.item ?? 'marbles') as StoryItem, t),
        x: Number(p.x ?? 0),
        y: Number(p.y ?? 0),
        z: Number(p.z ?? 0),
      })
    case 'f5-tiered':
      return t('story.stem-f5-tiered', {
        nameA: String(p.nameA ?? ''),
        nameB: String(p.nameB ?? ''),
        item: storyItemLabel((p.item ?? 'marbles') as StoryItem, t),
        x: Number(p.x ?? 0),
        y: Number(p.y ?? 0),
        z: Number(p.z ?? 0),
      })
    default:
      throw new Error('story family tak dikenal')
  }
}

export function storyPartPrompt(part: StoryPart, t: TFunction): string {
  if (part.totalParts <= 1) {
    return storyStem(part.family, part.stemParams, t)
  }
  if (part.partIndex >= part.totalParts) {
    const last = part.partIndex - 1
    return t('story.partOf', { current: last + 1, total: part.totalParts })
  }
  const p = part.stemParams as Record<string, unknown>
  switch (part.family) {
    case 'f0-add':
    case 'f0-sub':
      return storyStem(part.family, part.stemParams, t)
    case 'f1-diff':
      if (part.partIndex === 0) {
        return t('story.part-f1-b', {
          nameB: String(p.nameB ?? ''),
          item: storyItemLabel((p.item ?? 'marbles') as StoryItem, t),
        })
      }
      return t('story.part-f1-total', {
        nameA: String(p.nameA ?? ''),
        nameB: String(p.nameB ?? ''),
        item: storyItemLabel((p.item ?? 'marbles') as StoryItem, t),
      })
    case 'f2-transfer':
      if (part.partIndex === 0) {
        return t('story.part-f2-p-r', {
          nameA: String(p.nameA ?? ''),
          item: storyItemLabel((p.item ?? 'apples') as StoryItem, t),
        })
      }
      if (part.partIndex === 1) {
        return t('story.part-f2-x-r', {
          nameA: String(p.nameA ?? ''),
          item: storyItemLabel((p.item ?? 'apples') as StoryItem, t),
        })
      }
      return t('story.part-f2-s+r', {
        nameB: String(p.nameB ?? ''),
        item: storyItemLabel((p.item ?? 'apples') as StoryItem, t),
      })
    case 'f3-chain':
      if (part.partIndex === 0) {
        return t('story.part-f3-b', {
          nameB: String(p.nameB ?? ''),
          item: storyItemLabel((p.item ?? 'books') as StoryItem, t),
        })
      }
      if (part.partIndex === 1) {
        return t('story.part-f3-a', {
          nameA: String(p.nameA ?? ''),
          item: storyItemLabel((p.item ?? 'books') as StoryItem, t),
        })
      }
      return t('story.part-f3-total', {
        nameA: String(p.nameA ?? ''),
        nameB: String(p.nameB ?? ''),
        nameC: String(p.nameC ?? ''),
        item: storyItemLabel((p.item ?? 'books') as StoryItem, t),
      })
    case 'f4-join3':
      if (part.partIndex === 0) {
        return t('story.part-f4-total3', {
          nameA: String(p.nameA ?? ''),
          nameB: String(p.nameB ?? ''),
          nameC: String(p.nameC ?? ''),
          item: storyItemLabel((p.item ?? 'marbles') as StoryItem, t),
        })
      }
      return t('story.part-f4-totalAC', {
        nameA: String(p.nameA ?? ''),
        nameC: String(p.nameC ?? ''),
        item: storyItemLabel((p.item ?? 'marbles') as StoryItem, t),
      })
    case 'f5-tiered':
      if (part.partIndex === 0) {
        return t('story.part-f5-rest', {
          nameA: String(p.nameA ?? ''),
          item: storyItemLabel((p.item ?? 'marbles') as StoryItem, t),
        })
      }
      return t('story.part-f5-final', {
        nameA: String(p.nameA ?? ''),
        item: storyItemLabel((p.item ?? 'marbles') as StoryItem, t),
      })
    default:
      return storyStem(part.family, part.stemParams, t)
  }
}
