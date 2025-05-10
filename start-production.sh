#!/bin/bash
# Production startup script

echo "Starting Carbon Registry in production mode..."

# Set Node environment to production
export NODE_ENV=production

# Check if compiled files exist
if [ ! -f "dist/index.js" ]; then
  echo "Building application for production..."
  # Build the application (compiles TypeScript to JavaScript)
  npm run build
fi

# Run the compiled application
node dist/index.js