/**
 * Narasi kereta — ubah prompt simbolik menjadi kalimat yang enak dibaca TTS.
 * Pure function, tanpa react/three.
 */
import type { TrainQuestion } from './trainQuestionGenerator'

const OP_WORDS: Record<'id' | 'en', Record<TrainQuestion['topic'], string>> = {
  id: {
    addition: 'tambah',
    subtraction: 'kurang',
    multiplication: 'kali',
    division: 'bagi',
    comparison: 'dibandingkan dengan',
  },
  en: {
    addition: 'plus',
    subtraction: 'minus',
    multiplication: 'times',
    division: 'divided by',
    comparison: 'compared with',
  },
}

export function speakablePrompt(question: TrainQuestion, lang: 'id' | 'en'): string {
  const nums = question.prompt
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map(Number)
  if (nums.length < 2 || !Number.isFinite(nums[0]) || !Number.isFinite(nums[1])) {
    return question.prompt
  }
  return `${nums[0]} ${OP_WORDS[lang][question.topic]} ${nums[1]}`
}

export const _narrationHelpers = { OP_WORDS }
