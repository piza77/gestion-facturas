#!/bin/bash

# E2E Testing Utility Script
# Usage: ./test-e2e.sh [command]
# Commands: 
#   dev-server  - Start development server
#   open        - Open Cypress UI
#   run         - Run E2E tests headless
#   spec FILE   - Run specific test file
#   debug       - Run with debug mode
#   ci          - Run CI mode

set -e

cd "$(dirname "$0")/frontend" || exit 1

case "${1:-run}" in
  dev-server)
    echo "🚀 Starting development server on port 5173..."
    npm run serve
    ;;
  open)
    echo "📱 Opening Cypress UI..."
    npm run cypress:open
    ;;
  run)
    echo "🧪 Running E2E tests (headless)..."
    npm run cypress:run
    ;;
  spec)
    if [ -z "$2" ]; then
      echo "❌ Error: Specify test file"
      echo "Usage: $0 spec cypress/e2e/auth.cy.js"
      exit 1
    fi
    echo "🧪 Running specific test: $2"
    npx cypress run --spec "$2"
    ;;
  debug)
    echo "🐛 Running E2E tests with debug mode..."
    npx cypress run --debug
    ;;
  ci)
    echo "🔄 Running E2E tests in CI mode..."
    npm run cypress:ci
    ;;
  all)
    echo "🚀 Starting full E2E test cycle..."
    echo "1️⃣ Starting development server..."
    npm run serve > /dev/null 2>&1 &
    DEV_PID=$!
    
    sleep 5
    
    echo "2️⃣ Running E2E tests..."
    npm run cypress:run
    
    echo "3️⃣ Stopping development server..."
    kill $DEV_PID 2>/dev/null || true
    
    echo "✅ E2E test cycle complete!"
    ;;
  *)
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  dev-server  - Start development server on port 5173"
    echo "  open        - Open Cypress interactive UI"
    echo "  run         - Run all E2E tests (headless)"
    echo "  spec FILE   - Run specific test file"
    echo "  debug       - Run tests with debug mode"
    echo "  ci          - Run tests in CI mode"
    echo "  all         - Full cycle: start server, run tests, cleanup"
    echo ""
    echo "Examples:"
    echo "  ./test-e2e.sh dev-server"
    echo "  ./test-e2e.sh open"
    echo "  ./test-e2e.sh spec cypress/e2e/auth.cy.js"
    exit 1
    ;;
esac
