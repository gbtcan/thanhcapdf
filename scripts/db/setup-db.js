/**
 * Database setup script
 * Runs migrations from supabase/migrations directory
 */
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const migrationsDir = path.join(projectRoot, 'supabase', 'migrations');

// Function to run migrations
async function runMigrations() {
  console.log('Starting database setup...');

  try {
    // Make sure supabase CLI is installed
    try {
      execSync('supabase --version', { stdio: 'inherit' });
    } catch (error) {
      console.error('Supabase CLI not found. Please install it first:');
      console.error('npm install -g supabase');
      process.exit(1);
    }

    // Read migrations directory
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations run in order

    console.log(`Found ${migrationFiles.length} migration files to apply`);

    // Apply each migration
    for (const file of migrationFiles) {
      try {
        console.log(`Applying migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        
        // Run the SQL file using supabase CLI
        execSync(`supabase db push --file ${filePath}`, { 
          stdio: 'inherit', 
          cwd: projectRoot
        });
        
        console.log(`✅ Successfully applied migration: ${file}`);
      } catch (error) {
        console.error(`❌ Failed to apply migration ${file}: ${error.message}`);
      }
    }

    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

runMigrations().catch(console.error);
