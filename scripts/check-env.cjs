/**
 * Environment Variables Checker
 * This script checks if all required environment variables are set and valid.
 */

// List of required environment variables
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

/**
 * CommonJS wrapper for check-env.js
 * Use this if you need to run the script directly with Node.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('Running environment variable checker via ESM wrapper...');

try {
  execSync('node check-env.js', { 
    stdio: 'inherit',
    cwd: __dirname
  });
} catch (error) {
  // The ESM script already handles its own error messages and exit codes
  process.exit(1);
}
