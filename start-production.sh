#!/bin/bash
# Production startup script

echo "Starting Carbon Registry in production mode..."

# Set Node environment to production
export NODE_ENV=production

# Run the application
node server/index.js