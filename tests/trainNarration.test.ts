import { describe, expect, it } from 'vitest'
import { speakablePrompt } from '../src/lib/trainNarration'
import type { TrainQuestion, TrainTopic } from '../src/lib/trainQuestionGenerator'

function mk(prompt: string, topic: TrainTopic): TrainQuestion {
  return {
    id: 'test-1',
    grade: 1,
    topic,
    prompt,
    choices: ['1', '2', '3'],
    correctIndex: 0,
    correctValue: '1',
    hintText: 'hint',
  }
}

describe('narasi prompt kereta', () => {
  it('tambah dibaca kata', () => {
    expect(speakablePrompt(mk('7 + 5', 'addition'), 'id')).toBe('7 tambah 5')
  })

  it('bagi dan banding dibaca kata', () => {
    expect(speakablePrompt(mk('36 ÷ 4', 'division'), 'id')).toBe('36 bagi 4')
    expect(speakablePrompt(mk('14 ? 4', 'comparison'), 'en')).toBe('14 compared with 4')
  })

  it('fallback saat prompt tanpa angka', () => {
    expect(speakablePrompt(mk('abc', 'addition'), 'id')).toBe('abc')
  })
})
