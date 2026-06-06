'use client'
import { motion } from 'framer-motion'
import { IconType } from 'react-icons'
import { FaBook, FaStar, FaLayerGroup, FaSeedling } from 'react-icons/fa'
import { useCountUp } from './useCountUp'

interface StatItem {
  key: string
  label: string
  value: number
  icon: IconType
  suffix?: string
}

interface StatsOverviewProps {
  lessonsCompleted: number
  totalXp: number
  level: number
  wordsLearned: number
}

function StatCard({ item, index }: { item: StatItem; index: number }) {
  const animated = useCountUp(item.value)
  const Icon = item.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      className="bg-white/80 backdrop-blur rounded-2xl border border-stone-200 p-4"
    >
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Icon className="text-base" />
      </div>
      <p className="text-2xl font-medium tracking-tight text-stone-900 tabular-nums">
        {animated}
        {item.suffix || ''}
      </p>
      <p className="mt-0.5 text-sm text-stone-500 lowercase">{item.label}</p>
    </motion.div>
  )
}

export default function StatsOverview({
  lessonsCompleted,
  totalXp,
  level,
  wordsLearned,
}: StatsOverviewProps) {
  const items: StatItem[] = [
    { key: 'lessons', label: 'lessons completed', value: lessonsCompleted, icon: FaBook },
    { key: 'xp', label: 'total xp', value: totalXp, icon: FaStar },
    { key: 'level', label: 'level', value: level, icon: FaLayerGroup },
    { key: 'words', label: 'words learned', value: wordsLearned, icon: FaSeedling },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item, i) => (
        <StatCard key={item.key} item={item} index={i} />
      ))}
    </div>
  )
}
