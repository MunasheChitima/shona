// Integrated Content Service for Shona Learning Web App
// This service manages all the new vocabulary modules, lesson plans, and assessments

import { fundamentalBasicVocabulary } from '../../content/vocabulary/fundamental-basic-vocabulary.js';
import { traditionalCulturalVocabulary } from '../../content/vocabulary/traditional-cultural-vocabulary.js';
import { essentialVerbsActionsVocabulary } from '../../content/vocabulary/essential-verbs-actions.js';
import { essentialPhrasesExpressionsVocabulary } from '../../content/vocabulary/essential-phrases-expressions.js';
import { fundamentalBasicLessons } from '../../content/lesson-plans/fundamental-basic-lessons.js';
import { traditionalCulturalLessons } from '../../content/lesson-plans/traditional-cultural-lessons.js';
import { essentialVerbsLessons } from '../../content/lesson-plans/essential-verbs-lessons.js';
import { essentialPhrasesLessons } from '../../content/lesson-plans/essential-phrases-lessons.js';
import { comprehensiveAssessments } from '../../content/assessments/comprehensive-assessments.js';

export interface VocabularyItem {
  id: string;
  shona: string;
  english: string;
  category: string;
  subcategories?: string[];
  level?: string;
  difficulty?: number;
  frequency?: string;
  register?: string;
  dialect?: string;
  tones?: string;
  ipa?: string;
  morphology?: {
    root?: string;
    affixes?: string[];
    noun_class?: number;
  };
  cultural_notes?: string;
  usage_notes?: string;
  examples?: Array<{
    shona: string;
    english: string;
    context?: string;
    register?: string;
  }>;
  audio?: {
    word?: string;
    sentences?: string[];
  };
  source?: string;
  integrated?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  category?: string;
  level?: string;
  difficulty?: number;
  duration?: string;
  objectives?: string[];
  vocabulary_focus?: string[];
  cultural_focus?: string;
  activities?: Array<{
    type: string;
    title: string;
    description?: string;
    duration?: string;
    materials?: string[];
    instructions?: string[];
  }>;
  assessment?: {
    type: string;
    title: string;
    description?: string;
    questions?: Array<{
      type: string;
      question: string;
      options?: string[];
      correct_answer?: string;
      points?: number;
    }>;
  };
  source?: string;
  integrated?: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  type: string;
  category?: string;
  level?: string;
  difficulty?: number;
  description?: string;
  instructions?: string[];
  questions?: Array<{
    id: string;
    type: string;
    question: string;
    options?: string[];
    correct_answer?: string;
    points?: number;
    explanation?: string;
  }>;
  time_limit?: string;
  passing_score?: number;
  source?: string;
  integrated?: boolean;
}

export interface IntegratedContent {
  vocabulary: VocabularyItem[];
  lessons: Lesson[];
  assessments: Assessment[];
  metadata: {
    version: string;
    integratedAt: string;
    totalWords: number;
    totalLessons: number;
    totalAssessments: number;
    categories: string[];
    difficultyLevels: string[];
  };
}

export interface ContentStatistics {
  vocabulary: {
    totalWords: number;
    categories: string[];
    levels: string[];
    difficulties: number[];
    averageDifficulty: number;
  };
  lessons: {
    totalLessons: number;
    categories: string[];
    levels: string[];
  };
  assessments: {
    totalAssessments: number;
    types: string[];
    levels: string[];
  };
}

class IntegratedContentService {
  private static instance: IntegratedContentService;
  private content: IntegratedContent | null = null;
  private isLoading = false;
  private error: string | null = null;

  private constructor() {}

  static getInstance(): IntegratedContentService {
    if (!IntegratedContentService.instance) {
      IntegratedContentService.instance = new IntegratedContentService();
    }
    return IntegratedContentService.instance;
  }

  // Load all integrated content
  async loadIntegratedContent(): Promise<IntegratedContent> {
    if (this.content) {
      return this.content;
    }

    if (this.isLoading) {
      throw new Error('Content is already loading');
    }

    this.isLoading = true;
    this.error = null;

    try {
      console.log('🔄 Loading integrated Shona content...');

      // Load vocabulary from all modules
      const vocabulary = await this.loadAllVocabulary();

      // Load lessons from all modules
      const lessons = await this.loadAllLessons();

      // Load assessments from all modules
      const assessments = await this.loadAllAssessments();

      // Create integrated content
      this.content = {
        vocabulary,
        lessons,
        assessments,
        metadata: {
          version: '3.0.0',
          integratedAt: new Date().toISOString(),
          totalWords: vocabulary.length,
          totalLessons: lessons.length,
          totalAssessments: assessments.length,
          categories: Array.from(new Set(vocabulary.map(v => v.category))),
          difficultyLevels: Array.from(new Set(vocabulary.map(v => v.level).filter((level): level is string => Boolean(level))))
        }
      };

      console.log('✅ Integrated content loaded successfully:');
      console.log(`   - Vocabulary: ${vocabulary.length} words`);
      console.log(`   - Lessons: ${lessons.length} lessons`);
      console.log(`   - Assessments: ${assessments.length} assessments`);

      return this.content;

    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to load integrated content:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  // Load vocabulary from all modules
  private async loadAllVocabulary(): Promise<VocabularyItem[]> {
    const allVocabulary: VocabularyItem[] = [];

    // Load fundamental basic vocabulary
    const fundamentalVocab = this.extractVocabularyFromModule(fundamentalBasicVocabulary, 'fundamental-basic');
    allVocabulary.push(...fundamentalVocab);

    // Load traditional cultural vocabulary
    const traditionalVocab = this.extractVocabularyFromModule(traditionalCulturalVocabulary, 'traditional-cultural');
    allVocabulary.push(...traditionalVocab);

    // Load essential verbs vocabulary
    const verbsVocab = this.extractVocabularyFromModule(essentialVerbsActionsVocabulary, 'essential-verbs');
    allVocabulary.push(...verbsVocab);

    // Load essential phrases vocabulary
    const phrasesVocab = this.extractVocabularyFromModule(essentialPhrasesExpressionsVocabulary, 'essential-phrases');
    allVocabulary.push(...phrasesVocab);

    // Remove duplicates based on shona word
    const uniqueVocabulary = this.removeDuplicateVocabulary(allVocabulary);

    return uniqueVocabulary;
  }

  // Extract vocabulary from a module
  private extractVocabularyFromModule(module: any, source: string): VocabularyItem[] {
    const vocabulary: VocabularyItem[] = [];

    // Recursively traverse the module object
    const extractFromObject = (obj: any, path: string[] = []) => {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          if (item && typeof item === 'object' && item.shona && item.english) {
            vocabulary.push({
              id: item.id || `${source}_${path.join('_')}_${index}`,
              shona: item.shona,
              english: item.english,
              category: item.category || path[path.length - 1] || 'general',
              subcategories: item.subcategories,
              level: item.level,
              difficulty: item.difficulty,
              frequency: item.frequency,
              register: item.register,
              dialect: item.dialect,
              tones: item.tones,
              ipa: item.ipa,
              morphology: item.morphology,
              cultural_notes: item.cultural_notes,
              usage_notes: item.usage_notes,
              examples: item.examples,
              audio: item.audio,
              source,
              integrated: true
            });
          }
        });
      } else if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          extractFromObject(obj[key], [...path, key]);
        });
      }
    };

    extractFromObject(module);
    return vocabulary;
  }

  // Remove duplicate vocabulary items
  private removeDuplicateVocabulary(vocabulary: VocabularyItem[]): VocabularyItem[] {
    const seen = new Set<string>();
    const unique: VocabularyItem[] = [];

    vocabulary.forEach(item => {
      const key = item.shona.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });

    return unique;
  }

  // Load lessons from all modules
  private async loadAllLessons(): Promise<Lesson[]> {
    const allLessons: Lesson[] = [];

    // Load fundamental basic lessons
    const fundamentalLessons = this.extractLessonsFromModule(fundamentalBasicLessons, 'fundamental-basic');
    allLessons.push(...fundamentalLessons);

    // Load traditional cultural lessons
    const traditionalLessons = this.extractLessonsFromModule(traditionalCulturalLessons, 'traditional-cultural');
    allLessons.push(...traditionalLessons);

    // Load essential verbs lessons
    const verbsLessons = this.extractLessonsFromModule(essentialVerbsLessons, 'essential-verbs');
    allLessons.push(...verbsLessons);

    // Load essential phrases lessons
    const phrasesLessons = this.extractLessonsFromModule(essentialPhrasesLessons, 'essential-phrases');
    allLessons.push(...phrasesLessons);

    return allLessons;
  }

  // Extract lessons from a module
  private extractLessonsFromModule(module: any, source: string): Lesson[] {
    const lessons: Lesson[] = [];

    Object.keys(module).forEach(key => {
      const lessonData = module[key];
      if (lessonData && typeof lessonData === 'object' && lessonData.title) {
        lessons.push({
          id: lessonData.id || `${source}_${key}`,
          title: lessonData.title,
          description: lessonData.description,
          category: lessonData.category,
          level: lessonData.level,
          difficulty: lessonData.difficulty,
          duration: lessonData.duration,
          objectives: lessonData.objectives,
          vocabulary_focus: lessonData.vocabulary_focus,
          cultural_focus: lessonData.cultural_focus,
          activities: lessonData.activities,
          assessment: lessonData.assessment,
          source,
          integrated: true
        });
      }
    });

    return lessons;
  }

  // Load assessments from all modules
  private async loadAllAssessments(): Promise<Assessment[]> {
    const allAssessments: Assessment[] = [];

    // Load comprehensive assessments
    const comprehensiveAssessmentsList = this.extractAssessmentsFromModule(comprehensiveAssessments, 'comprehensive');
    allAssessments.push(...comprehensiveAssessmentsList);

    return allAssessments;
  }

  // Extract assessments from a module
  private extractAssessmentsFromModule(module: any, source: string): Assessment[] {
    const assessments: Assessment[] = [];

    // Recursively traverse the module object to find assessments
    const extractFromObject = (obj: any, path: string[] = []) => {
      if (obj && typeof obj === 'object') {
        if (obj.id && obj.title && obj.type) {
          // This looks like an assessment
          assessments.push({
            id: obj.id,
            title: obj.title,
            type: obj.type,
            category: obj.category,
            level: obj.level,
            difficulty: obj.difficulty,
            description: obj.description,
            instructions: obj.instructions,
            questions: obj.questions,
            time_limit: obj.time_limit,
            passing_score: obj.passing_score,
            source,
            integrated: true
          });
        } else {
          // Continue traversing
          Object.keys(obj).forEach(key => {
            extractFromObject(obj[key], [...path, key]);
          });
        }
      }
    };

    extractFromObject(module);
    return assessments;
  }

  // Get content statistics
  getContentStatistics(): ContentStatistics | null {
    if (!this.content) {
      return null;
    }

    const { vocabulary, lessons, assessments } = this.content;

    return {
             vocabulary: {
         totalWords: vocabulary.length,
         categories: Array.from(new Set(vocabulary.map(v => v.category))),
         levels: Array.from(new Set(vocabulary.map(v => v.level).filter((level): level is string => Boolean(level)))),
         difficulties: Array.from(new Set(vocabulary.map(v => v.difficulty).filter((difficulty): difficulty is number => Boolean(difficulty)))),
         averageDifficulty: vocabulary.reduce((sum, v) => sum + (v.difficulty || 0), 0) / vocabulary.length
       },
       lessons: {
         totalLessons: lessons.length,
         categories: Array.from(new Set(lessons.map(l => l.category).filter((category): category is string => Boolean(category)))),
         levels: Array.from(new Set(lessons.map(l => l.level).filter((level): level is string => Boolean(level))))
       },
       assessments: {
         totalAssessments: assessments.length,
         types: Array.from(new Set(assessments.map(a => a.type))),
         levels: Array.from(new Set(assessments.map(a => a.level).filter((level): level is string => Boolean(level))))
       }
    };
  }

  // Filter vocabulary by category
  getVocabularyByCategory(category: string): VocabularyItem[] {
    if (!this.content) return [];
    return this.content.vocabulary.filter(v => v.category === category);
  }

  // Filter vocabulary by level
  getVocabularyByLevel(level: string): VocabularyItem[] {
    if (!this.content) return [];
    return this.content.vocabulary.filter(v => v.level === level);
  }

  // Filter vocabulary by difficulty
  getVocabularyByDifficulty(difficulty: number): VocabularyItem[] {
    if (!this.content) return [];
    return this.content.vocabulary.filter(v => v.difficulty === difficulty);
  }

  // Search vocabulary
  searchVocabulary(searchTerm: string): VocabularyItem[] {
    if (!this.content) return [];
    const term = searchTerm.toLowerCase();
    return this.content.vocabulary.filter(vocab =>
      vocab.shona.toLowerCase().includes(term) ||
      vocab.english.toLowerCase().includes(term) ||
      vocab.category.toLowerCase().includes(term)
    );
  }

  // Filter lessons by category
  getLessonsByCategory(category: string): Lesson[] {
    if (!this.content) return [];
    return this.content.lessons.filter(l => l.category === category);
  }

  // Filter lessons by level
  getLessonsByLevel(level: string): Lesson[] {
    if (!this.content) return [];
    return this.content.lessons.filter(l => l.level === level);
  }

  // Filter assessments by type
  getAssessmentsByType(type: string): Assessment[] {
    if (!this.content) return [];
    return this.content.assessments.filter(a => a.type === type);
  }

  // Filter assessments by level
  getAssessmentsByLevel(level: string): Assessment[] {
    if (!this.content) return [];
    return this.content.assessments.filter(a => a.level === level);
  }

  // Get loading state
  getLoadingState(): { isLoading: boolean; error: string | null } {
    return { isLoading: this.isLoading, error: this.error };
  }

  // Clear cached content
  clearCache(): void {
    this.content = null;
    this.error = null;
  }
}

// Export singleton instance
export const integratedContentService = IntegratedContentService.getInstance(); 