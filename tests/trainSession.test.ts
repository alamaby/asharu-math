import { describe, expect, it } from 'vitest'
import { generateTrainSession } from '../src/lib/trainQuestionGenerator'
import { sumTrainStars } from '../src/lib/trainStars'
import { transitionTrain } from '../src/lib/trainStateMachine'

describe('train session integration (pure)', () => {
  it('sesi K2 lima soal + bintang + transisi dasar', () => {
    const session = generateTrainSession(2, 5)
    expect(session).toHaveLength(5)
    expect(sumTrainStars([1, 1, 1, 1, 1])).toBe(15)
    expect(transitionTrain('LOADING', 'LOAD_OK')).toBe('MENU')
    expect(transitionTrain('ROUND_COMPLETE', 'FINISH')).toBe('SESSION_COMPLETE')
  })
})
