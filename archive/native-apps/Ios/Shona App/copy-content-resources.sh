#!/bin/bash

# Copy Content Resources to App Bundle
# Add this script as a Build Phase in Xcode:
# 1. Select your target in Xcode
# 2. Go to Build Phases
# 3. Click + and choose "New Run Script Phase"
# 4. Paste this script or reference it with: ${SRCROOT}/copy-content-resources.sh

echo "Copying Content resources to app bundle..."

# Create Content directory in app bundle if it doesn't exist
mkdir -p "${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/Content"

# Copy all JSON files from Content directory
if [ -d "${SRCROOT}/Shona App/Content" ]; then
    cp -R "${SRCROOT}/Shona App/Content/"*.json "${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/Content/" 2>/dev/null || true
    echo "✅ Content resources copied successfully"
    
    # List copied files for verification
    echo "Copied files:"
    ls -la "${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/Content/"
else
    echo "⚠️ Warning: Content directory not found at ${SRCROOT}/Shona App/Content"
fi

# Verify critical files exist
REQUIRED_FILES=("lessons.json" "vocabulary.json" "quests.json" "pronunciation-exercises.json")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/Content/$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo "✅ All required content files are present"
else
    echo "❌ Error: Missing required files: ${MISSING_FILES[*]}"
    exit 1
fi