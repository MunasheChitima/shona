import { redirect } from 'next/navigation'

// Quests are removed from the beta (broken graveyard + slug leaks). The route
// is kept only to neutralize any lingering links by redirecting to lessons.
export default function QuestsPage() {
  redirect('/learn')
}
