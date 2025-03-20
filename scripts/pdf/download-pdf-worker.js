/**
 * Download PDF.js worker files for offline use
 * This script is run automatically during build and can be run manually
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// The exact version to match your dependency
const PDF_JS_VERSION = '3.4.120';

// Files to download
const files = [
  {
    url: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.min.js`,
    dest: path.join(projectRoot, 'public', 'pdf.worker.min.js')
  },
  {
    url: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.min.js`,
    dest: path.join(projectRoot, 'public', 'pdf.min.js')
  }
];

// Helper function to download a file
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`✓ ${path.basename(filePath)} already exists, skipping download`);
      resolve();
      return;
    }
    
    console.log(`Downloading ${url} to ${filePath}`);
    const fileStream = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        fileStream.close();
        reject(new Error(`HTTP error ${response.statusCode}`));
        return;
      }
      
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✓ Successfully downloaded ${url}`);
        resolve();
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete the file on error
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Main function
async function main() {
  for (const file of files) {
    try {
      await downloadFile(file.url, file.dest);
    } catch (error) {
      console.error(`Failed from primary CDN: ${error.message}`);
      
      // Try backup CDN
      const backupUrl = file.url.replace('unpkg.com', 'cdn.jsdelivr.net/npm');
      console.log(`Trying backup CDN: ${backupUrl}`);
      
      try {
        await downloadFile(backupUrl, file.dest);
      } catch (backupError) {
        console.error(`Error downloading from all sources: ${backupError.message}`);
        process.exit(1);
      }
    }
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
