//
//  ContentManager.swift
//  Shona App
//
//  Created by Munashe T Chitima on 7/7/2025.
//

import Foundation
import SwiftData

class ContentManager {
    static let shared = ContentManager()
    
    private init() {}
    
    // MARK: - Sample Content Creation
    
    func createSampleContent(modelContext: ModelContext, userId: String) {
        // Create sample lessons
        createSampleLessons(modelContext: modelContext, userId: userId)
        
        // Create sample quests
        createSampleQuests(modelContext: modelContext, userId: userId)
        
        // Create sample pronunciation exercises
        createSamplePronunciationExercises(modelContext: modelContext)
        
        // Save context
        try? modelContext.save()
    }
    
    private func createSampleLessons(modelContext: ModelContext, userId: String) {
        let sampleLessons = [
            (
                id: "lesson-1",
                title: "Mhoro, Shamwari! - Hello, Friend!",
                description: "Learn basic greetings and how to introduce yourself in Shona culture",
                category: "Cultural Immersion",
                orderIndex: 1,
                level: "beginner",
                xpReward: 50,
                duration: 15,
                objectives: [
                    "Master basic Shona greetings (mhoro, mhoroi, hesi)",
                    "Understand the cultural importance of respectful greetings",
                    "Practice proper pronunciation with audio feedback",
                    "Learn to introduce yourself with confidence"
                ],
                discoveries: [
                    "Explore different times of day greetings",
                    "Discover the difference between formal and informal greetings",
                    "Learn about the plural of respect in Shona culture"
                ],
                cultural: [
                    "In Shona culture, greetings are sacred and show respect",
                    "Always use plural forms when addressing elders or strangers",
                    "The greeting 'mhoroi' shows more respect than 'mhoro'"
                ],
                vocabulary: [
                    ("mhoro", "hello (informal)", "mhoro.mp3", "Used with friends and people your age", "Mhoro, shamwari!"),
                    ("mhoroi", "hello (formal)", "mhoroi.mp3", "Used with elders, strangers, or to show respect", "Mhoroi, mai!"),
                    ("shamwari", "friend", "shamwari.mp3", "Common term for friend", "Shamwari yangu"),
                    ("makadii", "how are you (formal)", "makadii.mp3", "Respectful way to ask how someone is", "Makadii, baba?"),
                    ("wakadii", "how are you (informal)", "wakadii.mp3", "Casual way to ask how someone is", "Wakadii, shamwari?")
                ]
            ),
            (
                id: "lesson-2",
                title: "Ini Ndinonzi - My Name Is",
                description: "Learn to introduce yourself and exchange names in Shona",
                category: "Cultural Immersion",
                orderIndex: 2,
                level: "beginner",
                xpReward: 50,
                duration: 15,
                objectives: [
                    "Learn to state your name in Shona",
                    "Ask for someone's name politely",
                    "Practice numbers 1-10 for counting and market use",
                    "Understand basic sentence structure"
                ],
                discoveries: [
                    "Explore how names carry meaning in Shona culture",
                    "Discover the importance of knowing someone's name",
                    "Learn about traditional Shona naming practices"
                ],
                cultural: [
                    "Names in Shona culture often have deep meaning",
                    "It's polite to ask for someone's name after greeting",
                    "Numbers are essential for market interactions"
                ],
                vocabulary: [
                    ("zita", "name", "zita.mp3", "Word for name", "Zita rangu ndinonzi John"),
                    ("ini ndinonzi", "my name is", "ini_ndinonzi.mp3", "How to introduce yourself", "Ini ndinonzi Maria"),
                    ("munonzi ani", "what is your name (formal)", "munonzi_ani.mp3", "Respectful way to ask someone's name", "Munonzi ani, mai?"),
                    ("motsi", "one", "motsi.mp3", "Number 1", "Motsi chete"),
                    ("piri", "two", "piri.mp3", "Number 2", "Mapiri")
                ]
            ),
            (
                id: "lesson-3",
                title: "Mhuri Yangu - My Family",
                description: "Learn family vocabulary and understand Shona family structure",
                category: "Family & Relationships",
                orderIndex: 3,
                level: "beginner",
                xpReward: 60,
                duration: 20,
                objectives: [
                    "Master family member vocabulary",
                    "Understand the Shona extended family system",
                    "Learn possessive pronouns (-angu, -ako)",
                    "Practice noun classes for people (1/2)"
                ],
                discoveries: [
                    "Explore the importance of extended family in Shona culture",
                    "Discover different roles within the family structure",
                    "Learn about respect for elders"
                ],
                cultural: [
                    "Family is central to Shona identity and culture",
                    "Extended family members are considered as close as immediate family",
                    "Respect for elders is fundamental to Shona values"
                ],
                vocabulary: [
                    ("mhuri", "family", "mhuri.mp3", "Word for family", "Mhuri yangu"),
                    ("baba", "father", "baba.mp3", "Word for father, also used as respectful address", "Baba vangu"),
                    ("amai", "mother", "amai.mp3", "Word for mother, also used as respectful address", "Amai vangu"),
                    ("mwana", "child", "mwana.mp3", "Word for child", "Mwana wangu"),
                    ("mukoma", "older brother", "mukoma.mp3", "Respectful term for older brother", "Mukoma wangu")
                ]
            ),
            (
                id: "lesson-4",
                title: "Kumusika - At the Market",
                description: "Learn market vocabulary, colors, and basic negotiation phrases",
                category: "Practical Communication",
                orderIndex: 4,
                level: "intermediate",
                xpReward: 75,
                duration: 25,
                objectives: [
                    "Master market vocabulary and transactions",
                    "Learn color words and descriptions",
                    "Practice numbers 1-10 in practical contexts",
                    "Understand basic negotiation phrases"
                ],
                discoveries: [
                    "Explore traditional Shona markets and their importance",
                    "Discover local foods and traditional crafts",
                    "Learn about bargaining as a social interaction"
                ],
                cultural: [
                    "Markets are social centers, not just commercial spaces",
                    "Bargaining is expected and shows engagement",
                    "Respect for vendors and their goods is important"
                ],
                vocabulary: [
                    ("musika", "market", "musika.mp3", "Word for market", "Ndinoenda kumusika"),
                    ("mari", "money", "mari.mp3", "Word for money", "Ndine mari"),
                    ("imarii", "how much", "imarii.mp3", "Question to ask price", "Imarii ichi?"),
                    ("tsvuku", "red", "tsvuku.mp3", "Color red", "Chitsvuku"),
                    ("chena", "white", "chena.mp3", "Color white", "Chichena")
                ]
            ),
            (
                id: "lesson-5",
                title: "Mazwi Emutauro - Sounds of Language",
                description: "Master Shona pronunciation and tone patterns",
                category: "Pronunciation Mastery",
                orderIndex: 5,
                level: "intermediate",
                xpReward: 80,
                duration: 30,
                objectives: [
                    "Master Shona vowel sounds (a, e, i, o, u)",
                    "Practice tone patterns and their meanings",
                    "Learn prenasalized consonants (mb, nd, ng, nz)",
                    "Develop authentic pronunciation habits"
                ],
                discoveries: [
                    "Explore the musical nature of Shona language",
                    "Discover how tones change word meanings",
                    "Learn about regional pronunciation variations"
                ],
                cultural: [
                    "Shona is a tonal language with high and low tones",
                    "Proper pronunciation shows respect for the language",
                    "Each region may have slight pronunciation differences"
                ],
                vocabulary: [
                    ("mazwi", "words", "mazwi.mp3", "Word for words", "Mazwi makuru"),
                    ("mutauro", "language", "mutauro.mp3", "Word for language", "Mutauro wechiShona"),
                    ("mbira", "traditional instrument", "mbira.mp3", "Traditional Shona instrument", "Ndiri kuridza mbira"),
                    ("nzira", "path/way", "nzira.mp3", "Word for path or way", "Nzira yakanaka"),
                    ("ngoma", "drum", "ngoma.mp3", "Traditional drum", "Ngoma inorira")
                ]
            )
        ]
        
        for lessonData in sampleLessons {
            let lesson = Lesson(
                id: lessonData.id,
                title: lessonData.title,
                description: lessonData.description,
                category: lessonData.category,
                orderIndex: lessonData.orderIndex,
                level: lessonData.level,
                xpReward: lessonData.xpReward,
                estimatedDuration: lessonData.duration
            )
            
            lesson.learningObjectives = lessonData.objectives
            lesson.discoveryElements = lessonData.discoveries
            lesson.culturalNotes = lessonData.cultural
            
            // Add vocabulary
            for vocabData in lessonData.vocabulary {
                let vocab = VocabularyItem(
                    shona: vocabData.0,
                    english: vocabData.1,
                    audioFile: vocabData.2,
                    usage: vocabData.3,
                    example: vocabData.4,
                    category: lessonData.category,
                    level: lessonData.level
                )
                lesson.vocabulary.append(vocab)
                modelContext.insert(vocab)
            }
            
            // Add some sample exercises
            for i in 1...3 {
                let exercise = Exercise(
                    type: "multiple_choice",
                    question: "What does '\(lessonData.vocabulary[min(i-1, lessonData.vocabulary.count-1)].0)' mean?",
                    correctAnswer: lessonData.vocabulary[min(i-1, lessonData.vocabulary.count-1)].1,
                    options: [
                        lessonData.vocabulary[min(i-1, lessonData.vocabulary.count-1)].1,
                        "incorrect option 1",
                        "incorrect option 2",
                        "incorrect option 3"
                    ],
                    points: 10
                )
                exercise.difficulty = lessonData.level
                exercise.category = lessonData.category
                lesson.exercises.append(exercise)
                modelContext.insert(exercise)
            }
            
            modelContext.insert(lesson)
            
            // Create progress entry for user
            let progress = Progress(userId: userId, lessonId: lesson.id)
            modelContext.insert(progress)
        }
    }
    
    private func createSampleQuests(modelContext: ModelContext, userId: String) {
        let sampleQuests = [
            (
                id: "quest-1",
                title: "The Village Greeter",
                description: "Learn to greet people properly in Shona culture",
                category: "Cultural Immersion",
                orderIndex: 1,
                requiredLevel: 1,
                activities: [
                    ("greeting_practice", "Practice Greetings", "Learn formal and informal greetings"),
                    ("cultural_lesson", "Understand Respect", "Learn about showing respect through language"),
                    ("conversation_practice", "Real Conversations", "Practice greeting different people")
                ]
            ),
            (
                id: "quest-2",
                title: "Family Storyteller",
                description: "Master family vocabulary and relationships",
                category: "Family & Relationships",
                orderIndex: 2,
                requiredLevel: 2,
                activities: [
                    ("family_tree", "Build Family Tree", "Create your family tree in Shona"),
                    ("story_telling", "Tell Family Stories", "Share stories about your family"),
                    ("cultural_roles", "Understand Family Roles", "Learn traditional family structures")
                ]
            ),
            (
                id: "quest-3",
                title: "Market Navigator",
                description: "Navigate traditional markets with confidence",
                category: "Practical Communication",
                orderIndex: 3,
                requiredLevel: 3,
                activities: [
                    ("market_vocabulary", "Learn Market Terms", "Master buying and selling vocabulary"),
                    ("bargaining_practice", "Practice Bargaining", "Learn respectful negotiation"),
                    ("cultural_exchange", "Market Culture", "Understand markets as social spaces")
                ]
            ),
            (
                id: "quest-4",
                title: "Sound Master",
                description: "Perfect your Shona pronunciation",
                category: "Pronunciation Mastery",
                orderIndex: 4,
                requiredLevel: 4,
                activities: [
                    ("tone_practice", "Master Tones", "Practice high and low tones"),
                    ("sound_practice", "Special Sounds", "Master whistled and breathy consonants"),
                    ("rhythm_practice", "Natural Rhythm", "Develop natural speech rhythm")
                ]
            ),
            (
                id: "quest-5",
                title: "The Great Baobab Tree",
                description: "Explore traditional stories and wisdom",
                category: "Cultural Heritage",
                orderIndex: 5,
                requiredLevel: 5,
                activities: [
                    ("story_listening", "Ancient Stories", "Listen to traditional tales"),
                    ("wisdom_learning", "Learn Proverbs", "Understand Shona wisdom"),
                    ("story_telling", "Tell Your Story", "Create your own traditional story")
                ]
            )
        ]
        
        for questData in sampleQuests {
            let quest = Quest(
                id: questData.id,
                title: questData.title,
                description: questData.description,
                storyNarrative: "Embark on a journey to master \(questData.title.lowercased())",
                category: questData.category,
                orderIndex: questData.orderIndex,
                requiredLevel: questData.requiredLevel
            )
            
            // Add activities
            for activityData in questData.activities {
                let activity = QuestActivity(
                    type: activityData.0,
                    title: activityData.1,
                    description: activityData.2,
                    questId: quest.id
                )
                quest.activities.append(activity)
                modelContext.insert(activity)
            }
            
            modelContext.insert(quest)
            
            // Create quest progress for user
            let questProgress = QuestProgress(
                userId: userId,
                questId: quest.id,
                totalActivities: quest.activities.count
            )
            modelContext.insert(questProgress)
        }
    }
    
    private func createSamplePronunciationExercises(modelContext: ModelContext) {
        let pronunciationWords = [
            ("mhoro", "/mʰo.ro/", "mhoro.mp3", "beginner", "Greetings", ["Focus on the aspirated 'mh' sound", "Keep the 'o' sounds pure"], ["Don't pronounce the 'h' separately"], "mho-ro", "Low-High", 2, "hello"),
            ("mbira", "/m̩.bi.ra/", "mbira.mp3", "intermediate", "Music", ["The 'm' is syllabic - it's a full syllable", "Don't add a vowel before 'mbira'"], ["Saying 'em-bira' instead of 'mbira'"], "mbi-ra", "High-Low-High", 6, "thumb piano"),
            ("nzira", "/n̩.zi.ra/", "nzira.mp3", "intermediate", "Directions", ["The 'n' is syllabic", "The 'z' should be clearly voiced"], ["Adding 'en' before the word"], "nzi-ra", "High-Low-High", 6, "path/way"),
            ("svika", "/svi.ka/", "svika.mp3", "advanced", "Verbs", ["The 'sv' is a whistled sound", "Purse your lips slightly for the 'sv'"], ["Pronouncing as 'shvika' or separating 's' and 'v'"], "svi-ka", "High-Low", 8, "arrive"),
            ("ngoma", "/ŋo.ma/", "ngoma.mp3", "beginner", "Music", ["The 'ng' is one sound, like in 'singer'", "Don't separate the 'n' and 'g'"], ["Saying 'en-goma'"], "ngo-ma", "High-Low", 3, "drum")
        ]
        
        for wordData in pronunciationWords {
            let exercise = PronunciationExercise(
                word: wordData.0,
                phonetic: wordData.1,
                audioFile: wordData.2,
                difficulty: wordData.3,
                category: wordData.4,
                complexity: wordData.9,
                translation: wordData.10
            )
            
            exercise.tips = wordData.5
            exercise.commonMistakes = wordData.6
            exercise.syllables = wordData.7
            exercise.tonePattern = wordData.8
            
            // Add special sounds for complex words
            if wordData.0 == "mbira" {
                let sound = PronunciationSound(
                    token: "mb",
                    type: "prenasalized",
                    description: "Syllabic nasal followed by voiced stop",
                    exerciseId: exercise.id
                )
                exercise.specialSounds.append(sound)
                modelContext.insert(sound)
            } else if wordData.0 == "svika" {
                let sound = PronunciationSound(
                    token: "sv",
                    type: "whistled",
                    description: "Whistled fricative - purse lips slightly",
                    exerciseId: exercise.id
                )
                exercise.specialSounds.append(sound)
                modelContext.insert(sound)
            }
            
            modelContext.insert(exercise)
        }
    }
}