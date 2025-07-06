import SwiftUI

struct CulturalContextView: View {
    let card: Flashcard
    @Environment(\.dismiss) var dismiss
    @ObservedObject var audio = AudioPronunciationService.shared
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Word header
                    VStack(spacing: 8) {
                        Text(card.shonaText)
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text(card.englishText)
                            .font(.title3)
                            .foregroundColor(.secondary)
                        
                        if let pronunciation = card.pronunciation {
                            HStack {
                                Text(pronunciation)
                                    .font(.body)
                                    .foregroundColor(.orange)
                                
                                Button(action: {
                                    audio.pronounce(card.shonaText, tonePattern: card.tonePattern)
                                }) {
                                    Image(systemName: "speaker.wave.2.fill")
                                        .foregroundColor(.orange)
                                }
                            }
                        }
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(
                        LinearGradient(
                            colors: [Color.purple.opacity(0.1), Color.purple.opacity(0.05)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .cornerRadius(16)
                    
                    // Tab selection
                    Picker("Context", selection: $selectedTab) {
                        Text("Cultural").tag(0)
                        Text("Usage").tag(1)
                        Text("Etymology").tag(2)
                        Text("Related").tag(3)
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    .padding(.horizontal)
                    
                    // Tab content
                    switch selectedTab {
                    case 0:
                        culturalSignificanceView
                    case 1:
                        usageContextView
                    case 2:
                        etymologyView
                    case 3:
                        relatedWordsView
                    default:
                        EmptyView()
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Cultural Context")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    // MARK: - Cultural Significance
    private var culturalSignificanceView: some View {
        VStack(alignment: .leading, spacing: 16) {
            if let culturalNotes = card.culturalNotes {
                sectionHeader("Cultural Significance", icon: "globe.africa.fill")
                
                Text(culturalNotes)
                    .font(.body)
                    .lineSpacing(4)
                    .padding()
                    .background(Color.purple.opacity(0.05))
                    .cornerRadius(12)
            }
            
            // Additional cultural insights
            sectionHeader("In Shona Society", icon: "person.3.fill")
            
            VStack(alignment: .leading, spacing: 12) {
                culturalInsight(
                    title: "Social Context",
                    description: getSocialContext(for: card.category),
                    icon: "bubble.left.and.bubble.right"
                )
                
                culturalInsight(
                    title: "Traditional Values",
                    description: getTraditionalValues(for: card.shonaText),
                    icon: "house.circle"
                )
                
                if let taboo = getTaboos(for: card.shonaText) {
                    culturalInsight(
                        title: "Important Note",
                        description: taboo,
                        icon: "exclamationmark.triangle",
                        color: .orange
                    )
                }
            }
            
            // Proverbs or sayings
            if let proverbs = getRelatedProverbs(for: card.shonaText) {
                sectionHeader("Related Proverbs", icon: "quote.bubble")
                
                ForEach(proverbs, id: \.self) { proverb in
                    ProverbCard(proverb: proverb)
                }
            }
        }
        .padding(.horizontal)
    }
    
    // MARK: - Usage Context
    private var usageContextView: some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionHeader("How to Use", icon: "bubble.left.fill")
            
            if let examples = card.examples {
                ForEach(examples, id: \.id) { example in
                    ExampleCard(example: example)
                }
            }
            
            // Formal vs Informal
            sectionHeader("Register & Formality", icon: "person.2.badge.gearshape")
            
            FormalityGuide(word: card.shonaText, category: card.category)
            
            // Common mistakes
            if let mistakes = getCommonMistakes(for: card.shonaText) {
                sectionHeader("Common Mistakes", icon: "xmark.circle")
                
                ForEach(mistakes, id: \.self) { mistake in
                    MistakeCard(mistake: mistake)
                }
            }
        }
        .padding(.horizontal)
    }
    
    // MARK: - Etymology
    private var etymologyView: some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionHeader("Word Origins", icon: "tree")
            
            if let etymology = card.etymology {
                Text(etymology)
                    .font(.body)
                    .padding()
                    .background(Color.brown.opacity(0.05))
                    .cornerRadius(12)
            } else {
                Text(getEtymology(for: card.shonaText))
                    .font(.body)
                    .padding()
                    .background(Color.brown.opacity(0.05))
                    .cornerRadius(12)
            }
            
            // Language family connections
            sectionHeader("Bantu Connections", icon: "network")
            
            BantuConnectionsView(word: card.shonaText)
            
            // Historical context
            if let history = getHistoricalContext(for: card.shonaText) {
                sectionHeader("Historical Context", icon: "clock.arrow.circlepath")
                
                Text(history)
                    .font(.callout)
                    .foregroundColor(.secondary)
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(12)
            }
        }
        .padding(.horizontal)
    }
    
    // MARK: - Related Words
    private var relatedWordsView: some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionHeader("Word Family", icon: "rectangle.3.group")
            
            if let relatedWords = card.relatedWords {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 100))], spacing: 12) {
                    ForEach(relatedWords, id: \.self) { word in
                        RelatedWordChip(word: word)
                    }
                }
            }
            
            // Semantic field
            sectionHeader("Semantic Field", icon: "circle.hexagongrid")
            
            SemanticFieldView(
                centralWord: card.shonaText,
                category: card.category
            )
            
            // Collocations
            if let collocations = getCollocations(for: card.shonaText) {
                sectionHeader("Common Phrases", icon: "text.bubble")
                
                ForEach(collocations, id: \.shona) { collocation in
                    CollocationCard(collocation: collocation)
                }
            }
        }
        .padding(.horizontal)
    }
    
    // MARK: - Helper Views
    private func sectionHeader(_ title: String, icon: String) -> some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.purple)
            Text(title)
                .font(.headline)
                .foregroundColor(.primary)
        }
        .padding(.top, 8)
    }
    
    private func culturalInsight(title: String, description: String, icon: String, color: Color = .purple) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(color)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color.gray.opacity(0.05))
        .cornerRadius(12)
    }
    
    // MARK: - Data Methods
    private func getSocialContext(for category: String) -> String {
        switch category.lowercased() {
        case "greetings":
            return "Greetings are the foundation of social interaction in Shona culture. They establish respect, acknowledge relationships, and maintain social harmony."
        case "family":
            return "Family terms reflect the extended family system central to Shona society. Relationships define social roles and responsibilities."
        case "food":
            return "Food terms often carry cultural significance beyond nutrition, representing hospitality, celebration, and community bonds."
        default:
            return "This word reflects important aspects of daily life and social interaction in Shona-speaking communities."
        }
    }
    
    private func getTraditionalValues(for word: String) -> String {
        // This would be expanded with a proper database
        return "This word embodies values of hunhu/ubuntu - the interconnectedness of people and the importance of maintaining harmonious relationships."
    }
    
    private func getTaboos(for word: String) -> String? {
        // Return cultural taboos or sensitive usage notes
        return nil
    }
    
    private func getRelatedProverbs(for word: String) -> [ShonaProverb]? {
        // This would connect to your proverb database
        return nil
    }
    
    private func getCommonMistakes(for word: String) -> [String]? {
        // Return common errors learners make
        return ["Using informal greetings with elders", "Incorrect tone pattern changes meaning", "Missing cultural context in usage"]
    }
    
    private func getEtymology(for word: String) -> String {
        return "This word has roots in proto-Bantu language family, showing connections across Southern African languages."
    }
    
    private func getHistoricalContext(for word: String) -> String? {
        return "This term has been used in Shona communities for generations, evolving with social changes while maintaining core cultural significance."
    }
    
    private func getCollocations(for word: String) -> [(shona: String, english: String, frequency: String)]? {
        return [
            (shona: "\(word) zvikuru", english: "very much", frequency: "very common"),
            (shona: "\(word) kwazvo", english: "a lot", frequency: "common")
        ]
    }
}

// MARK: - Supporting Components
struct ProverbCard: View {
    let proverb: ShonaProverb
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(proverb.shona)
                .font(.headline)
                .foregroundColor(.purple)
            Text(proverb.english)
                .font(.subheadline)
            Text(proverb.meaning)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.purple.opacity(0.05))
        .cornerRadius(12)
    }
}

struct ExampleCard: View {
    let example: Example
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(example.shona)
                    .font(.body)
                    .fontWeight(.medium)
                
                Button(action: {
                    AudioPronunciationService.shared.pronounce(example.shona)
                }) {
                    Image(systemName: "speaker.wave.1")
                        .font(.caption)
                        .foregroundColor(.orange)
                }
            }
            
            Text(example.english)
                .font(.callout)
                .foregroundColor(.secondary)
            
            if let culturalNote = example.culturalNote {
                Label(culturalNote, systemImage: "info.circle")
                    .font(.caption)
                    .foregroundColor(.purple)
            }
            
            HStack {
                Label(example.context, systemImage: "text.bubble")
                Label(example.register, systemImage: "person.crop.circle")
            }
            .font(.caption2)
            .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.blue.opacity(0.05))
        .cornerRadius(12)
    }
}

struct FormalityGuide: View {
    let word: String
    let category: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ForEach(getFormalityLevels(), id: \.level) { formality in
                HStack {
                    Circle()
                        .fill(formality.color)
                        .frame(width: 8, height: 8)
                    
                    VStack(alignment: .leading) {
                        Text(formality.level)
                            .font(.caption)
                            .fontWeight(.semibold)
                        Text(formality.usage)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                }
            }
        }
        .padding()
        .background(Color.gray.opacity(0.05))
        .cornerRadius(12)
    }
    
    private func getFormalityLevels() -> [(level: String, usage: String, color: Color)] {
        return [
            (level: "Very Formal", usage: "Chiefs, ceremonies, elders", color: .purple),
            (level: "Formal", usage: "Strangers, authority figures", color: .blue),
            (level: "Neutral", usage: "General daily use", color: .green),
            (level: "Informal", usage: "Friends, peers, family", color: .orange),
            (level: "Very Informal", usage: "Close friends, youth slang", color: .red)
        ]
    }
}

struct MistakeCard: View {
    let mistake: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "xmark.circle.fill")
                .foregroundColor(.red)
            
            Text(mistake)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.red.opacity(0.05))
        .cornerRadius(8)
    }
}

struct BantuConnectionsView: View {
    let word: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ForEach(getBantuConnections(), id: \.language) { connection in
                HStack {
                    Text(connection.language)
                        .font(.caption)
                        .fontWeight(.semibold)
                        .frame(width: 80, alignment: .leading)
                    
                    Text(connection.word)
                        .font(.caption)
                        .foregroundColor(.orange)
                    
                    Spacer()
                    
                    Text(connection.meaning)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color.brown.opacity(0.05))
        .cornerRadius(12)
    }
    
    private func getBantuConnections() -> [(language: String, word: String, meaning: String)] {
        return [
            (language: "Swahili", word: "jambo", meaning: "hello/matter"),
            (language: "Zulu", word: "sawubona", meaning: "we see you"),
            (language: "Xhosa", word: "molo", meaning: "hello")
        ]
    }
}

struct RelatedWordChip: View {
    let word: String
    
    var body: some View {
        Text(word)
            .font(.caption)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Color.purple.opacity(0.1))
            .foregroundColor(.purple)
            .cornerRadius(16)
    }
}

struct SemanticFieldView: View {
    let centralWord: String
    let category: String
    
    var body: some View {
        // This would show a visual representation of related concepts
        Text("Semantic connections in the \(category) domain")
            .font(.caption)
            .foregroundColor(.secondary)
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.gray.opacity(0.05))
            .cornerRadius(12)
    }
}

struct CollocationCard: View {
    let collocation: (shona: String, english: String, frequency: String)
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(collocation.shona)
                    .font(.callout)
                    .fontWeight(.medium)
                Text(collocation.english)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text(collocation.frequency)
                .font(.caption2)
                .foregroundColor(.secondary)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.gray.opacity(0.1))
                .cornerRadius(8)
        }
        .padding()
        .background(Color.blue.opacity(0.05))
        .cornerRadius(12)
    }
}

struct CulturalContextView_Previews: PreviewProvider {
    static var previews: some View {
        CulturalContextView(card: Flashcard(
            id: "test",
            shonaText: "mhoro",
            englishText: "hello",
            pronunciation: "mho-ro",
            category: "Greetings",
            difficulty: 1.0,
            culturalNotes: "Test cultural notes"
        ))
    }
}