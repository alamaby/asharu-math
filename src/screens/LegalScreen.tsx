import { PRIVACY_POLICY, TERMS_OF_SERVICE } from '../content/legal'
import { useI18n } from '../i18n/LanguageContext'
import type { Language } from '../i18n/types'

export type LegalKind = 'privacy' | 'terms'

export interface LegalScreenProps {
  kind: LegalKind
}

/** Merender dokumen hukum (Privacy Policy / Terms) dalam bahasa aktif. */
export default function LegalScreen({ kind }: LegalScreenProps) {
  const { lang, t } = useI18n()
  const document = kind === 'privacy' ? PRIVACY_POLICY[lang] : TERMS_OF_SERVICE[lang]

  return (
    <div className="space-y-4">
      <h1 className="pt-1 text-lg font-black text-slate-800">{document.title}</h1>
      <p className="text-xs font-semibold text-slate-400">
        {document.updatedLabel} {document.updatedDate}
      </p>

      {document.sections.map((section) => (
        <section
          key={section.title}
          aria-label={section.title}
          className="space-y-2 rounded-3xl border-2 border-sky-100 bg-white p-4 shadow-sm"
        >
          <h2 className="text-sm font-black text-slate-800">{section.title}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-xs font-semibold leading-relaxed text-slate-600">
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <p className="pb-2 text-center text-[0.65rem] font-bold text-slate-300">
        {kind === 'privacy' ? t('legal.privacyTitle') : t('legal.termsTitle')} · Asharu Math
      </p>
    </div>
  )
}

export function legalDocumentTitle(kind: LegalKind, lang: Language): string {
  return kind === 'privacy'
    ? lang === 'id'
      ? PRIVACY_POLICY.id.title
      : PRIVACY_POLICY.en.title
    : lang === 'id'
      ? TERMS_OF_SERVICE.id.title
      : TERMS_OF_SERVICE.en.title
}
