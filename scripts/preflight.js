/**
 * Preflight check script to ensure all dependencies and configurations are correct
 * Run this before building the application
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.blue}=== Catholic Hymn Book Preflight Check ===${colors.reset}\n`);

// Keep track of issues
let warnings = 0;
let errors = 0;

// Check required directories
console.log(`${colors.cyan}Checking required directories...${colors.reset}`);
[
  'public',
  'src',
  'supabase/migrations'
].forEach(dir => {
  const dirPath = path.resolve(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    console.error(`${colors.red}✘ Missing directory: ${dir}${colors.reset}`);
    errors++;
  } else {
    console.log(`${colors.green}✓ Found directory: ${dir}${colors.reset}`);
  }
});

// Check environment variables
console.log(`\n${colors.cyan}Checking environment variables...${colors.reset}`);
const envFile = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envFile)) {
  console.error(`${colors.red}✘ Missing .env file - please copy .env.example to .env and fill in your values${colors.reset}`);
  errors++;
} else {
  console.log(`${colors.green}✓ Found .env file${colors.reset}`);
  
  // Check required env vars
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  requiredEnvVars.forEach(envVar => {
    if (!envContent.includes(envVar + '=')) {
      console.error(`${colors.red}✘ Missing required environment variable: ${envVar}${colors.reset}`);
      errors++;
    } else {
      console.log(`${colors.green}✓ Found environment variable: ${envVar}${colors.reset}`);
    }
  });
}

// Check PDF.js worker file
console.log(`\n${colors.cyan}Checking PDF.js worker file...${colors.reset}`);
const pdfWorkerFile = path.resolve(__dirname, '../public/pdf.worker.min.js');
if (!fs.existsSync(pdfWorkerFile)) {
  console.warn(`${colors.yellow}⚠ Missing PDF.js worker file.${colors.reset}`);
  console.log(`${colors.blue}ℹ Running download script...${colors.reset}`);
  
  // Try to download it
  try {
    execSync('node ' + path.resolve(__dirname, 'download-pdfjslib.js'), { stdio: 'inherit' });
    console.log(`${colors.green}✓ PDF.js worker file downloaded successfully${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✘ Failed to download PDF.js worker file. Please run 'node scripts/download-pdfjslib.js' manually${colors.reset}`);
    errors++;
  }
} else {
  console.log(`${colors.green}✓ Found PDF.js worker file${colors.reset}`);
}

// Check other critical files
console.log(`\n${colors.cyan}Checking critical application files...${colors.reset}`);
[
  'src/App.tsx',
  'src/main.tsx',
  'index.html',
  'vite.config.ts'
].forEach(file => {
  const filePath = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.error(`${colors.red}✘ Missing critical file: ${file}${colors.reset}`);
    errors++;
  } else {
    console.log(`${colors.green}✓ Found critical file: ${file}${colors.reset}`);
  }
});

// Print summary
console.log(`\n${colors.blue}=== Preflight Check Summary ===${colors.reset}`);
if (errors > 0) {
  console.error(`${colors.red}✘ Found ${errors} error(s). Please fix them before proceeding.${colors.reset}`);
} else if (warnings > 0) {
  console.warn(`${colors.yellow}⚠ Found ${warnings} warning(s). You can proceed, but you might encounter issues.${colors.reset}`);
  console.log(`${colors.green}✓ No critical errors found.${colors.reset}`);
} else {
  console.log(`${colors.green}✓ All checks passed! Your application is ready to build.${colors.reset}`);
}

// Exit with appropriate code
if (errors > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
