#!/bin/bash

# Deployment script for Shona Learn Web App
# Usage: ./deploy.sh [vercel|netlify|docker]

set -e

PLATFORM=${1:-vercel}

echo "🚀 Deploying Shona Learn Web App to ${PLATFORM}..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found"
    echo "📝 Creating from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual values before deploying"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm run test || {
    echo "⚠️  Tests failed, but continuing with deployment..."
}

# Run linting
echo "🔍 Running linter..."
npm run lint || {
    echo "⚠️  Linting issues found, but continuing with deployment..."
}

case $PLATFORM in
    vercel)
        echo "📦 Deploying to Vercel..."
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        # Deploy
        vercel --prod
        
        echo "✅ Deployed to Vercel!"
        ;;
        
    netlify)
        echo "📦 Deploying to Netlify..."
        
        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        
        # Build
        npm run build
        
        # Deploy
        netlify deploy --prod
        
        echo "✅ Deployed to Netlify!"
        ;;
        
    docker)
        echo "🐳 Building and deploying Docker container..."
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed"
            exit 1
        fi
        
        # Build image
        echo "🔨 Building Docker image..."
        docker build -t shona-learn:latest .
        
        # Run with docker-compose
        echo "🚀 Starting containers..."
        docker-compose up -d
        
        echo "✅ Deployed with Docker!"
        echo "📍 App running at: http://localhost:3000"
        echo "💡 To view logs: docker-compose logs -f"
        echo "💡 To stop: docker-compose down"
        ;;
        
    *)
        echo "❌ Invalid platform. Use: vercel, netlify, or docker"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Post-deployment checklist:"
echo "  ✓ Test the deployed app"
echo "  ✓ Check database migrations"
echo "  ✓ Verify environment variables"
echo "  ✓ Monitor error logs"
