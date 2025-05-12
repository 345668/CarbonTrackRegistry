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
  
  # Ensure static files are properly copied
  echo "Ensuring static files are available..."
  node copy-static-files.js
  
  # Create public directory in dist if it doesn't exist
  if [ ! -d "dist/public" ]; then
    echo "Creating public directory in dist..."
    mkdir -p dist/public
  fi
  
  # Copy static files from server/public to dist/public if needed
  if [ -d "server/public" ] && [ "$(ls -A server/public 2>/dev/null)" ]; then
    echo "Copying static files from server/public to dist/public..."
    cp -R server/public/* dist/public/
  fi
  
  echo "Build process completed."
fi

# Create a simple index.html if it doesn't exist in dist/public
if [ ! -f "dist/public/index.html" ]; then
  echo "Creating fallback index.html..."
  mkdir -p dist/public
  cat > dist/public/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carbon Registry Platform - Radical Zero</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #0A192F;
      color: #E2E8F0;
    }
    .container {
      max-width: 90%;
      width: 600px;
      padding: 2rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(91, 103, 248, 0.3);
      box-shadow: 0 0 20px rgba(91, 103, 248, 0.2);
      background-color: rgba(11, 27, 51, 0.9);
    }
    h1 { 
      color: #5b67f8; 
      margin-top: 0; 
      font-size: 2rem;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(90deg, #5b67f8, #4353e0);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      font-weight: 500;
      margin-top: 1rem;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Carbon Registry Platform</h1>
    <p>Welcome to the Carbon Registry Platform. Please log in to access the system.</p>
    <a href="/auth" class="btn">Login to Platform</a>
  </div>
</body>
</html>
EOL
fi

# Log the directories to help with debugging
echo "Content of dist directory:"
ls -la dist/
echo "Content of dist/public directory:"
ls -la dist/public/ 2>/dev/null || echo "dist/public directory does not exist or is empty"

# Run the compiled application
node dist/index.js