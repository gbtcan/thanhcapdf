/**
 * Project Cleanup Script
 * Removes unused files, build artifacts, and cleans up the project
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Define paths to clean
const pathsToClean = [
  // Build artifacts
  'dist',
  '.vite',
  'node_modules/.vite',
  
  // Caches
  '.cache',
  '.eslintcache',
  '.stylelintcache',
  
  // Logs
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  'pnpm-debug.log*',
  
  // IDE files
  '.idea',
  '.vscode-test'
];

// List of files/directories to clean
console.log('Cleaning project...');

pathsToClean.forEach(relativePath => {
  const fullPath = path.join(projectRoot, relativePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      // Check if it's a directory or file
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✓ Removed directory: ${relativePath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`✓ Removed file: ${relativePath}`);
      }
    }
  } catch (err) {
    console.error(`✗ Failed to remove ${relativePath}: ${err.message}`);
  }
});

console.log('Cleanup complete!');
