import { describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import QuestionDialog from '../src/components/train/QuestionDialog'
import { LanguageProvider } from '../src/i18n/LanguageContext'
import { ProgressProvider } from '../src/state/ProgressContext'
import { NavigationProvider } from '../src/state/NavigationContext'
import type { TrainQuestion } from '../src/lib/trainQuestionGenerator'

const FIXTURE: TrainQuestion = {
  id: 'kereta-test-1',
  grade: 1,
  topic: 'addition',
  prompt: '7 + 5',
  choices: ['11', '12', '13'],
  correctIndex: 1,
  correctValue: '12',
  hintText: 'Hitung dari angka besar, maju sedikit demi sedikit.',
}

function renderDialog(props: Partial<React.ComponentProps<typeof QuestionDialog>> = {}) {
  return render(
    <NavigationProvider>
      <ProgressProvider>
        <LanguageProvider>
          <QuestionDialog
            question={FIXTURE}
            round={0}
            total={5}
            attempts={0}
            showHint={false}
            feedback={null}
            disabled={false}
            onAnswer={() => {}}
            {...props}
          />
        </LanguageProvider>
      </ProgressProvider>
    </NavigationProvider>,
  )
}

describe('question dialog kereta', () => {
  it('klik jawaban memanggil onAnswer dengan indeks benar', () => {
    const onAnswer = vi.fn()
    try {
      renderDialog({ onAnswer })
      fireEvent.click(screen.getByTestId('train-choice-1'))
      expect(onAnswer).toHaveBeenCalledTimes(1)
      expect(onAnswer).toHaveBeenCalledWith(1)
    } finally {
      cleanup()
    }
  })

  it('hint dan live region tampil saat diminta', () => {
    try {
      renderDialog({
        showHint: true,
        feedback: { kind: 'wrong', text: 'Hampir benar, coba lagi.' },
      })
      expect(screen.getByText('Hitung dari angka besar, maju sedikit demi sedikit.')).toBeTruthy()
      expect(screen.getByText('Hampir benar, coba lagi.')).toBeTruthy()
      expect(screen.getByRole('dialog')).toBeTruthy()
    } finally {
      cleanup()
    }
  })
})
