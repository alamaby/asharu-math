import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createT } from '../src/i18n/core'
import { useI18n } from '../src/i18n/LanguageContext'
import { stepInstruction } from '../src/i18n/steps'
import en from '../src/i18n/dicts/en'
import idDict from '../src/i18n/dicts/id'
import { defaultProgress, STORAGE_KEY } from '../src/lib/storage'
import { buildProblem } from '../src/lib/problemGenerator'
import VerticalMathProblem from '../src/components/math/VerticalMathProblem'
import { AllProviders } from './helpers/renderWithProviders'

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(cleanup)

describe('kamus bilingual', () => {
  it('en memiliki key-set yang persis sama dengan id', () => {
    const idKeys = Object.keys(idDict).sort()
    const enKeys = Object.keys(en).sort() as unknown as string[]
    expect(enKeys).toEqual(idKeys)
  })

  it('setiap entry berupa string atau fungsi pada kedua bahasa', () => {
    for (const [key, value] of Object.entries(idDict)) {
      const enValue = (en as Record<string, unknown>)[key]
      expect(typeof value).toBe(typeof enValue)
    }
  })

  it('createT menghasilkan teks sesuai bahasa untuk key statis dan fungsi', () => {
    const tId = createT('id')
    const tEn = createT('en')
    expect(tId('home.practice')).toBe('✏️ Latihan Soal')
    expect(tEn('home.practice')).toBe('✏️ Practice')
    expect(tId('home.greetingName', { name: 'Budi' })).toContain('Halo, Budi!')
    expect(tEn('home.greetingName', { name: 'Budi' })).toContain('Hi, Budi!')
  })

  it('stepInstruction menerjemahkan instruksi langkah per bahasa', () => {
    const problem = buildProblem('addition', 23, 14)
    const interim = problem.learningSteps.find((s) => s.kind === 'interim-sum')
    expect(interim?.kind).toBe('interim-sum')
    if (interim?.kind === 'interim-sum') {
      expect(stepInstruction(interim, createT('id'))).toContain('Kotak Hitung')
      expect(stepInstruction(interim, createT('en'))).toContain('Counting Box')
    }
  })
})

function LanguageProbe() {
  const { lang, setLanguage, t } = useI18n()
  return (
    <div>
      <span data-testid="probe-lang">{lang}</span>
      <span data-testid="probe-text">{t('home.practice')}</span>
      <button type="button" onClick={() => setLanguage(lang === 'id' ? 'en' : 'id')}>
        toggle
      </button>
    </div>
  )
}

describe('label nilai tempat terlokalkan', () => {
  it('stepInstruction pinjam sederhana menyebut nilai tempat peminjam (regresi F2)', () => {
    const problem = buildProblem('subtraction', 52, 28)
    const explain = problem.learningSteps.find((s) => s.kind === 'borrow-explain')
    expect(explain?.kind).toBe('borrow-explain')
    if (explain?.kind === 'borrow-explain') {
      const textId = stepInstruction(explain, createT('id'), problem.columns)
      expect(textId).toContain('puluhan')
      const textEn = stepInstruction(explain, createT('en'), problem.columns)
      expect(textEn).toContain('tens')
      expect(textEn).not.toMatch(/kolom \./)
    }
  })

  it('grid soal menampilkan label EN saat preferensi bahasa en', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...defaultProgress(), language: 'en' }),
    )
    const problem = buildProblem('addition', 26, 87)
    const { container } = render(
      <AllProviders>
        <VerticalMathProblem problem={problem} answers={[null, null, null]} />
      </AllProviders>,
    )
    expect(screen.getByTitle('ones')).not.toBeNull()
    expect(screen.getByTitle('tens')).not.toBeNull()
    expect(container.textContent).toContain('O')
  })
})

describe('switch bahasa instan', () => {
  it('mengubah lang, teks terjemahan, dan atribut html lang', () => {
    render(
      <AllProviders>
        <LanguageProbe />
      </AllProviders>,
    )
    expect(screen.getByTestId('probe-lang').textContent).toBe('id')
    expect(screen.getByTestId('probe-text').textContent).toBe('✏️ Latihan Soal')

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('probe-lang').textContent).toBe('en')
    expect(screen.getByTestId('probe-text').textContent).toBe('✏️ Practice')
    expect(document.documentElement.lang).toBe('en')

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(document.documentElement.lang).toBe('id')
  })

  it('preferensi bahasa tersimpan ke localStorage melalui progress', () => {
    render(
      <AllProviders>
        <LanguageProbe />
      </AllProviders>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }))

    const raw = window.localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw as string).language).toBe('en')
  })
})
