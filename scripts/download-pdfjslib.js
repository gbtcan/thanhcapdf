import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { createWriteStream } from 'fs';

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define constants
const PDF_JS_VERSION = '3.11.174';
const TARGET_DIR = path.resolve(__dirname, '../public/pdf-viewer');
const WORKER_URL = `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.min.js`;
const VIEWER_URL = `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.min.js`;
const CSS_URL = `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/web/pdf_viewer.css`;
const VIEWER_COMPONENT_URL = `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/web/pdf_viewer.js`;

console.log(`Downloading PDF.js v${PDF_JS_VERSION} files...`);

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
  console.log(`Created directory: ${TARGET_DIR}`);
}

// Download helper function
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destination);
    
    console.log(`Downloading: ${url}`);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${destination}`);
        resolve();
      });
      
    }).on('error', (err) => {
      fs.unlink(destination, () => {});
      console.error(`Error downloading ${url}:`, err.message);
      reject(err);
    });
    
    file.on('error', (err) => {
      fs.unlink(destination, () => {});
      console.error(`Error writing ${destination}:`, err.message);
      reject(err);
    });
  });
}

// Download all required files
async function downloadPdfJsFiles() {
  try {
    await Promise.all([
      downloadFile(WORKER_URL, path.join(TARGET_DIR, 'pdf.worker.min.js')),
      downloadFile(VIEWER_URL, path.join(TARGET_DIR, 'pdf.min.js')),
      downloadFile(CSS_URL, path.join(TARGET_DIR, 'pdf_viewer.css')),
      downloadFile(VIEWER_COMPONENT_URL, path.join(TARGET_DIR, 'pdf_viewer.js'))
    ]);
    
    // Create index.js to export paths
    const indexContent = `// PDF.js library paths
export const PDF_WORKER_URL = '/pdf-viewer/pdf.worker.min.js';
export const PDF_CSS_URL = '/pdf-viewer/pdf_viewer.css';
export const PDF_JS_VERSION = '${PDF_JS_VERSION}';
`;
    
    fs.writeFileSync(path.join(TARGET_DIR, 'index.js'), indexContent);
    console.log(`Created: ${path.join(TARGET_DIR, 'index.js')}`);
    
    console.log('All PDF.js files downloaded successfully!');
  } catch (error) {
    console.error('Error downloading PDF.js files:', error);
    process.exit(1);
  }
}

// Run the download
downloadPdfJsFiles();
