export interface IntrinsicMotivationData {
  autonomy: number // 1-10 scale
  competence: number // 1-10 scale
  relatedness: number // 1-10 scale
  lastUpdated: Date
}

export interface MotivationPrompt {
  type: 'autonomy' | 'competence' | 'relatedness'
  question: string
  options: string[]
  weight: number
}

export const motivationPrompts: MotivationPrompt[] = [
  // Autonomy prompts
  {
    type: 'autonomy',
    question: "How much choice do you feel in your learning today?",
    options: [
      "No choice at all",
      "Very little choice",
      "Some choice",
      "Good amount of choice",
      "A lot of choice"
    ],
    weight: 1
  },
  {
    type: 'autonomy',
    question: "How much do you feel like you're learning what you want to learn?",
    options: [
      "Not at all what I want",
      "Very little of what I want",
      "Some of what I want",
      "Mostly what I want",
      "Exactly what I want"
    ],
    weight: 1
  },
  {
    type: 'autonomy',
    question: "How much control do you feel over your learning pace?",
    options: [
      "No control",
      "Very little control",
      "Some control",
      "Good control",
      "Complete control"
    ],
    weight: 1
  },

  // Competence prompts
  {
    type: 'competence',
    question: "How confident do you feel in your Shona skills right now?",
    options: [
      "Not confident at all",
      "Slightly confident",
      "Somewhat confident",
      "Quite confident",
      "Very confident"
    ],
    weight: 1
  },
  {
    type: 'competence',
    question: "How well do you think you're progressing in your learning?",
    options: [
      "Not progressing well",
      "Progressing slowly",
      "Progressing okay",
      "Progressing well",
      "Progressing excellently"
    ],
    weight: 1
  },
  {
    type: 'competence',
    question: "How satisfied are you with your recent learning achievements?",
    options: [
      "Not satisfied at all",
      "Slightly satisfied",
      "Somewhat satisfied",
      "Quite satisfied",
      "Very satisfied"
    ],
    weight: 1
  },

  // Relatedness prompts
  {
    type: 'relatedness',
    question: "How connected do you feel to other Shona learners?",
    options: [
      "Not connected at all",
      "Slightly connected",
      "Somewhat connected",
      "Well connected",
      "Very connected"
    ],
    weight: 1
  },
  {
    type: 'relatedness',
    question: "How much do you feel part of the Shona learning community?",
    options: [
      "Not part of it at all",
      "Slightly part of it",
      "Somewhat part of it",
      "Well integrated",
      "Fully integrated"
    ],
    weight: 1
  },
  {
    type: 'relatedness',
    question: "How much do you feel supported in your learning journey?",
    options: [
      "Not supported at all",
      "Slightly supported",
      "Somewhat supported",
      "Well supported",
      "Very well supported"
    ],
    weight: 1
  }
]

export const calculateMotivationScore = (responses: { type: string; value: number }[]): IntrinsicMotivationData => {
  const autonomyResponses = responses.filter(r => r.type === 'autonomy')
  const competenceResponses = responses.filter(r => r.type === 'competence')
  const relatednessResponses = responses.filter(r => r.type === 'relatedness')

  const autonomy = autonomyResponses.length > 0 
    ? Math.round(autonomyResponses.reduce((sum, r) => sum + r.value, 0) / autonomyResponses.length)
    : 5

  const competence = competenceResponses.length > 0
    ? Math.round(competenceResponses.reduce((sum, r) => sum + r.value, 0) / competenceResponses.length)
    : 5

  const relatedness = relatednessResponses.length > 0
    ? Math.round(relatednessResponses.reduce((sum, r) => sum + r.value, 0) / relatednessResponses.length)
    : 5

  return {
    autonomy,
    competence,
    relatedness,
    lastUpdated: new Date()
  }
}

export const getMotivationInsights = (motivation: IntrinsicMotivationData): string[] => {
  const insights: string[] = []

  if (motivation.autonomy < 6) {
    insights.push("Consider choosing topics that interest you most")
  }
  if (motivation.competence < 6) {
    insights.push("Focus on celebrating small wins and progress")
  }
  if (motivation.relatedness < 6) {
    insights.push("Try connecting with other learners or finding a study buddy")
  }

  return insights
}

export const getMotivationRecommendations = (motivation: IntrinsicMotivationData): string[] => {
  const recommendations: string[] = []

  if (motivation.autonomy < 6) {
    recommendations.push("Set your own learning goals")
    recommendations.push("Choose lessons that match your interests")
    recommendations.push("Explore topics at your own pace")
  }

  if (motivation.competence < 6) {
    recommendations.push("Review previous lessons to build confidence")
    recommendations.push("Practice with easier exercises first")
    recommendations.push("Celebrate every small improvement")
  }

  if (motivation.relatedness < 6) {
    recommendations.push("Join a study group")
    recommendations.push("Share your progress with friends")
    recommendations.push("Help other learners with their questions")
  }

  return recommendations
} 