// A custom dev server script to fix MIME type issues
import { createServer } from 'vite';

async function startServer() {
  const server = await createServer({
    configFile: './vite.config.ts',
    server: {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'X-Content-Type-Options': 'nosniff'
      }
    }
  });

  await server.listen();
  console.log('Dev server started with proper MIME types');
  server.printUrls();
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
