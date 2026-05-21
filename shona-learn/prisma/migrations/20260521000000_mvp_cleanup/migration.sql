-- MVP cleanup migration
-- 1) Drop adaptive-SRS-only fields from SRSProgress
-- 2) Standardize User -> * ON DELETE CASCADE
-- 3) Add FK / lookup indices
-- 4) Add CHECK constraints on numeric ranges

-- ============================================================
-- 1) Drop SRSProgress fields used only by the removed adaptive variant
-- ============================================================
ALTER TABLE "SRSProgress" DROP COLUMN IF EXISTS "correctStreak";
ALTER TABLE "SRSProgress" DROP COLUMN IF EXISTS "wrongStreak";
ALTER TABLE "SRSProgress" DROP COLUMN IF EXISTS "averageTime";
ALTER TABLE "SRSProgress" DROP COLUMN IF EXISTS "quality";

-- ============================================================
-- 2) Standardize ON DELETE CASCADE for User-owned data.
--    Drop the existing FK (Prisma names them "<Table>_<col>_fkey")
--    and re-add as ON DELETE CASCADE.
-- ============================================================

-- Flashcard.userId
ALTER TABLE "Flashcard" DROP CONSTRAINT IF EXISTS "Flashcard_userId_fkey";
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SRSProgress.userId + SRSProgress.flashcardId
ALTER TABLE "SRSProgress" DROP CONSTRAINT IF EXISTS "SRSProgress_userId_fkey";
ALTER TABLE "SRSProgress" ADD CONSTRAINT "SRSProgress_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SRSProgress" DROP CONSTRAINT IF EXISTS "SRSProgress_flashcardId_fkey";
ALTER TABLE "SRSProgress" ADD CONSTRAINT "SRSProgress_flashcardId_fkey"
  FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- UserProgress.userId
ALTER TABLE "UserProgress" DROP CONSTRAINT IF EXISTS "UserProgress_userId_fkey";
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- IntrinsicMotivation.userId
ALTER TABLE "IntrinsicMotivation" DROP CONSTRAINT IF EXISTS "IntrinsicMotivation_userId_fkey";
ALTER TABLE "IntrinsicMotivation" ADD CONSTRAINT "IntrinsicMotivation_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- LearningGoal.userId
ALTER TABLE "LearningGoal" DROP CONSTRAINT IF EXISTS "LearningGoal_userId_fkey";
ALTER TABLE "LearningGoal" ADD CONSTRAINT "LearningGoal_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- NotificationPreference.userId
ALTER TABLE "NotificationPreference" DROP CONSTRAINT IF EXISTS "NotificationPreference_userId_fkey";
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- QuestProgress.userId
ALTER TABLE "QuestProgress" DROP CONSTRAINT IF EXISTS "QuestProgress_userId_fkey";
ALTER TABLE "QuestProgress" ADD CONSTRAINT "QuestProgress_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SocialConnection.userId + connectedUserId
ALTER TABLE "SocialConnection" DROP CONSTRAINT IF EXISTS "SocialConnection_userId_fkey";
ALTER TABLE "SocialConnection" ADD CONSTRAINT "SocialConnection_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialConnection" DROP CONSTRAINT IF EXISTS "SocialConnection_connectedUserId_fkey";
ALTER TABLE "SocialConnection" ADD CONSTRAINT "SocialConnection_connectedUserId_fkey"
  FOREIGN KEY ("connectedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ReviewSchedule, UserLearningPath, UserUnitProgress, UserCheckpointAttempt,
-- UserAchievement already cascade in the existing schema (no-op).

-- ============================================================
-- 3) Add FK / lookup indices
-- ============================================================
CREATE INDEX IF NOT EXISTS "Flashcard_userId_idx" ON "Flashcard"("userId");
CREATE INDEX IF NOT EXISTS "Flashcard_lessonId_idx" ON "Flashcard"("lessonId");
CREATE INDEX IF NOT EXISTS "UserProgress_lessonId_idx" ON "UserProgress"("lessonId");
CREATE INDEX IF NOT EXISTS "SRSProgress_flashcardId_idx" ON "SRSProgress"("flashcardId");
CREATE INDEX IF NOT EXISTS "SRSProgress_nextReview_idx" ON "SRSProgress"("nextReview");
CREATE INDEX IF NOT EXISTS "Exercise_lessonId_idx" ON "Exercise"("lessonId");
CREATE INDEX IF NOT EXISTS "Unit_stageId_idx" ON "Unit"("stageId");
CREATE INDEX IF NOT EXISTS "Unit_lessonId_idx" ON "Unit"("lessonId");
CREATE INDEX IF NOT EXISTS "UserUnitProgress_unitId_idx" ON "UserUnitProgress"("unitId");
CREATE INDEX IF NOT EXISTS "ReviewSchedule_nextReviewAt_idx" ON "ReviewSchedule"("nextReviewAt");
CREATE INDEX IF NOT EXISTS "ReviewSchedule_userId_nextReviewAt_idx" ON "ReviewSchedule"("userId", "nextReviewAt");
CREATE INDEX IF NOT EXISTS "UserCheckpointAttempt_checkpointId_idx" ON "UserCheckpointAttempt"("checkpointId");
CREATE INDEX IF NOT EXISTS "UserAchievement_achievementId_idx" ON "UserAchievement"("achievementId");
CREATE INDEX IF NOT EXISTS "User_lastActive_idx" ON "User"("lastActive");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");

-- ============================================================
-- 4) CHECK constraints on numeric ranges
-- ============================================================
ALTER TABLE "Flashcard" DROP CONSTRAINT IF EXISTS "Flashcard_difficulty_check";
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_difficulty_check"
  CHECK ("difficulty" >= 0 AND "difficulty" <= 1);

ALTER TABLE "SRSProgress" DROP CONSTRAINT IF EXISTS "SRSProgress_easeFactor_check";
ALTER TABLE "SRSProgress" ADD CONSTRAINT "SRSProgress_easeFactor_check"
  CHECK ("easeFactor" >= 1.3);

ALTER TABLE "SRSProgress" DROP CONSTRAINT IF EXISTS "SRSProgress_interval_check";
ALTER TABLE "SRSProgress" ADD CONSTRAINT "SRSProgress_interval_check"
  CHECK ("interval" >= 1);

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_xp_check";
ALTER TABLE "User" ADD CONSTRAINT "User_xp_check"
  CHECK ("xp" >= 0);
