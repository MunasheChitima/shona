#!/bin/bash

# Shona Learning App E2E Test Runner with Video Recording
echo "🎬 Starting Shona Learning App E2E Tests with Video Recording..."

# Create test-screenshots directory
mkdir -p test-screenshots

# Start screen recording in background (macOS)
echo "📹 Starting screen recording..."
screencapture -v test-screenshots/test-recording.mov &
RECORDING_PID=$!

# Wait a moment for recording to start
sleep 2

# Run the tests
echo "🧪 Running E2E tests..."
npm test -- __tests__/e2e.test.ts

# Wait for tests to complete
TEST_EXIT_CODE=$?

# Stop screen recording
echo "🛑 Stopping screen recording..."
kill $RECORDING_PID 2>/dev/null || true

# Wait for recording to finish
sleep 3

# Check if tests passed
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed! Check test-screenshots/ for screenshots and video."
    echo "📹 Video recording saved as: test-screenshots/test-recording.mov"
else
    echo "❌ Some tests failed. Check the output above for details."
    echo "📹 Video recording saved as: test-screenshots/test-recording.mov"
fi

# Show test results summary
echo ""
echo "📊 Test Results Summary:"
echo "========================"
ls -la test-screenshots/
echo ""
echo "🎬 To view the video recording:"
echo "   open test-screenshots/test-recording.mov" 