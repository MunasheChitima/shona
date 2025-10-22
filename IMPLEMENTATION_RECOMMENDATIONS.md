# Implementation Recommendations: Shona Learning App

## Priority 1: Add Pronunciation Text Display

### Issue
The user memory indicates that pronunciation of words should be displayed in text form to help learners. Currently, both platforms rely primarily on audio without clear text-based pronunciation guidance.

### Implementation

#### 1. Update Lesson Content Structure
Add pronunciation text fields to vocabulary items:

```json
{
  "vocabulary": [
    {
      "shona": "mhoro",
      "english": "hello (informal)",
      "pronunciation": "mm-HO-ro",
      "phonetic": "/m̩.ho.ro/",
      "audioFile": "mhoro.mp3",
      "usage": "Used with friends and people your age",
      "example": "Mhoro, shamwari!"
    }
  ]
}
```

#### 2. iOS Implementation
Update the vocabulary display in `ExerciseView.swift`:

```swift
VStack(alignment: .leading, spacing: 8) {
    Text(vocabulary.shona)
        .font(.title2)
        .fontWeight(.bold)
    
    // Add pronunciation text
    Text("Pronunciation: \(vocabulary.pronunciation)")
        .font(.body)
        .foregroundColor(.blue)
        .padding(.vertical, 4)
        .padding(.horizontal, 8)
        .background(Color.blue.opacity(0.1))
        .cornerRadius(8)
    
    Text(vocabulary.english)
        .font(.body)
        .foregroundColor(.secondary)
}
```

#### 3. Web Implementation
Update the vocabulary display in lesson components:

```tsx
<div className="vocabulary-item">
  <h3 className="text-xl font-bold">{vocabulary.shona}</h3>
  
  {/* Add pronunciation text */}
  <div className="pronunciation-text bg-blue-50 text-blue-800 px-3 py-1 rounded-md text-sm font-medium mb-2">
    Pronunciation: {vocabulary.pronunciation}
  </div>
  
  <p className="text-gray-600">{vocabulary.english}</p>
</div>
```

## Priority 2: Standardize Audio Integration

### Issue
Both platforms use text-to-speech instead of the available audio files, and audio integration is inconsistent.

### Implementation

#### 1. Create Audio Service
Implement a unified audio service that both platforms can use:

```typescript
// Shared audio service interface
interface AudioService {
  playWord(audioFile: string, fallbackText?: string): Promise<void>
  isSupported(): boolean
  prefetchAudio(audioFiles: string[]): Promise<void>
}
```

#### 2. iOS Audio Service
```swift
class AudioService: ObservableObject {
    private let audioPlayer = AVAudioPlayer()
    private let synthesizer = AVSpeechSynthesizer()
    
    func playWord(audioFile: String, fallbackText: String? = nil) {
        // Try to load and play audio file first
        if let audioURL = Bundle.main.url(forResource: audioFile, withExtension: nil) {
            do {
                let player = try AVAudioPlayer(contentsOf: audioURL)
                player.play()
                return
            } catch {
                print("Failed to play audio file: \(error)")
            }
        }
        
        // Fallback to text-to-speech
        if let text = fallbackText {
            let utterance = AVSpeechUtterance(string: text)
            utterance.rate = 0.6
            synthesizer.speak(utterance)
        }
    }
}
```

#### 3. Web Audio Service
```typescript
class WebAudioService implements AudioService {
  private audioCache: Map<string, HTMLAudioElement> = new Map()
  
  async playWord(audioFile: string, fallbackText?: string): Promise<void> {
    // Try to play audio file first
    try {
      let audio = this.audioCache.get(audioFile)
      if (!audio) {
        audio = new Audio(`/audio/${audioFile}`)
        this.audioCache.set(audioFile, audio)
      }
      await audio.play()
    } catch (error) {
      console.warn(`Failed to play audio file: ${error}`)
      
      // Fallback to text-to-speech
      if (fallbackText && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(fallbackText)
        utterance.rate = 0.6
        speechSynthesis.speak(utterance)
      }
    }
  }
}
```

## Priority 3: Unify Exercise System

### Issue
iOS uses hardcoded exercises while Web uses API-based exercises, leading to inconsistent content.

### Implementation

#### 1. Create Exercise Generator Service
```typescript
interface ExerciseTemplate {
  type: 'multiple_choice' | 'translation' | 'pronunciation' | 'matching'
  difficulty: 'easy' | 'medium' | 'hard'
  generateExercise(vocabulary: VocabularyItem[]): Exercise
}

class ExerciseGeneratorService {
  private templates: Map<string, ExerciseTemplate> = new Map()
  
  generateExercisesForLesson(lesson: Lesson): Exercise[] {
    const exercises: Exercise[] = []
    const vocabulary = lesson.vocabulary
    
    // Generate different types of exercises based on lesson content
    exercises.push(...this.generateMultipleChoiceExercises(vocabulary))
    exercises.push(...this.generateTranslationExercises(vocabulary))
    exercises.push(...this.generatePronunciationExercises(vocabulary))
    
    return exercises
  }
}
```

#### 2. iOS Exercise Integration
Update `ExerciseView.swift` to use the exercise generator:

```swift
private func loadExercises() {
    let exerciseGenerator = ExerciseGeneratorService()
    exercises = exerciseGenerator.generateExercises(for: lesson)
}
```

#### 3. Web Exercise Integration
Update the exercise API to use the same generator:

```typescript
// /api/exercises/[id]/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const lesson = await getLessonById(params.id)
  const exerciseGenerator = new ExerciseGeneratorService()
  const exercises = exerciseGenerator.generateExercisesForLesson(lesson)
  
  return Response.json(exercises)
}
```

## Priority 4: Enhance Cultural Context Display

### Issue
Rich cultural notes exist in lessons but are not consistently displayed across platforms.

### Implementation

#### 1. Cultural Context Component (iOS)
```swift
struct CulturalContextView: View {
    let culturalNotes: [String]
    @State private var expanded = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Button(action: { expanded.toggle() }) {
                HStack {
                    Image(systemName: "globe")
                        .foregroundColor(.orange)
                    Text("Cultural Context")
                        .font(.headline)
                    Spacer()
                    Image(systemName: expanded ? "chevron.up" : "chevron.down")
                }
            }
            
            if expanded {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(culturalNotes, id: \.self) { note in
                        HStack(alignment: .top, spacing: 8) {
                            Text("•")
                                .foregroundColor(.orange)
                            Text(note)
                                .font(.body)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding(.leading, 20)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
}
```

#### 2. Cultural Context Component (Web)
```tsx
const CulturalContextView = ({ culturalNotes }: { culturalNotes: string[] }) => {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center space-x-2 w-full text-left"
      >
        <span className="text-orange-600">🌍</span>
        <span className="font-semibold text-orange-800">Cultural Context</span>
        <span className="ml-auto text-orange-600">
          {expanded ? '▲' : '▼'}
        </span>
      </button>
      
      {expanded && (
        <div className="mt-3 space-y-2">
          {culturalNotes.map((note, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-orange-600 font-bold">•</span>
              <span className="text-orange-700 text-sm">{note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

## Priority 5: Standardize UI Components

### Issue
Visual inconsistencies across platforms create a fragmented user experience.

### Implementation

#### 1. Shared Design System
Create a design system specification:

```json
{
  "colors": {
    "categories": {
      "basics": { "primary": "#10b981", "secondary": "#6ee7b7" },
      "family": { "primary": "#8b5cf6", "secondary": "#c4b5fd" },
      "practical": { "primary": "#f59e0b", "secondary": "#fbbf24" }
    },
    "difficulty": {
      "easy": { "bg": "#dcfce7", "text": "#166534", "border": "#bbf7d0" },
      "medium": { "bg": "#fef3c7", "text": "#92400e", "border": "#fde68a" },
      "hard": { "bg": "#fee2e2", "text": "#991b1b", "border": "#fecaca" }
    }
  },
  "typography": {
    "shona": { "fontSize": "1.5rem", "fontWeight": "600" },
    "english": { "fontSize": "1rem", "fontWeight": "400", "color": "#6b7280" },
    "pronunciation": { "fontSize": "0.875rem", "fontWeight": "500", "color": "#2563eb" }
  }
}
```

#### 2. iOS Component Library
```swift
struct ShonaText: View {
    let text: String
    let style: ShonaTextStyle
    
    var body: some View {
        Text(text)
            .font(style.font)
            .foregroundColor(style.color)
    }
}

enum ShonaTextStyle {
    case shona, english, pronunciation
    
    var font: Font {
        switch self {
        case .shona: return .title2.weight(.semibold)
        case .english: return .body
        case .pronunciation: return .callout.weight(.medium)
        }
    }
    
    var color: Color {
        switch self {
        case .shona: return .primary
        case .english: return .secondary
        case .pronunciation: return .blue
        }
    }
}
```

#### 3. Web Component Library
```tsx
const ShonaText = ({ text, style }: { text: string, style: 'shona' | 'english' | 'pronunciation' }) => {
  const styles = {
    shona: 'text-xl font-semibold text-gray-900',
    english: 'text-base text-gray-600',
    pronunciation: 'text-sm font-medium text-blue-600'
  }
  
  return <span className={styles[style]}>{text}</span>
}
```

## Implementation Timeline

### Week 1: Foundation
- [ ] Add pronunciation text to all vocabulary items
- [ ] Create shared design system specification
- [ ] Implement basic pronunciation text display

### Week 2: Audio Integration
- [ ] Implement unified audio service
- [ ] Integrate audio files with fallback to TTS
- [ ] Test audio playback across platforms

### Week 3: Exercise System
- [ ] Create exercise generator service
- [ ] Implement shared exercise templates
- [ ] Update both platforms to use unified system

### Week 4: Cultural Context
- [ ] Implement cultural context components
- [ ] Integrate into lesson views
- [ ] Ensure consistent display across platforms

### Week 5: UI Standardization
- [ ] Implement shared component library
- [ ] Update all lesson and exercise views
- [ ] Conduct cross-platform testing

## Success Metrics

1. **Consistency**: 95% feature parity between iOS and Web platforms
2. **Pronunciation**: 100% of vocabulary items display pronunciation text
3. **Audio**: 90% audio file integration success rate
4. **Cultural Context**: Cultural notes visible in all lesson views
5. **User Experience**: Unified visual design across platforms

## Testing Strategy

1. **Content Validation**: Verify all vocabulary items have pronunciation text
2. **Audio Testing**: Test audio playback with various network conditions
3. **Exercise Consistency**: Ensure same exercises generated across platforms
4. **Cultural Context**: Verify cultural notes display correctly
5. **UI Consistency**: Visual regression testing across platforms

This implementation plan addresses the key inconsistencies found in the content analysis and provides a clear path toward a unified, consistent user experience across all platforms.