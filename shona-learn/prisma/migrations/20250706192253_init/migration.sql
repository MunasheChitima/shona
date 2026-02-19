-- CreateTable
CREATE TABLE "VocabularyItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shona" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tones" TEXT,
    "cultural" TEXT,
    "modern" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "audioFile" TEXT,
    "pronunciation" TEXT,
    "examples" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LessonVocabulary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "LessonVocabulary_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LessonVocabulary_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "VocabularyItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserVocabulary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "mastered" BOOLEAN NOT NULL DEFAULT false,
    "practiceCount" INTEGER NOT NULL DEFAULT 0,
    "lastPracticed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pronunciationScore" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UserVocabulary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserVocabulary_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "VocabularyItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PronunciationPhoneme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phoneme" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "ipa" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tips" TEXT NOT NULL,
    "commonMistakes" TEXT NOT NULL,
    "audioFile" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CulturalContext" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "vocabularyItems" TEXT NOT NULL,
    "culturalNotes" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonVocabulary_lessonId_vocabularyId_key" ON "LessonVocabulary"("lessonId", "vocabularyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserVocabulary_userId_vocabularyId_key" ON "UserVocabulary"("userId", "vocabularyId");
