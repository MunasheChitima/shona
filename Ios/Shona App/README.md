# Shona Learning iOS App 🇿🇼

A comprehensive iOS application for learning the Shona language, built with SwiftUI and SwiftData.

## Features

### 🎯 Core Learning Features
- **Interactive Lessons**: Multiple choice, translation, and matching exercises
- **Progress Tracking**: XP system, level progression, and achievement tracking
- **Gamified Experience**: Hearts system, streaks, and rewards
- **Offline Learning**: All content works without internet connection

### 📱 User Interface
- **Modern Design**: Clean, intuitive interface with smooth animations
- **Tab Navigation**: Easy access to Home, Learn, and Profile sections
- **Responsive Layout**: Optimized for all iPhone and iPad screen sizes
- **Dark Mode Support**: Automatic adaptation to system appearance

### 🏆 Gamification
- **XP System**: Earn experience points for completing exercises
- **Level Progression**: Unlock new content as you advance
- **Achievement Tracking**: Monitor your learning milestones
- **Streak System**: Maintain daily learning habits

## Getting Started

### Prerequisites
- Xcode 16.4 or later
- iOS 18.0+ deployment target
- macOS 15.0+ (for development)

### Installation

1. **Clone the Repository**
   ```bash
   cd "Shona App/Ios/Shona App"
   ```

2. **Open in Xcode**
   ```bash
   open "Shona App.xcodeproj"
   ```

3. **Build and Run**
   - Select your target device (iPhone/iPad simulator or physical device)
   - Press `Cmd + R` to build and run the app

### First Launch
- The app will show an onboarding flow for new users
- Enter your name and optional email
- Sample lessons will be automatically created
- Start learning immediately!

## App Structure

### 📁 Core Files
- `Shona_AppApp.swift` - Main app entry point
- `MainTabView.swift` - Primary navigation structure
- `Models.swift` - Data models (User, Lesson, Progress, Exercise)

### 🏠 Views
- `OnboardingView.swift` - New user setup
- `HomeView.swift` - Dashboard with progress overview
- `LearnView.swift` - Lesson grid and learning interface
- `ProfileView.swift` - User stats and settings
- `ExerciseView.swift` - Interactive exercise interface

### 🎨 Design System
- **Colors**: Green and blue gradient theme representing Zimbabwe
- **Typography**: System fonts with clear hierarchy
- **Icons**: SF Symbols for consistent iOS experience
- **Animations**: Subtle, purposeful animations for better UX

## Learning Content

### 📚 Available Lessons
1. **Greetings & Basics** - Essential Shona greetings
2. **Numbers 1-10** - Counting in Shona
3. **Family Members** - Family vocabulary
4. **Common Verbs** - Essential action words
5. **Colors** - Shona color names

### 🎯 Exercise Types
- **Multiple Choice**: Select the correct answer from options
- **Translation**: Translate between English and Shona
- **Matching**: Connect related words and phrases

## Data Management

### 💾 SwiftData Integration
- **User Data**: Profile information and progress
- **Lessons**: Learning content and structure
- **Progress**: Exercise completion and scores
- **Exercises**: Individual learning activities

### 🔄 Data Persistence
- All data is stored locally using SwiftData
- No internet connection required
- Automatic data synchronization
- Backup and restore support

## Customization

### 🎨 Adding New Content
1. **Create Lessons**: Add new lesson objects to the data model
2. **Design Exercises**: Create exercise objects with questions and answers
3. **Update Categories**: Add new lesson categories with custom emojis and colors

### 🔧 Configuration
- **XP Requirements**: Modify level progression in User model
- **Exercise Points**: Adjust scoring system in Exercise model
- **UI Colors**: Update accent colors in view files

## Testing

### 🧪 Unit Tests
- Located in `Shona AppTests/`
- Test data models and business logic
- Run with `Cmd + U`

### 🎭 UI Tests
- Located in `Shona AppUITests/`
- Test user interface interactions
- Automated testing for critical user flows

## Deployment

### 📱 App Store Preparation
1. **App Icon**: Update `Assets.xcassets/AppIcon.appiconset/`
2. **Bundle Identifier**: Configure in project settings
3. **Version**: Update app version and build number
4. **Screenshots**: Capture app screenshots for App Store

### 🔐 Code Signing
- Configure development and distribution certificates
- Set up provisioning profiles
- Enable automatic code signing in Xcode

## Troubleshooting

### 🐛 Common Issues
- **Build Errors**: Clean build folder (`Cmd + Shift + K`)
- **Simulator Issues**: Reset simulator content and settings
- **Data Issues**: Delete app and reinstall for fresh start

### 📞 Support
- Check Xcode console for detailed error messages
- Verify SwiftData model relationships
- Ensure all required files are included in the project

## Future Enhancements

### 🚀 Planned Features
- **Voice Recognition**: Practice pronunciation with speech recognition
- **Text-to-Speech**: Audio pronunciation guides
- **Social Features**: Share progress with friends
- **Offline Sync**: Cloud backup and cross-device sync
- **Advanced Analytics**: Detailed learning insights

### 🎨 UI Improvements
- **Custom Animations**: More engaging transitions
- **Accessibility**: Enhanced VoiceOver support
- **Localization**: Support for additional languages

## Contributing

### 🤝 Development Guidelines
- Follow SwiftUI best practices
- Use SwiftData for data persistence
- Maintain consistent code style
- Add comprehensive documentation
- Write unit tests for new features

### 📝 Code Style
- Use descriptive variable and function names
- Add comments for complex logic
- Follow Swift naming conventions
- Organize code into logical sections

---

**Built with ❤️ for Shona language learners everywhere!**

*This app celebrates the rich culture and language of Zimbabwe while making language learning accessible and enjoyable.* 