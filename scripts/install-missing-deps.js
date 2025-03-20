import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to package.json
const packageJsonPath = path.resolve(__dirname, '../package.json');

// Missing dependencies to add
const missingDependencies = {
  "@headlessui/react": "^1.7.18",
  "@tanstack/react-query": "^5.18.1",
  "date-fns": "^3.3.1",
  "lucide-react": "^0.323.0",
  "react-helmet-async": "^2.0.4",
  "react-hook-form": "^7.50.1",
  "react-markdown": "^9.0.1",
};

console.log('Checking for missing dependencies...');

try {
  // Read current package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Current dependencies
  const currentDependencies = packageJson.dependencies || {};
  let dependenciesToInstall = [];
  
  // Check missing dependencies
  for (const [name, version] of Object.entries(missingDependencies)) {
    if (!currentDependencies[name]) {
      dependenciesToInstall.push(`${name}@${version}`);
      console.log(`- Missing dependency: ${name}`);
    }
  }
  
  // Install missing dependencies
  if (dependenciesToInstall.length > 0) {
    console.log(`Installing ${dependenciesToInstall.length} missing dependencies...`);
    
    // Use npm to install dependencies
    try {
      execSync(`npm install ${dependenciesToInstall.join(' ')}`, {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..')
      });
      
      console.log('Successfully installed missing dependencies!');
    } catch (error) {
      console.error('Error installing dependencies:', error.message);
      console.log('\nPlease manually run:');
      console.log(`npm install ${dependenciesToInstall.join(' ')}`);
    }
  } else {
    console.log('All required dependencies are already installed.');
  }
  
} catch (error) {
  console.error('Error reading or updating package.json:', error.message);
}
