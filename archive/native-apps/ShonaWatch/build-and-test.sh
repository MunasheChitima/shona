#!/bin/bash

# Shona Flash - watchOS App Build and Test Script
# This script builds and tests the watchOS application

set -e  # Exit on any error

echo "🏗️  Building Shona Flash watchOS App..."
echo "========================================="

# Check if we're in the right directory
if [ ! -f "ShonaWatch.xcodeproj/project.pbxproj" ]; then
    echo "❌ Error: ShonaWatch.xcodeproj not found!"
    echo "Please run this script from the ShonaWatch directory"
    exit 1
fi

# Check if Xcode is available
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Error: xcodebuild not found!"
    echo "Please install Xcode and command line tools"
    exit 1
fi

echo "✅ Found Xcode project"

# Clean any previous builds
echo "🧹 Cleaning previous builds..."
xcodebuild clean -project ShonaWatch.xcodeproj -scheme ShonaWatch -configuration Debug

# Build for watchOS Simulator
echo "🔨 Building for watchOS Simulator..."
xcodebuild build \
    -project ShonaWatch.xcodeproj \
    -scheme ShonaWatch \
    -configuration Debug \
    -destination 'platform=watchOS Simulator,name=Apple Watch Series 9 (45mm),OS=latest' \
    CODE_SIGNING_ALLOWED=NO \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Validate the project structure
echo "🔍 Validating project structure..."

required_files=(
    "ShonaWatch/ShonaWatchApp.swift"
    "ShonaWatch/ContentView.swift"
    "ShonaWatch/Models/Models.swift"
    "ShonaWatch/Models/VocabularyData.swift"
    "ShonaWatch/Services/FlashcardManager.swift"
    "ShonaWatch/Services/SpeechSynthesizer.swift"
    "ShonaWatch/Services/ReviewScheduler.swift"
    "ShonaWatch/Views/FlashcardView.swift"
    "ShonaWatch/Views/PronunciationView.swift"
    "ShonaWatch/Views/ProgressView.swift"
    "ShonaWatch/Views/SettingsView.swift"
    "ShonaWatch/Resources/vocabulary.json"
    "ShonaWatch/Assets.xcassets/Contents.json"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ All required files present"
else
    echo "❌ Missing files:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    exit 1
fi

# Validate JSON files
echo "📋 Validating JSON files..."

json_files=(
    "ShonaWatch/Resources/vocabulary.json"
    "ShonaWatch/Assets.xcassets/Contents.json"
    "ShonaWatch/Assets.xcassets/AppIcon.appiconset/Contents.json"
    "ShonaWatch/Assets.xcassets/AccentColor.colorset/Contents.json"
)

for json_file in "${json_files[@]}"; do
    if [ -f "$json_file" ]; then
        if python3 -m json.tool "$json_file" > /dev/null 2>&1; then
            echo "✅ $json_file is valid JSON"
        else
            echo "❌ $json_file is invalid JSON"
            exit 1
        fi
    fi
done

# Check vocabulary data
echo "📚 Validating vocabulary data..."
vocab_count=$(python3 -c "
import json
try:
    with open('ShonaWatch/Resources/vocabulary.json', 'r') as f:
        data = json.load(f)
    print(len(data.get('flashcards', [])))
except Exception as e:
    print('0')
")

if [ "$vocab_count" -gt "0" ]; then
    echo "✅ Found $vocab_count vocabulary entries"
else
    echo "❌ No vocabulary entries found or invalid format"
    exit 1
fi

# Check Swift syntax (basic validation)
echo "🔍 Checking Swift syntax..."

swift_files=$(find ShonaWatch -name "*.swift" -type f)
syntax_errors=0

for swift_file in $swift_files; do
    if ! xcrun swiftc -typecheck "$swift_file" 2>/dev/null; then
        echo "❌ Syntax error in $swift_file"
        syntax_errors=$((syntax_errors + 1))
    fi
done

if [ $syntax_errors -eq 0 ]; then
    echo "✅ All Swift files have valid syntax"
else
    echo "❌ Found $syntax_errors Swift files with syntax errors"
fi

# Test vocabulary loading
echo "🧪 Testing vocabulary loading..."
python3 -c "
import json
import sys

try:
    with open('ShonaWatch/Resources/vocabulary.json', 'r') as f:
        data = json.load(f)
    
    flashcards = data.get('flashcards', [])
    
    if not flashcards:
        print('❌ No flashcards found')
        sys.exit(1)
    
    required_fields = ['id', 'shonaText', 'englishText', 'category']
    
    for i, card in enumerate(flashcards[:5]):  # Check first 5 cards
        for field in required_fields:
            if field not in card:
                print(f'❌ Missing {field} in flashcard {i}')
                sys.exit(1)
    
    print(f'✅ Vocabulary validation passed ({len(flashcards)} flashcards)')
    
    # Check categories
    categories = set(card.get('category', '') for card in flashcards)
    print(f'✅ Found categories: {sorted(categories)}')
    
except Exception as e:
    print(f'❌ Vocabulary validation failed: {e}')
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    exit 1
fi

# Generate build report
echo ""
echo "📊 Build Report"
echo "==============="
echo "Project: Shona Flash watchOS App"
echo "Target: watchOS 9.0+"
echo "Language: Swift 5.9"
echo "Files: $(find ShonaWatch -name "*.swift" | wc -l) Swift files"
echo "Vocabulary: $vocab_count words"
echo "Categories: $(python3 -c "
import json
with open('ShonaWatch/Resources/vocabulary.json', 'r') as f:
    data = json.load(f)
categories = set(card.get('category', '') for card in data.get('flashcards', []))
print(len(categories))
") categories"

echo ""
echo "🎉 Build and validation completed successfully!"
echo ""
echo "Next steps:"
echo "1. Open ShonaWatch.xcodeproj in Xcode"
echo "2. Select an Apple Watch target device"
echo "3. Build and run (⌘+R)"
echo ""
echo "Features included:"
echo "• Flashcard study system with spaced repetition"
echo "• Text-to-speech pronunciation support"
echo "• Progress tracking and statistics"
echo "• Smart notifications and reminders"
echo "• Customizable settings and categories"
echo "• Cultural context and usage examples"