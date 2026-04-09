'use client'

const VARIANTS = [
  {
    id: 'heritage' as const,
    title: 'Heritage learner',
    description:
      'You grew up around Shona and want to speak it with family. We will emphasize filling gaps and cultural context.'
  },
  {
    id: 'new_learner' as const,
    title: 'New learner',
    description:
      'You are starting from scratch. Take time with sounds and greetings—extra repetition is built in for you.'
  },
  {
    id: 'partner' as const,
    title: 'Learning with partner / family',
    description:
      'You want practical phrases for relatives and in-laws. Prioritize what you will use day to day.'
  }
]

type PathVariantOnboardingProps = {
  onChoose: (variant: 'heritage' | 'new_learner' | 'partner' | 'default') => void
  dismissing: boolean
}

export default function PathVariantOnboarding({ onChoose, dismissing }: PathVariantOnboardingProps) {
  return (
    <div className="mb-8 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Choose how you want to learn</h2>
      <p className="text-sm text-gray-600 mb-4">
        This shapes tips on your journey. You can change your focus anytime by restarting the path from your profile
        later.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {VARIANTS.map((v) => (
          <button
            key={v.id}
            type="button"
            disabled={dismissing}
            onClick={() => onChoose(v.id)}
            className="text-left rounded-xl border border-gray-200 bg-white p-4 hover:border-emerald-400 hover:shadow-md transition disabled:opacity-60"
          >
            <div className="font-semibold text-gray-900">{v.title}</div>
            <p className="text-xs text-gray-600 mt-2 leading-snug">{v.description}</p>
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={dismissing}
        onClick={() => onChoose('default')}
        className="mt-4 text-sm text-emerald-800 underline hover:no-underline disabled:opacity-50"
      >
        Skip — use the standard path
      </button>
    </div>
  )
}
