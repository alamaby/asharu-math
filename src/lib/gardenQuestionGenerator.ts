import type { MathProblem } from '../types'
import { buildProblem, generateProblem } from './problemGenerator'
import type { GeneratorSettings } from '../types'

export type GardenLevelId = 'kebun-1' | 'kebun-2' | 'kebun-3' | 'kebun-4'

export interface GardenGeneratorOptions {
  levelId: GardenLevelId
  previous?: MathProblem | null
}

function gardenSettingsFor(levelId: GardenLevelId): GeneratorSettings {
  switch (levelId) {
    case 'kebun-1':
      return { operation: 'addition', digitCount: 2, carryMode: 'none', questionCount: 1 }
    case 'kebun-2':
      return { operation: 'addition', digitCount: 2, carryMode: 'required', questionCount: 1 }
    case 'kebun-3':
      return { operation: 'subtraction', digitCount: 2, carryMode: 'none', questionCount: 1 }
    case 'kebun-4':
      return { operation: 'subtraction', digitCount: 2, carryMode: 'required', questionCount: 1 }
  }
}

export function generateGardenProblem(options: GardenGeneratorOptions): MathProblem {
  const settings = gardenSettingsFor(options.levelId)
  return generateProblem(settings, options.previous ?? null)
}

/** Dinamis — bangun sesi 5 soal untuk level kebun */
export function generateGardenSession(levelId: GardenLevelId, count = 5): MathProblem[] {
  const problems: MathProblem[] = []
  let previous: MathProblem | null = null
  for (let i = 0; i < count; i++) {
    const p = generateGardenProblem({ levelId, previous })
    problems.push(p)
    previous = p
  }
  return problems
}

/** Helper deterministik untuk test/E2E (tidak hardcode di runtime) */
export function buildGardenFixture(
  operation: 'addition' | 'subtraction',
  first: number,
  second: number,
): MathProblem {
  return buildProblem(operation, first, second)
}
