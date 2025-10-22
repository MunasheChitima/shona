import SQLite from 'react-native-sqlite-2';
import { User, Lesson, Progress, Flashcard, PronunciationScore, UserSettings } from '../types';

const DB_NAME = 'shona_learn.db';
const DB_VERSION = '1.0';

class DatabaseService {
  private db: any;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = SQLite.openDatabase(DB_NAME, DB_VERSION, '', 0);
      await this.createTables();
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        // Users table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            xp INTEGER DEFAULT 0,
            hearts INTEGER DEFAULT 5,
            streak INTEGER DEFAULT 0,
            lastActive TEXT,
            createdAt TEXT,
            profileImage TEXT
          )`
        );

        // Lessons table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS lessons (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            questId TEXT,
            category TEXT,
            orderIndex INTEGER,
            level TEXT,
            xpReward INTEGER,
            estimatedDuration INTEGER,
            learningObjectives TEXT,
            discoveryElements TEXT,
            culturalNotes TEXT,
            vocabulary TEXT
          )`
        );

        // Progress table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS progress (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            lessonId TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            score INTEGER DEFAULT 0,
            attempts INTEGER DEFAULT 0,
            timeSpent INTEGER DEFAULT 0,
            completedAt TEXT,
            lastAttempt TEXT,
            FOREIGN KEY (userId) REFERENCES users (id),
            FOREIGN KEY (lessonId) REFERENCES lessons (id)
          )`
        );

        // Flashcards table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS flashcards (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            shona TEXT NOT NULL,
            english TEXT NOT NULL,
            phonetic TEXT,
            audioFile TEXT,
            category TEXT,
            difficulty INTEGER DEFAULT 1,
            nextReview TEXT,
            interval INTEGER DEFAULT 1,
            easeFactor REAL DEFAULT 2.5,
            repetitions INTEGER DEFAULT 0,
            correctStreak INTEGER DEFAULT 0,
            lastReviewed TEXT,
            FOREIGN KEY (userId) REFERENCES users (id)
          )`
        );

        // Pronunciation scores table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS pronunciation_scores (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            word TEXT NOT NULL,
            score INTEGER,
            accuracy REAL,
            timestamp TEXT,
            audioFile TEXT,
            FOREIGN KEY (userId) REFERENCES users (id)
          )`
        );

        // User settings table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS user_settings (
            userId TEXT PRIMARY KEY,
            soundEnabled INTEGER DEFAULT 1,
            notificationsEnabled INTEGER DEFAULT 1,
            pronunciationFeedback INTEGER DEFAULT 1,
            difficulty TEXT DEFAULT 'beginner',
            dailyGoal INTEGER DEFAULT 50,
            reminderTime TEXT,
            FOREIGN KEY (userId) REFERENCES users (id)
          )`
        );

      }, reject, resolve);
    });
  }

  // User methods
  async createUser(user: Omit<User, 'id'>): Promise<string> {
    const id = Date.now().toString();
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          `INSERT INTO users (id, name, email, level, xp, hearts, streak, lastActive, createdAt, profileImage) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, user.name, user.email, user.level, user.xp, user.hearts, user.streak, 
           user.lastActive.toISOString(), user.createdAt.toISOString(), user.profileImage],
                     () => resolve(id),
           (_: any, error: any) => reject(error)
        );
      });
    });
  }

  async getUser(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM users WHERE id = ?',
          [id],
                     (_: any, { rows }: any) => {
             if (rows.length > 0) {
               const user = rows.item(0);
               resolve({
                 ...user,
                 lastActive: new Date(user.lastActive),
                 createdAt: new Date(user.createdAt)
               });
             } else {
               resolve(null);
             }
           },
           (_: any, error: any) => reject(error)
        );
      });
    });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates).map(value => 
      value instanceof Date ? value.toISOString() : value
    );

    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          `UPDATE users SET ${fields} WHERE id = ?`,
          [...values, id],
          () => resolve(),
          (_: any, error: any) => reject(error)
        );
      });
    });
  }

  // Lesson methods
  async insertLesson(lesson: Lesson): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO lessons (id, title, description, questId, category, orderIndex, level, xpReward, estimatedDuration, learningObjectives, discoveryElements, culturalNotes, vocabulary) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            lesson.id, lesson.title, lesson.description, lesson.questId, lesson.category,
            lesson.orderIndex, lesson.level, lesson.xpReward, lesson.estimatedDuration,
            JSON.stringify(lesson.learningObjectives), JSON.stringify(lesson.discoveryElements),
            JSON.stringify(lesson.culturalNotes), JSON.stringify(lesson.vocabulary)
          ],
          () => resolve(),
          (_: any, error: any) => reject(error)
        );
      });
    });
  }

  async getAllLessons(): Promise<Lesson[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM lessons ORDER BY orderIndex',
          [],
          (_: any, { rows }: any) => {
            const lessons: Lesson[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              lessons.push({
                ...row,
                learningObjectives: JSON.parse(row.learningObjectives),
                discoveryElements: JSON.parse(row.discoveryElements),
                culturalNotes: JSON.parse(row.culturalNotes),
                vocabulary: JSON.parse(row.vocabulary)
              });
            }
            resolve(lessons);
          },
          (_: any, error: any) => reject(error)
        );
      });
    });
  }

  async getLesson(id: string): Promise<Lesson | null> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM lessons WHERE id = ?',
          [id],
          (_: any, { rows }: any) => {
            if (rows.length > 0) {
              const row = rows.item(0);
              resolve({
                ...row,
                learningObjectives: JSON.parse(row.learningObjectives),
                discoveryElements: JSON.parse(row.discoveryElements),
                culturalNotes: JSON.parse(row.culturalNotes),
                vocabulary: JSON.parse(row.vocabulary)
              });
            } else {
              resolve(null);
            }
          },
          (_: any, error: any) => reject(error)
        );
      });
    });
  }

  // Progress methods
  async updateProgress(progress: Progress): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO progress (id, userId, lessonId, completed, score, attempts, timeSpent, completedAt, lastAttempt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            progress.id, progress.userId, progress.lessonId, progress.completed ? 1 : 0,
            progress.score, progress.attempts, progress.timeSpent,
            progress.completedAt?.toISOString(), progress.lastAttempt?.toISOString()
          ],
          () => resolve(),
          (_: any, error: any) => reject(error)
        );
      });
    });
  }

  async getUserProgress(userId: string): Promise<Progress[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM progress WHERE userId = ?',
          [userId],
          (_: any, { rows }: any) => {
            const progress: Progress[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              progress.push({
                ...row,
                completed: row.completed === 1,
                completedAt: row.completedAt ? new Date(row.completedAt) : undefined,
                lastAttempt: row.lastAttempt ? new Date(row.lastAttempt) : undefined
              });
            }
            resolve(progress);
          },
          (_: any, error: any) => reject(error)
        );
      });
    });
  }

  // Flashcard methods
  async insertFlashcard(flashcard: Flashcard): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO flashcards (id, userId, shona, english, phonetic, audioFile, category, difficulty, nextReview, interval, easeFactor, repetitions, correctStreak, lastReviewed) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            flashcard.id, flashcard.userId, flashcard.shona, flashcard.english,
            flashcard.phonetic, flashcard.audioFile, flashcard.category, flashcard.difficulty,
            flashcard.nextReview.toISOString(), flashcard.interval, flashcard.easeFactor,
            flashcard.repetitions, flashcard.correctStreak, flashcard.lastReviewed?.toISOString()
          ],
          () => resolve(),
          (_: any, error: any) => reject(error)
        );
      });
    });
  }

  async getUserFlashcards(userId: string): Promise<Flashcard[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM flashcards WHERE userId = ? ORDER BY nextReview',
          [userId],
          (_: any, { rows }: any) => {
            const flashcards: Flashcard[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              flashcards.push({
                ...row,
                nextReview: new Date(row.nextReview),
                lastReviewed: row.lastReviewed ? new Date(row.lastReviewed) : undefined
              });
            }
            resolve(flashcards);
          },
          (_: any, error: any) => reject(error)
        );
      });
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.isInitialized = false;
    }
  }
}

export default new DatabaseService();