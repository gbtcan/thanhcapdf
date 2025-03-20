const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the migrations directory
const migrationsDir = path.resolve(__dirname, '../supabase/migrations');

// ... existing code ...
