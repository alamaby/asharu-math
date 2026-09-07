type Props = {
  visible: boolean
  text?: string
}

export default function RewardDecoration({ visible, text }: Props) {
  if (!visible) return null
  return (
    <div className="animate-pop-in rounded-3xl border-2 border-sky-200 bg-sky-50 p-4 text-center shadow-sm">
      <p className="text-lg font-black text-sky-800">{text ?? 'Hebat! Jawabanmu benar! 🎉'}</p>
      <p aria-hidden="true" className="mt-2 text-2xl">
        🐠 ⭐ 🐚 ⭐ 🐠
      </p>
      <p className="mt-1 text-xs font-bold text-sky-600">Satu dekorasi akuarium baru terbuka!</p>
    </div>
  )
}
