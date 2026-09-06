/**
 * Render-time i18n untuk soal konsep — sejalan dengan `i18n/steps.ts`.
 * Data soal tetap murni (tanpa string UI); kalimat dihasilkan saat render
 * agar ganti bahasa ID↔EN berlaku instan.
 */
import type { ConceptQuestion, ConceptProblem } from '../types'
import type { TFunction } from './core'

export function conceptPrompt(question: ConceptQuestion, t: TFunction): string {
  switch (question.kind) {
    case 'counting':
      return t('concept.countPrompt', { icon: iconLabel(question.icon, t) })
    case 'compare':
      return t('concept.comparePrompt', { left: question.left, right: question.right })
    case 'place-value': {
      const place = question.askedPlace === 'tens' ? t('place.tens') : t('place.units')
      return t('concept.placePrompt', { number: question.number, place })
    }
  }
}

export function conceptChoices(problem: ConceptProblem, t: TFunction): string[] {
  if (problem.kind === 'compare') {
    return problem.choices.map((c) => {
      if (c === 'greater') return t('concept.choiceGreater')
      if (c === 'less') return t('concept.choiceLess')
      return t('concept.choiceEqual')
    })
  }
  return problem.choices
}

function iconLabel(icon: 'apple' | 'star' | 'dot', t: TFunction): string {
  if (icon === 'apple') return t('concept.iconApple')
  if (icon === 'star') return t('concept.iconStar')
  return t('concept.iconDot')
}
