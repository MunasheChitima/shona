#!/bin/bash

# Script to verify deployment readiness across all platforms
# Usage: ./verify-deployment-ready.sh

set -e

echo "🔍 Verifying Deployment Readiness for Shona Learn"
echo "=================================================="
echo ""

ERRORS=0
WARNINGS=0

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Helper functions
error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

info() {
    echo "ℹ️  $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "📋 Checking General Requirements..."
echo "-----------------------------------"

# Check Git
if command_exists git; then
    success "Git is installed"
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    info "Git version: $GIT_VERSION"
else
    error "Git is not installed"
fi

# Check if in git repo
if [ -d .git ]; then
    success "Repository is a git repository"
else
    warning "Not in a git repository"
fi

echo ""
echo "🌐 Checking Web App Requirements..."
echo "-----------------------------------"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    success "Node.js is installed"
    info "Node.js version: $NODE_VERSION"
    
    # Check version is 20+
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 20 ]; then
        success "Node.js version is 20 or higher"
    else
        warning "Node.js version should be 20 or higher (current: $NODE_VERSION)"
    fi
else
    error "Node.js is not installed"
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    success "npm is installed"
    info "npm version: $NPM_VERSION"
else
    error "npm is not installed"
fi

# Check web app files
if [ -d "shona-learn" ]; then
    success "Web app directory exists"
    
    if [ -f "shona-learn/package.json" ]; then
        success "package.json exists"
    else
        error "package.json not found in shona-learn/"
    fi
    
    if [ -f "shona-learn/.env.example" ]; then
        success ".env.example exists"
    else
        warning ".env.example not found"
    fi
    
    if [ -f "shona-learn/Dockerfile" ]; then
        success "Dockerfile exists"
    else
        warning "Dockerfile not found"
    fi
    
    if [ -f "shona-learn/vercel.json" ]; then
        success "vercel.json exists"
    else
        warning "vercel.json not found"
    fi
else
    error "Web app directory (shona-learn/) not found"
fi

echo ""
echo "🤖 Checking Android App Requirements..."
echo "---------------------------------------"

# Check Java
if command_exists java; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    success "Java is installed"
    info "Java version: $JAVA_VERSION"
else
    warning "Java is not installed (required for Android builds)"
fi

# Check Android files
if [ -d "android" ]; then
    success "Android app directory exists"
    
    if [ -f "android/build.gradle.kts" ]; then
        success "build.gradle.kts exists"
    else
        error "build.gradle.kts not found"
    fi
    
    if [ -f "android/settings.gradle.kts" ]; then
        success "settings.gradle.kts exists"
    else
        error "settings.gradle.kts not found"
    fi
    
    if [ -f "android/app/build.gradle.kts" ]; then
        success "app/build.gradle.kts exists"
    else
        error "app/build.gradle.kts not found"
    fi
    
    if [ -f "android/app/proguard-rules.pro" ]; then
        success "ProGuard rules exist"
    else
        warning "ProGuard rules not found"
    fi
    
    if [ -f "android/build-release.sh" ]; then
        success "build-release.sh exists"
        if [ -x "android/build-release.sh" ]; then
            success "build-release.sh is executable"
        else
            warning "build-release.sh is not executable"
        fi
    else
        error "build-release.sh not found"
    fi
else
    error "Android app directory not found"
fi

echo ""
echo "🍎 Checking iOS App Requirements..."
echo "-----------------------------------"

# Check if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    success "Running on macOS"
    
    # Check Xcode
    if command_exists xcodebuild; then
        XCODE_VERSION=$(xcodebuild -version | head -n 1)
        success "Xcode is installed"
        info "Xcode version: $XCODE_VERSION"
    else
        warning "Xcode is not installed (required for iOS builds)"
    fi
else
    warning "Not on macOS (iOS builds require macOS)"
fi

# Check iOS files
if [ -d "Ios/Shona App" ]; then
    success "iOS app directory exists"
    
    if [ -f "Ios/Shona App/Shona App.xcodeproj/project.pbxproj" ]; then
        success "Xcode project exists"
    else
        error "Xcode project not found"
    fi
    
    if [ -f "Ios/Shona App/ExportOptions.plist" ]; then
        success "Export options exist"
    else
        warning "ExportOptions.plist not found"
    fi
    
    if [ -f "Ios/Shona App/build-release.sh" ]; then
        success "build-release.sh exists"
        if [ -x "Ios/Shona App/build-release.sh" ]; then
            success "build-release.sh is executable"
        else
            warning "build-release.sh is not executable"
        fi
    else
        error "build-release.sh not found"
    fi
else
    error "iOS app directory not found"
fi

echo ""
echo "🔄 Checking CI/CD Configuration..."
echo "----------------------------------"

if [ -d ".github/workflows" ]; then
    success "GitHub workflows directory exists"
    
    if [ -f ".github/workflows/android-release.yml" ]; then
        success "Android workflow exists"
    else
        error "Android workflow not found"
    fi
    
    if [ -f ".github/workflows/ios-release.yml" ]; then
        success "iOS workflow exists"
    else
        error "iOS workflow not found"
    fi
    
    if [ -f ".github/workflows/web-deploy.yml" ]; then
        success "Web deploy workflow exists"
    else
        error "Web deploy workflow not found"
    fi
    
    if [ -f ".github/workflows/pr-checks.yml" ]; then
        success "PR checks workflow exists"
    else
        warning "PR checks workflow not found"
    fi
else
    error "GitHub workflows directory not found"
fi

if [ -f ".github/dependabot.yml" ]; then
    success "Dependabot configuration exists"
else
    warning "Dependabot configuration not found"
fi

echo ""
echo "📚 Checking Documentation..."
echo "----------------------------"

if [ -f "README.md" ]; then
    success "README.md exists"
else
    error "README.md not found"
fi

if [ -f "DEPLOYMENT_GUIDE.md" ]; then
    success "DEPLOYMENT_GUIDE.md exists"
else
    error "DEPLOYMENT_GUIDE.md not found"
fi

if [ -f "QUICK_START.md" ]; then
    success "QUICK_START.md exists"
else
    warning "QUICK_START.md not found"
fi

if [ -f "CONTRIBUTING.md" ]; then
    success "CONTRIBUTING.md exists"
else
    warning "CONTRIBUTING.md not found"
fi

if [ -f "CHANGELOG.md" ]; then
    success "CHANGELOG.md exists"
else
    warning "CHANGELOG.md not found"
fi

echo ""
echo "🔒 Checking Security Configuration..."
echo "-------------------------------------"

if [ -f ".gitignore" ]; then
    success ".gitignore exists"
    
    # Check for common security items
    if grep -q "\.env" .gitignore; then
        success ".env files are ignored"
    else
        warning ".env files should be in .gitignore"
    fi
    
    if grep -q "\.jks\|\.keystore" .gitignore; then
        success "Keystore files are ignored"
    else
        warning "Keystore files should be in .gitignore"
    fi
    
    if grep -q "\.p12\|\.mobileprovision" .gitignore; then
        success "iOS certificates are ignored"
    else
        warning "iOS certificates should be in .gitignore"
    fi
else
    error ".gitignore not found"
fi

# Check for accidentally committed secrets
info "Checking for common secret patterns..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    if git grep -l "api[_-]key\|secret\|password\|token" | grep -v ".sh$" | grep -v ".md$" | grep -v ".yml$" > /dev/null 2>&1; then
        warning "Potential secrets found in committed files (please verify manually)"
    else
        success "No obvious secrets found in committed files"
    fi
fi

echo ""
echo "=================================================="
echo "📊 Verification Summary"
echo "=================================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Your project is deployment-ready.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Found $WARNINGS warning(s), but no critical errors.${NC}"
    echo "   Your project is deployable, but some optional items are missing."
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS error(s) and $WARNINGS warning(s).${NC}"
    echo "   Please fix the errors before deploying."
    exit 1
fi
