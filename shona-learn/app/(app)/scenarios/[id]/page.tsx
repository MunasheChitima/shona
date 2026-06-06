import { redirect } from 'next/navigation'

// Scenarios are held back from the beta (see /scenarios). Redirect any deep
// link to a specific pack back to lessons until the feature is ready.
export default function ScenarioDetailPage() {
  redirect('/learn')
}
