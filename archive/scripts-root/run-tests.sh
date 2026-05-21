#!/bin/bash

# Shona Learning App E2E Test Runner
echo "🧪 Starting Shona Learning App E2E Tests..."

# Create test-screenshots directory
mkdir -p test-screenshots

# Run the tests
echo "🚀 Running comprehensive application tests..."
npm test -- __tests__/e2e.test.ts

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "✅ All tests passed! Check test-screenshots/ for screenshots."
else
    echo "❌ Some tests failed. Check the output above for details."
fi

# Show test results summary
echo ""
echo "📊 Test Results Summary:"
echo "========================"
ls -la test-screenshots/
echo ""
echo "📸 Screenshots taken during testing:"
find test-screenshots -name "*.png" | sort 