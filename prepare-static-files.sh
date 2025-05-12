#!/bin/bash
# Script to prepare static files for production deployment

echo "Preparing static files for production deployment..."

# Create dist/public directory if it doesn't exist
if [ ! -d "dist/public" ]; then
  echo "Creating dist/public directory..."
  mkdir -p dist/public
fi

# Copy static files from server/public to dist/public
if [ -d "server/public" ]; then
  echo "Copying static files from server/public to dist/public..."
  cp -R server/public/* dist/public/
  echo "Static files copied successfully!"
else
  echo "Warning: server/public directory not found!"
fi

# List the contents of the directories
echo "Contents of dist/public directory:"
ls -la dist/public/

echo "Static files preparation completed."