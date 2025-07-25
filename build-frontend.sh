#!/bin/bash

echo "🚀 Building Popbox Effect React Frontend..."

# Navigate to frontend directory
cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing React dependencies..."
    npm install
fi

# Build the React app for production
echo "🔨 Building React app..."
npm run build

# Go back to root directory
cd ..

echo "✅ Frontend build complete!"
echo "🌐 React app built and ready for deployment" 