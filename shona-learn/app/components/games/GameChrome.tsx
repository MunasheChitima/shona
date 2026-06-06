'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaArrowLeft } from 'react-icons/fa'

/**
 * Consistent page chrome for every game: warm cream background, a back link to
 * the games index, a lowercase title, and a centered content column. The (app)
 * layout already supplies the global nav/shell, so this stays light.
 */
export default function GameChrome({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/games')}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 text-sm text-stone-600 backdrop-blur transition-colors hover:border-stone-300 hover:text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            <FaArrowLeft className="text-xs" aria-hidden />
            <span className="lowercase">games</span>
          </button>
          <h1 className="lowercase text-lg font-medium tracking-tight text-stone-900">{title}</h1>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
