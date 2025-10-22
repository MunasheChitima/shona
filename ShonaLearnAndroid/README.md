# Shona Learn Android App

A comprehensive Android application for learning the Shona language, featuring interactive lessons, pronunciation practice, flashcards, and gamified learning experiences.

## Features

### 🎯 Core Learning Features
- **Interactive Lessons**: Structured lessons with vocabulary, grammar, and cultural insights
- **Pronunciation Practice**: Advanced speech recognition and feedback for Shona pronunciation
- **Flashcards System**: Spaced repetition algorithm for effective vocabulary retention
- **Quests & Challenges**: Gamified learning experiences with achievements and rewards
- **Progress Tracking**: Detailed analytics of learning progress and performance

### 🗣️ Pronunciation & Audio
- Text-to-speech for Shona words and phrases
- Voice recognition for pronunciation assessment
- Phonetic transcriptions with tone patterns
- Audio feedback and scoring system

### 📱 Mobile Experience
- Beautiful, intuitive interface designed for mobile learning
- Offline functionality with local SQLite database
- Progress synchronization across devices
- Adaptive difficulty based on user performance

### 🎮 Gamification
- XP points and level progression
- Daily streaks and learning goals
- Achievement badges and rewards
- Social learning features

## Technology Stack

- **Framework**: React Native 0.80.1
- **Language**: TypeScript
- **Database**: SQLite (react-native-sqlite-2)
- **Navigation**: React Navigation v6
- **Audio**: react-native-sound, react-native-tts
- **Voice**: @react-native-community/voice
- **UI**: React Native Paper, react-native-vector-icons
- **State Management**: Local state with AsyncStorage
- **Animations**: react-native-reanimated, react-native-linear-gradient

## Prerequisites

- Node.js 18 or higher
- React Native development environment
- Android Studio and Android SDK
- Java Development Kit (JDK) 8 or higher

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ShonaLearnAndroid
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Android Setup**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

4. **Link native dependencies** (if needed)
   ```bash
   npx react-native link
   ```

## Running the App

### Development Mode

1. **Start Metro bundler**
   ```bash
   npm start
   ```

2. **Run on Android**
   ```bash
   npm run android
   ```

### Production Build

```bash
cd android
./gradlew assembleRelease
```

## Project Structure

```
ShonaLearnAndroid/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   ├── services/           # Business logic and APIs
│   │   ├── database.ts     # SQLite database service
│   │   └── audio.ts        # Audio and voice services
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── data/               # Static content and data
│   └── assets/             # Images, audio files, etc.
├── android/                # Android-specific code
├── App.tsx                 # Main application component
└── index.js               # Entry point
```

## Key Components

### Database Service (`src/services/database.ts`)
- SQLite database management
- User progress tracking
- Lesson and vocabulary storage
- Flashcard spaced repetition

### Audio Service (`src/services/audio.ts`)
- Text-to-speech functionality
- Voice recognition and pronunciation assessment
- Audio file playback
- Speech feedback algorithms

### Navigation Structure
- **Tab Navigation**: Home, Learn, Pronunciation, Quests, Flashcards, Profile
- **Stack Navigation**: Lessons, Exercises, detailed views
- **Onboarding**: First-time user experience

## Content Structure

The app includes rich educational content:

- **Lessons**: Progressive Shona language lessons with cultural context
- **Vocabulary**: Comprehensive word lists with phonetic transcriptions
- **Exercises**: Interactive learning activities
- **Quests**: Structured learning challenges
- **Cultural Notes**: Background information about Zimbabwean culture

## Features in Detail

### Pronunciation Engine
The app includes a sophisticated pronunciation assessment system:
- Real-time speech recognition
- Phonetic similarity scoring
- Visual feedback and improvement suggestions
- Tone pattern recognition for Shona language

### Spaced Repetition System
Flashcards use scientifically-proven spaced repetition:
- Adaptive scheduling based on performance
- Difficulty adjustment
- Long-term retention optimization

### Progress Analytics
Comprehensive tracking system:
- Learning streaks and goals
- Performance analytics
- Time spent learning
- Vocabulary mastery levels

## Development

### Adding New Screens
1. Create screen component in `src/screens/`
2. Add to navigation in `App.tsx`
3. Update types in `src/types/index.ts`

### Adding New Content
1. Update JSON files in `src/data/content/`
2. Run database migration if needed
3. Update database service methods

### Testing
```bash
npm test
```

### Debugging
```bash
npm run android -- --variant=debug
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npm start -- --reset-cache
   ```

2. **Android build issues**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```

3. **Audio/Voice permissions**
   - Ensure microphone permissions are granted
   - Check audio focus settings

4. **Database issues**
   - Clear app data and reinstall
   - Check SQLite initialization

## Performance Optimization

- Lazy loading of lesson content
- Image optimization and caching
- Audio file compression
- Database query optimization
- Memory leak prevention

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes with descriptive messages
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Shona language content adapted from educational resources
- Cultural insights from Zimbabwean language experts
- Pronunciation guides based on linguistic research
- Educational methodology from language learning research

## Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation

---

**Mhoro! Welcome to Shona language learning! 🇿🇼**
