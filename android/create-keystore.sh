#!/bin/bash

# Script to create a release keystore for Android app signing
# This should be run once and the keystore should be kept secure

set -e

echo "🔐 Creating Android Release Keystore"
echo ""
echo "⚠️  IMPORTANT: Keep this keystore and passwords secure!"
echo "   Store them in a password manager and backup securely."
echo ""

# Default values
KEYSTORE_FILE="shona-release-key.jks"
KEY_ALIAS="shona-release"
VALIDITY_DAYS=10000

# Prompt for passwords
read -sp "Enter keystore password: " STORE_PASSWORD
echo ""
read -sp "Confirm keystore password: " STORE_PASSWORD_CONFIRM
echo ""

if [ "$STORE_PASSWORD" != "$STORE_PASSWORD_CONFIRM" ]; then
    echo "❌ Passwords don't match!"
    exit 1
fi

read -sp "Enter key password (can be same as keystore): " KEY_PASSWORD
echo ""
read -sp "Confirm key password: " KEY_PASSWORD_CONFIRM
echo ""

if [ "$KEY_PASSWORD" != "$KEY_PASSWORD_CONFIRM" ]; then
    echo "❌ Passwords don't match!"
    exit 1
fi

# Prompt for certificate details
echo ""
echo "📝 Certificate Details:"
read -p "Your name (CN): " CN
read -p "Organization (O): " ORG
read -p "City (L): " CITY
read -p "State/Province (ST): " STATE
read -p "Country code (C, e.g., US): " COUNTRY

# Generate keystore
echo ""
echo "🔨 Generating keystore..."

keytool -genkeypair \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity $VALIDITY_DAYS \
    -keystore "$KEYSTORE_FILE" \
    -storepass "$STORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "CN=$CN, O=$ORG, L=$CITY, ST=$STATE, C=$COUNTRY"

echo ""
echo "✅ Keystore created successfully!"
echo ""
echo "📁 Keystore file: $KEYSTORE_FILE"
echo "🔑 Key alias: $KEY_ALIAS"
echo ""
echo "📋 Add these to your gradle.properties (DO NOT COMMIT):"
echo "   SHONA_RELEASE_STORE_FILE=$KEYSTORE_FILE"
echo "   SHONA_RELEASE_STORE_PASSWORD=$STORE_PASSWORD"
echo "   SHONA_RELEASE_KEY_ALIAS=$KEY_ALIAS"
echo "   SHONA_RELEASE_KEY_PASSWORD=$KEY_PASSWORD"
echo ""
echo "🔒 For CI/CD, set these as environment variables or secrets"
echo ""
echo "⚠️  BACKUP THIS KEYSTORE SECURELY - YOU CANNOT RECOVER IT IF LOST!"
