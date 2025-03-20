import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

// PDF.js version - keep in sync with your project dependencies
const PDF_JS_VERSION = '3.4.120';

// URLs to download from
const workerUrl = `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.min.js`;
const cdnUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.min.js`;

// Local file path
const localPath = new URL('../public/pdf.worker.min.js', import.meta.url);

// Convert file URL to path
const filePath = fileURLToPath(localPath);
const dir = dirname(filePath);

console.log('Checking if PDF worker exists...');

// Create directory if it doesn't exist
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
  console.log('Created directory:', dir);
}

// If worker file doesn't exist, download it
if (!existsSync(filePath)) {
  console.log(`PDF worker doesn't exist, downloading from ${workerUrl}`);
  
  const file = createWriteStream(filePath);
  
  https.get(workerUrl, (response) => {
    if (response.statusCode !== 200) {
      console.log(`Failed to download from primary CDN (${response.statusCode}), trying backup...`);
      
      // Try backup CDN
      https.get(cdnUrl, (backupResponse) => {
        if (backupResponse.statusCode !== 200) {
          console.error(`Failed to download from backup CDN: ${backupResponse.statusCode}`);
          process.exit(1);
        }
        
        backupResponse.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log('✓ PDF worker downloaded successfully from backup CDN');
        });
      }).on('error', (err) => {
        console.error(`Error downloading from backup CDN: ${err.message}`);
        process.exit(1);
      });
      
      return;
    }
    
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log('✓ PDF worker downloaded successfully');
    });
  }).on('error', (err) => {
    console.error(`Error downloading PDF worker: ${err.message}`);
    process.exit(1);
  });
} else {
  console.log('✓ PDF worker already exists');
}
