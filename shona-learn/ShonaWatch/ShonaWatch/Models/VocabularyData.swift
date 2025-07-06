import Foundation

class VocabularyDataLoader {
    static let shared = VocabularyDataLoader()
    private init() {}
    
    func loadVocabularyData() -> [Flashcard] {
        // Load from embedded JSON file
        guard let path = Bundle.main.path(forResource: "vocabulary", ofType: "json"),
              let data = try? Data(contentsOf: URL(fileURLWithPath: path)),
              let vocabularyData = try? JSONDecoder().decode(VocabularyDataContainer.self, from: data) else {
            return generateSampleVocabulary()
        }
        
        return vocabularyData.flashcards
    }
    
    private func generateSampleVocabulary() -> [Flashcard] {
        return [
            // Greetings
            Flashcard(
                shonaText: "mhoro",
                englishText: "hello (informal)",
                pronunciation: "mho-ro",
                phonetic: "/mʰoro/",
                tonePattern: "HL",
                category: "Greetings",
                difficulty: 1.0,
                level: "A1",
                culturalNotes: "Casual greeting used between friends and equals",
                usageNotes: "Used in informal situations",
                examples: [
                    FlashcardExample(
                        shona: "Mhoro shamwari!",
                        english: "Hello friend!",
                        context: "greeting friends",
                        register: "informal"
                    )
                ],
                tags: ["greetings", "informal", "friends"]
            ),
            
            Flashcard(
                shonaText: "mhoroi",
                englishText: "hello (formal)",
                pronunciation: "mho-ro-i",
                phonetic: "/mʰoroj/",
                tonePattern: "HLH",
                category: "Greetings",
                difficulty: 1.5,
                level: "A1",
                culturalNotes: "Respectful greeting used with elders and strangers",
                usageNotes: "Shows respect and is used in formal situations",
                examples: [
                    FlashcardExample(
                        shona: "Mhoroi ambuya!",
                        english: "Hello grandmother!",
                        context: "greeting elders",
                        register: "formal"
                    )
                ],
                tags: ["greetings", "formal", "respect"]
            ),
            
            // Family
            Flashcard(
                shonaText: "baba",
                englishText: "father",
                pronunciation: "ba-ba",
                phonetic: "/baba/",
                tonePattern: "HL",
                category: "Family",
                difficulty: 1.0,
                level: "A1",
                culturalNotes: "Father is highly respected in Shona culture",
                usageNotes: "Used to address one's father or refer to him",
                examples: [
                    FlashcardExample(
                        shona: "Baba vangu vari kuenda kubasa.",
                        english: "My father is going to work.",
                        context: "talking about family",
                        register: "neutral"
                    )
                ],
                tags: ["family", "male", "parent"]
            ),
            
            Flashcard(
                shonaText: "amai",
                englishText: "mother",
                pronunciation: "a-mai",
                phonetic: "/amai/",
                tonePattern: "HL",
                category: "Family",
                difficulty: 1.0,
                level: "A1",
                culturalNotes: "Mother is the heart of the Shona family",
                usageNotes: "Used to address one's mother or refer to her",
                examples: [
                    FlashcardExample(
                        shona: "Amai vangu vanobika zvakanaka.",
                        english: "My mother cooks well.",
                        context: "praising mother",
                        register: "neutral"
                    )
                ],
                tags: ["family", "female", "parent"]
            ),
            
            // Numbers
            Flashcard(
                shonaText: "motsi",
                englishText: "one",
                pronunciation: "mo-tsi",
                phonetic: "/motsi/",
                tonePattern: "HL",
                category: "Numbers",
                difficulty: 1.0,
                level: "A1",
                culturalNotes: "Basic counting is essential for daily life",
                usageNotes: "Used for counting and quantities",
                examples: [
                    FlashcardExample(
                        shona: "Ndine motsi chete.",
                        english: "I have only one.",
                        context: "counting items",
                        register: "neutral"
                    )
                ],
                tags: ["numbers", "counting", "basic"]
            ),
            
            Flashcard(
                shonaText: "piri",
                englishText: "two",
                pronunciation: "pi-ri",
                phonetic: "/piri/",
                tonePattern: "HL",
                category: "Numbers",
                difficulty: 1.0,
                level: "A1",
                culturalNotes: "Two is important in Shona - pairs and duality",
                usageNotes: "Used for counting and expressing pairs",
                examples: [
                    FlashcardExample(
                        shona: "Ndine vana vaviri.",
                        english: "I have two children.",
                        context: "family size",
                        register: "neutral"
                    )
                ],
                tags: ["numbers", "counting", "pairs"]
            ),
            
            // Colors
            Flashcard(
                shonaText: "tsvuku",
                englishText: "red",
                pronunciation: "tsvu-ku",
                phonetic: "/tsvuku/",
                tonePattern: "HL",
                category: "Colors",
                difficulty: 2.0,
                level: "A1",
                culturalNotes: "Red is significant in Shona culture and ceremonies",
                usageNotes: "Used to describe objects and clothing",
                examples: [
                    FlashcardExample(
                        shona: "Tomato tsvuku.",
                        english: "Red tomato.",
                        context: "describing food",
                        register: "neutral"
                    )
                ],
                tags: ["colors", "descriptive", "adjective"]
            ),
            
            Flashcard(
                shonaText: "chena",
                englishText: "white",
                pronunciation: "che-na",
                phonetic: "/tʃena/",
                tonePattern: "HL",
                category: "Colors",
                difficulty: 2.0,
                level: "A1",
                culturalNotes: "White represents purity and peace in Shona culture",
                usageNotes: "Used to describe objects and clothing",
                examples: [
                    FlashcardExample(
                        shona: "Hembe chena.",
                        english: "White shirt.",
                        context: "describing clothing",
                        register: "neutral"
                    )
                ],
                tags: ["colors", "descriptive", "adjective"]
            ),
            
            // Food
            Flashcard(
                shonaText: "sadza",
                englishText: "thick porridge (staple food)",
                pronunciation: "sa-dza",
                phonetic: "/sadza/",
                tonePattern: "HL",
                category: "Food",
                difficulty: 1.5,
                level: "A1",
                culturalNotes: "Sadza is the staple food of Zimbabwe, central to every meal",
                usageNotes: "The most important food in Shona culture",
                examples: [
                    FlashcardExample(
                        shona: "Ndinoda sadza nemurivo.",
                        english: "I want sadza with vegetables.",
                        context: "ordering food",
                        register: "neutral"
                    )
                ],
                tags: ["food", "staple", "culture"]
            ),
            
            // Urban Life
            Flashcard(
                shonaText: "kombi",
                englishText: "minibus taxi",
                pronunciation: "kom-bi",
                phonetic: "/kombi/",
                tonePattern: "HL",
                category: "Urban Life",
                difficulty: 2.0,
                level: "A2",
                culturalNotes: "Main form of public transport in Zimbabwe",
                usageNotes: "Used for city transportation",
                examples: [
                    FlashcardExample(
                        shona: "Ndinoenda kubasa nekombi.",
                        english: "I go to work by kombi.",
                        context: "daily commute",
                        register: "neutral"
                    )
                ],
                tags: ["transport", "urban", "daily"]
            ),
            
            // Social Media
            Flashcard(
                shonaText: "WhatsApp",
                englishText: "WhatsApp",
                pronunciation: "WhatsApp",
                phonetic: "/wɒtsæp/",
                tonePattern: "HL",
                category: "Social Media",
                difficulty: 2.0,
                level: "A2",
                culturalNotes: "Most popular messaging app in Zimbabwe",
                usageNotes: "Used for daily communication",
                examples: [
                    FlashcardExample(
                        shona: "Nditumire paWhatsApp.",
                        english: "Send me on WhatsApp.",
                        context: "exchanging contacts",
                        register: "informal"
                    )
                ],
                tags: ["technology", "communication", "modern"]
            )
        ]
    }
}

// MARK: - Data Container
struct VocabularyDataContainer: Codable {
    let flashcards: [Flashcard]
}

// MARK: - Category Extensions
extension VocabularyDataLoader {
    func getFlashcardsByCategory(_ category: String) -> [Flashcard] {
        return loadVocabularyData().filter { $0.category == category }
    }
    
    func getFlashcardsByLevel(_ level: String) -> [Flashcard] {
        return loadVocabularyData().filter { $0.level == level }
    }
    
    func getFlashcardsByDifficulty(_ difficulty: DifficultyLevel) -> [Flashcard] {
        return loadVocabularyData().filter { difficulty.range.contains($0.difficulty) }
    }
    
    func searchFlashcards(_ searchTerm: String) -> [Flashcard] {
        let term = searchTerm.lowercased()
        return loadVocabularyData().filter { flashcard in
            flashcard.shonaText.lowercased().contains(term) ||
            flashcard.englishText.lowercased().contains(term) ||
            flashcard.category.lowercased().contains(term) ||
            flashcard.tags.contains { $0.lowercased().contains(term) }
        }
    }
    
    func getAvailableCategories() -> [String] {
        let flashcards = loadVocabularyData()
        return Array(Set(flashcards.map { $0.category })).sorted()
    }
    
    func getAvailableLevels() -> [String] {
        let flashcards = loadVocabularyData()
        return Array(Set(flashcards.map { $0.level })).sorted()
    }
}