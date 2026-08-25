import { useState } from 'react'
import ChildNameForm from '../components/common/ChildNameForm'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { LANGUAGES, type Language } from '../i18n/types'
import { useI18n } from '../i18n/LanguageContext'
import { useProgress } from '../state/ProgressContext'

function Toggle(props: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description: string
}) {
  const { checked, onChange, label, description } = props
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-sky-100 bg-white p-4 text-left shadow-sm hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
    >
      <span>
        <span className="block text-sm font-black text-slate-800">{label}</span>
        <span className="block text-xs font-semibold text-slate-500">{description}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`}
        />
      </span>
    </button>
  )
}

export default function SettingsScreen() {
  const { progress, setPreferences, setChildName, resetProgress } = useProgress()
  const { lang, setLanguage, t } = useI18n()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="space-y-4">
      <h1 className="pt-1 text-lg font-black text-slate-800">{t('settings.title')}</h1>

      <section
        aria-label={t('settings.nameSection')}
        className="rounded-3xl border-2 border-sky-100 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-black text-slate-800">{t('settings.nameSection')}</h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">{t('settings.nameDesc')}</p>
        <div className="mt-3">
          <ChildNameForm initialName={progress.childName} onSave={(name) => setChildName(name)} />
          {progress.childName !== null && (
            <button
              type="button"
              onClick={() => setChildName(null)}
              className="mt-2 min-h-11 rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 text-sm font-bold text-amber-800 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
            >
              {t('settings.deleteName')}
            </button>
          )}
        </div>
      </section>

      <section
        aria-label={t('settings.languageSection')}
        className="space-y-2 rounded-3xl border-2 border-sky-100 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-black text-slate-800">{t('settings.languageSection')}</h2>
        <p className="text-xs font-semibold text-slate-500">{t('settings.languageDesc')}</p>
        <div
          role="group"
          aria-label={t('settings.languageSection')}
          className="flex flex-wrap gap-2"
        >
          {LANGUAGES.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={lang === option.value}
              onClick={() => setLanguage(option.value as Language)}
              className={`min-h-11 rounded-2xl border-2 px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${
                lang === option.value
                  ? 'border-sky-500 bg-sky-100 text-sky-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-sky-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section aria-label={t('settings.sound')} className="space-y-2">
        <Toggle
          checked={progress.soundEnabled}
          onChange={(value) => setPreferences({ soundEnabled: value })}
          label={t('settings.sound')}
          description={t('settings.soundDesc')}
        />
        <Toggle
          checked={progress.animationsEnabled}
          onChange={(value) => setPreferences({ animationsEnabled: value })}
          label={t('settings.animations')}
          description={t('settings.animationsDesc')}
        />
      </section>

      <section
        aria-label={t('settings.dataSection')}
        className="rounded-3xl border-2 border-rose-100 bg-rose-50 p-4"
      >
        <h2 className="text-sm font-black text-rose-800">{t('settings.dataSection')}</h2>
        <p className="mt-1 text-xs font-semibold text-rose-700">{t('settings.dataDesc')}</p>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="mt-3 min-h-11 rounded-2xl border-b-4 border-rose-600 bg-rose-500 px-4 text-sm font-bold text-white hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
        >
          {t('settings.deleteProgress')}
        </button>
      </section>

      <p className="rounded-2xl bg-white p-4 text-xs font-semibold text-slate-500 shadow-sm">
        {t('settings.privacyNote')}
      </p>

      <ConfirmDialog
        open={confirmOpen}
        title={t('dialog.deleteTitle')}
        description={t('dialog.deleteDesc')}
        confirmLabel={t('dialog.confirmDelete')}
        cancelLabel={t('dialog.cancel')}
        danger
        onConfirm={() => {
          resetProgress()
          setConfirmOpen(false)
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
