# Technical Implementation Cookbook: Advanced Shona Learning Features

## Recipe 1: Intelligent Tone Pattern Recognition System

### Problem
Shona's two-tone system is critical for meaning but challenging for learners to master.

### Solution: Real-time Tone Analysis with Visual Feedback

```typescript
// Enhanced ToneMeter Component with Audio Analysis
import { useRef, useEffect, useState } from 'react';
import * as Pitchfinder from 'pitchfinder';

interface ToneAnalysisResult {
  pattern: string;
  accuracy: number;
  pitchContour: number[];
  feedback: string;
}

export function RealTimeToneAnalyzer({ targetWord, targetPattern }: Props) {
  const [analysis, setAnalysis] = useState<ToneAnalysisResult | null>(null);
  const audioContext = useRef<AudioContext>();
  const analyzer = useRef<AnalyserNode>();
  
  const detectPitch = Pitchfinder.AMDF({
    sampleRate: 44100,
    minFrequency: 80,
    maxFrequency: 400
  });

  const analyzeTonePattern = (audioData: Float32Array): string => {
    const pitches: number[] = [];
    const windowSize = 2048;
    
    for (let i = 0; i < audioData.length - windowSize; i += windowSize / 2) {
      const window = audioData.slice(i, i + windowSize);
      const pitch = detectPitch(window);
      if (pitch) pitches.push(pitch);
    }
    
    // Convert pitch contour to tone pattern
    const averagePitch = pitches.reduce((a, b) => a + b, 0) / pitches.length;
    const tonePattern = pitches.map(p => p > averagePitch * 1.1 ? 'H' : 'L').join('');
    
    return this.smoothTonePattern(tonePattern);
  };

  const calculateToneAccuracy = (detected: string, target: string): number => {
    // Syllable-aligned comparison
    const detectedSyllables = this.segmentIntoSyllables(detected);
    const targetSyllables = target.split('');
    
    let matches = 0;
    const minLength = Math.min(detectedSyllables.length, targetSyllables.length);
    
    for (let i = 0; i < minLength; i++) {
      if (detectedSyllables[i] === targetSyllables[i]) matches++;
    }
    
    return (matches / targetSyllables.length) * 100;
  };

  return (
    <div className="tone-analyzer">
      <canvas ref={canvasRef} className="pitch-visualizer" />
      {analysis && (
        <div className="tone-feedback">
          <ToneMeter 
            pattern={analysis.pattern} 
            word={targetWord}
            showComparison={targetPattern}
            accuracy={analysis.accuracy}
          />
          <div className="feedback-text">{analysis.feedback}</div>
        </div>
      )}
    </div>
  );
}
```

### Integration with Vocabulary

```typescript
// Automatically generate tone exercises from vocabulary
export function generateToneExercises(vocabulary: VocabularyItem[]) {
  const tonePatterns = new Map<string, VocabularyItem[]>();
  
  // Group words by tone pattern
  vocabulary.forEach(item => {
    if (!tonePatterns.has(item.tones)) {
      tonePatterns.set(item.tones, []);
    }
    tonePatterns.get(item.tones)!.push(item);
  });
  
  // Create minimal pair exercises
  const exercises: ToneExercise[] = [];
  
  tonePatterns.forEach((words, pattern) => {
    const similarPatterns = this.findSimilarPatterns(pattern, tonePatterns);
    
    similarPatterns.forEach(similarPattern => {
      const similarWords = tonePatterns.get(similarPattern)!;
      
      exercises.push({
        type: 'tone_discrimination',
        pattern1: pattern,
        pattern2: similarPattern,
        words1: words.slice(0, 3),
        words2: similarWords.slice(0, 3),
        difficulty: this.calculateDifficulty(pattern, similarPattern)
      });
    });
  });
  
  return exercises.sort((a, b) => a.difficulty - b.difficulty);
}
```

## Recipe 2: Morphological Analysis Engine

### Problem
Understanding word formation is crucial for Shona mastery but complex to teach.

### Solution: Interactive Morphology Breakdown

```typescript
interface MorphologyEngine {
  analyzeWord(word: string): MorphologicalAnalysis;
  findRelatedWords(root: string): VocabularyItem[];
  generateExercises(analysis: MorphologicalAnalysis): Exercise[];
}

export class ShonaMorphologyEngine implements MorphologyEngine {
  private nounClasses = {
    1: { prefix: 'mu-', plural: 2, semantic: 'people' },
    2: { prefix: 'va-', singular: 1, semantic: 'people_plural' },
    3: { prefix: 'mu-', plural: 4, semantic: 'trees_spirits' },
    4: { prefix: 'mi-', singular: 3, semantic: 'trees_spirits_plural' },
    5: { prefix: '', plural: 6, semantic: 'fruits_body_parts' },
    6: { prefix: 'ma-', singular: 5, semantic: 'liquids_plural' },
    7: { prefix: 'chi-', plural: 8, semantic: 'things_languages' },
    8: { prefix: 'zvi-', singular: 7, semantic: 'things_plural' },
    9: { prefix: 'N-', plural: 10, semantic: 'animals_objects' },
    10: { prefix: 'dziN-', singular: 9, semantic: 'animals_objects_plural' }
  };

  private verbExtensions = {
    causative: { suffix: '-isa/-esa', meaning: 'cause to' },
    applicative: { suffix: '-ira/-era', meaning: 'do for/at' },
    passive: { suffix: '-wa', meaning: 'be done to' },
    reciprocal: { suffix: '-ana', meaning: 'do to each other' },
    intensive: { suffix: '-isisa', meaning: 'do intensely' }
  };

  analyzeWord(word: string): MorphologicalAnalysis {
    const analysis: MorphologicalAnalysis = {
      word,
      components: [],
      type: this.identifyWordType(word),
      culturalNote: ''
    };

    if (analysis.type === 'noun') {
      const nounClass = this.identifyNounClass(word);
      if (nounClass) {
        analysis.components.push({
          type: 'prefix',
          form: nounClass.prefix,
          meaning: `Class ${nounClass.number} (${nounClass.semantic})`,
          position: 0
        });
        
        const root = word.substring(nounClass.prefix.length);
        analysis.components.push({
          type: 'root',
          form: root,
          meaning: this.getRootMeaning(root),
          position: nounClass.prefix.length
        });
      }
    } else if (analysis.type === 'verb') {
      analysis.components = this.analyzeVerb(word);
    }

    return analysis;
  }

  private analyzeVerb(verb: string): MorphemeComponent[] {
    const components: MorphemeComponent[] = [];
    let position = 0;

    // Subject prefix
    const subjectPrefixes = ['ndi', 'u', 'a', 'ti', 'mu', 'va'];
    for (const prefix of subjectPrefixes) {
      if (verb.startsWith(prefix)) {
        components.push({
          type: 'subject',
          form: prefix,
          meaning: this.getSubjectMeaning(prefix),
          position
        });
        position += prefix.length;
        break;
      }
    }

    // Tense marker
    const tenseMarkers = ['no', 'ri ku', 'cha', 'ka', 'a'];
    for (const marker of tenseMarkers) {
      if (verb.substring(position).startsWith(marker)) {
        components.push({
          type: 'tense',
          form: marker,
          meaning: this.getTenseMeaning(marker),
          position
        });
        position += marker.length;
        break;
      }
    }

    // Find root and extensions
    const remaining = verb.substring(position);
    const { root, extensions } = this.extractRootAndExtensions(remaining);
    
    components.push({
      type: 'root',
      form: root,
      meaning: this.getVerbRootMeaning(root),
      position
    });

    extensions.forEach(ext => {
      components.push({
        type: 'extension',
        form: ext.form,
        meaning: ext.meaning,
        position: position + root.length
      });
    });

    return components;
  }

  generateExercises(analysis: MorphologicalAnalysis): Exercise[] {
    const exercises: Exercise[] = [];

    // Component identification exercise
    exercises.push({
      type: 'morphology_identification',
      question: `Identify the parts of "${analysis.word}"`,
      components: analysis.components.map(c => ({
        text: c.form,
        type: c.type,
        explanation: c.meaning
      })),
      interactive: true,
      culturalContext: analysis.culturalNote
    });

    // Word building exercise
    exercises.push({
      type: 'morphology_construction',
      question: 'Build related words using the same root',
      root: analysis.components.find(c => c.type === 'root')?.form || '',
      options: this.generateWordBuildingOptions(analysis),
      validCombinations: this.getValidCombinations(analysis)
    });

    // Meaning prediction exercise
    exercises.push({
      type: 'morphology_meaning',
      question: 'What does this word mean based on its parts?',
      word: this.generateNewWord(analysis),
      components: this.analyzeWord(this.generateNewWord(analysis)).components,
      culturalHint: 'Consider the cultural context of the root'
    });

    return exercises;
  }

  // Visual component for interactive morphology
  createMorphologyVisualizer(word: string): ReactElement {
    const analysis = this.analyzeWord(word);
    
    return (
      <div className="morphology-visualizer">
        <div className="word-display">
          {analysis.components.map((component, index) => (
            <span
              key={index}
              className={`morpheme morpheme-${component.type}`}
              data-tooltip={component.meaning}
              style={{
                backgroundColor: this.getColorForType(component.type),
                borderRadius: '4px',
                padding: '4px 8px',
                margin: '0 2px'
              }}
            >
              {component.form}
            </span>
          ))}
        </div>
        <div className="component-breakdown">
          {analysis.components.map((component, index) => (
            <div key={index} className="component-explanation">
              <span className="component-type">{component.type}:</span>
              <span className="component-form">{component.form}</span>
              <span className="component-meaning">→ {component.meaning}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
```

## Recipe 3: Cultural Scenario Engine

### Problem
Teaching cultural protocols requires interactive, context-aware scenarios.

### Solution: Dynamic Cultural Navigation System

```typescript
interface CulturalScenario {
  id: string;
  title: string;
  context: string;
  participants: Participant[];
  culturalFactors: CulturalFactor[];
  decisionPoints: DecisionPoint[];
  outcomes: Outcome[];
}

export class CulturalScenarioEngine {
  private scenarios: Map<string, CulturalScenario> = new Map();
  
  generateElderGreetingScenario(): CulturalScenario {
    return {
      id: 'elder_greeting_01',
      title: 'Meeting Your Friend\'s Grandmother',
      context: 'You are visiting your friend\'s rural home for the first time',
      participants: [
        {
          id: 'elder',
          role: 'Ambuya (Grandmother)',
          age: 75,
          status: 'respected_elder',
          expectations: ['proper_greeting', 'respectful_posture', 'appropriate_language']
        },
        {
          id: 'friend',
          role: 'Your Friend',
          age: 25,
          status: 'peer',
          relationship: 'mediator'
        }
      ],
      culturalFactors: [
        {
          factor: 'time_of_day',
          value: 'morning',
          impact: 'determines_greeting_type'
        },
        {
          factor: 'first_meeting',
          value: true,
          impact: 'requires_formal_introduction'
        }
      ],
      decisionPoints: [
        {
          id: 'approach',
          prompt: 'How do you approach the elder?',
          options: [
            {
              action: 'Walk directly and extend hand',
              culturalScore: 0.3,
              feedback: 'Too direct. Elders should be approached with more deference.'
            },
            {
              action: 'Wait for friend to introduce you',
              culturalScore: 0.9,
              feedback: 'Excellent! Showing patience and respect for protocol.'
            },
            {
              action: 'Approach slowly with slight bow',
              culturalScore: 0.7,
              feedback: 'Good show of respect, but introduction is still important.'
            }
          ]
        },
        {
          id: 'greeting',
          prompt: 'What greeting do you use?',
          options: [
            {
              action: 'Mangwanani ambuya',
              culturalScore: 0.7,
              feedback: 'Good, but could be more respectful.',
              followUp: 'Add "Makadii?" to show more care'
            },
            {
              action: 'Mangwanani gogo, makadii?',
              culturalScore: 0.95,
              feedback: 'Perfect! Using "gogo" and asking about wellbeing shows deep respect.'
            },
            {
              action: 'Hi ambuya',
              culturalScore: 0.2,
              feedback: 'Too casual! English greetings are inappropriate for elders.'
            }
          ]
        },
        {
          id: 'physical_gesture',
          prompt: 'What physical gesture accompanies your greeting?',
          options: [
            {
              action: 'Clap hands twice softly',
              culturalScore: 0.9,
              feedback: 'Excellent! Kuombera shows proper respect.',
              animation: 'show_clapping_gesture'
            },
            {
              action: 'Shake hands firmly',
              culturalScore: 0.4,
              feedback: 'Too Western. Soft handshake with clapping is better.'
            },
            {
              action: 'Slight curtsy/bow with soft clap',
              culturalScore: 1.0,
              feedback: 'Perfect! Maximum respect shown.',
              achievement: 'Cultural_Ambassador'
            }
          ]
        }
      ],
      outcomes: [
        {
          condition: 'totalScore >= 0.8',
          result: 'success',
          elderResponse: 'Mwana wakanaka, wakarerwa zvakanaka!',
          translation: 'Good child, you were raised well!',
          culturalNote: 'This is high praise, reflecting on your family'
        },
        {
          condition: 'totalScore >= 0.5',
          result: 'acceptable',
          elderResponse: 'Ah, urikudzidza here?',
          translation: 'Ah, are you learning?',
          culturalNote: 'Gentle acknowledgment of effort'
        },
        {
          condition: 'totalScore < 0.5',
          result: 'learning_opportunity',
          elderResponse: '*Friend intervenes to help*',
          culturalNote: 'Don\'t worry! Everyone learns. Watch and try again.'
        }
      ]
    };
  }

  runScenario(scenario: CulturalScenario, userChoices: Map<string, string>): ScenarioResult {
    let totalScore = 0;
    const feedback: Feedback[] = [];
    
    scenario.decisionPoints.forEach(point => {
      const userChoice = userChoices.get(point.id);
      const selectedOption = point.options.find(opt => opt.action === userChoice);
      
      if (selectedOption) {
        totalScore += selectedOption.culturalScore;
        feedback.push({
          decision: point.id,
          score: selectedOption.culturalScore,
          feedback: selectedOption.feedback,
          culturalInsight: this.getCulturalInsight(point.id, selectedOption)
        });
      }
    });
    
    const averageScore = totalScore / scenario.decisionPoints.length;
    const outcome = this.determineOutcome(scenario, averageScore);
    
    return {
      score: averageScore,
      feedback,
      outcome,
      learningPoints: this.extractLearningPoints(feedback),
      nextScenario: this.recommendNextScenario(averageScore, scenario.id)
    };
  }

  // Generate variations for practice
  generateScenarioVariations(baseScenario: CulturalScenario): CulturalScenario[] {
    const variations: CulturalScenario[] = [];
    
    // Time of day variation
    ['morning', 'afternoon', 'evening'].forEach(time => {
      variations.push({
        ...baseScenario,
        id: `${baseScenario.id}_${time}`,
        culturalFactors: baseScenario.culturalFactors.map(f => 
          f.factor === 'time_of_day' ? { ...f, value: time } : f
        ),
        decisionPoints: this.adjustGreetingsForTime(baseScenario.decisionPoints, time)
      });
    });
    
    // Relationship variation
    ['stranger', 'family_friend', 'in_law'].forEach(relationship => {
      variations.push({
        ...baseScenario,
        id: `${baseScenario.id}_${relationship}`,
        context: this.adjustContextForRelationship(baseScenario.context, relationship),
        culturalFactors: [...baseScenario.culturalFactors, {
          factor: 'relationship',
          value: relationship,
          impact: 'affects_formality_level'
        }]
      });
    });
    
    return variations;
  }
}
```

## Recipe 4: Adaptive Difficulty System

### Problem
Content must adjust to learner's actual comprehension level in real-time.

### Solution: Dynamic i+1 Content Selection

```typescript
export class AdaptiveDifficultyEngine {
  private readonly OPTIMAL_COMPREHENSION = 0.85;
  private readonly COMPREHENSION_RANGE = { min: 0.7, max: 0.9 };
  
  async calculateComprehensibility(
    content: Content,
    userProfile: UserProfile
  ): Promise<number> {
    const factors = {
      vocabulary: await this.assessVocabularyDifficulty(content, userProfile),
      grammar: await this.assessGrammarComplexity(content, userProfile),
      cultural: await this.assessCulturalFamiliarity(content, userProfile),
      length: this.assessLengthAppropiateness(content, userProfile),
      speed: this.assessSpeechRate(content, userProfile)
    };
    
    // Weighted calculation based on user's weak areas
    const weights = this.calculateWeights(userProfile.weakAreas);
    
    return Object.entries(factors).reduce((total, [key, value]) => {
      return total + (value * weights[key]);
    }, 0) / Object.values(weights).reduce((a, b) => a + b, 0);
  }
  
  async selectOptimalContent(
    availableContent: Content[],
    userProfile: UserProfile
  ): Promise<Content[]> {
    // Calculate comprehensibility for all content
    const scoredContent = await Promise.all(
      availableContent.map(async content => ({
        content,
        score: await this.calculateComprehensibility(content, userProfile)
      }))
    );
    
    // Filter for optimal range
    const optimalContent = scoredContent.filter(
      item => item.score >= this.COMPREHENSION_RANGE.min && 
              item.score <= this.COMPREHENSION_RANGE.max
    );
    
    // Sort by how close to optimal comprehension
    return optimalContent
      .sort((a, b) => {
        const aDiff = Math.abs(a.score - this.OPTIMAL_COMPREHENSION);
        const bDiff = Math.abs(b.score - this.OPTIMAL_COMPREHENSION);
        return aDiff - bDiff;
      })
      .map(item => this.addScaffolding(item.content, item.score, userProfile));
  }
  
  private addScaffolding(
    content: Content,
    comprehensionScore: number,
    userProfile: UserProfile
  ): Content {
    const scaffoldingNeeded = this.OPTIMAL_COMPREHENSION - comprehensionScore;
    
    if (scaffoldingNeeded <= 0) return content;
    
    const enhancedContent = { ...content };
    
    // Add pre-teaching for difficult vocabulary
    if (scaffoldingNeeded > 0.05) {
      enhancedContent.preteaching = this.identifyChallengingVocabulary(
        content,
        userProfile
      ).map(word => ({
        word: word.shona,
        definition: word.english,
        audio: word.audio,
        visualAid: this.generateVisualAid(word),
        culturalNote: word.cultural_notes
      }));
    }
    
    // Add comprehension aids
    if (scaffoldingNeeded > 0.1) {
      enhancedContent.comprehensionAids = {
        glossary: this.generateContextualGlossary(content, userProfile),
        summaryPoints: this.extractKeyPoints(content),
        culturalBackground: this.provideCulturalContext(content)
      };
    }
    
    // Add interactive elements
    if (scaffoldingNeeded > 0.15) {
      enhancedContent.interactiveElements = {
        pausePoints: this.insertComprehensionChecks(content),
        predictions: this.createPredictionPrompts(content),
        discussions: this.generateDiscussionQuestions(content)
      };
    }
    
    return enhancedContent;
  }
  
  // Real-time adjustment during consumption
  adjustDifficultyInRealTime(
    session: LearningSession,
    performanceMetrics: PerformanceMetrics
  ): ContentAdjustment {
    const { comprehensionRate, engagementLevel, errorRate } = performanceMetrics;
    
    if (comprehensionRate < this.COMPREHENSION_RANGE.min) {
      return {
        action: 'simplify',
        modifications: [
          this.reduceSpeechRate(session.content, 0.8),
          this.addVisualSupport(session.content),
          this.simplifyVocabulary(session.content),
          this.shortenSentences(session.content)
        ]
      };
    }
    
    if (comprehensionRate > this.COMPREHENSION_RANGE.max && engagementLevel < 0.7) {
      return {
        action: 'increase_complexity',
        modifications: [
          this.introduceChallengeVocabulary(session.content),
          this.addCulturalNuance(session.content),
          this.increaseNaturalSpeed(session.content),
          this.removeScaffolding(session.content)
        ]
      };
    }
    
    return { action: 'maintain', modifications: [] };
  }
}
```

## Recipe 5: Community-Driven Learning System

### Problem
Learners need authentic interaction but finding appropriate partners is challenging.

### Solution: Intelligent Language Exchange Matching

```typescript
interface ExchangePartner {
  id: string;
  nativeLanguage: string;
  learningLanguage: string;
  proficiencyLevel: string;
  interests: string[];
  availability: TimeSlot[];
  culturalBackground: string;
  learningGoals: string[];
}

export class CommunityLearningEngine {
  async matchPartners(learner: UserProfile): Promise<ExchangePartner[]> {
    const potentialPartners = await this.getActivePartners();
    
    const scoredPartners = potentialPartners.map(partner => ({
      partner,
      score: this.calculateMatchScore(learner, partner)
    }));
    
    return scoredPartners
      .filter(item => item.score > 0.7)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => this.enhancePartnerProfile(item.partner, learner));
  }
  
  private calculateMatchScore(learner: UserProfile, partner: ExchangePartner): number {
    const factors = {
      complementaryLevels: this.assessLevelCompatibility(learner, partner),
      sharedInterests: this.calculateInterestOverlap(learner, partner),
      scheduleCompatibility: this.assessScheduleMatch(learner, partner),
      learningGoalAlignment: this.assessGoalAlignment(learner, partner),
      culturalExchange: this.assessCulturalExchangeValue(learner, partner)
    };
    
    const weights = {
      complementaryLevels: 0.3,
      sharedInterests: 0.25,
      scheduleCompatibility: 0.2,
      learningGoalAlignment: 0.15,
      culturalExchange: 0.1
    };
    
    return Object.entries(factors).reduce((total, [key, value]) => {
      return total + (value * weights[key]);
    }, 0);
  }
  
  generateExchangeActivities(
    learner: UserProfile,
    partner: ExchangePartner
  ): ExchangeActivity[] {
    const activities: ExchangeActivity[] = [];
    
    // Based on shared interests
    const sharedInterests = this.findSharedInterests(learner, partner);
    
    sharedInterests.forEach(interest => {
      activities.push({
        type: 'interest_discussion',
        topic: interest,
        structure: this.generateDiscussionStructure(interest, learner.level),
        culturalNotes: this.getCulturalPerspectives(interest),
        vocabularySupport: this.getTopicVocabulary(interest),
        timeAllocation: { shona: 15, english: 15 }
      });
    });
    
    // Task-based activities
    activities.push({
      type: 'collaborative_task',
      task: 'Plan a cultural exchange event',
      steps: this.generateTaskSteps(learner.level),
      languageGoals: ['negotiation', 'suggestion', 'planning'],
      culturalLearning: ['event_planning_customs', 'hospitality_norms']
    });
    
    // Structured learning
    activities.push({
      type: 'peer_teaching',
      learnerTeaches: this.selectTeachingTopic(learner),
      partnerTeaches: this.selectTeachingTopic(partner),
      structure: 'mini_lesson_exchange',
      feedback: this.setupPeerFeedbackSystem()
    });
    
    return activities;
  }
  
  // Create safe practice environment
  setupGuidedExchange(
    learner: UserProfile,
    partner: ExchangePartner
  ): GuidedExchange {
    return {
      icebreakers: this.generateIcebreakers(learner.level),
      conversationStarters: this.getTopicStarters(learner, partner),
      emergencyPhrases: this.getHelpPhrases(learner.level),
      culturalGuidelines: this.getExchangeEtiquette(),
      progressTracking: this.setupProgressMetrics(),
      supportTools: {
        translator: this.setupContextualTranslator(),
        pronunciationHelp: this.setupPronunciationSupport(),
        culturalAdvisor: this.setupCulturalGuidance()
      }
    };
  }
}
```

## Implementation Integration Guide

### Connecting All Systems

```typescript
export class IntegratedLearningSystem {
  private morphologyEngine: ShonaMorphologyEngine;
  private toneAnalyzer: RealTimeToneAnalyzer;
  private culturalEngine: CulturalScenarioEngine;
  private difficultyEngine: AdaptiveDifficultyEngine;
  private communityEngine: CommunityLearningEngine;
  
  async createPersonalizedLearningPath(user: UserProfile): Promise<LearningPath> {
    // Assess current state
    const assessment = await this.comprehensiveAssessment(user);
    
    // Generate path with all systems integrated
    const path: LearningPath = {
      currentLevel: assessment.level,
      immediateGoals: this.setSmartGoals(assessment),
      dailyActivities: await this.scheduleDailyActivities(user, assessment),
      weeklyMilestones: this.defineWeeklyTargets(assessment),
      culturalJourney: this.mapCulturalProgression(assessment)
    };
    
    // Add system-specific enhancements
    path.morphologyTrack = this.morphologyEngine.createProgressionPlan(assessment);
    path.pronunciationTrack = this.toneAnalyzer.createMasteryPath(assessment);
    path.culturalTrack = this.culturalEngine.createScenarioSequence(assessment);
    path.communityTrack = await this.communityEngine.createEngagementPlan(user);
    
    return path;
  }
  
  private async scheduleDailyActivities(
    user: UserProfile,
    assessment: Assessment
  ): Promise<DailyActivity[]> {
    const activities: DailyActivity[] = [];
    
    // Morning: Comprehensible input (20-30 min)
    const inputContent = await this.difficultyEngine.selectOptimalContent(
      await this.getAvailableContent(),
      user
    );
    
    activities.push({
      time: 'morning',
      type: 'input',
      content: inputContent[0],
      duration: 25,
      scaffolding: true
    });
    
    // Midday: Active practice (15 min)
    activities.push({
      time: 'midday',
      type: 'practice',
      exercise: this.selectPracticeExercise(assessment),
      duration: 15,
      focus: assessment.weakestArea
    });
    
    // Evening: Cultural/Community (20 min)
    if (user.level >= 'B1') {
      activities.push({
        time: 'evening',
        type: 'community',
        activity: await this.communityEngine.suggestDailyInteraction(user),
        duration: 20
      });
    } else {
      activities.push({
        time: 'evening',
        type: 'cultural',
        scenario: this.culturalEngine.getDailyScenario(user.level),
        duration: 20
      });
    }
    
    return activities;
  }
}
```

## Performance Optimization

```typescript
// Efficient caching for offline support
export class OfflineOptimizationSystem {
  async implementSmartCaching(user: UserProfile): Promise<CacheStrategy> {
    const predictions = await this.predictUserPath(user);
    
    return {
      immediate: {
        lessons: predictions.nextLessons.slice(0, 5),
        vocabulary: await this.extractVocabulary(predictions.nextLessons),
        audio: await this.prioritizeAudio(predictions.nextLessons),
        exercises: await this.preGenerateExercises(predictions.nextLessons)
      },
      background: {
        culturalScenarios: predictions.likelyCulturalTopics,
        grammarReferences: predictions.upcomingGrammarPoints,
        communityContent: await this.cacheRelevantDiscussions(user)
      },
      adaptive: {
        updateTriggers: ['lesson_completion', 'performance_change'],
        cacheSize: this.calculateOptimalCacheSize(user.device),
        compressionStrategy: this.selectCompressionMethod(user.bandwidth)
      }
    };
  }
}
```

This technical cookbook provides concrete, implementable solutions for the most challenging aspects of the Shona learning app, demonstrating deep integration of all available resources and pedagogical principles.