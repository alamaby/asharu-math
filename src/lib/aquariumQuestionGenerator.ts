import type { MathProblem, GeneratorSettings } from '../types'
import { buildProblem, generateProblem } from './problemGenerator'

export type AquariumLevelId = 'akuarium-1' | 'akuarium-2' | 'akuarium-3' | 'akuarium-4'

export interface AquariumGeneratorOptions {
  levelId: AquariumLevelId
  previous?: MathProblem | null
}

function aquariumSettingsFor(levelId: AquariumLevelId): GeneratorSettings {
  switch (levelId) {
    case 'akuarium-1':
      return { operation: 'addition', digitCount: 2, carryMode: 'none', questionCount: 1 }
    case 'akuarium-2':
      return { operation: 'addition', digitCount: 2, carryMode: 'required', questionCount: 1 }
    case 'akuarium-3':
      return { operation: 'subtraction', digitCount: 2, carryMode: 'none', questionCount: 1 }
    case 'akuarium-4':
      return { operation: 'subtraction', digitCount: 2, carryMode: 'required', questionCount: 1 }
  }
}

export function generateAquariumProblem(options: AquariumGeneratorOptions): MathProblem {
  const settings = aquariumSettingsFor(options.levelId)
  return generateProblem(settings, options.previous ?? null)
}

export function generateAquariumSession(levelId: AquariumLevelId, count = 5): MathProblem[] {
  const problems: MathProblem[] = []
  let previous: MathProblem | null = null
  for (let i = 0; i < count; i++) {
    const p = generateAquariumProblem({ levelId, previous })
    problems.push(p)
    previous = p
  }
  return problems
}

export function buildAquariumFixture(
  operation: 'addition' | 'subtraction',
  first: number,
  second: number,
): MathProblem {
  return buildProblem(operation, first, second)
}

export function aquariumSettingsForLevel(levelId: AquariumLevelId): GeneratorSettings {
  return aquariumSettingsFor(levelId)
}
