import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Source and destination directories
const sourceDir = path.join(__dirname, 'server', 'public');
const destDir = path.join(__dirname, 'dist', 'public');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`Created directory: ${destDir}`);
}

// Copy files from source to destination
const copyFiles = (src, dest) => {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      // Create destination subdirectory if it doesn't exist
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
        console.log(`Created directory: ${destPath}`);
      }
      // Recursively copy subdirectory
      copyFiles(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied file: ${entry.name}`);
    }
  }
};

try {
  // Check if source directory exists before copying
  if (fs.existsSync(sourceDir)) {
    console.log(`Copying static files from ${sourceDir} to ${destDir}`);
    copyFiles(sourceDir, destDir);
    console.log('Static files copied successfully!');
  } else {
    console.error(`Source directory not found: ${sourceDir}`);
  }
} catch (error) {
  console.error('Error copying static files:', error);
}