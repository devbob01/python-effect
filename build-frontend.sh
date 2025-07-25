#!/bin/bash

echo "🚀 Building Popbox Effect React Frontend..."

# Navigate to frontend directory
cd frontend

# Check if npm is available, if not try npx
if command -v npm &> /dev/null; then
    NPM_CMD="npm"
elif command -v npx &> /dev/null; then
    NPM_CMD="npx npm"
else
    echo "❌ Neither npm nor npx found. Trying with node package manager..."
    NPM_CMD="node $(which npm)"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing React dependencies..."
    $NPM_CMD install
fi

# Build the React app for production
echo "🔨 Building React app..."
$NPM_CMD run build

# Go back to root directory
cd ..

echo "✅ Frontend build complete!"
echo "🌐 React app built and ready for deployment" 