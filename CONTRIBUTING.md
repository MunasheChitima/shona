# Contributing to Shona Learn

Thank you for your interest in contributing to Shona Learn! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information

---

## Getting Started

### Prerequisites

- Git knowledge
- Familiarity with the relevant platform (Web/Android/iOS)
- Development environment set up (see README.md)

### First-Time Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/shona-learn.git
   cd shona-learn
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original-org/shona-learn.git
   ```

4. **Install dependencies**
   
   **Web:**
   ```bash
   cd shona-learn
   npm install
   ```
   
   **Android:**
   ```bash
   cd android
   ./gradlew build
   ```
   
   **iOS:**
   ```bash
   cd "Ios/Shona App"
   # Open in Xcode and build
   ```

---

## Development Workflow

### Creating a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions

### Making Changes

1. **Write clean code**
   - Follow existing code style
   - Add comments for complex logic
   - Keep functions small and focused

2. **Test your changes**
   - Write tests for new features
   - Ensure existing tests pass
   - Test on multiple devices/browsers

3. **Commit frequently**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(web): add pronunciation practice
fix(android): resolve crash on startup
docs: update deployment guide
```

---

## Coding Standards

### Web (TypeScript/React)

```typescript
// Use TypeScript
interface Props {
  name: string;
  age: number;
}

// Functional components with hooks
export const MyComponent: React.FC<Props> = ({ name, age }) => {
  const [state, setState] = useState(0);
  
  return <div>{name}</div>;
};

// Named exports
export { MyComponent };
```

**Style:**
- Use Tailwind CSS for styling
- Follow React best practices
- Use TypeScript types
- Avoid `any` type
- Use meaningful variable names

### Android (Kotlin)

```kotlin
// Use Kotlin idioms
class MyViewModel @Inject constructor(
    private val repository: Repository
) : ViewModel() {
    
    private val _state = MutableStateFlow(State())
    val state: StateFlow<State> = _state.asStateFlow()
    
    fun doSomething() {
        viewModelScope.launch {
            repository.fetch()
        }
    }
}

// Jetpack Compose
@Composable
fun MyScreen(
    viewModel: MyViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    
    Column {
        Text(text = state.title)
    }
}
```

**Style:**
- Follow Kotlin coding conventions
- Use Jetpack Compose for UI
- Leverage coroutines
- Use Hilt for dependency injection

### iOS (Swift)

```swift
// Use Swift idioms
class MyViewModel: ObservableObject {
    @Published var state = State()
    
    func doSomething() {
        Task {
            await repository.fetch()
        }
    }
}

// SwiftUI
struct MyView: View {
    @StateObject private var viewModel = MyViewModel()
    
    var body: some View {
        VStack {
            Text(viewModel.state.title)
        }
    }
}
```

**Style:**
- Follow Swift API design guidelines
- Use SwiftUI for modern UI
- Leverage async/await
- Use Combine for reactive programming

---

## Testing

### Web Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Linting
npm run lint
```

Write tests for:
- Components
- API routes
- Utility functions
- Business logic

### Android Testing

```bash
# Unit tests
./gradlew testDebugUnitTest

# Instrumented tests
./gradlew connectedAndroidTest

# Lint
./gradlew lintDebug
```

### iOS Testing

```bash
# Run tests
xcodebuild test -scheme "Shona App" \
  -destination 'platform=iOS Simulator,name=iPhone 15 Pro'
```

---

## Submitting Changes

### Before Submitting

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No merge conflicts

### Creating a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill in the template

3. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   How has this been tested?
   
   ## Checklist
   - [ ] Tests pass
   - [ ] Documentation updated
   - [ ] No linting errors
   
   ## Screenshots (if applicable)
   ```

### Review Process

1. Automated checks run (CI/CD)
2. Code review by maintainers
3. Address feedback
4. Approval and merge

### Addressing Feedback

```bash
# Make changes based on feedback
git add .
git commit -m "fix: address review feedback"
git push origin feature/your-feature-name
```

---

## Release Process

### Version Bumping

We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Creating a Release

1. **Update version numbers**
   - `package.json` (web)
   - `build.gradle.kts` (Android)
   - Xcode project (iOS)

2. **Update CHANGELOG.md**
   ```markdown
   ## [1.1.0] - 2025-12-15
   
   ### Added
   - New feature X
   
   ### Fixed
   - Bug Y
   ```

3. **Create release tag**
   ```bash
   git tag -a v1.1.0 -m "Release version 1.1.0"
   git push --tags
   ```

4. **CI/CD handles deployment**

---

## Documentation

### When to Update Docs

- New features added
- API changes
- Configuration changes
- Deployment process changes

### Documentation Types

- **README.md**: Project overview
- **DEPLOYMENT_GUIDE.md**: Deployment instructions
- **API.md**: API documentation
- **Code comments**: Inline documentation

---

## Getting Help

### Resources

- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Quick Start](QUICK_START.md)
- [README](README.md)

### Support Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: General questions
- **Discord**: Real-time chat (if available)

### Reporting Bugs

Use the bug report template:

```markdown
**Describe the bug**
Clear description

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., iOS 17]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]
```

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Acknowledged in the project

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

## Questions?

If you have questions about contributing:
1. Check existing documentation
2. Search closed issues
3. Open a new discussion
4. Contact maintainers

**Thank you for contributing to Shona Learn! 🎉**
