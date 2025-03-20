/**
 * Script Index
 * 
 * This file documents the available scripts in the project and their purpose.
 * To run a script, use: npm run [script-name]
 */

const scripts = {
  // Build scripts
  "download-pdfjs": "Download PDF.js worker files (ES Module)",
  "download-pdfjs:cjs": "Download PDF.js worker files (CommonJS version)",
  "preflight": "Run preflight checks before building",
  "preflight:cjs": "Run preflight checks (CommonJS version)",
  
  // Database scripts
  "setup-db": "Set up database with migrations",
  "check-env": "Check if environment variables are set correctly",
  
  // Development scripts
  "dev": "Start development server",
  "dev:fix": "Start development server with MIME type fixes",
  
  // Build and deployment
  "build": "Build the application",
  "preview": "Preview the built application",
  
  // Testing
  "test": "Run tests",
  "test:ci": "Run tests in CI environment"
};

// This script is just documentation and doesn't do anything when run directly
console.log('Available scripts:');
Object.entries(scripts).forEach(([name, description]) => {
  console.log(`- ${name}: ${description}`);
});
console.log('\nRun a script with: npm run [script-name]');
