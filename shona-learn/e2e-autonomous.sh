#!/bin/bash

echo "🚀 Starting autonomous E2E testing..."

# Start Next.js server in the background
echo "📡 Starting Next.js server..."
npm run dev &
NEXT_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
until curl -s http://localhost:3001 > /dev/null; do
  echo "   Still waiting..."
  sleep 2
done

echo "✅ Server is ready! Running E2E tests..."

# Run E2E tests
npm run test:e2e
TEST_EXIT_CODE=$?

echo "🧹 Cleaning up..."

# Kill the Next.js server
kill $NEXT_PID 2>/dev/null

echo "🏁 E2E testing complete!"
exit $TEST_EXIT_CODE 