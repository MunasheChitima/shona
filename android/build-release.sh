#!/bin/bash

# Script to build Android release APK/AAB
# Usage: ./build-release.sh [apk|aab]

set -e

BUILD_TYPE=${1:-aab}

echo "🔧 Building Android Release ${BUILD_TYPE^^}..."

# Check if keystore exists
if [ ! -f "shona-release-key.jks" ] && [ -z "$SHONA_RELEASE_STORE_FILE" ]; then
    echo "⚠️  Warning: Keystore not found. Using debug signing."
    echo "📝 To create a release keystore, run: ./create-keystore.sh"
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build based on type
if [ "$BUILD_TYPE" = "apk" ]; then
    echo "📦 Building Release APK..."
    ./gradlew assembleRelease
    
    echo "✅ APK built successfully!"
    echo "📍 Location: app/build/outputs/apk/release/app-release.apk"
    
    # Calculate APK size
    if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
        SIZE=$(du -h app/build/outputs/apk/release/app-release.apk | cut -f1)
        echo "📊 APK Size: $SIZE"
    fi
    
elif [ "$BUILD_TYPE" = "aab" ]; then
    echo "📦 Building Release App Bundle (AAB)..."
    ./gradlew bundleRelease
    
    echo "✅ AAB built successfully!"
    echo "📍 Location: app/build/outputs/bundle/release/app-release.aab"
    
    # Calculate AAB size
    if [ -f "app/build/outputs/bundle/release/app-release.aab" ]; then
        SIZE=$(du -h app/build/outputs/bundle/release/app-release.aab | cut -f1)
        echo "📊 AAB Size: $SIZE"
    fi
    
else
    echo "❌ Invalid build type. Use 'apk' or 'aab'"
    exit 1
fi

echo ""
echo "🎉 Build complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Test the release build on a device"
echo "  2. Upload to Google Play Console"
echo "  3. Submit for review"
