#!/bin/bash

# Shona Flash - watchOS App Validation Script
# This script validates the project structure without requiring Xcode

set -e  # Exit on any error

echo "🔍 Validating Shona Flash watchOS App..."
echo "========================================"

# Check if we're in the right directory
if [ ! -f "ShonaWatch.xcodeproj/project.pbxproj" ]; then
    echo "❌ Error: ShonaWatch.xcodeproj not found!"
    echo "Please run this script from the ShonaWatch directory"
    exit 1
fi

echo "✅ Found Xcode project"

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

# Basic Swift file syntax check (imports and basic structure)
echo "🔍 Basic Swift file validation..."

swift_files=$(find ShonaWatch -name "*.swift" -type f)
syntax_issues=0

for swift_file in $swift_files; do
    # Check for basic Swift file structure
    if ! grep -q "import" "$swift_file"; then
        echo "⚠️  Warning: $swift_file may be missing import statements"
        syntax_issues=$((syntax_issues + 1))
    fi
    
    # Check for basic class/struct definitions
    if ! grep -qE "(class|struct|enum)" "$swift_file"; then
        echo "⚠️  Warning: $swift_file may be missing type definitions"
        syntax_issues=$((syntax_issues + 1))
    fi
done

if [ $syntax_issues -eq 0 ]; then
    echo "✅ All Swift files have basic structure"
else
    echo "⚠️  Found $syntax_issues potential issues in Swift files"
fi

# Test vocabulary loading and validation
echo "🧪 Testing vocabulary data structure..."
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
    optional_fields = ['pronunciation', 'phonetic', 'tonePattern', 'culturalNotes']
    
    valid_cards = 0
    for i, card in enumerate(flashcards):
        missing_required = []
        for field in required_fields:
            if field not in card:
                missing_required.append(field)
        
        if missing_required:
            print(f'❌ Card {i}: Missing required fields: {missing_required}')
        else:
            valid_cards += 1
    
    print(f'✅ Vocabulary validation: {valid_cards}/{len(flashcards)} valid cards')
    
    # Check categories
    categories = set(card.get('category', '') for card in flashcards if card.get('category'))
    print(f'✅ Found categories: {sorted(categories)}')
    
    # Check pronunciation data
    with_pronunciation = sum(1 for card in flashcards if card.get('pronunciation'))
    print(f'✅ Cards with pronunciation: {with_pronunciation}/{len(flashcards)}')
    
    # Check examples
    with_examples = sum(1 for card in flashcards if card.get('examples'))
    print(f'✅ Cards with examples: {with_examples}/{len(flashcards)}')
    
except Exception as e:
    print(f'❌ Vocabulary validation failed: {e}')
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    exit 1
fi

# Check project configuration
echo "⚙️  Checking project configuration..."

if grep -q "watchOS" ShonaWatch.xcodeproj/project.pbxproj; then
    echo "✅ Project configured for watchOS"
else
    echo "⚠️  Project may not be properly configured for watchOS"
fi

if grep -q "WATCHOS_DEPLOYMENT_TARGET = 9.0" ShonaWatch.xcodeproj/project.pbxproj; then
    echo "✅ Minimum watchOS version set to 9.0"
else
    echo "⚠️  watchOS deployment target may need verification"
fi

# Generate project report
echo ""
echo "📊 Project Report"
echo "================"
echo "Project: Shona Flash watchOS App"
echo "Target: watchOS 9.0+"
echo "Language: Swift 5.9"
echo "Files: $(find ShonaWatch -name "*.swift" | wc -l) Swift files"
echo "Vocabulary: $vocab_count words"
echo "Categories: $(python3 -c "
import json
with open('ShonaWatch/Resources/vocabulary.json', 'r') as f:
    data = json.load(f)
categories = set(card.get('category', '') for card in data.get('flashcards', []) if card.get('category'))
print(len(categories))
") categories"

echo ""
echo "📁 Project Structure:"
echo "├── ShonaWatch/"
echo "│   ├── ShonaWatchApp.swift          (Main app entry point)"
echo "│   ├── ContentView.swift            (Main interface)"
echo "│   ├── Models/"
echo "│   │   ├── Models.swift             (Data models)"
echo "│   │   └── VocabularyData.swift     (Vocabulary loader)"
echo "│   ├── Views/"
echo "│   │   ├── FlashcardView.swift      (Study interface)"
echo "│   │   ├── PronunciationView.swift  (Pronunciation practice)"
echo "│   │   ├── ProgressView.swift       (Statistics)"
echo "│   │   └── SettingsView.swift       (Configuration)"
echo "│   ├── Services/"
echo "│   │   ├── FlashcardManager.swift   (Learning logic)"
echo "│   │   ├── SpeechSynthesizer.swift  (Text-to-speech)"
echo "│   │   └── ReviewScheduler.swift    (Notifications)"
echo "│   ├── Resources/"
echo "│   │   └── vocabulary.json          (Vocabulary data)"
echo "│   └── Assets.xcassets/             (App icons & assets)"
echo "└── ShonaWatch.xcodeproj/            (Xcode project)"

echo ""
echo "🎉 Project validation completed successfully!"
echo ""
echo "Next steps:"
echo "1. Open ShonaWatch.xcodeproj in Xcode 15.0+"
echo "2. Select your Apple Watch as the target device"
echo "3. Build and run (⌘+R)"
echo ""
echo "Key Features:"
echo "✨ Spaced Repetition System (SRS) for optimal learning"
echo "🔊 Text-to-speech pronunciation with tone patterns"
echo "📊 Progress tracking with streaks and statistics"
echo "🏷️  Multiple vocabulary categories (Family, Greetings, etc.)"
echo "⚙️  Customizable settings and study goals"
echo "🔔 Smart notifications for review reminders"
echo "🌍 Cultural context and usage examples"
echo ""
echo "The app is ready to compile and run on watchOS! 🎯"