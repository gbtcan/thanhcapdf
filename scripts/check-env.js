// Simple script to check if environment variables are set
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Try to load .env file manually
try {
  const envPath = resolve(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    console.log('Found .env file at:', envPath);
    dotenv.config({ path: envPath });
  } else {
    console.log('No .env file found at:', envPath);
  }
} catch (err) {
  console.error('Error checking for .env file:', err);
}

// Check Supabase environment variables
console.log('\nEnvironment Variables Status:');
console.log('--------------------------');
console.log(`VITE_SUPABASE_URL: ${process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`VITE_SUPABASE_ANON_KEY: ${process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);

// Print actual values if they exist (be careful with sensitive data)
if (process.env.VITE_SUPABASE_URL) {
  console.log(`\nSupabase URL: ${process.env.VITE_SUPABASE_URL}`);
}

// Print the path to where the app is looking for environment variables
console.log('\nWorking directory:', process.cwd());

/**
 * Environment Variables Checker
 * This script checks if all required environment variables are set and valid.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of required environment variables
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

// Optional but recommended variables
const recommendedVars = [
  'VITE_APP_NAME',
  'VITE_APP_DESCRIPTION',
  'VITE_APP_URL',
  'VITE_ENABLE_FORUM',
  'VITE_ENABLE_ANALYTICS',
  'VITE_ENABLE_VIEW_TRACKING'
];

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}Checking environment variables...${colors.reset}\n`);

// Check if .env file exists
const envPath = path.resolve(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
  console.error(`${colors.red}Error: .env file not found.${colors.reset}`);
  console.log(`Please copy .env.example to .env and fill in your values.`);
  process.exit(1);
}

// Load environment variables from .env file
dotenv.config({ path: envPath });

// Check required variables
let missingRequired = false;
console.log(`${colors.blue}Required variables:${colors.reset}`);
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`${colors.red}✘ ${varName} is missing${colors.reset}`);
    missingRequired = true;
  } else {
    console.log(`${colors.green}✓ ${varName} is set${colors.reset}`);
  }
});

if (missingRequired) {
  console.error(`\n${colors.red}Error: Missing required environment variables. Please set them in your .env file.${colors.reset}`);
  process.exit(1);
}

// Check recommended variables
let missingRecommended = false;
console.log(`\n${colors.blue}Recommended variables:${colors.reset}`);
recommendedVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`${colors.yellow}⚠ ${varName} is not set${colors.reset}`);
    missingRecommended = true;
  } else {
    console.log(`${colors.green}✓ ${varName} is set${colors.reset}`);
  }
});

if (missingRecommended) {
  console.warn(`\n${colors.yellow}Warning: Some recommended environment variables are missing.${colors.reset}`);
  console.warn(`The application will still function, but some features might be affected.`);
}

// Validate Supabase URL format
const supabaseUrl = process.env.VITE_SUPABASE_URL;
if (supabaseUrl && !supabaseUrl.match(/^https:\/\/.+\.supabase\.co$/)) {
  console.warn(`\n${colors.yellow}Warning: VITE_SUPABASE_URL doesn't follow the expected format.${colors.reset}`);
  console.warn(`Expected format: https://something.supabase.co`);
}

// Validate Supabase key format
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
if (supabaseKey && supabaseKey.length < 30) {
  console.warn(`\n${colors.yellow}Warning: VITE_SUPABASE_ANON_KEY seems too short to be valid.${colors.reset}`);
}

console.log(`\n${colors.green}Environment check complete!${colors.reset}`);
