#!/bin/bash
echo "Testing CRM App..."

# Check if package.json exists
if [ -f "package.json" ]; then
    echo "✓ package.json found"
else
    echo "✗ package.json missing"
    exit 1
fi

# Check if src/App.jsx exists
if [ -f "src/App.jsx" ]; then
    echo "✓ App.jsx found"
else
    echo "✗ App.jsx missing"
    exit 1
fi

# Check if critical pages exist
for page in "EnhancedDashboard.jsx" "Clients.jsx" "Login.jsx"; do
    if [ -f "src/pages/$page" ]; then
        echo "✓ $page found"
    else
        echo "✗ $page missing"
    fi
done

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✓ Dependencies installed"
else
    echo "✗ Dependencies not installed"
    echo "Run: npm install"
fi

echo "App structure test complete!"
