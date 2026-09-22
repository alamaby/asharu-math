import type { MathProblem } from '../../types'
import StackedPlaceValueBoard from '../math/StackedPlaceValueBoard'

type Props = {
  problem: MathProblem
  onesAnswer: number | null
  tensAnswer: number | null
  activeColumn: 'ones' | 'tens' | null
  carryShown: boolean
  borrowShown: boolean
  highlightColumn?: 'ones' | 'tens' | null
  onSelectOnes?: () => void
  onSelectTens?: () => void
  wrongOnes?: boolean
  wrongTens?: boolean
}

export default function StackedOperationBoard({
  problem,
  onesAnswer,
  tensAnswer,
  activeColumn,
  carryShown,
  borrowShown,
  highlightColumn,
  onSelectOnes,
  onSelectTens,
  wrongOnes,
  wrongTens,
}: Props) {
  if (problem.columns.length !== 2) {
    throw new Error('StackedOperationBoard hanya untuk 2-digit, gunakan StackedPlaceValueBoard')
  }
  return (
    <StackedPlaceValueBoard
      problem={problem}
      answers={[tensAnswer, onesAnswer]}
      activeColumn={activeColumn}
      carryValues={[carryShown ? 1 : null, null]}
      borrowValues={[
        borrowShown ? Number(problem.firstOperandText[0]) - 1 : null,
        borrowShown ? Number(problem.firstOperandText.slice(-1)) + 10 : null,
      ]}
      highlightColumn={highlightColumn ?? null}
      wrongColumns={[wrongTens ?? false, wrongOnes ?? false]}
      tone="sky"
      onSelectColumn={(c) => {
        if (c === 'tens') onSelectTens?.()
        else if (c === 'ones') onSelectOnes?.()
      }}
    />
  )
}
