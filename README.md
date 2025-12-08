# 📱 Shona Learn - Comprehensive Language Learning Platform

A cross-platform language learning application for learning Shona, featuring adaptive learning, pronunciation practice, gamification, and AI-powered personalization.

## 🌟 Features

### 🎯 Core Learning Features
- **Adaptive Spaced Repetition System (SRS)**: Personalized review scheduling
- **Interactive Lessons**: Structured learning paths from beginner to advanced
- **Pronunciation Practice**: Advanced voice recognition with tone analysis
- **Flashcards**: Smart flashcard system with multimedia content
- **Gamification**: Quests, achievements, streaks, and leaderboards
- **Quest System**: Mission-based learning with rewards

### 🤖 AI-Powered Features
- **Mudzidzisi AI**: Personal AI tutor for contextual help
- **Intelligent Hints**: Context-aware learning assistance
- **Progress Tracking**: Detailed analytics and insights
- **Personalized Content**: Adapts to your learning style

### 🎮 Interactive Games
- **Memory Match**: Match Shona words with translations
- **Word Builder**: Construct sentences from word components
- **Rhythm & Tones**: Practice tonal patterns
- **Cultural Quiz**: Learn Shona culture and context
- **Story Complete**: Fill-in-the-blank storytelling

### 📱 Multi-Platform
- **Web App**: Progressive web app (PWA) with offline support
- **Android App**: Native Android application
- **iOS App**: Native iOS application
- **Watch App**: Basic vocabulary on Apple Watch

---

## 🚀 Quick Start

### Prerequisites
- **Web**: Node.js 20+, PostgreSQL
- **Android**: Android Studio, JDK 17+
- **iOS**: macOS, Xcode 15.2+

### Deploy in 5 Minutes

```bash
# Clone repository
git clone https://github.com/your-org/shona-learn.git
cd shona-learn

# Deploy web app
cd shona-learn
npm install
cp .env.example .env  # Configure environment
npm run build
npm start
```

**[→ Full Quick Start Guide](QUICK_START.md)**

**[→ Complete Deployment Guide](DEPLOYMENT_GUIDE.md)**

---

## 📦 Project Structure

```
shona-learn/
├── android/                 # Android native app
│   ├── app/
│   │   ├── src/main/       # Kotlin source files
│   │   ├── build.gradle.kts
│   │   └── proguard-rules.pro
│   ├── build-release.sh    # Build script
│   └── create-keystore.sh  # Keystore generation
│
├── Ios/                    # iOS native app
│   └── Shona App/
│       ├── Shona App/      # Swift source files
│       ├── Shona App.xcodeproj/
│       ├── build-release.sh
│       └── fastlane/       # iOS automation
│
├── shona-learn/            # Next.js web app
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities and services
│   ├── prisma/             # Database schema
│   ├── public/             # Static assets
│   ├── Dockerfile          # Docker configuration
│   ├── deploy.sh           # Deployment script
│   └── vercel.json         # Vercel config
│
├── .github/
│   └── workflows/          # CI/CD pipelines
│       ├── android-release.yml
│       ├── ios-release.yml
│       ├── web-deploy.yml
│       └── pr-checks.yml
│
├── DEPLOYMENT_GUIDE.md     # Complete deployment docs
├── QUICK_START.md          # Quick start guide
└── README.md               # This file
```

---

## 🛠️ Technology Stack

### Web Application
- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS, Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **AI**: Google Generative AI
- **Deployment**: Vercel, Netlify, or Docker

### Mobile Applications
- **Android**: Kotlin, Jetpack Compose, Room, Hilt
- **iOS**: SwiftUI, Core Data, Combine
- **Cross-Platform**: Shared content and API

### DevOps
- **CI/CD**: GitHub Actions
- **Containerization**: Docker & Docker Compose
- **Version Control**: Git
- **Dependency Management**: Dependabot

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Quick Start](QUICK_START.md) | Get started in 5 minutes |
| [Deployment Guide](DEPLOYMENT_GUIDE.md) | Complete deployment documentation |
| [Android Setup](android/README.md) | Android-specific setup |
| [iOS Setup](Ios/Shona%20App/README.md) | iOS-specific setup |
| [Web Setup](shona-learn/README.md) | Web app setup |
| [API Documentation](shona-learn/API.md) | API endpoints reference |

---

## 🚢 Deployment

### Automated Deployment (CI/CD)

**Trigger deployment by pushing tags:**

```bash
# Deploy web app
git push origin main

# Deploy Android app
git tag android-v1.0.0
git push --tags

# Deploy iOS app
git tag ios-v1.0.0
git push --tags
```

### Manual Deployment

**Web:**
```bash
cd shona-learn
./deploy.sh vercel
```

**Android:**
```bash
cd android
./build-release.sh aab
```

**iOS:**
```bash
cd "Ios/Shona App"
./build-release.sh app-store
```

**[→ Full Deployment Instructions](DEPLOYMENT_GUIDE.md)**

---

## 🧪 Testing

### Web Application
```bash
cd shona-learn
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run lint           # Linting
```

### Android
```bash
cd android
./gradlew testDebugUnitTest
./gradlew connectedAndroidTest
```

### iOS
```bash
cd "Ios/Shona App"
xcodebuild test -scheme "Shona App" -destination 'platform=iOS Simulator,name=iPhone 15 Pro'
```

---

## 🔒 Security

### Best Practices
- All secrets stored as environment variables
- HTTPS enforced for all connections
- Code obfuscation enabled for mobile apps
- Regular dependency updates via Dependabot
- Security scanning in CI/CD pipeline

### Secret Management
- Never commit secrets to git
- Use GitHub Secrets for CI/CD
- Rotate keys regularly
- Use separate keys for dev/staging/prod

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Workflow
- Follow existing code style
- Write tests for new features
- Update documentation
- Ensure CI/CD passes

---

## 📊 Monitoring & Analytics

### Setup Monitoring
- **Error Tracking**: Sentry, Bugsnag
- **Analytics**: Google Analytics, Mixpanel
- **Performance**: Vercel Analytics, Firebase Performance
- **Uptime**: UptimeRobot, StatusCake

### Key Metrics
- Active users (DAU/MAU)
- Lesson completion rate
- Retention rate
- App performance (load times, crash rate)
- User engagement (time in app, features used)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Content sourced from FSI Basic Shona Course
- AI-powered features using Google Generative AI
- Icons from React Icons
- UI components from Tailwind CSS

---

## 📞 Support

- **Documentation**: [Full guides](DEPLOYMENT_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/shona-learn/issues)
- **Email**: support@shonalearn.com
- **Community**: [Discord](https://discord.gg/your-invite)

---

## 🗺️ Roadmap

### Q1 2025
- [x] Core learning features
- [x] Multi-platform deployment
- [x] CI/CD automation
- [ ] App Store launches

### Q2 2025
- [ ] Social learning features
- [ ] Live tutoring integration
- [ ] Advanced analytics
- [ ] Content expansion

### Q3 2025
- [ ] Offline mode improvements
- [ ] AR pronunciation practice
- [ ] Community contributions
- [ ] API for third-party integrations

---

## 🌍 Languages Supported

Currently: **Shona** (primary) ↔️ **English**

Planned: Additional African languages

---

## 📈 Status

| Platform | Status | Version | Store Link |
|----------|--------|---------|------------|
| Web | ✅ Production | 1.0.0 | [Visit App](https://shona-learn.vercel.app) |
| Android | 🚀 Ready | 1.0.0 | [Google Play](#) |
| iOS | 🚀 Ready | 1.0.0 | [App Store](#) |

---

**Built with ❤️ for language learners everywhere**

[Get Started →](QUICK_START.md) | [Deploy Now →](DEPLOYMENT_GUIDE.md)
