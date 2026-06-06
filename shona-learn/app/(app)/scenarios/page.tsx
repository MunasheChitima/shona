import { redirect } from 'next/navigation'

// Scenarios are held back from the beta — only one pack exists and the audio
// recordings aren't ready yet. The route is kept only to neutralize any
// lingering links by redirecting to lessons (same approach as /quests).
// Re-enable + add back to nav when ≥3 native-verified packs with audio exist.
export default function ScenariosPage() {
  redirect('/learn')
}
