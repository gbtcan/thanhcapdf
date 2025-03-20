/**
 * This script creates a symbolic link from the node_modules PDF.js worker to public folder
 * This ensures that the worker is automatically available after npm install
 */

import { existsSync, symlinkSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the PDF.js worker in node_modules
const sourcePath = resolve(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.min.js');

// Path where we want to create the symlink
const targetDir = resolve(__dirname, '../public');
const targetPath = resolve(targetDir, 'pdf.worker.min.js');

// Create directory if it doesn't exist
if (!existsSync(targetDir)) {
  console.log(`Creating directory: ${targetDir}`);
  mkdirSync(targetDir, { recursive: true });
}

// Check if source file exists
if (!existsSync(sourcePath)) {
  console.error(`Source file does not exist: ${sourcePath}`);
  process.exit(1);
}

// Create symlink if target doesn't exist
if (!existsSync(targetPath)) {
  try {
    console.log(`Creating symlink from ${sourcePath} to ${targetPath}`);
    symlinkSync(sourcePath, targetPath);
    console.log('Symlink created successfully!');
  } catch (error) {
    console.error(`Failed to create symlink: ${error.message}`);
    
    // On Windows, creating symlinks requires admin privileges or developer mode enabled
    if (process.platform === 'win32') {
      console.log('\nOn Windows, you may need to:');
      console.log('1. Run this script as administrator, or');
      console.log('2. Enable Developer Mode in Windows settings\n');
    }
    
    process.exit(1);
  }
} else {
  console.log(`Target file already exists: ${targetPath}`);
}
