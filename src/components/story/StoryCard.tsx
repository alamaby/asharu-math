import { useI18n } from '../../i18n/LanguageContext'
import { storyPartPrompt, storyStem } from '../../i18n/story'
import type { StoryPart, StoryProblem } from '../../types'

interface Props {
  story: StoryProblem
  part: StoryPart
}

export default function StoryCard({ story, part }: Props) {
  const { t } = useI18n()
  const stemText = storyStem(story.family, story.stemParams, t)
  const promptText = storyPartPrompt(part, t)

  return (
    <article aria-live="polite" className="space-y-3">
      <p className="text-sm font-bold leading-relaxed text-slate-700 md:text-base">{stemText}</p>
      <hr className="border-sky-100" />
      <p className="text-base font-black text-slate-800 md:text-lg">{promptText}</p>
      {part.totalParts > 1 && (
        <p className="text-xs font-bold text-slate-400">
          {t('story.partOf', { current: part.partIndex + 1, total: part.totalParts })}
        </p>
      )}
    </article>
  )
}
