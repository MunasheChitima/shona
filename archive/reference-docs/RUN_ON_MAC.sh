#!/bin/bash
# Run this script on your Mac after transferring the project

echo "🚀 Setting up Shona iOS App on Mac..."

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode is not installed. Please install Xcode from the Mac App Store."
    exit 1
fi

# Navigate to project directory
cd "Ios/Shona App" || exit 1

# Make build script executable
chmod +x copy-content-resources.sh

# Open in Xcode
echo "📱 Opening project in Xcode..."
open "Shona App.xcodeproj"

echo "
✅ Project opened in Xcode!

📝 IMPORTANT MANUAL STEPS:
1. In Xcode, right-click 'Shona App' folder
2. Choose 'Add Files to Shona App'
3. Select the 'Content' folder
4. Choose 'Create folder references' (folder will be blue)
5. In Build Phases, add Run Script: \${SRCROOT}/copy-content-resources.sh
6. Select iPhone simulator
7. Press Cmd+R to run!

🎯 First screen should show: 'Mauya - Welcome!'
"