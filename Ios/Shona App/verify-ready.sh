#!/bin/bash

echo "🔍 Verifying Shona App is ready to run..."
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES=0

# Check if we're in the right directory
if [ ! -f "Shona App.xcodeproj/project.pbxproj" ]; then
    echo -e "${RED}❌ Not in the correct directory. Please run from 'Ios/Shona App' folder${NC}"
    exit 1
fi

echo "📁 Checking project structure..."

# Check for essential Swift files
SWIFT_FILES=(
    "Shona App/Shona_AppApp.swift"
    "Shona App/ContentView.swift"
    "Shona App/Models.swift"
    "Shona App/ContentManager.swift"
    "Shona App/OnboardingView.swift"
    "Shona App/HomeView.swift"
    "Shona App/LearnView.swift"
    "Shona App/PronunciationView.swift"
)

for file in "${SWIFT_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        ((ISSUES++))
    fi
done

echo -e "\n📚 Checking Content JSON files..."

# Check for content files
CONTENT_FILES=(
    "Shona App/Content/lessons.json"
    "Shona App/Content/vocabulary.json"
    "Shona App/Content/quests.json"
    "Shona App/Content/pronunciation-exercises.json"
    "Shona App/Content/flashcards.json"
    "Shona App/Content/content-manifest.json"
)

for file in "${CONTENT_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(wc -l < "$file")
        echo -e "${GREEN}✅ $file (${SIZE} lines)${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        ((ISSUES++))
    fi
done

echo -e "\n🔧 Checking build configuration..."

# Check for build script
if [ -f "copy-content-resources.sh" ]; then
    if [ -x "copy-content-resources.sh" ]; then
        echo -e "${GREEN}✅ Build script is executable${NC}"
    else
        echo -e "${YELLOW}⚠️  Build script exists but not executable. Running: chmod +x copy-content-resources.sh${NC}"
        chmod +x copy-content-resources.sh
    fi
else
    echo -e "${RED}❌ Build script missing${NC}"
    ((ISSUES++))
fi

# Check for privacy permissions in project file
if grep -q "NSMicrophoneUsageDescription" "Shona App.xcodeproj/project.pbxproj"; then
    echo -e "${GREEN}✅ Microphone permission configured${NC}"
else
    echo -e "${RED}❌ Microphone permission not found in project${NC}"
    ((ISSUES++))
fi

if grep -q "NSSpeechRecognitionUsageDescription" "Shona App.xcodeproj/project.pbxproj"; then
    echo -e "${GREEN}✅ Speech recognition permission configured${NC}"
else
    echo -e "${RED}❌ Speech recognition permission not found in project${NC}"
    ((ISSUES++))
fi

echo -e "\n📊 Summary:"
echo "=========="

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Your app is ready to run.${NC}"
    echo -e "\n🚀 Next steps:"
    echo "1. Open Xcode: open \"Shona App.xcodeproj\""
    echo "2. Add Content folder as folder reference (should appear blue)"
    echo "3. Add Run Script phase with: \"\${SRCROOT}/copy-content-resources.sh\""
    echo "4. Select a simulator and press Cmd+R to run!"
else
    echo -e "${RED}❌ Found $ISSUES issues that need attention.${NC}"
    echo -e "${YELLOW}Please fix the issues above before running the app.${NC}"
fi

echo -e "\n📱 Expected first screen: Welcome screen with 'Mauya - Welcome!'"
echo "📝 See RUN_AND_TEST_GUIDE.md for detailed instructions"