# Shona Flash - watchOS App

A companion watchOS application for learning Shona vocabulary through flashcards with pronunciation support.

## Features

### 🎯 Core Learning
- **Flashcard Study System**: Interactive flashcards with Shona words, English translations, and pronunciation guides
- **Spaced Repetition**: Intelligent SRS algorithm that schedules reviews based on your performance
- **Pronunciation Support**: Text-to-speech with pronunciation guides and tone patterns
- **Cultural Context**: Each word includes cultural notes and usage examples

### 📊 Progress Tracking
- **Study Statistics**: Track your learning progress, accuracy, and streaks
- **Daily Goals**: Set and achieve daily study targets
- **Weekly Activity**: Visual representation of your study consistency
- **Session History**: Review your past learning sessions

### ⚙️ Customization
- **Difficulty Levels**: Choose from Beginner, Intermediate, Advanced, or All levels
- **Category Selection**: Focus on specific topics like Greetings, Family, Numbers, Colors, etc.
- **Study Limits**: Configure daily limits for new cards and reviews
- **Audio Settings**: Control sound effects and haptic feedback

### 🔔 Smart Notifications
- **Review Reminders**: Get notified when cards are due for review
- **Daily Reminders**: Maintain your learning streak with customizable daily reminders
- **Streak Alerts**: Don't break your learning streak with evening reminders

## Vocabulary Categories

- **Greetings**: Essential greetings for daily interactions
- **Family**: Family members and relationships
- **Numbers**: Basic counting and quantities
- **Colors**: Descriptive colors and their usage
- **Food**: Traditional and modern food terms
- **Urban Life**: Modern city life vocabulary
- **Social Media**: Contemporary digital communication terms

## Technical Features

### 🏗️ Architecture
- **SwiftUI**: Modern declarative UI framework
- **Combine**: Reactive programming for data binding
- **UserDefaults**: Local data persistence
- **AVFoundation**: Speech synthesis for pronunciation
- **UserNotifications**: Smart reminder system

### 🧠 Learning Algorithm
- **SuperMemo SM-2**: Proven spaced repetition algorithm
- **Adaptive Scheduling**: Cards appear when you're most likely to forget them
- **Performance Tracking**: Quality scores influence future review intervals
- **Streak Management**: Continuous learning encouragement

### 📱 watchOS Optimization
- **Compact Interface**: Designed specifically for Apple Watch screen sizes
- **Quick Interactions**: Optimized for brief, focused study sessions
- **Haptic Feedback**: Subtle feedback for user actions
- **Digital Crown**: Smooth navigation through content

## Installation

1. Open the project in Xcode 15.0 or later
2. Select your Apple Watch as the target device
3. Build and run the project
4. The app will install on your connected Apple Watch

## Usage

### Starting a Study Session
1. Open the app on your Apple Watch
2. Tap "Study" to begin a flashcard session
3. Read the Shona word and try to recall the meaning
4. Tap "Show Answer" to reveal the English translation
5. Rate your recall using Again, Hard, Good, or Easy

### Pronunciation Practice
1. Tap the speaker icon to hear the word pronounced
2. View the pronunciation guide in brackets
3. Check the tone pattern (H = High, L = Low)
4. Practice speaking the word yourself

### Tracking Progress
1. Navigate to "Progress" to view your statistics
2. Check your daily goal completion
3. Review weekly activity patterns
4. Analyze accuracy and streak data

### Customizing Settings
1. Open "Settings" to configure the app
2. Adjust daily goals and study limits
3. Select vocabulary categories of interest
4. Set notification preferences
5. Choose your difficulty level

## Data Structure

Each flashcard contains:
- **Shona Text**: The word in Shona language
- **English Translation**: Clear English meaning
- **Pronunciation**: Syllable-based pronunciation guide
- **Phonetic**: IPA notation for precise pronunciation
- **Tone Pattern**: Shona tonal information
- **Cultural Notes**: Cultural context and significance
- **Usage Examples**: Real-world usage scenarios
- **Difficulty Level**: Learning progression indicator

## Vocabulary Sources

The vocabulary is curated from:
- FSI Shona Course materials
- Contemporary Zimbabwean usage
- Cultural and traditional contexts
- Modern urban and digital terms

## Requirements

- **watchOS 9.0+**: Latest watchOS features
- **Xcode 15.0+**: Development environment
- **Swift 5.9+**: Modern Swift language features
- **Apple Watch Series 4+**: Recommended for optimal performance

## Building and Running

```bash
# Clone the repository
cd shona-learn/ShonaWatch

# Open in Xcode
open ShonaWatch.xcodeproj

# Select your Apple Watch device
# Build and run (⌘+R)
```

## Future Enhancements

- **Voice Recognition**: Practice pronunciation with speech recognition
- **Collaborative Learning**: Share progress with friends
- **Advanced Analytics**: Detailed learning insights
- **Offline Audio**: Pre-recorded native speaker pronunciations
- **Complications**: Watch face widgets for quick practice
- **Handwriting Recognition**: Practice writing Shona characters

## Contributing

This app is part of the larger Shona language learning ecosystem. Contributions are welcome for:
- Additional vocabulary content
- Pronunciation improvements
- UI/UX enhancements
- Bug fixes and optimizations

## License

Part of the Shona Language Learning Project. Please refer to the main project license.

---

**Shona Flash** - Making Shona vocabulary learning accessible, engaging, and effective on your wrist! 🇿🇼⌚️