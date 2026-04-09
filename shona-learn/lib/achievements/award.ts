import { prisma } from '@/lib/prisma'

const MILESTONE_BY_STAGE_ORDER = {
  1: 'milestone-foundation',
  2: 'milestone-connection',
  3: 'milestone-expression',
  4: 'milestone-conversation',
  5: 'milestone-culture',
  6: 'milestone-mastery'
} as const

export type AwardResult =
  | { awarded: true; achievement: { code: string; title: string } }
  | { awarded: false; reason: 'unknown_code' | 'already' }

export async function awardAchievementIfNew(userId: string, code: string): Promise<AwardResult> {
  const achievement = await prisma.achievement.findUnique({ where: { code } })
  if (!achievement) {
    return { awarded: false, reason: 'unknown_code' }
  }
  try {
    await prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id }
    })
    return {
      awarded: true,
      achievement: { code: achievement.code, title: achievement.title }
    }
  } catch {
    return { awarded: false, reason: 'already' }
  }
}

export async function awardStageCheckpointMilestone(userId: string, stageOrderIndex: number) {
  const code = MILESTONE_BY_STAGE_ORDER[stageOrderIndex as keyof typeof MILESTONE_BY_STAGE_ORDER]
  if (!code) return null
  return awardAchievementIfNew(userId, code)
}
