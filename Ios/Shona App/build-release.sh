#!/bin/bash

# Script to build iOS release IPA
# Usage: ./build-release.sh [app-store|adhoc|development]

set -e

EXPORT_METHOD=${1:-app-store}
SCHEME="Shona App"
WORKSPACE="Shona App.xcodeproj"
CONFIGURATION="Release"
ARCHIVE_PATH="build/ShonaApp.xcarchive"
EXPORT_PATH="build/export"

echo "🍎 Building iOS Release IPA..."
echo "📱 Export Method: ${EXPORT_METHOD}"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script must be run on macOS"
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode is not installed or xcodebuild is not in PATH"
    exit 1
fi

# Select export options based on method
case $EXPORT_METHOD in
    app-store)
        EXPORT_OPTIONS="ExportOptions.plist"
        ;;
    adhoc)
        EXPORT_OPTIONS="ExportOptions-adhoc.plist"
        ;;
    development)
        EXPORT_OPTIONS="ExportOptions-development.plist"
        ;;
    *)
        echo "❌ Invalid export method. Use: app-store, adhoc, or development"
        exit 1
        ;;
esac

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf build
xcodebuild clean -scheme "$SCHEME" -configuration "$CONFIGURATION"

# Build archive
echo "🔨 Building archive..."
xcodebuild archive \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -archivePath "$ARCHIVE_PATH" \
    -destination 'generic/platform=iOS' \
    CODE_SIGN_STYLE=Automatic \
    -allowProvisioningUpdates

if [ ! -d "$ARCHIVE_PATH" ]; then
    echo "❌ Archive build failed"
    exit 1
fi

echo "✅ Archive created successfully!"

# Export IPA
echo "📦 Exporting IPA..."
xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$EXPORT_PATH" \
    -exportOptionsPlist "$EXPORT_OPTIONS" \
    -allowProvisioningUpdates

if [ ! -f "$EXPORT_PATH/Shona App.ipa" ]; then
    echo "❌ IPA export failed"
    exit 1
fi

echo "✅ IPA exported successfully!"
echo "📍 Location: $EXPORT_PATH/Shona App.ipa"

# Calculate IPA size
SIZE=$(du -h "$EXPORT_PATH/Shona App.ipa" | cut -f1)
echo "📊 IPA Size: $SIZE"

echo ""
echo "🎉 Build complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Test the IPA on a device using TestFlight or direct installation"
echo "  2. Upload to App Store Connect using Transporter or xcodebuild"
echo "  3. Submit for review"
echo ""
echo "💡 To upload to App Store Connect:"
echo "   xcrun altool --upload-app -f \"$EXPORT_PATH/Shona App.ipa\" -t ios -u YOUR_APPLE_ID -p YOUR_APP_SPECIFIC_PASSWORD"
